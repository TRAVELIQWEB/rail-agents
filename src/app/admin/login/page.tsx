"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-900 selection:bg-orange-500 selection:text-white lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen w-full lg:h-full lg:grid-cols-12">

        {/* ── Left Side: Orange Brand Panel ── */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 lg:col-span-6 lg:flex xl:col-span-7">
          {/* Decorative ambient circles */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-amber-300/20 blur-2xl" />
          <div className="absolute -bottom-16 left-1/4 h-64 w-64 rounded-full bg-orange-900/30 blur-2xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-orange-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-orange-950/20" />

          {/* Brand Header */}
          <div className="relative z-10 flex flex-col items-center px-8 pt-14 text-center text-white xl:px-14 xl:pt-18">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 p-3 shadow-lg backdrop-blur-md ring-1 ring-white/30">
              <Image
                src="/images/train logo.png"
                alt="RailAgents"
                width={42}
                height={42}
                priority
                className="h-10 w-10 object-contain drop-shadow"
              />
            </div>

            <div className="flex flex-col items-center">
              <span className="text-4xl font-black tracking-tight leading-none text-white drop-shadow-lg sm:text-[42px]">
                <span>Rail</span>
                <span className="text-orange-200">Agents</span>
              </span>
              <span className="mt-2.5 inline-block rounded-full border border-white/30 bg-white/15 px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white/90 shadow-sm backdrop-blur-sm">
                Admin Portal
              </span>
            </div>

            <p className="mt-5 max-w-md text-sm sm:text-base font-semibold leading-relaxed text-white/90">
              Secure access to the RailAgents publishing studio for managing blogs, guides, and editorial content.
            </p>

            {/* Feature list */}
            <div className="mt-8 w-full max-w-xs space-y-3 text-left">
              {[
                "Manage blog posts & guides",
                "Rich text editor with Word-like toolbar",
                "Draft, schedule & publish content",
                "SEO & metadata management",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2.5 text-sm font-medium text-white/85">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {feat}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Tags */}
          <div className="relative z-10 flex items-center justify-between px-8 pb-10 text-xs font-bold text-white xl:px-12">
            <span className="rounded-full border border-white/30 bg-white/15 px-4 py-2 shadow-lg backdrop-blur-md">
              Vande Bharat Network • Live Operations
            </span>
            <span className="rounded-full border border-white/30 bg-white/15 px-4 py-2 shadow-lg backdrop-blur-md">
              Internal Admin Portal
            </span>
          </div>
        </section>

        {/* ── Right Side: Login Form ── */}
        <section className="relative flex flex-col justify-between overflow-y-auto bg-white p-6 sm:p-12 lg:col-span-6 lg:h-full lg:p-14 xl:col-span-5 xl:p-16">
          {/* Top Return Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 transition hover:text-orange-600"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              <span>Back to website</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-100/80 px-3.5 py-1 text-xs font-extrabold text-orange-800">
              <ShieldCheck size={12} />
              Admin Access Only
            </span>
          </div>

          {/* Center Form Container */}
          <div className="my-auto py-6">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Sign In
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Enter your admin credentials to access the dashboard
            </p>

            {/* Error Message */}
            {error && (
              <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-bold text-red-800 shadow-xs">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email Input */}
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4.5 text-slate-500">
                    <Mail size={18} strokeWidth={2.2} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@railagents.in"
                    autoComplete="email"
                    className="h-12 w-full rounded-full border-2 border-slate-200 bg-slate-50/80 pl-12 pr-5 text-sm font-bold text-slate-900 shadow-inner outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4.5 text-slate-500">
                    <Lock size={18} strokeWidth={2.2} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-full border-2 border-slate-200 bg-slate-50/80 pl-12 pr-12 text-sm font-bold text-slate-900 shadow-inner outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4.5 text-slate-500 transition hover:text-slate-800"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Dual Pill Buttons Row */}
              <div className="flex items-center gap-3.5 pt-3">
                <Link
                  href="/"
                  className="flex h-12 flex-1 items-center justify-center rounded-full border-2 border-orange-500 bg-white text-sm font-black text-orange-600 transition-all hover:bg-orange-50 hover:border-orange-600 active:scale-[0.99] shadow-xs"
                >
                  Return to site
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-12 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:from-orange-600 hover:to-amber-700 hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Forgot your password? Contact the system administrator to reset it.
            </p>
          </div>

          {/* Bottom Footer Note */}
          <footer className="pt-4 text-center text-xs font-semibold text-slate-500 sm:text-left">
            © {new Date().getFullYear()} RailAgents. All rights reserved. · Secure Admin Portal
          </footer>
        </section>
      </div>
    </div>
  );
}
