"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  Receipt,
  ArrowRight,
  Phone,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/orders?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-600" />
            Order Management & Job Cards
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track optical orders from lab processing to customer delivery and payment collection
          </p>
        </div>

        <Link
          href="/dashboard/orders/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Book New Order</span>
        </Link>
      </div>

      {/* Status Tabs and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === ""
                ? "bg-navy-950 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Orders
          </button>
          {ORDER_STATUSES.map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st.value
                  ? "bg-navy-950 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order code, customer name, mobile..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-navy-950 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition"
            >
              Search
            </button>
          </form>

          <span className="text-xs font-semibold text-slate-400">
            Showing {orders.length} orders
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 px-4">Order Code</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Order / Delivery Date</th>
                <th className="py-3.5 px-4">Frame & Lens Specification</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Advance Paid</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-navy-950">No orders found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Book a new order to begin tracking lab jobs.</p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-600">
                      <Link href={`/dashboard/orders/${o.id}`} className="hover:underline">
                        {o.order_code}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/customers/${o.customer_id}`}
                        className="font-bold text-navy-950 hover:text-brand-600 block"
                      >
                        {o.customer_name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {o.customer_mobile}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-700">{formatDate(o.order_date)}</p>
                      {o.expected_delivery_date && (
                        <p className="text-[10px] text-brand-700">
                          Due: {formatDate(o.expected_delivery_date)}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <p className="font-bold text-navy-950 truncate">{o.frame_details || "Frame"}</p>
                      <p className="text-[11px] text-slate-500 truncate">{o.lens_details || "Lenses"}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-navy-950">
                      {formatCurrency(o.grand_total)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                      {formatCurrency(o.advance_paid)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={o.remaining_balance > 0 ? "text-rose-600" : "text-emerald-700"}>
                        {formatCurrency(o.remaining_balance)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          o.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "Ready for Delivery"
                            ? "bg-cyan-100 text-cyan-800"
                            : o.status === "Processing"
                            ? "bg-amber-100 text-amber-800"
                            : o.status === "Cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/dashboard/orders/${o.id}`}
                          className="px-2.5 py-1 rounded-lg bg-navy-900 text-white font-bold hover:bg-navy-800 transition text-[11px]"
                        >
                          View Job
                        </Link>
                        {o.invoice_code && (
                          <Link
                            href={`/dashboard/billing?search=${o.order_code}`}
                            className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                            title="View Invoice"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

