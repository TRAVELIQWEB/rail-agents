import type { Metadata } from "next";
import { ArrowRight, Calculator, CalendarDays, Radio, TicketCheck, TrainFront } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { InternalLink } from "@/components/ui/InternalLink";
import { railTools } from "@/config/tools";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Railway Tools & Online Calculators",
  description:
    "Access free Indian Railways tools from RailAgents: Live Train Running Status, PNR Status Check, Ticket Booking Date Calculator, Train Fare Breakdown, and Chart Timings.",
  alternates: {
    canonical: `${siteConfig.url}/tools`,
  },
  openGraph: {
    title: "Railway Tools & Online Calculators | RailAgents",
    description:
      "Access free Indian Railways tools from RailAgents: Live Train Running Status, PNR Status Check, Ticket Booking Date Calculator, Train Fare Breakdown, and Chart Timings.",
    url: `${siteConfig.url}/tools`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "Railway Tools & Online Calculators - RailAgents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Railway Tools & Online Calculators | RailAgents",
    description:
      "Access free Indian Railways tools from RailAgents: Live Train Running Status, PNR Status Check, Ticket Booking Date Calculator, Train Fare Breakdown, and Chart Timings.",
    images: [siteConfig.socialImage],
  },
};

const icons = {
  calculator: Calculator,
  calendar: CalendarDays,
  radio: Radio,
  ticket: TicketCheck,
  train: TrainFront,
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${siteConfig.url}/tools#webpage`,
      url: `${siteConfig.url}/tools`,
      name: "Railway Tools & Online Calculators | RailAgents",
      description:
        "Access free Indian Railways tools from RailAgents: Live Train Running Status, PNR Status Check, Ticket Booking Date Calculator, Train Fare Breakdown, and Chart Timings.",
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      about: { "@id": `${siteConfig.url}/#organization` },
      inLanguage: "en-IN",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteConfig.url}/tools#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteConfig.url}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tools",
          item: `${siteConfig.url}/tools`,
        },
      ],
    },
  ],
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main className="min-h-[65vh] bg-[var(--background)]">
        <section className="relative isolate overflow-hidden border-b border-orange-100 bg-[linear-gradient(118deg,#fff8f1_0%,#fffdfa_48%,#f1f6ff_100%)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-orange-200/25 blur-3xl" />
            <div className="absolute -bottom-40 left-[12%] h-72 w-72 rounded-full bg-blue-200/25 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-200/80 to-transparent" />
          </div>
          <div className="site-container relative pt-8 pb-6 sm:pt-10 sm:pb-8 lg:pt-11 lg:pb-8">
            <div className="mx-auto max-w-6xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-white/85 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--primary-dark)] shadow-[0_4px_14px_rgba(16,36,66,0.06)]">
                <TrainFront aria-hidden="true" className="h-4 w-4" />
                Your railway toolkit
              </span>
              <h1 className="mt-2 text-3xl font-extrabold leading-[1.12] tracking-tight text-[var(--navy)] sm:text-4xl lg:whitespace-nowrap lg:text-[clamp(1.75rem,2.4vw,2.4rem)]">
                The right railway tool,{" "}
                <span className="block text-[var(--primary)] lg:inline">right when you need it</span>
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-[0.9375rem] leading-6 text-slate-600 sm:text-base sm:leading-7">
                Check train running status, plan ticket dates, review fares, and look up your PNR.
              </p>
            </div>
          </div>
        </section>

        <section className="site-container py-6 sm:py-8 lg:py-10" aria-labelledby="tools-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
            <div>
              <p className="text-sm font-semibold text-[var(--primary-dark)]">Simple tools for your rail journey</p>
              <h2 id="tools-heading" className="mt-1 text-2xl font-bold text-[var(--navy)] sm:text-3xl">
                Choose a tool
              </h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
              {railTools.length} available tools
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {railTools.map((tool) => {
              const Icon = icons[tool.icon];
              return (
                <InternalLink
                  key={tool.href}
                  href={tool.href}
                  prefetch={false}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[var(--primary-dark)] ring-1 ring-orange-200/70 transition-colors group-hover:bg-orange-100/80">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {tool.badge}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-[var(--navy)] group-hover:text-[var(--primary-dark)]">
                      {tool.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {tool.description}
                    </p>
                  </div>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary-dark)] group-hover:underline">
                    Use tool
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </InternalLink>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
