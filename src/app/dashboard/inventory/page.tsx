"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Glasses,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Edit,
  Trash2,
  X,
  Package,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export default function InventoryPage() {
  const searchParams = useSearchParams();
  const lowStockParam = searchParams.get("lowStock") === "true";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(lowStockParam);
  const [summary, setSummary] = useState({ total: 0, lowStock: 0 });

  // Add/Edit Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category_name: "Spectacle Frames",
    model_number: "",
    sku: "",
    purchase_price: "",
    selling_price: "",
    stock_quantity: "10",
    min_stock_alert: "5",
    description: "",
  });

  // Stock In / Out Modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<any | null>(null);
  const [stockType, setStockType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [stockQty, setStockQty] = useState("1");
  const [stockNotes, setStockNotes] = useState("");
  const [stockRef, setStockRef] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?search=${encodeURIComponent(search)}`;
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (lowStockOnly) url += `&lowStock=true`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, lowStockOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      brand: "",
      category_name: "Spectacle Frames",
      model_number: "",
      sku: "",
      purchase_price: "",
      selling_price: "",
      stock_quantity: "10",
      min_stock_alert: "5",
      description: "",
    });
    setError(null);
    setProductModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || "",
      brand: p.brand || "",
      category_name: p.category_name || "Spectacle Frames",
      model_number: p.model_number || "",
      sku: p.sku || "",
      purchase_price: p.purchase_price ? String(p.purchase_price) : "",
      selling_price: p.selling_price ? String(p.selling_price) : "",
      stock_quantity: String(p.stock_quantity),
      min_stock_alert: String(p.min_stock_alert),
      description: p.description || "",
    });
    setError(null);
    setProductModalOpen(true);
  };

  const openStockModal = (p: any, type: "IN" | "OUT" | "ADJUSTMENT") => {
    setStockProduct(p);
    setStockType(type);
    setStockQty("5");
    setStockNotes(type === "IN" ? "Supplier purchase batch restock" : "Counter retail dispatch or defect");
    setStockRef("");
    setStockModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update product");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create product");
      }

      setProductModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/products/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: stockProduct.id,
          transaction_type: stockType,
          quantity: parseInt(stockQty),
          notes: stockNotes,
          reference_id: stockRef,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Stock update failed");

      setStockModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Error updating stock");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove product "${name}" from active catalogue?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to delete");
      fetchProducts();
    } catch {
      alert("Error deleting product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-navy-950 font-sans flex items-center gap-2">
            <Glasses className="w-6 h-6 text-brand-600" />
            Product & Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage frames, single vision, bifocal and progressive lenses, sunglasses & accessories
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, brand, SKU, model..."
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

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-navy-950"
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="flex items-center gap-1 text-rose-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock Only ({summary.lowStock})
            </span>
          </label>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                <th className="py-3.5 px-4">Product Code</th>
                <th className="py-3.5 px-4">Item & Brand</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Model / SKU</th>
                <th className="py-3.5 px-4 text-right">Purchase Price</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-center">In Stock</th>
                <th className="py-3.5 px-4 text-center">Stock Action</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <span className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading inventory...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-navy-950">No products found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Try resetting filters or adding new items.</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.stock_quantity <= p.min_stock_alert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                        {p.product_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-navy-950">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.brand || "Generic"}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {p.category_name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {p.model_number || p.sku || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {formatCurrency(p.purchase_price)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-navy-950">
                        {formatCurrency(p.selling_price)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                            isLow
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {p.stock_quantity}
                        </span>
                        {isLow && (
                          <span className="block text-[9px] text-rose-600 font-bold uppercase mt-0.5">
                            Low Stock!
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openStockModal(p, "IN")}
                            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100 transition text-[11px] flex items-center gap-1"
                            title="Stock In (Add pieces from supplier)"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            <span>Stock In</span>
                          </button>
                          <button
                            onClick={() => openStockModal(p, "OUT")}
                            className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold hover:bg-rose-100 transition text-[11px] flex items-center gap-1"
                            title="Stock Out (Remove pieces)"
                          >
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                            <span>Out</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-navy-950 hover:bg-slate-100 transition"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-navy-950 text-base">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Eyewear / Stock Item"}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Product / Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ray-Ban Clubmaster Classic"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Ray-Ban, Essilor, Titan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Model Number
                  </label>
                  <input
                    type="text"
                    value={formData.model_number}
                    onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                    placeholder="e.g. RB5154-2000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    SKU Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Auto-generated if blank"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Selling Price (MRP ₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {!editingProduct && (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Initial Quantity in Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      placeholder="10"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    value={formData.min_stock_alert}
                    onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                    placeholder="5"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Description & Specifications
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Pure titanium frame, featherlight flexible temples, anti-blue coating."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In / Out Modal */}
      {stockModalOpen && stockProduct && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-navy-950 text-sm">
                  {stockType === "IN" ? "Stock In (Restock)" : stockType === "OUT" ? "Stock Out" : "Stock Adjustment"}
                </h3>
                <p className="text-xs text-slate-500">{stockProduct.name}</p>
              </div>
              <button
                onClick={() => setStockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockUpdate} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-600">Current Stock:</span>
                <span className="font-bold text-sm text-navy-950 font-mono">
                  {stockProduct.stock_quantity} units
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Quantity ({stockType === "IN" ? "+ Add" : "- Deduct"}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Reference (PO / Invoice / Defect Tag)
                </label>
                <input
                  type="text"
                  value={stockRef}
                  onChange={(e) => setStockRef(e.target.value)}
                  placeholder="e.g. PO-8829 or Supplier Bill"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Notes / Reason
                </label>
                <input
                  type="text"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  placeholder="Reason for adjustment"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-navy-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-4 py-2 rounded-xl text-white font-bold transition disabled:opacity-50 ${
                    stockType === "IN" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                  }`}
                >
                  {saving ? "Updating..." : "Confirm Stock Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

