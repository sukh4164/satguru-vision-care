"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  User,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  X,
  Lock,
} from "lucide-react";

export default function RolesPermissionsPage() {
  const searchParams = useSearchParams();
  const initialStaffId = searchParams.get("staffId");

  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(initialStaffId || "");
  const [permissions, setPermissions] = useState<any[]>([]);
  const [targetUser, setTargetUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load staff list
  useEffect(() => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((data) => {
        if (data.staff) {
          // Filter to staff members
          setStaffList(data.staff);
          if (!selectedStaffId && data.staff.length > 1) {
            // Pick first non-admin staff member by default
            const firstStaff = data.staff.find((s: any) => s.role_name === "staff") || data.staff[0];
            setSelectedStaffId(String(firstStaff.id));
          }
        }
      });
  }, []);

  // Fetch permissions for selected staff member
  useEffect(() => {
    if (!selectedStaffId) return;
    setLoading(true);
    setSaveSuccess(false);

    fetch(`/api/staff/${selectedStaffId}/permissions`)
      .then((r) => r.json())
      .then((data) => {
        if (data.permissions) {
          setPermissions(data.permissions);
          setTargetUser(data.targetUser);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedStaffId]);

  const togglePermission = (code: string) => {
    if (targetUser?.role_name === "admin") return; // Admin has locked universal access
    setPermissions(
      permissions.map((p) => {
        if (p.code === code) {
          return { ...p, granted: !p.granted };
        }
        return p;
      })
    );
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/${selectedStaffId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissions: permissions.map((p) => ({ code: p.code, granted: p.granted })),
        }),
      });
      if (!res.ok) throw new Error("Failed to save permissions");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Error saving permissions");
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by category
  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-600" />
            Dynamic Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin can individually toggle and enforce backend permissions for each optical employee
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || targetUser?.role_name === "admin"}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-md disabled:opacity-50"
        >
          {saving ? (
            <span>Saving Matrix...</span>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Permissions Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Staff Permissions</span>
            </>
          )}
        </button>
      </div>

      {/* Staff Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Configuring Permissions For:
          </span>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role_name === "admin" ? "Shop Owner" : "Staff"}) - {s.employee_id}
              </option>
            ))}
          </select>
        </div>

        {targetUser && (
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] ${
                targetUser.role_name === "admin"
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-sky-100 text-sky-800 border border-sky-300"
              }`}
            >
              Role: {targetUser.role_name}
            </span>
            {targetUser.role_name === "admin" && (
              <span className="text-amber-800 font-semibold flex items-center gap-1 text-[11px]">
                <Lock className="w-3.5 h-3.5" />
                Admin has complete universal access
              </span>
            )}
          </div>
        )}
      </div>

      {/* Permission Categories Matrix */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs">Loading permission matrix...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const catPerms = permissions.filter((p) => p.category === cat);
            const isAllGranted = catPerms.every((p) => p.granted);

            return (
              <div
                key={cat}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-navy-950 text-sm tracking-wide">
                      {cat} Permissions
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Enforced on backend API routes & database operations
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {catPerms.filter((p) => p.granted).length} / {catPerms.length} Enabled
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catPerms.map((p) => (
                    <div
                      key={p.code}
                      onClick={() => togglePermission(p.code)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex items-start gap-3 select-none ${
                        p.granted
                          ? "bg-brand-50/40 border-brand-300 shadow-xs"
                          : "bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={p.granted}
                        readOnly
                        className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-navy-950">{p.name}</span>
                          {p.isCustomOverride && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              Custom Override
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                          code: {p.code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

