import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "billing.record_payment")) {
      return NextResponse.json({ error: "Access denied: Missing payment permission" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const method = searchParams.get("method")?.trim() || "";
    const customerId = searchParams.get("customerId");

    let query = `
      SELECT 
        p.*,
        c.name as customer_name,
        c.mobile as customer_mobile,
        c.customer_code,
        o.order_code,
        i.invoice_code,
        u.name as receiver_name
      FROM payments p
      JOIN customers c ON p.customer_id = c.id
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN invoices i ON p.invoice_id = i.id
      LEFT JOIN users u ON p.received_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (customerId) {
      query += ` AND p.customer_id = ?`;
      params.push(customerId);
    }

    if (method) {
      query += ` AND p.payment_method = ?`;
      params.push(method);
    }

    if (search) {
      query += ` AND (lower(c.name) LIKE ? OR c.mobile LIKE ? OR lower(p.payment_code) LIKE ? OR lower(p.reference_number) LIKE ?)`;
      const term = `%${search.toLowerCase()}%`;
      params.push(term, `%${search}%`, term, term);
    }

    query += ` ORDER BY p.id DESC`;

    const payments = db.prepare(query).all(...params);

    const totalCollected = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM payments`).get() as { total: number };

    return NextResponse.json({ success: true, payments, totalCollected: totalCollected.total });
  } catch (err: any) {
    console.error("Payments GET error:", err);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "billing.record_payment")) {
      return NextResponse.json({ error: "Access denied: Missing payment record permission" }, { status: 403 });
    }

    const body = await req.json();
    const {
      order_id,
      invoice_id,
      customer_id,
      amount,
      payment_date,
      payment_method,
      reference_number,
      notes,
    } = body;

    const payAmount = parseFloat(amount);
    if (!payAmount || payAmount <= 0) {
      return NextResponse.json({ error: "Valid payment amount is required" }, { status: 400 });
    }

    let custId = customer_id;
    let ordId = order_id;
    let invId = invoice_id;

    // Resolve order/invoice if one is provided
    if (ordId && !invId) {
      const inv = db.prepare(`SELECT id, customer_id FROM invoices WHERE order_id = ?`).get(ordId) as any;
      if (inv) {
        invId = inv.id;
        if (!custId) custId = inv.customer_id;
      }
    } else if (invId && !ordId) {
      const inv = db.prepare(`SELECT id, order_id, customer_id FROM invoices WHERE id = ?`).get(invId) as any;
      if (inv) {
        ordId = inv.order_id;
        if (!custId) custId = inv.customer_id;
      }
    }

    if (!custId) {
      return NextResponse.json({ error: "Customer is required for payment" }, { status: 400 });
    }

    const customer = db.prepare(`SELECT name, customer_code FROM customers WHERE id = ?`).get(custId) as any;

    // Generate Payment Code: SVC-PAY-xxxx
    const maxPay = db.prepare(`SELECT MAX(id) as max_id FROM payments`).get() as { max_id: number | null };
    const nextPaySeq = (maxPay?.max_id || 0) + 1001;
    const paymentCode = `SVC-PAY-${nextPaySeq}`;

    const dateVal = payment_date || new Date().toISOString().split("T")[0];

    const recordPayTx = db.transaction(() => {
      // 1. Insert payment record
      const insertResult = db.prepare(`
        INSERT INTO payments (
          payment_code, order_id, invoice_id, customer_id, amount,
          payment_date, payment_method, reference_number, notes, received_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        paymentCode,
        ordId || null,
        invId || null,
        custId,
        payAmount,
        dateVal,
        payment_method || "Cash",
        reference_number || null,
        notes || null,
        user.id
      );

      const payId = insertResult.lastInsertRowid;

      // 2. If linked to order, update order advance_paid and remaining_balance
      if (ordId) {
        const order = db.prepare(`SELECT grand_total, advance_paid, remaining_balance FROM orders WHERE id = ?`).get(ordId) as any;
        if (order) {
          const newPaid = Number((order.advance_paid + payAmount).toFixed(2));
          const newBalance = Math.max(0, Number((order.grand_total - newPaid).toFixed(2)));
          db.prepare(`UPDATE orders SET advance_paid = ?, remaining_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newPaid, newBalance, ordId);
        }
      }

      // 3. If linked to invoice, update invoice paid_amount and status
      if (invId) {
        const inv = db.prepare(`SELECT grand_total, paid_amount, remaining_balance FROM invoices WHERE id = ?`).get(invId) as any;
        if (inv) {
          const newPaid = Number((inv.paid_amount + payAmount).toFixed(2));
          const newBalance = Math.max(0, Number((inv.grand_total - newPaid).toFixed(2)));
          const newStatus = newBalance <= 0 ? "Paid" : "Partial";
          db.prepare(`UPDATE invoices SET paid_amount = ?, remaining_balance = ?, status = ? WHERE id = ?`).run(newPaid, newBalance, newStatus, invId);
        }
      }

      return payId;
    });

    const paymentId = recordPayTx();

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "Payment Received",
      entityType: "payment",
      entityId: paymentCode,
      details: `Received ₹ ${payAmount} via ${payment_method || "Cash"} from ${customer.name}`,
    });

    const newPayment = db.prepare(`SELECT * FROM payments WHERE id = ?`).get(paymentId);

    return NextResponse.json({ success: true, payment: newPayment }, { status: 201 });
  } catch (err: any) {
    console.error("Payment POST error:", err);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}

