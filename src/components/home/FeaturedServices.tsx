import {
  ArrowRight,
  BookOpen,
  Calculator,
  CalendarDays,
  Clock3,
  Info,
  MessageCircle,
  TicketCheck,
  TrainFront,
} from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";

const keyServices = [
  {
    title: "Live Train Running Status",
    shortTitle: "Live Train Status",
    description:
      "Track live train location, real-time arrival delays, platform numbers, and station schedules across India.",
    href: "/live-train-status",
    badge: "Real-Time Tracking",
    icon: TrainFront,
    color: "from-orange-500/10 to-amber-500/10 text-orange-600",
  },
  {
    title: "PNR Status Check",
    shortTitle: "PNR Status",
    description:
      "Verify live 10-digit Indian Railway ticket PNR status, coach and berth confirmation, and chart preparation.",
    href: "/pnr-status",
    badge: "Live Verification",
    icon: TicketCheck,
    color: "from-blue-500/10 to-cyan-500/10 text-blue-600",
  },
  {
    title: "Railway Agent Guides",
    shortTitle: "Agent Guides",
    description:
      "Practical step-by-step guides on IRCTC agent registration, commercial rules, Tatkal timings, and compliance.",
    href: "/guides",
    badge: "Knowledge Base",
    icon: BookOpen,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600",
  },
  {
    title: "Train Ticket Fare Calculator",
    shortTitle: "Fare Calculator",
    description:
      "Calculate ticket costs with a clear breakdown of base fare, IRCTC fees, agent charges, and payment gateway costs.",
    href: "/train-ticket-agent-fare-calculator",
    badge: "Fee Breakdown",
    icon: Calculator,
    color: "from-purple-500/10 to-pink-500/10 text-purple-600",
  },
  {
    title: "Ticket Booking Date Calculator",
    shortTitle: "Booking Dates",
    description:
      "Find exact 60-day advance reservation opening dates and Tatkal booking timings (AC at 10 AM, Non-AC at 11 AM).",
    href: "/ticket-date-calculator",
    badge: "60-Day ARP",
    icon: CalendarDays,
    color: "from-amber-500/10 to-orange-500/10 text-amber-600",
  },
  {
    title: "Train Chart Preparation Time",
    shortTitle: "Chart Timings",
    description:
      "Check station-wise first and second final reservation chart preparation timings for any Indian Railways train.",
    href: "/train-chart-preparation-time",
    badge: "PRS Timings",
    icon: Clock3,
    color: "from-sky-500/10 to-indigo-500/10 text-sky-600",
  },
  {
    title: "Ask Nihal Singh",
    shortTitle: "Ask Nihal",
    description:
      "Get clear, realistic answers to common railway travel, booking, and ticket cancellation questions.",
    href: "/ask-nihal",
    badge: "Digital Guidance",
    icon: MessageCircle,
    color: "from-rose-500/10 to-orange-500/10 text-rose-600",
  },
  {
    title: "About RailAgents",
    shortTitle: "About Us",
    description:
      "Discover our background, 20+ years of ticketing experience, and commitment to clear railway guidance.",
    href: "/about",
    badge: "Our Mission",
    icon: Info,
    color: "from-slate-500/10 to-slate-700/10 text-slate-700",
  },
];

export function FeaturedServices() {
  return (
    <section
      aria-labelledby="featured-services-heading"
      className="relative overflow-hidden bg-gradient-to-b from-[#fffcf8] via-white to-[#fffaf5] py-10 sm:py-14 lg:py-16 border-b border-[#f4e4d4]"
    >
      <div className="site-container">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-1 text-xs font-[800] uppercase tracking-wider text-[#ea580c] shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-[#f97316]" />
            Core Railway Services &amp; Tools
          </div>
          <h2
            id="featured-services-heading"
            className="text-2xl font-[900] tracking-tight text-[var(--navy)] sm:text-3xl lg:text-4xl"
          >
            Essential Railway Tools &amp;{" "}
            <span className="text-[var(--primary)]">Agent Resources</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Quickly navigate to our most popular Indian Railway tracking tools, verified agent compliance guides, and travel resources.
          </p>
        </div>

        {/* 8-Card Sitelinks Grid (4 cols on lg, 2 cols on sm, 1 col on mobile) */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {keyServices.map((service) => {
            const Icon = service.icon;
            return (
              <InternalLink
                key={service.href}
                href={service.href}
                prefetch={false}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${service.color} ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105`}
                    >
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-[800] text-[var(--navy)] group-hover:text-[var(--primary)] transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-[var(--primary)]">
                  <span>Open {service.shortTitle}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                  />
                </div>
              </InternalLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

