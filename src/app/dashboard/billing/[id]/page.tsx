"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Receipt, ArrowLeft, AlertCircle } from "lucide-react";
import { PrintableInvoice } from "@/components/PrintableInvoice";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    fetch(`/api/invoices/${invoiceId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) throw new Error(resData.error);
        setData(resData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <span className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-sm">Loading Tax Invoice...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 text-center max-w-lg mx-auto space-y-4 my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-navy-950">Invoice Not Found</h2>
        <Link href="/dashboard/billing" className="inline-block px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold">
          Back to Billing
        </Link>
      </div>
    );
  }

  const { invoice, payments, storeSettings } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 print:hidden">
        <Link
          href="/dashboard/billing"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-navy-950 font-sans flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-600" />
            Tax Invoice: {invoice.invoice_code}
          </h1>
          <p className="text-xs text-slate-500">
            Customer: <Link href={`/dashboard/customers/${invoice.customer_id}`} className="font-bold text-navy-950 hover:underline">{invoice.customer_name}</Link>
          </p>
        </div>
      </div>

      <PrintableInvoice
        invoice={invoice}
        payments={payments}
        storeSettings={storeSettings}
      />
    </div>
  );
}

