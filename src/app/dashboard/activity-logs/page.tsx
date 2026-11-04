"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  User,
  Clock,
  Shield,
  Activity,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `/api/activity-logs?limit=150`;
      if (actionFilter) url += `&action=${encodeURIComponent(actionFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const actionsList = [
    "Staff Login",
    "Staff Logout",
    "Customer Added",
    "Customer Updated",
    "Prescription Created",
    "Order Created",
    "Order Status Updated",
    "Payment Received",
    "Product Added",
    "Stock Adjusted",
    "User Created",
    "Permissions Updated",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <History className="w-6 h-6 text-brand-600" />
            Audit Trail & Activity Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all user logins, customer registrations, power examinations, and orders
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter by Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-navy-950"
          >
            <option value="">All Store Actions</option>
            {actionsList.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-400">
          Total Logged Events: {logs.length}
        </span>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">User / Staff</th>
                <th className="py-3.5 px-4">Action Taken</th>
                <th className="py-3.5 px-4">Module / Entity</th>
                <th className="py-3.5 px-4">Record Ref</th>
                <th className="py-3.5 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading activity trail...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-navy-950">No activity events recorded yet</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {formatDate(log.created_at, true)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy-950">
                      {log.user_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-800 border border-brand-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 uppercase text-[10px] font-semibold">
                      {log.entity_type}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                      {log.entity_id || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-md">
                      {log.details || "—"}
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

