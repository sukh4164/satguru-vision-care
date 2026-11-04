import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user, "orders.update_status")) {
      return NextResponse.json({ error: "Access denied: Missing update status permission" }, { status: 403 });
    }

    const orderId = parseInt(params.id);
    const { status, note } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const order = db.prepare(`SELECT o.*, c.name as customer_name FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`).get(orderId) as any;
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    db.prepare(`UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status, orderId);

    // If delivered and there is remaining balance, create a pending payment reminder
    if (status === "Delivered" && order.remaining_balance > 0) {
      db.prepare(`
        INSERT INTO followups (
          customer_id, order_id, type, scheduled_date, status, priority, notes, created_by
        ) VALUES (?, ?, 'Pending Payment', ?, 'Pending', 'High', ?, ?)
      `).run(
        order.customer_id,
        order.id,
        new Date().toISOString().split("T")[0],
        `Collect pending balance of ₹ ${order.remaining_balance} from ${order.customer_name} for delivered order ${order.order_code}`,
        user.id
      );
    }

    logActivity({
      userId: user.id,
      userName: user.name,
      action: "Order Status Updated",
      entityType: "order",
      entityId: order.order_code,
      details: `Status changed from "${order.status}" to "${status}". Note: ${note || "None"}`,
    });

    const updated = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(orderId);
    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Order status update error:", err);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}

