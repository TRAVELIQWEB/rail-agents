import { ToolPageSchema } from "@/components/seo/ToolPageSchema";
import { AllToolsLink } from "@/components/tools/AllToolsLink";
import type { Metadata } from "next";
import { BadgeCheck, Clock3 } from "lucide-react";

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
      <ToolPageSchema title="IRCTC Cancellation and Refund Calculator" description="Review estimated cancellation charges and the refund breakdown for a train ticket." pathname="/irctc-cancellation-refund-calculator" />
      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <AllToolsLink />
        <section className="compact-tool-heading relative border-b border-slate-200/80 bg-[#f8fafc] py-4 sm:py-5">
          <div className="site-container relative">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="type-body-small inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-2.5 py-0.5 font-bold uppercase tracking-wider text-orange-800 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  Railway Utility Tool
                </p>
                <h1 className="type-page-title mt-1 tracking-tight text-[#0F2747]">
                  IRCTC Cancellation <span className="text-[#C6530A]">&amp; Refund Calculator</span>
                </h1>
                <p className="type-body-small mt-0.5 text-slate-600 ">
                  Estimate PRS cancellation charges, clerkage fees, and your net bank refund breakdown.
                </p>
              </div>

              <div className="type-caption flex items-center gap-2 font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 shadow-2xs">
                  <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5 text-orange-600" />
                  Official PRS Rules
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 shadow-2xs">
                  <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-orange-600" />
                  Time-Band Scenarios
                </span>
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
