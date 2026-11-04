"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  UserPlus,
  FileText,
  ShoppingBag,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Menu,
} from "lucide-react";

interface HeaderProps {
  user: {
    id: number;
    name: string;
    username: string;
    role: "admin" | "staff";
    employee_id: string;
  } | null;
  onMobileMenuToggle?: () => void;
}

export function Header({ user, onMobileMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch quick alerts (low stock & pending followups)
    const fetchAlerts = async () => {
      try {
        const [followupRes, productRes] = await Promise.all([
          fetch("/api/followups?status=Pending"),
          fetch("/api/products?lowStock=true"),
        ]);
        const followupsData = await followupRes.json();
        const productsData = await productRes.json();

        const items: any[] = [];
        if (followupsData.followups) {
          followupsData.followups.slice(0, 3).forEach((f: any) => {
            items.push({
              id: `f-${f.id}`,
              type: "followup",
              title: `${f.type}: ${f.customer_name}`,
              desc: f.notes || `Scheduled for ${f.scheduled_date}`,
              date: f.scheduled_date,
              link: "/dashboard/followups",
            });
          });
        }
        if (productsData.products) {
          productsData.products.slice(0, 3).forEach((p: any) => {
            items.push({
              id: `p-${p.id}`,
              type: "low_stock",
              title: `Low Stock: ${p.name}`,
              desc: `Only ${p.stock_quantity} left in stock (Min: ${p.min_stock_alert})`,
              link: "/dashboard/inventory",
            });
          });
        }
        setNotifications(items);
      } catch (e) {
        // quiet fallback
      }
    };
    fetchAlerts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/dashboard/customers?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer by name, mobile number, or ID (Press Enter)..."
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs lg:text-sm text-navy-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </form>
        </div>

        {/* Right Actions & Status Badges */}
        <div className="flex items-center gap-2.5 lg:gap-4 shrink-0">
          {/* Cloud Synced Ledger Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database Ledger Cloud Synced</span>
          </div>

          {/* Quick Action Button: New Customer */}
          <Link
            href="/dashboard/customers?action=new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Customer</span>
          </Link>

          {/* Quick Action Button: Add Prescription */}
          <Link
            href="/dashboard/prescriptions/new"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Prescription</span>
          </Link>

          {/* Quick Action Button: New Order */}
          <Link
            href="/dashboard/orders/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-sky-100 text-brand-900 hover:bg-sky-200 transition border border-sky-200"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-brand-700" />
            <span className="hidden sm:inline">New Order</span>
          </Link>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-navy-950 hover:bg-slate-100 transition"
              title="Notifications and reminders"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-navy-950">
                    Store Notifications ({notifications.length})
                  </h4>
                  <span className="text-[10px] font-medium text-slate-400">Live Alerts</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.link}
                        onClick={() => setNotificationsOpen(false)}
                        className="block px-4 py-2.5 hover:bg-slate-50 transition text-left"
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === "low_stock" ? (
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-navy-950">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No urgent alerts right now!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

