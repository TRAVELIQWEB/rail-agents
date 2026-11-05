import Image from "next/image";
import {
  BookOpen,
  CirclePlay,
  MessageCircle,
  ShieldCheck,
  Train,
  Users,
} from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";

const trustItems = [
  { icon: BookOpen, lines: ["Simple", "Explanations"] },
  { icon: ShieldCheck, lines: ["Practical", "Information"] },
  { icon: Users, lines: ["For Railway Agents", "& Regular Users"] },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fffdfb] border-b border-[#ebd9c7]/70">
      {/* Full-Width Unified Railway Background (No split seam) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Image
          src="/images/hero-railway-bg.webp"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-right"
        />
      </div>

      {/* Smooth Full-Width Gradient Overlay Merging Left & Right Seamlessly */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,253,251,0.99) 0%, rgba(255,252,248,0.97) 40%, rgba(255,249,243,0.84) 56%, rgba(255,247,237,0.42) 76%, rgba(255,247,237,0.15) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#fffdfb] via-[#fffdfb]/70 to-transparent"
      />

      {/* Main Container */}
      <div className="site-container relative z-10 pt-8 pb-0 sm:pt-10 lg:pt-12">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          
          {/* ══ LEFT COLUMN: Heading, Description, CTA Buttons & Feature Cards ══ */}
          <div className="flex flex-col items-center pb-8 text-center sm:pb-10 lg:col-span-7 lg:items-start lg:pb-12 lg:text-left">
            {/* Badge */}
            <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-1.5 text-xs sm:text-[13px] font-bold text-[var(--navy)] shadow-[0_2px_8px_rgba(249,115,22,0.08)]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] text-white shadow-xs">
                <Train className="h-3 w-3" />
              </span>
              <span>Travel Information &amp; Guidance</span>
            </div>

            {/* Heading (H1) — Same size class as About & all page heroes */}
            <h1 className="page-hero-title">
              Everything a <span className="hero-accent">Travel</span>
              <br className="hidden sm:inline" />{" "}
              <span className="hero-accent">Agent</span> Needs to Know.
            </h1>

            {/* Subtitle / Description — Same size class as About & all page heroes */}
            <p className="page-hero-description mt-3.5 max-w-xl">
              Get clear answers, step-by-step guides and video tutorials for IRCTC
              agent registration, ticket booking, Tatkal, cancellation, refunds,
              TDR and more.
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 lg:justify-start">
              <InternalLink
                href="/ask-nihal"
                prefetch={false}
                className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.4)] active:translate-y-0"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Ask Nihal Singh</span>
              </InternalLink>

              <InternalLink
                href="/videos"
                prefetch={false}
                className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full border-2 border-[var(--primary)] bg-white px-6 py-3 text-sm font-bold text-[var(--primary)] shadow-[0_4px_14px_rgba(249,115,22,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#fff7ed] hover:shadow-[0_8px_20px_rgba(249,115,22,0.16)] active:translate-y-0"
              >
                <CirclePlay className="h-4 w-4 text-[var(--primary)]" />
                <span>Watch Video Guides</span>
              </InternalLink>
            </div>

            {/* 3 Feature Cards (Horizontal on tablet/desktop) */}
            <div className="mt-7 sm:mt-8 grid w-full max-w-xl grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
              {trustItems.map(({ icon: Icon, lines }) => (
                <div
                  key={lines[0]}
                  className="flex flex-col items-center justify-center rounded-2xl border border-[#f0e4d8] bg-white/95 px-3 py-3.5 text-center shadow-[0_4px_14px_rgba(15,39,71,0.04)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary-border)] hover:shadow-md"
                >
                  <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff3e8] text-[var(--primary)] shadow-2xs">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs sm:text-[13px] font-bold leading-snug text-[var(--navy)]">
                    {lines[0]}
                    <br />
                    {lines[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ RIGHT COLUMN: Nihal Singh Cutout Portrait with Circular Halo ══ */}
          <div className="relative flex items-end justify-center self-end lg:col-span-5 min-h-[340px] sm:min-h-[420px] lg:min-h-[470px]">
            {/* Circular Orange Halo Ring */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[42%] h-[290px] w-[290px] sm:h-[360px] sm:w-[360px] lg:h-[400px] lg:w-[400px] rounded-full border-[2.5px] border-[#f97316] bg-gradient-to-br from-[#fff7ed]/85 via-[#fed7aa]/35 to-transparent shadow-[0_10px_35px_rgba(249,115,22,0.14)]"
            />

            {/* Sparkle Star Accents */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-[12%] left-[8%] sm:left-[10%] z-20 text-[#f97316]"
            >
              <svg className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-[10%] right-[12%] sm:right-[14%] z-20 text-[#f97316]/90"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>

            {/* Nihal Singh Transparent PNG Cutout Portrait */}
            <div className="relative z-10 w-full max-w-[310px] sm:max-w-[370px] lg:max-w-[410px] h-[340px] sm:h-[420px] lg:h-[465px]">
              <Image
                src="/images/nihal-singh.png"
                alt="Nihal Singh - Digital Face of RailAgents"
                fill
                priority
                unoptimized
                sizes="(min-width: 1024px) 410px, (min-width: 640px) 370px, 310px"
                className="object-contain object-bottom drop-shadow-[0_12px_28px_rgba(15,39,71,0.16)]"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom-Right Curved Orange Ribbon Accent (Matches Reference Design) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 500 120"
        fill="none"
        className="pointer-events-none absolute bottom-0 right-0 z-20 h-16 w-64 sm:h-24 sm:w-96 lg:h-28 lg:w-[460px]"
        preserveAspectRatio="none"
      >
        <path
          d="M0 120 C 180 115, 340 65, 500 0 L 500 120 Z"
          fill="url(#heroOrangeSwoop)"
        />
        <path
          d="M30 120 C 200 108, 350 55, 500 -6"
          stroke="#f97316"
          strokeWidth="3.5"
          opacity="0.85"
        />
        <defs>
          <linearGradient id="heroOrangeSwoop" x1="0" y1="120" x2="500" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
      </svg>
    </section>
  );
}
