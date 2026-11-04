import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TicketDateCalculator } from "@/components/calculator/TicketDateCalculator";
import { siteConfig } from "@/config/site";
import { Calendar, Zap, ShieldCheck } from "lucide-react";

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
    canonical: PAGE_SLUG,
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
    <div className="flex min-h-screen flex-col bg-[#fdfbf7] text-stone-900">
      <Header />

      <main className="flex-1">
        {/* Compact & Clean Hero Header */}
        <section className="relative overflow-hidden border-b border-[#f2e6d9] bg-gradient-to-b from-[#fffcf8] via-[#faf5ee] to-[#f7f0e6] pt-4 pb-3.5 sm:pt-5 sm:pb-4 lg:pt-6 lg:pb-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[500px] rounded-full bg-gradient-to-br from-orange-200/30 via-amber-100/15 to-transparent blur-3xl"
          />

          <div className="site-container relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-xl sm:text-2xl lg:text-[1.85rem] font-extrabold text-[#0b2240] tracking-tight leading-tight">
                Railway Ticket{" "}
                <span className="text-[var(--primary)] whitespace-nowrap">
                  Booking Date Calculator
                </span>
              </h1>
              <p className="mx-auto mt-1 max-w-2xl text-[11.5px] sm:text-xs text-stone-600 leading-normal">
                Calculate Normal 60-day Advance Reservation opening dates and Tatkal booking schedules.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Calculator Component */}
        <section
          aria-label="Railway Ticket Booking Date Calculator"
          className="relative py-4 sm:py-6 lg:py-8 bg-gradient-to-b from-[#f7f0e6]/60 via-[#faf6f0] to-[#fdfbf7] pb-14 lg:pb-12"
        >
          <div className="site-container relative px-2 sm:px-4">
            <TicketDateCalculator />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
