"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, HelpCircle, Shield } from "lucide-react";

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* Left Column: Brand Hero Panel */}
      <div className="w-full lg:w-1/2 bg-[#0c2f5a] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden min-h-[460px] lg:min-h-screen">
        {/* Soft decorative background circles (from screenshot) */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-sky-400/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
        <div className="absolute top-1/2 right-12 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />

        {/* Top: Official Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            style={{ width: "48px", height: "48px" }}
            className="w-12 h-12 rounded-xl overflow-hidden shadow-lg bg-[#002942] border border-sky-400/30 shrink-0 flex items-center justify-center p-0.5"
          >
            <img
              src="/logo.png"
              alt="Satguru Vision Care Logo"
              width={48}
              height={48}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white font-sans leading-none">
              SATGURU
            </span>
            <span className="text-[11px] font-bold tracking-widest text-sky-400 leading-tight">
              VISION CARE
            </span>
          </div>
        </div>

        {/* Center: Brand Vision Headline & Icon */}
        <div className="relative z-10 my-auto py-10 lg:py-0 max-w-lg">
          {/* Big Stylized Eye Mark */}
          <div className="w-16 h-16 rounded-2xl bg-sky-400/10 border border-sky-400/25 flex items-center justify-center text-sky-400 mb-8 shadow-inner">
            <svg
              className="w-9 h-9 stroke-current fill-none"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="1" className="fill-sky-400" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
            Every customer.<br />
            Every prescription.<br />
            Always on record.
          </h1>

          <p className="text-base sm:text-lg text-blue-200/85 mt-6 font-normal leading-relaxed max-w-md">
            Find a customer&apos;s previous eye power in seconds when they walk back in.
          </p>
        </div>

        {/* Bottom: Copyright watermark */}
        <div className="relative z-10 pt-4">
          <p className="text-xs text-blue-200/50 font-semibold tracking-wider uppercase">
            © SATGURU VISION CARE • satguruvisioncare.com
          </p>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-50 min-h-[550px]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign in
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Owner and staff accounts sign in here.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                USERNAME OR EMAIL
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="sukhbendarsingh or sukh4164@gmail.com"
                className="w-full px-4 py-3 bg-blue-50/40 border border-blue-200/80 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 pr-11 py-3 bg-blue-50/40 border border-blue-200/80 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0c2f5a] hover:bg-[#092242] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Footer Note with Shield */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>Accounts are created by the shop owner only.</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Account Recovery</h3>
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
                className="w-full py-2.5 bg-[#0c2f5a] text-white text-xs font-bold rounded-xl hover:bg-[#092242] transition"
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
