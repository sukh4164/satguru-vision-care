"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (userType: "admin" | "staff") => {
    if (userType === "admin") {
      setIdentifier("admin");
      setPassword("admin123");
    } else {
      setIdentifier("staff");
      setPassword("staff123");
    }
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 space-y-6">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <Logo />
            <h2 className="text-xl font-black text-navy-950 tracking-tight font-sans pt-2">
              Optical Management ERP
            </h2>
            <p className="text-xs text-slate-500 max-w-xs">
              Secure role-based portal for store owner and optometrist staff
            </p>
          </div>

          {/* Role Quick Selector for Testing */}
          <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => quickFill("admin")}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                identifier === "admin"
                  ? "bg-navy-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-navy-950"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin (Owner)</span>
            </button>
            <button
              type="button"
              onClick={() => quickFill("staff")}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                identifier === "staff"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-navy-950"
              }`}
            >
              <User className="w-3.5 h-3.5 text-sky-200" />
              <span>Staff (Employee)</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or staff"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-navy-950 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-navy-950 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-navy-950 via-navy-900 to-brand-700 hover:from-navy-900 hover:to-brand-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-navy-950/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Satguru Vision</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Footer Note */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Demo Accounts: <strong>admin</strong> (admin123) | <strong>staff</strong> (staff123)
              </span>
            </p>
          </div>
        </div>

        {/* Security watermark */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Protected by Satguru Vision Care RBAC Security • 256-bit Session Encryption
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-navy-950 text-sm">Account Recovery</h3>
                <p className="text-xs text-slate-500">Security protocol</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Public self-registration and unauthorized password resets are disabled for data security. If you are an employee, please ask the Store Owner (Admin) to reset your password via the <strong>Staff Management</strong> module.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2.5 bg-navy-900 text-white text-xs font-bold rounded-xl hover:bg-navy-800 transition"
              >
                Close & Return to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

