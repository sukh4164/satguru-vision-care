"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  Users,
  Eye,
  Glasses,
  ShoppingBag,
  Receipt,
  CreditCard,
  CalendarClock,
  BarChart3,
  UserCheck,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

interface SidebarProps {
  user: {
    id: number;
    name: string;
    username: string;
    role: "admin" | "staff";
    employee_id: string;
    permissions?: string[];
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const hasPerm = (code: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.permissions?.includes(code);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  // Build navigation items based on role & permissions
  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: "Customers",
      href: "/dashboard/customers",
      icon: Users,
      show: hasPerm("customers.view"),
    },
    {
      label: "Eye Prescriptions",
      href: "/dashboard/prescriptions",
      icon: Eye,
      show: hasPerm("prescriptions.view"),
      badge: "Core",
    },
    {
      label: "Products & Stock",
      href: "/dashboard/inventory",
      icon: Glasses,
      show: hasPerm("inventory.view"),
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingBag,
      show: hasPerm("orders.view"),
    },
    {
      label: "Billing & Invoices",
      href: "/dashboard/billing",
      icon: Receipt,
      show: hasPerm("billing.view"),
    },
    {
      label: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
      show: hasPerm("billing.record_payment"),
    },
    {
      label: "Follow-ups & Recalls",
      href: "/dashboard/followups",
      icon: CalendarClock,
      show: true,
    },
    {
      label: "Reports & Analytics",
      href: "/dashboard/reports",
      icon: BarChart3,
      show: user?.role === "admin" || hasPerm("reports.daily") || hasPerm("admin.revenue"),
    },
    // Admin only sections
    {
      label: "Staff Management",
      href: "/dashboard/staff",
      icon: UserCheck,
      show: user?.role === "admin",
      adminOnly: true,
    },
    {
      label: "Roles & Permissions",
      href: "/dashboard/roles-permissions",
      icon: ShieldCheck,
      show: user?.role === "admin",
      adminOnly: true,
    },
    {
      label: user?.role === "admin" ? "Activity Logs" : "My Activities",
      href: "/dashboard/activity-logs",
      icon: History,
      show: true,
    },
    {
      label: "Store Settings",
      href: "/dashboard/settings",
      icon: Settings,
      show: user?.role === "admin",
      adminOnly: true,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-navy-950 text-slate-300 transition-all duration-300 z-30 shrink-0 border-r border-navy-900 print:hidden ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-navy-900">
        <Link href="/dashboard" className="flex items-center overflow-hidden">
          <Logo collapsed={collapsed} inverted />
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-white transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs lg:text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold"
                    : "text-slate-300 hover:bg-navy-900 hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-sky-300"
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 flex items-center justify-between">
                    {item.label}
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300 uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
      </nav>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-navy-900 space-y-2">
        <div
          className={`flex items-center gap-3 p-2.5 rounded-xl bg-navy-900/80 border border-navy-800/80 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-sky-300 text-navy-950 font-bold flex items-center justify-center text-xs shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          {!collapsed && (
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || "User"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                    user?.role === "admin"
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      : "bg-sky-400/20 text-sky-300 border border-sky-400/30"
                  }`}
                >
                  {user?.role === "admin" ? "Shop Owner" : "Staff User"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {user?.employee_id}
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition ${
            collapsed ? "justify-center" : ""
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}

