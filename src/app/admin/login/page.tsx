"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  HelpCircle,
  Train,
  FileQuestion,
  Compass,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Lock,
} from "lucide-react";

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
    <main className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-[#0f1115] font-sans text-zinc-100 select-none">
      {/* ─── SUBTLE MATTE CARBON BACKGROUND ─── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#12151b] via-[#0f1115] to-[#0c0e12]" />
        {/* Very subtle architectural grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* Soft matte warm ambient accent in corner */}
        <div className="absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-[#ea580c]/[0.07] blur-[120px]" />
      </div>

      {/* ─── TOP BAR: RailAgents Logo & Status Pill ─── */}
      <header className="relative z-10 flex w-full items-center justify-between border-b border-[#1e222b] bg-[#14171c]/80 px-6 py-4 backdrop-blur-md sm:px-12 lg:px-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2a303c] bg-[#1a1e25] p-1.5 transition group-hover:border-orange-500/50">
            <Image
              src="/images/train logo.png"
              alt="RailAgents Logo"
              width={28}
              height={28}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xl font-[900] tracking-tight text-zinc-100">
            Rail<span className="text-[#f97316]">Agents</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-[#262b35] bg-[#1a1e25] px-3.5 py-1.5 text-xs font-semibold text-zinc-300">
          <ShieldCheck size={14} className="text-[#f97316]" />
          <span className="text-[11px] font-semibold tracking-wide">Admin CMS</span>
        </div>
      </header>

      {/* ─── MAIN CONTENT: Left Matte Workspace & Right Matte Login Card ─── */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1360px] flex-1 grid-cols-1 items-center gap-10 px-6 py-8 sm:px-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:px-20">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col justify-center text-left">
          <div className="mb-4 inline-flex items-center gap-2 self-start rounded-full border border-orange-500/25 bg-orange-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-400">
            <HelpCircle size={13} className="text-orange-400" />
            <span>Railway Help &amp; Query Desk</span>
          </div>

          <h1 className="text-3xl font-[900] leading-[1.15] tracking-tight text-zinc-100 sm:text-5xl lg:text-[3.1rem]">
            Every railway query, <br />
            rule &amp; update in <br />
            <span className="text-[#f97316]">one place.</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm sm:text-base font-normal leading-relaxed text-zinc-400">
            A dedicated knowledge base providing clear, verified answers for train travel concerns, IRCTC rules, ticket refund procedures, and passenger guidance.
          </p>

          {/* 3 Matte Cards */}
          <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3 max-w-xl">
            <div className="rounded-2xl border border-[#242933] bg-[#161920] p-4 transition hover:border-[#323946]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <FileQuestion size={16} />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-zinc-100">Ticket &amp; Tatkal Queries</h3>
              <p className="mt-1 text-[11px] text-zinc-400 leading-snug">Booking windows, waitlist charts, quota allocations &amp; counter rules.</p>
            </div>

            <div className="rounded-2xl border border-[#242933] bg-[#161920] p-4 transition hover:border-[#323946]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <AlertCircle size={16} />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-zinc-100">Refunds &amp; Cancellations</h3>
              <p className="mt-1 text-[11px] text-zinc-400 leading-snug">TDR filing guidelines, clerkage deductions, and auto-refund timelines.</p>
            </div>

            <div className="rounded-2xl border border-[#242933] bg-[#161920] p-4 transition hover:border-[#323946]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Compass size={16} />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-zinc-100">Travel Rules &amp; Rights</h3>
              <p className="mt-1 text-[11px] text-zinc-400 leading-snug">Luggage allowances, concession entitlements, and passenger rights.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#f97316]" />
              Official Indian Railways Circulars
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#f97316]" />
              Clear Step-by-Step Solutions
            </span>
            <span className="flex items-center gap-1.5">
              <Train size={14} className="text-[#f97316]" />
              Real Passenger Concerns Answered
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Matte Login Card */}
        <div className="flex flex-col items-center justify-center lg:items-end">
          <div className="w-full max-w-[410px] rounded-2xl border border-[#242933] bg-[#161920] p-7 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#242933] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-zinc-100 sm:text-2xl">
                  Admin Sign In
                </h2>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Enter your credentials to access the CMS
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2c323e] bg-[#1d222b] text-orange-400">
                <Lock size={17} />
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs font-semibold text-red-300"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@railagents.in"
                  autoComplete="email"
                  className="h-11 w-full rounded-xl border border-[#2a303c] bg-[#111318] px-3.5 text-xs font-semibold text-zinc-100 outline-none transition placeholder:font-normal placeholder:text-zinc-500 focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border border-[#2a303c] bg-[#111318] px-3.5 pr-12 text-xs font-semibold text-zinc-100 outline-none transition placeholder:font-normal placeholder:text-zinc-500 focus:border-[#ea580c]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#f97316]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <p className="pt-0.5 text-[11px] text-zinc-400">
                By signing in, you agree to our{" "}
                <Link href="/" className="font-semibold text-orange-400 hover:underline">
                  Terms &amp; Conditions
                </Link>
              </p>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-[#ea580c] px-6 text-xs sm:text-sm font-bold text-white transition hover:bg-[#f97316] disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? "Signing in..." : "Sign In to Dashboard →"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 text-center text-xs font-medium text-zinc-500">
            <span>Need assistance? </span>
            <Link href="/contact" className="font-bold text-zinc-300 hover:text-orange-400">
              Contact Support
            </Link>
          </div>
        </div>

      </div>

      {/* ─── FOOTER COPYRIGHT NOTE ─── */}
      <footer className="relative z-10 border-t border-[#1e222b] px-6 py-3.5 sm:px-12 lg:px-20 text-xs font-medium text-zinc-500">
        © {new Date().getFullYear()} RailAgents. All rights reserved.
      </footer>
    </main>
  );
}
