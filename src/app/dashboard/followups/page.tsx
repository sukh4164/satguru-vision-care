"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  AlertTriangle,
  User,
  X,
} from "lucide-react";
import { formatDate, formatWhatsAppUrl } from "@/lib/utils";

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [typeFilter, setTypeFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [followupType, setFollowupType] = useState("Eye Checkup");
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [priority, setPriority] = useState("Medium");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      let url = `/api/followups?status=${encodeURIComponent(statusFilter)}`;
      if (typeFilter) url += `&type=${encodeURIComponent(typeFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.followups) {
        setFollowups(data.followups);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetch("/api/customers?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.customers) setCustomers(d.customers);
      });
  }, []);

  const handleMarkComplete = async (id: number) => {
    try {
      const res = await fetch(`/api/followups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });
      if (res.ok) fetchFollowups();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert("Please select a customer");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: parseInt(selectedCustomerId),
          type: followupType,
          scheduled_date: scheduledDate,
          priority,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setModalOpen(false);
      setNotes("");
      fetchFollowups();
    } catch (err: any) {
      alert(err.message || "Failed to schedule reminder");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-brand-600" />
            Customer Follow-ups & Eye Recalls
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Annual vision tests, spectacle delivery pickups, and balance reminders
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Reminder</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["Pending", "Completed", "All"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? "bg-navy-950 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st} Reminders
            </button>
          ))}
        </div>

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
              <option value="Eye Checkup">Annual Eye Checkup</option>
              <option value="Delivery Ready">Delivery Pickup</option>
              <option value="Pending Payment">Pending Payment</option>
              <option value="Prescription Follow-up">Progressive Adaptation</option>
            </select>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Total: {followups.length}
          </span>
        </div>
      </div>

      {/* Followups Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-400">
            <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs">Loading follow-ups...</p>
          </div>
        ) : followups.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 p-8">
            <CalendarClock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-navy-950 text-sm">No follow-ups in this view</h3>
            <p className="text-xs text-slate-500 mt-0.5">All scheduled customer recalls are completed!</p>
          </div>
        ) : (
          followups.map((f) => {
            const isCompleted = f.status === "Completed";
            const waMsg = `Hello ${f.customer_name},\nThis is a friendly reminder from *SATGURU VISION CARE* regarding: *${f.type}*.\n\n${f.notes || "We look forward to welcoming you to the store."}\n\nFor any queries, contact us at +91 98708 33033.`;
            const waLink = formatWhatsAppUrl(f.customer_whatsapp || f.customer_mobile, waMsg);

            return (
              <div
                key={f.id}
                className={`bg-white rounded-2xl p-5 border shadow-xs space-y-3 transition ${
                  isCompleted ? "border-slate-200 opacity-75" : "border-slate-200 hover:border-brand-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      f.type === "Delivery Ready"
                        ? "bg-cyan-100 text-cyan-800"
                        : f.type === "Eye Checkup"
                        ? "bg-purple-100 text-purple-800"
                        : f.type === "Pending Payment"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {f.type}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Due: {formatDate(f.scheduled_date)}
                  </span>
                </div>

                <div>
                  <Link
                    href={`/dashboard/customers/${f.customer_id}`}
                    className="font-bold text-sm text-navy-950 hover:text-brand-600 block"
                  >
                    {f.customer_name}
                  </Link>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{f.customer_mobile}</p>
                </div>

                {f.notes && (
                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {f.notes}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {!isCompleted ? (
                    <button
                      onClick={() => handleMarkComplete(f.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-navy-900 text-white font-bold hover:bg-navy-800 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Done
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Reminder Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-navy-950 text-sm">Schedule Customer Follow-up</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Select Customer *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.mobile})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Reminder Type *
                </label>
                <select
                  value={followupType}
                  onChange={(e) => setFollowupType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Eye Checkup">Annual / 6-Month Eye Checkup</option>
                  <option value="Delivery Ready">Spectacles Ready for Delivery</option>
                  <option value="Pending Payment">Pending Balance Collection</option>
                  <option value="Prescription Follow-up">Progressive Lens Adaptation Review</option>
                  <option value="General Feedback">Customer Experience Feedback</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Notes / Recall Instructions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call customer to check if vision is comfortable with progressive lenses"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                  {saving ? "Scheduling..." : "Schedule Reminder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

