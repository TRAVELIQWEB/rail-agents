import Image from "next/image";
import { InternalLink } from "@/components/ui/InternalLink";
import { ArrowRight } from "lucide-react";

export function FinalAskCta() {
  return (
    <section className="site-container pb-10 pt-2 sm:pb-12 lg:pb-14 wide:pb-16">
      <div className="relative isolate grid grid-cols-1 justify-items-center gap-3 overflow-hidden rounded-[32px] border border-[#f2d9bf] bg-[linear-gradient(135deg,#fff8f1_0%,#fffdf9_40%,#fff1e3_100%)] px-4 py-5 text-center shadow-[0_18px_48px_rgba(249,115,22,0.08)] sm:grid-cols-[74px_minmax(0,1fr)_auto] sm:items-center sm:justify-items-stretch sm:gap-6 sm:px-8 sm:py-5 sm:text-left lg:gap-8 wide:gap-10 wide:px-10 wide:py-6">
        <div aria-hidden="true" className="absolute -right-8 -top-12 -z-10 h-52 w-52 rounded-full bg-white/70 blur-3xl" />
        <div aria-hidden="true" className="absolute -left-10 bottom-0 -z-10 h-44 w-44 rounded-full bg-[#fed7aa]/40 blur-3xl" />

        <div className="relative h-[78px] w-[48px] shrink-0 sm:h-[100px] sm:w-[74px]">
          <Image
            src="/images/nihal-singh-cutout.png"
            alt=""
            fill
            sizes="74px"
            className="object-contain object-bottom"
          />
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#c2410c]">Ask Nihal Singh</p>
          <h2 className="mt-1 text-[clamp(1.25rem,2.2vw,1.65rem)] font-[800] leading-tight tracking-[-0.03em] text-[var(--navy)] lg:whitespace-nowrap">
            Still have questions about your train, flight, or bus journey?
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--body-text)]">
            Connect with Nihal Singh for practical guidance on ticketing rules, routes, and smooth passenger bookings.
          </p>
        </div>

        <InternalLink
          href="/ask-nihal"
          prefetch={false}
          className="single-line-btn group inline-flex h-11 sm:h-12 w-fit max-w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 sm:px-6 py-2.5 text-sm sm:text-[0.9375rem] font-[800] text-white shadow-[0_6px_18px_rgba(249,115,22,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] shrink-0 self-center"
        >
          Ask Nihal Singh
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </InternalLink>
      </div>
    </section>
  );
}
