import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Lock,
  MessageCircle,
  Receipt,
  RotateCcw,
  Scale,
  ShieldCheck,
  Train,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/config/site";
import { AgentComplianceChecklist } from "@/components/rules/AgentComplianceChecklist";

export const metadata: Metadata = {
  title: "IRCTC Agent Guidance & Rules: Practical Compliance Guide",
  description:
    "Comprehensive guide for railway agents: IRCTC agent registration, booking rules, Tatkal restrictions, permissible service charges, cancellation OTPs, TDR, and compliance.",
  alternates: { canonical: `${siteConfig.url}/irctc-agent-registration` },
  openGraph: {
    title: "IRCTC Agent Guidance & Rules: Practical Compliance Guide | RailAgents",
    description:
      "Independent educational guidance for IRCTC railway agents: booking rules, Tatkal timings, permissible service fees, cancellation OTP procedures, and compliance checklist.",
    url: `${siteConfig.url}/irctc-agent-registration`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "article",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "IRCTC Agent Guidance & Rules: Practical Compliance Guide | RailAgents",
    description:
      "Essential guide for railway e-ticketing agents: understand rules, service charge limits, cancellation OTPs, and compliance requirements.",
    images: [siteConfig.socialImage],
  },
};

const valueItems = [
  { icon: ShieldCheck, title: "Compliance Rules", detail: "IRCTC policy & legal limits" },
  { icon: Receipt, title: "Tariff & Service Fees", detail: "Per ticket fee caps & GST" },
  { icon: Lock, title: "Account Protection", detail: "Section 143 & ID safety" },
  { icon: RotateCcw, title: "Refunds & TDR", detail: "Customer OTP verification" },
];

const supportAreas = [
  {
    icon: ShieldCheck,
    number: "01",
    title: "Commercial vs. Personal Ticketing",
    body: "Understand the clear legal boundary under Section 143 of the Railways Act. Commercial bookings require authorized PSP credentials.",
  },
  {
    icon: Receipt,
    number: "02",
    title: "Mandatory Tariff Transparency",
    body: "Know exact permissible service fees (₹20 Non-AC / ₹40 AC) and mandatory ERS invoice delivery so customer billing disputes never arise.",
  },
  {
    icon: RotateCcw,
    number: "03",
    title: "Customer OTP Refund Protocol",
    body: "Master cancellation authentication and TDR eligibility rules to return funds promptly without operational risk.",
  },
];

const guideLinks = [
  {
    title: "IRCTC Agent Rules & Regulations Guide",
    href: "/irctc-agent-rules-regulations",
    description: "Crucial compliance responsibilities, permitted booking practices, service charges, and penalty avoidance.",
  },
  {
    title: "How to Become an IRCTC Agent",
    href: "/guides/become-irctc-agent",
    description: "An overview of what to understand and verify before starting an enquiry with a registered PSP.",
  },
  {
    title: "Documents Required for IRCTC Agent Registration",
    href: "/guides/documents-irctc-agent-registration",
    description: "Complete checklist of identity, address, digital signature, and shop ownership documents.",
  },
  {
    title: "IRCTC Agent Registration Process Explained",
    href: "/guides/registration-process-explained",
    description: "Step-by-step walkthrough of application submission, e-KYC, and terminal activation.",
  },
];

export default function IrctcAgentPage() {
  const lastReviewedDate = "October 2026";
  const whatsappMessage = encodeURIComponent(
    "Hi RailAgents, I have a question about IRCTC agent compliance and information. Please guide me.",
  );
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${whatsappMessage}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "IRCTC Agent Guidance & Rules: Practical Compliance Guide",
        description:
          "Comprehensive guide for railway agents: IRCTC agent registration, booking rules, Tatkal restrictions, permissible service charges, cancellation OTPs, TDR, and compliance.",
        url: `${siteConfig.url}/irctc-agent-registration`,
        author: { "@type": "Person", name: "Nihal Singh", url: `${siteConfig.url}/about` },
        publisher: {
          "@type": "Organization",
          "@id": `${siteConfig.url}/#organization`,
          name: siteConfig.name,
          url: siteConfig.url,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "IRCTC Agent Guidance & Rules",
            item: `${siteConfig.url}/irctc-agent-registration`,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfa] text-slate-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main className="relative flex-1 overflow-hidden">

        {/* ══ 1. HERO SECTION ══ */}
        <section className="relative isolate flex flex-col justify-between overflow-hidden border-b border-[#f0e1d5] bg-[#fffaf5] pt-8 pb-6 sm:pt-10 sm:pb-7 lg:min-h-[calc(100vh-74px)] lg:pt-11 lg:pb-7">
          <div aria-hidden="true" className="absolute inset-0 -z-20 hidden lg:block">
            <Image
              src="/images/hero-railway-bg.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-[0.14]"
            />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,#fffaf5_0%,rgba(255,250,245,0.96)_40%,rgba(255,250,245,0.92)_70%,#fffaf5_100%)]" />

          <div className="site-container relative z-10 flex flex-1 flex-col justify-between w-full">
            <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Left Column (7 Cols): Main Headline & CTAs */}
              <div className="flex flex-col items-center text-center md:items-start md:text-left lg:col-span-7">
                <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f5dfcf] bg-white/90 px-3.5 py-1 text-xs font-[800] uppercase tracking-[0.12em] text-[#e96713] shadow-[0_2px_8px_rgba(15,39,71,0.06)]">
                  <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
                  Railway Agent Compliance &amp; Operations
                </span>

                <h1 className="page-hero-title max-w-[920px] text-center md:text-left">
                  IRCTC Agent Guidance &amp; Rules:{" "}
                  <span className="hero-accent relative inline-block">
                    Practical Compliance Manual
                  </span>
                </h1>

                <p className="page-hero-description mx-auto mt-3 max-w-2xl md:mx-0">
                  A verified operational reference for authorized railway travel agents (RSPs). Learn mandatory
                  booking rules, strict Tatkal limits, lawful service charges, customer cancellation OTP procedures,
                  and legal protections under Indian Railways regulations.
                </p>

                <div className="mt-5 flex w-full flex-col items-center gap-3 min-[420px]:w-auto min-[420px]:flex-row min-[420px]:justify-center md:justify-start">
                  <a
                    href="#dos-and-donts"
                    className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-[700] text-white shadow-[0_6px_20px_rgba(249,115,22,0.22)] transition-all motion-safe:hover:-translate-y-0.5 hover:bg-[#e85d04]"
                  >
                    View Do&apos;s &amp; Don&apos;ts <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <Link
                    href="/train-ticket-agent-fare-calculator"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#eadbce] bg-white/95 px-6 py-3 text-sm font-[700] text-[var(--navy)] shadow-xs transition-colors hover:border-orange-300 hover:bg-orange-50"
                  >
                    <Calculator aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" />
                    Agent Fare Calculator
                  </Link>
                </div>

                {/* Quick Section Jump Pills (Balances left & right column height + super useful navigation) */}
                <div className="mt-5 w-full rounded-2xl border border-[#f0e1d5] bg-white/90 p-3.5 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Last reviewed: <strong className="text-slate-800 font-semibold">{lastReviewedDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>IRCTC Master Policy &amp; Railways Act, 1989</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ea580c] mr-1">
                      Jump to:
                    </span>
                    {[
                      { label: "Booking Rules", href: "#dos-and-donts" },
                      { label: "Tatkal Timings", href: "#tatkal-regulations" },
                      { label: "Service Fees", href: "#service-charges" },
                      { label: "OTP Refunds", href: "#cancellations-refunds" },
                      { label: "Section 143", href: "#compliance-penalties" },
                    ].map((pill) => (
                      <a
                        key={pill.label}
                        href={pill.href}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#eedcc9] bg-[#fffaf5] px-2.5 py-1 text-[11px] font-bold text-[var(--navy)] transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-[#ea580c]"
                      >
                        {pill.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (5 Cols): Quick Operational Checklist Card */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-[#f2d6bf] bg-white/95 p-5 sm:p-6 shadow-[0_16px_40px_rgba(15,39,71,0.06)]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                        <Scale className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">Core RSP Standards</p>
                        <p className="text-sm font-[900] text-[var(--navy)]">At-a-Glance Agent Rules</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      Mandatory
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {[
                      { label: "Booking Credentials", value: "Only official RSP Agent ID (No personal IDs)" },
                      { label: "Tatkal Window", value: "Opens 15 mins after public (10:15 AM / 11:15 AM)" },
                      { label: "Max Service Fee", value: "₹20 Non-AC / ₹40 AC per PNR (+ PG charges)" },
                      { label: "Refund Verification", value: "Customer mobile OTP mandatory for credit" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-[#fffcf9] px-3.5 py-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ea580c]" />
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-[var(--navy)]">{row.label}</p>
                          <p className="text-[11px] text-slate-600">{row.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Docked Value Strip (Fills viewport cleanly with zero empty space) */}
            <div aria-label="Key compliance areas" className="my-auto pt-4 border-t border-[#f0e1d5]">
              <div className="mb-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <span className="inline-flex items-center gap-1.5 text-[#c2410c]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Key Compliance Pillars Covered in This Manual
                </span>
                <span className="hidden sm:inline text-slate-400">
                  Authorized RSP Operational Reference
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
                {valueItems.map(({ icon: Icon, title, detail }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-2xl border border-[#eedcc9] bg-white/95 px-4 py-3.5 shadow-[0_6px_18px_rgba(15,39,71,0.04)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e7] text-[var(--primary)] ring-1 ring-orange-200/60">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs sm:text-[13.5px] font-[800] text-[var(--navy)]">{title}</span>
                      <span className="mt-0.5 block truncate text-[11.5px] font-medium text-slate-500">{detail}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ 3. HOW WE HELP ══ */}
        <section className="bg-[#fffaf5] py-10 sm:py-14">
          <div className="site-container">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">Operational Clarity</p>
              <h2 className="mt-2 text-2xl font-[850] leading-tight tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">
                Critical Compliance for Railway Travel Agents
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-base">
                Railway ticketing is strictly regulated by the Ministry of Railways. Whether you run a CSC, travel desk,
                or retail kiosk, operating through approved standards protects your business license.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {supportAreas.map(({ icon: Icon, number, title, body }) => (
                <article
                  key={number}
                  className="relative rounded-2xl border border-[#f0e1d5] bg-white p-5 sm:p-6 shadow-xs transition hover:border-orange-200 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1e7] text-[var(--primary)]">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-[800] tracking-widest text-orange-300">{number}</span>
                  </div>
                  <h3 className="mt-4 text-base font-[800] text-[var(--navy)]">{title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 4. MAIN ARTICLE CONTENT ══ */}
        <div className="site-container max-w-5xl py-10 sm:py-14">
          <article className="space-y-10 sm:space-y-12 leading-relaxed min-w-0">

            {/* ── 01. DO'S & DON'TS ── */}
            <section id="dos-and-donts" className="group rounded-3xl border border-orange-200/90 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(249,115,22,0.06)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(249,115,22,0.12)] hover:border-orange-300 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 font-[800] text-sm text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  01
                </span>
                <div>
                  <span className="text-[11px] font-[800] uppercase tracking-wider text-[var(--primary-dark)]">Operational Baseline</span>
                  <h2 className="text-xl sm:text-2xl font-[850] text-[var(--navy)]">
                    IRCTC Agent Do&apos;s &amp; Don&apos;ts
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Every authorized agent must balance efficient customer service with strict procedural boundaries.
                Below are the definitive operational standards applicable to railway e-ticketing agents.
              </p>

              <div className="grid gap-5 md:grid-cols-2 items-stretch">
                {/* DO'S Column */}
                <div className="flex flex-col rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 p-5 sm:p-6 shadow-xs transition-colors duration-200 hover:bg-emerald-50/50">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-200/80">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-[850] text-emerald-950">DO&apos;S — Approved Practices</h3>
                      <p className="text-[11px] text-emerald-800">Mandatory operating requirements</p>
                    </div>
                  </div>

                  <ul className="mt-4 flex-1 space-y-3">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-slate-900">Commercial RSP Portal:</strong>
                        <span className="block text-slate-600">Book exclusively via authorized Principal Service Provider portals.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-slate-900">Passenger Mobile Entry:</strong>
                        <span className="block text-slate-600">Enter customer&apos;s own active phone number for direct PNR and OTP delivery.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-slate-900">Full ERS Slip Issuance:</strong>
                        <span className="block text-slate-600">Hand over complete printed ticket showing agency details and official fare breakdown.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-slate-900">Customer Requisition Records:</strong>
                        <span className="block text-slate-600">Collect written or digital consent with passenger names and IDs.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-slate-900">Standard Service Charges:</strong>
                        <span className="block text-slate-600">Adhere strictly to official caps (₹20 Non-AC / ₹40 AC + GST) with receipts.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-slate-900">Immediate OTP Refund:</strong>
                        <span className="block text-slate-600">Disburse cancellation refunds promptly upon customer verification code authentication.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-slate-900">Display Agent Certificate:</strong>
                        <span className="block text-slate-600">Prominently display your authorized certificate and tariff board at your premises.</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* DON'TS Column */}
                <div className="flex flex-col rounded-2xl border-2 border-red-200 bg-red-50/30 p-5 sm:p-6 shadow-xs transition-colors duration-200 hover:bg-red-50/50">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-red-200/80">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-xs">
                      <XCircle className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-[850] text-red-950">DON&apos;TS — Prohibited Violations</h3>
                      <p className="text-[11px] text-red-800">Actions causing penalties &amp; deactivation</p>
                    </div>
                  </div>

                  <ul className="mt-4 flex-1 space-y-3">
                    <li className="flex items-start gap-2.5">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-red-950">Personal Retail IDs:</strong>
                        <span className="block text-slate-600">Never book commercial clients using retail IRCTC personal accounts.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-red-950">Tatkal Window Bypassing:</strong>
                        <span className="block text-slate-600">Do not attempt commercial booking during initial 15-min counter opening.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-red-950">Automation &amp; Bots:</strong>
                        <span className="block text-slate-600">Never deploy autofill plugins, Tatkal extension software, or bots.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-red-950">Arbitrary Overcharging:</strong>
                        <span className="block text-slate-600">Never charge unauthorized extra fees without an official agency receipt.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-red-950">Credential &amp; OTP Sharing:</strong>
                        <span className="block text-slate-600">Never share your digital certificate or master logins with third parties.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-red-950">Ticket Slip Tampering:</strong>
                        <span className="block text-slate-600">Never crop, modify, or conceal the official fare breakdown or agent info.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <div className="text-xs">
                        <strong className="font-[800] text-red-950">Withholding Customer Refunds:</strong>
                        <span className="block text-slate-600">Never delay cancellation disbursements or cancel seats without consent.</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ── 02. REGISTRATION & PSP ARCHITECTURE ── */}
            <section id="registration-overview" className="group rounded-3xl border border-blue-200/90 bg-gradient-to-br from-white to-blue-50/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(59,130,246,0.05)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)] hover:border-blue-300 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-[800] text-sm text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  02
                </span>
                <div>
                  <span className="text-[11px] font-[800] uppercase tracking-wider text-blue-700">Licensing Structure</span>
                  <h2 className="text-xl sm:text-2xl font-[850] text-[var(--navy)]">
                    Registration &amp; PSP Architecture
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                IRCTC does not generally appoint individual retail booking agents directly. Commercial ticketing operates
                under a structured two-tier hierarchy:
              </p>

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-2xs mb-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 mb-2.5">
                  Key Terminology: PSP vs. RSP
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <li>
                    <strong className="text-slate-900">Principal Service Provider (PSP):</strong> Corporate entities authorized
                    directly by IRCTC (e.g., banks, major travel portals, government aggregators like CSC) to onboard sub-agents.
                  </li>
                  <li>
                    <strong className="text-slate-900">Retail Service Provider (RSP):</strong> The individual travel agent, shopkeeper,
                    or commercial enterprise operating the booking terminal under an authorized PSP.
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-950">
                <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-blue-700" />
                  Official Source Verification:
                </h4>
                <p className="text-blue-900/90 leading-relaxed">
                  Always confirm your Principal Service Provider on the official IRCTC portal (
                  <a
                    href="https://contents.irctc.co.in/en/Agent_Policy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold hover:text-blue-950"
                  >
                    IRCTC Agent Policy Directory <ExternalLink className="inline h-3 w-3" />
                  </a>
                  ). Beware of unauthorized middlemen claiming direct IRCTC agency allotment.
                </p>
              </div>
            </section>

            {/* ── 03. BOOKING RULES ── */}
            <section id="booking-rules" className="group rounded-3xl border border-teal-200/90 bg-gradient-to-br from-white to-teal-50/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(20,184,166,0.05)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(20,184,166,0.1)] hover:border-teal-300 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 font-[800] text-sm text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  03
                </span>
                <div>
                  <span className="text-[11px] font-[800] uppercase tracking-wider text-teal-700">Passenger Intake</span>
                  <h2 className="text-xl sm:text-2xl font-[850] text-[var(--navy)]">
                    Customer Intake &amp; Booking Rules
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                Daily ticket booking must strictly adhere to the procedures mandated by Indian Railways Coaching Tariff
                and IRCTC Agent Operations guidelines:
              </p>

              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-2xs">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-teal-900 mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-teal-600" />
                    Passenger Mobile Number
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You must enter the traveller&apos;s active mobile number. Entering agency phone numbers deprives passengers
                    of departure updates and cancellation OTPs.
                  </p>
                </div>

                <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-2xs">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-teal-900 mb-1.5 flex items-center gap-1.5">
                    <Receipt className="h-4 w-4 text-teal-600" />
                    Full ERS Delivery
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Deliver the complete official Electronic Reservation Slip (ERS). The printed slip automatically displays
                    agency credentials and railway fare breakdown.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950">
                <strong className="font-bold text-amber-900 block mb-1">Explaining Waitlist (WL) Realistically:</strong>
                Waitlist ticket status does not guarantee berth allotment. Fully waitlisted e-tickets whose names do not
                get confirmed after charting are automatically cancelled by Indian Railways system. Never misrepresent waitlists as guarantees.
              </div>
            </section>

            {/* ── 04. TATKAL REGULATIONS ── */}
            <section id="tatkal-regulations" className="group rounded-3xl border border-amber-200/90 bg-gradient-to-br from-white to-amber-50/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(245,158,11,0.05)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(245,158,11,0.1)] hover:border-amber-300 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 font-[800] text-sm text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  04
                </span>
                <div>
                  <span className="text-[11px] font-[800] uppercase tracking-wider text-amber-700">Strict Timings</span>
                  <h2 className="text-xl sm:text-2xl font-[850] text-[var(--navy)]">
                    Tatkal Hours &amp; 15-Minute Agent Lock
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                To protect public travellers, Indian Railways enforces a mandatory initial 15-minute lock on commercial
                agents during quota openings:
              </p>

              <div className="overflow-x-auto rounded-2xl border border-amber-200/80 bg-white mb-4">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-amber-100 bg-amber-50/50 font-bold text-slate-800">
                    <tr>
                      <th className="p-3">Reservation Category</th>
                      <th className="p-3">Counter / Public Opening</th>
                      <th className="p-3">Authorized Agent Opening</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 text-xs">
                    <tr>
                      <td className="p-3 font-semibold text-slate-800">General Reservation (ARP)</td>
                      <td className="p-3">08:00 AM</td>
                      <td className="p-3 font-medium text-emerald-700">08:15 AM onwards</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800">Tatkal AC Classes (1A, 2A, 3A, CC, 3E)</td>
                      <td className="p-3">10:00 AM</td>
                      <td className="p-3 font-medium text-emerald-700">10:15 AM onwards</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800">Tatkal Non-AC Classes (SL, 2S)</td>
                      <td className="p-3">11:00 AM</td>
                      <td className="p-3 font-medium text-emerald-700">11:15 AM onwards</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-red-900">Warning:</strong> Attempting to circumvent the 15-minute opening restriction using personal retail IDs
                is the single most common cause of Section 143 raids and agency blacklisting.
              </p>
            </section>

            {/* ── 05. SERVICE CHARGES ── */}
            <section id="service-charges" className="group rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-white to-emerald-50/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(16,185,129,0.05)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(16,185,129,0.1)] hover:border-emerald-300 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 font-[800] text-sm text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  05
                </span>
                <div>
                  <span className="text-[11px] font-[800] uppercase tracking-wider text-emerald-700">Permissible Fees</span>
                  <h2 className="text-xl sm:text-2xl font-[850] text-[var(--navy)]">
                    Prescribed Service Charges &amp; Transparency
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                Under IRCTC Master Policy guidelines, commercial agents may collect specific authorized service fees per ticket:
              </p>

              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Non-AC Classes</span>
                  <p className="mt-1.5 text-2xl font-[850] text-[var(--navy)]">₹20 <span className="text-xs font-normal text-slate-500">+ applicable GST</span></p>
                  <p className="mt-1 text-[11px] text-slate-500">Per ticket (not per passenger), regardless of passenger count (up to 6).</p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">AC Classes</span>
                  <p className="mt-1.5 text-2xl font-[850] text-[var(--navy)]">₹40 <span className="text-xs font-normal text-slate-500">+ applicable GST</span></p>
                  <p className="mt-1 text-[11px] text-slate-500">Per ticket (not per passenger), regardless of AC tier.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-xs text-slate-600 leading-relaxed shadow-2xs">
                <strong className="text-slate-900">Permissible Add-ons:</strong> Payment gateway convenience charges as billed
                by the provider may be passed through. Any fee beyond this without an official receipt is treated as illegal overcharging.
              </div>
            </section>

            {/* ── 06. CANCELLATIONS & REFUND OTPS ── */}
            <section id="cancellations-refunds" className="group rounded-3xl border border-rose-200/90 bg-gradient-to-br from-white to-rose-50/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(244,63,94,0.05)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(244,63,94,0.1)] hover:border-rose-300 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-500 font-[800] text-sm text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  06
                </span>
                <div>
                  <span className="text-[11px] font-[800] uppercase tracking-wider text-rose-700">Refund Workflow</span>
                  <h2 className="text-xl sm:text-2xl font-[850] text-[var(--navy)]">
                    Cancellations &amp; Customer Refund OTPs
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                To protect consumers against fraudulent ticket cancellations, IRCTC enforces a mandatory OTP-based
                refund verification workflow:
              </p>

              <ol className="list-decimal pl-5 space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                <li>
                  <strong>Customer Request:</strong> Cancellation must be initiated only upon customer written consent or instruction.
                </li>
                <li>
                  <strong>Automated SMS Verification:</strong> IRCTC automatically generates a cancellation verification OTP sent directly to the customer&apos;s phone.
                </li>
                <li>
                  <strong>Agent Authentication:</strong> The agent submits the passenger&apos;s OTP in their RSP portal to unlock the refund.
                </li>
                <li>
                  <strong>Disbursement:</strong> The agent pays the customer the refund amount (fare minus official railway clerkage/cancellation charges) and provides the cancellation receipt.
                </li>
              </ol>

              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-950">
                <strong className="font-bold text-rose-900 block mb-1">Withholding Refunds is a Serious Infraction:</strong>
                Retaining cancelled ticket refund balances or delaying OTP verification is treated as commercial fraud under PSP operating terms.
              </div>
            </section>

            {/* ── 07. TDR GUIDANCE ── */}
            <section id="tdr-guidance" className="group rounded-3xl border border-purple-200/90 bg-gradient-to-br from-white to-purple-50/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(168,85,247,0.05)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(168,85,247,0.1)] hover:border-purple-300 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 font-[800] text-sm text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  07
                </span>
                <div>
                  <span className="text-[11px] font-[800] uppercase tracking-wider text-purple-700">Special Claims</span>
                  <h2 className="text-xl sm:text-2xl font-[850] text-[var(--navy)]">
                    Ticket Deposit Receipt (TDR) Grounds &amp; Limitations
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                A TDR is an official refund claims mechanism filed when a passenger was unable to travel due to railway
                operational reasons after charting has finalized:
              </p>

              <div className="grid gap-3 sm:grid-cols-2 mb-4 text-xs">
                <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-2xs">
                  <strong className="font-bold text-purple-950 block mb-1.5">Common Valid TDR Grounds:</strong>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                    <li>Train running late by &gt; 3 hours and passenger not travelling.</li>
                    <li>Train cancelled by Indian Railways.</li>
                    <li>AC failure in coach where passenger traveled in lower class.</li>
                    <li>Improper charting or passenger not accommodated.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-2xs">
                  <strong className="font-bold text-purple-950 block mb-1.5">Critical TDR Realities:</strong>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                    <li>TDR does not guarantee an automatic refund.</li>
                    <li>Claims are reviewed by Zonal Railway Claims Offices against conductor charts.</li>
                    <li>Strict filing window (typically within 72 hours of scheduled departure depending on ground).</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ── 08. ACCOUNT SECURITY ── */}
            <section id="account-security" className="group rounded-3xl border border-sky-200/90 bg-gradient-to-br from-white to-sky-50/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(14,165,233,0.05)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(14,165,233,0.1)] hover:border-sky-300 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-cyan-600 font-[800] text-sm text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  08
                </span>
                <div>
                  <span className="text-[11px] font-[800] uppercase tracking-wider text-sky-700">Digital Integrity</span>
                  <h2 className="text-xl sm:text-2xl font-[850] text-[var(--navy)]">
                    Account Security &amp; Credential Protection
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                Your agent profile is strictly personal to your registered commercial premises:
              </p>

              <div className="rounded-2xl border border-sky-100 bg-white p-5 text-xs sm:text-sm text-slate-700 space-y-3 shadow-2xs">
                <p>
                  <strong>Digital Signature (DSC) Tokens:</strong> Keep physical possession of your cryptographic token. Never allow remote desktop access (e.g. AnyDesk, TeamViewer) to unknown third parties.
                </p>
                <p>
                  <strong>ID Non-Transferability:</strong> Never sub-lease, lend, or sell your agent ID. Operating multiple unregistered counters under a single RSP credential is an audit violation.
                </p>
                <p>
                  <strong>Certificate Display:</strong> Keep your authorized IRCTC agency certificate printed and framed at your physical service counter.
                </p>
              </div>
            </section>

            {/* ── 09. RECORD KEEPING ── */}
            <section id="audit-records" className="group rounded-3xl border border-indigo-200/90 bg-gradient-to-br from-white to-indigo-50/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(99,102,241,0.05)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(99,102,241,0.1)] hover:border-indigo-300 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 font-[800] text-sm text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  09
                </span>
                <div>
                  <span className="text-[11px] font-[800] uppercase tracking-wider text-indigo-700">Audit Preparedness</span>
                  <h2 className="text-xl sm:text-2xl font-[850] text-[var(--navy)]">
                    Record Keeping &amp; Audit Inspections
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                Railway Board vigilance officers and PSP inspectors have statutory authority to inspect agent premises.
                Agents should maintain:
              </p>

              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 mb-4">
                <li>Written booking requisition slips signed by customers (or verified digital records).</li>
                <li>Copies of ID proofs collected during Tatkal or quota requests.</li>
                <li>Daily transaction registers with PNR numbers, passenger contact info, and collected service fees.</li>
                <li>Cancellation and refund receipts with customer acknowledgment signatures or OTP logs.</li>
              </ul>

              <p className="text-xs text-slate-500 font-medium">
                Recommended retention period: Minimum 6 to 12 months as prescribed by your PSP operating manual.
              </p>
            </section>

            {/* ── 10. COMPLIANCE & PENALTIES ── */}
            <section id="compliance-penalties" className="group rounded-3xl border border-red-300 bg-gradient-to-br from-white to-red-50/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(239,68,68,0.06)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(239,68,68,0.12)] hover:border-red-400 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-700 font-[800] text-sm text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  10
                </span>
                <div>
                  <span className="text-[11px] font-[800] uppercase tracking-wider text-red-700">Statutory Liability</span>
                  <h2 className="text-xl sm:text-2xl font-[850] text-red-950">
                    Legal Risks &amp; Penalties Under Railways Act
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                Violations carry escalating consequences under railway regulations:
              </p>

              <div className="space-y-3">
                <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 text-xs sm:text-sm shadow-2xs">
                  <strong className="text-red-900 block font-bold mb-1">Section 143 of The Railways Act, 1989:</strong>
                  Unauthorized procurement and supply of railway tickets for commercial gain carries imprisonment up to 3 years and/or monetary fines.
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs sm:text-sm shadow-2xs">
                  <strong className="text-slate-900 block font-bold mb-1">Administrative PSP Sanctions:</strong>
                  Monetary fines per incident, forfeiture of rolling deposit balances, temporary terminal suspension, and permanent blacklisting of PAN and business Aadhaar.
                </div>
              </div>
            </section>

            {/* ── 11. DAILY COMPLIANCE CHECKLIST ── */}
            <section id="daily-checklist" className="group rounded-3xl border border-orange-300/90 bg-gradient-to-br from-white to-orange-50/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(249,115,22,0.06)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(249,115,22,0.12)] hover:border-orange-400 scroll-mt-24">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-amber-600 font-[800] text-sm text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  11
                </span>
                <div>
                  <span className="text-[11px] font-[800] uppercase tracking-wider text-[var(--primary-dark)]">Interactive Tool</span>
                  <h2 className="text-xl sm:text-2xl font-[850] text-[var(--navy)]">
                    Interactive Daily Compliance Checklist
                  </h2>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Use this interactive checklist at your booking desk every morning to ensure your counter operates
                with 100% compliance:
              </p>

              <AgentComplianceChecklist />
            </section>

          </article>
        </div>

        {/* ══ 5. FARE CALCULATOR SECTION ══ */}
        <section className="border-t border-[#f0e1d5] bg-white py-8 sm:py-10">
          <div className="site-container">
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-5 rounded-2xl border border-orange-200 bg-gradient-to-r from-[#fff7ed] to-orange-50/70 p-6 sm:flex-row shadow-xs">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-sm">
                  <Calculator aria-hidden="true" className="h-6 w-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-[800] text-[var(--navy)]">
                      IRCTC Agent Ticket Fare Calculator
                    </h2>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[var(--primary-dark)]">
                      Live Tool
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                    Calculate exact ticket totals with automatic Payment Gateway (PG) logic (₹0.75 for ≤₹2,000, 1% above), agent service charges, and printable customer quotation slips.
                  </p>
                </div>
              </div>

              <Link
                href="/train-ticket-agent-fare-calculator"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--primary)] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#e85d04]"
              >
                Open Calculator <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══ 6. RELATED GUIDES ══ */}
        <section className="border-y border-[#f5e5d7] bg-gradient-to-b from-[#fffaf5] to-white py-10 sm:py-14">
          <div className="site-container">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">Knowledge Base</p>
                <h2 className="mt-2 text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">Related IRCTC Agent Guides</h2>
              </div>
              <Link href="/guides" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[#fed7aa] bg-white px-5 py-2.5 text-sm font-[700] text-[var(--primary-dark)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
                Browse all guides <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {guideLinks.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group relative flex min-h-[220px] h-full flex-col items-start overflow-hidden rounded-2xl border border-[#f0e1d5] bg-white p-5 text-left shadow-[0_6px_20px_rgba(15,39,71,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_14px_30px_rgba(15,39,71,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:p-6"
                >
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fff3e8] px-2.5 py-1 text-[10px] font-[800] uppercase tracking-[0.08em] text-[var(--primary-dark)]">
                    <BookOpen aria-hidden="true" className="h-3 w-3" /> Guide
                  </span>
                  <h3 className="mt-4 text-base font-[800] leading-snug text-[var(--navy)] transition-colors group-hover:text-[var(--primary-hover)] sm:text-lg">
                    {guide.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                    {guide.description}
                  </p>
                  <div className="mt-5 flex w-full items-center justify-between border-t border-slate-100 pt-3.5">
                    <span className="text-xs font-semibold text-slate-500">Read guide</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff3e8] text-[var(--primary-dark)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-[var(--primary)] group-hover:text-white">
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 7. DISCLAIMER ══ */}
        <section className="bg-white py-4 sm:py-6">
          <div className="site-container">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 rounded-2xl border border-orange-100 bg-[#fff8f2] p-5 sm:flex-row sm:items-start sm:gap-4 sm:p-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm">
                <Info aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="min-w-0 text-left">
                <h2 className="text-base font-[800] text-[var(--navy)]">Important Compliance Disclaimer</h2>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600">
                  RailAgents is an independent educational initiative helping railway travel agents and passengers understand ticketing regulations, terms, and compliance standards. RailAgents is NOT affiliated with, authorized by, or an agent of IRCTC (Indian Railway Catering and Tourism Corporation) or the Ministry of Railways, Government of India. We do not issue agent IDs, sell railway tickets, or process official registrations. Always verify current commercial terms directly with your licensed Principal Service Provider (PSP) or on official IRCTC portals (irctc.co.in).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 8. CONTACT CTA ══ */}
        <section className="bg-white pb-12 pt-6 sm:pb-16 sm:pt-8">
          <div className="site-container">
            <div className="relative isolate overflow-hidden rounded-[26px] border border-[#f1dfce] bg-gradient-to-br from-[#fffaf5] via-[#fff2e6] to-[#ffead7] px-6 py-8 shadow-xs sm:px-10 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
              <div aria-hidden="true" className="pointer-events-none absolute right-[32%] top-1/2 -z-10 hidden -translate-y-1/2 text-orange-300/20 lg:block">
                <Train className="h-32 w-32" strokeWidth={1} />
              </div>
              <div className="mx-auto max-w-2xl text-center md:mx-0 md:text-left">
                <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">Here to help you navigate rules</p>
                <h2 className="mt-2 text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">Have an IRCTC agent question?</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                  Tell us what you need help understanding and we will point you toward the exact official circulars or compliance answers.
                </p>
              </div>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start lg:mt-0">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-[700] text-white shadow-sm transition-colors hover:bg-[#e85d04]"
                >
                  Ask us a question <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#eadbce] bg-white/90 px-6 py-3 text-sm font-[700] text-[var(--navy)] transition-colors hover:border-orange-300 hover:bg-white"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" />
                  Talk on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
