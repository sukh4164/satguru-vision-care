"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Search,
  CheckCircle2,
  Calendar,
  User,
  ArrowLeft,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { PrescriptionInputTable, PrescriptionFormData } from "@/components/PrescriptionInputTable";
import { PRESCRIPTION_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function NewPrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId") || searchParams.get("customerid");

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustomerId || "");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [previousRx, setPreviousRx] = useState<any | null>(null);

  const [prescriptionDate, setPrescriptionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  // Default next checkup date: 1 year from now
  const [nextCheckupDate, setNextCheckupDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });
  const [doctorName, setDoctorName] = useState("Rahul Sharma (Optometrist)");
  const [prescriptionType, setPrescriptionType] = useState("Progressive (PAL)");
  const [notes, setNotes] = useState("");

  const [rxData, setRxData] = useState<PrescriptionFormData>({
    od_sph: "0.00",
    od_cyl: "0.00",
    od_axis: "0",
    od_add: "0.00",
    od_pd: "31.5",
    os_sph: "0.00",
    os_cyl: "0.00",
    os_axis: "0",
    os_add: "0.00",
    os_pd: "31.5",
    pd_type: "Dual",
    single_pd: "63.0",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load customers for selection dropdown
  useEffect(() => {
    fetch("/api/customers?limit=200")
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) setCustomers(data.customers);
      });
  }, []);

  // When customer changes, fetch their previous prescription to show comparison
  useEffect(() => {
    if (!selectedCustomerId) {
      setSelectedCustomer(null);
      setPreviousRx(null);
      return;
    }

    const c = customers.find((item) => String(item.id) === String(selectedCustomerId));
    setSelectedCustomer(c || null);

    fetch(`/api/prescriptions?customerId=${selectedCustomerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.prescriptions && data.prescriptions.length > 0) {
          const prev = data.prescriptions[0];
          setPreviousRx(prev);
          // Prepopulate doctor and type from previous if desired
          if (prev.prescription_type) setPrescriptionType(prev.prescription_type);
        } else {
          setPreviousRx(null);
        }
      });
  }, [selectedCustomerId, customers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError("Please select a registered customer for this prescription");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: parseInt(selectedCustomerId),
          prescription_date: prescriptionDate,
          next_checkup_date: nextCheckupDate,
          doctor_name: doctorName,
          prescription_type: prescriptionType,
          notes,
          ...rxData,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save prescription");

      router.push(`/dashboard/prescriptions/${resData.prescription.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/prescriptions"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
              <Eye className="w-6 h-6 text-brand-600" />
              New Eye Examination & Prescription
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Record optical refraction power for spectacles, bifocals or contact lenses
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              1. Select Customer / Patient
            </h3>
            <Link
              href="/dashboard/customers/new"
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              + Register New Customer
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Select Registered Customer *
              </label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- Choose a Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile}) - {c.customer_code}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-navy-950 text-sm">{selectedCustomer.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Phone: {selectedCustomer.mobile} | Age: {selectedCustomer.age || "—"} yrs
                  </p>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                  {selectedCustomer.customer_code}
                </span>
              </div>
            )}
          </div>

          {/* Previous Eye Power Reference Alert (Never Overwritten!) */}
          {previousRx && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Previous Recorded Power ({formatDate(previousRx.prescription_date)}) - {previousRx.prescription_code}
                </span>
                <span className="text-[11px] font-semibold text-amber-800">
                  Type: {previousRx.prescription_type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2 rounded-lg bg-white border border-amber-200">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">OD (Right Eye):</span>
                  <span>SPH: {previousRx.od_sph} | CYL: {previousRx.od_cyl} @ {previousRx.od_axis}° {previousRx.od_add !== "0.00" ? `| ADD: ${previousRx.od_add}` : ""}</span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-amber-200">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">OS (Left Eye):</span>
                  <span>SPH: {previousRx.os_sph} | CYL: {previousRx.os_cyl} @ {previousRx.os_axis}° {previousRx.os_add !== "0.00" ? `| ADD: ${previousRx.os_add}` : ""}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Optical Power Inputs (OD & OS, Single/Dual PD) */}
        <div className="space-y-3">
          <PrescriptionInputTable data={rxData} onChange={setRxData} />
        </div>

        {/* Step 3: Clinical Metadata & Dates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-navy-950 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            3. Examination & Recommendation Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Prescription Date *
              </label>
              <input
                type="date"
                required
                value={prescriptionDate}
                onChange={(e) => setPrescriptionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Next Checkup Recall Date
              </label>
              <input
                type="date"
                value={nextCheckupDate}
                onChange={(e) => setNextCheckupDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Prescription Type *
              </label>
              <select
                value={prescriptionType}
                onChange={(e) => setPrescriptionType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {PRESCRIPTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Optometrist / Doctor Name
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Doctor Name"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Optometrist Remarks / Clinical Advice
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Advised progressive lenses with wide corridor. Anti-glare coating recommended for laptop usage. No diabetic retinopathy observed."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/dashboard/prescriptions"
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
              <span>Saving Prescription...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Eye Prescription (Rx)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

