"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  IndianRupee,
  Users,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ReportsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((resData) => {
        setData(resData);
      })
      .finally(() => setLoading(false));
  }, []);

  const exportReportCSV = () => {
    if (!data) return;
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total Revenue", data.stats?.totalRevenue || 0],
      ["Monthly Sales", data.stats?.monthlySales || 0],
      ["Today's Sales", data.stats?.todaySales || 0],
      ["Total Outstanding Debtors", data.stats?.totalOutstanding || 0],
      ["Total Customers", data.stats?.totalCustomers || 0],
      ["Total Orders", data.stats?.totalOrders || 0],
      ["Completed Delivered Orders", data.stats?.completedOrders || 0],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `satguru_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <span className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-sm">Generating Optical Analytics & Reports...</p>
      </div>
    );
  }

  const { stats, salesTrend, categoryBreakdown, topDebtors, staffPerformance, canSeeRevenue } =
    data || {};

  const COLORS = ["#0284C7", "#38BDF8", "#102A43", "#627D98", "#10B981", "#F59E0B", "#8B5CF6"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            Executive Reports & Business Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Turnover progressions, category sales volume, staff productivity, and outstanding receivables
          </p>
        </div>

        <button
          onClick={exportReportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary CSV</span>
        </button>
      </div>

      {/* KPI Highlights (Admin Revenue) */}
      {canSeeRevenue && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Lifetime Sales
            </span>
            <p className="text-2xl font-black text-navy-950 font-mono mt-1">
              {formatCurrency(stats?.totalRevenue)}
            </p>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Store turnover
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Current Month Sales
            </span>
            <p className="text-2xl font-black text-brand-700 font-mono mt-1">
              {formatCurrency(stats?.monthlySales)}
            </p>
            <span className="text-xs text-brand-600 font-medium mt-1 block">
              Orders this month
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Today's Counter Sales
            </span>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
              {formatCurrency(stats?.todaySales)}
            </p>
            <span className="text-xs text-slate-500 font-medium mt-1 block">
              Billed today
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Outstanding Receivables
            </span>
            <p className="text-2xl font-black text-rose-600 font-mono mt-1">
              {formatCurrency(stats?.totalOutstanding)}
            </p>
            <span className="text-xs text-rose-500 font-medium mt-1 block">
              Unsettled balances
            </span>
          </div>
        </div>
      )}

      {/* Sales Progression Chart (Inspired by User's Reference Image 1 & 3) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-navy-950 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              Daily & Weekly Revenue Progression
            </h3>
            <p className="text-xs text-slate-400">Order revenue progression across recent dates</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            Real-time Database Aggregated
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          {salesTrend && salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="order_date"
                  tickFormatter={(v) => formatDate(v)}
                  stroke="#94A3B8"
                  fontSize={11}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), "Revenue"]}
                  labelFormatter={(lbl) => `Date: ${formatDate(lbl)}`}
                  contentStyle={{
                    backgroundColor: "#0B192C",
                    borderRadius: "12px",
                    color: "#fff",
                    border: "none",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total_amount"
                  stroke="#0284C7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No sales data points logged yet
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Category Inventory Breakdown & Top Debtors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-navy-950 text-sm">Stock Distribution by Category</h3>
            <span className="text-xs text-slate-400">Inventory Units</span>
          </div>

          <div className="h-64 w-full">
            {categoryBreakdown && categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} layout="vertical">
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                  <YAxis
                    dataKey="category_name"
                    type="category"
                    stroke="#94A3B8"
                    fontSize={10}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B192C",
                      borderRadius: "12px",
                      color: "#fff",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="in_stock" fill="#0284C7" radius={[0, 8, 8, 0]}>
                    {categoryBreakdown.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category data available
              </div>
            )}
          </div>
        </div>

        {/* Outstanding Receivables (Top Debtors) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-navy-950 text-sm flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Top Outstanding Debtors
              </h3>
              <p className="text-xs text-slate-400">Pending customer balance payments</p>
            </div>
            <span className="text-xs font-bold text-rose-600 font-mono">
              {topDebtors?.length || 0} Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase font-semibold border-b border-slate-100">
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Mobile</th>
                  <th className="pb-2 text-right">Pending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topDebtors && topDebtors.length > 0 ? (
                  topDebtors.map((d: any) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 font-bold text-navy-950">
                        <a href={`/dashboard/customers/${d.id}`} className="hover:underline">
                          {d.name}
                        </a>
                      </td>
                      <td className="py-2.5 font-mono text-slate-500">{d.mobile}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-rose-600">
                        {formatCurrency(d.balance)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      No outstanding debtor accounts!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Staff Performance Report */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-navy-950 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              Staff Productivity & Performance Scorecard
            </h3>
            <p className="text-xs text-slate-400">
              Customer registrations, eye tests conducted, and optical jobs booked
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Customers Added</th>
                <th className="py-3 px-4 text-center">Eye Tests Done</th>
                <th className="py-3 px-4 text-center">Orders Handled</th>
                <th className="py-3 px-4 text-right">Sales Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffPerformance && staffPerformance.length > 0 ? (
                staffPerformance.map((sp: any) => (
                  <tr key={sp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy-950">{sp.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{sp.employee_id}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {sp.role_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-navy-950">
                      {sp.customers_added}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-purple-700">
                      {sp.prescriptions_done}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-brand-700">
                      {sp.orders_created}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-navy-950">
                      {formatCurrency(sp.sales_volume)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No staff records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

