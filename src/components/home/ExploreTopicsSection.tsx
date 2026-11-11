import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Ticket,
  UserCheck,
  XCircle,
  Zap,
} from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";

const anchorTopics = [
  {
    title: "IRCTC Agent Registration & Setup",
    description:
      "A complete roadmap to becoming an authorized IRCTC travel agent, verifying Principal Service Providers (PSPs), and setting up your business legally.",
    href: "/irctc-agent-registration",
    icon: UserCheck,
    tag: "Essential Gateway",
    accentColor: "border-l-4 border-l-[#F36B21]",
    iconBg: "bg-[#FFF1E7]",
    iconColor: "text-[#F36B21]",
    bullets: [
      "Official PSP Verification & ID generation",
      "Document checklist & Aadhaar OTP verification",
      "Direct PSP vs Sub-agent fee breakdown",
    ],
  },
  {
    title: "Tatkal & Premium Tatkal Booking Rules",
    description:
      "Master the critical 10:00 AM (AC) and 11:00 AM (Non-AC) booking windows with official passenger quotas, timing cutoffs, and agent lockout rules.",
    href: "/guides/tatkal-booking-guide-agents",
    icon: Zap,
    tag: "Time Critical",
    accentColor: "border-l-4 border-l-[#B45309]",
    iconBg: "bg-[#FFF7D9]",
    iconColor: "text-[#B45309]",
    bullets: [
      "AC at 10:00 AM & Non-AC at 11:00 AM rules",
      "Agent lockout window (first 15 minutes)",
      "Premium Tatkal dynamic fare calculation",
    ],
  },
];

const secondaryTopics = [
  {
    title: "Ticket Booking Guidelines",
    description: "Customer workflows, general quota rules, and commercial passenger limits.",
    href: "/guides/start-ticket-booking-for-customers",
    icon: Ticket,
    tag: "Booking",
    iconBg: "bg-[#EAF3FA]",
    iconColor: "text-[#142B45]",
  },
  {
    title: "Cancellation & Refund Slabs",
    description: "Time-band clerkage deductions, PRS refund charts, and GST adjustments.",
    href: "/guides/ticket-cancellation-refund-guide",
    icon: XCircle,
    tag: "Refunds",
    iconBg: "bg-[#FFF1E7]",
    iconColor: "text-[#D9480F]",
  },
  {
    title: "TDR Filing Procedures",
    description: "Train cancellations, delays over 3 hours, coach breakdown, and refund tracking.",
    href: "/irctc-agent-rules-regulations#section-h",
    icon: FileText,
    tag: "Claims",
    iconBg: "bg-[#EAF7F0]",
    iconColor: "text-[#16A36A]",
  },
  {
    title: "Agent Compliance & Section 143",
    description: "Railway Board regulations, service charges caps, OTP authentication, and audits.",
    href: "/irctc-agent-rules-regulations",
    icon: ShieldCheck,
    tag: "Legal Compliance",
    iconBg: "bg-[#EAF3FA]",
    iconColor: "text-[#2563EB]",
  },
];

export function ExploreTopicsSection() {
  return (
    <section
      aria-labelledby="explore-topics-heading"
      className="border-b border-[#E5EAF0] bg-[#FFF1E7]/40 py-12 sm:py-16 lg:py-20"
    >
      <div className="site-container">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-[#E5EAF0] pb-6 sm:flex-row sm:items-end sm:pb-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#142B45] border border-[#E5EAF0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F36B21]" />
              Structured Knowledge Base
            </span>
            <h2
              id="explore-topics-heading"
              className="mt-2 text-2xl font-black tracking-tight text-[#142B45] sm:text-3xl lg:text-4xl"
            >
              Explore Railway Topics
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#667085] sm:text-base">
              Step-by-step procedural guidelines organized into comprehensive operational categories.
            </p>
          </div>

          <InternalLink
            href="/guides"
            prefetch={false}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E5EAF0] bg-white px-4 py-2 text-sm font-bold text-[#F36B21] shadow-2xs hover:border-[#F36B21]/50 hover:bg-[#FFF1E7] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F36B21]"
          >
            <span>View all topic guides</span>
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
            />
          </InternalLink>
        </div>

        {/* Asymmetrical Pathway Grid */}
        <div className="mt-8 space-y-6">
          {/* Top Row: 2 Major Pillar Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {anchorTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <InternalLink
                  key={topic.href}
                  href={topic.href}
                  prefetch={false}
                  className={`group relative flex flex-col justify-between rounded-2xl border border-[#E5EAF0] ${topic.accentColor} bg-white p-6 sm:p-7 shadow-xs transition-all duration-200 motion-reduce:transition-none hover:-translate-y-1 hover:border-[#F36B21]/50 hover:shadow-[0_16px_36px_-8px_rgba(243,107,33,0.16),0_4px_16px_-4px_rgba(20,43,69,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F36B21]`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border border-black/5 ${topic.iconBg} ${topic.iconColor} transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_18px_rgba(243,107,33,0.22)] shadow-2xs`}
                      >
                        <Icon aria-hidden="true" className="h-6 w-6" />
                      </span>
                      <span className="rounded-full bg-[#142B45] px-3 py-1 text-xs font-bold text-white shadow-2xs">
                        {topic.tag}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-black text-[#142B45] group-hover:text-[#F36B21] transition-colors sm:text-xl">
                      {topic.title}
                    </h3>

                    <p className="mt-2.5 text-xs leading-relaxed text-[#667085] sm:text-sm">
                      {topic.description}
                    </p>

                    {/* Bullet Highlights */}
                    <ul className="mt-5 space-y-2 border-t border-[#E5EAF0] pt-4">
                      {topic.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-xs text-[#344054]">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#16A36A]" aria-hidden="true" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E5EAF0] flex items-center justify-between text-xs font-bold text-[#F36B21]">
                    <span>Complete operational guide</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Explore pathway</span>
                      <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </InternalLink>
              );
            })}
          </div>

          {/* Bottom Row: 4 Supporting Pathway Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {secondaryTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <InternalLink
                  key={topic.href}
                  href={topic.href}
                  prefetch={false}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-2xs transition-all duration-200 motion-reduce:transition-none hover:-translate-y-1 hover:border-[#F36B21]/45 hover:shadow-[0_12px_28px_-6px_rgba(243,107,33,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F36B21]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 ${topic.iconBg} ${topic.iconColor} transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_14px_rgba(243,107,33,0.18)] shadow-2xs`}
                      >
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <span className="rounded-md bg-[#F4F5F7] px-2 py-0.5 text-[11px] font-semibold text-[#667085]">
                        {topic.tag}
                      </span>
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-[#142B45] group-hover:text-[#F36B21] transition-colors sm:text-base">
                      {topic.title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-[#667085] line-clamp-2">
                      {topic.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5EAF0]/60 flex items-center justify-between text-xs font-bold text-[#F36B21]">
                    <span>Read guide</span>
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </InternalLink>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
