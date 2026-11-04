import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";
import { calculateAge } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "customers.view")) {
      return NextResponse.json({ error: "Access denied: Missing customer view permission" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const gender = searchParams.get("gender")?.trim() || "";
    const limit = parseInt(searchParams.get("limit") || "100");

    let query = `
      SELECT 
        c.*,
        u.name as creator_name,
        (SELECT COUNT(*) FROM prescriptions p WHERE p.customer_id = c.id) as prescription_count,
        (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) as order_count,
        COALESCE((SELECT SUM(o.grand_total) FROM orders o WHERE o.customer_id = c.id), 0) as total_purchases,
        COALESCE((SELECT SUM(o.remaining_balance) FROM orders o WHERE o.customer_id = c.id), 0) as total_balance,
        (SELECT p.prescription_date FROM prescriptions p WHERE p.customer_id = c.id ORDER BY p.prescription_date DESC LIMIT 1) as latest_rx_date
      FROM customers c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (lower(c.name) LIKE ? OR c.mobile LIKE ? OR lower(c.customer_code) LIKE ? OR lower(c.city) LIKE ?)`;
      const term = `%${search.toLowerCase()}%`;
      params.push(term, `%${search}%`, term, term);
    }

    if (city) {
      query += ` AND lower(c.city) = ?`;
      params.push(city.toLowerCase());
    }

    if (gender) {
      query += ` AND c.gender = ?`;
      params.push(gender);
    }

    query += ` ORDER BY c.id DESC LIMIT ?`;
    params.push(limit);

    const customers = db.prepare(query).all(...params);

    return NextResponse.json({ success: true, customers });
  } catch (err: any) {
    console.error("Customers GET error:", err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "customers.add")) {
      return NextResponse.json({ error: "Access denied: Missing customer add permission" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      mobile,
      whatsapp,
      email,
      dob,
      gender,
      address,
      city,
      pincode,
      registration_date,
      notes,
      checkDuplicateOnly,
      force,
    } = body;

    if (!name || !mobile) {
      return NextResponse.json({ error: "Customer name and mobile number are required" }, { status: 400 });
    }

    const cleanMobile = mobile.replace(/[^0-9]/g, "");

    // Duplicate check on mobile number
    const existing = db
      .prepare(
        `SELECT id, customer_code, name, mobile, registration_date FROM customers WHERE mobile = ? OR mobile LIKE ?`
      )
      .get(cleanMobile, `%${cleanMobile.slice(-10)}%`) as any;

    if (existing && checkDuplicateOnly) {
      return NextResponse.json({
        exists: true,
        customer: existing,
        message: `Customer already exists with this mobile number: ${existing.name} (${existing.customer_code})`,
      });
    }

    if (existing && !force) {
      return NextResponse.json(
        {
          duplicateWarning: true,
          existingCustomer: existing,
          message: `A customer with mobile number ${mobile} already exists: "${existing.name}" (${existing.customer_code}). Do you want to proceed and create another record?`,
        },
        { status: 409 }
      );
    }

    // Auto-generate Customer Code: SVC-CUST-xxxx
    const maxRow = db
      .prepare(`SELECT MAX(id) as max_id FROM customers`)
      .get() as { max_id: number | null };
    const nextSeq = (maxRow?.max_id || 0) + 1001;
    const customerCode = `SVC-CUST-${nextSeq}`;

    const calculatedAge = dob ? calculateAge(dob) : body.age || null;
    const regDate = registration_date || new Date().toISOString().split("T")[0];

    const insertResult = db
      .prepare(
        `
        INSERT INTO customers (
          customer_code, name, mobile, whatsapp, email, dob, age,
          gender, address, city, pincode, registration_date, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      )
      .run(
        customerCode,
        name.trim(),
        cleanMobile,
        whatsapp ? whatsapp.replace(/[^0-9]/g, "") : cleanMobile,
        email ? email.trim() : null,
        dob || null,
        calculatedAge,
        gender || "Male",
        address ? address.trim() : null,
        city ? city.trim() : "Mumbai",
        pincode ? pincode.trim() : null,
        regDate,
        notes || null,
        user.id
      );

    const newId = insertResult.lastInsertRowid;

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "Customer Added",
      entityType: "customer",
      entityId: customerCode,
      details: `Registered customer ${name} (${cleanMobile})`,
    });

    const newCustomer = db.prepare(`SELECT * FROM customers WHERE id = ?`).get(newId);

    return NextResponse.json({ success: true, customer: newCustomer }, { status: 201 });
  } catch (err: any) {
    console.error("Customer POST error:", err);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}

