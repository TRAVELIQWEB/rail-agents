"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  Train,
  FileQuestion,
  Compass,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { InteractiveButton } from "@/components/ui/InteractiveButton";

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
    <main className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-[#fffdfb] font-sans text-slate-800 select-none">
      {/* ─── PURE WHITE & ORANGE TWO-COLOR FLUID OVERLAY (ZERO BLUE) ─── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Soft pristine off-white/warm cream foundation */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fffdfa] via-[#fff8f1] to-[#fff4ea]" />

        {/* Dynamic bright orange fluid wave sweeping across the right section */}
        <div
          className="absolute -top-[20%] right-[-10%] h-[130%] w-[70%] rounded-[100%] bg-gradient-to-bl from-[#ea580c] via-[#f97316] to-[#fb923c] opacity-95 blur-[22px]"
          style={{
            transform: "rotate(14deg) skewX(8deg)",
          }}
        />

        {/* Second layered lighter peach / pastel orange wave for organic depth */}
        <div
          className="absolute top-[10%] right-[8%] h-[115%] w-[68%] rounded-[100%] bg-gradient-to-tr from-[#fed7aa] via-[#fdba74] to-[#f97316] opacity-90 blur-[16px]"
          style={{
            transform: "rotate(-12deg) skewY(-5deg)",
          }}
        />

        {/* Warm golden-orange ambient glow on right */}
        <div className="absolute -right-[10%] bottom-[5%] h-[480px] w-[580px] rounded-full bg-[#f97316]/25 blur-[95px]" />

        {/* Very soft warm peach tint on the top-left */}
        <div className="absolute top-0 left-0 h-[350px] w-[450px] rounded-full bg-[#ffedd5]/60 blur-[100px]" />

        {/* Fluid SVG wave contours in pure white and warm orange tints */}
        <svg
          className="absolute inset-0 h-full w-full opacity-65 mix-blend-normal"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M500 0 C 750 350, 850 450, 1500 250 L 1500 900 L 400 900 Z"
            fill="url(#pure-orange-wave)"
          />
          <path
            d="M450 100 C 700 450, 950 550, 1450 380"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="3"
          />
          <path
            d="M600 0 C 850 520, 1100 620, 1500 500"
            stroke="rgba(254, 215, 170, 0.75)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="pure-orange-wave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff7ed" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#fdba74" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ─── TOP BAR: RailAgents Logo & Language Pill ─── */}
      <header className="relative z-10 flex w-full items-center justify-between px-6 py-5 sm:px-12 lg:px-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200 bg-white/90 p-1.5 shadow-xs backdrop-blur-md">
            <Image
              src="/images/train logo.png"
              alt="RailAgents Logo"
              width={32}
              height={32}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-2xl font-[950] tracking-tight text-[#1c1917]">
            Rail<span className="text-[#ea580c]">Agents</span>
          </span>
        </Link>

        {/* Clean white & orange language/pill */}
        <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md">
          <Globe size={14} className="text-[#ea580c]" />
          <span className="text-[11px] font-medium tracking-wide">EN</span>
          <span className="text-[9px] text-slate-400">▼</span>
        </div>
      </header>

      {/* ─── MAIN CONTENT: Left Rich Railway Workspace & Right White Floating Card ─── */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 items-center gap-10 px-6 py-6 sm:px-12 lg:grid-cols-[1.18fr_0.82fr] lg:gap-14 lg:px-20">
        
        {/* LEFT COLUMN: Dedicated Railway Query & Passenger Guidance Content */}
        <div className="flex flex-col justify-center text-left">
          {/* Top Category Badge */}
          <div className="mb-4 inline-flex items-center gap-2 self-start rounded-full border border-orange-200/80 bg-white/85 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#ea580c] shadow-2xs backdrop-blur-xs">
            <HelpCircle size={13} className="text-[#ea580c]" />
            <span>Railway Help &amp; Query Desk</span>
          </div>

          <h1 className="text-4xl font-[950] leading-[1.14] tracking-tight text-[#1c1917] sm:text-5xl lg:text-[3.25rem] xl:text-[3.65rem]">
            Every railway query, <br />
            rule &amp; update in <br />
            <span className="text-[#ea580c]">one place.</span>
          </h1>

          <p className="mt-4 max-w-xl text-base font-normal leading-relaxed text-slate-600 sm:text-[17px]">
            A dedicated knowledge base providing clear, verified answers for train travel concerns, IRCTC rules, ticket refund procedures, and passenger guidance.
          </p>

          {/* 3 Real Query Concern Areas */}
          <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3 max-w-xl">
            <div className="rounded-2xl border border-orange-200/80 bg-white/85 p-4 shadow-2xs backdrop-blur-xs transition hover:border-orange-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                <FileQuestion size={17} />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-slate-900">Ticket &amp; Tatkal Queries</h3>
              <p className="mt-1 text-[11px] text-slate-500 leading-snug">Answers on booking windows, waitlist charts, quota allocations &amp; counter rules.</p>
            </div>

            <div className="rounded-2xl border border-orange-200/80 bg-white/85 p-4 shadow-2xs backdrop-blur-xs transition hover:border-orange-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                <AlertCircle size={17} />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-slate-900">Refunds &amp; Cancellations</h3>
              <p className="mt-1 text-[11px] text-slate-500 leading-snug">TDR filing guidelines, clerkage deductions, and auto-refund timelines.</p>
            </div>

            <div className="rounded-2xl border border-orange-200/80 bg-white/85 p-4 shadow-2xs backdrop-blur-xs transition hover:border-orange-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                <Compass size={17} />
              </div>
              <h3 className="mt-2.5 text-xs font-bold text-slate-900">Travel Rules &amp; Rights</h3>
              <p className="mt-1 text-[11px] text-slate-500 leading-snug">Luggage allowances, concession entitlements, and platform passenger rights.</p>
            </div>
          </div>

          {/* Verified Railway Information Indicators */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 size={15} className="text-[#ea580c]" />
              Official Indian Railways Circulars
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 size={15} className="text-[#ea580c]" />
              Clear Step-by-Step Solutions
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <Train size={15} className="text-[#ea580c]" />
              Real Passenger Concerns Answered
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Floating White Login Card in White & Orange */}
        <div className="flex flex-col items-center justify-center lg:items-end">
          <div className="w-full max-w-[420px] rounded-3xl border border-white/80 bg-white p-8 shadow-[0_25px_60px_rgba(234,88,12,0.18)] sm:p-9">
            <h2 className="text-2xl font-[900] text-slate-900 sm:text-3xl">
              Login
            </h2>
            <p className="mt-1 text-xs text-slate-500">Sign in to your RailAgents admin portal</p>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username"
                  autoComplete="email"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-[#fffaf5] px-4 text-xs font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#ea580c] focus:bg-white"
                />
              </div>

              <div className="relative flex items-center">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-[#fffaf5] px-4 pr-11 text-xs font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#ea580c] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Terms note */}
              <p className="pt-1 text-[11px] text-slate-500">
                By login, you agree to our{" "}
                <Link href="/" className="font-semibold text-[#ea580c] hover:underline">
                  Terms &amp; Conditions
                </Link>
              </p>

              {/* Pure Orange Button with Uiverse Effect */}
              <div className="pt-2 flex justify-center">
                <InteractiveButton
                  as="button"
                  type="submit"
                  disabled={isLoading}
                  label={isLoading ? "Signing in..." : "Login"}
                  size="md"
                  variant="orange"
                  className="w-full max-w-full"
                />
              </div>

              {/* Forgot password */}
              <div className="pt-2 text-right">
                <span className="cursor-pointer text-xs font-semibold text-[#ea580c] hover:underline">
                  Forgot password?
                </span>
              </div>
            </form>
          </div>

          {/* Having troubles logging in footer note */}
          <div className="mt-5 text-center text-xs font-medium text-white drop-shadow-sm">
            <span>Having troubles logging in? </span>
            <span className="cursor-pointer font-bold text-white underline hover:text-orange-100">
              Contact Support 🎧
            </span>
          </div>
        </div>

      </div>

      {/* ─── FOOTER COPYRIGHT NOTE ─── */}
      <footer className="relative z-10 px-6 py-4 sm:px-12 lg:px-20 text-xs font-medium text-slate-400">
        © {new Date().getFullYear()} RailAgents. All rights reserved.
      </footer>
    </main>
  );
}
