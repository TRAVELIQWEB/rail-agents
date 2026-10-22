"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-orange-200 selection:text-slate-900">
      <header className="relative z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="RailAgents home">
            <Image src="/images/train logo.png" alt="" width={38} height={38} priority className="h-9 w-9 object-contain" />
            <span className="whitespace-nowrap text-xl font-black leading-none text-slate-900 sm:text-2xl">
              Rail<span className="text-orange-700">Agents</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 transition hover:text-orange-700 sm:text-sm">
              <ArrowLeft size={15} />
              <span>Back to website</span>
            </Link>
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-800 sm:text-xs">
              <ShieldCheck size={14} className="text-orange-700" />
              <span className="hidden sm:inline">Admin Access Only</span>
              <span className="sm:hidden">Admin</span>
            </span>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-slate-950">
          <Image
            src="/images/admin-login-train.jpg"
            alt="Modern passenger train at the platform"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-slate-950/75" />

          <div className="relative mx-auto grid min-h-[680px] max-w-[1440px] grid-cols-1 items-center gap-10 px-4 py-10 sm:px-8 lg:min-h-[430px] lg:grid-cols-[minmax(0,1fr)_minmax(350px,420px)] lg:gap-16 lg:px-12 lg:py-8">
            <div className="max-w-2xl text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-300 backdrop-blur-sm">
                <Sparkles size={13} />
                <span>RailAgents Editorial Portal</span>
              </div>
              <h1 className="max-w-xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Your railway publishing workspace
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
                Your workspace for managing railway guides, blog posts, IRCTC updates, and publishing details.
              </p>

              {/* Added informative visual boxes on the left hero */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 max-w-xl">
                <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-orange-300">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Fast Content</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-200 leading-snug">
                    Instant guide publication with live markdown & schema tools.
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Secure Access</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-200 leading-snug">
                    End-to-end encrypted session and rate-limited endpoint safeguards.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl sm:p-8">
              <div className="mb-6">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Welcome back</p>
                <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Sign in</h2>
              </div>

              {error && (
                <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="admin-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Admin email
                  </label>
                  <div className="relative">
                    <Mail size={18} strokeWidth={2} className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 text-slate-400" />
                    <input
                      id="admin-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@railagents.in"
                      autoComplete="email"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={18} strokeWidth={2} className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 text-slate-400" />
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 transition hover:text-orange-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-bold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/25 disabled:cursor-wait disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <><ShieldCheck size={17} /><span>Sign in to dashboard</span></>
                  )}
                </button>
              </form>

              <p className="mt-5 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
                Forgot password? Contact system administrator.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Section with Extended Boxes */}
        <section className="bg-[#eaf1f6] px-4 py-8 sm:px-8 sm:py-10 lg:px-12" aria-label="Admin portal features">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto max-w-sm rounded-xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-orange-700">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-base font-bold text-slate-900">RailAgents Publishing Studio</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">Secure access to your editorial workspace.</p>
            </div>

            {/* Expanded 6 informative boxes */}
            <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {[
                {
                  icon: FileText,
                  title: "Posts & Rail Guides",
                  description: "Manage railway articles, IRCTC agent step-by-step guides, and practical procedures.",
                  badge: "Editorial",
                },
                {
                  icon: CalendarDays,
                  title: "Publishing Controls",
                  description: "Prepare drafts, schedule future updates, and review revision histories in real-time.",
                  badge: "Workflow",
                },
                {
                  icon: Globe,
                  title: "SEO & Search Metadata",
                  description: "Configure meta titles, social cards, rich snippet FAQs, and canonical settings.",
                  badge: "Optimization",
                },
              ].map(({ icon: Icon, title, description, badge }) => (
                <div
                  key={title}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-orange-300 hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700 transition group-hover:scale-105 group-hover:bg-orange-600 group-hover:text-white">
                      <Icon size={19} />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {badge}
                    </span>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-700 transition">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <footer className="mt-8 border-t border-slate-300/70 pt-4 text-center text-xs font-medium text-slate-500">
              © {new Date().getFullYear()} RailAgents · Secure Admin Portal · Internal Use Only
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}

