import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "billing.view")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const invoiceId = params.id;

    const invoice = (await db
      .prepare(
        `
        SELECT 
          i.*,
          c.name as customer_name,
          c.mobile as customer_mobile,
          c.whatsapp as customer_whatsapp,
          c.email as customer_email,
          c.address as customer_address,
          c.city as customer_city,
          c.pincode as customer_pincode,
          c.customer_code,
          o.order_code,
          o.order_date,
          o.frame_details,
          o.lens_details,
          o.frame_amount,
          o.lens_amount,
          o.additional_charges,
          o.payment_method,
          p.prescription_code,
          p.od_sph, p.od_cyl, p.od_axis, p.od_add, p.od_pd,
          p.os_sph, p.os_cyl, p.os_axis, p.os_add, p.os_pd,
          p.single_pd,
          u.name as creator_name
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        LEFT JOIN orders o ON i.order_id = o.id
        LEFT JOIN prescriptions p ON o.prescription_id = p.id
        LEFT JOIN users u ON i.created_by = u.id
        WHERE i.id = ? OR i.invoice_code = ?
      `
      )
      .get(invoiceId, invoiceId)) as any;

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Payment history for this invoice
    const payments = await db
      .prepare(
        `
        SELECT p.*, u.name as receiver_name
        FROM payments p
        LEFT JOIN users u ON p.received_by = u.id
        WHERE p.invoice_id = ? OR p.order_id = ?
        ORDER BY p.payment_date ASC
      `
      )
      .all(invoice.id, invoice.order_id);

    // Store settings for invoice printing
    const storeSettings = await db.prepare(`SELECT * FROM store_settings LIMIT 1`).get();

    return NextResponse.json({ success: true, invoice, payments, storeSettings });
  } catch (err: any) {
    console.error("Invoice GET [id] error:", err);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}
