import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "prescriptions.view")) {
      return NextResponse.json({ error: "Access denied: Missing prescription view permission" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const search = searchParams.get("search")?.trim() || "";
    const type = searchParams.get("type")?.trim() || "";

    let query = `
      SELECT 
        p.*,
        c.name as customer_name,
        c.mobile as customer_mobile,
        c.customer_code,
        u.name as optometrist_name
      FROM prescriptions p
      JOIN customers c ON p.customer_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (customerId) {
      query += ` AND p.customer_id = ?`;
      params.push(customerId);
    }

    if (search) {
      query += ` AND (lower(c.name) LIKE ? OR c.mobile LIKE ? OR lower(p.prescription_code) LIKE ? OR lower(p.doctor_name) LIKE ?)`;
      const term = `%${search.toLowerCase()}%`;
      params.push(term, `%${search}%`, term, term);
    }

    if (type) {
      query += ` AND p.prescription_type = ?`;
      params.push(type);
    }

    query += ` ORDER BY p.prescription_date DESC, p.id DESC`;

    const prescriptions = await db.prepare(query).all(...params);

    return NextResponse.json({ success: true, prescriptions });
  } catch (err: any) {
    console.error("Prescriptions GET error:", err);
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "prescriptions.add")) {
      return NextResponse.json({ error: "Access denied: Missing prescription add permission" }, { status: 403 });
    }

    const body = await req.json();
    const {
      customer_id,
      prescription_date,
      next_checkup_date,
      doctor_name,
      prescription_type,
      od_sph,
      od_cyl,
      od_axis,
      od_add,
      od_pd,
      os_sph,
      os_cyl,
      os_axis,
      os_add,
      os_pd,
      pd_type,
      single_pd,
      notes,
      image_url,
    } = body;

    if (!customer_id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    const customer = (await db.prepare(`SELECT id, name, mobile, customer_code FROM customers WHERE id = ?`).get(customer_id)) as any;
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Auto-generate Prescription Code: SVC-RX-xxxx
    const maxRow = ((await db.prepare(`SELECT MAX(id) as max_id FROM prescriptions`).get()) as unknown) as { max_id: number | null };
    const nextSeq = (maxRow?.max_id || 0) + 1001;
    const prescriptionCode = `SVC-RX-${nextSeq}`;

    const dateVal = prescription_date || new Date().toISOString().split("T")[0];

    const insertResult = await db.prepare(`
      INSERT INTO prescriptions (
        prescription_code, customer_id, prescription_date, next_checkup_date,
        doctor_name, prescription_type,
        od_sph, od_cyl, od_axis, od_add, od_pd,
        os_sph, os_cyl, os_axis, os_add, os_pd,
        pd_type, single_pd, notes, image_url, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      prescriptionCode,
      customer.id,
      dateVal,
      next_checkup_date || null,
      doctor_name ? doctor_name.trim() : (user.name || "In-House Optometrist"),
      prescription_type || "Distance Vision",
      od_sph || "0.00",
      od_cyl || "0.00",
      od_axis || "0",
      od_add || "0.00",
      od_pd || "31.5",
      os_sph || "0.00",
      os_cyl || "0.00",
      os_axis || "0",
      os_add || "0.00",
      os_pd || "31.5",
      pd_type || "Dual",
      single_pd || "63.0",
      notes || null,
      image_url || null,
      user.id
    );

    const newId = insertResult.lastInsertRowid;

    // Create automatic next checkup reminder if next_checkup_date is provided
    if (next_checkup_date) {
      await db.prepare(`
        INSERT INTO followups (
          customer_id, type, scheduled_date, status, priority, notes, created_by
        ) VALUES (?, 'Eye Checkup', ?, 'Pending', 'Medium', ?, ?)
      `).run(
        customer.id,
        next_checkup_date,
        `Routine eye vision test & power review for ${customer.name}`,
        user.id
      );
    }

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "Prescription Created",
      entityType: "prescription",
      entityId: prescriptionCode,
      details: `Created new eye prescription for ${customer.name} (OD: ${od_sph}/${od_cyl}, OS: ${os_sph}/${os_cyl})`,
    });

    const newPrescription = await db.prepare(`SELECT * FROM prescriptions WHERE id = ?`).get(newId);

    return NextResponse.json({ success: true, prescription: newPrescription }, { status: 201 });
  } catch (err: any) {
    console.error("Prescription POST error:", err);
    return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 });
  }
}
