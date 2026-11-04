import type { Metadata } from "next";
import { ArrowRight, Calculator, CalendarDays, Radio, TicketCheck, TrainFront } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { InternalLink } from "@/components/ui/InternalLink";
import { railTools } from "@/config/tools";

export const metadata: Metadata = {
  title: "Railway Tools & Calculators",
  description: "Browse RailAgents tools for train fares, ticket dates, chart timings, PNR status, and cancellation refunds.",
  alternates: { canonical: "/tools" },
};

const icons = {
  calculator: Calculator,
  calendar: CalendarDays,
  radio: Radio,
  ticket: TicketCheck,
};

export default function ToolsPage() {
  return (
    <>
      <Header />
      <main className="min-h-[65vh] bg-[var(--background)]">
        <section className="relative isolate overflow-hidden border-b border-orange-100 bg-[linear-gradient(118deg,#fff8f1_0%,#fffdfa_48%,#f1f6ff_100%)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-orange-200/25 blur-3xl" />
            <div className="absolute -bottom-40 left-[12%] h-72 w-72 rounded-full bg-blue-200/25 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-200/80 to-transparent" />
          </div>
          <div className="site-container relative py-9 sm:py-11 lg:py-12">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-white/85 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--primary-dark)] shadow-[0_4px_14px_rgba(16,36,66,0.06)]">
                <TrainFront aria-hidden="true" className="h-4 w-4" />
                Your railway toolkit
              </span>
              <h1 className="mt-3 text-3xl font-extrabold leading-[1.12] tracking-tight text-[var(--navy)] sm:text-4xl lg:text-[2.75rem]">
                The right railway tool,
                <span className="block text-[var(--primary)]">right when you need it</span>
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-[0.9375rem] leading-6 text-slate-600 sm:text-base sm:leading-7">
                Plan your booking with simple tools for fares, ticket dates, chart timings, and PNR status.
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

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {railTools.map((tool) => {
              const Icon = icons[tool.icon];
              return (
                <InternalLink
                  key={tool.href}
                  href={tool.href}
                  prefetch={false}
                  className="group flex min-h-[185px] flex-col rounded-2xl border border-[#e8eaf0] bg-white p-4 shadow-[0_5px_20px_rgba(16,36,66,0.04)] transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_14px_32px_rgba(16,36,66,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[var(--primary)] ring-1 ring-orange-100 transition-colors group-hover:bg-orange-100">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-[#fff4eb] px-2.5 py-1 text-[11px] font-bold text-[var(--primary-dark)]">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold leading-snug text-[var(--navy)] group-hover:text-[var(--primary-dark)]">
                    {tool.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-5 text-slate-600">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--primary-dark)]">
                    Open tool
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
