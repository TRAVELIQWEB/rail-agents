import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CircleHelp, FileCheck2, MessageCircle, ShieldCheck } from "lucide-react";
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

const supportAreas = [
  {
    icon: BookOpen,
    title: "Understand the process",
    body: "Get clear explanations of common IRCTC agent questions and the steps you may need to research before making a decision.",
  },
  {
    icon: FileCheck2,
    title: "Know what to verify",
    body: "Learn how to check current eligibility, document requirements, terms, and charges with the relevant authorized provider.",
  },
  {
    icon: CircleHelp,
    title: "Make sense of travel questions",
    body: "Find practical guidance about bookings, ticket status, cancellations, refunds, and common customer queries.",
  },
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
    <div className="flex min-h-screen flex-col bg-[#fff9f5]">
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-orange-100/50 blur-[90px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-64 h-80 w-80 rounded-full bg-orange-200/30 blur-[100px]"
        />

        <section className="relative border-b border-[#f0e1d5] bg-gradient-to-br from-[#fffdfa] via-[#fff8f2] to-[#fff2e8] py-14 sm:py-20 lg:py-24">
          <div className="site-container">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5dfcf] bg-white/80 px-3.5 py-2 text-xs font-[800] uppercase tracking-[0.12em] text-[#e96713] shadow-sm">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                IRCTC Agent Guidance
              </span>
              <h1 className="mt-5 text-[clamp(2.2rem,6vw,4rem)] font-[850] leading-[1.08] tracking-[-0.045em] text-[var(--navy)]">
                Understand the process before you take the next step.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                RailAgents helps agents and travellers make sense of IRCTC-related
                information, travel terms, booking questions, and where to
                verify current requirements.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-[700] text-white shadow-[0_8px_20px_rgba(249,115,22,0.2)] transition-colors hover:bg-[#e85d04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  Ask us a question <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#eadbce] bg-white px-6 py-3 text-sm font-[700] text-[var(--navy)] transition-colors hover:border-orange-300 hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" />
                  Talk to us
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="site-container">
            <div className="max-w-3xl">
              <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">
                How we can help
              </p>
              <h2 className="mt-3 text-2xl font-[850] leading-tight tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">
                Clear information for agents and travellers
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Whether you are exploring agent-related information or helping
                someone plan a rail journey, we can help you understand the
                questions to ask and the details to check.
              </p>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {supportAreas.map(({ icon: Icon, title, body }) => (
                <article key={title} className="rounded-2xl border border-[#f0e1d5] bg-white/90 p-5 shadow-[0_5px_18px_rgba(15,39,71,0.04)] sm:p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff1e7] text-[var(--primary)]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-[800] text-[var(--navy)]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative pb-12 sm:pb-16 lg:pb-20">
          <div className="site-container">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">
                  Keep learning
                </p>
                <h2 className="mt-2 text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">
                  IRCTC agent guides
                </h2>
              </div>
              <Link href="/guides" className="inline-flex items-center gap-1.5 text-sm font-[700] text-[var(--primary-dark)] hover:underline hover:underline-offset-4">
                Browse all guides <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {guideLinks.map((guide) => (
                <Link key={guide.href} href={guide.href} className="group rounded-2xl border border-[#f0e1d5] bg-white p-5 shadow-[0_5px_18px_rgba(15,39,71,0.04)] transition-shadow hover:shadow-[0_10px_28px_rgba(15,39,71,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:p-6">
                  <h3 className="text-lg font-[800] leading-snug text-[var(--navy)] group-hover:text-[var(--primary-dark)]">{guide.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{guide.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-[700] text-[var(--primary-dark)]">
                    Read guide <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-orange-100 bg-[#fff8f2] p-5 sm:p-6">
              <p className="text-sm leading-6 text-slate-600">
                Registration requirements, documents, charges, and booking rules
                may change. RailAgents shares general information to help you
                understand what to check; confirm current details directly with
                the relevant authorized provider or official source. We do not
                issue agent IDs or represent an official registration authority.
              </p>
              <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-[700] text-[var(--primary-dark)] hover:underline hover:underline-offset-4">
                Connect with RailAgents <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
