import { ArrowRight, ShieldCheck, Ticket, Zap, XCircle, FileText, UserRoundCheck } from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";
import type { Topic } from "@/types";

const iconMap = {
  "user-check": UserRoundCheck,
  ticket: Ticket,
  zap: Zap,
  "x-circle": XCircle,
  "file-text": FileText,
  "shield-check": ShieldCheck,
};

type TopicCardProps = {
  topic: Topic;
};

export function TopicCard({ topic }: TopicCardProps) {
  const Icon = iconMap[topic.icon as keyof typeof iconMap] ?? UserRoundCheck;

  return (
    <InternalLink
      href={topic.href}
      prefetch={false}
      className="group relative flex min-h-[112px] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[#f2e5d8] bg-gradient-to-b from-white via-[#fffcf9] to-[#fff8f2]/90 p-4 text-center shadow-[0_4px_16px_rgba(15,39,71,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f97316]/40 hover:shadow-[0_12px_28px_rgba(249,115,22,0.12),inset_0_1px_0_rgba(255,255,255,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:min-h-[92px] sm:flex-row sm:justify-between sm:gap-3 sm:text-left sm:p-4.5"
    >
      {/* Top subtle hover accent bar */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex min-w-0 flex-col items-center gap-2 sm:flex-row sm:gap-3.5">
        {/* Soft 3D elevated icon box */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.8)] transition-transform duration-300 group-hover:scale-105 ${topic.iconClassName}`}
        >
          <Icon className="h-5 w-5 shrink-0" />
        </div>

        {/* Title */}
        <span className="min-w-0 text-[1.0625rem] font-[700] leading-snug tracking-[-0.015em] text-[var(--navy)] transition-colors duration-200 group-hover:text-[var(--primary-dark)]">
          {topic.title}
        </span>
      </div>

      {/* Arrow in round action button */}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff5eb] text-[var(--primary)] shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[var(--primary)] group-hover:text-white group-hover:shadow-[0_3px_10px_rgba(249,115,22,0.35)]">
        <ArrowRight className="h-4 w-4" />
      </span>
    </InternalLink>
  );
}
