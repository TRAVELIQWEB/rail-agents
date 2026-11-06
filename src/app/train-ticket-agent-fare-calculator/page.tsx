import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Percent,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FareCalculator } from "@/components/calculator/FareCalculator";
import { CalculatorFAQ } from "@/components/calculator/CalculatorFAQ";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Train Ticket Fare Calculator | IRCTC Agent Service Charges",
  description:
    "Calculate train ticket costs with a clear fare breakdown, including applicable IRCTC fees, authorized agent service charges, and automatic payment gateway charges.",
  alternates: {
    canonical: `${siteConfig.url}/train-ticket-agent-fare-calculator`,
  },
  openGraph: {
    title: "Train Ticket Fare Calculator | RailAgents",
    description:
      "Calculate train ticket costs with a clear fare breakdown, including applicable IRCTC fees, authorized agent service charges, and automatic payment gateway charges.",
    url: `${siteConfig.url}/train-ticket-agent-fare-calculator`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "RailAgents Train Ticket Fare Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Train Ticket Fare Calculator | RailAgents",
    description:
      "Calculate train ticket costs with a clear fare breakdown, including applicable IRCTC fees, authorized agent service charges, and automatic payment gateway charges.",
    images: [siteConfig.socialImage],
  },
};

export const dynamic = "force-dynamic";

export default function TrainTicketAgentFareCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${siteConfig.url}/train-ticket-agent-fare-calculator#app`,
        name: "RailAgents IRCTC Agent Ticket Fare Calculator",
        url: `${siteConfig.url}/train-ticket-agent-fare-calculator`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        description:
          "Calculate train ticket costs with a clear fare breakdown, including applicable IRCTC convenience fees, authorized agent service charges, and payment gateway charges.",
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        publisher: { "@id": `${siteConfig.url}/#organization` },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteConfig.url}/train-ticket-agent-fare-calculator#faq`,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        mainEntity: [
          {
            "@type": "Question",
            name: "How is the payment gateway charge calculated?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Payment gateway charges apply to the combined ticket fare and IRCTC convenience fee: 0.75% for amounts up to and including ₹2,000, and 1.00% for amounts exceeding ₹2,000, accurately rounded to two decimal places.",
            },
          },
          {
            "@type": "Question",
            name: "What is the maximum number of passengers allowed?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Under Indian Railways general quota rules, a maximum of 6 passengers (adults and children combined) can be booked on a single ticket. The calculator validates this limit live.",
            },
          },
          {
            "@type": "Question",
            name: "Is the printed estimate a confirmed railway ticket?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. The printed slip is a customer fare quotation to provide a clear, itemized breakdown before booking. A confirmed railway journey requires actual PRS booking and valid PNR generation.",
            },
          },
          {
            "@type": "Question",
            name: "How can I register as an IRCTC agent?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can become an authorized IRCTC train ticket agent by registering through recognized principal service providers with valid KYC documents, commercial PAN, and digital signature certificates.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteConfig.url}/train-ticket-agent-fare-calculator#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Train Ticket Fare Calculator",
            item: `${siteConfig.url}/train-ticket-agent-fare-calculator`,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fdfbf7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />

      <main className="flex-1">
        {/* Warm Premium Hero Header Section (Matching Booking Date Calculator) */}
        <section className="relative overflow-hidden border-b border-[#f2e6d9] bg-gradient-to-b from-[#fffcf8] via-[#faf5ee] to-[#f7f0e6] pt-8 pb-6 sm:pt-10 sm:pb-8 lg:pt-11 lg:pb-8">
          {/* Subtle Ambient Radial Glows */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[600px] rounded-full bg-gradient-to-br from-orange-200/35 via-amber-100/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-10 h-48 w-48 rounded-full bg-orange-100/40 blur-2xl" />

          <div className="site-container relative z-10">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="page-hero-title">
                IRCTC Agent <span className="text-[var(--primary)]">Ticket Fare Calculator</span>
              </h1>
              <p className="page-hero-description mx-auto mt-1.5 hidden max-w-xl sm:block">
                Accurate ticket estimates with automated PG charges and instant print slips.
              </p>
            </div>
          </div>
        </section>

        {/* Calculator Interactive Form Section */}
        <section className="relative py-2 sm:py-6 lg:py-7 bg-gradient-to-b from-[#f7f0e6]/60 via-[#faf6f0] to-[#fdfbf7] pb-16 lg:pb-12">
          <div className="w-full relative">
            <FareCalculator />
          </div>
        </section>

        {/* ── 1. Detailed Calculation Explanation Section (Same rich structure as Calendar Calculator) ── */}
        <section className="border-t border-[#ede1d3] bg-[#fffcf8] py-10 sm:py-14">
          <div className="site-container">
            <div className="mx-auto max-w-4xl space-y-12">
              {/* Heading & Intro */}
              <div>
                <div className="text-center mb-7 sm:mb-9">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-100/70 text-orange-900 text-[11px] font-bold uppercase tracking-wider mb-2">
                    Step-by-Step Walkthrough
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
                    How Is the Train Ticket Fare &amp; Agent Charge Calculated?
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto">
                    Indian Railways &amp; IRCTC calculate customer ticket totals in a 4-step sequential order. Here is how every fee is applied step by step:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
                  {/* Left: 5-Step Explanation + Component Breakdown */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/80 p-5 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)]">
                      <span className="inline-block rounded-lg bg-gradient-to-r from-[#c2410c] to-[#9a3412] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-2xs">
                        Worked Example: 1 Adult in AC Class (Base Fare ₹1,500)
                      </span>

                      <ol className="mt-4 space-y-2.5 text-xs sm:text-sm text-stone-700">
                        <li className="flex items-start gap-2.5">
                          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-extrabold text-orange-800">
                            1
                          </span>
                          <span>
                            <strong className="font-bold text-stone-900">Step 1 (Base Ticket Fare):</strong>{" "}
                            Total railway fare = Number of passengers × Class fare (e.g., 1 × ₹1,500 = <strong className="font-bold text-stone-900">₹1,500.00</strong>).
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-extrabold text-orange-800">
                            2
                          </span>
                          <span>
                            <strong className="font-bold text-stone-900">Step 2 (IRCTC Convenience Fee):</strong>{" "}
                            IRCTC charges ₹30 + 18% GST = <strong className="font-bold text-stone-900">₹35.40</strong> for AC classes (or ₹15 + GST = ₹17.70 for Non-AC).
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-extrabold text-orange-800">
                            3
                          </span>
                          <span>
                            <strong className="font-bold text-stone-900">Step 3 (Payment Gateway PG Charge):</strong>{" "}
                            Calculated on Total Before PG (Fare + IRCTC Fee = ₹1,535.40). Since ₹1,535.40 ≤ ₹2,000, PG rate is 0.75% = <strong className="font-bold text-stone-900">₹11.52</strong>.
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-extrabold text-orange-800">
                            4
                          </span>
                          <span>
                            <strong className="font-bold text-stone-900">Step 4 (Authorized Agent Fee):</strong>{" "}
                            Indian Railways authorized agent service fee cap: <strong className="font-bold text-stone-900">₹40.00</strong> for AC (₹20 for Non-AC).
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-extrabold text-orange-800">
                            5
                          </span>
                          <span>
                            <strong className="font-bold text-stone-900">Final Total Payable:</strong>{" "}
                            ₹1,500 + ₹35.40 + ₹11.52 + ₹40 = <strong className="font-bold text-orange-700">₹1,586.92</strong>.
                          </span>
                        </li>
                      </ol>
                    </div>

                    {/* Breakdown of Each Component */}
                    <div className="rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/80 p-4 sm:p-5">
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                        Component Breakdown Summary
                      </h3>
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                        <div className="rounded-xl border border-[#e4d5c4] bg-white p-2.5 transition-transform duration-200 hover:-translate-y-0.5">
                          <span className="block text-[10px] font-bold uppercase text-stone-500">
                            Base Ticket Fare
                          </span>
                          <span className="mt-0.5 block text-sm sm:text-base font-extrabold text-stone-900">
                            ₹1,500.00
                          </span>
                          <span className="block text-[10px] text-stone-500">
                            Railway Ticket
                          </span>
                        </div>
                        <div className="rounded-xl border border-[#e4d5c4] bg-white p-2.5 transition-transform duration-200 hover:-translate-y-0.5">
                          <span className="block text-[10px] font-bold uppercase text-stone-500">
                            IRCTC Fee + GST
                          </span>
                          <span className="mt-0.5 block text-sm sm:text-base font-extrabold text-stone-900">
                            ₹35.40
                          </span>
                          <span className="block text-[10px] text-stone-500">
                            AC: ₹30 + 18%
                          </span>
                        </div>
                        <div className="rounded-xl border border-[#e4d5c4] bg-white p-2.5 transition-transform duration-200 hover:-translate-y-0.5">
                          <span className="block text-[10px] font-bold uppercase text-stone-500">
                            PG Charge
                          </span>
                          <span className="mt-0.5 block text-sm sm:text-base font-extrabold text-stone-900">
                            ₹11.52
                          </span>
                          <span className="block text-[10px] text-stone-500">
                            0.75% on ₹1,535.40
                          </span>
                        </div>
                        <div className="rounded-xl border border-orange-300 bg-orange-50/70 p-2.5 transition-transform duration-200 hover:-translate-y-0.5">
                          <span className="block text-[10px] font-bold uppercase text-orange-800">
                            Agent Fee
                          </span>
                          <span className="mt-0.5 block text-sm sm:text-base font-extrabold text-orange-700">
                            ₹40.00
                          </span>
                          <span className="block text-[10px] font-bold text-stone-800">
                            AC Service Cap
                          </span>
                        </div>
                      </div>
                      <p className="mt-2.5 text-xs text-stone-600">
                        Total: <strong className="font-bold text-stone-900">₹1,500 + ₹35.40 + ₹11.52 + ₹40 = ₹1,586.92</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Right: Visual Calculation Flow (Like Calendar Calculator Timeline) */}
                  <div className="lg:col-span-5 rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/90 p-5 shadow-[0_4px_20px_rgba(180,140,100,0.05)]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 text-center mb-4">
                      Visual Calculation Flow
                    </h3>

                    <div className="flex flex-col items-center text-center">
                      <div className="w-full rounded-xl border border-[#e4d5c4] bg-white px-4 py-3 shadow-2xs transition-transform duration-200 hover:-translate-y-0.5">
                        <span className="block text-sm sm:text-base font-extrabold text-stone-900">
                          Base Railway Fare
                        </span>
                        <span className="text-xs text-stone-500">
                          Passengers × Class Fare
                        </span>
                      </div>

                      <ArrowDown
                        className="my-2 h-4 w-4 text-orange-500 animate-bounce"
                        aria-hidden="true"
                      />

                      <div className="w-full rounded-xl border border-[#e4d5c4] bg-white px-4 py-2.5 shadow-2xs">
                        <span className="text-xs sm:text-sm font-bold text-stone-800">
                          + IRCTC Convenience Fee (incl. 18% GST)
                        </span>
                        <span className="block text-[11px] text-stone-500">
                          ₹17.70 (Non-AC) or ₹35.40 (AC)
                        </span>
                      </div>

                      <ArrowDown
                        className="my-2 h-4 w-4 text-orange-500"
                        aria-hidden="true"
                      />

                      <div className="w-full rounded-xl border border-[#e4d5c4] bg-white px-4 py-2.5 shadow-2xs">
                        <span className="text-xs sm:text-sm font-bold text-stone-800">
                          + Payment Gateway (PG) Charge
                        </span>
                        <span className="block text-[11px] text-stone-500">
                          0.75% (≤₹2,000) or 1.00% (&gt;₹2,000)
                        </span>
                      </div>

                      <ArrowDown
                        className="my-2 h-4 w-4 text-orange-500"
                        aria-hidden="true"
                      />

                      <div className="w-full rounded-xl border border-[#e4d5c4] bg-white px-4 py-2.5 shadow-2xs">
                        <span className="text-xs sm:text-sm font-bold text-stone-800">
                          + Authorized Agent Service Fee
                        </span>
                        <span className="block text-[11px] text-stone-500">
                          Fixed: ₹20 (Non-AC) or ₹40 (AC)
                        </span>
                      </div>

                      <ArrowDown
                        className="my-2 h-4 w-4 text-orange-500"
                        aria-hidden="true"
                      />

                      <div className="w-full rounded-xl bg-gradient-to-r from-[#c2410c] via-[#a43b12] to-[#9a3412] px-4 py-3.5 text-white shadow-[0_4px_14px_rgba(249,115,22,0.28)] transition-transform duration-200 hover:scale-[1.01]">
                        <span className="block text-sm sm:text-base font-black">
                          Total Customer Payable Amount
                        </span>
                        <span className="text-xs text-orange-50 font-medium">
                          Itemized quotation ready for instant print slip
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Non-Technical Explanation Note */}
                <div className="mt-5 rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/70 p-4 sm:p-5">
                  <h3 className="text-sm font-bold text-stone-900">
                    Why the Calculation Order Matters
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Payment Gateway (PG) charges are levied by banks and payment processors on the total amount processed on IRCTC (which includes the ticket fare plus the IRCTC convenience fee). The agent service charge is added on top as an authorized facilitation fee. Calculating these in the wrong order or applying flat percentages causes discrepancies when reconciling IRCTC booking accounts.
                  </p>
                </div>
              </div>

              {/* ── 2. Payment Gateway Rules Section (0.75% vs 1%) ── */}
              <div className="border-t border-[#ede1d3] pt-10">
                <h2 className="text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
                  How Is the Payment Gateway (PG) Slab Applied?
                </h2>
                <p className="mt-2 max-w-3xl text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Indian Railways and commercial banks use a 2-tier slab system for ticketing payment gateway charges calculated on the ticket amount before PG:
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/70 p-5 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)] hover:-translate-y-1">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-stone-900">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>Slab 1: Up to ₹2,000 (0.75%)</span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-xs text-stone-600 list-disc pl-5 leading-relaxed">
                      <li>Applicable when <strong className="font-bold text-stone-900">Fare + IRCTC Fee ≤ ₹2,000</strong>.</li>
                      <li>Calculated as: <code className="rounded bg-white px-1.5 py-0.5 border border-[#e4d5c4] font-bold text-stone-800">Amount × 0.0075</code>.</li>
                      <li>Example: ₹1,535.40 × 0.75% = <strong className="font-bold text-orange-700">₹11.52</strong>.</li>
                    </ul>
                  </div>

                  <div className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/70 p-5 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)] hover:-translate-y-1">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-stone-900">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-700 group-hover:scale-105 transition-transform">
                        <Percent className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>Slab 2: Above ₹2,000 (1.00%)</span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-xs text-stone-600 list-disc pl-5 leading-relaxed">
                      <li>Applicable when <strong className="font-bold text-stone-900">Fare + IRCTC Fee &gt; ₹2,000</strong>.</li>
                      <li>Calculated as: <code className="rounded bg-white px-1.5 py-0.5 border border-[#e4d5c4] font-bold text-stone-800">Amount × 0.0100</code>.</li>
                      <li>Example: ₹3,035.40 × 1.00% = <strong className="font-bold text-orange-700">₹30.35</strong>.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ── 3. Authorized IRCTC Agent Service Charges Cap ── */}
              <div className="border-t border-[#ede1d3] pt-10">
                <h2 className="text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
                  Authorized IRCTC Agent Service Charges (Per PNR / Transaction)
                </h2>
                <p className="mt-2 max-w-3xl text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Indian Railways strictly regulates the service fee an authorized Retail Service Provider (RSP) can charge customers:
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/80 p-5 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 group-hover:scale-105 transition-transform">
                        <Receipt className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">
                          Non-AC Classes (Sleeper, 2S)
                        </h3>
                        <p className="text-xs text-stone-500">
                          Second Sitting (2S) &amp; Sleeper Class (SL)
                        </p>
                      </div>
                    </div>
                    <div className="mt-3.5 pt-3 border-t border-[#ede1d3] flex items-baseline justify-between">
                      <span className="text-xs text-stone-600">Authorized Fee Cap:</span>
                      <span className="text-lg font-black text-orange-700">₹20 per ticket</span>
                    </div>
                  </div>

                  <div className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/80 p-5 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
                        <Receipt className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">
                          AC Classes (1A, 2A, 3A, 3E, CC, EC)
                        </h3>
                        <p className="text-xs text-stone-500">
                          All Air Conditioned &amp; Executive Chair Classes
                        </p>
                      </div>
                    </div>
                    <div className="mt-3.5 pt-3 border-t border-[#ede1d3] flex items-baseline justify-between">
                      <span className="text-xs text-stone-600">Authorized Fee Cap:</span>
                      <span className="text-lg font-black text-orange-700">₹40 per ticket</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Frequently Asked Questions Section ── */}
        <section className="py-10 sm:py-14 bg-gradient-to-b from-[#fdfbf7] to-[#faf6f0] border-t border-[#ede1d3]">
          <div className="site-container">
            <div className="mx-auto max-w-2xl">
              <div className="text-center mb-6 sm:mb-8">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/60">
                  Got Questions?
                </span>
                <h2 className="mt-2 text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Everything you need to know about railway fare estimates and agent fees.
                </p>
              </div>

              <CalculatorFAQ />
            </div>
          </div>
        </section>

        {/* ── 5. Related RailAgents Tools & Registration CTA Section ── */}
        <section className="py-8 sm:py-10 bg-white border-t border-[#ede1d3]">
          <div className="site-container">
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Related Tools Links */}
              <div className="text-center">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                  Explore Related RailAgents Tools &amp; Guides
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Helpful reservation calculators, authorized agent compliance guides, and booking tutorials.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/ticket-date-calculator"
                  className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/70 px-4 py-3.5 text-xs sm:text-sm font-bold text-stone-900 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:text-orange-700 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)] hover:-translate-y-0.5"
                >
                  Railway Ticket Booking Date Calculator — 60-Day ARP &amp; Tatkal Opening Dates →
                </Link>
                <Link
                  href="/irctc-agent-rules-regulations"
                  className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/70 px-4 py-3.5 text-xs sm:text-sm font-bold text-stone-900 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:text-orange-700 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)] hover:-translate-y-0.5"
                >
                  IRCTC Authorized Agent Rules, Booking Timings &amp; Compliance Guide →
                </Link>
                <Link
                  href="/blog/indian-railways-senior-citizen-quota-lower-berth-booking-rules-eligibility-guide"
                  className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/70 px-4 py-3.5 text-xs sm:text-sm font-bold text-stone-900 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:text-orange-700 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)] hover:-translate-y-0.5"
                >
                  Indian Railways Senior Citizen &amp; Lower Berth Quota Booking Guide →
                </Link>
                <Link
                  href="/blog/train-cancelled-train-restored-irctc-refund-tdr-guide"
                  className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/70 px-4 py-3.5 text-xs sm:text-sm font-bold text-stone-900 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:text-orange-700 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)] hover:-translate-y-0.5"
                >
                  Train Cancelled Then Restored? Complete IRCTC Refund &amp; TDR Filing Guide →
                </Link>
              </div>

              {/* Bottom Agency Registration Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-[#faf6f0] via-[#fffcf8] to-[#faf6f0] border border-[#ede1d3] p-5 sm:p-7 shadow-[0_4px_20px_rgba(180,140,100,0.06)] text-center">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                  Want to become an Authorized IRCTC Train Ticket Agent?
                </h3>
                <p className="mt-1 text-xs text-stone-600 max-w-lg mx-auto">
                  Start your authorized railway ticket agency business today with complete documentation assistance and portal setup.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold">
                  <Link
                    href="/irctc-agent-registration"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#c2410c] to-[#9a3412] px-4 py-2 text-white shadow-[0_3px_10px_rgba(249,115,22,0.3)] hover:from-[#9a3412] hover:to-[#7c2d12] hover:-translate-y-0.5 transition-all duration-150"
                  >
                    <span>Step-by-Step Registration Guide</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#e4d5c4] bg-white px-4 py-2 text-stone-700 hover:bg-[#faf6f0] hover:border-orange-300 hover:text-stone-900 transition-all duration-150"
                  >
                    <span>Talk to an Expert</span>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
