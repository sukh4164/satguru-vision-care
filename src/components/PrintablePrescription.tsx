"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { Printer, Download, Eye } from "lucide-react";

interface PrintablePrescriptionProps {
  prescription: any;
  storeSettings?: any;
}

export function PrintablePrescription({
  prescription,
  storeSettings = {},
}: PrintablePrescriptionProps) {
  const handlePrint = () => {
    window.print();
  };

  const store = storeSettings || {
    store_name: "SATGURU VISION CARE",
    tagline: "Opticians, Optometrists & Contact Lens Specialists",
    address: "Delhi gate",
    city: "Aligarh",
    state: "Uttar Pradesh",
    pincode: "202001",
    mobile: "+91 98708 33033",
    email: "sukh4164@gmail.com",
    website: "satguruvisioncare.com",
  };

  return (
    <div className="space-y-4">
      {/* Print Trigger */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Official Eye Prescription Slip
          </span>
          <span className="text-sm font-bold text-navy-950 font-mono">
            {prescription.prescription_code}
          </span>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Eye Prescription (Rx)</span>
        </button>
      </div>

      {/* Prescription Document */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto print:border print:border-slate-300 print:rounded-2xl print:p-6 print:m-0 print:w-full print:max-w-none print:shadow-none">
        {/* Clinic Header */}
        <div className="pb-6 border-b-2 border-navy-950 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <div
                style={{ width: "48px", height: "48px" }}
                className="w-12 h-12 rounded-xl overflow-hidden shadow-sm bg-[#002942] border border-slate-200 shrink-0 p-0.5"
              >
                <img
                  src="/logo.png"
                  alt="Satguru Vision Care"
                  width={48}
                  height={48}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-navy-950 font-sans">
                  {store.store_name}
                </h1>
                <p className="text-xs font-bold text-brand-700 uppercase tracking-wide">
                  Opticians, Optometrists & Contact Lens Clinic
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {store.address}, {store.city} | <strong>Tel:</strong> {store.mobile} | <strong>Web:</strong> satguruvisioncare.com
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 border border-brand-200 font-bold text-xs uppercase tracking-wider rounded-md mb-1">
              EYE PRESCRIPTION (Rx)
            </span>
            <p className="text-xs font-mono font-bold text-navy-950">
              {prescription.prescription_code}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Date: {formatDate(prescription.prescription_date)}
            </p>
          </div>
        </div>

        {/* Patient Details */}
        <div className="grid grid-cols-3 gap-4 py-4 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block">Patient Name:</span>
            <span className="text-sm font-bold text-navy-950">
              {prescription.customer_name}
            </span>
            <span className="block text-slate-500 font-mono text-[11px]">
              ID: {prescription.customer_code}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Age / Gender:</span>
            <span className="font-bold text-navy-950">
              {prescription.customer_age ? `${prescription.customer_age} Yrs` : "—"} /{" "}
              {prescription.customer_gender || "—"}
            </span>
            <span className="block text-slate-500 text-[11px]">
              Mobile: {prescription.customer_mobile}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-semibold block">Examined By:</span>
            <span className="font-bold text-navy-950">
              {prescription.doctor_name || prescription.creator_name || "Optometrist"}
            </span>
            <span className="block text-brand-700 font-medium text-[11px]">
              Type: {prescription.prescription_type || "Distance"}
            </span>
          </div>
        </div>

        {/* Optical Power Grid */}
        <div className="py-6 space-y-4">
          <table className="w-full text-center border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-navy-950 text-white font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 border border-slate-400">Eye</th>
                <th className="py-2.5 px-3 border border-slate-400">Sphere (SPH)</th>
                <th className="py-2.5 px-3 border border-slate-400">Cylinder (CYL)</th>
                <th className="py-2.5 px-3 border border-slate-400">Axis (°)</th>
                <th className="py-2.5 px-3 border border-slate-400">Near Add (ADD)</th>
                <th className="py-2.5 px-3 border border-slate-400">P.D. (mm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-medium text-sm">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-bold text-navy-950 bg-slate-100 border border-slate-300">
                  OD (Right Eye)
                </td>
                <td className="py-3 px-3 font-mono font-bold text-navy-900 border border-slate-300">
                  {prescription.od_sph}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-navy-900 border border-slate-300">
                  {prescription.od_cyl}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-navy-900 border border-slate-300">
                  {prescription.od_axis ? `${prescription.od_axis}°` : "0°"}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-brand-700 border border-slate-300">
                  {prescription.od_add}
                </td>
                <td className="py-3 px-3 font-mono border border-slate-300">
                  {prescription.od_pd}
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-bold text-navy-950 bg-slate-100 border border-slate-300">
                  OS (Left Eye)
                </td>
                <td className="py-3 px-3 font-mono font-bold text-navy-900 border border-slate-300">
                  {prescription.os_sph}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-navy-900 border border-slate-300">
                  {prescription.os_cyl}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-navy-900 border border-slate-300">
                  {prescription.os_axis ? `${prescription.os_axis}°` : "0°"}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-brand-700 border border-slate-300">
                  {prescription.os_add}
                </td>
                <td className="py-3 px-3 font-mono border border-slate-300">
                  {prescription.os_pd}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Pupillary Distance Note */}
          <div className="flex items-center justify-between text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <span>
              <strong>Pupillary Distance (PD):</strong> {prescription.pd_type || "Dual"} PD
              {prescription.single_pd ? ` (Total: ${prescription.single_pd} mm)` : ""}
            </span>
            {prescription.next_checkup_date && (
              <span className="text-brand-800 font-semibold">
                Recommended Next Eye Examination: {formatDate(prescription.next_checkup_date)}
              </span>
            )}
          </div>

          {/* Clinical Advice & Notes */}
          {prescription.notes && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="font-bold text-navy-950 uppercase tracking-wide block">
                Optometrist Remarks & Lens Recommendations:
              </span>
              <p className="text-slate-700">{prescription.notes}</p>
            </div>
          )}
        </div>

        {/* Doctor Signature Line */}
        <div className="flex justify-between items-end pt-12 mt-4 border-t border-slate-200 text-xs">
          <div className="text-slate-400">
            <p>Satguru Vision Care Optical Record</p>
            <p className="text-[10px]">Verified against digital refractor examination</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-navy-950">
              {prescription.doctor_name || "Optometrist"}
            </p>
            <p className="text-slate-400 mt-8">Optometrist Signature & Seal</p>
          </div>
        </div>
      </div>
    </div>
  );
}

