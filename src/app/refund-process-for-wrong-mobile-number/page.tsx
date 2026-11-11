import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";

const PAGE_SLUG = "refund-process-for-wrong-mobile-number";
const PAGE_URL = `${siteConfig.url}/${PAGE_SLUG}`;

export const metadata: Metadata = {
  title: "IRCTC Refund Process for Wrong Mobile Number on Ticket (OTP Solution)",
  description:
    "Entered the wrong customer mobile number while booking an IRCTC train ticket? Learn the official OTP refund verification process, PRS counter options, and agent compliance steps.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "IRCTC Refund Process for Wrong Mobile Number on Ticket | RailAgents",
    description:
      "Step-by-step guide for railway agents and passengers on handling ticket cancellations and OTP refund verification when the wrong mobile number was entered during booking.",
    url: PAGE_URL,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "article",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "IRCTC Refund Process for Wrong Mobile Number on Ticket | RailAgents",
    description:
      "Practical guide to resolving IRCTC cancellation refund OTP issues when an incorrect passenger mobile number was entered on an e-ticket.",
    images: [siteConfig.socialImage],
  },
};

const resolutionSteps = [
  {
    step: "01",
    title: "Verify PNR & Mobile Number Status Before Cancelling",
    description:
      "Check the Electronic Reservation Slip (ERS) to see the exact 10-digit mobile number recorded at the time of booking. Under IRCTC RSP rules, the cancellation refund OTP is automatically sent to the passenger mobile number entered on the PNR.",
  },
  {
    step: "02",
    title: "Check if the Entered Number Is Reachable or Unassigned",
    description:
      "If the number has a single-digit typo, check whether the OTP can still be verified or if the number is inactive/invalid. Never share sensitive credentials or force repeated OTP requests that could lock verification.",
  },
  {
    step: "03",
    title: "Contact Your Principal Service Provider (PSP) Helpdesk",
    description:
      "Authorized B2B and ICS agents should immediately raise a support ticket with their Principal Service Provider (PSP) quoting the 10-digit PNR, transaction ID, cancelled ticket status, and customer identity proof.",
  },
  {
    step: "04",
    title: "Use Official IRCTC / Customer Care Escalation for Unverified OTP Refunds",
    description:
      "When an agent-booked ticket is cancelled or a waitlisted e-ticket is auto-cancelled and the OTP cannot be verified due to an incorrect mobile number, follow the PSP’s documented customer verification and IRCTC refund escalation workflow.",
  },
];

export default function RefundProcessWrongMobileNumberPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${PAGE_URL}#article`,
        headline: "IRCTC Refund Process for Wrong Mobile Number on Ticket (OTP Solution)",
        description:
          "Step-by-step guide for railway agents and passengers on handling ticket cancellations and OTP refund verification when the wrong mobile number was entered during booking.",
        url: PAGE_URL,
        mainEntityOfPage: PAGE_URL,
        inLanguage: "en-IN",
        datePublished: "2025-10-23T00:00:00.000Z",
        dateModified: "2026-10-23T00:00:00.000Z",
        author: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteConfig.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guides",
            item: `${siteConfig.url}/guides`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Refund Process for Wrong Mobile Number",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#102B4E]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1 pb-16">
        {/* Hero Header */}
        <section className="border-b border-slate-200 bg-gradient-to-b from-[#FFF7ED] via-white to-[#F8FAFC] pt-8 pb-10 sm:pt-10 sm:pb-12">
          <div className="site-container max-w-5xl">
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500">
                <li>
                  <Link href="/" className="hover:text-[#F36B21] transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </li>
                <li>
                  <Link href="/guides" className="hover:text-[#F36B21] transition-colors">
                    Guides
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </li>
                <li className="font-semibold text-[#102B4E]" aria-current="page">
                  Refund Process for Wrong Mobile Number
                </li>
              </ol>
            </nav>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#FECDD3] bg-[#FFF1F2] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#BE123C] mb-4">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Cancellation &amp; OTP Refund Guide
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#102B4E] leading-tight">
              IRCTC Refund Process for{" "}
              <span className="text-[#F36B21]">Wrong Mobile Number</span> on Ticket
            </h1>

            <p className="mt-3.5 text-base sm:text-lg leading-relaxed text-slate-600 max-w-3xl">
              For authorized IRCTC railway agents (RSPs), refund credit after ticket cancellation or
              fully waitlisted auto-cancellation requires OTP verification sent to the passenger’s
              mobile number. Here is what to do when an incorrect mobile number was entered during
              booking.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />5 min read
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 text-[#15803D]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Agent OTP Refund Compliance
              </span>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="site-container max-w-5xl pt-8 sm:pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <article className="lg:col-span-8 space-y-6">
              {/* Key Rule Box */}
              <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="h-5 w-5 text-[#B45309] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="text-base font-extrabold text-[#102B4E]">
                      Why Mobile Number Accuracy Is Critical for Agent Bookings
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                      Under IRCTC’s customer-protection OTP refund policy, whenever an agent-booked
                      e-ticket is cancelled (or a waitlisted ticket is dropped after chart
                      preparation), IRCTC sends a One-Time Password (OTP) to the passenger mobile
                      number provided at the time of booking. The refund is credited back to the
                      agent wallet only after the OTP is verified.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Resolution */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
                <h2 className="text-xl font-extrabold text-[#102B4E] mb-5">
                  Step-by-Step Process When the Mobile Number Is Wrong
                </h2>
                <div className="space-y-4">
                  {resolutionSteps.map((item) => (
                    <div
                      key={item.step}
                      className="rounded-xl border border-slate-200/80 bg-[#F8FAFC] p-4 sm:p-5"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-extrabold text-[#2563EB]">
                          {item.step}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#102B4E]">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prevention Best Practices */}
              <div className="rounded-2xl border border-[#BBF7D0] bg-[#ECFDF5]/60 p-6 sm:p-7">
                <div className="flex items-center gap-2.5 mb-3">
                  <Smartphone className="h-5 w-5 text-[#15803D]" aria-hidden="true" />
                  <h2 className="text-lg font-extrabold text-[#102B4E]">
                    Best Practices to Prevent Wrong Mobile Number Issues
                  </h2>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="h-4 w-4 text-[#15803D] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      Always read back the 10-digit mobile number to the passenger before clicking
                      submit on the booking form.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="h-4 w-4 text-[#15803D] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      Never enter the agent’s own mobile number in place of the passenger’s mobile
                      number—doing so violates IRCTC RSP compliance guidelines.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="h-4 w-4 text-[#15803D] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      Remind passengers to keep their booking SMS and mobile phone active until the
                      journey or refund settlement is complete.
                    </span>
                  </li>
                </ul>
              </div>
            </article>

            {/* Right Sidebar */}
            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-[#FECDD3] bg-[#FFF1F2]/70 p-5 shadow-xs">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#BE123C]">
                  <Calculator className="h-4 w-4" aria-hidden="true" />
                  Calculate Deductions
                </div>
                <h2 className="mt-2 text-base font-extrabold text-[#102B4E]">
                  IRCTC Cancellation &amp; Refund Calculator
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Check exact class-wise cancellation charges, timing slabs, and net refundable
                  amounts before cancelling a ticket.
                </p>
                <Link
                  href="/irctc-cancellation-refund-calculator"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#BE123C] hover:bg-[#9F1239] px-4 py-2.5 text-xs font-bold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE123C]"
                >
                  Open Refund Calculator
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2563EB]">
                  <PhoneCall className="h-4 w-4" aria-hidden="true" />
                  Related Agent Resources
                </div>
                <Link
                  href="/irctc-principal-service-providers-updated-29-03-2025"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-[#102B4E] hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                >
                  <span>IRCTC PSP Contact Directory</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/guides/ticket-cancellation-refund-guide"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-[#102B4E] hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                >
                  <span>Ticket Cancellation &amp; Refund Guide</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/irctc-agent-rules-regulations"
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-[#102B4E] hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                >
                  <span>IRCTC Agent Rules &amp; Compliance</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/ask-nihal"
                  className="flex items-center justify-between rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-3.5 py-2.5 text-xs font-bold text-[#F36B21] hover:bg-orange-100/70 transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Ask Nihal Singh
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

