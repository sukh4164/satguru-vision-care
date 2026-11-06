"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  ArrowLeft,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { calculateAge } from "@/lib/utils";

export default function NewCustomerPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    email: "",
    dob: "",
    age: "",
    gender: "Male",
    address: "",
    city: "Mumbai",
    pincode: "",
    notes: "",
  });

  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const calcAge = calculateAge(val);
    setFormData((prev) => ({
      ...prev,
      dob: val,
      age: calcAge !== null ? String(calcAge) : prev.age,
    }));
  };

  const handleSaveCustomer = async (force: boolean = false, andAddRx: boolean = false) => {
    setError(null);
    if (!formData.name.trim() || !formData.mobile.trim()) {
      setError("Please provide customer's full name and 10-digit mobile number.");
      return;
    }

    const cleanMobile = formData.mobile.replace(/[^0-9]/g, "");
    if (cleanMobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mobile: cleanMobile,
          force,
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.duplicateWarning) {
        setDuplicateWarning(data.existingCustomer);
        setSaving(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to register customer");
      }

      const newId = data.customer?.id;

      if (andAddRx && newId) {
        router.push(`/dashboard/prescriptions/new?customerId=${newId}`);
      } else if (newId) {
        router.push(`/dashboard/customers/${newId}`);
      } else {
        router.push("/dashboard/customers");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while registering customer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-navy-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center shrink-0 shadow-xs">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-navy-950 font-sans tracking-tight">
              Register New Customer
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Auto-generates unique Customer ID & checks for duplicate phone records in real-time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Duplicate Phone Detection Active</span>
          </span>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Duplicate Warning Prompt */}
        {duplicateWarning && (
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-900">
                  Duplicate Customer Found!
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  A customer with mobile <strong>{duplicateWarning.mobile}</strong> is already registered:
                </p>
                <div className="mt-2 p-3 bg-white/80 rounded-xl border border-amber-200 text-xs space-y-1">
                  <p>
                    <strong>Name:</strong> {duplicateWarning.name} (Code: {duplicateWarning.customer_code})
                  </p>
                  <p>
                    <strong>Registered on:</strong> {duplicateWarning.registration_date}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/dashboard/customers/${duplicateWarning.id}`}
                className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 transition shadow-xs"
              >
                View Existing Customer Profile
              </Link>
              <button
                type="button"
                onClick={() => handleSaveCustomer(true)}
                className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition"
              >
                Register as Separate Record Anyway
              </button>
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold underline ml-auto"
              >
                Cancel & Change Mobile
              </button>
            </div>
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="space-y-6">
          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span>Personal & Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rameshwar Patel"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Mobile Number (10 Digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="9820012345"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="Leave empty to use mobile"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@email.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={handleDobChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Age (Auto)
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Address Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span>Address & Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Flat/Shop, Building, Road name"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="400050"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Notes & Preferences */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span>Customer Clinical Notes & Frame Preferences</span>
            </h3>

            <div>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Prefers progressive lenses, computer eye strain complaints, frame size preferences, sensitive to bright light"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Footer Submit Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100">
          <Link
            href="/dashboard/customers"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
          >
            Cancel
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveCustomer(false, true)}
              className="px-4 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Register & Add Eye Prescription (Rx)</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveCustomer(false, false)}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{saving ? "Registering..." : "Register Customer"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

