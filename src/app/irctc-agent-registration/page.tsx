import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  FileCheck2,
  Info,
  MessageCircle,
  ShieldCheck,
  Train,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "IRCTC Agent Information and Guidance",
  description:
    "Understand IRCTC agent registration information, terms, document checklists, booking questions, and where to verify current requirements.",
  alternates: { canonical: `${siteConfig.url}/irctc-agent-registration` },
  openGraph: {
    title: "IRCTC Agent Information and Guidance | RailAgents",
    description:
      "Practical information to help agents and travellers understand IRCTC-related processes, terms, and travel questions.",
    url: `${siteConfig.url}/irctc-agent-registration`,
    images: [siteConfig.socialImage],
  },
};

const valueItems = [
  { icon: BookOpen, title: "Clear Information", detail: "Simple explanations" },
  { icon: ShieldCheck, title: "What to Verify", detail: "Documents, terms & requirements" },
  { icon: CircleHelp, title: "For Agents & Travellers", detail: "Useful guidance for both" },
  { icon: MessageCircle, title: "Practical Support", detail: "Questions, booking & travel help" },
];

const supportAreas = [
  {
    icon: BookOpen,
    number: "01",
    title: "Understand the process",
    body: "Get clear explanations of common IRCTC agent questions and the steps you may need to research before making a decision.",
  },
  {
    icon: FileCheck2,
    number: "02",
    title: "Know what to verify",
    body: "Learn how to check current eligibility, document requirements, terms, and charges with the relevant authorized provider.",
  },
  {
    icon: CircleHelp,
    number: "03",
    title: "Make sense of travel questions",
    body: "Find practical guidance about bookings, ticket status, cancellations, refunds, and common customer queries.",
  },
];

const guidanceSteps = [
  { number: "01", title: "Understand what you need", detail: "Start with the question or travel information you are looking for." },
  { number: "02", title: "Check current requirements", detail: "Use the relevant provider or official source to confirm current details." },
  { number: "03", title: "Reach out if you need help", detail: "Ask RailAgents to help you understand what to check next." },
];

const guideLinks = [
  {
    title: "How to Become an IRCTC Agent",
    href: "/guides/become-irctc-agent",
    description: "An overview of what to understand and verify before starting an enquiry.",
  },
  {
    title: "Documents Required for IRCTC Agent Registration",
    href: "/guides/documents-irctc-agent-registration",
    description: "How to request the current checklist and prepare information carefully.",
  },
  {
    title: "IRCTC Agent Registration Process Explained",
    href: "/guides/registration-process-explained",
    description: "A general guide to checking terms, applying through verified channels, and tracking an enquiry.",
  },
];

export default function IrctcAgentPage() {
  const whatsappMessage = encodeURIComponent(
    "Hi RailAgents, I have a question about IRCTC agent information. Please guide me.",
  );
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${whatsappMessage}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfa]">
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <section className="relative isolate overflow-hidden border-b border-[#f0e1d5] bg-[#fffaf5] py-12 sm:py-16 lg:flex lg:min-h-0 lg:items-center lg:py-16">
          <div aria-hidden="true" className="absolute inset-0 -z-20 hidden lg:block">
            <Image
              src="/images/hero-railway-bg.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-[0.18]"
            />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,#fffaf5_0%,rgba(255,250,245,0.94)_34%,rgba(255,250,245,0.9)_68%,#fffaf5_100%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-10 -z-10 h-72 w-72 rounded-full bg-orange-200/35 blur-[90px] sm:h-96 sm:w-96" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-8 -z-10 h-72 w-72 rounded-full bg-amber-100/65 blur-[90px] sm:h-96 sm:w-96" />
          <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 w-full text-orange-300/40 sm:h-32" viewBox="0 0 1440 120" preserveAspectRatio="none" fill="none">
            <path d="M0 72C220 10 365 115 625 66S1080 16 1440 82" stroke="currentColor" strokeWidth="2" />
            <path d="M0 94C235 32 390 130 655 84S1105 36 1440 102" stroke="currentColor" strokeOpacity=".55" strokeWidth="1" />
          </svg>

          <div className="site-container relative z-10 w-full">
            <div className="mx-auto flex max-w-5xl flex-col items-start text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5dfcf] bg-white/90 px-4 py-2 text-xs font-[800] uppercase tracking-[0.12em] text-[#e96713] shadow-[0_3px_12px_rgba(15,39,71,0.08)] backdrop-blur-sm">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                IRCTC Agent Guidance
              </span>
              <h1 className="mt-5 max-w-[1000px] text-[clamp(2.25rem,5.6vw,4.5rem)] font-[850] leading-[1.06] tracking-[-0.05em] text-[var(--navy)]">
                Understand the process
                <span className="mt-1 block">
                  <span className="relative inline-block text-[var(--primary)]">
                    before you take the next step
                    <svg aria-hidden="true" className="absolute -bottom-2 left-[8%] h-3 w-[84%] text-orange-300/70 sm:-bottom-3 sm:h-4" viewBox="0 0 300 16" fill="none" preserveAspectRatio="none">
                      <path d="M4 11C72 2 203 2 296 10" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                  </span>.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8">
                RailAgents helps agents and travellers make sense of IRCTC-related
                information, travel terms, booking questions, and where to
                verify current requirements.
              </p>
              <div className="mt-7 flex w-full flex-col justify-start gap-3 min-[420px]:w-auto min-[420px]:flex-row">
                <Link
                  href="/contact"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-[700] text-white shadow-[0_8px_22px_rgba(249,115,22,0.25)] transition-all motion-safe:hover:-translate-y-0.5 hover:bg-[#e85d04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:transition-none"
                >
                  Ask us a question <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#eadbce] bg-white/95 px-6 py-3 text-sm font-[700] text-[var(--navy)] shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" />
                  Talk to us
                </a>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="How RailAgents can help" className="relative border-b border-[#f0e1d5] bg-white py-6 sm:py-7">
          <div className="site-container grid grid-cols-2 gap-y-5 md:grid-cols-4 md:gap-y-0">
            {valueItems.map(({ icon: Icon, title, detail }, index) => (
              <div key={title} className={`flex items-center gap-3 px-2 sm:px-4 md:justify-center md:px-3 lg:px-5 ${index % 2 === 0 ? "border-r border-[#f0e1d5]" : ""} ${index < 2 ? "border-b border-[#f0e1d5] pb-4 md:border-b-0 md:pb-0" : "pt-1 md:pt-0"} ${index < 3 ? "md:border-r" : "md:border-r-0"}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1e7] text-[var(--primary)] sm:h-11 sm:w-11">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-[800] leading-snug text-[var(--navy)] sm:text-sm">{title}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-slate-600 sm:text-xs">{detail}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#fffaf5] py-12 sm:py-16 lg:py-18">
          <div className="site-container">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">How we can help</p>
              <h2 className="mt-3 text-2xl font-[850] leading-tight tracking-[-0.035em] text-[var(--navy)] sm:text-3xl">Clear information for agents and travellers</h2>
              <p className="mt-3 text-[15px] leading-7 text-slate-600 sm:text-base">
                Whether you are exploring agent-related information or helping
                someone plan a rail journey, we can help you understand the
                questions to ask and the details to check.
              </p>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {supportAreas.map(({ icon: Icon, number, title, body }) => (
                <article key={number} className="group relative overflow-hidden rounded-[22px] border border-[#f0e1d5] bg-gradient-to-br from-white to-[#fffaf5] p-5 shadow-[0_6px_22px_rgba(15,39,71,0.045)] transition-all duration-200 motion-safe:hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_12px_30px_rgba(249,115,22,0.11)] motion-reduce:transition-none sm:p-6">
                  <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100/55 blur-2xl transition-colors group-hover:bg-orange-200/60 motion-reduce:transition-none" />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1e7] text-[var(--primary)] transition-colors group-hover:bg-[#ffe5d1] motion-reduce:transition-none">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-[800] tracking-[0.1em] text-orange-300">{number}</span>
                  </div>
                  <h3 className="relative mt-5 text-lg font-[800] leading-snug text-[var(--navy)]">{title}</h3>
                  <p className="relative mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#f0e1d5] bg-white py-11 sm:py-14">
          <div className="site-container">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">A RailAgents guidance flow</p>
              <h2 className="mt-2 text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">Start with the right questions</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">A simple way to approach your enquiry—not an official IRCTC registration process.</p>
            </div>
            <div className="relative mx-auto mt-8 max-w-5xl">
              <span aria-hidden="true" className="pointer-events-none absolute bottom-6 left-6 top-6 border-l border-dashed border-orange-200 md:bottom-auto md:left-[16.66%] md:right-[16.66%] md:top-6 md:border-l-0 md:border-t" />
              <ol className="relative grid gap-5 md:grid-cols-3 md:gap-4">
                {guidanceSteps.map((step) => (
                  <li key={step.number} className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center">
                    <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[var(--primary)] text-sm font-[800] text-white shadow-[0_3px_12px_rgba(249,115,22,0.25)]">{step.number}</span>
                    <span className="pt-1 md:pt-0">
                      <span className="block text-base font-[800] text-[var(--navy)]">{step.title}</span>
                      <span className="mt-1 block max-w-xs text-sm leading-6 text-slate-600">{step.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-[#fffaf5] py-12 sm:py-16">
          <div className="site-container">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">Keep learning</p>
                <h2 className="mt-2 text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">IRCTC agent guides</h2>
              </div>
              <Link href="/guides" className="inline-flex min-h-10 w-fit items-center gap-1.5 rounded-full border border-[#eadbce] bg-white px-4 py-2 text-sm font-[700] text-[var(--primary-dark)] transition-colors hover:border-orange-300 hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
                Browse all guides <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {guideLinks.map((guide) => (
                <Link key={guide.href} href={guide.href} className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#f0e1d5] bg-white p-5 shadow-[0_5px_18px_rgba(15,39,71,0.04)] transition-all duration-200 motion-safe:hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_12px_28px_rgba(15,39,71,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:transition-none sm:p-6">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-300 via-[var(--primary)] to-amber-300" />
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fff3e8] px-3 py-1 text-[11px] font-[800] uppercase tracking-[0.08em] text-[var(--primary-dark)]">
                    <BookOpen aria-hidden="true" className="h-3.5 w-3.5" /> IRCTC Agent
                  </span>
                  <h3 className="mt-4 text-lg font-[800] leading-snug text-[var(--navy)] transition-colors group-hover:text-[var(--primary-dark)]">{guide.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{guide.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#f2e9e1] pt-4">
                    <span className="text-xs font-medium text-slate-500">Quick guide</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-[700] text-[var(--primary-dark)]">
                      Read guide <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-2 sm:py-4">
          <div className="site-container">
            <div className="mx-auto flex max-w-5xl items-start gap-4 rounded-2xl border border-orange-100 bg-[#fff8f2] p-5 sm:p-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm"><Info aria-hidden="true" className="h-5 w-5" /></span>
              <div className="min-w-0">
                <h2 className="text-base font-[800] text-[var(--navy)]">Important to know</h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  Registration requirements, documents, charges, and booking rules may change. RailAgents shares general information to help you understand what to check; confirm current details directly with the relevant authorized provider or official source. We do not issue agent IDs or represent an official registration authority.
                </p>
                <Link href="/contact" className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-[700] text-[var(--primary-dark)] hover:underline hover:underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
                  Connect with RailAgents <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white pb-12 pt-8 sm:pb-16 sm:pt-10">
          <div className="site-container">
            <div className="relative isolate overflow-hidden rounded-[26px] border border-[#f1dfce] bg-gradient-to-br from-[#fffaf5] via-[#fff2e6] to-[#ffead7] px-5 py-7 shadow-[0_12px_34px_rgba(249,115,22,0.08)] sm:px-8 sm:py-8 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:px-10">
              <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full bg-orange-200/50 blur-3xl" />
              <div aria-hidden="true" className="pointer-events-none absolute right-[32%] top-1/2 -z-10 hidden -translate-y-1/2 text-orange-300/20 lg:block">
                <Train className="h-32 w-32" strokeWidth={1} />
              </div>
              <div className="max-w-2xl">
                <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">Here to help you find clarity</p>
                <h2 className="mt-2 text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">Have an IRCTC agent question?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  Tell us what you need help understanding and we’ll point you toward the information you should check.
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:mt-0">
                <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-[700] text-white shadow-[0_7px_18px_rgba(249,115,22,0.2)] transition-colors hover:bg-[#e85d04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
                  Ask us a question <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#eadbce] bg-white/90 px-5 py-3 text-sm font-[700] text-[var(--navy)] transition-colors hover:border-orange-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
                  <MessageCircle aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" />
                  Talk on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
