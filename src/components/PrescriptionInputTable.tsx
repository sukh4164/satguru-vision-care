"use client";

import React from "react";
import {
  SPH_OPTIONS,
  SPH_MINUS_OPTIONS,
  SPH_PLUS_OPTIONS,
  CYL_OPTIONS,
  CYL_MINUS_OPTIONS,
  CYL_PLUS_OPTIONS,
  AXIS_OPTIONS,
  ADD_OPTIONS,
  DUAL_PD_OPTIONS,
  SINGLE_PD_OPTIONS,
} from "@/lib/constants";

export interface PrescriptionFormData {
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

  pd_type: "Single" | "Dual";
  single_pd: string;
}

interface Props {
  data: PrescriptionFormData;
  onChange: (updated: PrescriptionFormData) => void;
  disabled?: boolean;
}

export function PrescriptionInputTable({ data, onChange, disabled = false }: Props) {
  const updateField = (field: keyof PrescriptionFormData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
            Enter Your Prescription Manually
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Right Eye (OD - Oculus Dexter) & Left Eye (OS - Oculus Sinister)
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
          Diopter Precision: 0.25 D
        </span>
      </div>

      {/* OD - Right Eye */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-navy-900 tracking-wide uppercase flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-xs font-bold rounded">OD</span>
            (Right Eye)
          </span>
          <span className="text-xs text-slate-400">Sphere, Cylinder, Axis & Near Add</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* SPH */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase">SPH (Sphere)</label>
            <select
              value={data.od_sph}
              disabled={disabled}
              onChange={(e) => updateField("od_sph", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              <option value="0.00">0.00</option>
              <option value="Plano">Plano</option>
              <optgroup label="── Minus (-) Sphere ──">
                {SPH_MINUS_OPTIONS.map((val) => (
                  <option key={`od-sph-${val}`} value={val}>
                    {val}
                  </option>
                ))}
              </optgroup>
              <optgroup label="── Plus (+) Sphere ──">
                {SPH_PLUS_OPTIONS.map((val) => (
                  <option key={`od-sph-${val}`} value={val}>
                    {val}
                  </option>
                ))}
              </optgroup>
              {!SPH_OPTIONS.includes(data.od_sph) && data.od_sph && (
                <option value={data.od_sph}>{data.od_sph}</option>
              )}
            </select>
          </div>

          {/* CYL */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase">CYL (Cylinder)</label>
            <select
              value={data.od_cyl}
              disabled={disabled}
              onChange={(e) => updateField("od_cyl", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              <option value="0.00">0.00</option>
              <optgroup label="── Minus (-) Cylinder ──">
                {CYL_MINUS_OPTIONS.map((val) => (
                  <option key={`od-cyl-${val}`} value={val}>
                    {val}
                  </option>
                ))}
              </optgroup>
              <optgroup label="── Plus (+) Cylinder ──">
                {CYL_PLUS_OPTIONS.map((val) => (
                  <option key={`od-cyl-${val}`} value={val}>
                    {val}
                  </option>
                ))}
              </optgroup>
              {!CYL_OPTIONS.includes(data.od_cyl) && data.od_cyl && (
                <option value={data.od_cyl}>{data.od_cyl}</option>
              )}
            </select>
          </div>

          {/* AXIS */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase">AXIS (°)</label>
            <select
              value={data.od_axis}
              disabled={disabled}
              onChange={(e) => updateField("od_axis", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              <option value="0">0° (None)</option>
              {AXIS_OPTIONS.map((val) => (
                <option key={`od-axis-${val}`} value={val}>
                  {val}°
                </option>
              ))}
            </select>
          </div>

          {/* ADD */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase">ADD (Near Add)</label>
            <select
              value={data.od_add}
              disabled={disabled}
              onChange={(e) => updateField("od_add", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              {ADD_OPTIONS.map((val) => (
                <option key={`od-add-${val}`} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* OS - Left Eye */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-navy-900 tracking-wide uppercase flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 text-xs font-bold rounded">OS</span>
            (Left Eye)
          </span>
          <span className="text-xs text-slate-400">Sphere, Cylinder, Axis & Near Add</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* SPH */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase">SPH (Sphere)</label>
            <select
              value={data.os_sph}
              disabled={disabled}
              onChange={(e) => updateField("os_sph", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              <option value="0.00">0.00</option>
              <option value="Plano">Plano</option>
              <optgroup label="── Minus (-) Sphere ──">
                {SPH_MINUS_OPTIONS.map((val) => (
                  <option key={`os-sph-${val}`} value={val}>
                    {val}
                  </option>
                ))}
              </optgroup>
              <optgroup label="── Plus (+) Sphere ──">
                {SPH_PLUS_OPTIONS.map((val) => (
                  <option key={`os-sph-${val}`} value={val}>
                    {val}
                  </option>
                ))}
              </optgroup>
              {!SPH_OPTIONS.includes(data.os_sph) && data.os_sph && (
                <option value={data.os_sph}>{data.os_sph}</option>
              )}
            </select>
          </div>

          {/* CYL */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase">CYL (Cylinder)</label>
            <select
              value={data.os_cyl}
              disabled={disabled}
              onChange={(e) => updateField("os_cyl", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              <option value="0.00">0.00</option>
              <optgroup label="── Minus (-) Cylinder ──">
                {CYL_MINUS_OPTIONS.map((val) => (
                  <option key={`os-cyl-${val}`} value={val}>
                    {val}
                  </option>
                ))}
              </optgroup>
              <optgroup label="── Plus (+) Cylinder ──">
                {CYL_PLUS_OPTIONS.map((val) => (
                  <option key={`os-cyl-${val}`} value={val}>
                    {val}
                  </option>
                ))}
              </optgroup>
              {!CYL_OPTIONS.includes(data.os_cyl) && data.os_cyl && (
                <option value={data.os_cyl}>{data.os_cyl}</option>
              )}
            </select>
          </div>

          {/* AXIS */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase">AXIS (°)</label>
            <select
              value={data.os_axis}
              disabled={disabled}
              onChange={(e) => updateField("os_axis", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              <option value="0">0° (None)</option>
              {AXIS_OPTIONS.map((val) => (
                <option key={`os-axis-${val}`} value={val}>
                  {val}°
                </option>
              ))}
            </select>
          </div>

          {/* ADD */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase">ADD (Near Add)</label>
            <select
              value={data.os_add}
              disabled={disabled}
              onChange={(e) => updateField("os_add", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              {ADD_OPTIONS.map((val) => (
                <option key={`os-add-${val}`} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pupillary Distance (PD) */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-bold text-navy-900 tracking-wide">
            Pupillary Distance (PD)
          </label>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="pd_type"
                value="Single"
                checked={data.pd_type === "Single"}
                disabled={disabled}
                onChange={() => updateField("pd_type", "Single")}
                className="text-brand-600 focus:ring-brand-500"
              />
              Single PD
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="pd_type"
                value="Dual"
                checked={data.pd_type === "Dual"}
                disabled={disabled}
                onChange={() => updateField("pd_type", "Dual")}
                className="text-brand-600 focus:ring-brand-500"
              />
              Dual PD (Recommended)
            </label>
          </div>
        </div>

        {data.pd_type === "Dual" ? (
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                RIGHT (mm)
              </label>
              <select
                value={data.od_pd}
                disabled={disabled}
                onChange={(e) => updateField("od_pd", e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              >
                {DUAL_PD_OPTIONS.map((val) => (
                  <option key={`pd-r-${val}`} value={val}>
                    {val} mm
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                LEFT (mm)
              </label>
              <select
                value={data.os_pd}
                disabled={disabled}
                onChange={(e) => updateField("os_pd", e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              >
                {DUAL_PD_OPTIONS.map((val) => (
                  <option key={`pd-l-${val}`} value={val}>
                    {val} mm
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="max-w-xs space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase">
              TOTAL PD (mm)
            </label>
            <select
              value={data.single_pd || "63.0"}
              disabled={disabled}
              onChange={(e) => updateField("single_pd", e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            >
              {SINGLE_PD_OPTIONS.map((val) => (
                <option key={`pd-single-${val}`} value={val}>
                  {val} mm
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

