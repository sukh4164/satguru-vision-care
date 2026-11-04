"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Plus,
  ShieldCheck,
  KeyRound,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Phone,
  Mail,
  Calendar,
  Lock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [status, setStatus] = useState("active");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [targetStaff, setTargetStaff] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (data.staff) {
        setStaff(data.staff);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setName("");
    setUsername("");
    setEmail("");
    setMobile("");
    setPassword("");
    setRole("staff");
    setStatus("active");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setEditingStaff(s);
    setName(s.name || "");
    setUsername(s.username || "");
    setEmail(s.email || "");
    setMobile(s.mobile || "");
    setPassword("");
    setRole(s.role_name || "staff");
    setStatus(s.status || "active");
    setError(null);
    setModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingStaff) {
        const res = await fetch(`/api/staff/${editingStaff.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            mobile,
            status,
            role,
            newPassword: password || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update staff member");
      } else {
        const res = await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            username,
            email,
            mobile,
            password,
            role,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create staff member");
      }

      setModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to save staff");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    try {
      const res = await fetch(`/api/staff/${targetStaff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error("Failed to reset password");
      alert(`Password for ${targetStaff.name} has been reset successfully.`);
      setResetModalOpen(false);
      setNewPassword("");
    } catch (err: any) {
      alert(err.message || "Failed");
    }
  };

  const handleToggleStatus = async (s: any) => {
    const nextStatus = s.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/staff/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchStaff();
    } catch {
      alert("Error updating status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-brand-600" />
            Staff & Employee Account Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin exclusive: Create employee credentials, assign store roles, and manage access
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Staff Member</span>
        </button>
      </div>

      {/* Staff Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Username & Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-center">Customers Added</th>
                <th className="py-3.5 px-4 text-center">Eye Tests Conducted</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Permissions</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading staff accounts...</p>
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                      {s.employee_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy-950">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{s.mobile || "—"}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-slate-800">@{s.username}</span>
                      <p className="text-[11px] text-slate-500">{s.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          s.role_name === "admin"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-sky-100 text-sky-800 border border-sky-300"
                        }`}
                      >
                        {s.role_name === "admin" ? "Shop Owner (Admin)" : "Optometrist Staff"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-navy-950">
                      {s.customers_added || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-purple-700">
                      {s.prescriptions_tested || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(s)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] transition ${
                          s.status === "active"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                        title="Click to toggle status"
                      >
                        {s.status === "active" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Disabled
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/dashboard/roles-permissions?staffId=${s.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition text-[11px]"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                        <span>Manage Matrix</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setTargetStaff(s);
                            setNewPassword("");
                            setResetModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-950 hover:bg-slate-100"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-950 hover:bg-slate-100"
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-navy-950 text-base">
                {editingStaff ? `Edit Staff: ${editingStaff.name}` : "Create Staff Account"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {!editingStaff && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Username (For Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rahul"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@satguruvisioncare.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9820022222"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  {editingStaff ? "New Password (Leave blank to keep current)" : "Password *"}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Assigned Store Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="staff">Staff (Employee / Optometrist)</option>
                  <option value="admin">Admin (Shop Owner - Full Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingStaff ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalOpen && targetStaff && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-navy-950 text-sm">
              Reset Password for {targetStaff.name}
            </h3>
            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  New Password (Min 6 chars) *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 text-white rounded-xl font-bold hover:bg-navy-800 transition"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

