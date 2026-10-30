import type { Metadata } from "next";
import Link from "next/link";
import {
  CreditCard,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FareCalculator } from "@/components/calculator/FareCalculator";
import { CalculatorFAQ } from "@/components/calculator/CalculatorFAQ";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Train Ticket Fare Calculator",
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
        {/* Warm Premium Hero Header Section */}
        <section className="relative overflow-hidden border-b border-[#f2e6d9] bg-gradient-to-b from-[#fffcf8] via-[#faf5ee] to-[#f7f0e6] pt-8 pb-6 sm:pt-10 sm:pb-8 lg:pt-11 lg:pb-8">
          {/* Subtle Ambient Radial Glows */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[600px] rounded-full bg-gradient-to-br from-orange-200/35 via-amber-100/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-10 h-48 w-48 rounded-full bg-orange-100/40 blur-2xl" />

          <div className="site-container relative z-10">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="page-hero-title">
                IRCTC Agent <span className="text-[var(--primary)]">Ticket Fare Calculator</span>
              </h1>
              <p className="page-hero-description mx-auto mt-1.5 hidden max-w-lg sm:block">
                Accurate ticket estimates with automated PG charges and instant print slips.
              </p>
            </div>
          </div>
        </section>

        {/* Calculator Interactive Form Section */}
        <section className="relative py-2 sm:py-8 bg-gradient-to-b from-[#f7f0e6]/60 via-[#faf6f0] to-[#fdfbf7] pb-16 lg:pb-14">
          <div className="site-container relative px-2 sm:px-4">
            <FareCalculator />
          </div>
        </section>

        {/* Business Rules Section: How Fare Charges Work */}
        <section className="border-t border-[#ede1d3] bg-[#fffcf8] py-10 sm:py-14">
          <div className="site-container">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-7 sm:mb-9">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-100/70 text-orange-900 text-[11px] font-bold uppercase tracking-wider mb-2">
                  Transparent Calculations
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
                  How Railway Agent Charges Work
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
                  Standard rules authorized under Indian Railways & IRCTC ticketing guidelines.
                </p>
              </div>

              {/* 3 Concisely Styled Cards Matching the Warm Sand Theme */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
                <div className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/70 p-5 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)] hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_4px_rgba(249,115,22,0.1)] group-hover:scale-105 transition-transform duration-200">
                      <CreditCard className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-orange-900 transition-colors duration-200">
                      Payment Gateway
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    0.75% for fares up to ₹2,000 and 1.00% for fares above ₹2,000, computed accurately on total before PG.
                  </p>
                </div>

                <div className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/70 p-5 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)] hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_4px_rgba(245,158,11,0.1)] group-hover:scale-105 transition-transform duration-200">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-950 transition-colors duration-200">
                      Passenger Quota
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Maximum 6 passengers allowed on a single general quota booking (adults & children aged 5–11 combined).
                  </p>
                </div>

                <div className="group rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/70 p-5 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(249,115,22,0.08)] hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_4px_rgba(249,115,22,0.1)] group-hover:scale-105 transition-transform duration-200">
                      <ShieldCheck className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-orange-950 transition-colors duration-200">
                      Service Fee Limits
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    IRCTC cap of ₹20 for Non-AC classes (2S, SL) and ₹40 for AC classes, transparently charged per transaction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Minimal Expandable FAQ Section */}
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

        {/* Premium Need Help Getting Started Card Section */}
        <section className="py-8 sm:py-10 bg-white border-t border-[#ede1d3]">
          <div className="site-container">
            <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-[#faf6f0] via-[#fffcf8] to-[#faf6f0] border border-[#ede1d3] p-5 sm:p-7 shadow-[0_4px_20px_rgba(180,140,100,0.06)] text-center">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                Want to become an Authorized IRCTC Train Ticket Agent?
              </h3>
              <p className="mt-1 text-xs text-stone-600 max-w-lg mx-auto">
                Start your authorized railway ticket agency business today with complete documentation assistance and portal setup.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold">
                <Link
                  href="/irctc-agent-registration"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-white shadow-[0_3px_10px_rgba(249,115,22,0.3)] hover:from-orange-600 hover:to-amber-600 hover:-translate-y-0.5 transition-all duration-150"
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
