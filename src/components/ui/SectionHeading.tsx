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
      <h2 className="min-w-0 text-center text-[clamp(1.65rem,6vw,2.5rem)] font-extrabold leading-[1.15] tracking-[-0.045em] text-[var(--navy)] min-[520px]:text-left wide:text-[3.25rem]">
        {title}
      </h2>
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
