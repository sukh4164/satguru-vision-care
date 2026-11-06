import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MetricCard } from "@/components/MetricCard";
import {
  Users,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Glasses,
  IndianRupee,
  Calendar,
  Eye,
  FileText,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Activity,
  Phone,
  MessageSquare,
  Wrench,
  Search,
  Settings,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.role === "admin";
  const todayStr = new Date().toISOString().split("T")[0];
  const thisMonthPrefix = todayStr.slice(0, 7);

  // General & Financial Stats
  const totalCustomers = ((await db.prepare(`SELECT COUNT(*) as c FROM customers`).get()) as any)?.c || 0;
  const todayCustomers = ((await db.prepare(`SELECT COUNT(*) as c FROM customers WHERE registration_date = ?`).get(todayStr)) as any)?.c || 0;

  const totalOrders = ((await db.prepare(`SELECT COUNT(*) as c FROM orders`).get()) as any)?.c || 0;
  const pendingOrders = ((await db.prepare(`SELECT COUNT(*) as c FROM orders WHERE status IN ('New', 'Processing', 'Ordered from Supplier')`).get()) as any)?.c || 0;
  const readyOrders = ((await db.prepare(`SELECT COUNT(*) as c FROM orders WHERE status = 'Ready for Delivery'`).get()) as any)?.c || 0;
  const completedOrders = ((await db.prepare(`SELECT COUNT(*) as c FROM orders WHERE status = 'Delivered'`).get()) as any)?.c || 0;

  const totalProducts = ((await db.prepare(`SELECT COUNT(*) as c FROM products WHERE status = 'active'`).get()) as any)?.c || 0;
  const lowStockProducts = ((await db.prepare(`SELECT COUNT(*) as c FROM products WHERE status = 'active' AND stock_quantity <= min_stock_alert`).get()) as any)?.c || 0;

  // Staff specific stats
  const staffCustomersAdded = ((await db.prepare(`SELECT COUNT(*) as c FROM customers WHERE created_by = ?`).get(user.id)) as any)?.c || 0;
  const staffOrdersCreated = ((await db.prepare(`SELECT COUNT(*) as c FROM orders WHERE created_by = ?`).get(user.id)) as any)?.c || 0;

  // Revenue stats (Admin only)
  let todaySales = 0;
  let monthlySales = 0;
  let totalOutstanding = 0;

  if (isAdmin) {
    todaySales = ((await db.prepare(`SELECT COALESCE(SUM(grand_total), 0) as s FROM orders WHERE order_date = ? AND status != 'Cancelled'`).get(todayStr)) as any)?.s || 0;
    monthlySales = ((await db.prepare(`SELECT COALESCE(SUM(grand_total), 0) as s FROM orders WHERE order_date LIKE ? AND status != 'Cancelled'`).get(`${thisMonthPrefix}%`)) as any)?.s || 0;
    totalOutstanding = ((await db.prepare(`SELECT COALESCE(SUM(remaining_balance), 0) as s FROM orders WHERE status != 'Cancelled'`).get()) as any)?.s || 0;
  }

  // Recent Orders
  const recentOrders = ((await db
    .prepare(
      `
      SELECT o.*, c.name as customer_name, c.mobile as customer_mobile
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.id DESC LIMIT 5
    `
    )
    .all()) as any[]) || [];

  // Recent Customers
  const recentCustomers = ((await db
    .prepare(
      `
      SELECT c.*, (SELECT COUNT(*) FROM prescriptions p WHERE p.customer_id = c.id) as rx_count
      FROM customers c
      ORDER BY c.id DESC LIMIT 5
    `
    )
    .all()) as any[]) || [];

  // Pending Deliveries & Follow-ups
  const pendingFollowups = ((await db
    .prepare(
      `
      SELECT f.*, c.name as customer_name, c.mobile as customer_mobile
      FROM followups f
      JOIN customers c ON f.customer_id = c.id
      WHERE f.status = 'Pending'
      ORDER BY f.scheduled_date ASC LIMIT 5
    `
    )
    .all()) as any[]) || [];

  // Low Stock Items
  const lowStockItems = ((await db
    .prepare(
      `
      SELECT * FROM products
      WHERE status = 'active' AND stock_quantity <= min_stock_alert
      ORDER BY stock_quantity ASC LIMIT 4
    `
    )
    .all()) as any[]) || [];

  // Recent Activities
  const recentActivities = ((await db
    .prepare(
      `
      SELECT * FROM activity_logs
      ORDER BY id DESC LIMIT 6
    `
    )
    .all()) as any[]) || [];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-brand-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-sky-400/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-400/20 text-sky-300 border border-sky-400/30">
                {isAdmin ? "Owner Control Hub" : "Optometrist Staff Terminal"}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white font-sans">
              Have a productive day, {user.name}
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-xl">
              Welcome to Satguru Vision Care operations. Review today's customer visits, active spectacle orders, lab processing, and inventory alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/prescriptions/new"
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 text-xs font-bold transition shadow-md flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Test Eye Power (Rx)</span>
            </Link>
            <Link
              href="/dashboard/customers/new"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition backdrop-blur-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Customer</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles (Inspired by User's Reference Image 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          href="/dashboard/customers/new"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-navy-950 block">New Customer</span>
          <span className="text-[10px] text-slate-400">Create fresh record</span>
        </Link>

        <Link
          href="/dashboard/customers"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
            <Search className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-navy-950 block">Search Records</span>
          <span className="text-[10px] text-slate-400">Find history & details</span>
        </Link>

        <Link
          href="/dashboard/prescriptions/new"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
            <Eye className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-navy-950 block">Vision Test (Rx)</span>
          <span className="text-[10px] text-slate-400">OD/OS Eye Power</span>
        </Link>

        <Link
          href="/dashboard/orders/new"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-navy-950 block">New Order</span>
          <span className="text-[10px] text-slate-400">Book frame & lenses</span>
        </Link>

        <Link
          href="/dashboard/inventory"
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
            <Glasses className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs text-navy-950 block">Stock & Items</span>
          <span className="text-[10px] text-slate-400">Manage inventory</span>
        </Link>

        {isAdmin ? (
          <Link
            href="/dashboard/settings"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-navy-950 block">Shop Settings</span>
            <span className="text-[10px] text-slate-400">Update GST & profile</span>
          </Link>
        ) : (
          <Link
            href="/dashboard/followups"
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-navy-950 block">Recalls</span>
            <span className="text-[10px] text-slate-400">Follow-up tasks</span>
          </Link>
        )}
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isAdmin ? (
          <>
            <MetricCard
              title="Today's Sales"
              value={formatCurrency(todaySales)}
              subtitle="Daily billing turnover"
              icon={IndianRupee}
              colorScheme="green"
              trend={{ value: "+12%", isPositive: true }}
            />
            <MetricCard
              title="Monthly Sales"
              value={formatCurrency(monthlySales)}
              subtitle="Current month turnover"
              icon={TrendingUp}
              colorScheme="blue"
              trend={{ value: "+18%", isPositive: true }}
            />
            <MetricCard
              title="Total Outstanding"
              value={formatCurrency(totalOutstanding)}
              subtitle="Pending customer balances"
              icon={AlertTriangle}
              colorScheme="rose"
            />
            <MetricCard
              title="Total Customers"
              value={totalCustomers}
              subtitle={`${todayCustomers} registered today`}
              icon={Users}
              colorScheme="navy"
              trend={{ value: "+8%", isPositive: true }}
            />
          </>
        ) : (
          <>
            <MetricCard
              title="My Customers Added"
              value={staffCustomersAdded}
              subtitle="Registered by your account"
              icon={Users}
              colorScheme="blue"
            />
            <MetricCard
              title="My Orders Booked"
              value={staffOrdersCreated}
              subtitle="Total optical jobs created"
              icon={ShoppingBag}
              colorScheme="navy"
            />
            <MetricCard
              title="Pending In Lab"
              value={pendingOrders}
              subtitle="Processing with lens lab"
              icon={Clock}
              colorScheme="amber"
            />
            <MetricCard
              title="Ready For Delivery"
              value={readyOrders}
              subtitle="Customers awaiting pickup"
              icon={CheckCircle2}
              colorScheme="green"
            />
          </>
        )}
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Orders</span>
          <p className="text-xl font-bold text-navy-950 mt-1">{totalOrders}</p>
          <span className="text-[11px] text-amber-600 font-medium">
            {pendingOrders} in lab / processing
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Ready For Pickup</span>
          <p className="text-xl font-bold text-navy-950 mt-1">{readyOrders}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Prepared for fitting</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Stock Items</span>
          <p className="text-xl font-bold text-navy-950 mt-1">{totalProducts}</p>
          <span className="text-[11px] text-slate-500 font-medium">Frames & lenses</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Low Stock Alert</span>
          <p className="text-xl font-bold text-rose-600 mt-1">{lowStockProducts}</p>
          <span className="text-[11px] text-rose-500 font-medium">Below reorder trigger</span>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Customer Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-navy-950 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-600" />
                Recent Optical Orders
              </h3>
              <p className="text-xs text-slate-400">Real-time store job orders</p>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase font-semibold border-b border-slate-100">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Frame / Lens</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 font-mono font-bold text-navy-950">
                      <Link href={`/dashboard/orders/${ord.id}`} className="hover:underline text-brand-600">
                        {ord.order_code}
                      </Link>
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-navy-950">{ord.customer_name}</p>
                      <p className="text-[11px] text-slate-400">{ord.customer_mobile}</p>
                    </td>
                    <td className="py-3 max-w-xs truncate text-slate-600">
                      {ord.frame_details || "Standard frame"}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-navy-950">
                      {formatCurrency(ord.grand_total)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.status === "Ready for Delivery"
                            ? "bg-cyan-100 text-cyan-800"
                            : ord.status === "Processing"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Important Today & Follow-ups */}
        <div className="space-y-6">
          {/* Pending Deliveries / Reminders Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-navy-950 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                Upcoming Follow-ups & Recalls
              </h3>
              <Link href="/dashboard/followups" className="text-xs font-bold text-brand-600">
                All ({pendingFollowups.length})
              </Link>
            </div>

            <div className="space-y-3">
              {pendingFollowups.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-950">{f.customer_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                      {f.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{f.notes || "Recall scheduled"}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Due: {formatDate(f.scheduled_date)}</span>
                    <a
                      href={`https://wa.me/91${f.customer_mobile?.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200/80 shadow-xs p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                <h4 className="font-bold text-navy-950 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Low Stock Alert ({lowStockItems.length})</span>
                </h4>
                <Link href="/dashboard/inventory?lowStock=true" className="text-xs font-bold text-rose-600">
                  Manage
                </Link>
              </div>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-rose-50/50 border border-rose-100 text-xs"
                  >
                    <div>
                      <p className="font-bold text-navy-950">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.category_name}</p>
                    </div>
                    <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                      {item.stock_quantity} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staff Activity Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-navy-950 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              Recent Store Activity Timeline
            </h3>
            <p className="text-xs text-slate-400">Audit trail of actions taken by team</p>
          </div>
          <Link
            href="/dashboard/activity-logs"
            className="text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            Full Audit Logs
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentActivities.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/40 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-950">{log.action}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDate(log.created_at, true)}
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">{log.details}</p>
              <span className="text-[10px] text-slate-400 block">By: {log.user_name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

