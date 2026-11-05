import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "prescriptions.view")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const prescriptionId = params.id;

    const prescription = (await db
      .prepare(
        `
        SELECT 
          p.*,
          c.name as customer_name,
          c.mobile as customer_mobile,
          c.email as customer_email,
          c.address as customer_address,
          c.city as customer_city,
          c.customer_code,
          c.dob as customer_dob,
          c.age as customer_age,
          c.gender as customer_gender,
          u.name as creator_name
        FROM prescriptions p
        JOIN customers c ON p.customer_id = c.id
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.id = ? OR p.prescription_code = ?
      `
      )
      .get(prescriptionId, prescriptionId)) as any;

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Find the immediately preceding (previous) prescription for this customer
    const previousPrescription = (await db
      .prepare(
        `
        SELECT * FROM prescriptions
        WHERE customer_id = ? AND (prescription_date < ? OR (prescription_date = ? AND id < ?))
        ORDER BY prescription_date DESC, id DESC
        LIMIT 1
      `
      )
      .get(prescription.customer_id, prescription.prescription_date, prescription.prescription_date, prescription.id)) as any;

    // Fetch store settings for prescription print
    const storeSettings = await db.prepare(`SELECT * FROM store_settings LIMIT 1`).get();

    return NextResponse.json({
      success: true,
      prescription,
      previousPrescription: previousPrescription || null,
      storeSettings,
    });
  } catch (err: any) {
    console.error("Prescription GET [id] error:", err);
    return NextResponse.json({ error: "Failed to fetch prescription" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "prescriptions.edit")) {
      return NextResponse.json({ error: "Access denied: Missing prescription edit permission" }, { status: 403 });
    }

    const prescriptionId = parseInt(params.id);
    const existing = (await db.prepare(`SELECT * FROM prescriptions WHERE id = ?`).get(prescriptionId)) as any;

    if (!existing) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      doctor_name,
      prescription_type,
      prescription_date,
      next_checkup_date,
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
    } = body;

    await db.prepare(`
      UPDATE prescriptions SET
        doctor_name = COALESCE(?, doctor_name),
        prescription_type = COALESCE(?, prescription_type),
        prescription_date = COALESCE(?, prescription_date),
        next_checkup_date = COALESCE(?, next_checkup_date),
        od_sph = COALESCE(?, od_sph),
        od_cyl = COALESCE(?, od_cyl),
        od_axis = COALESCE(?, od_axis),
        od_add = COALESCE(?, od_add),
        od_pd = COALESCE(?, od_pd),
        os_sph = COALESCE(?, os_sph),
        os_cyl = COALESCE(?, os_cyl),
        os_axis = COALESCE(?, os_axis),
        os_add = COALESCE(?, os_add),
        os_pd = COALESCE(?, os_pd),
        pd_type = COALESCE(?, pd_type),
        single_pd = COALESCE(?, single_pd),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      doctor_name,
      prescription_type,
      prescription_date,
      next_checkup_date,
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
      prescriptionId
    );

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "Prescription Updated",
      entityType: "prescription",
      entityId: existing.prescription_code,
      details: `Modified prescription ${existing.prescription_code} values`,
    });

    const updated = await db.prepare(`SELECT * FROM prescriptions WHERE id = ?`).get(prescriptionId);
    return NextResponse.json({ success: true, prescription: updated });
  } catch (err: any) {
    console.error("Prescription PUT error:", err);
    return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "prescriptions.delete")) {
      return NextResponse.json({ error: "Access denied: Missing prescription delete permission" }, { status: 403 });
    }

    const prescriptionId = parseInt(params.id);
    const existing = (await db.prepare(`SELECT * FROM prescriptions WHERE id = ?`).get(prescriptionId)) as any;

    if (!existing) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Check if any order is linked to this prescription
    const linkedOrder = (await db.prepare(`SELECT order_code FROM orders WHERE prescription_id = ? LIMIT 1`).get(prescriptionId)) as any;
    if (linkedOrder) {
      return NextResponse.json(
        { error: `Cannot delete: This prescription is linked to order ${linkedOrder.order_code}` },
        { status: 400 }
      );
    }

    await db.prepare(`DELETE FROM prescriptions WHERE id = ?`).run(prescriptionId);

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "Prescription Deleted",
      entityType: "prescription",
      entityId: existing.prescription_code,
      details: `Deleted prescription ${existing.prescription_code}`,
    });

    return NextResponse.json({ success: true, message: "Prescription deleted successfully" });
  } catch (err: any) {
    console.error("Prescription DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete prescription" }, { status: 500 });
  }
}
