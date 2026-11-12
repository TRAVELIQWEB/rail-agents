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
    color: "bg-[#EFF6FF] text-[#2563EB] ring-[#BFDBFE]",
    actionColor: "text-[#2563EB]",
  },
  {
    title: "PNR Status Check",
    shortTitle: "PNR Status",
    description:
      "Verify live 10-digit Indian Railway ticket PNR status, coach and berth confirmation, and chart preparation.",
    href: "/pnr-status",
    badge: "Live Verification",
    icon: TicketCheck,
    color: "bg-[#ECFDF5] text-[#15803D] ring-[#BBF7D0]",
    actionColor: "text-[#15803D]",
  },
  {
    title: "Railway Agent Guides",
    shortTitle: "Agent Guides",
    description:
      "Practical step-by-step guides on IRCTC agent registration, commercial rules, Tatkal timings, and compliance.",
    href: "/guides",
    badge: "Knowledge Base",
    icon: BookOpen,
    color: "bg-[#F0FDFA] text-[#0D9488] ring-[#99F6E4]",
    actionColor: "text-[#0D9488]",
  },
  {
    title: "Train Ticket Fare Calculator",
    shortTitle: "Fare Calculator",
    description:
      "Calculate ticket costs with a clear breakdown of base fare, IRCTC fees, agent charges, and payment gateway costs.",
    href: "/train-ticket-agent-fare-calculator",
    badge: "Fee Breakdown",
    icon: Calculator,
    color: "bg-[#F5F3FF] text-[#7C3AED] ring-[#DDD6FE]",
    actionColor: "text-[#7C3AED]",
  },
  {
    title: "Ticket Booking Date Calculator",
    shortTitle: "Booking Dates",
    description:
      "Find exact 60-day advance reservation opening dates and Tatkal booking timings (AC at 10 AM, Non-AC at 11 AM).",
    href: "/ticket-date-calculator",
    badge: "60-Day ARP",
    icon: CalendarDays,
    color: "bg-[#FFF7ED] text-[#F36B21] ring-[#FED7AA]",
    actionColor: "text-[#F36B21]",
  },
  {
    title: "Train Chart Preparation Time",
    shortTitle: "Chart Timings",
    description:
      "Check station-wise first and second final reservation chart preparation timings for any Indian Railways train.",
    href: "/train-chart-preparation-time",
    badge: "PRS Timings",
    icon: Clock3,
    color: "bg-[#F0FDFA] text-[#0D9488] ring-[#99F6E4]",
    actionColor: "text-[#0D9488]",
  },
  {
    title: "Ask Nihal Singh",
    shortTitle: "Ask Nihal",
    description:
      "Get clear, realistic answers to common railway travel, booking, and ticket cancellation questions.",
    href: "/ask-nihal",
    badge: "Digital Guidance",
    icon: MessageCircle,
    color: "bg-[#FFF1F2] text-[#BE123C] ring-[#FECDD3]",
    actionColor: "text-[#BE123C]",
  },
  {
    title: "About RailAgents",
    shortTitle: "About Us",
    description:
      "Discover our background, 20+ years of ticketing experience, and commitment to clear railway guidance.",
    href: "/about",
    badge: "Our Mission",
    icon: Info,
    color: "bg-[#EFF6FF] text-[#102B4E] ring-[#BFDBFE]",
    actionColor: "text-[#2563EB]",
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
          <div className="type-caption mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-1 font-extrabold uppercase tracking-wider text-[#F36B21] shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-[#F36B21]" />
            Core Railway Services &amp; Tools
          </div>
          <h2
            id="featured-services-heading"
            className="type-h2  tracking-tight text-[var(--navy)] "
          >
            Essential Railway Tools &amp;{" "}
            <span className="text-[var(--primary)]">Agent Resources</span>
          </h2>
          <p className="type-body-small mt-3 leading-relaxed text-slate-600 ">
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
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105 ${service.color}`}
                    >
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="type-caption rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-slate-600">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="type-card-title mt-4 text-[var(--navy)] group-hover:text-[var(--primary)] transition-colors">
                    {service.title}
                  </h3>
                  <p className="type-body-small mt-1.5 leading-relaxed text-slate-600 line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div
                  className={`type-caption mt-4 flex items-center justify-between border-t border-slate-100 pt-3 font-bold ${service.actionColor}`}
                >
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

