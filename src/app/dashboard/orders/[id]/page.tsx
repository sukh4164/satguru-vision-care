"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Receipt,
  User,
  Calendar,
  AlertCircle,
  MessageSquare,
  Phone,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate, formatWhatsAppUrl } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payRef, setPayRef] = useState("");
  const [recordingPay, setRecordingPay] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        setNewStatus(data.order.status);
        if (data.payments) setPayments(data.payments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async (statusToSet: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToSet, note: statusNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status update failed");
      setStatusNote("");
      fetchOrder();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecordingPay(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          invoice_id: order.invoice_id || null,
          customer_id: order.customer_id,
          amount: parseFloat(payAmount),
          payment_method: payMethod,
          reference_number: payRef,
          notes: "Counter balance payment against order",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment recording failed");

      setPaymentModalOpen(false);
      setPayAmount("");
      setPayRef("");
      fetchOrder();
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setRecordingPay(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <span className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-sm">Loading Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 text-center max-w-lg mx-auto space-y-4 my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-navy-950">Order Not Found</h2>
        <Link href="/dashboard/orders" className="inline-block px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans font-mono">
                {order.order_code}
              </h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                  order.status === "Delivered"
                    ? "bg-emerald-100 text-emerald-800"
                    : order.status === "Ready for Delivery"
                    ? "bg-cyan-100 text-cyan-800"
                    : order.status === "Processing"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Booked on {formatDate(order.order_date)} • Expected Delivery: {formatDate(order.expected_delivery_date)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.invoice_id && (
            <Link
              href={`/dashboard/billing/${order.invoice_id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition shadow-xs"
            >
              <Receipt className="w-4 h-4 text-sky-400" />
              <span>Print Tax Invoice</span>
            </Link>
          )}

          {order.remaining_balance > 0 && (
            <button
              onClick={() => {
                setPayAmount(String(order.remaining_balance));
                setPaymentModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-xs"
            >
              <CreditCard className="w-4 h-4" />
              <span>Collect Balance ({formatCurrency(order.remaining_balance)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Workflow Status Progression Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Order Lab Workflow Progression
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {ORDER_STATUSES.map((st) => {
            const isCurrent = order.status === st.value;
            return (
              <button
                key={st.value}
                disabled={updatingStatus}
                onClick={() => handleUpdateStatus(st.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isCurrent
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {isCurrent && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order & Lens Specifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs text-xs">
            <h3 className="text-sm font-bold text-navy-950 pb-2 border-b border-slate-100">
              Spectacle Specifications
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Frame Details
                </span>
                <p className="text-sm font-bold text-navy-950">{order.frame_details || "Standard frame"}</p>
                <p className="text-slate-500 font-mono">Rate: {formatCurrency(order.frame_amount)}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Lens Details & Optical Prescription
                </span>
                <p className="text-sm font-bold text-navy-950">{order.lens_details || "Standard lenses"}</p>
                <p className="text-slate-500 font-mono">Rate: {formatCurrency(order.lens_amount)}</p>

                {order.od_sph !== undefined && (
                  <div className="pt-2 mt-2 border-t border-slate-200 grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <strong>OD:</strong> {order.od_sph} / {order.od_cyl} @ {order.od_axis}° {order.od_add !== "0.00" ? `| ADD: ${order.od_add}` : ""}
                    </div>
                    <div>
                      <strong>OS:</strong> {order.os_sph} / {order.os_cyl} @ {order.os_axis}° {order.os_add !== "0.00" ? `| ADD: ${order.os_add}` : ""}
                    </div>
                  </div>
                )}
              </div>

              {order.order_notes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold block uppercase text-[10px]">Fitting / Lab Notes:</span>
                  <p>{order.order_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Receipts for this Order */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs text-xs">
            <h3 className="text-sm font-bold text-navy-950 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Payment Receipts ({payments.length})</span>
              <span className="text-emerald-700 font-bold font-mono">
                Total Paid: {formatCurrency(order.advance_paid)}
              </span>
            </h3>

            <div className="space-y-2">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-navy-950">{p.payment_code}</span>
                    <span className="text-slate-400 ml-2">{formatDate(p.payment_date)}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Method: <strong>{p.payment_method}</strong> • Ref: {p.reference_number || "—"}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Customer Card & Billing Summary */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-navy-950 uppercase tracking-wider text-[11px] text-slate-400">
              Customer Details
            </h3>
            <Link
              href={`/dashboard/customers/${order.customer_id}`}
              className="text-base font-bold text-navy-950 hover:text-brand-600 block"
            >
              {order.customer_name}
            </Link>
            <p className="text-slate-500 font-mono">ID: {order.customer_code}</p>
            <p className="font-semibold text-slate-800">Phone: {order.customer_mobile}</p>
            {order.customer_address && (
              <p className="text-slate-600">
                {order.customer_address}, {order.customer_city || "Mumbai"}
              </p>
            )}

            <div className="pt-2 flex items-center gap-2">
              <a
                href={formatWhatsAppUrl(
                  order.customer_whatsapp || order.customer_mobile,
                  `Hello ${order.customer_name}, update regarding your optical order ${order.order_code} from Satguru Vision Care.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-center hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Customer</span>
              </a>
            </div>
          </div>

          {/* Billing Calculations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs font-mono">
            <h3 className="font-bold text-navy-950 uppercase tracking-wider text-[11px] text-slate-400 font-sans">
              Billing Ledger
            </h3>

            <div className="flex justify-between text-slate-600">
              <span>Frame Amount:</span>
              <span>{formatCurrency(order.frame_amount)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Lens Amount:</span>
              <span>{formatCurrency(order.lens_amount)}</span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Discount:</span>
                <span>- {formatCurrency(order.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>GST ({order.gst_rate}%):</span>
              <span>{formatCurrency(order.gst_amount)}</span>
            </div>

            <div className="flex justify-between text-sm font-extrabold text-navy-950 pt-2 border-t border-slate-200">
              <span>Grand Total:</span>
              <span className="text-brand-700">{formatCurrency(order.grand_total)}</span>
            </div>

            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Advance Paid:</span>
              <span>{formatCurrency(order.advance_paid)}</span>
            </div>

            <div className="flex justify-between text-sm font-extrabold text-navy-950 p-2 bg-slate-50 rounded-xl">
              <span>Remaining Balance:</span>
              <span className={order.remaining_balance > 0 ? "text-rose-600" : "text-emerald-700"}>
                {formatCurrency(order.remaining_balance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-navy-950 text-sm">
                Collect Payment for Order {order.order_code}
              </h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
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
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Debit/Credit Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Reference / Txn ID
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UPI/410629819283"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPay}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  {recordingPay ? "Saving..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

