import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bus, BookOpen, MessageCircle, Plane, Train } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About RailAgents",
  description:
    "RailAgents helps agents and travellers understand travel information, rights, terms and conditions, and common questions across rail, bus, and air journeys.",
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: "About RailAgents",
    description:
      "Clear, practical travel guidance for agents and travellers across rail, bus, and air journeys.",
    url: `${siteConfig.url}/about`,
    images: [siteConfig.socialImage],
  },
};

const travelModes = [
  { label: "Rail travel", icon: Train },
  { label: "Bus travel", icon: Bus },
  { label: "Air travel", icon: Plane },
];

const helpTopics = [
  "Understand travel rights and the terms and conditions that apply to a journey.",
  "Make sense of common travel processes, information, and available next steps.",
  "Find clear answers to questions from agents and everyday travellers.",
];

export default function AboutPage() {
  const whatsappMessage = encodeURIComponent(
    "Hi RailAgents, I need help understanding a travel-related question. Please guide me.",
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
                <BookOpen aria-hidden="true" className="h-4 w-4" />
                About RailAgents
              </span>
              <h1 className="mt-5 text-[clamp(2.2rem,6vw,4rem)] font-[850] leading-[1.08] tracking-[-0.045em] text-[var(--navy)]">
                Clear travel guidance, when you need it.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                RailAgents is here to help travel agents and travellers better
                understand their rights, travel terms and conditions, and the
                information they need to make sense of a journey.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-[700] text-white shadow-[0_8px_20px_rgba(249,115,22,0.2)] transition-colors hover:bg-[#e85d04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  Connect with us <ArrowRight aria-hidden="true" className="h-4 w-4" />
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
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
              <div>
                <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">
                  What we are here for
                </p>
                <h2 className="mt-3 text-2xl font-[850] leading-tight tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">
                  Helping you understand the journey ahead.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  Travel information can be difficult to follow. We aim to make
                  it easier to understand by sharing clear explanations and
                  pointing you toward useful information for your situation.
                </p>
              </div>

              <ul className="grid gap-3">
                {helpTopics.map((topic, index) => (
                  <li
                    key={topic}
                    className="flex gap-4 rounded-2xl border border-[#f0e1d5] bg-white/90 p-5 shadow-[0_5px_18px_rgba(15,39,71,0.04)] sm:p-6"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff1e7] text-sm font-[800] text-[var(--primary-dark)]">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-slate-700 sm:text-base">{topic}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="relative pb-12 sm:pb-16 lg:pb-20">
          <div className="site-container">
            <div className="rounded-3xl border border-[#f0e1d5] bg-white/90 p-6 shadow-[0_10px_32px_rgba(15,39,71,0.05)] sm:p-9 lg:p-10">
              <div className="max-w-2xl">
                <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">
                  One place for travel questions
                </p>
                <h2 className="mt-3 text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">
                  Guidance for agents and travellers
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Whether you work in travel or are planning a trip, you can
                  reach out with questions about rail, bus, air, or other
                  travel-related topics.
                </p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {travelModes.map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl bg-[#fff8f2] px-4 py-3.5 text-sm font-[700] text-[var(--navy)]">
                    <Icon aria-hidden="true" className="h-5 w-5 text-[var(--primary)]" />
                    {label}
                  </div>
                ))}
              </div>
              <p className="mt-6 max-w-3xl text-xs leading-5 text-slate-500">
                Travel rules and terms can vary by provider and change over
                time. We share general guidance to help you understand what to
                check; confirm current requirements with the relevant travel
                provider or official source.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-[700] text-white transition-colors hover:bg-[#e85d04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  Send us your question <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-[700] text-[var(--primary-dark)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
                  Or talk to us on WhatsApp
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
