import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  TrainTrack,
} from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";
import { HeroPhoneShowcase } from "./HeroPhoneShowcase";

export function Hero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative overflow-hidden border-b border-[#E5EAF0] bg-[#FFF8F2]"
    >
      {/* Art direction selects one responsive background without preloading hidden images. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <picture>
          <source media="(max-width: 639px)" srcSet="/images/hero-bg-orange-train-mobile.webp" type="image/webp" />
          <Image src="/images/hero-bg-orange-train.webp" alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className="object-cover object-right lg:object-[95%_center] max-sm:object-center max-sm:opacity-45" />
        </picture>
        <div className="absolute inset-0 hidden bg-gradient-to-r from-white/95 via-white/65 to-white/15 sm:block lg:from-white/92 lg:via-white/55 lg:to-white/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/60 to-white/90 sm:hidden" />
      </div>

      <div className="site-container relative z-10 pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20 xl:pt-20 xl:pb-24 overflow-hidden lg:overflow-visible">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-14">
          {/* Left Column (Editorial Typography & Action) */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left min-w-0 max-w-full">
            {/* Authority Tag Pill with subtle ambient glow */}
            <div className="mb-4 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#F36B21]/30 bg-white/95 px-3 py-1 text-xs font-bold text-[#142B45] shadow-[0_2px_12px_rgba(243,107,33,0.12)] backdrop-blur-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F36B21] text-white shadow-xs">
                <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
              </span>
              <span className="truncate">
                <span className="hidden sm:inline">Authoritative Indian Railways Information &amp; Agent Desk</span>
                <span className="sm:hidden">Railway Information &amp; Agent Desk</span>
              </span>
            </div>

            {/* Primary H1 with Intentional Line Breaks */}
            <h1
              id="home-hero-heading"
              className="text-[clamp(1.75rem,7.5vw,2.25rem)] sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[50px] font-black tracking-tight text-[#142B45] leading-[1.15] max-w-2xl"
            >
              Reliable Railway Rules<br />
              <span className="text-[#F36B21]">IRCTC Tools</span> &amp; Agent<br />
              Guidance
            </h1>

            {/* Supporting description */}
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#475467] sm:text-lg font-medium">
              Reliable commercial guidance, source-referenced circulars, and instant calculation tools for
              IRCTC agents, travel desks, and everyday train passengers across India.
            </p>

            {/* Action CTA Buttons */}
            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 sm:gap-4 w-full sm:w-auto">
              <InternalLink
                href="/tools"
                prefetch={false}
                className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-[#F36B21] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_-4px_rgba(243,107,33,0.45),0_0_20px_rgba(243,107,33,0.2)] transition-all duration-150 hover:bg-[#F36B21] hover:shadow-[0_12px_32px_-4px_rgba(243,107,33,0.6),0_0_28px_rgba(243,107,33,0.35)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F36B21]"
              >
                <Calculator aria-hidden="true" className="h-4 w-4" />
                <span>Explore Railway Tools</span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                />
              </InternalLink>

              <InternalLink
                href="/ask-nihal"
                prefetch={false}
                className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl border-2 border-[#142B45] bg-white/95 px-6 py-3 text-sm font-bold text-[#142B45] shadow-xs backdrop-blur-xs transition-all duration-150 hover:bg-[#F4F5F7] hover:border-[#142B45] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#142B45]"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4 text-[#F36B21]" />
                <span>Ask Nihal Singh</span>
              </InternalLink>
            </div>

            {/* Railway Detail Pill Ticker */}
            <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-xs font-semibold text-[#667085]">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5EAF0] bg-white/95 px-2.5 py-1 text-[#142B45] shadow-2xs">
                <TrainTrack className="h-3.5 w-3.5 text-[#F36B21]" aria-hidden="true" />
                Popular Utilities:
              </span>
              <span className="rounded-md bg-[#EAF7F0] px-2 py-0.5 text-[11px] font-bold text-[#16A36A]">
                Live Train GPS
              </span>
              <span className="rounded-md bg-[#EAF3FA] px-2 py-0.5 text-[11px] font-bold text-[#142B45]">
                10-Digit PNR
              </span>
              <span className="rounded-md bg-[#FFF1E7] px-2 py-0.5 text-[11px] font-bold text-[#F36B21]">
                Agent Fare Calc
              </span>
              <span className="rounded-md bg-[#FFF7D9] px-2 py-0.5 text-[11px] font-bold text-[#B45309]">
                Refund Slabs
              </span>
            </div>

            {/* Accurate Trust Indicator Stats */}
            <div className="mt-8 border-t border-[#E5EAF0] pt-6 w-full lg:max-w-xl">
              {/* Mobile (< sm): Clean horizontal stack */}
              <div className="flex flex-col gap-2.5 sm:hidden">
                <div className="flex items-center gap-3 rounded-xl border border-[#E5EAF0] bg-white/95 px-3.5 py-2.5 shadow-2xs">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FA] text-[#142B45]">
                    <BookOpen aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#142B45] leading-tight">
                      Source-Referenced Guidance
                    </p>
                    <p className="text-[11px] font-medium text-[#667085]">
                      Commercial circulars &amp; rules
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#E5EAF0] bg-white/95 px-3.5 py-2.5 shadow-2xs">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E7] text-[#F36B21]">
                    <Calculator aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#F36B21] leading-tight">
                      6 Railway Tools
                    </p>
                    <p className="text-[11px] font-medium text-[#667085]">
                      GPS, PNR, fare &amp; refund utilities
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#E5EAF0] bg-white/95 px-3.5 py-2.5 shadow-2xs">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF7F0] text-[#16A36A]">
                    <Sparkles aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#142B45] leading-tight">
                      Free Access
                    </p>
                    <p className="text-[11px] font-medium text-[#667085]">
                      Open for agents &amp; everyday passengers
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop / Tablet (sm+): Balanced 3-column cards */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-3 w-full [&>*]:min-w-0">
                <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5EAF0] bg-white/95 p-3 text-center shadow-2xs backdrop-blur-xs">
                  <span className="mb-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FA] text-[#142B45]">
                    <BookOpen aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-bold text-[#142B45] leading-tight whitespace-nowrap">
                    Source-Referenced
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#667085]">
                    Guidance
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5EAF0] bg-white/95 p-3 text-center shadow-2xs backdrop-blur-xs">
                  <span className="mb-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E7] text-[#F36B21]">
                    <Calculator aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-bold text-[#F36B21] leading-tight whitespace-nowrap">
                    6 Railway Tools
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#667085]">
                    Online Utilities
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5EAF0] bg-white/95 p-3 text-center shadow-2xs backdrop-blur-xs">
                  <span className="mb-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF7F0] text-[#16A36A]">
                    <Sparkles aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-bold text-[#142B45] leading-tight whitespace-nowrap">
                    Free Access
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#667085]">
                    Open to All
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Smartphone Showcase with Live Badges */}
          <HeroPhoneShowcase />
        </div>
      </div>
    </section>
  );
}
