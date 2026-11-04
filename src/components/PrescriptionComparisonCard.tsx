import React from "react";
import { formatDate } from "@/lib/utils";
import { Eye, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";

interface PrescriptionRecord {
  id: number;
  prescription_code: string;
  prescription_date: string;
  next_checkup_date?: string;
  doctor_name?: string;
  prescription_type?: string;
  od_sph: string;
  od_cyl: string;
  od_axis: string;
  od_add: string;
  od_pd: string;
  os_sph: string;
  os_cyl: string;
  os_axis: string;
  os_add: string;
  os_pd: string;
  pd_type?: string;
  single_pd?: string;
  notes?: string;
}

export function PrescriptionComparisonCard({
  latest,
  previous,
}: {
  latest: PrescriptionRecord;
  previous?: PrescriptionRecord | null;
}) {
  const isChanged = (prevVal?: string, currVal?: string) => {
    if (!prevVal || !currVal) return false;
    return prevVal.trim() !== currVal.trim();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-950 to-navy-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-wide text-white">
              Eye Power History & Evolution
            </h4>
            <p className="text-xs text-slate-300">
              {previous
                ? `Comparing Latest (${formatDate(latest.prescription_date)}) with Previous (${formatDate(previous.prescription_date)})`
                : `Active Prescription (${formatDate(latest.prescription_date)}) - Initial Baseline`}
            </p>
          </div>
        </div>
        {previous && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30">
            <TrendingUp className="w-3.5 h-3.5" />
            Comparative Clinical Audit
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LATEST PRESCRIPTION */}
          <div className="rounded-xl border-2 border-brand-500/40 bg-brand-50/20 p-5 relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-navy-950 text-sm">
                  Latest Prescription
                </span>
                <span className="text-xs font-mono bg-brand-100 text-brand-800 px-2 py-0.5 rounded font-semibold">
                  {latest.prescription_code}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-600">
                {formatDate(latest.prescription_date)}
              </span>
            </div>

            <div className="space-y-4">
              {/* OD (Right Eye) */}
              <div>
                <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-1.5">
                  OD (Right Eye)
                </span>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">SPH</span>
                    <span className="text-sm font-bold text-navy-950">{latest.od_sph}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">CYL</span>
                    <span className="text-sm font-bold text-navy-950">{latest.od_cyl}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">AXIS</span>
                    <span className="text-sm font-bold text-navy-950">{latest.od_axis}°</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">ADD</span>
                    <span className="text-sm font-bold text-brand-600">{latest.od_add}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">PD</span>
                    <span className="text-sm font-bold text-navy-950">{latest.od_pd}</span>
                  </div>
                </div>
              </div>

              {/* OS (Left Eye) */}
              <div>
                <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-1.5">
                  OS (Left Eye)
                </span>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">SPH</span>
                    <span className="text-sm font-bold text-navy-950">{latest.os_sph}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">CYL</span>
                    <span className="text-sm font-bold text-navy-950">{latest.os_cyl}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">AXIS</span>
                    <span className="text-sm font-bold text-navy-950">{latest.os_axis}°</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">ADD</span>
                    <span className="text-sm font-bold text-brand-600">{latest.os_add}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">PD</span>
                    <span className="text-sm font-bold text-navy-950">{latest.os_pd}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-200">
                <span><strong>Type:</strong> {latest.prescription_type || "Standard"}</span>
                <span><strong>Doctor:</strong> {latest.doctor_name || "Optometrist"}</span>
              </div>
            </div>
          </div>

          {/* PREVIOUS PRESCRIPTION */}
          {previous ? (
            <div className="rounded-xl border border-slate-300 bg-slate-50/60 p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="font-bold text-slate-700 text-sm">
                    Previous Prescription
                  </span>
                  <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    {previous.prescription_code}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {formatDate(previous.prescription_date)}
                </span>
              </div>

              <div className="space-y-4">
                {/* OD */}
                <div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    OD (Right Eye)
                  </span>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className={`border rounded-lg p-2 ${isChanged(previous.od_sph, latest.od_sph) ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold" : "bg-white border-slate-200"}`}>
                      <span className="block text-[10px] text-slate-400 uppercase">SPH</span>
                      <span className="text-sm">{previous.od_sph}</span>
                    </div>
                    <div className={`border rounded-lg p-2 ${isChanged(previous.od_cyl, latest.od_cyl) ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold" : "bg-white border-slate-200"}`}>
                      <span className="block text-[10px] text-slate-400 uppercase">CYL</span>
                      <span className="text-sm">{previous.od_cyl}</span>
                    </div>
                    <div className={`border rounded-lg p-2 ${isChanged(previous.od_axis, latest.od_axis) ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold" : "bg-white border-slate-200"}`}>
                      <span className="block text-[10px] text-slate-400 uppercase">AXIS</span>
                      <span className="text-sm">{previous.od_axis}°</span>
                    </div>
                    <div className={`border rounded-lg p-2 ${isChanged(previous.od_add, latest.od_add) ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold" : "bg-white border-slate-200"}`}>
                      <span className="block text-[10px] text-slate-400 uppercase">ADD</span>
                      <span className="text-sm">{previous.od_add}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2">
                      <span className="block text-[10px] text-slate-400 uppercase">PD</span>
                      <span className="text-sm">{previous.od_pd}</span>
                    </div>
                  </div>
                </div>

                {/* OS */}
                <div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    OS (Left Eye)
                  </span>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className={`border rounded-lg p-2 ${isChanged(previous.os_sph, latest.os_sph) ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold" : "bg-white border-slate-200"}`}>
                      <span className="block text-[10px] text-slate-400 uppercase">SPH</span>
                      <span className="text-sm">{previous.os_sph}</span>
                    </div>
                    <div className={`border rounded-lg p-2 ${isChanged(previous.os_cyl, latest.os_cyl) ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold" : "bg-white border-slate-200"}`}>
                      <span className="block text-[10px] text-slate-400 uppercase">CYL</span>
                      <span className="text-sm">{previous.os_cyl}</span>
                    </div>
                    <div className={`border rounded-lg p-2 ${isChanged(previous.os_axis, latest.os_axis) ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold" : "bg-white border-slate-200"}`}>
                      <span className="block text-[10px] text-slate-400 uppercase">AXIS</span>
                      <span className="text-sm">{previous.os_axis}°</span>
                    </div>
                    <div className={`border rounded-lg p-2 ${isChanged(previous.os_add, latest.os_add) ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold" : "bg-white border-slate-200"}`}>
                      <span className="block text-[10px] text-slate-400 uppercase">ADD</span>
                      <span className="text-sm">{previous.os_add}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2">
                      <span className="block text-[10px] text-slate-400 uppercase">PD</span>
                      <span className="text-sm">{previous.os_pd}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-200">
                  <span><strong>Type:</strong> {previous.prescription_type || "Standard"}</span>
                  <span className="text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded text-[11px] font-medium">
                    Yellow highlighted cells indicate power changes
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-10 h-10 text-brand-400 mb-2" />
              <h5 className="font-bold text-navy-950 text-sm">Initial Baseline Record</h5>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                This is the customer's first recorded prescription at Satguru Vision Care. Future test visits will automatically compare power shifts against this baseline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

