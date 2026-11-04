"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  User,
  Eye,
  Glasses,
  Receipt,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId");
  const preselectedRxId = searchParams.get("prescriptionId");

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerPrescriptions, setCustomerPrescriptions] = useState<any[]>([]);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustomerId || "");
  const [selectedRxId, setSelectedRxId] = useState<string>(preselectedRxId || "");

  // Frame Details
  const [selectedFrameProduct, setSelectedFrameProduct] = useState<string>("");
  const [frameDetails, setFrameDetails] = useState("Ray-Ban Clubmaster Classic (Black/Gold)");
  const [frameAmount, setFrameAmount] = useState<string>("5500");

  // Lens Details
  const [lensDetails, setLensDetails] = useState("Crizal Prevencia Anti-Blue UV 1.56 (Pair)");
  const [lensAmount, setLensAmount] = useState<string>("2600");

  // Financial Calculations
  const [additionalCharges, setAdditionalCharges] = useState<string>("0");
  const [discountAmount, setDiscountAmount] = useState<string>("300");
  const [gstRate, setGstRate] = useState<string>("12");
  const [advancePaid, setAdvancePaid] = useState<string>("3000");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");

  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  });
  const [orderNotes, setOrderNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Customers & Products
  useEffect(() => {
    Promise.all([
      fetch("/api/customers?limit=200").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([custData, prodData]) => {
      if (custData.customers) setCustomers(custData.customers);
      if (prodData.products) setProducts(prodData.products);
    });
  }, []);

  // When customer changes, load their prescriptions
  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerPrescriptions([]);
      return;
    }

    fetch(`/api/prescriptions?customerId=${selectedCustomerId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.prescriptions) {
          setCustomerPrescriptions(data.prescriptions);
          if (data.prescriptions.length > 0 && !selectedRxId) {
            setSelectedRxId(String(data.prescriptions[0].id));
          }
        }
      });
  }, [selectedCustomerId]);

  // Handle frame product selection from catalog
  const handleFrameProductChange = (productId: string) => {
    setSelectedFrameProduct(productId);
    if (!productId) return;
    const p = products.find((item) => String(item.id) === productId);
    if (p) {
      setFrameDetails(`${p.brand ? p.brand + " " : ""}${p.name} (${p.model_number || p.product_code})`);
      setFrameAmount(String(p.selling_price));
    }
  };

  // Calculations
  const fAmt = parseFloat(frameAmount || "0");
  const lAmt = parseFloat(lensAmount || "0");
  const addChg = parseFloat(additionalCharges || "0");
  const disc = parseFloat(discountAmount || "0");
  const gstPct = parseFloat(gstRate || "12");

  const subtotal = fAmt + lAmt;
  const taxable = Math.max(0, subtotal - disc);
  const gstAmount = Number(((taxable * gstPct) / 100).toFixed(2));
  const grandTotal = Number((taxable + gstAmount + addChg).toFixed(2));

  const adv = parseFloat(advancePaid || "0");
  const remainingBalance = Math.max(0, Number((grandTotal - adv).toFixed(2)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError("Please select a registered customer");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: parseInt(selectedCustomerId),
          prescription_id: selectedRxId ? parseInt(selectedRxId) : null,
          expected_delivery_date: deliveryDate,
          frame_details: frameDetails,
          lens_details: lensDetails,
          frame_amount: fAmt,
          lens_amount: lAmt,
          additional_charges: addChg,
          discount_amount: disc,
          gst_rate: gstPct,
          advance_paid: adv,
          payment_method: paymentMethod,
          order_notes: orderNotes,
          frame_product_id: selectedFrameProduct ? parseInt(selectedFrameProduct) : null,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Order creation failed");

      router.push(`/dashboard/orders/${resData.order.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  const selectedRx = customerPrescriptions.find((r) => String(r.id) === String(selectedRxId));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/orders"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-600" />
            Book New Optical Spectacle Order
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generates Order ID, Tax Invoice, records advance payment, and schedules delivery
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Prescription Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-navy-950 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            1. Customer & Eye Prescription Link
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Select Customer *
              </label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
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
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 uppercase">
                  Select Eye Prescription
                </label>
                {selectedCustomerId && (
                  <Link
                    href={`/dashboard/prescriptions/new?customerId=${selectedCustomerId}`}
                    className="text-brand-600 font-bold hover:underline text-[11px]"
                  >
                    + New Rx Test
                  </Link>
                )}
              </div>
              <select
                value={selectedRxId}
                onChange={(e) => setSelectedRxId(e.target.value)}
                disabled={!selectedCustomerId || customerPrescriptions.length === 0}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              >
                {customerPrescriptions.length === 0 ? (
                  <option value="">No prescriptions on file</option>
                ) : (
                  customerPrescriptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.prescription_code} ({formatDate(r.prescription_date)}) - {r.prescription_type}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Selected Prescription Power Preview */}
          {selectedRx && (
            <div className="p-3.5 rounded-xl bg-brand-50/50 border border-brand-200/80 text-xs">
              <span className="font-bold text-brand-950 block mb-1">
                Linked Prescription Power ({selectedRx.prescription_code}):
              </span>
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <strong>OD (Right):</strong> {selectedRx.od_sph} / {selectedRx.od_cyl} @ {selectedRx.od_axis}° {selectedRx.od_add !== "0.00" ? `| ADD: ${selectedRx.od_add}` : ""}
                </div>
                <div>
                  <strong>OS (Left):</strong> {selectedRx.os_sph} / {selectedRx.os_cyl} @ {selectedRx.os_axis}° {selectedRx.os_add !== "0.00" ? `| ADD: ${selectedRx.os_add}` : ""}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Frame & Lens Specification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-navy-950 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Glasses className="w-4 h-4 text-brand-600" />
            2. Frame & Lens Specifications
          </h3>

          <div className="space-y-4 text-xs">
            {/* Quick Pick From Inventory */}
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Quick Select Frame from Inventory Stock (Optional)
              </label>
              <select
                value={selectedFrameProduct}
                onChange={(e) => handleFrameProductChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- Or enter custom frame details below --</option>
                {products
                  .filter((p) => p.category_name === "Spectacle Frames" || p.category_name === "Sunglasses")
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand}) - {formatCurrency(p.selling_price)} [{p.stock_quantity} in stock]
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Frame Name / Model Details *
                </label>
                <input
                  type="text"
                  required
                  value={frameDetails}
                  onChange={(e) => setFrameDetails(e.target.value)}
                  placeholder="e.g. Titan Elegance Titanium Rimless"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Frame Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={frameAmount}
                  onChange={(e) => setFrameAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Lens Brand & Coating Specification *
                </label>
                <input
                  type="text"
                  required
                  value={lensDetails}
                  onChange={(e) => setLensDetails(e.target.value)}
                  placeholder="e.g. Essilor Varilux Comfort Max 1.60 Progressive"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Lens Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={lensAmount}
                  onChange={(e) => setLensAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Billing & Payment Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-navy-950 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-600" />
            3. Billing, Discounts & Advance Payment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Discount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Additional Lab / Fitting Charges (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={additionalCharges}
                onChange={(e) => setAdditionalCharges(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                GST Rate (%)
              </label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="0">0% (Nil)</option>
                <option value="5">5% (Optical)</option>
                <option value="12">12% (Standard Spectacles)</option>
                <option value="18">18% (Sunglasses & Luxury)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Advance Payment (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-emerald-700 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Special Workshop / Fitting Instructions
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Ensure wide corridor for reading; urgent delivery requested"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Financial Calculation Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 uppercase block text-[10px]">Subtotal</span>
              <span className="text-sm font-bold text-navy-950">{formatCurrency(subtotal)}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block text-[10px]">GST ({gstPct}%)</span>
              <span className="text-sm font-bold text-navy-950">{formatCurrency(gstAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block text-[10px]">Grand Total</span>
              <span className="text-base font-extrabold text-brand-700">{formatCurrency(grandTotal)}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase block text-[10px]">Balance Payable</span>
              <span
                className={`text-base font-extrabold ${
                  remainingBalance > 0 ? "text-rose-600" : "text-emerald-700"
                }`}
              >
                {formatCurrency(remainingBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard/orders"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <span>Creating Order & Invoice...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Place Order</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
