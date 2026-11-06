"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { formatDate, calculateAge, formatCurrency } from "@/lib/utils";

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get("action");
  const initialSearch = searchParams.get("search") || "";

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [genderFilter, setGenderFilter] = useState("");

  // Edit Modal (for editing existing customer from table)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    email: "",
    dob: "",
    age: "",
    gender: "Male",
    address: "",
    city: "Mumbai",
    pincode: "",
    notes: "",
  });

  // Duplicate Warning State
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let url = `/api/customers?search=${encodeURIComponent(search)}`;
      if (genderFilter) url += `&gender=${encodeURIComponent(genderFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [genderFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      mobile: "",
      whatsapp: "",
      email: "",
      dob: "",
      age: "",
      gender: "Male",
      address: "",
      city: "Mumbai",
      pincode: "",
      notes: "",
    });
    setDuplicateWarning(null);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cust: any) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name || "",
      mobile: cust.mobile || "",
      whatsapp: cust.whatsapp || "",
      email: cust.email || "",
      dob: cust.dob || "",
      age: cust.age ? String(cust.age) : "",
      gender: cust.gender || "Male",
      address: cust.address || "",
      city: cust.city || "Mumbai",
      pincode: cust.pincode || "",
      notes: cust.notes || "",
    });
    setDuplicateWarning(null);
    setError(null);
    setModalOpen(true);
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const computedAge = calculateAge(val);
    setFormData({
      ...formData,
      dob: val,
      age: computedAge !== null ? String(computedAge) : formData.age,
    });
  };

  const handleSaveCustomer = async (force = false) => {
    setSaving(true);
    setError(null);

    try {
      if (editingCustomer) {
        // Update
        const res = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update customer");
      } else {
        // Create
        const res = await fetch(`/api/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, force }),
        });
        const data = await res.json();

        if (res.status === 409 && data.duplicateWarning) {
          setDuplicateWarning(data);
          setSaving(false);
          return;
        }

        if (!res.ok) throw new Error(data.error || "Failed to create customer");
      }

      setModalOpen(false);
      setDuplicateWarning(null);
      fetchCustomers();
    } catch (err: any) {
      setError(err.message || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete customer");
        return;
      }
      fetchCustomers();
    } catch (err: any) {
      alert("Error deleting customer");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Customer ID", "Name", "Mobile", "WhatsApp", "Email", "Age", "Gender", "City", "Registration Date", "Prescriptions", "Total Orders"];
    const rows = customers.map((c) => [
      c.customer_code,
      `"${c.name}"`,
      c.mobile,
      c.whatsapp || "",
      c.email || "",
      c.age || "",
      c.gender || "",
      c.city || "",
      c.registration_date,
      c.prescription_count || 0,
      c.order_count || 0,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `satguru_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Customer Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new patients, view lifetime prescription history and orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/dashboard/customers/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Customer</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, mobile, or ID..."
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
            <span>Gender:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-navy-950"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Total: {customers.length} records
          </span>
        </div>
      </div>

      {/* Customers Data Table (Inspired by User's Reference Image 2) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Mobile & WhatsApp</th>
                <th className="py-3.5 px-4">Age / Gender</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4 text-center">Rx Tests</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading customers...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-navy-950">No customers found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Try searching with a different term or register a new customer.</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                      <Link href={`/dashboard/customers/${c.id}`} className="hover:underline">
                        {c.customer_code}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link href={`/dashboard/customers/${c.id}`} className="font-bold text-navy-950 hover:text-brand-600 block">
                        {c.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Reg: {formatDate(c.registration_date)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.mobile}</span>
                      </div>
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/91${c.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-emerald-600 hover:underline mt-0.5"
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">
                        {c.age ? `${c.age} yrs` : "—"}
                      </span>{" "}
                      <span className="text-slate-400">({c.gender || "—"})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{c.city || "Mumbai"}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full font-bold text-xs bg-purple-50 text-purple-700 border border-purple-200">
                        {c.prescription_count || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200">
                        {c.order_count || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={c.total_balance > 0 ? "text-rose-600" : "text-emerald-700"}>
                        {formatCurrency(c.total_balance || 0)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/dashboard/customers/${c.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition"
                          title="View 360 Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-950 hover:bg-slate-100 transition"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(c.id, c.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-950 text-base">
                    {editingCustomer ? `Edit Customer: ${editingCustomer.name}` : "Register New Customer"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Auto-generates unique Customer ID & checks for duplicate phone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Duplicate phone warning box */}
            {duplicateWarning && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">
                    Duplicate Customer Record Detected!
                  </h4>
                </div>
                <p className="text-xs">
                  {duplicateWarning.message}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/dashboard/customers/${duplicateWarning.existingCustomer?.id}`}
                    className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100/50 transition"
                  >
                    Open Existing Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleSaveCustomer(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition"
                  >
                    Create Anyway (Force)
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rameshwar Patel"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Mobile Number (10 digits) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="9820012345"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="Leave empty to use mobile"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@email.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={handleDobChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Age (Auto)
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Flat/Shop, Building, Road name"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="400050"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Customer Clinical Notes / Preferences
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Prefers progressive lenses, computer eye strain complaints, frame size preferences"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveCustomer(false)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition shadow-md disabled:opacity-50"
              >
                {saving ? "Saving Customer..." : editingCustomer ? "Save Changes" : "Register Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

