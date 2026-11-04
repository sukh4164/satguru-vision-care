"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Eye,
  ShoppingBag,
  Receipt,
  CreditCard,
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  CalendarDays,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
  Printer,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDate, formatWhatsAppUrl } from "@/lib/utils";
import { PrescriptionComparisonCard } from "@/components/PrescriptionComparisonCard";

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Action Modal states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [selectedOrderForPay, setSelectedOrderForPay] = useState<any | null>(null);
  const [recordingPay, setRecordingPay] = useState(false);

  // Followup Modal
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [followupType, setFollowupType] = useState("Eye Checkup");
  const [followupDate, setFollowupDate] = useState("");
  const [followupNotes, setFollowupNotes] = useState("");
  const [savingFollowup, setSavingFollowup] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to load customer profile");
      setData(resData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchProfile();
  }, [customerId]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecordingPay(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: data.customer.id,
          order_id: selectedOrderForPay?.id || null,
          invoice_id: selectedOrderForPay?.invoice_id || null,
          amount: parseFloat(payAmount),
          payment_method: payMethod,
          reference_number: payRef,
          notes: payNotes,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Payment recording failed");

      setPaymentModalOpen(false);
      setPayAmount("");
      setPayRef("");
      setPayNotes("");
      setSelectedOrderForPay(null);
      fetchProfile();
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setRecordingPay(false);
    }
  };

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFollowup(true);
    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: data.customer.id,
          type: followupType,
          scheduled_date: followupDate,
          notes: followupNotes,
          priority: "Medium",
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to schedule follow-up");

      setFollowupModalOpen(false);
      setFollowupDate("");
      setFollowupNotes("");
      fetchProfile();
    } catch (err: any) {
      alert(err.message || "Failed to schedule reminder");
    } finally {
      setSavingFollowup(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <span className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-sm">Loading 360° Customer Profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 text-center max-w-lg mx-auto space-y-4 my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-navy-950">Customer Profile Unavailable</h2>
        <p className="text-xs text-slate-500">{error || "Customer record not found"}</p>
        <Link
          href="/dashboard/customers"
          className="inline-block px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold"
        >
          Return to Customers
        </Link>
      </div>
    );
  }

  const { customer, prescriptions, orders, invoices, payments, followups, stats } = data;
  const latestRx = prescriptions && prescriptions.length > 0 ? prescriptions[0] : null;
  const previousRx = prescriptions && prescriptions.length > 1 ? prescriptions[1] : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/dashboard" className="hover:text-navy-950">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/dashboard/customers" className="hover:text-navy-950">
          Customers
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-navy-950 font-bold font-mono">{customer.customer_code}</span>
      </div>

      {/* Customer Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-brand-500/20 shrink-0">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-navy-950 font-sans">
                  {customer.name}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {customer.customer_code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span>
                  <strong>Age / Gender:</strong> {customer.age ? `${customer.age} Yrs` : "—"} (
                  {customer.gender || "—"})
                </span>
                <span>•</span>
                <span>
                  <strong>Customer Since:</strong> {formatDate(customer.registration_date)}
                </span>
                <span>•</span>
                <span>
                  <strong>City:</strong> {customer.city || "Mumbai"}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/prescriptions/new?customerId=${customer.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-xs"
            >
              <Eye className="w-4 h-4" />
              <span>+ Add Prescription</span>
            </Link>

            <Link
              href={`/dashboard/orders/new?customerId=${customer.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>+ Create Order</span>
            </Link>

            <button
              onClick={() => {
                setSelectedOrderForPay(null);
                setPayAmount(String(stats?.pending_balance || ""));
                setPaymentModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-xs"
            >
              <CreditCard className="w-4 h-4" />
              <span>Record Payment</span>
            </button>

            <button
              onClick={() => setFollowupModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Add Reminder</span>
            </button>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-brand-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Phone
              </span>
              <a href={`tel:${customer.mobile}`} className="font-bold text-navy-950 hover:underline">
                {customer.mobile}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                WhatsApp
              </span>
              <a
                href={formatWhatsAppUrl(
                  customer.whatsapp || customer.mobile,
                  `Hello ${customer.name}, greeting from Satguru Vision Care!`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-700 hover:underline"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Email
              </span>
              <span className="font-bold text-navy-950 truncate block max-w-xs">
                {customer.email || "Not provided"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Address
              </span>
              <span className="font-bold text-navy-950 truncate block max-w-xs">
                {customer.address ? `${customer.address}, ${customer.city || "Mumbai"}` : "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Lifetime Statistics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Purchases</span>
            <p className="text-base font-extrabold text-navy-950 mt-0.5">
              {formatCurrency(stats?.total_spent || 0)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Paid Till Date</span>
            <p className="text-base font-extrabold text-emerald-700 mt-0.5">
              {formatCurrency(stats?.total_paid || 0)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Balance</span>
            <p
              className={`text-base font-extrabold mt-0.5 ${
                (stats?.pending_balance || 0) > 0 ? "text-rose-600 font-mono" : "text-emerald-700"
              }`}
            >
              {formatCurrency(stats?.pending_balance || 0)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Prescriptions</span>
            <p className="text-base font-extrabold text-purple-700 mt-0.5">
              {prescriptions?.length || 0} Records
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Orders Placed</span>
            <p className="text-base font-extrabold text-brand-700 mt-0.5">
              {orders?.length || 0} Orders
            </p>
          </div>
        </div>
      </div>

      {/* CORE MODULE: EYE PRESCRIPTION COMPARISON & POWER HISTORY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-navy-950 font-sans flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-600" />
              Eye Prescription Power History (Historical Audit)
            </h2>
            <p className="text-xs text-slate-500">
              Never overwritten. Chronological record of all eye examinations with side-by-side power shift comparison.
            </p>
          </div>
          <Link
            href={`/dashboard/prescriptions/new?customerId=${customer.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Eye Examination</span>
          </Link>
        </div>

        {latestRx ? (
          <PrescriptionComparisonCard latest={latestRx} previous={previousRx} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <Eye className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-navy-950 text-sm">No Prescriptions Recorded Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Perform an eye examination for {customer.name} and save their optical refraction values (SPH, CYL, AXIS, ADD, PD).
            </p>
            <Link
              href={`/dashboard/prescriptions/new?customerId=${customer.id}`}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs"
            >
              Record First Prescription
            </Link>
          </div>
        )}

        {/* All Historical Prescriptions List */}
        {prescriptions && prescriptions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              All Previous Tests for this Customer ({prescriptions.length})
            </h4>
            <div className="divide-y divide-slate-100">
              {prescriptions.map((rx: any, idx: number) => (
                <div
                  key={rx.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                      #{prescriptions.length - idx}
                    </span>
                    <div>
                      <span className="font-mono font-bold text-navy-950">
                        {rx.prescription_code}
                      </span>
                      <span className="text-slate-400 ml-2">
                        {formatDate(rx.prescription_date)}
                      </span>
                      <span className="ml-2 font-medium text-slate-600">
                        ({rx.prescription_type || "Distance"})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-700 font-mono">
                    <span>
                      <strong>OD:</strong> {rx.od_sph} / {rx.od_cyl} / {rx.od_axis}°
                    </span>
                    <span>
                      <strong>OS:</strong> {rx.os_sph} / {rx.os_cyl} / {rx.os_axis}°
                    </span>
                    {rx.od_add !== "0.00" && (
                      <span className="text-brand-600 font-bold">
                        ADD: {rx.od_add}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/prescriptions/${rx.id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-navy-950 font-bold hover:bg-slate-200 transition"
                    >
                      View / Print Rx
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Orders & Spectacle History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-navy-950 font-sans flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            Customer Orders & Job Cards ({orders?.length || 0})
          </h2>
          <Link
            href={`/dashboard/orders/new?customerId=${customer.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Order</span>
          </Link>
        </div>

        {orders && orders.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold text-[11px]">
                  <th className="py-3 px-4">Order Code</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Frame & Lens Specification</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-right">Advance Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-600">
                      <Link href={`/dashboard/orders/${ord.id}`} className="hover:underline">
                        {ord.order_code}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {formatDate(ord.order_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy-950">{ord.frame_details || "Frame"}</p>
                      <p className="text-[11px] text-slate-500">{ord.lens_details || "Lenses"}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-navy-950">
                      {formatCurrency(ord.grand_total)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                      {formatCurrency(ord.advance_paid)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={ord.remaining_balance > 0 ? "text-rose-600" : "text-emerald-700"}>
                        {formatCurrency(ord.remaining_balance)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
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
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/dashboard/orders/${ord.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-navy-950 font-bold hover:bg-slate-200 transition"
                        >
                          View Order
                        </Link>
                        {ord.remaining_balance > 0 && (
                          <button
                            onClick={() => {
                              setSelectedOrderForPay(ord);
                              setPayAmount(String(ord.remaining_balance));
                              setPaymentModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100 transition"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No orders created for this customer yet.
          </div>
        )}
      </div>

      {/* Invoices & Payment Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-navy-950 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-600" />
              Tax Invoices ({invoices?.length || 0})
            </h3>
          </div>
          <div className="space-y-2">
            {invoices && invoices.length > 0 ? (
              invoices.map((inv: any) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-navy-950">{inv.invoice_code}</span>
                    <span className="text-slate-400 ml-2">{formatDate(inv.invoice_date)}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Total: {formatCurrency(inv.grand_total)} | Paid: {formatCurrency(inv.paid_amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === "Paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inv.status}
                    </span>
                    <Link
                      href={`/dashboard/billing/${inv.id}`}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-navy-950 hover:bg-slate-100"
                      title="Print Invoice"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No invoices generated yet</p>
            )}
          </div>
        </div>

        {/* Payments History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-navy-950 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Payment Receipts Ledger ({payments?.length || 0})
            </h3>
            <button
              onClick={() => {
                setSelectedOrderForPay(null);
                setPayAmount(String(stats?.pending_balance || ""));
                setPaymentModalOpen(true);
              }}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              + Record Payment
            </button>
          </div>
          <div className="space-y-2">
            {payments && payments.length > 0 ? (
              payments.map((p: any) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-navy-950">{p.payment_code}</span>
                    <span className="text-slate-400 ml-2">{formatDate(p.payment_date)}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Method: <strong>{p.payment_method}</strong>{" "}
                      {p.reference_number ? `(${p.reference_number})` : ""}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-sm text-emerald-700">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No payment records logged</p>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-navy-950 text-sm">
                Record Payment: {customer.name}
              </h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              {selectedOrderForPay && (
                <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200">
                  <span className="font-bold text-brand-900">
                    Linking to Order: {selectedOrderForPay.order_code}
                  </span>
                  <span className="block text-slate-500">
                    Order Balance: {formatCurrency(selectedOrderForPay.remaining_balance)}
                  </span>
                </div>
              )}

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
                  <option value="Cash">Cash Counter</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Debit/Credit Card">Debit / Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Reference / Transaction ID
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
                  placeholder="e.g. Balance settlement on frame delivery"
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
                  {recordingPay ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Followup Modal */}
      {followupModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-navy-950 text-sm">
                Schedule Follow-up / Eye Recall: {customer.name}
              </h3>
              <button
                onClick={() => setFollowupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFollowup} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Reminder Type *
                </label>
                <select
                  value={followupType}
                  onChange={(e) => setFollowupType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Eye Checkup">Annual / 6-Month Eye Checkup</option>
                  <option value="Delivery Ready">Spectacles Delivery Ready</option>
                  <option value="Pending Payment">Pending Balance Collection</option>
                  <option value="Prescription Follow-up">Progressive Lens Adaptation Check</option>
                  <option value="General Feedback">Customer Experience Feedback</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  required
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Reminder Notes
                </label>
                <textarea
                  rows={2}
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  placeholder="e.g. Call customer for free power checkup after 6 months"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFollowupModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFollowup}
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition disabled:opacity-50"
                >
                  {savingFollowup ? "Scheduling..." : "Schedule Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

