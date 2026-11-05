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
    if (!user || !hasPermission(user, "orders.view")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const orderId = params.id;

    const order = (await db
      .prepare(
        `
        SELECT 
          o.*,
          c.name as customer_name,
          c.mobile as customer_mobile,
          c.whatsapp as customer_whatsapp,
          c.email as customer_email,
          c.address as customer_address,
          c.city as customer_city,
          c.customer_code,
          p.prescription_code,
          p.od_sph, p.od_cyl, p.od_axis, p.od_add, p.od_pd,
          p.os_sph, p.os_cyl, p.os_axis, p.os_add, p.os_pd,
          p.single_pd, p.prescription_type, p.doctor_name,
          u.name as creator_name,
          i.id as invoice_id,
          i.invoice_code
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        LEFT JOIN prescriptions p ON o.prescription_id = p.id
        LEFT JOIN users u ON o.created_by = u.id
        LEFT JOIN invoices i ON i.order_id = o.id
        WHERE o.id = ? OR o.order_code = ?
      `
      )
      .get(orderId, orderId)) as any;

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Payments for this order
    const payments = await db
      .prepare(
        `
        SELECT p.*, u.name as receiver_name
        FROM payments p
        LEFT JOIN users u ON p.received_by = u.id
        WHERE p.order_id = ?
        ORDER BY p.payment_date DESC, p.id DESC
      `
      )
      .all(order.id);

    return NextResponse.json({ success: true, order, payments });
  } catch (err: any) {
    console.error("Order GET [id] error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "orders.edit")) {
      return NextResponse.json({ error: "Access denied: Missing order edit permission" }, { status: 403 });
    }

    const orderId = parseInt(params.id);
    const existing = (await db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId)) as any;

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await req.json();
    const { expected_delivery_date, order_notes, frame_details, lens_details } = body;

    await db.prepare(`
      UPDATE orders SET
        expected_delivery_date = COALESCE(?, expected_delivery_date),
        order_notes = COALESCE(?, order_notes),
        frame_details = COALESCE(?, frame_details),
        lens_details = COALESCE(?, lens_details),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(expected_delivery_date, order_notes, frame_details, lens_details, orderId);

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "Order Updated",
      entityType: "order",
      entityId: existing.order_code,
      details: `Updated order details for ${existing.order_code}`,
    });

    const updated = await db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId);
    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Order PUT error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
