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
      className="group relative flex min-h-[120px] flex-col items-center justify-center gap-3 overflow-hidden rounded-[26px] border border-[#f2e5d8] bg-gradient-to-br from-white via-[#fffaf6] to-[#fff2e4] p-4 text-center shadow-[0_10px_30px_rgba(15,39,71,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-[#fdba74] hover:shadow-[0_18px_38px_rgba(249,115,22,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:min-h-[108px] sm:flex-row sm:justify-between sm:gap-4 sm:text-left sm:p-5"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-80" />

      <div className="flex min-w-0 flex-col items-center gap-3 sm:flex-row sm:gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-[0_8px_18px_rgba(15,39,71,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform duration-300 group-hover:scale-105 ${topic.iconClassName}`}
        >
          <Icon className="h-5 w-5 shrink-0" />
        </div>

        <span className="min-w-0 text-[1.02rem] font-[800] leading-snug tracking-[-0.02em] text-[var(--navy)] transition-colors duration-200 group-hover:text-[var(--primary-dark)]">
          {topic.title}
        </span>
      </div>

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7f0] text-[var(--primary)] shadow-[0_6px_18px_rgba(249,115,22,0.12)] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[var(--primary)] group-hover:text-white">
        <ArrowRight className="h-4 w-4" />
      </span>
    </InternalLink>
  );
}
