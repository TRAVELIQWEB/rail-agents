import {
  ArrowRight,
  Calculator,
  CalendarDays,
  Clock3,
  Radio,
  TicketCheck,
  TrainFront,
  Wrench,
} from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";
import { railTools, type RailToolId } from "@/config/tools";

const toolDashboardConfig: Record<
  RailToolId,
  {
    icon: typeof TrainFront;
    iconBg: string;
    iconColor: string;
    iconBorder: string;
    badgeBg: string;
    badgeText: string;
    tag: string;
    actionText: string;
  }
> = {
  "live-train": {
    icon: TrainFront,
    iconBg: "bg-[#EAF7F0]",
    iconColor: "text-[#16A36A]",
    iconBorder: "border-[#16A36A]/20",
    badgeBg: "bg-[#EAF7F0]",
    badgeText: "text-[#16A36A]",
    tag: "GPS Tracking",
    actionText: "Track Running Status",
  },
  pnr: {
    icon: TicketCheck,
    iconBg: "bg-[#EAF3FA]",
    iconColor: "text-[#142B45]",
    iconBorder: "border-[#142B45]/20",
    badgeBg: "bg-[#EAF3FA]",
    badgeText: "text-[#142B45]",
    tag: "10-Digit PRS",
    actionText: "Check PNR Status",
  },
  fare: {
    icon: Calculator,
    iconBg: "bg-[#FFF1E7]",
    iconColor: "text-[#F36B21]",
    iconBorder: "border-[#F36B21]/20",
    badgeBg: "bg-[#FFF1E7]",
    badgeText: "text-[#F36B21]",
    tag: "Commission Slabs",
    actionText: "Calculate Fare",
  },
  refund: {
    icon: Radio,
    iconBg: "bg-[#FFF7D9]",
    iconColor: "text-[#B45309]",
    iconBorder: "border-[#B45309]/25",
    badgeBg: "bg-[#FFF7D9]",
    badgeText: "text-[#B45309]",
    tag: "Clerkage Deductions",
    actionText: "Calculate Refund",
  },
  "ticket-date": {
    icon: CalendarDays,
    iconBg: "bg-[#EAF3FA]",
    iconColor: "text-[#2563EB]",
    iconBorder: "border-[#2563EB]/20",
    badgeBg: "bg-[#EAF3FA]",
    badgeText: "text-[#2563EB]",
    tag: "60-Day ARP & Tatkal",
    actionText: "Find Opening Date",
  },
  chart: {
    icon: Clock3,
    iconBg: "bg-[#FFF1E7]",
    iconColor: "text-[#D9480F]",
    iconBorder: "border-[#D9480F]/20",
    badgeBg: "bg-[#FFF1E7]",
    badgeText: "text-[#D9480F]",
    tag: "1st & 2nd Charts",
    actionText: "View Chart Cutoffs",
  },
};

export function PopularToolsSection() {
  return (
    <section
      aria-labelledby="popular-tools-heading"
      className="border-b border-[#E5EAF0] bg-[#F4F5F7]/70 py-12 sm:py-16 lg:py-20"
    >
      <div className="site-container">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-[#E5EAF0] pb-6 sm:flex-row sm:items-end sm:pb-8">
          <div className="max-w-2xl">
            <span className="type-caption inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 font-bold uppercase tracking-wider text-[#142B45] border border-[#E5EAF0]">
              <Wrench className="h-3.5 w-3.5 text-[#F36B21]" aria-hidden="true" />
              Verified Utility Suite
            </span>
            <h2
              id="popular-tools-heading"
              className="type-h2 mt-2 tracking-tight text-[#142B45] "
            >
              Most-Used Railway Tools
            </h2>
            <p className="type-body-small mt-2 leading-relaxed text-[#667085] ">
              Accurate, PRS-verified calculation and live tracking tools built to simplify everyday ticketing.
            </p>
          </div>

          <InternalLink
            href="/tools"
            prefetch={false}
            className="type-button group inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E5EAF0] bg-white px-4 py-2 font-bold text-[#F36B21] shadow-2xs hover:border-[#F36B21]/50 hover:bg-[#FFF1E7]/40 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F36B21]"
          >
            <span>View all tools</span>
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
            />
          </InternalLink>
        </div>

        {/* 6-Card Dashboard Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6">
          {railTools.map((tool) => {
            const config = toolDashboardConfig[tool.id] || toolDashboardConfig["live-train"];
            const Icon = config.icon;
            return (
              <InternalLink
                key={tool.href}
                href={tool.href}
                prefetch={false}
                aria-label={`${tool.title} – ${tool.description}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#E5EAF0] bg-white p-5 sm:p-6 shadow-2xs transition-all duration-200 motion-reduce:transition-none hover:-translate-y-1 hover:border-[#F36B21]/50 hover:shadow-[0_14px_30px_-6px_rgba(243,107,33,0.18),0_4px_12px_-2px_rgba(20,43,69,0.04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F36B21]"
              >
                <div>
                  {/* Top Bar with Icon & Feature Tag */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border ${config.iconBg} ${config.iconColor} ${config.iconBorder} transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_16px_rgba(243,107,33,0.2)] shadow-2xs`}
                    >
                      <Icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <span
                      className={`type-caption rounded-full px-2.5 py-0.5 font-bold ${config.badgeBg} ${config.badgeText}`}
                    >
                      {config.tag}
                    </span>
                  </div>

                  <h3 className="type-card-title mt-5 text-[#142B45] group-hover:text-[#F36B21] transition-colors ">
                    {tool.title}
                  </h3>

                  <p className="type-body-small mt-2 leading-relaxed text-[#667085] ">
                    {tool.description}
                  </p>
                </div>

                {/* Bottom Action Row */}
                <div className="type-caption mt-5 pt-3.5 border-t border-[#E5EAF0] flex items-center justify-between ">
                  <span className="font-semibold text-[#667085]">{tool.badge}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#F36B21] transition-transform duration-150 group-hover:translate-x-0.5">
                    <span>{config.actionText}</span>
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                </div>
              </InternalLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
