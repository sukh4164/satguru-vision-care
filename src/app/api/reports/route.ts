import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (!hasPermission(user, "reports.daily") && !hasPermission(user, "admin.revenue"))) {
      return NextResponse.json({ error: "Access denied: Missing reports permission" }, { status: 403 });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const thisMonthPrefix = todayStr.slice(0, 7); // 'YYYY-MM'
    const thisYearPrefix = todayStr.slice(0, 4); // 'YYYY'

    // Total counts
    const totalCustomers = db.prepare(`SELECT COUNT(*) as count FROM customers`).get() as { count: number };
    const todayCustomers = db.prepare(`SELECT COUNT(*) as count FROM customers WHERE registration_date = ?`).get(todayStr) as { count: number };

    const totalOrders = db.prepare(`SELECT COUNT(*) as count FROM orders`).get() as { count: number };
    const pendingOrders = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE status IN ('New', 'Processing', 'Ordered from Supplier')`).get() as { count: number };
    const readyOrders = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'Ready for Delivery'`).get() as { count: number };
    const completedOrders = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'Delivered'`).get() as { count: number };

    const totalProducts = db.prepare(`SELECT COUNT(*) as count FROM products WHERE status = 'active'`).get() as { count: number };
    const lowStockProducts = db.prepare(`SELECT COUNT(*) as count FROM products WHERE status = 'active' AND stock_quantity <= min_stock_alert`).get() as { count: number };

    // Financial stats (Admin sees all; Staff only if granted admin.revenue)
    const canSeeRevenue = user.role === "admin" || hasPermission(user, "admin.revenue");

    let todaySales = 0;
    let monthlySales = 0;
    let yearlySales = 0;
    let totalRevenue = 0;
    let totalOutstanding = 0;

    if (canSeeRevenue) {
      const todaySalesRow = db.prepare(`SELECT COALESCE(SUM(grand_total), 0) as s FROM orders WHERE order_date = ? AND status != 'Cancelled'`).get(todayStr) as { s: number };
      todaySales = todaySalesRow.s;

      const monthSalesRow = db.prepare(`SELECT COALESCE(SUM(grand_total), 0) as s FROM orders WHERE order_date LIKE ? AND status != 'Cancelled'`).get(`${thisMonthPrefix}%`) as { s: number };
      monthlySales = monthSalesRow.s;

      const yearSalesRow = db.prepare(`SELECT COALESCE(SUM(grand_total), 0) as s FROM orders WHERE order_date LIKE ? AND status != 'Cancelled'`).get(`${thisYearPrefix}%`) as { s: number };
      yearlySales = yearSalesRow.s;

      const totalRevRow = db.prepare(`SELECT COALESCE(SUM(grand_total), 0) as s FROM orders WHERE status != 'Cancelled'`).get() as { s: number };
      totalRevenue = totalRevRow.s;

      const outRow = db.prepare(`SELECT COALESCE(SUM(remaining_balance), 0) as b FROM orders WHERE status != 'Cancelled'`).get() as { b: number };
      totalOutstanding = outRow.b;
    }

    // Sales Progression Trend (Last 7 days or monthly)
    const salesTrend = db.prepare(`
      SELECT 
        order_date,
        COUNT(id) as orders_count,
        COALESCE(SUM(grand_total), 0) as total_amount
      FROM orders
      WHERE status != 'Cancelled'
      GROUP BY order_date
      ORDER BY order_date DESC
      LIMIT 14
    `).all().reverse();

    // Monthly revenue composition (by product category)
    const categoryBreakdown = db.prepare(`
      SELECT 
        category_name,
        COUNT(id) as product_count,
        COALESCE(SUM(stock_quantity), 0) as in_stock
      FROM products
      WHERE status = 'active'
      GROUP BY category_name
      ORDER BY in_stock DESC
    `).all();

    // Order status breakdown
    const orderStatuses = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `).all();

    // Top outstanding debtors
    const topDebtors = db.prepare(`
      SELECT 
        c.id, c.customer_code, c.name, c.mobile,
        COALESCE(SUM(o.remaining_balance), 0) as balance,
        COUNT(o.id) as orders_count
      FROM customers c
      JOIN orders o ON o.customer_id = c.id
      WHERE o.remaining_balance > 0 AND o.status != 'Cancelled'
      GROUP BY c.id
      ORDER BY balance DESC
      LIMIT 10
    `).all();

    // Staff Performance
    const staffPerformance = db.prepare(`
      SELECT 
        u.id, u.name, u.employee_id, r.name as role_name,
        (SELECT COUNT(*) FROM customers c WHERE c.created_by = u.id) as customers_added,
        (SELECT COUNT(*) FROM orders o WHERE o.created_by = u.id) as orders_created,
        (SELECT COUNT(*) FROM prescriptions p WHERE p.created_by = u.id) as prescriptions_done,
        COALESCE((SELECT SUM(o.grand_total) FROM orders o WHERE o.created_by = u.id), 0) as sales_volume
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.status = 'active'
    `).all();

    return NextResponse.json({
      success: true,
      canSeeRevenue,
      stats: {
        totalCustomers: totalCustomers.count,
        todayCustomers: todayCustomers.count,
        totalOrders: totalOrders.count,
        pendingOrders: pendingOrders.count,
        readyOrders: readyOrders.count,
        completedOrders: completedOrders.count,
        totalProducts: totalProducts.count,
        lowStockProducts: lowStockProducts.count,
        todaySales,
        monthlySales,
        yearlySales,
        totalRevenue,
        totalOutstanding,
      },
      salesTrend,
      categoryBreakdown,
      orderStatuses,
      topDebtors,
      staffPerformance,
    });
  } catch (err: any) {
    console.error("Reports GET error:", err);
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 });
  }
}
