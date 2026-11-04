"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Eye,
  ArrowLeft,
  Printer,
  ShoppingBag,
  User,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
} from "lucide-react";
import { PrintablePrescription } from "@/components/PrintablePrescription";
import { PrescriptionComparisonCard } from "@/components/PrescriptionComparisonCard";

export default function PrescriptionDetailPage() {
  const params = useParams();
  const prescriptionId = params.id as string;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prescriptionId) return;
    setLoading(true);
    fetch(`/api/prescriptions/${prescriptionId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) throw new Error(resData.error);
        setData(resData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [prescriptionId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <span className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-sm">Loading Eye Prescription Record...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 text-center max-w-lg mx-auto space-y-4 my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-navy-950">Prescription Not Found</h2>
        <p className="text-xs text-slate-500">{error || "Unable to locate this prescription record."}</p>
        <Link
          href="/dashboard/prescriptions"
          className="inline-block px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Prescriptions
        </Link>
      </div>
    );
  }

  const { prescription, previousPrescription, storeSettings } = data;

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
              Prescription: {prescription.prescription_code}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <Link href={`/dashboard/customers/${prescription.customer_id}`} className="font-bold text-navy-950 hover:underline">{prescription.customer_name}</Link> ({prescription.customer_code})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/orders/new?customerId=${prescription.customer_id}&prescriptionId=${prescription.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-sky-400" />
            <span>Create Order with this Rx</span>
          </Link>
        </div>
      </div>

      {/* Side-by-Side Comparison against Previous Prescription */}
      <PrescriptionComparisonCard
        latest={prescription}
        previous={previousPrescription}
      />

      {/* Official Printable Prescription Slip */}
      <PrintablePrescription
        prescription={prescription}
        storeSettings={storeSettings}
      />
    </div>
  );
}

