import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Calculator, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GuidesDirectory } from "@/components/guides/GuidesDirectory";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Railway Agent Guides & Resources",
  description:
    "Practical step-by-step guides for railway agents: IRCTC rules, commercial Tatkal timings, service charge compliance, ticket cancellation refunds, and registration procedures.",
  alternates: {
    canonical: `${siteConfig.url}/guides`,
  },
  openGraph: {
    title: "Railway Agent Guides & Resources | RailAgents",
    description:
      "Practical step-by-step guides for railway agents: IRCTC rules, commercial Tatkal timings, service charge compliance, ticket cancellation refunds, and registration procedures.",
    url: `${siteConfig.url}/guides`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "RailAgents Railway Agent Guides & Resources",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Railway Agent Guides & Resources | RailAgents",
    description:
      "Practical step-by-step guides for railway agents: IRCTC rules, commercial Tatkal timings, service charge compliance, ticket cancellation refunds, and registration procedures.",
    images: [siteConfig.socialImage],
  },
};

export default function GuidesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff9f5]">
      <Header />

      <main className="relative flex-1 overflow-hidden bg-[#fff9f5]">
        {/* Ambient subtle glow backgrounds */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-orange-100/40 blur-[80px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-60 h-72 w-72 rounded-full bg-orange-200/25 blur-[90px]"
        />

        {/* ══ 1. COMPACT HERO SECTION ══ */}
        <section
          aria-label="Guides introduction"
          className="relative border-b border-[#f0e1d5] bg-gradient-to-b from-[#fffcf8] via-[#faf5ee] to-[#f7f0e6] py-6 sm:py-8 lg:py-9"
        >
          <div className="site-container max-w-5xl">
            <div className="mx-auto text-center">
              <div className="mb-2.5 inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full border border-[#f5dfcf] bg-white/80 px-3 py-1 text-[10px] font-[800] uppercase tracking-[0.08em] text-[#e96713] shadow-xs backdrop-blur-md sm:px-3.5 sm:text-xs sm:tracking-[0.12em]">
                <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
                RailAgents Knowledge Center
              </div>

              {/* H1: Two-Color Heading */}
              <h1 className="page-hero-title">
                Railway Agent Guides &amp;{" "}
                <span className="hero-accent">Resources</span>
              </h1>

              <p className="page-hero-description mx-auto mt-2 max-w-2xl">
                Clear, verified operational guides for railway ticketing agents and travel desks.
                Explore mandatory IRCTC compliance, commercial booking workflows, Tatkal guidelines, and customer query management.
              </p>

              {/* Quick Status Badges */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  Official Compliance Referenced
                </span>
                <span className="text-slate-300" aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                  Independent Educational Manuals
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 2. MAIN GUIDES CONTAINER ══ */}
        <section aria-label="Agent guides and tools" className="py-8 sm:py-12 lg:py-14">
          <div className="site-container max-w-5xl space-y-12 sm:space-y-14">
            
            {/* Guides Directory with Search, Categories, Featured Guide & Grid */}
            <GuidesDirectory />

            {/* ══ 3. DEDICATED TOOL SECTION: FARE CALCULATOR ══ */}
            <section
              aria-labelledby="agent-tools-heading"
              className="relative overflow-hidden rounded-3xl border border-blue-200/90 bg-gradient-to-br from-white via-[#f8fafc] to-blue-50/40 p-6 sm:p-8 shadow-[0_4px_24px_rgba(59,130,246,0.06)] transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/90 px-3.5 py-1 text-xs font-[800] uppercase tracking-wider text-blue-800">
                    <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
                    Interactive Utility Tool
                  </div>
                  <h2
                    id="agent-tools-heading"
                    className="text-xl sm:text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)]"
                  >
                    Agent Train Ticket Fare &amp; Service Charge Calculator
                  </h2>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600 max-w-2xl">
                    Need to provide an immediate, itemized estimate to a passenger? Calculate exact base fares,
                    statutory IRCTC convenience fees, authorized agent service charges (₹20 Non-AC / ₹40 AC),
                    and payment gateway processing costs with full transparency.
                  </p>
                  <p className="text-xs text-slate-500">
                    Generates clean, printable client quotations compliant with official fee disclosure norms.
                  </p>
                </div>

                <div className="pt-2 md:pt-0 shrink-0">
                  <Link
                    href="/train-ticket-agent-fare-calculator"
                    className="single-line-btn inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-[800] text-blue-900 shadow-xs transition-all hover:border-blue-300 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                  >
                    <Calculator className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    <span>Launch Fare Calculator</span>
                    <ArrowRight className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </section>

            {/* ══ 4. COMPLIANCE & LEGAL NOTICE ══ */}
            <div className="rounded-2xl border border-[#f0e1d5] bg-white/80 p-5 text-center sm:text-left text-xs leading-relaxed text-slate-500">
              <strong className="font-semibold text-slate-700">Educational Disclaimer:</strong> RailAgents is an independent educational platform for railway ticketing agents and travellers. We are not IRCTC or Indian Railways. Railway booking rules, service charges, cancellation terms, and provider onboarding criteria are subject to change by competent authorities. Always verify current instructions directly with your authorized Principal Service Provider (PSP) or the official IRCTC portal.
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
