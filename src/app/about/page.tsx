import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bus,
  CircleHelp,
  Compass,
  Info,
  MessageCircle,
  Plane,
  ShieldCheck,
  Train,
  UsersRound,
} from "lucide-react";
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

const purposeItems = [
  {
    number: "01",
    icon: ShieldCheck,
    title: "Understand the rules",
    description:
      "Make sense of the rights, terms, and conditions that may apply to your travel plans.",
  },
  {
    number: "02",
    icon: Compass,
    title: "Make sense of the process",
    description:
      "Get a clearer view of common travel processes and the details worth checking.",
  },
  {
    number: "03",
    icon: CircleHelp,
    title: "Get clearer answers",
    description:
      "Bring your question to us and we’ll help point you toward useful information.",
  },
];

const values = [
  { icon: BookOpen, title: "Clear information", detail: "Simple explanations" },
  { icon: Compass, title: "Practical guidance", detail: "Useful next steps" },
  { icon: UsersRound, title: "For everyone", detail: "Agents and travellers" },
  { icon: ShieldCheck, title: "Current-source aware", detail: "Know what to verify" },
];

const travelModes = [
  {
    label: "Rail Travel",
    icon: Train,
    description: "Booking, rules and journey guidance",
  },
  {
    label: "Bus Travel",
    icon: Bus,
    description: "Operator terms and common questions",
  },
  {
    label: "Air Travel",
    icon: Plane,
    description: "Air journey information and travel help",
  },
];

export default function AboutPage() {
  const whatsappMessage = encodeURIComponent(
    "Hi RailAgents, I need help understanding a travel-related question. Please guide me.",
  );
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${whatsappMessage}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdf9]">
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <section className="relative isolate overflow-hidden border-b border-[#f0e1d5] bg-[radial-gradient(ellipse_at_82%_18%,rgba(255,218,184,0.42),transparent_35%),linear-gradient(135deg,#fffdfa_0%,#fff8f2_58%,#fff3e9_100%)] py-12 sm:py-16 lg:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 left-[38%] h-72 w-72 rounded-full bg-amber-100/50 blur-3xl" />
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-30" viewBox="0 0 1440 620" preserveAspectRatio="none" fill="none">
            <path d="M-80 490C220 340 360 640 690 490S1120 370 1520 520" stroke="#F97316" strokeOpacity=".28" strokeWidth="2" />
            <path d="M-60 520C220 370 390 670 700 520S1140 400 1500 550" stroke="#F97316" strokeOpacity=".15" strokeWidth="1" />
            <circle cx="1230" cy="130" r="170" stroke="#F97316" strokeOpacity=".16" />
            <circle cx="1230" cy="130" r="205" stroke="#F97316" strokeOpacity=".1" />
          </svg>

          <div className="site-container relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 xl:gap-16">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5dfcf] bg-white/85 px-3.5 py-2 text-xs font-[800] uppercase tracking-[0.12em] text-[#e96713] shadow-sm backdrop-blur-sm">
                <BookOpen aria-hidden="true" className="h-4 w-4" />
                About RailAgents
              </span>
              <h1 className="mt-5 text-[clamp(2.2rem,5.5vw,4rem)] font-[850] leading-[1.08] tracking-[-0.045em] text-[var(--navy)]">
                Clear travel guidance,
                <span className="block text-[var(--primary)]">when you need it.</span>
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8">
                RailAgents is here to help travel agents and travellers better
                understand their rights, travel terms and conditions, and the
                information they need to make sense of a journey.
              </p>
              <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-[700] text-white shadow-[0_8px_20px_rgba(249,115,22,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#e85d04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  Connect with us <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#eadbce] bg-white/90 px-6 py-3 text-sm font-[700] text-[var(--navy)] shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4 text-[var(--primary)]" />
                  Talk to us
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
              <div aria-hidden="true" className="absolute inset-[8%] rounded-[36px] bg-orange-200/50 blur-3xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-[0_24px_70px_rgba(15,39,71,0.1)] backdrop-blur-xl sm:rounded-[34px] sm:p-7">
                <div aria-hidden="true" className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-orange-100/70 blur-2xl" />
                <div className="relative flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">Travel, made clearer</p>
                    <p className="mt-1 text-lg font-[800] text-[var(--navy)] sm:text-xl">Guidance for your journey</p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e3] text-[var(--primary)]">
                    <Compass aria-hidden="true" className="h-5 w-5" />
                  </span>
                </div>

                <div className="relative mt-7 rounded-2xl border border-[#f1e4d9] bg-gradient-to-br from-[#fffaf5] to-white p-5 sm:p-6">
                  <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-1/2 border-t border-dashed border-orange-300" />
                  <div className="relative grid grid-cols-3 items-center">
                    {travelModes.map(({ label, icon: Icon }) => (
                      <div key={label} className="flex flex-col items-center gap-2 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-orange-100 bg-white text-[var(--primary)] shadow-[0_4px_14px_rgba(249,115,22,0.1)] sm:h-16 sm:w-16">
                          <Icon aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7" />
                        </span>
                        <span className="text-xs font-[700] text-[var(--navy)] sm:text-sm">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative mt-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 rounded-xl border border-[#f1e4d9] bg-white/90 px-3 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff1e7] text-[var(--primary)]"><ShieldCheck aria-hidden="true" className="h-4 w-4" /></span>
                    <span className="text-xs font-[700] leading-5 text-[var(--navy)] sm:text-sm">Know what to check</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-[#f1e4d9] bg-white/90 px-3 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff1e7] text-[var(--primary)]"><MessageCircle aria-hidden="true" className="h-4 w-4" /></span>
                    <span className="text-xs font-[700] leading-5 text-[var(--navy)] sm:text-sm">Ask your question</span>
                  </div>
                </div>
                <span aria-hidden="true" className="absolute -right-3 top-[42%] flex h-9 w-9 items-center justify-center rounded-full border border-orange-100 bg-white text-[var(--primary)] shadow-md"><Train className="h-4 w-4" /></span>
              </div>
              <span className="absolute -left-3 top-[25%] hidden rounded-full border border-[#f0e1d5] bg-white px-3 py-2 text-xs font-[700] text-[var(--navy)] shadow-md sm:inline-flex">For agents &amp; travellers</span>
            </div>
          </div>
        </section>

        <section className="relative bg-white py-12 sm:py-16 lg:py-20">
          <div className="site-container grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div className="max-w-xl">
              <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">What we are here for</p>
              <h2 className="mt-3 text-2xl font-[850] leading-tight tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">Helping you understand the journey ahead.</h2>
              <p className="mt-4 text-[15px] leading-7 text-slate-600 sm:text-base">
                Travel information can be difficult to follow. We aim to make it
                easier with clear explanations and useful direction for your
                situation.
              </p>
            </div>
            <div className="grid gap-3">
              {purposeItems.map(({ number, icon: Icon, title, description }) => (
                <article key={number} className="group flex items-start gap-4 rounded-2xl border border-[#f0e1d5] bg-[#fffdfa] p-4 shadow-[0_4px_16px_rgba(15,39,71,0.035)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,39,71,0.07)] sm:p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0e3] text-[var(--primary)]"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="text-base font-[800] text-[var(--navy)]">{title}</h3>
                      <span className="text-xs font-[800] tracking-[0.08em] text-orange-300">{number}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="Our values" className="border-y border-[#f0e1d5] bg-[#fff8f2] py-7 sm:py-8">
          <div className="site-container grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4 md:gap-3">
            {values.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="flex items-center gap-3 md:justify-center">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="text-sm font-[800] leading-snug text-[var(--navy)]">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#fffdfa] py-12 sm:py-16 lg:py-20">
          <div className="site-container">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">Travel, all in one place</p>
              <h2 className="mt-3 text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">Guidance for the way you travel</h2>
              <p className="mt-3 text-[15px] leading-7 text-slate-600 sm:text-base">Whether you work in travel or are planning a trip, reach out with questions about rail, bus, air, or other travel topics.</p>
            </div>
            <div className="mx-auto mt-7 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {travelModes.map(({ label, icon: Icon, description }) => (
                <article key={label} className="flex items-start gap-4 rounded-2xl border border-[#f0e1d5] bg-white p-5 shadow-[0_5px_18px_rgba(15,39,71,0.04)] transition-transform hover:-translate-y-0.5 sm:p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff1e7] text-[var(--primary)]"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                  <div>
                    <h3 className="text-base font-[800] text-[var(--navy)]">{label}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white pb-12 sm:pb-16 lg:pb-20">
          <div className="site-container">
            <div className="mx-auto flex max-w-5xl items-start gap-3 rounded-2xl border border-orange-100 bg-[#fff8f2] p-4 sm:p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm"><Info aria-hidden="true" className="h-5 w-5" /></span>
              <p className="text-sm leading-6 text-slate-600">
                Travel rules and terms can vary by provider and change over
                time. We share general guidance to help you understand what to
                check; confirm current requirements with the relevant travel
                provider or official source.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#fff8f2] pb-12 sm:pb-16 lg:pb-20">
          <div className="site-container">
            <div className="relative isolate overflow-hidden rounded-[28px] border border-[#f3dfcf] bg-gradient-to-br from-white via-[#fffaf5] to-[#ffeddd] px-5 py-8 shadow-[0_12px_38px_rgba(15,39,71,0.06)] sm:px-8 sm:py-9 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:px-10">
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl" />
              <div className="max-w-2xl">
                <p className="text-xs font-[800] uppercase tracking-[0.12em] text-[var(--primary-dark)]">We’re here to help</p>
                <h2 className="mt-2 text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)] sm:text-3xl">Still have a question?</h2>
                <p className="mt-3 text-[15px] leading-7 text-slate-600 sm:text-base">Tell us what you need help with and we’ll point you in the right direction.</p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-[700] text-white shadow-[0_7px_18px_rgba(249,115,22,0.2)] transition-colors hover:bg-[#e85d04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  Send us your question <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#eadbce] bg-white/90 px-5 py-3 text-sm font-[700] text-[var(--navy)] transition-colors hover:border-orange-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
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
