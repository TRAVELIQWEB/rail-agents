import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Scale,
  BookOpen,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Train,
  ExternalLink,
  MessageCircle,
  Receipt,
  UserCheck,
  Building,
  Info,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";
import { AgentComplianceChecklist } from "@/components/rules/AgentComplianceChecklist";

export const metadata: Metadata = {
  title: "IRCTC Agent Rules & Regulations: Complete Guide",
  description:
    "Learn important IRCTC agent rules, booking dos and don'ts, service charges, customer records, cancellation and refund procedures, TDR guidance, and compliance responsibilities.",
  alternates: {
    canonical: `${siteConfig.url}/irctc-agent-rules-regulations`,
  },
  openGraph: {
    title: "IRCTC Agent Rules & Regulations: Complete Guide | RailAgents",
    description:
      "Important IRCTC agent rules, booking dos and don'ts, service charges, customer records, cancellation and refund procedures, TDR guidance, and compliance responsibilities.",
    url: `${siteConfig.url}/irctc-agent-rules-regulations`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "article",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "IRCTC Agent Rules & Regulations Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IRCTC Agent Rules & Regulations: Complete Guide | RailAgents",
    description:
      "Essential compliance guide for railway ticketing agents: booking dos and don'ts, permissible charges, customer consent records, cancellation OTPs, and penalty avoidance.",
    images: [siteConfig.socialImage],
  },
};

const TOC_SECTIONS = [
  { id: "section-a", label: "A. Understand Your Agent Status" },
  { id: "section-b", label: "B. Registration & Account Security" },
  { id: "section-c", label: "C. Booking Rules Every Agent Must Know" },
  { id: "section-d", label: "D. Prohibited Mistakes & ID Risks" },
  { id: "section-e", label: "E. Service Charges & Payment Gateways" },
  { id: "section-f", label: "F. Shop, Signage & Certificate Display" },
  { id: "section-g", label: "G. Cancellation & Refund Regulations" },
  { id: "section-h", label: "H. TDR: Responsibilities & Procedures" },
  { id: "section-i", label: "I. Tatkal Booking Dos and Don'ts" },
  { id: "section-j", label: "J. Customer Data, Consent & Records" },
  { id: "section-k", label: "K. Complaints, Inspections & Compliance" },
  { id: "section-l", label: "L. Daily Agent Compliance Checklist" },
  { id: "section-m", label: "M. Frequently Asked Questions" },
  { id: "section-n", label: "N. Editorial Perspective by Nihal Singh" },
];

const FAQS = [
  {
    q: "Can an IRCTC agent use a personal ID for commercial ticket bookings?",
    a: "No. Booking tickets commercially using a personal IRCTC consumer user ID is strictly prohibited under Indian Railways policy and is punishable under Section 143 of the Railways Act, 1989. Personal consumer IDs are legally restricted exclusively to personal household travel.",
  },
  {
    q: "Can an agent share an agent login with another person or cyber cafe?",
    a: "No. Agent logins, digital certificates, and OTP credentials are strictly non-transferable. Sub-licensing, sharing passwords, or permitting remote or third-party operators to transact through your RSP account is a major violation that can lead to permanent deactivation and forfeiture of deposits.",
  },
  {
    q: "What should an agent do if incorrect registration details appear on the certificate or portal?",
    a: "Immediately notify your authorized Principal Service Provider (PSP) in writing before issuing commercial tickets. Operating with mismatched shop addresses, incorrect mobile numbers, or altered business names can result in suspension during routine physical inspections.",
  },
  {
    q: "What service charges can an agent legally collect from passengers?",
    a: "Agents may only collect the official Indian Railways ticket fare, payment gateway convenience charges as billed by the payment provider, and the authorized agency service charge (standard policy ceiling: ₹20 + GST per ticket for Non-AC classes and ₹40 + GST per ticket for AC classes). Any extra charge without an official receipt is treated as illegal overcharging.",
  },
  {
    q: "Does a waitlisted (WL) or RAC ticket guarantee confirmed travel accommodation?",
    a: "No. Waitlisted status does not guarantee confirmation or berth allotment. Furthermore, fully waitlisted e-tickets whose names do not get confirmed after charting are automatically cancelled by Indian Railways system and cannot be boarded. Agents must never misrepresent waitlist predictions as guarantees.",
  },
  {
    q: "Can an agent cancel a customer's ticket without their explicit permission?",
    a: "Never. Cancelling a confirmed ticket without the passenger's written consent or requisition slip is considered fraudulent activity. Cancellations must be initiated only on direct customer instruction, and the generated refund must be fully disbursed to the passenger following OTP authentication.",
  },
  {
    q: "What is a Ticket Deposit Receipt (TDR) and when is it filed?",
    a: "A TDR is an official claims filing mechanism for circumstances where a passenger was unable to travel due to railway operational reasons (such as train cancellations, train running late by more than 3 hours, AC failure, or charting mismatches) after the charting deadline has passed. Filing a TDR initiates a claim with Indian Railways Claims Department.",
  },
  {
    q: "Does filing a TDR automatically guarantee a cash refund?",
    a: "No. Filing a TDR submits the passenger's claim to the relevant Zonal Railway Claims Office for verification against official conductor charts and train movement records. Refunds are approved or repudiated solely by Indian Railways according to IRCA coaching tariff refund rules.",
  },
  {
    q: "What happens if an agent violates applicable IRCTC rules?",
    a: "Depending on the severity of the infraction under the applicable PSP policy and IRCTC Master Policy, consequences range from formal corrective warnings, administrative monetary penalties, temporary terminal locking, and permanent ID termination, to police reporting under the Railways Act.",
  },
  {
    q: "Where can an agent verify the latest official policies and notifications?",
    a: "Agents should regularly check the official IRCTC Agent Operations portal (operations.irctc.co.in), the IRCTC Policy Directory (contents.irctc.co.in), and circulars issued directly by their contracted Principal Service Provider (PSP).",
  },
  {
    q: "What should an agent do when a customer disputes a service charge or refund amount?",
    a: "Produce the printed Electronic Reservation Slip (ERS) and the corresponding agency receipt. Show the customer the itemized breakdown between railway fare, GST, payment gateway charges, and authorized agency service fees. For cancellation disputes, show the official cancellation receipt generated by the IRCTC agent portal.",
  },
  {
    q: "How can an agent verify whether a Principal Service Provider (PSP) is genuine?",
    a: "Consult the official list of authorized IRCTC B2B / B2C Principal Service Providers published on the official IRCTC website (irctc.co.in). Legitimate PSPs never ask you to book through consumer websites and will issue an authentic IRCTC agent profile with official credentials.",
  },
];

export default function IrctcAgentRulesPage() {
  const lastReviewedDate = "October 2026";
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(
    "Hi RailAgents, I have a question regarding IRCTC agent rules, compliance, or booking regulations. Please guide me."
  )}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "IRCTC Agent Rules & Regulations: Complete Guide",
        description:
          "Learn important IRCTC agent rules, booking dos and don'ts, service charges, customer records, cancellation and refund procedures, TDR guidance, and compliance responsibilities.",
        url: `${siteConfig.url}/irctc-agent-rules-regulations`,
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
            name: "IRCTC Agent",
            item: `${siteConfig.url}/irctc-agent-registration`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Rules & Regulations",
            item: `${siteConfig.url}/irctc-agent-rules-regulations`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
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

      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="site-container py-3">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-[var(--primary)] transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/irctc-agent-registration" className="hover:text-[var(--primary)] transition-colors">
                  IRCTC Agent
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-[var(--navy)]" aria-current="page">
                Rules &amp; Regulations
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <main className="flex-1">
        {/* =========================================================
            HERO INTRODUCTORY SECTION
        ========================================================== */}
        <section className="relative overflow-hidden border-b border-[#f2e6dc] bg-gradient-to-b from-[#fffbf7] via-white to-[#fffaf5] py-7 sm:py-9 lg:py-10">
          <div className="site-container max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-700 mb-3 shadow-2xs">
              <Scale size={13} className="text-orange-600" />
              <span>Official Regulatory &amp; Compliance Standards</span>
            </div>

            <h1 className="page-hero-title">
              IRCTC Agent Rules &amp; Regulations:{" "}
              <span className="hero-accent block sm:inline">What Every Railway Agent Must Know</span>
            </h1>

            <p className="page-hero-description mt-3.5">
              Working as an IRCTC railway agent involves more than booking train tickets. Agents need to understand
              registration requirements, customer responsibilities, permitted booking practices, applicable charges,
              cancellation and refund procedures, and the activities they must avoid.
            </p>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
              This guide explains the key rules and practical dos and don&apos;ts that aspiring and existing railway agents
              should understand. Because requirements may change and can differ by scheme, always verify important
              decisions against the latest applicable IRCTC policy and official instructions.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-200/70 pt-4">
              <div className="flex items-center gap-1.5 font-medium">
                <Clock size={14} className="text-slate-400" />
                <span>Last reviewed: <strong className="text-slate-800 font-semibold">{lastReviewedDate}</strong></span>
              </div>
              <span aria-hidden="true" className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Verified with IRCTC Master Policy &amp; Zonal Railway circulars</span>
              </div>
              <span aria-hidden="true" className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <BookOpen size={14} className="text-orange-600" />
                <span>Reading time: ~18 mins (Comprehensive reference)</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            MAIN CONTENT AREA WITH COMPACT TABLE OF CONTENTS
        ========================================================== */}
        <div className="site-container max-w-6xl py-10 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* STICKY DESKTOP TABLE OF CONTENTS (25%) */}
            <aside className="lg:col-span-3 sticky top-24 self-start order-2 lg:order-1 print:hidden">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                  <span>Table of Contents</span>
                  <span className="text-[11px] font-normal text-slate-400">14 Chapters</span>
                </h3>
                <nav aria-label="Quick jump navigation">
                  <ol className="space-y-1 text-xs">
                    {TOC_SECTIONS.map((sec) => (
                      <li key={sec.id}>
                        <a
                          href={`#${sec.id}`}
                          className="block rounded-lg px-2.5 py-1.5 font-medium text-slate-600 hover:bg-orange-50 hover:text-[var(--primary)] transition-colors leading-snug"
                        >
                          {sec.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500 leading-normal mb-2.5">
                    Have an unresolved compliance dispute or railway query?
                  </p>
                  <Link
                    href="/ask-nihal"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-50 border border-orange-200 px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100 transition-colors"
                  >
                    <HelpCircle size={13} />
                    <span>Ask Nihal Singh a Question</span>
                  </Link>
                </div>
              </div>
            </aside>

            {/* MAIN ARTICLE BODY (75%) */}
            <article className="lg:col-span-9 order-1 lg:order-2 space-y-10 sm:space-y-12 leading-relaxed min-w-0">

              {/* -------------------------------------------------------------
                  SECTION A: UNDERSTAND YOUR AGENT STATUS
              -------------------------------------------------------------- */}
              <section id="section-a" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-800">
                    A
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Understand Your Agent Status</h2>
                </div>

                <p className="text-slate-700">
                  Operating as an authorized railway e-ticketing agent is a regulated commercial privilege granted under
                  specific legal frameworks of Indian Railways and the Indian Railway Catering and Tourism Corporation (IRCTC).
                  Understanding your exact legal and structural position in this ecosystem is the first line of defense
                  against procedural violations.
                </p>

                <div className="my-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <h3 className="text-base font-bold text-[var(--navy)] mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4 text-orange-600" />
                    Key Terminology: PSP vs. RSP
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-sm">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                      <strong className="block text-slate-900 font-bold mb-1">Principal Service Provider (PSP)</strong>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        A corporate entity or organization directly contracted with IRCTC (such as CSC, digital wallets,
                        or national travel consolidators) possessing web-service integration with IRCTC reservation servers.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                      <strong className="block text-slate-900 font-bold mb-1">Retail Service Provider (RSP)</strong>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        The individual retail agent, cyber cafe owner, or travel agency appointed by a licensed PSP.
                        Your daily login ID and operational terminal are officially categorized as an RSP.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-slate-700 text-sm">
                  <p>
                    <strong>Scheme-Specific Linkage:</strong> Every RSP ID is permanently anchored to the specific agreement
                    and technical portal of your contracted PSP. A retail agent registered under one PSP (e.g., a B2C corporate
                    gateway) is bound by the rules, fee ceilings, and technical terms stipulated in that specific contract.
                    Never assume that every ticket-booking or travel-agent scheme has identical obligations or commission schedules.
                  </p>
                  <p>
                    <strong>Ticketing vs. Tourism Agents:</strong> Authorized railway e-ticketing agents are licensed strictly
                    to book reserved electronic tickets on behalf of genuine passengers. They must be clearly distinguished from
                    IRCTC Rail Tour Package operators, specialized Bharat Gaurav tourist train agents, or General Sales Agents (GSA)
                    operating with different contractual rights.
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900">
                  <strong className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
                    <Info size={14} className="text-amber-700" />
                    Notice of Educational Independence:
                  </strong>
                  RailAgents.in is an independent educational platform operated to promote compliance, transparency, and
                  operational proficiency among retail travel businesses. RailAgents is not owned, operated, or endorsed by
                  IRCTC or Indian Railways.
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION B: REGISTRATION & ACCOUNT SECURITY
              -------------------------------------------------------------- */}
              <section id="section-b" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-800">
                    B
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Registration and Account Security</h2>
                </div>

                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  Maintaining accurate legal records and strict digital security controls is mandatory. Because ticketing agents
                  handle sensitive passenger information and official railway inventory, IRCTC enforces strict identity integrity
                  from onboarding through daily operations.
                </p>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs mb-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--navy)] mb-3">
                    Core Registration Requirements Under Current Policy
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>Unique Mobile &amp; Email:</strong> The mobile number and email ID registered for your RSP account
                        must never have been used to create an individual personal consumer IRCTC ID.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>PAN &amp; Aadhaar Verification:</strong> Your identity is verified against government databases.
                        The agency owner&apos;s name on the registration application must match official tax and identity records exactly.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>Digital Signature Certificate (DSC):</strong> Depending on your PSP&apos;s technical architecture,
                        daily logins and booking authorization may require a Class 3 Digital Signature USB cryptographic dongle.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>
                        <strong>Verification of Issued Certificate:</strong> Upon approval, verify your RSP ID and certificate on
                        the official IRCTC Agent Interface. Any discrepancy in address or contact information must be reported
                        to your PSP immediately before conducting business.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-xs sm:text-sm text-red-950">
                  <h4 className="font-bold flex items-center gap-1.5 text-red-900 mb-2">
                    <ShieldAlert size={16} className="text-red-700" />
                    Practical Warnings for Aspiring Agents:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-red-900/90 leading-relaxed">
                    <li><strong>Never purchase another person&apos;s ID:</strong> Agent IDs are strictly non-transferable. Operating under someone else&apos;s name is fraudulent.</li>
                    <li><strong>Never share credentials or OTPs:</strong> Never provide your master login, token password, or verification SMS to telecallers, software vendors, or colleagues.</li>
                    <li><strong>Beware of unauthorized intermediaries:</strong> Only register through verified Principal Service Providers officially listed on IRCTC&apos;s portal.</li>
                  </ul>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION C: BOOKING RULES EVERY AGENT SHOULD KNOW
              -------------------------------------------------------------- */}
              <section id="section-c" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-800">
                    C
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Booking Rules Every Agent Should Know</h2>
                </div>

                <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                  Daily ticket booking must strictly adhere to the procedures mandated by Indian Railways Coaching Tariff
                  and IRCTC Agent Operations guidelines. Compliance during the intake and issuance phase prevents over 90%
                  of agent disputes.
                </p>

                <div className="grid gap-3 sm:grid-cols-2 mb-5">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--navy)] mb-1.5 flex items-center gap-1.5">
                      <UserCheck size={14} className="text-orange-600" />
                      Customer Intake &amp; Consent
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Always collect a written or digital booking requisition containing exact passenger names (as per government ID),
                      ages, gender, and preferred berth options. Keep customer consent on file.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--navy)] mb-1.5 flex items-center gap-1.5">
                      <Receipt size={14} className="text-orange-600" />
                      Passenger Mobile Entry
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Under IRCTC compliance rules, you <strong>must enter the customer&apos;s own active mobile number</strong> during
                      booking. Never input your agency&apos;s phone number. Direct PNR alerts and cancellation OTPs must reach the traveller.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--navy)] mb-1.5 flex items-center gap-1.5">
                      <Train size={14} className="text-orange-600" />
                      ERS Printout Delivery
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Deliver the complete official Electronic Reservation Slip (ERS). The printed slip automatically displays
                      your agency name, address, phone number, and official fare breakdown.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--navy)] mb-1.5 flex items-center gap-1.5">
                      <Clock size={14} className="text-orange-600" />
                      Booking Windows &amp; Limits
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Observe general reservation Advance Reservation Period (ARP) timings and the mandatory initial 15-minute
                      agent lock during general morning counter opening (08:00 to 08:15 AM).
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs sm:text-sm text-blue-950">
                  <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <Info size={15} className="text-blue-700" />
                    Explaining Ticket Status Realistically:
                  </h4>
                  <p className="text-xs text-blue-900/90 leading-relaxed">
                    Always inform the passenger of their precise ticket status upon issuance: <strong>Confirmed (CNF)</strong>,
                    <strong>Reservation Against Cancellation (RAC)</strong>, or <strong>Waitlisted (WL)</strong>. Explain that
                    waitlist confirmation depends entirely on cancellations and railway chart preparation. An agent must never
                    promise, predict, or guarantee that a waitlisted seat will be confirmed.
                  </p>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION D: STRICTLY PROHIBITED PRACTICES
              -------------------------------------------------------------- */}
              <section id="section-d" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-xs text-red-800">
                    D
                  </span>
                  <h2 className="text-2xl font-bold text-red-950">
                    IRCTC Agent Mistakes That Can Put Your ID at Risk
                  </h2>
                </div>

                <p className="text-slate-700 text-sm mb-5 leading-relaxed">
                  Indian Railways Railway Board, Vigilance Department, and Cyber Crime cells continuously monitor ticketing
                  patterns. Below are major prohibited practices, practical scenarios, correct procedures, and the specific
                  consequences outlined in official regulatory policies.
                </p>

                {/* Table of Violations */}
                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="rounded-xl border border-red-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-red-900">
                        1. Commercial Ticket Booking on Personal Consumer IDs
                      </h4>
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-800 shrink-0">
                        Criminal Offence
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                      <strong>The Rule:</strong> Using standard personal consumer accounts (created on irctc.co.in) to book tickets
                      for customers for commercial gain or service fees is strictly forbidden.
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      <strong>Practical Example:</strong> A cyber cafe owner uses their personal IRCTC ID during Tatkal hours
                      because their commercial wallet balance is low or they want to bypass the commercial 15-minute lock.
                    </p>
                    <p className="mt-1 text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-lg font-medium">
                      <strong>Correct Way:</strong> Every commercial transaction must pass exclusively through your authorized RSP portal using your official agent credentials.
                    </p>
                    <p className="mt-1 text-xs text-red-700">
                      <strong>Consequences:</strong> Prosecution under Section 143 of the Railways Act, 1989 (imprisonment up to 3 years and/or fine up to ₹10,000), immediate deactivation of personal IDs, and permanent blacklisting of associated mobile/PAN details.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="rounded-xl border border-red-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-red-900">
                        2. Overcharging Above Prescribed Service Fees
                      </h4>
                      <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-orange-900 shrink-0">
                        License Violation
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                      <strong>The Rule:</strong> Collecting amounts exceeding the printed railway fare, payment gateway charges, and authorized agency service fee (₹20/₹40 + GST) is illegal overcharging.
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      <strong>Practical Example:</strong> Demanding an extra ₹200 or ₹500 from a desperate traveller for booking a scarce Tatkal berth during festival rush.
                    </p>
                    <p className="mt-1 text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-lg font-medium">
                      <strong>Correct Way:</strong> Bill only the authorized service charge, display charges prominently on your shop noticeboard, and provide an itemized receipt.
                    </p>
                    <p className="mt-1 text-xs text-red-700">
                      <strong>Consequences:</strong> Administrative financial penalties (standard IRCTC schedule imposes fines up to ₹5,000 per complaint on first offence), terminal suspension, and license termination upon repeated customer complaints.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="rounded-xl border border-red-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-red-900">
                        3. Entering Agency Mobile Numbers Instead of Passenger Numbers
                      </h4>
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-amber-900 shrink-0">
                        Audit Finding
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                      <strong>The Rule:</strong> The mobile number submitted during booking must belong directly to the primary passenger travelling on that PNR.
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      <strong>Practical Example:</strong> An agent enters their own counter phone number to intercept train delay SMS alerts or retain control over cancellation OTPs.
                    </p>
                    <p className="mt-1 text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-lg font-medium">
                      <strong>Correct Way:</strong> Always request, verify, and input the actual traveller&apos;s mobile number. Direct SMS notifications protect passengers from itinerary misinformation.
                    </p>
                    <p className="mt-1 text-xs text-red-700">
                      <strong>Consequences:</strong> Automated algorithmic flagging by IRCTC vigilance; repeated instances trigger immediate temporary terminal lock pending explanation.
                    </p>
                  </div>

                  {/* Item 4 */}
                  <div className="rounded-xl border border-red-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-red-900">
                        4. Deploying Unauthorized Automation or Autofill Software
                      </h4>
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-800 shrink-0">
                        Severe Cyber Offence
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                      <strong>The Rule:</strong> Using third-party browser extensions, bot scripts, or illegal Tatkal automation software to bypass captchas or booking queues is strictly prohibited.
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      <strong>Practical Example:</strong> Installing an illegal &ldquo;Tatkal speed booster&rdquo; plugin purchased on Telegram to automate passenger form filling and bank OTP bypass.
                    </p>
                    <p className="mt-1 text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-lg font-medium">
                      <strong>Correct Way:</strong> Use only standard, unmanipulated web browsers through the authorized PSP agent URL with manual keyboard data entry.
                    </p>
                    <p className="mt-1 text-xs text-red-700">
                      <strong>Consequences:</strong> Joint enforcement by Railway Protection Force (RPF) and Cyber Police, confiscation of computer hardware, immediate permanent deactivation, and criminal prosecution under the Information Technology Act and Railways Act.
                    </p>
                  </div>

                  {/* Item 5 */}
                  <div className="rounded-xl border border-red-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-red-900">
                        5. Unauthorized Cancellations &amp; Withholding Refunds
                      </h4>
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-800 shrink-0">
                        Breach of Trust
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                      <strong>The Rule:</strong> An agent must never cancel a ticket without the customer&apos;s request or delay the disbursement of cancellation refunds once processed by Indian Railways.
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      <strong>Practical Example:</strong> Cancelling a confirmed ticket to resell the seat or withholding the refund amount when a customer requests a cancellation due to emergency.
                    </p>
                    <p className="mt-1 text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-lg font-medium">
                      <strong>Correct Way:</strong> Require the passenger&apos;s written requisition or OTP authentication before triggering cancellation, and disburse the refund immediately upon receipt from your PSP.
                    </p>
                    <p className="mt-1 text-xs text-red-700">
                      <strong>Consequences:</strong> Immediate debarment from the agent network, recovery of refund amounts from security deposit, and potential liability for cheating under IPC.
                    </p>
                  </div>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION E: SERVICE CHARGES, PAYMENT GATEWAYS & RECEIPTS
              -------------------------------------------------------------- */}
              <section id="section-e" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-800">
                    E
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Service Charges, Payment Gateways &amp; Receipts</h2>
                </div>

                <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                  Price transparency is a fundamental pillar of IRCTC agent compliance. Every rupee collected from a passenger
                  must correlate exactly to official railway tariffs, payment gateway levies, or approved agency service fees.
                </p>

                {/* Pricing Breakdown Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs mb-5">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[var(--navy)] font-bold">
                      <tr>
                        <th className="p-3">Fee Component</th>
                        <th className="p-3">Non-AC Classes (2S, SL, General)</th>
                        <th className="p-3">AC Classes (3A, 2A, 1A, CC, 3E, EC)</th>
                        <th className="p-3">Applicable Policy Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Railway Base Fare &amp; Taxes</td>
                        <td className="p-3">Exact fare as printed on ticket</td>
                        <td className="p-3">Exact fare as printed on ticket</td>
                        <td className="p-3 text-slate-500 text-xs">Indian Railways Coaching Tariff</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Permissible Agent Service Charge</td>
                        <td className="p-3 font-bold text-orange-600">₹20 per ticket (+ 18% GST)</td>
                        <td className="p-3 font-bold text-orange-600">₹40 per ticket (+ 18% GST)</td>
                        <td className="p-3 text-slate-500 text-xs">IRCTC Master Policy (Section 6)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Payment Gateway (PG) Charge</td>
                        <td className="p-3">Actual charges as billed by bank / PG</td>
                        <td className="p-3">Actual charges as billed by bank / PG</td>
                        <td className="p-3 text-slate-500 text-xs">Bank / Payment Aggregator terms</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Official Receipt Mandatory?</td>
                        <td className="p-3 text-emerald-700 font-bold">Yes — Required for all bookings</td>
                        <td className="p-3 text-emerald-700 font-bold">Yes — Required for all bookings</td>
                        <td className="p-3 text-slate-500 text-xs">Mandatory compliance rule</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <p>
                    <strong>Scheme Discrepancy Note:</strong> Different PSP schemes (such as corporate API providers, CSC e-Governance,
                    or travel aggregator franchises) may maintain distinct internal commission-sharing arrangements with retail agents.
                    However, the maximum permissible service charge collected directly from the customer must never exceed the
                    IRCTC policy ceiling unless an explicit official revision has been notified.
                  </p>
                  <p>
                    <strong>Mandatory Receipt Issuance:</strong> Whenever you collect payment from a passenger, provide an official
                    receipt detailing the ticket fare, PG fee, and agency service charge. The printed Electronic Reservation Slip (ERS)
                    already includes the permitted service charge itemized at the bottom; do not alter or obscure this section.
                  </p>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION F: SHOP, SIGNAGE & CERTIFICATE DISPLAY
              -------------------------------------------------------------- */}
              <section id="section-f" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-800">
                    F
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Shop, Signage, and Authorization Certificate</h2>
                </div>

                <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                  Authorized railway ticketing counters are subject to surprise physical inspections by Railway Vigilance,
                  IRCTC inspection officers, and authorized PSP compliance executives. Maintaining a compliant premises is mandatory.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-sm mb-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Building size={14} className="text-orange-600" />
                      Display Authorization Certificate
                    </h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Frame and prominently display your official IRCTC / PSP Retail Service Provider certificate in public view
                      near your counter. Ensure the agent name, RSP ID, and validity period are easily readable by walk-in customers.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <FileText size={14} className="text-orange-600" />
                      Noticeboard of Permissible Charges
                    </h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Display a clear bilingual (Hindi/English or regional language) signboard stating the official permissible
                      service charges: <strong>₹20 + GST for Non-AC</strong> and <strong>₹40 + GST for AC</strong> classes.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-700">
                  <h4 className="font-bold text-slate-900 mb-1">Cooperation with Authorized Compliance Inspections:</h4>
                  <p className="leading-relaxed">
                    When an authorized railway official or PSP auditor visits your counter and presents official identification,
                    you must cooperate fully. They may inspect your customer booking requisition registers, recent cancellation slips,
                    printed ERS templates, and shop display certificates. Attempting to obstruct inspection or conceal records can lead
                    to immediate terminal suspension.
                  </p>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION G: CANCELLATION & REFUND REGULATIONS
              -------------------------------------------------------------- */}
              <section id="section-g" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-800">
                    G
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Cancellation and Refund Rules</h2>
                </div>

                <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                  Ticket cancellations and refund processing are heavily scrutinized areas of retail railway operations.
                  Refund amounts are governed strictly by Indian Railways Cancellation and Refund Rules, 2015 (amended), and
                  depend entirely on ticket status, charting time, and cancellation submission timing.
                </p>

                {/* Cancellation Slabs Reference Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs mb-5">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[var(--navy)] font-bold">
                      <tr>
                        <th className="p-3">Cancellation Timing (Confirmed Tickets)</th>
                        <th className="p-3">Official Railway Deduction</th>
                        <th className="p-3">Agent Action Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">More than 48 hours before scheduled departure</td>
                        <td className="p-3 font-medium">Flat clerkage deduction per passenger (Class dependent: ₹240 for 1A/EC, ₹200 for 2A, ₹180 for 3A/CC, ₹120 for SL, ₹60 for 2S)</td>
                        <td className="p-3 text-xs text-slate-600">Cancel online via agent portal, generate cancellation slip</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Between 48 hours and 12 hours before departure</td>
                        <td className="p-3 font-medium">25% of base fare subject to minimum flat clerkage fee</td>
                        <td className="p-3 text-xs text-slate-600">Explain percentage deduction to customer before confirming</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Between 12 hours and 4 hours before departure (up to chart preparation)</td>
                        <td className="p-3 font-medium">50% of base fare subject to minimum flat clerkage fee</td>
                        <td className="p-3 text-xs text-slate-600">Verify charting status; cancel before chart is prepared</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Less than 4 hours before departure / After chart preparation</td>
                        <td className="p-3 font-bold text-red-600">No refund admissible online on confirmed tickets</td>
                        <td className="p-3 text-xs text-slate-600">Online cancellation disabled; check if TDR is eligible</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">RAC or Waitlisted Tickets cancelled up to 30 mins before departure</td>
                        <td className="p-3 font-medium">Clerkage charge of ₹60 + GST per passenger deducted</td>
                        <td className="p-3 text-xs text-slate-600">Cancel online; reminder: fully waitlisted e-tickets auto-refund</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <p>
                    <strong>OTP-Based Refund Authentication:</strong> When an agent cancels a customer&apos;s ticket, IRCTC generates
                    a secure One-Time Password (OTP) sent directly to the customer&apos;s registered mobile number. The agent must obtain
                    this OTP from the passenger, enter it into the agent portal refund verification screen, and disburse the verified refund.
                    Never withhold refunds; keeping cash refunds after claiming them from your PSP is an offence.
                  </p>
                  <p>
                    <strong>Official Cancellation Rules Link:</strong> Review the authoritative Indian Railways cancellation guidelines directly at{" "}
                    <a
                      href="https://contents.irctc.co.in/en/eticketCancel.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>IRCTC Official Cancellation &amp; Refund Policy</span>
                      <ExternalLink size={11} />
                    </a>.
                  </p>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION H: TDR RESPONSIBILITIES & PROCEDURES
              -------------------------------------------------------------- */}
              <section id="section-h" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-800">
                    H
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">TDR: Important Responsibilities and Procedures</h2>
                </div>

                <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                  A Ticket Deposit Receipt (TDR) is a formal claim filed through the IRCTC portal when normal online cancellation
                  is not possible due to chart preparation or special operational railway contingencies. Filing a TDR requires
                  strict factual accuracy.
                </p>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs mb-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--navy)] mb-3">
                    Recognized Situations for Filing a TDR
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs text-slate-700">
                    <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                      <strong>Train Late &gt; 3 Hours:</strong> Passenger did not travel because train arrived more than 3 hours late at boarding station.
                    </div>
                    <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                      <strong>Train Cancelled by Railways:</strong> Full refund admissible when train is officially cancelled by Indian Railways.
                    </div>
                    <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                      <strong>AC Failure in Coach:</strong> Difference of fare claimed when air-conditioning failed during travel.
                    </div>
                    <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                      <strong>Party Partially Confirmed:</strong> Some passengers confirmed and others waitlisted, and all passengers opted not to travel.
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs sm:text-sm text-amber-950 space-y-2">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-amber-700" />
                    Important TDR Realities to Explain to Customers:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-amber-900/90 leading-relaxed">
                    <li><strong>Filing a TDR does not guarantee money back:</strong> Claims are audited by the relevant Zonal Railway Commercial Department against computerized charting logs and guard memos.</li>
                    <li><strong>Never choose an inaccurate TDR reason:</strong> Selecting a false reason (such as claiming the train was cancelled when it operated normally) leads to instant claim repudiation and potential vigilance inquiry.</li>
                    <li><strong>Processing timeframe:</strong> TDR claims can take between 15 to 90 days depending on the railway zone&apos;s audit cycles. Keep the TDR registration reference safe for portal tracking.</li>
                  </ul>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION I: TATKAL BOOKING DOS AND DON'TS
              -------------------------------------------------------------- */}
              <section id="section-i" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-800">
                    I
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Tatkal Booking Dos and Don&apos;ts</h2>
                </div>

                <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                  Tatkal booking is subject to the strictest surveillance across Indian Railways. Because high demand creates
                  opportunities for fraudulent booking cartels, authorized agents must operate with heightened discipline.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 mb-5">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      Tatkal Booking Dos:
                    </h4>
                    <ul className="space-y-2 text-xs text-emerald-950">
                      <li>• Observe Tatkal opening windows: AC Tatkal opens for agents at <strong>10:15 AM</strong> (15-min lock); Non-AC Tatkal opens for agents at <strong>11:15 AM</strong>.</li>
                      <li>• Verify government photo ID details for each passenger before attempting Tatkal bookings.</li>
                      <li>• Always input the passenger&apos;s own phone number for direct Tatkal OTP authentication.</li>
                      <li>• Inform customers in advance that confirmed Tatkal tickets are non-refundable upon cancellation under railway rules.</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 shadow-2xs">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-red-900 mb-2 flex items-center gap-1.5">
                      <XCircle size={15} className="text-red-600" />
                      Tatkal Booking Don&apos;ts:
                    </h4>
                    <ul className="space-y-2 text-xs text-red-950">
                      <li>• <strong>Never use unauthorized Tatkal software:</strong> Tools claiming instant checkout or captcha bypass are criminal hacking offences.</li>
                      <li>• <strong>Never guarantee Tatkal confirmation:</strong> Seat quotas exhaust in seconds; guaranteeing confirmation is deceptive trade practice.</li>
                      <li>• <strong>Never create speculative or fictitious bookings:</strong> Booking tickets under dummy names to sell later is illegal under the Railways Act.</li>
                      <li>• <strong>Never log in via multiple browser windows:</strong> Concurrent multi-session logins on the same RSP credentials cause automated account bans.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION J: CUSTOMER DATA, CONSENT & RECORD KEEPING
              -------------------------------------------------------------- */}
              <section id="section-j" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-800">
                    J
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Customer Data, Consent, and Record Keeping</h2>
                </div>

                <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                  Retail ticketing agents routinely process sensitive personal identifiers, including passenger names, ages,
                  Aadhaar copies, and phone numbers. Proper data stewardship and physical record maintenance are legal prerequisites.
                </p>

                <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      Data Minimization &amp; Privacy Protection
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Collect only the passenger details strictly required to process the railway reservation. Never distribute,
                      sell, or share customer contact databases with third-party marketing companies, insurance telemarketers, or loan agents.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      Requisition Slip Retention
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Maintain a sequential physical file or scanned digital archive of signed customer booking requisitions,
                      cancellation request slips, and printed transaction ledgers. When railway vigilance conducts investigations
                      into suspicious PNRs, having the customer&apos;s signed requisition slip protects you from benami booking allegations.
                    </p>
                  </div>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION K: COMPLAINTS, INSPECTIONS & COMPLIANCE
              -------------------------------------------------------------- */}
              <section id="section-k" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-800">
                    K
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Complaints, Inspections, and Compliance</h2>
                </div>

                <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                  Handling passenger grievances constructively and responding to formal queries from your PSP or IRCTC
                  with authentic evidence prevents minor administrative disputes from escalating into terminal debarment.
                </p>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs sm:text-sm text-slate-700 space-y-2">
                  <p>
                    <strong>Prompt Grievance Response:</strong> If a customer registers a dispute regarding ticket cancellation,
                    refund deductions, or service charges with RailMadad, IRCTC, or your PSP, provide documented proof
                    (printed ERS, cancellation receipt, and signed requisition) within the timeframe requested by your PSP.
                  </p>
                  <p>
                    <strong>Never Alter Records:</strong> Never alter printed ticket slips, falsify timestamps, or forge passenger
                    signatures to defend an operational error. Submitting falsified records to a compliance officer guarantees
                    immediate contract termination and potential criminal referral.
                  </p>
                  <p>
                    <strong>Scheme Compliance Channel:</strong> For questions about your specific software integration, wallet
                    recharge disputes, or terminal re-activation, contact your designated PSP nodal officer. If unresolved, consult
                    the official IRCTC Agent Support Helpdesk.
                  </p>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION L: DAILY AGENT COMPLIANCE CHECKLIST
              -------------------------------------------------------------- */}
              <section id="section-l" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-xs text-emerald-800">
                    L
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Daily Agent Compliance Checklist</h2>
                </div>

                <p className="text-slate-700 text-sm mb-5 leading-relaxed">
                  Use this interactive, printable verification protocol every booking morning. Checking each phase protects
                  your business from audit discrepancies, passenger disputes, and compliance penalties.
                </p>

                {/* Interactive Checklist Component */}
                <AgentComplianceChecklist />
              </section>

              {/* -------------------------------------------------------------
                  SECTION M: FREQUENTLY ASKED QUESTIONS
              -------------------------------------------------------------- */}
              <section id="section-m" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-800">
                    M
                  </span>
                  <h2 className="text-2xl font-bold text-[var(--navy)]">Frequently Asked Questions</h2>
                </div>

                <p className="text-slate-700 text-sm mb-6 leading-relaxed">
                  Clear, authoritative answers to common regulatory, operational, and licensing questions faced by railway ticketing agents.
                </p>

                <div className="space-y-4">
                  {FAQS.map((faq, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                      <h3 className="text-sm font-bold text-[var(--navy)] mb-2 flex items-start gap-2">
                        <HelpCircle size={16} className="text-orange-600 mt-0.5 shrink-0" />
                        <span>{faq.q}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 pl-6 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* -------------------------------------------------------------
                  SECTION N: GUIDANCE FROM NIHAL SINGH
              -------------------------------------------------------------- */}
              <section id="section-n" className="scroll-mt-24">
                <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50 p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-orange-700">
                    <Train size={14} className="text-orange-600" />
                    <span>Editorial Perspective</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--navy)]">
                    Learn the Rules Before You Make a Mistake
                  </h2>

                  <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                    Over my 20 years of hands-on railway ticketing and agent operations experience, I have observed that
                    almost every agent who lost their ID or faced a vigilance investigation made avoidable mistakes—often
                    out of ignorance rather than ill intent. Using personal IDs during peak hours, failing to enter the passenger&apos;s
                    own phone number, or yielding to pressure to overcharge are shortcuts that inevitably lead to trouble.
                  </p>

                  <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                    A successful, sustainable railway ticketing counter is built on transparency, meticulous record-keeping,
                    and treating passenger trust as your greatest asset. Know the rules, follow the prescribed procedures, and
                    verify current policy circulars before executing difficult bookings.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/guides"
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--navy)] px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      <BookOpen size={14} />
                      <span>Explore Railway Agent Guides</span>
                    </Link>
                    <Link
                      href="/ask-nihal"
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--primary-hover)] transition-colors shadow-xs"
                    >
                      <MessageCircle size={14} />
                      <span>Ask Nihal a Question</span>
                    </Link>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle size={14} className="text-emerald-600" />
                      <span>WhatsApp Guidance</span>
                    </a>
                  </div>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  OFFICIAL PRIMARY SOURCES DIRECTORY
              -------------------------------------------------------------- */}
              <section className="border-t border-slate-200 pt-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <ExternalLink size={13} className="text-slate-400" />
                  <span>Primary Official Policy Sources Consulted</span>
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <a
                    href="https://contents.irctc.co.in/en/Agent_Policy.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center justify-between rounded-lg border border-slate-200/80 bg-white p-2.5 text-slate-700 hover:border-orange-300 hover:text-orange-700 transition-colors"
                  >
                    <span className="min-w-0 truncate">IRCTC Agent Master Policy Document (PDF)</span>
                    <ExternalLink size={12} className="shrink-0 text-slate-400 ml-1" />
                  </a>
                  <a
                    href="https://contents.irctc.co.in/en/B2C_PSP_Policy_other_than_Startup_MSME.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center justify-between rounded-lg border border-slate-200/80 bg-white p-2.5 text-slate-700 hover:border-orange-300 hover:text-orange-700 transition-colors"
                  >
                    <span className="min-w-0 truncate">IRCTC B2C PSP Regulatory Policy (PDF)</span>
                    <ExternalLink size={12} className="shrink-0 text-slate-400 ml-1" />
                  </a>
                  <a
                    href="https://contents.irctc.co.in/en/eticketCancel.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center justify-between rounded-lg border border-slate-200/80 bg-white p-2.5 text-slate-700 hover:border-orange-300 hover:text-orange-700 transition-colors"
                  >
                    <span className="min-w-0 truncate">IRCTC Official E-Ticket Cancellation &amp; Refund Rules</span>
                    <ExternalLink size={12} className="shrink-0 text-slate-400 ml-1" />
                  </a>
                  <a
                    href="https://www.operations.irctc.co.in/AgentInterface/loginHome.jsf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center justify-between rounded-lg border border-slate-200/80 bg-white p-2.5 text-slate-700 hover:border-orange-300 hover:text-orange-700 transition-colors"
                  >
                    <span className="min-w-0 truncate">IRCTC Official Agent Operations Interface Portal</span>
                    <ExternalLink size={12} className="shrink-0 text-slate-400 ml-1" />
                  </a>
                </div>
              </section>

            </article>
          </div>
        </div>
      </main>

      <Footer />

      {/* FAQ Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
