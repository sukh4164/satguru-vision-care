"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  IndianRupee,
  Receipt,
  User,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let url = `/api/payments?search=${encodeURIComponent(search)}`;
      if (methodFilter) url += `&method=${encodeURIComponent(methodFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.payments) {
        setPayments(data.payments);
        if (data.totalCollected !== undefined) setTotalCollected(data.totalCollected);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter]);

  // Load customers for standalone payment
  useEffect(() => {
    fetch("/api/customers?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.customers) setCustomers(d.customers);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !payAmount) {
      alert("Customer and payment amount are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: parseInt(selectedCustomerId),
          amount: parseFloat(payAmount),
          payment_method: payMethod,
          reference_number: payRef,
          notes: payNotes || "Counter payment received",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      setRecordModalOpen(false);
      setPayAmount("");
      setPayRef("");
      setPayNotes("");
      fetchPayments();
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            Payment Collections Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of all counter, UPI, debit/credit card and cash transactions
          </p>
        </div>

        <button
          onClick={() => setRecordModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Payment</span>
        </button>
      </div>

      {/* KPI Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Total Revenue Collected
          </span>
          <h2 className="text-3xl font-black font-mono tracking-tight text-white mt-1">
            {formatCurrency(totalCollected)}
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            All registered payment receipts across store history
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center">
          <IndianRupee className="w-6 h-6" />
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by receipt code, customer, reference..."
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
            <span>Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-navy-950"
            >
              <option value="">All Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Showing {payments.length} receipts
          </span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Payment Date</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Reference / Txn ID</th>
                <th className="py-3.5 px-4">Order / Invoice Ref</th>
                <th className="py-3.5 px-4 text-right">Amount Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading payments ledger...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-navy-950">No payments found</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {p.payment_code}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/customers/${p.customer_id}`}
                        className="font-bold text-navy-950 hover:text-brand-600 block"
                      >
                        {p.customer_name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {p.customer_mobile}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {p.reference_number || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {p.order_code ? (
                        <Link href={`/dashboard/orders/${p.order_id}`} className="hover:underline text-brand-600">
                          {p.order_code}
                        </Link>
                      ) : p.invoice_code ? (
                        <Link href={`/dashboard/billing/${p.invoice_id}`} className="hover:underline text-brand-600">
                          {p.invoice_code}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {recordModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-navy-950 text-sm">
                Record Standalone Counter Payment
              </h3>
              <button onClick={() => setRecordModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Select Customer *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.mobile}) - {c.customer_code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Payment Method *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Reference Number / UPI Transaction ID
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UPI/410629819283"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Lens solution purchase or advance payment"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

