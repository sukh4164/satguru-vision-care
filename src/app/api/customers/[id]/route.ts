import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";
import { calculateAge } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "customers.view")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const customerId = params.id;

    // Fetch customer profile
    const customer = (await db
      .prepare(
        `
        SELECT c.*, u.name as created_by_name
        FROM customers c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.id = ? OR c.customer_code = ?
      `
      )
      .get(customerId, customerId)) as any;

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Fetch all prescriptions in descending order (latest first)
    const prescriptions = await db
      .prepare(
        `
        SELECT p.*, u.name as creator_name
        FROM prescriptions p
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.customer_id = ?
        ORDER BY p.prescription_date DESC, p.id DESC
      `
      )
      .all(customer.id);

    // Fetch all orders
    const orders = await db
      .prepare(
        `
        SELECT o.*, u.name as creator_name, p.prescription_code
        FROM orders o
        LEFT JOIN users u ON o.created_by = u.id
        LEFT JOIN prescriptions p ON o.prescription_id = p.id
        WHERE o.customer_id = ?
        ORDER BY o.order_date DESC, o.id DESC
      `
      )
      .all(customer.id);

    // Fetch all invoices
    const invoices = await db
      .prepare(
        `
        SELECT i.*, o.order_code
        FROM invoices i
        LEFT JOIN orders o ON i.order_id = o.id
        WHERE i.customer_id = ?
        ORDER BY i.invoice_date DESC, i.id DESC
      `
      )
      .all(customer.id);

    // Fetch all payments
    const payments = await db
      .prepare(
        `
        SELECT p.*, u.name as receiver_name, o.order_code, i.invoice_code
        FROM payments p
        LEFT JOIN users u ON p.received_by = u.id
        LEFT JOIN orders o ON p.order_id = o.id
        LEFT JOIN invoices i ON p.invoice_id = i.id
        WHERE p.customer_id = ?
        ORDER BY p.payment_date DESC, p.id DESC
      `
      )
      .all(customer.id);

    // Fetch follow-ups
    const followups = await db
      .prepare(
        `
        SELECT f.*, u.name as creator_name
        FROM followups f
        LEFT JOIN users u ON f.created_by = u.id
        WHERE f.customer_id = ?
        ORDER BY f.scheduled_date ASC
      `
      )
      .all(customer.id);

    // Aggregates
    const stats = await db
      .prepare(
        `
        SELECT 
          COUNT(DISTINCT o.id) as total_orders,
          COUNT(DISTINCT p.id) as total_prescriptions,
          COALESCE(SUM(o.grand_total), 0) as total_spent,
          COALESCE(SUM(o.advance_paid), 0) as total_paid,
          COALESCE(SUM(o.remaining_balance), 0) as pending_balance
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id
        LEFT JOIN prescriptions p ON p.customer_id = c.id
        WHERE c.id = ?
      `
      )
      .get(customer.id);

    return NextResponse.json({
      success: true,
      customer,
      prescriptions,
      orders,
      invoices,
      payments,
      followups,
      stats,
    });
  } catch (err: any) {
    console.error("Customer detail GET error:", err);
    return NextResponse.json({ error: "Failed to fetch customer profile" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "customers.edit")) {
      return NextResponse.json({ error: "Access denied: Missing customer edit permission" }, { status: 403 });
    }

    const customerId = parseInt(params.id);
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
      notes,
    } = body;

    const cleanMobile = mobile ? mobile.replace(/[^0-9]/g, "") : null;
    const calculatedAge = dob ? calculateAge(dob) : body.age || null;

    await db.prepare(
      `
      UPDATE customers SET
        name = COALESCE(?, name),
        mobile = COALESCE(?, mobile),
        whatsapp = COALESCE(?, whatsapp),
        email = COALESCE(?, email),
        dob = COALESCE(?, dob),
        age = COALESCE(?, age),
        gender = COALESCE(?, gender),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        pincode = COALESCE(?, pincode),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    ).run(
      name?.trim(),
      cleanMobile,
      whatsapp ? whatsapp.replace(/[^0-9]/g, "") : cleanMobile,
      email?.trim(),
      dob,
      calculatedAge,
      gender,
      address?.trim(),
      city?.trim(),
      pincode?.trim(),
      notes,
      customerId
    );

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "Customer Updated",
      entityType: "customer",
      entityId: customerId,
      details: `Updated details for customer ${name || customerId}`,
    });

    const updated = await db.prepare(`SELECT * FROM customers WHERE id = ?`).get(customerId);
    return NextResponse.json({ success: true, customer: updated });
  } catch (err: any) {
    console.error("Customer PUT error:", err);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "customers.delete")) {
      return NextResponse.json({ error: "Access denied: Missing customer delete permission" }, { status: 403 });
    }

    const customerId = parseInt(params.id);
    const customer = (await db.prepare(`SELECT * FROM customers WHERE id = ?`).get(customerId)) as any;

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check if customer has active orders
    const orderCount = ((await db
      .prepare(`SELECT COUNT(*) as count FROM orders WHERE customer_id = ? AND status NOT IN ('Delivered', 'Cancelled')`)
      .get(customerId)) as unknown) as { count: number };

    if (orderCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete customer: There are ${orderCount.count} active pending orders.` },
        { status: 400 }
      );
    }

    await db.prepare(`DELETE FROM customers WHERE id = ?`).run(customerId);

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "Customer Deleted",
      entityType: "customer",
      entityId: customer.customer_code,
      details: `Deleted customer ${customer.name} (${customer.customer_code})`,
    });

    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (err: any) {
    console.error("Customer DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
