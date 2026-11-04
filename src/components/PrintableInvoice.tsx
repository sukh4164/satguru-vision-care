"use client";

import React, { useRef } from "react";
import { formatCurrency, formatDate, formatWhatsAppUrl } from "@/lib/utils";
import { Printer, Share2, Download, MessageSquare } from "lucide-react";

interface PrintableInvoiceProps {
  invoice: any;
  payments?: any[];
  storeSettings?: any;
}

export function PrintableInvoice({
  invoice,
  payments = [],
  storeSettings = {},
}: PrintableInvoiceProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const store = storeSettings || {
    store_name: "SATGURU VISION CARE",
    tagline: "Opticians, Optometrists & Contact Lens Specialists",
    address: "Shop No. 4, Ground Floor, Vision Plaza, Main Market Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    mobile: "+91 98200 12345",
    whatsapp: "+91 98200 12345",
    email: "contact@satguruvisioncare.com",
    gst_number: "27AAAAA0000A1Z5",
    invoice_footer:
      "Warranty applies to frame manufacturing defects for 6 months. Progressive lenses come with a 30-day adaptation guarantee.",
  };

  const whatsappMessage = `Hello ${invoice.customer_name},\nHere is your optical invoice from *SATGURU VISION CARE*.\n\n*Invoice No:* ${invoice.invoice_code}\n*Date:* ${formatDate(invoice.invoice_date)}\n*Items:* ${invoice.frame_details || "Eyewear Frame"} + ${invoice.lens_details || "Precision Lenses"}\n*Total Amount:* ₹ ${invoice.grand_total}\n*Paid:* ₹ ${invoice.paid_amount}\n*Balance Due:* ₹ ${invoice.remaining_balance}\n\nThank you for choosing Satguru Vision Care! For any queries, call us at ${store.mobile}.`;

  const whatsappLink = formatWhatsAppUrl(invoice.customer_mobile || "", whatsappMessage);

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Invoice Actions:
          </span>
          <span className="text-sm font-bold text-navy-950 font-mono">
            {invoice.invoice_code}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send on WhatsApp</span>
          </a>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice (A4 / POS)</span>
          </button>
        </div>
      </div>

      {/* Invoice Document (Designed to print cleanly) */}
      <div
        ref={printAreaRef}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Header Branding */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b-2 border-navy-950">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black tracking-tight text-navy-950 font-sans">
                {store.store_name}
              </h1>
            </div>
            <p className="text-xs font-bold text-brand-700 tracking-wide uppercase">
              {store.tagline}
            </p>
            <p className="text-xs text-slate-600 mt-1 max-w-md">
              {store.address}, {store.city}, {store.state} - {store.pincode}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              <strong>Phone:</strong> {store.mobile} | <strong>WhatsApp:</strong> {store.whatsapp}
            </p>
            <p className="text-xs text-slate-600">
              <strong>Email:</strong> {store.email} | <strong>GSTIN:</strong> {store.gst_number}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-navy-950 text-white font-bold text-xs uppercase tracking-widest rounded-md mb-2">
              TAX INVOICE
            </span>
            <p className="text-xs text-slate-500">Invoice Number</p>
            <p className="text-base font-extrabold text-navy-950 font-mono">
              {invoice.invoice_code}
            </p>
            <p className="text-xs text-slate-500 mt-1">Invoice Date</p>
            <p className="text-xs font-bold text-navy-950">
              {formatDate(invoice.invoice_date)}
            </p>
            {invoice.order_code && (
              <p className="text-xs text-slate-500 mt-1">
                Order Ref: <span className="font-mono font-semibold">{invoice.order_code}</span>
              </p>
            )}
          </div>
        </div>

        {/* Customer & Prescription Details */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Customer Details (Billed To)
            </h3>
            <p className="text-sm font-bold text-navy-950">{invoice.customer_name}</p>
            <p className="text-xs text-slate-600 mt-0.5">
              <strong>Mobile:</strong> {invoice.customer_mobile}
            </p>
            {invoice.customer_email && (
              <p className="text-xs text-slate-600">
                <strong>Email:</strong> {invoice.customer_email}
              </p>
            )}
            {invoice.customer_address && (
              <p className="text-xs text-slate-600 mt-0.5">
                {invoice.customer_address}, {invoice.customer_city || "Mumbai"} {invoice.customer_pincode || ""}
              </p>
            )}
            <p className="text-xs font-mono text-slate-400 mt-1">
              Customer Code: {invoice.customer_code}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Eye Power Reference
            </h3>
            {invoice.od_sph !== undefined ? (
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs space-y-1">
                <div className="grid grid-cols-5 text-center font-bold text-slate-700">
                  <span>EYE</span>
                  <span>SPH</span>
                  <span>CYL</span>
                  <span>AXIS</span>
                  <span>ADD</span>
                </div>
                <div className="grid grid-cols-5 text-center text-navy-950 font-mono font-medium">
                  <span className="font-bold text-brand-700">OD</span>
                  <span>{invoice.od_sph || "0.00"}</span>
                  <span>{invoice.od_cyl || "0.00"}</span>
                  <span>{invoice.od_axis ? `${invoice.od_axis}°` : "0°"}</span>
                  <span>{invoice.od_add || "0.00"}</span>
                </div>
                <div className="grid grid-cols-5 text-center text-navy-950 font-mono font-medium">
                  <span className="font-bold text-brand-700">OS</span>
                  <span>{invoice.os_sph || "0.00"}</span>
                  <span>{invoice.os_cyl || "0.00"}</span>
                  <span>{invoice.os_axis ? `${invoice.os_axis}°` : "0°"}</span>
                  <span>{invoice.os_add || "0.00"}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No direct prescription linked</p>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-2.5">#</th>
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center">HSN/SAC</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Rate</th>
                <th className="py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Frame */}
              <tr>
                <td className="py-3 font-semibold text-slate-400">01</td>
                <td className="py-3">
                  <p className="font-bold text-navy-950 text-sm">
                    {invoice.frame_details || "Spectacle Frame"}
                  </p>
                  <p className="text-slate-500 text-[11px]">Premium Optical Frame Mount</p>
                </td>
                <td className="py-3 text-center text-slate-600 font-mono">9003</td>
                <td className="py-3 text-center font-bold">1</td>
                <td className="py-3 text-right font-mono">
                  {formatCurrency(invoice.frame_amount || 0)}
                </td>
                <td className="py-3 text-right font-mono font-bold text-navy-950">
                  {formatCurrency(invoice.frame_amount || 0)}
                </td>
              </tr>

              {/* Lenses */}
              {invoice.lens_amount > 0 && (
                <tr>
                  <td className="py-3 font-semibold text-slate-400">02</td>
                  <td className="py-3">
                    <p className="font-bold text-navy-950 text-sm">
                      {invoice.lens_details || "Ophthalmic Precision Lenses (Pair)"}
                    </p>
                    <p className="text-slate-500 text-[11px]">Laboratory Fitted Lenses with Coating</p>
                  </td>
                  <td className="py-3 text-center text-slate-600 font-mono">9001</td>
                  <td className="py-3 text-center font-bold">1</td>
                  <td className="py-3 text-right font-mono">
                    {formatCurrency(invoice.lens_amount)}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-navy-950">
                    {formatCurrency(invoice.lens_amount)}
                  </td>
                </tr>
              )}

              {/* Additional Services */}
              {invoice.additional_charges > 0 && (
                <tr>
                  <td className="py-3 font-semibold text-slate-400">03</td>
                  <td className="py-3">
                    <p className="font-bold text-navy-950">Lab Fitting & Custom Glazing</p>
                  </td>
                  <td className="py-3 text-center text-slate-600 font-mono">9988</td>
                  <td className="py-3 text-center font-bold">1</td>
                  <td className="py-3 text-right font-mono">
                    {formatCurrency(invoice.additional_charges)}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-navy-950">
                    {formatCurrency(invoice.additional_charges)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation Totals */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-slate-200">
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-1">
                Payment History & Settlement
              </h4>
              {payments.length > 0 ? (
                <div className="space-y-1">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 text-slate-700"
                    >
                      <span>
                        {formatDate(p.payment_date)} ({p.payment_method})
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No payment receipts logged yet</p>
              )}
            </div>

            <div className="text-[11px] text-slate-500 italic pt-2">
              <strong>Terms & Conditions:</strong>
              <br />
              {store.invoice_footer}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Items Total):</span>
              <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
            </div>

            {invoice.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Discount Applied:</span>
                <span className="font-mono">- {formatCurrency(invoice.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>CGST ({invoice.gst_rate / 2}%):</span>
              <span className="font-mono">{formatCurrency(invoice.gst_amount / 2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>SGST ({invoice.gst_rate / 2}%):</span>
              <span className="font-mono">{formatCurrency(invoice.gst_amount / 2)}</span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-navy-950 pt-2 border-t border-slate-300">
              <span>Grand Total:</span>
              <span className="font-mono text-brand-700">
                {formatCurrency(invoice.grand_total)}
              </span>
            </div>

            <div className="flex justify-between font-bold text-emerald-700 pt-1">
              <span>Paid Amount:</span>
              <span className="font-mono">{formatCurrency(invoice.paid_amount)}</span>
            </div>

            <div className="flex justify-between font-extrabold text-navy-950 py-1.5 px-2 bg-slate-100 rounded-lg">
              <span>Remaining Balance:</span>
              <span
                className={`font-mono text-sm ${
                  invoice.remaining_balance > 0 ? "text-rose-600" : "text-emerald-700"
                }`}
              >
                {formatCurrency(invoice.remaining_balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Footer */}
        <div className="flex justify-between items-end pt-12 mt-6 border-t border-slate-200 text-xs">
          <div>
            <p className="text-slate-400">Customer Signature</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-navy-950">For SATGURU VISION CARE</p>
            <p className="text-slate-400 mt-8">Authorized Signatory / Optometrist</p>
          </div>
        </div>
      </div>
    </div>
  );
}

