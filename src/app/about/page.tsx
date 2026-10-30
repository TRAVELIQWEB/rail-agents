import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Info,
  MessageCircle,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Train,
  UserCheck,
  Video,
  XCircle,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/config/site";
import { InteractiveButton } from "@/components/ui/InteractiveButton";

export const metadata: Metadata = {
  title: "About Nihal Singh | 20 Years Experience in Railway Agent Guidance",
  description:
    "Meet Nihal Singh, who brings 20 years of hands-on experience in railway-agent operations. Learn practical railway booking rules, agent dos and don'ts, fraud prevention, and registration guides on RailAgents.",
  keywords: [
    "Nihal Singh",
    "Railway agent guidance",
    "IRCTC agent rules",
    "Train ticket agent experience",
    "Railway ticketing procedures",
    "Tatkal booking rules",
    "Railway agent registration",
    "RailAgents about",
  ],
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: "About Nihal Singh | 20 Years Experience in Railway Agent Guidance – RailAgents",
    description:
      "Meet Nihal Singh, bringing 20 years of hands-on railway ticketing and agent experience. Discover clear rules, operational best practices, and honest guidance.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "profile",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "About Nihal Singh - Railway Agent Guidance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Nihal Singh | 20 Years Experience in Railway Agent Guidance",
    description:
      "Explore practical insights, rule breakdowns, and honest advice for railway ticketing agents from 20-year veteran Nihal Singh.",
    images: [siteConfig.socialImage],
  },
};

const guideTopics = [
  {
    title: "Railway Agent Dos and Don'ts",
    description:
      "Everyday working habits, communication standards, and safe operational routines that keep customer service reliable and transparent.",
    href: "/guides/mistakes-new-railway-agents-avoid",
    icon: CheckCircle2,
    badge: "Operational Habits",
  },
  {
    title: "Agent Rules and Responsibilities",
    description:
      "Key guidelines on authorized booking parameters, passenger record handling, service boundaries, and responsible agent conduct.",
    href: "/guides/railway-booking-rules-agents",
    icon: Scale,
    badge: "Compliance & Terms",
  },
  {
    title: "Ticket Booking Practices and Common Mistakes",
    description:
      "Customer detail confirmation workflows, Tatkal timing disciplines, status checking, and avoiding costly intake blunders.",
    href: "/guides/start-ticket-booking-for-customers",
    icon: Train,
    badge: "Booking Workflow",
  },
  {
    title: "Cancellation, Refunds and TDR Guidance",
    description:
      "How charting deductions, cancellation windows, auto-refunds, and TDR filing eligibility actually operate under railway norms.",
    href: "/guides/ticket-cancellation-refund-guide",
    icon: XCircle,
    badge: "Refund Processes",
  },
  {
    title: "Fraud Awareness and Safe Working Practices",
    description:
      "Recognizing unauthorized software traps, fake approval promises, OTP phishing risks, and keeping your credentials secure.",
    href: "/guides/irctc-login-problems-solutions",
    icon: ShieldAlert,
    badge: "Security & Safety",
  },
  {
    title: "Agent Registration Information and Common Questions",
    description:
      "Clear walkthroughs of documentation checklists, principal service providers, eligibility terms, and setup questions.",
    href: "/irctc-agent-registration",
    icon: UserCheck,
    badge: "Registration Guide",
  },
  {
    title: "Educational Videos and Practical Guides",
    description:
      "Step-by-step video tutorials and searchable knowledge-base articles designed for easy visual learning and quick reference.",
    href: "/videos",
    icon: Video,
    badge: "Video Tutorials",
  },
];

const principles = [
  {
    number: "01",
    title: "Understand Before You Act",
    summary:
      "Learn the relevant rules, conditions, and procedures before making a decision.",
    description:
      "Every railway service operates within defined timing windows, eligibility criteria, and documentation standards. Taking time to understand the procedure prevents hasty errors and ensures you set realistic expectations for your customers.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Avoid Preventable Mistakes",
    summary:
      "Understand common risks, incorrect practices, and the importance of following applicable requirements.",
    description:
      "Many disputes arise from basic oversights—entering passenger names incorrectly, misunderstanding quota rules, or mishandling urgent bookings. Recognizing these frequent pitfalls early is the best way to safeguard your daily work.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Verify Important Information",
    summary:
      "Check current requirements against the relevant official source instead of relying on rumours or outdated advice.",
    description:
      "Railway terms, cancellation deductions, and technical procedures change periodically. Reliable agents never rely on social media claims or forwarded messages; they confirm rules directly through authentic, current sources.",
    icon: FileCheck2,
  },
];

const approachPoints = [
  {
    title: "Explain Concepts in Simple Language",
    description:
      "Railway circulars and technical terminology can be dense and confusing. We break them down into plain, straightforward Indian English that anyone can follow.",
  },
  {
    title: "Focus on Real Daily Questions",
    description:
      "Rather than abstract theory, we address the practical scenarios agents deal with every day—from payment timeouts to waitlist charts and customer receipts.",
  },
  {
    title: "Highlight Important Dos and Don'ts",
    description:
      "Clear boundaries protect your business. We specifically emphasize permitted working methods and highlight practices that must be strictly avoided.",
  },
  {
    title: "Distinguish Guidance from Official Rules",
    description:
      "We provide educational perspectives based on practical experience, while always encouraging readers to consult the authoritative policy text for binding terms.",
  },
  {
    title: "Encourage Continuous Verification",
    description:
      "Because railway policies, timings, and fees evolve, we consistently guide agents on where and how to double-check the latest circulars before taking action.",
  },
  {
    title: "Zero False or Guaranteed Promises",
    description:
      "We never promise guaranteed seat confirmations, instant approvals, or speculative incomes. Responsible work begins with honest and realistic expectations.",
  },
];

export default function AboutPage() {
  const whatsappMessage = encodeURIComponent(
    "Hello Nihal Singh, I have a question regarding railway agent work and rules. Please guide me.",
  );
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${whatsappMessage}`;


  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${siteConfig.url}/about#webpage`,
        "url": `${siteConfig.url}/about`,
        "name": "About Nihal Singh | Railway Agent Guidance – RailAgents",
        "description":
          "Learn about Nihal Singh, his railway-agent experience, and the educational guidance provided through RailAgents.",
        "inLanguage": "en-IN",
        "isPartOf": {
          "@id": `${siteConfig.url}/#website`,
        },
        "publisher": {
          "@id": `${siteConfig.url}/#organization`,
        },
        "breadcrumb": {
          "@id": `${siteConfig.url}/about#breadcrumb`,
        },
        "mainEntity": {
          "@id": `${siteConfig.url}/about#nihal-singh`,
        },
      },
      {
        "@type": "Person",
        "@id": `${siteConfig.url}/about#nihal-singh`,
        "name": "Nihal Singh",
        "jobTitle": "Railway Agent Guide and Educator",
        "description":
          "Shares practical educational guidance about railway-agent operations, booking procedures, applicable rules, and fraud prevention.",
        "url": `${siteConfig.url}/about`,
        "knowsAbout": [
          "Railway ticketing procedures",
          "IRCTC agent rules",
          "Tatkal booking regulations",
          "TDR filing and refund procedures",
          "Railway agent business practices",
          "Ticket cancellation guidelines"
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteConfig.url}/about#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${siteConfig.url}/`,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "About",
            "item": `${siteConfig.url}/about`,
          },
        ],
      },
    ],
  };


  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfb] text-[var(--navy)]">
      {/* Search Engine Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />

      <main className="relative flex-1">
        {/* =========================================================
            SECTION 1: STRONG PERSONAL HERO
        ========================================================== */}
        <section className="relative flex flex-col justify-between overflow-hidden border-b border-[#f4e4d4] bg-gradient-to-b from-[#fffaf4] via-[#fffdfa] to-white pt-8 pb-6 sm:pt-10 sm:pb-7 lg:min-h-[calc(100vh-74px)] lg:pt-11 lg:pb-7">
          {/* Subtle Ambient Decorative Gradients */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-orange-100/60 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-amber-50/70 blur-3xl"
          />

          <div className="site-container relative z-10 flex flex-1 flex-col justify-between">
            <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">

              {/* Left Column: Text & CTAs */}
              <div className="text-center md:text-left lg:col-span-7">
                {/* Eyebrow */}
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#c2410c] shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-[#f97316]" />
                  RAILWAY AGENT GUIDANCE • PRACTICAL KNOWLEDGE
                </div>

                {/* H1 */}
                <h1 className="page-hero-title">
                  20 Years of Experience. <br className="hidden sm:inline" />
                  <span className="hero-accent">A Wealth of Knowledge</span> to Share.
                </h1>

                {/* Supporting Copy */}
                <p className="page-hero-description mt-4 max-w-2xl">
                  Hello, I&apos;m Nihal Singh. Through RailAgents, I aim to help aspiring and
                  existing railway agents better understand the practical side of this field—from
                  everyday dos and don&apos;ts to important rules, processes, and common mistakes.
                  My goal is to make complex information easier to understand so you can make
                  informed decisions and work responsibly.
                </p>

                {/* Experience Highlights Pill Bar */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-700 md:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                    Practical Field Knowledge
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                    Rule Awareness &amp; Due Diligence
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                    Responsible Working Habits
                  </span>
                </div>

                {/* CTAs */}
                <div className="mt-7 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-start">
                  <Link
                    href="/ask-nihal"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(249,115,22,0.32)] transition-all hover:bg-[#ea580c] hover:shadow-[0_8px_24px_rgba(249,115,22,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:w-auto"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ask Nihal a Question
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/guides"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-[var(--navy)] shadow-xs transition-colors hover:border-[#ea580c] hover:bg-[#fff9f4] hover:text-[#ea580c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:w-auto"
                  >
                    <BookOpen className="h-4 w-4 text-[#ea580c]" />
                    Explore Railway Agent Guides
                  </Link>
                </div>

                {/* Nihal's Core Guidance Quote Strip (Balances left & right column height) */}
                <div className="mt-6 hidden lg:flex items-center gap-3.5 rounded-2xl border border-[#f3dfcc] bg-white/90 px-4 py-3 text-left shadow-2xs">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </span>
                  <p className="text-xs leading-relaxed text-slate-600">
                    <strong className="font-extrabold text-[var(--navy)]">Independent Educational Guidance:</strong>{" "}
                    Practical insights built on 20 years of field experience to help agents work safely and lawfully.
                  </p>
                </div>
              </div>

              {/* Right Column: Guidance & Desk Visual (contactpage.png) & Credential Badge */}
              <div className="flex justify-center lg:col-span-5">
                <div className="relative w-full max-w-[420px] sm:max-w-[460px]">
                  {/* Subtle Background Backdrop Card */}
                  <div className="relative overflow-hidden rounded-3xl border border-[#fed7aa]/80 bg-gradient-to-b from-[#fff6ed] via-[#fff3e8] to-[#ffeedb] p-5 pt-6 text-center shadow-[0_16px_40px_rgba(15,39,71,0.06)] sm:p-6 sm:pt-7">

                    {/* Visual Frame */}
                    <div className="relative mx-auto aspect-[16/11] w-full overflow-hidden rounded-2xl border border-white/80 bg-white/60 shadow-xs sm:aspect-[4/3]">
                      <Image
                        src="/images/contactpage.png"
                        alt="RailAgents guidance desk with Nihal Singh - Railway Agent Guide"
                        fill
                        priority
                        sizes="(max-width: 640px) 340px, (max-width: 1024px) 400px, 460px"
                        className="object-cover object-center"
                      />
                    </div>

                    {/* Captions & Credential Box */}
                    <div className="mt-4 text-left">
                      <div className="flex items-center justify-between border-b border-[#f4dbcb] pb-2.5">
                        <div>
                          <p className="text-base font-[900] text-[var(--navy)]">Nihal Singh</p>
                          <p className="text-xs font-semibold text-[#ea580c]">Practical Railway Agent Guide</p>
                        </div>
                        <span className="rounded-md border border-[#fed7aa] bg-white px-2.5 py-1 text-[11px] font-bold text-[#c2410c]">
                          20 Years Exp.
                        </span>
                      </div>
                      <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                        Helping individuals and operating agents learn practical railway work, understand applicable rules, and avoid common errors.
                      </p>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Docked Experience & Guidance Strip (Fills viewport cleanly with zero empty space) */}
            <div className="my-auto pt-4 border-t border-[#f0e1d2]">
              <div className="mb-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <span className="inline-flex items-center gap-1.5 text-[#c2410c]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#ea580c]" />
                  Core Pillars of RailAgents Guidance
                </span>
                <span className="hidden sm:inline text-slate-400">
                  Learn from experience • Understand the rules • Work responsibly
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
                {[
                  {
                    icon: Calendar,
                    title: "20+ Years Experience",
                    detail: "Hands-on railway ticketing work",
                  },
                  {
                    icon: Scale,
                    title: "Official Rule Clarity",
                    detail: "IRCTC & Railways Act guidelines",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Fraud & Risk Awareness",
                    detail: "Safe & authorized agent practices",
                  },
                  {
                    icon: Video,
                    title: "Practical Video Guides",
                    detail: "Simple step-by-step explanations",
                  },
                ].map(({ icon: Icon, title, detail }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-2xl border border-[#eedcc9] bg-white/95 px-4 py-3.5 shadow-[0_6px_18px_rgba(15,39,71,0.04)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff3e8] text-[#ea580c] ring-1 ring-orange-200/60">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-[13.5px] font-[800] text-[var(--navy)]">
                        {title}
                      </p>
                      <p className="mt-0.5 truncate text-[11.5px] font-medium text-slate-500">
                        {detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 2: MEET NIHAL SINGH
        ========================================================== */}
        <section className="bg-white py-12 sm:py-16 lg:py-20 border-b border-slate-100">
          <div className="site-container">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-14">

              {/* Left Column: Story & Narrative (7 cols) */}
              <div className="lg:col-span-7">
                <div className="mb-2.5 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Experience-Based Perspective
                </div>
                <h2 className="text-2xl font-[900] tracking-tight text-[var(--navy)] sm:text-3xl lg:text-[2.25rem]">
                  Meet Nihal Singh
                </h2>

                <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-slate-600 sm:text-base sm:leading-8">
                  <p>
                    With 20 years of hands-on experience in the railway-agent field, Nihal Singh
                    has seen the industry transition from traditional paper forms to digital booking
                    portals, evolving security mechanisms, and changing cancellation and refund rules.
                  </p>
                  <p>
                    Rather than acting as a distant corporate figure or presenting himself as an
                    official authority, Nihal positions himself as an approachable, practical guide.
                    Having observed firsthand where beginners stumble, where miscommunication with
                    passengers happens, and where agents encounter operational stress, his purpose is
                    straightforward: to make practical railway knowledge easier to understand and apply.
                  </p>
                  <p>
                    Nihal places deep emphasis on three core realities:
                  </p>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href="/ask-nihal"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#ea580c]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send a Question to Nihal
                  </Link>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-[var(--navy)] shadow-2xs transition-colors hover:border-orange-300 hover:bg-orange-50/50"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              {/* Right Column: 3 Realities Cards in Vertical Stack matching full container (5 cols) */}
              <div className="flex flex-col justify-center space-y-4 lg:col-span-5">
                <div className="rounded-2xl border border-slate-200/90 bg-[#fffdfa] p-5 shadow-2xs transition-all hover:border-orange-200 hover:shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[var(--navy)]">Understanding Applicable Rules</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">Knowing authorized booking windows, pricing structures, and refund eligibility protects both the agent and the passenger.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-[#fffdfa] p-5 shadow-2xs transition-all hover:border-orange-200 hover:shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[var(--navy)]">Learning from Frequent Mistakes</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">Most operational hurdles—from incorrect name spellings to unverified TDR claims—are preventable with disciplined workflows.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-[#fffdfa] p-5 shadow-2xs transition-all hover:border-orange-200 hover:shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[var(--navy)]">Clear, Realistic Answers</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">Encouraging readers to seek clarification on challenging scenarios rather than taking risky or unauthorized shortcuts.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: WHY RAILAGENTS EXISTS
        ========================================================== */}
        <section className="bg-[#fffcf7] py-12 sm:py-16 lg:py-20 border-b border-[#f4e4d4]">
          <div className="site-container">
            {/* Top 12-Column Grid: Left Narrative + Right Philosophy Card */}
            <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Left Column (7 cols): Heading & Description */}
              <div className="text-left lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">
                  <Info className="h-3.5 w-3.5" />
                  The Core Mission
                </span>
                <h2 className="mt-2 text-2xl font-[900] tracking-tight text-[var(--navy)] sm:text-3xl lg:text-[2.25rem]">
                  Making Railway Agent Knowledge Easier to Understand
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-8">
                  Railway ticketing rules, terms, booking windows, waitlist handling, TDR refunds,
                  compliance obligations, and fraud risks can be overwhelming for beginners and
                  confusing even for established agents. RailAgents exists to demystify these topics
                  through clean, practical explanations and question-based guidance.
                </p>
              </div>

              {/* Right Column (5 cols): Central Philosophy Highlight Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-orange-200/90 bg-gradient-to-br from-orange-50/90 via-white to-orange-100/50 p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#f97316]" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[#ea580c]">Our Central Philosophy</p>
                  </div>
                  <p className="mt-3 text-lg font-[900] leading-snug text-[var(--navy)] sm:text-xl lg:text-2xl">
                    &ldquo;Learn from experience. Understand the rules. Work responsibly.&rdquo;
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                    Grounded in practical operational realities, protecting both agent credentials and passenger peace of mind.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Principles in a Clean Editorial Layout spanning the full container */}
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {principles.map(({ number, title, summary, description, icon: Icon }) => (
                <div
                  key={number}
                  className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-shadow hover:border-orange-200 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-[#ea580c]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-[900] tracking-wider text-orange-400">
                      STEP {number}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-[850] text-[var(--navy)]">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-[#ea580c]">
                    {summary}
                  </p>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =========================================================
            SECTION 4: WHAT YOU CAN LEARN HERE
        ========================================================== */}
        <section className="bg-white py-12 sm:py-16 lg:py-20 border-b border-slate-100">
          <div className="site-container">
            {/* Header: Left-aligned with View All Guides button on right */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-100 pb-6 text-left">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">
                  <BookOpen className="h-3.5 w-3.5" />
                  Comprehensive Knowledge Areas
                </span>
                <h2 className="mt-2 text-2xl font-[900] tracking-tight text-[var(--navy)] sm:text-3xl lg:text-[2.25rem]">
                  Practical Guidance for Real Railway Agent Questions
                </h2>
                <p className="mt-3 text-base text-slate-600 sm:text-lg">
                  Explore in-depth topics crafted to provide educational clarity on everyday challenges.
                  All information serves as guidance; specific requirements should always be cross-checked
                  with active official railway directives.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  href="/guides"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-[var(--navy)] shadow-2xs transition-colors hover:border-orange-300 hover:text-[#ea580c]"
                >
                  <BookOpen className="h-4 w-4 text-[#ea580c]" />
                  Explore All Guides
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Topic Cards Grid */}
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {guideTopics.map(({ title, description, href, icon: Icon, badge }) => (
                <article
                  key={title}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-[#fffdfa] p-6 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100/70 text-[#ea580c] transition-colors group-hover:bg-[#ea580c] group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {badge}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-extrabold text-[var(--navy)] group-hover:text-[#ea580c] transition-colors">
                      {title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {description}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-3">
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ea580c] hover:underline"
                    >
                      Read full guidance
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              ))}

              {/* Bonus Card: Interactive Fare Calculator */}
              <article className="group flex flex-col justify-between rounded-2xl border border-orange-200 bg-gradient-to-br from-[#fff7ed] to-white p-6 shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-sm sm:col-span-2 lg:col-span-2">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ea580c] text-white">
                      <Train className="h-5 w-5" />
                    </span>
                    <span className="rounded-md border border-orange-300 bg-white px-2 py-0.5 text-[10px] font-bold text-[#ea580c]">
                      Interactive Tool
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-extrabold text-[var(--navy)] sm:text-lg">
                    Train Ticket Agent Fare &amp; Service Charge Calculator
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    Quickly calculate base fares, applicable service commissions, PG charges, and total customer amounts in accordance with permitted railway ticketing fare structures.
                  </p>
                </div>

                <div className="mt-5 border-t border-orange-100 pt-3">
                  <Link
                    href="/train-ticket-agent-fare-calculator"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ea580c] hover:underline"
                  >
                    Open Fare Calculator
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </article>
            </div>

            {/* Bottom Note */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-[#f8fafc] p-4 text-center text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Educational Notice:</span> All articles, guides, and calculators are published solely for general informational purposes. Always confirm active fare slabs and terms via authorized channels.
            </div>

          </div>
        </section>

        {/* =========================================================
            SECTION 5: NIHAL'S APPROACH TO GUIDANCE
        ========================================================== */}
        <section className="bg-[#fffaf4] py-12 sm:py-16 lg:py-20 border-b border-[#f4e4d4]">
          <div className="site-container">
            {/* Header: Left-aligned */}
            <div className="max-w-3xl text-left border-b border-orange-100/80 pb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">
                <Scale className="h-3.5 w-3.5" />
                Ethical Principles &amp; Values
              </span>
              <h2 className="mt-2 text-2xl font-[900] tracking-tight text-[var(--navy)] sm:text-3xl lg:text-[2.25rem]">
                Practical Advice, Clear Explanations, Responsible Decisions
              </h2>
              <p className="mt-3 text-base text-slate-600 sm:text-lg">
                How Nihal approaches guidance: genuine field experience, plain explanations,
                and an uncompromising respect for applicable regulations.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {approachPoints.map(({ title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-[#ea580c]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 text-sm font-extrabold text-[var(--navy)]">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =========================================================
            SECTION 6: TRUST AND TRANSPARENCY (FULL CONTAINER WIDTH)
        ========================================================== */}
        <section className="bg-white py-12 sm:py-16 lg:py-20 border-b border-slate-100">
          <div className="site-container">
            <div className="w-full rounded-3xl border border-slate-200/90 bg-[#fffdfa] p-6 sm:p-10 lg:p-12 shadow-xs">

              <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-start">
                {/* Left Column (5 cols): Overview & Independent Disclaimer Callout */}
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-[#ea580c]">
                      <ShieldCheck className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">Important Disclosures</span>
                      <h2 className="text-xl font-[900] text-[var(--navy)] sm:text-2xl">
                        Clear Information. Honest Guidance.
                      </h2>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
                    RailAgents is an independent educational guidance platform associated with
                    Nihal Singh. We share informational perspectives to help agents and the public
                    understand common railway concepts, registration questions, and booking workflows.
                  </p>

                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs sm:text-sm leading-relaxed text-amber-900">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-amber-700" />
                      Independent Guidance Disclaimer:
                    </p>
                    <p className="mt-1.5">
                      Neither RailAgents nor Nihal Singh represents Indian Railways, IRCTC, CRIS, or any
                      government ministry. We do not issue tickets directly, nor do we act as an official
                      regulatory body.
                    </p>
                  </div>
                </div>

                {/* Right Column (7 cols): Detailed Points in Structured Cards */}
                <div className="space-y-4 lg:col-span-7">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                    <h3 className="text-sm font-extrabold text-[var(--navy)]">
                      Official Rule Authority &amp; Regular Updates
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      Railway rules, booking conditions, service charges, tatkal timings, and cancellation
                      penalties are set by Indian Railways and authorized service providers. These guidelines
                      are subject to official circulars and regular updates. We strongly encourage all readers
                      to verify active terms directly through authorized railway channels.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                    <h3 className="text-sm font-extrabold text-[var(--navy)]">
                      Realistic Expectations &amp; Ethical Business
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      RailAgents makes no representations or guarantees of confirmed ticket reservations,
                      registration approvals, business turnover, or specific refund outcomes. Responsible
                      agent work is grounded in personal integrity, proper documentation, and compliance
                      with current laws.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                    <h3 className="text-sm font-extrabold text-[var(--navy)]">
                      Security, Privacy &amp; Credential Safety
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      RailAgents will never ask for your passenger passwords, booking OTPs, or confidential
                      banking credentials. All calculators, guides, and tutorials exist solely to educate and
                      safeguard operating agents against common scams and unauthorized shortcuts.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 6.5: FREQUENTLY ASKED QUESTIONS (FULL CONTAINER WIDTH)
        ========================================================== */}
        <section className="bg-[#fffdfa] py-12 sm:py-16 lg:py-20 border-b border-[#f4e4d4]">
          <div className="site-container">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 items-start">

              {/* Left Column (5 cols): Sticky Sidebar */}
              <div className="lg:col-span-5 lg:sticky lg:top-24">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Frequently Asked Questions
                </div>
                <h2 className="mt-2 text-2xl font-[900] tracking-tight text-[var(--navy)] sm:text-3xl lg:text-[2.25rem]">
                  Common Questions About Nihal Singh &amp; RailAgents
                </h2>
                <p className="mt-3 text-sm text-slate-600 sm:text-base leading-relaxed">
                  Clear, upfront answers regarding our mission, background, and how we assist rail agents with practical field guidance.
                </p>

                {/*Helpful Contact Box */}
                <div className="mt-6 rounded-2xl border border-orange-200/90 bg-[#fff8f2] p-5 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-[#ea580c]">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-bold text-[var(--navy)]">Have a different question?</p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Reach out directly for experienced guidance on railway agent rules, booking workflows, and registrations.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2.5">
                    <Link
                      href="/ask-nihal"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#ea580c]"
                    >
                      Ask Nihal
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-[var(--navy)] hover:border-orange-300"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): FAQ Accordions */}
              <div className="space-y-4 lg:col-span-7">
                <details className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-colors open:border-orange-300 open:shadow-xs">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-[var(--navy)] group-open:text-[#ea580c]">
                    <span>Who is Nihal Singh and what is his background?</span>
                    <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100/70 text-[#ea580c] transition-transform group-open:rotate-180">
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </span>
                  </summary>
                  <p className="mt-3.5 border-t border-slate-100 pt-3.5 text-sm leading-relaxed text-slate-600">
                    Nihal Singh brings 20 years of working experience in the railway-agent industry. Having witnessed the transition from manual forms to digital booking platforms, he shares practical knowledge, common agent pitfalls, and compliance advice so others can operate smoothly and responsibly.
                  </p>
                </details>

                <details className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-colors open:border-orange-300 open:shadow-xs">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-[var(--navy)] group-open:text-[#ea580c]">
                    <span>Is RailAgents an official Indian Railways or IRCTC website?</span>
                    <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100/70 text-[#ea580c] transition-transform group-open:rotate-180">
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </span>
                  </summary>
                  <p className="mt-3.5 border-t border-slate-100 pt-3.5 text-sm leading-relaxed text-slate-600">
                    No. RailAgents is an independent educational guidance website. We do not represent Indian Railways, IRCTC, or CRIS, nor do we issue tickets directly. All information is provided solely for educational reference and awareness.
                  </p>
                </details>

                <details className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-colors open:border-orange-300 open:shadow-xs">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-[var(--navy)] group-open:text-[#ea580c]">
                    <span>What kind of help can I find on this website?</span>
                    <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100/70 text-[#ea580c] transition-transform group-open:rotate-180">
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </span>
                  </summary>
                  <p className="mt-3.5 border-t border-slate-100 pt-3.5 text-sm leading-relaxed text-slate-600">
                    RailAgents offers in-depth guides covering authorized registration steps, Tatkal booking rules, ticket cancellation and refund policies, TDR filing procedures, fee structures, and how to avoid fraudulent software or unauthorized shortcuts.
                  </p>
                </details>

                <details className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-colors open:border-orange-300 open:shadow-xs">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-[var(--navy)] group-open:text-[#ea580c]">
                    <span>Can I ask Nihal Singh questions regarding railway agent work?</span>
                    <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100/70 text-[#ea580c] transition-transform group-open:rotate-180">
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </span>
                  </summary>
                  <p className="mt-3.5 border-t border-slate-100 pt-3.5 text-sm leading-relaxed text-slate-600">
                    Yes! Readers and operating agents can submit questions directly through the <Link href="/ask-nihal" className="font-semibold text-[#ea580c] underline">Ask Nihal page</Link> or connect with us on WhatsApp for realistic, experience-based answers.
                  </p>
                </details>

                <details className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-colors open:border-orange-300 open:shadow-xs">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-[var(--navy)] group-open:text-[#ea580c]">
                    <span>Are the guides and tools on RailAgents free to use?</span>
                    <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100/70 text-[#ea580c] transition-transform group-open:rotate-180">
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </span>
                  </summary>
                  <p className="mt-3.5 border-t border-slate-100 pt-3.5 text-sm leading-relaxed text-slate-600">
                    Yes, all educational articles, video tutorials, and interactive tools such as the <Link href="/train-ticket-agent-fare-calculator" className="font-semibold text-[#ea580c] underline">Agent Fare Calculator</Link> are 100% free to read and access.
                  </p>
                </details>

                <details className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-colors open:border-orange-300 open:shadow-xs">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-[var(--navy)] group-open:text-[#ea580c]">
                    <span>How can I reach out to Nihal Singh for guidance?</span>
                    <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100/70 text-[#ea580c] transition-transform group-open:rotate-180">
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </span>
                  </summary>
                  <p className="mt-3.5 border-t border-slate-100 pt-3.5 text-sm leading-relaxed text-slate-600">
                    You can submit your questions directly via our <Link href="/ask-nihal" className="font-semibold text-[#ea580c] underline">Ask Nihal form</Link> or connect through our verified WhatsApp channel for assistance.
                  </p>
                </details>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 7: FINAL CALL TO ACTION (FULL CONTAINER WIDTH)
        ========================================================== */}
        <section className="bg-[#fff8f2] py-12 sm:py-16 lg:py-20">
          <div className="site-container">
            <div className="relative isolate w-full overflow-hidden rounded-3xl border border-[#fed7aa] bg-gradient-to-br from-white via-[#fffaf5] to-[#ffeddd] p-8 text-center shadow-[0_12px_36px_rgba(15,39,71,0.06)] sm:p-12 lg:p-14">

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl"
              />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-[#ea580c] shadow-xs">
                <HelpCircle className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-2xl font-[900] tracking-tight text-[var(--navy)] sm:text-3xl lg:text-4xl">
                Have a Question About Railway Agent Work?
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Whether you&apos;re learning about the field or looking for clarity on a particular
                railway-agent topic, start with the available guides or send your question to Nihal Singh.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
                <InteractiveButton
                  as="link"
                  href="/ask-nihal"
                  label="Ask Nihal a Question"
                  icon={<MessageCircle className="h-4 w-4 text-white" />}
                  size="md"
                  variant="orange"
                />

                <Link
                  href="/guides"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-[var(--navy)] shadow-xs transition-colors hover:border-[#ea580c] hover:bg-[#fff9f4] hover:text-[#ea580c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:w-auto"
                >
                  <BookOpen className="h-4 w-4 text-[#ea580c]" />
                  Browse All Guides
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50/60 px-5 py-3.5 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-100/70 sm:w-auto"
                >
                  WhatsApp Query
                </a>
              </div>

              {/* Bottom Feature Badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-orange-100/80 pt-6 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                  20 Years Practical Field Experience
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                  Independent Educational Guidance
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#ea580c]" />
                  Ethical &amp; Responsible Work Practices
                </span>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
