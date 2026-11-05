import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "billing.view")) {
      return NextResponse.json({ error: "Access denied: Missing billing view permission" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const customerId = searchParams.get("customerId");

    let query = `
      SELECT 
        i.*,
        c.name as customer_name,
        c.mobile as customer_mobile,
        c.customer_code,
        o.order_code,
        o.status as order_status,
        o.frame_details,
        o.lens_details,
        u.name as creator_name
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      LEFT JOIN orders o ON i.order_id = o.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (customerId) {
      query += ` AND i.customer_id = ?`;
      params.push(customerId);
    }

    if (status) {
      query += ` AND i.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (lower(c.name) LIKE ? OR c.mobile LIKE ? OR lower(i.invoice_code) LIKE ? OR lower(o.order_code) LIKE ?)`;
      const term = `%${search.toLowerCase()}%`;
      params.push(term, `%${search}%`, term, term);
    }

    query += ` ORDER BY i.id DESC`;

    const invoices = await db.prepare(query).all(...params);

    // Summary totals
    const summary = await db.prepare(`
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(grand_total), 0) as total_billed,
        COALESCE(SUM(paid_amount), 0) as total_received,
        COALESCE(SUM(remaining_balance), 0) as total_outstanding
      FROM invoices
    `).get();

    return NextResponse.json({ success: true, invoices, summary });
  } catch (err: any) {
    console.error("Invoices GET error:", err);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
