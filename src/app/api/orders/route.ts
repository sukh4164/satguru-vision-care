import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "orders.view")) {
      return NextResponse.json({ error: "Access denied: Missing order view permission" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const customerId = searchParams.get("customerId");
    const limit = parseInt(searchParams.get("limit") || "100");

    let query = `
      SELECT 
        o.*,
        c.name as customer_name,
        c.mobile as customer_mobile,
        c.customer_code,
        p.prescription_code,
        p.od_sph, p.od_cyl, p.od_axis, p.od_add,
        p.os_sph, p.os_cyl, p.os_axis, p.os_add,
        u.name as staff_name,
        i.invoice_code
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN prescriptions p ON o.prescription_id = p.id
      LEFT JOIN users u ON o.created_by = u.id
      LEFT JOIN invoices i ON i.order_id = o.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (customerId) {
      query += ` AND o.customer_id = ?`;
      params.push(customerId);
    }

    if (status) {
      query += ` AND o.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (lower(c.name) LIKE ? OR c.mobile LIKE ? OR lower(o.order_code) LIKE ? OR lower(o.frame_details) LIKE ?)`;
      const term = `%${search.toLowerCase()}%`;
      params.push(term, `%${search}%`, term, term);
    }

    query += ` ORDER BY o.id DESC LIMIT ?`;
    params.push(limit);

    const orders = await db.prepare(query).all(...params);

    // Order status summary counts
    const statusCounts = await db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `).all();

    return NextResponse.json({ success: true, orders, statusCounts });
  } catch (err: any) {
    console.error("Orders GET error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "orders.create")) {
      return NextResponse.json({ error: "Access denied: Missing order create permission" }, { status: 403 });
    }

    const body = await req.json();
    const {
      customer_id,
      prescription_id,
      expected_delivery_date,
      frame_details,
      lens_details,
      frame_amount,
      lens_amount,
      additional_charges,
      discount_amount,
      gst_rate,
      advance_paid,
      payment_method,
      order_notes,
      frame_product_id,
    } = body;

    if (!customer_id) {
      return NextResponse.json({ error: "Customer is required" }, { status: 400 });
    }

    const customer = (await db.prepare(`SELECT * FROM customers WHERE id = ?`).get(customer_id)) as any;
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const fAmt = parseFloat(frame_amount || "0");
    const lAmt = parseFloat(lens_amount || "0");
    const addChg = parseFloat(additional_charges || "0");
    const disc = parseFloat(discount_amount || "0");
    const gstPct = parseFloat(gst_rate !== undefined ? gst_rate : "12");

    const subtotal = fAmt + lAmt;
    const taxable = Math.max(0, subtotal - disc);
    const gstAmount = Number(((taxable * gstPct) / 100).toFixed(2));
    const grandTotal = Number((taxable + gstAmount + addChg).toFixed(2));

    const advance = parseFloat(advance_paid || "0");
    const remainingBalance = Math.max(0, Number((grandTotal - advance).toFixed(2)));

    // Generate Order Code: SVC-ORD-xxxx
    const maxOrder = ((await db.prepare(`SELECT MAX(id) as max_id FROM orders`).get()) as unknown) as { max_id: number | null };
    const nextOrderSeq = (maxOrder?.max_id || 0) + 1001;
    const orderCode = `SVC-ORD-${nextOrderSeq}`;

    // Generate Invoice Code: SVC-INV-xxxx
    const maxInv = ((await db.prepare(`SELECT MAX(id) as max_id FROM invoices`).get()) as unknown) as { max_id: number | null };
    const nextInvSeq = (maxInv?.max_id || 0) + 1001;
    const invoiceCode = `SVC-INV-${nextInvSeq}`;

    const today = new Date().toISOString().split("T")[0];

    // 1. Insert Order
    const orderInsert = await db.prepare(`
      INSERT INTO orders (
        order_code, customer_id, prescription_id, order_date, expected_delivery_date,
        status, frame_details, lens_details, frame_amount, lens_amount,
        additional_charges, discount_amount, gst_rate, gst_amount, subtotal,
        grand_total, advance_paid, remaining_balance, payment_method, order_notes, created_by
      ) VALUES (?, ?, ?, ?, ?, 'New', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderCode,
      customer.id,
      prescription_id || null,
      today,
      expected_delivery_date || null,
      frame_details || "Standard Frame",
      lens_details || "Standard Optical Lenses",
      fAmt,
      lAmt,
      addChg,
      disc,
      gstPct,
      gstAmount,
      subtotal,
      grandTotal,
      advance,
      remainingBalance,
      payment_method || "Cash",
      order_notes || null,
      user.id
    );

    const orderId = orderInsert.lastInsertRowid;

    // 2. Generate Invoice
    const invStatus = remainingBalance <= 0 ? "Paid" : advance > 0 ? "Partial" : "Pending";
    const invInsert = await db.prepare(`
      INSERT INTO invoices (
        invoice_code, order_id, customer_id, invoice_date, subtotal, discount,
        gst_rate, gst_amount, grand_total, paid_amount, remaining_balance, status, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      invoiceCode,
      orderId,
      customer.id,
      today,
      subtotal,
      disc,
      gstPct,
      gstAmount,
      grandTotal,
      advance,
      remainingBalance,
      invStatus,
      order_notes || null,
      user.id
    );

    const invoiceId = invInsert.lastInsertRowid;

    // 3. If advance > 0, record payment receipt
    if (advance > 0) {
      const maxPay = ((await db.prepare(`SELECT MAX(id) as max_id FROM payments`).get()) as unknown) as { max_id: number | null };
      const nextPaySeq = (maxPay?.max_id || 0) + 1001;
      const paymentCode = `SVC-PAY-${nextPaySeq}`;

      await db.prepare(`
        INSERT INTO payments (
          payment_code, order_id, invoice_id, customer_id, amount, payment_date,
          payment_method, reference_number, notes, received_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        paymentCode,
        orderId,
        invoiceId,
        customer.id,
        advance,
        today,
        payment_method || "Cash",
        `ADV-${orderCode}`,
        `Advance payment received for order ${orderCode}`,
        user.id
      );
    }

    // 4. If frame was selected from existing inventory product, decrement stock by 1
    if (frame_product_id) {
      const prd = (await db.prepare(`SELECT stock_quantity FROM products WHERE id = ?`).get(frame_product_id)) as any;
      if (prd && prd.stock_quantity > 0) {
        const newBal = prd.stock_quantity - 1;
        await db.prepare(`UPDATE products SET stock_quantity = ? WHERE id = ?`).run(newBal, frame_product_id);
        await db.prepare(`
          INSERT INTO inventory_transactions (
            product_id, transaction_type, quantity, balance_after, reference_id, notes, created_by
          ) VALUES (?, 'OUT', 1, ?, ?, 'Deducted for customer order', ?)
        `).run(frame_product_id, newBal, orderCode, user.id);
      }
    }

    // 5. Create delivery reminder follow-up if delivery date specified
    if (expected_delivery_date) {
      await db.prepare(`
        INSERT INTO followups (
          customer_id, order_id, type, scheduled_date, status, priority, notes, created_by
        ) VALUES (?, ?, 'Delivery Ready', ?, 'Pending', 'High', ?, ?)
      `).run(
        customer.id,
        orderId,
        expected_delivery_date,
        `Inspect and prepare delivery for order ${orderCode} (${customer.name})`,
        user.id
      );
    }

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: "Order Created",
      entityType: "order",
      entityId: orderCode,
      details: `Created order for ${customer.name} (Total: ₹ ${grandTotal}, Adv: ₹ ${advance})`,
    });

    const createdOrder = await db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId);

    return NextResponse.json({ success: true, order: createdOrder, invoiceCode }, { status: 201 });
  } catch (err: any) {
    console.error("Order POST error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
