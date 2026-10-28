import { ArrowRight } from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";

type SectionHeadingProps = {
  title: string;
  href?: string;
  linkText?: string;
  external?: boolean;
};

export function SectionHeading({
  title,
  href = "/",
  linkText,
  external = false,
}: SectionHeadingProps) {
  const className =
    "group inline-flex shrink-0 items-center gap-1.5 rounded-sm text-xs font-semibold text-[var(--primary-dark)] transition-colors duration-200 hover:text-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)] sm:text-sm";

  return (
    <div className="mb-6 flex flex-col items-center justify-between gap-3 text-center min-[520px]:flex-row min-[520px]:items-end min-[520px]:text-left sm:mb-8">
      <div className="min-w-0">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#f5dfcf] bg-[#fffaf6] px-3 py-1.5 text-[11px] font-[800] uppercase tracking-[0.14em] text-[#d46a0b] shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#f97316]" aria-hidden="true" />
          RailAgents
        </div>
        <h2 className="text-center text-[clamp(1.5rem,3.5vw,2.125rem)] font-[800] leading-[1.12] tracking-[-0.04em] text-[var(--navy)] min-[520px]:text-left wide:text-[2.25rem]">
          {title}
        </h2>
      </div>
      {linkText ? (
        external ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {linkText}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        ) : (
          <InternalLink href={href} prefetch={false} className={className}>
            {linkText}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </InternalLink>
        )
      ) : null}
    </div>
  );
}
