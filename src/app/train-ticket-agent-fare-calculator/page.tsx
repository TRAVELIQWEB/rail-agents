import { ToolPageSchema } from "@/components/seo/ToolPageSchema";
import { AllToolsLink } from "@/components/tools/AllToolsLink";
import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FareCalculator } from "@/components/calculator/FareCalculator";
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
  return (
    <div className="flex min-h-screen flex-col bg-[#fdfbf7] text-stone-900">
      <ToolPageSchema title="Train Ticket Fare Calculator" description="Calculate ticket fares, IRCTC fees, payment gateway charges and agent service fees." pathname="/train-ticket-agent-fare-calculator" />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <AllToolsLink />
        <section className="compact-tool-heading border-b border-[#f2e6d9] bg-gradient-to-b from-[#fffcf8] via-[#faf5ee] to-[#f7f0e6] py-4 sm:py-5">
          <div className="site-container">
            <h1 className="text-xl font-extrabold tracking-tight text-[#0b2240] sm:text-2xl">
              IRCTC Agent <span className="text-[var(--primary)]">Ticket Fare Calculator</span>
            </h1>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Calculate ticket fares, IRCTC fees, payment gateway charges and agent service fees.
            </p>
          </div>
        </section>
        <section
          aria-label="Train ticket fare calculator"
          className="relative bg-gradient-to-b from-[#f7f0e6]/60 via-[#faf6f0] to-[#fdfbf7] pt-2 pb-6"
        >
          <FareCalculator />
        </section>
      </main>
      <Footer />
    </div>
  );
}
