"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Search,
  Plus,
  Filter,
  Printer,
  TrendingUp,
  FileText,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PRESCRIPTION_TYPES } from "@/lib/constants";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      let url = `/api/prescriptions?search=${encodeURIComponent(search)}`;
      if (typeFilter) url += `&type=${encodeURIComponent(typeFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.prescriptions) {
        setPrescriptions(data.prescriptions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrescriptions();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <Eye className="w-6 h-6 text-brand-600" />
            Eye Prescription Records & History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database of OD (Right Eye) and OS (Left Eye) refraction measurements
          </p>
        </div>

        <Link
          href="/dashboard/prescriptions/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Enter New Prescription</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, mobile, or Rx code..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-navy-950 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-navy-950"
            >
              <option value="">All Types</option>
              {PRESCRIPTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Total: {prescriptions.length} prescriptions
          </span>
        </div>
      </div>

      {/* Prescription Cards Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 px-4">Rx Code</th>
                <th className="py-3.5 px-4">Patient / Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">OD (Right Eye Power)</th>
                <th className="py-3.5 px-4">OS (Left Eye Power)</th>
                <th className="py-3.5 px-4 text-center">PD</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading eye test records...</p>
                  </td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Eye className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-navy-950">No prescriptions found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Try searching with a different keyword or enter a new prescription.</p>
                  </td>
                </tr>
              ) : (
                prescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-600">
                      <Link href={`/dashboard/prescriptions/${rx.id}`} className="hover:underline">
                        {rx.prescription_code}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/customers/${rx.customer_id}`}
                        className="font-bold text-navy-950 hover:text-brand-600 block"
                      >
                        {rx.customer_name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rx.customer_mobile}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {formatDate(rx.prescription_date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block font-semibold">
                        <span className="text-blue-700">SPH:</span> {rx.od_sph}{" "}
                        <span className="text-slate-400">|</span> <span className="text-indigo-700">CYL:</span> {rx.od_cyl}{" "}
                        {rx.od_axis ? `@ ${rx.od_axis}°` : ""}{" "}
                        {rx.od_add !== "0.00" && (
                          <span className="text-brand-600 font-bold block text-[11px]">
                            ADD: {rx.od_add}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block font-semibold">
                        <span className="text-blue-700">SPH:</span> {rx.os_sph}{" "}
                        <span className="text-slate-400">|</span> <span className="text-indigo-700">CYL:</span> {rx.os_cyl}{" "}
                        {rx.os_axis ? `@ ${rx.os_axis}°` : ""}{" "}
                        {rx.os_add !== "0.00" && (
                          <span className="text-brand-600 font-bold block text-[11px]">
                            ADD: {rx.os_add}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                      {rx.pd_type === "Dual" ? `${rx.od_pd}/${rx.os_pd}` : rx.single_pd || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {rx.prescription_type || "Distance"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/dashboard/prescriptions/${rx.id}`}
                          className="px-2.5 py-1 rounded-lg bg-navy-950 text-white font-bold hover:bg-navy-800 transition text-[11px]"
                        >
                          View & Print
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

