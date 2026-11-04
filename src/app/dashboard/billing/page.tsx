"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  Filter,
  Printer,
  Download,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  MessageSquare,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    total_invoices: 0,
    total_billed: 0,
    total_received: 0,
    total_outstanding: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let url = `/api/invoices?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.invoices) {
        setInvoices(data.invoices);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-600" />
            Billing & Tax Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            GST-compliant optical invoices, payment settlements, and thermal printouts
          </p>
        </div>

        <Link
          href="/dashboard/orders/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-md"
        >
          <span>+ Create Order & Bill</span>
        </Link>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Invoiced</span>
          <p className="text-xl font-extrabold text-navy-950 font-mono mt-1">
            {formatCurrency(summary.total_billed)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            {summary.total_invoices} tax bills generated
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Collected</span>
          <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatCurrency(summary.total_received)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Settled via Cash/UPI/Card</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Outstanding Balance</span>
          <p
            className={`text-xl font-extrabold font-mono mt-1 ${
              summary.total_outstanding > 0 ? "text-rose-600" : "text-emerald-700"
            }`}
          >
            {formatCurrency(summary.total_outstanding)}
          </p>
          <span className="text-[11px] text-rose-500 font-medium">Awaiting counter pickup</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase">GST Rate</span>
          <p className="text-xl font-extrabold text-navy-950 font-mono mt-1">12% / 18%</p>
          <span className="text-[11px] text-slate-500 font-medium">Optical HSN 9001 / 9003</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice code, customer name, mobile..."
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-navy-950"
            >
              <option value="">All Invoices</option>
              <option value="Paid">Fully Paid</option>
              <option value="Partial">Partial Payment</option>
              <option value="Pending">Unpaid</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Total: {invoices.length} invoices
          </span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Order Ref</th>
                <th className="py-3.5 px-4 text-right">Subtotal</th>
                <th className="py-3.5 px-4 text-right">GST</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Paid</th>
                <th className="py-3.5 px-4 text-right">Balance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Print / View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading invoices...</p>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-navy-950">No invoices found</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                      <Link href={`/dashboard/billing/${inv.id}`} className="hover:underline">
                        {inv.invoice_code}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {formatDate(inv.invoice_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/customers/${inv.customer_id}`}
                        className="font-bold text-navy-950 hover:text-brand-600 block"
                      >
                        {inv.customer_name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {inv.customer_mobile}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {inv.order_code ? (
                        <Link href={`/dashboard/orders/${inv.order_id}`} className="hover:underline">
                          {inv.order_code}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      {formatCurrency(inv.subtotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {formatCurrency(inv.gst_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-navy-950">
                      {formatCurrency(inv.grand_total)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-bold">
                      {formatCurrency(inv.paid_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={inv.remaining_balance > 0 ? "text-rose-600" : "text-emerald-700"}>
                        {formatCurrency(inv.remaining_balance)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : inv.status === "Partial"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/dashboard/billing/${inv.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-navy-950 text-white font-bold hover:bg-navy-800 transition text-[11px]"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Bill</span>
                      </Link>
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

