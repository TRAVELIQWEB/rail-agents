import { ToolPageSchema } from "@/components/seo/ToolPageSchema";
import { AllToolsLink } from "@/components/tools/AllToolsLink";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TicketDateCalculator } from "@/components/calculator/TicketDateCalculator";
import { siteConfig } from "@/config/site";
import { CalendarDays } from "lucide-react";

const PAGE_SLUG = "/ticket-date-calculator";
const PAGE_URL = `${siteConfig.url}${PAGE_SLUG}`;

export const metadata: Metadata = {
  title: {
    absolute:
      "Railway Ticket Booking Date Calculator – 60-Day Advance Reservation & Tatkal | RailAgents",
  },
  description:
    "Calculate Indian Railways ticket booking opening dates with the official 60-day ARP rule and Tatkal timings (AC at 10 AM, Non-AC at 11 AM).",
  alternates: {
    canonical: PAGE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Railway Ticket Booking Date Calculator | RailAgents",
    description: "Calculate Indian Railways ticket booking opening dates with the official 60-day ARP rule and Tatkal timings (AC at 10 AM, Non-AC at 11 AM).",
    images: [siteConfig.socialImage],
  },
  openGraph: {
    title:
      "Railway Ticket Booking Date Calculator – 60-Day Advance Reservation & Tatkal | RailAgents",
    description:
      "Calculate Indian Railways ticket booking opening dates with the official 60-day ARP rule and Tatkal timings (AC at 10 AM, Non-AC at 11 AM).",
    url: PAGE_URL,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "Railway Ticket Booking Date Calculator – RailAgents",
      },
    ],
  },
};

export const dynamic = "force-dynamic";

export default function TicketDateCalculatorPage() {
  return (
    <div className="booking-date-page flex min-h-screen flex-col bg-[#fdfbf7] text-stone-900">
      <ToolPageSchema title="Railway Ticket Booking Date Calculator" description="Find advance reservation and Tatkal booking opening dates for your journey." pathname="/ticket-date-calculator" />
      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <AllToolsLink />
        {/* Compact & Clean Hero Header */}
        <section className="compact-tool-heading relative overflow-hidden border-b border-[#f2e6d9] bg-gradient-to-b from-[#fffcf8] via-[#faf5ee] to-[#f7f0e6] pt-8 pb-6 sm:pt-10 sm:pb-8 lg:pt-11 lg:pb-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[500px] rounded-full bg-gradient-to-br from-orange-200/30 via-amber-100/15 to-transparent blur-3xl"
          />

          <div className="site-container relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-[#0b2240] tracking-tight leading-tight">
                Railway Ticket{" "}
                <span className="text-[var(--primary)] ">
                  Booking Date Calculator
                </span>
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-orange-700"><CalendarDays className="h-3 w-3" /> Plan your next journey</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-5">
                Calculate Normal 60-day Advance Reservation opening dates and Tatkal booking schedules.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Calculator Component */}
        <section
          aria-label="Railway Ticket Booking Date Calculator"
          className="relative pt-2 pb-6 bg-gradient-to-b from-[#f7f0e6]/60 via-[#faf6f0] to-[#fdfbf7]"
        >
          <div className="w-full relative">
            <TicketDateCalculator />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
