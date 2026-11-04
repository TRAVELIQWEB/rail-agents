import type { Metadata } from "next";
import { BadgeCheck, Calculator, Clock3, TrainFront } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { IRCTCCancellationRefundCalculator } from "@/components/calculator/IRCTCCancellationRefundCalculator";
import { siteConfig } from "@/config/site";

const pageUrl = `${siteConfig.url}/irctc-cancellation-refund-calculator`;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "IRCTC Cancellation & Refund Calculator | RailAgents",
  },
  description:
    "Calculate your estimated train ticket cancellation refund using the original PRS-based calculation algorithm. Review cancellation charges and the complete refund breakdown.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "IRCTC Cancellation & Refund Calculator | RailAgents",
    description:
      "Calculate your estimated train ticket cancellation refund using the original PRS-based calculation algorithm.",
    url: pageUrl,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "IRCTC Cancellation & Refund Calculator | RailAgents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IRCTC Cancellation & Refund Calculator | RailAgents",
    description:
      "Calculate your estimated train ticket cancellation refund using the original PRS-based calculation algorithm.",
    images: [siteConfig.socialImage],
  },
};

export default function IRCTCCancellationRefundCalculatorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfa] text-slate-800">
      <Header />

      <main className="flex-1">
        <section className="relative border-b border-slate-200 bg-[#f8fafc] py-6 sm:py-8">
          <div className="site-container relative">
            <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)] lg:gap-8">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-orange-800 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  RailAgents · Railway utility
                </p>
                <h1 className="page-hero-title mt-3 text-[1.75rem] leading-tight sm:mt-4 sm:text-4xl lg:text-[2.75rem]">
                  IRCTC Cancellation
                  <span className="hero-accent block">&amp; Refund Calculator</span>
                </h1>
                <p className="page-hero-description mt-2 max-w-2xl sm:mt-3">
                  Calculate your estimated train ticket cancellation refund
                  using the original PRS-based calculation algorithm.
                </p>
                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                  Enter your ticket details below to review cancellation
                  charges, other deductions and the estimated refund.
                </p>
              </div>

              <div className="rounded-2xl border border-[#17365d] bg-[#0b2240] p-4 text-white shadow-[0_8px_24px_rgba(11,34,64,0.12)] sm:p-5">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-950/20">
                    <Calculator aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">A clearer refund estimate</p>
                    <p className="mt-0.5 text-xs text-slate-300">Built for railway ticket workflows</p>
                  </div>
                </div>
                <ul className="mt-4 grid gap-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2.5">
                    <BadgeCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-300" />
                    PRS-based cancellation rules
                  </li>
                  <li className="flex items-center gap-2.5">
                    <TrainFront aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-300" />
                    Class and passenger-wise breakdown
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Clock3 aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-300" />
                    Time-band and chart-status scenarios
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <IRCTCCancellationRefundCalculator />
      </main>

      <Footer />
    </div>
  );
}
