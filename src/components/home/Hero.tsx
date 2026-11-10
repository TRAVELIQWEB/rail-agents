import Image from "next/image";
import {
  BookOpen,
  Calculator,
  CalendarDays,
  ChevronRight,
  CirclePlay,
  MessageCircle,
  Radio,
  ShieldCheck,
  TicketCheck,
  Train,
  TrainFront,
  Users,
} from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";
import { railTools, type RailTool, type RailToolId } from "@/config/tools";

const toolIcons: Record<RailTool["icon"], typeof TrainFront> = {
  calculator: Calculator,
  calendar: CalendarDays,
  radio: Radio,
  ticket: TicketCheck,
  train: TrainFront,
};

const heroToolCardColors: Record<
  RailToolId,
  {
    card: string;
    iconBox: string;
    chevron: string;
    focus: string;
  }
> = {
  "live-train": {
    card: "border-[#BFDBFE]/90 bg-[#EFF6FF]/45 hover:border-[#2563EB] hover:bg-[#EFF6FF]",
    iconBox: "bg-[#EFF6FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white",
    chevron: "text-[#2563EB]",
    focus: "focus-visible:outline-[#2563EB]",
  },
  pnr: {
    card: "border-[#BBF7D0]/90 bg-[#ECFDF5]/45 hover:border-[#15803D] hover:bg-[#ECFDF5]",
    iconBox: "bg-[#ECFDF5] text-[#15803D] group-hover:bg-[#15803D] group-hover:text-white",
    chevron: "text-[#15803D]",
    focus: "focus-visible:outline-[#15803D]",
  },
  fare: {
    card: "border-[#DDD6FE]/90 bg-[#F5F3FF]/45 hover:border-[#7C3AED] hover:bg-[#F5F3FF]",
    iconBox: "bg-[#F5F3FF] text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white",
    chevron: "text-[#7C3AED]",
    focus: "focus-visible:outline-[#7C3AED]",
  },
  refund: {
    card: "border-[#FECDD3]/90 bg-[#FFF1F2]/45 hover:border-[#BE123C] hover:bg-[#FFF1F2]",
    iconBox: "bg-[#FFF1F2] text-[#BE123C] group-hover:bg-[#BE123C] group-hover:text-white",
    chevron: "text-[#BE123C]",
    focus: "focus-visible:outline-[#BE123C]",
  },
  "ticket-date": {
    card: "border-[#FED7AA]/90 bg-[#FFF7ED]/55 hover:border-[#C2410C] hover:bg-[#FFF7ED]",
    iconBox: "bg-[#FFF7ED] text-[#C2410C] group-hover:bg-[#C2410C] group-hover:text-white",
    chevron: "text-[#C2410C]",
    focus: "focus-visible:outline-[#C2410C]",
  },
  chart: {
    card: "border-[#99F6E4]/90 bg-[#F0FDFA]/50 hover:border-[#0D9488] hover:bg-[#F0FDFA]",
    iconBox: "bg-[#F0FDFA] text-[#0D9488] group-hover:bg-[#0D9488] group-hover:text-white",
    chevron: "text-[#0D9488]",
    focus: "focus-visible:outline-[#0D9488]",
  },
};

const trustItems = [
  {
    icon: BookOpen,
    label: "Simple Explanations",
    iconClass: "bg-[#EFF6FF] text-[#2563EB]",
  },
  {
    icon: ShieldCheck,
    label: "Practical Information",
    iconClass: "bg-[#ECFDF5] text-[#15803D]",
  },
  {
    icon: Users,
    label: "For Railway Agents & Regular Users",
    iconClass: "bg-[#F0FDFA] text-[#0D9488]",
  },
];

export function Hero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative overflow-hidden border-b border-[#ebd9c7]/60 bg-gradient-to-b from-[#fff9f2] via-[#fffcf9] to-[#fffdfb]"
    >
      {/* Shared Unified Ambient Warm Glow Across Entire Hero + Tools + Feature Cards */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 65% at 50% 58%, rgba(255,244,230,0.65) 0%, rgba(255,252,249,0.3) 55%, rgba(255,253,251,0) 100%)",
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          UPPER VISUAL AREA: TWO-COLUMN HERO (54% LEFT CONTENT / 46% RIGHT IMAGE)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden">
        {/* Full-Width Unified Railway Station & Train Background (confined to upper hero) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Image
            src="/images/hero-station-bg.jpg"
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-[62%_42%] sm:object-[58%_42%] lg:object-[center_42%]"
          />
        </div>

        {/* Seamless Left Readability Mist (keeps center heritage station & right train vivid) */}
        <div
          aria-hidden="true"
          className="hero-copy-readability pointer-events-none absolute inset-0"
        />

        {/* Smooth Bottom Fade Overlay into Unified Shared Background (eliminates horizontal cutoff) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-28 lg:h-32"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,252,249,0) 0%, rgba(255,251,246,0.48) 45%, rgba(255,251,247,0.88) 78%, #fffcf9 100%)",
          }}
        />

        {/* Bottom-Center to Right Curved Orange & Deep Navy Ribbon Accent */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 150"
          fill="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 w-full sm:h-16 lg:h-24 xl:h-28"
          preserveAspectRatio="none"
        >
          {/* Left-of-portrait subtle orange crest */}
          <path
            d="M 680 150 C 745 122, 835 120, 935 142 L 935 150 Z"
            fill="url(#heroOrangeSwoopLeft)"
          />
          {/* Right sweeping warm highlight edge */}
          <path
            d="M 980 150 C 1135 136, 1295 82, 1440 8 L 1440 150 Z"
            fill="#fffcf9"
            opacity="0.95"
          />
          {/* Right sweeping orange ribbon */}
          <path
            d="M 992 150 C 1145 138, 1300 86, 1440 16 L 1440 82 C 1310 122, 1175 143, 1055 150 Z"
            fill="url(#heroOrangeSwoopRight)"
          />
          {/* Bottom-right deep railway navy wedge */}
          <path
            d="M 1050 150 C 1180 143, 1312 120, 1440 78 L 1440 150 Z"
            fill="#062345"
          />
          <defs>
            <linearGradient
              id="heroOrangeSwoopLeft"
              x1="680"
              y1="135"
              x2="935"
              y2="145"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
            <linearGradient
              id="heroOrangeSwoopRight"
              x1="992"
              y1="150"
              x2="1440"
              y2="16"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#c2410c" />
              <stop offset="45%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>

        <div className="site-container relative z-20">
          <div className="grid grid-cols-1 items-center gap-5 pt-5 sm:pt-6 lg:min-h-[412px] lg:grid-cols-[minmax(0,54%)_minmax(0,46%)] lg:gap-6 lg:pt-0 xl:min-h-[432px] xl:gap-8 2xl:min-h-[448px]">
            {/* Left Column (50–55% width): Badge, Heading, Description, CTA Buttons */}
            <div className="flex min-w-0 flex-col items-center self-center text-center lg:items-start lg:py-4 lg:text-left">
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-1.5 text-xs font-bold text-[var(--navy)] shadow-[0_2px_8px_rgba(249,115,22,0.08)] sm:text-[13px]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] text-white">
                  <Train aria-hidden="true" className="h-3 w-3" />
                </span>
                <span>Travel Information &amp; Guidance</span>
              </div>

              <h1 id="home-hero-heading" className="page-hero-title">
                Everything a <span className="hero-accent">Travel</span>
                <br className="hidden sm:inline" />{" "}
                <span className="hero-accent">Agent</span> Needs to Know.
              </h1>

              <p className="page-hero-description mt-3 max-w-xl">
                Get clear answers, step-by-step guides and video tutorials for IRCTC
                agent registration, ticket booking, Tatkal, cancellation, refunds,
                TDR and more.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 lg:justify-start">
                <InternalLink
                  href="/ask-nihal"
                  prefetch={false}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(249,115,22,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.36)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-6"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                  <span>Ask Nihal Singh</span>
                </InternalLink>

                <InternalLink
                  href="/videos"
                  prefetch={false}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-full border-2 border-[#102B4E]/85 bg-white px-5 py-2.5 text-sm font-bold text-[#102B4E] shadow-[0_3px_12px_rgba(16,43,78,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:shadow-[0_6px_16px_rgba(37,99,235,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-6"
                >
                  <CirclePlay
                    aria-hidden="true"
                    className="h-4 w-4 text-[#2563EB]"
                  />
                  <span>Watch Video Guides</span>
                </InternalLink>
              </div>
            </div>

            {/* Right Column (45–50% width): Existing Nihal Singh Hero Image */}
            <div className="relative flex min-h-[275px] min-w-0 items-end justify-center self-end overflow-hidden pt-2 sm:min-h-[330px] md:min-h-[355px] lg:min-h-[412px] lg:justify-start lg:pl-2 lg:pt-3 xl:min-h-[432px] xl:pl-6 2xl:min-h-[448px]">
              {/* Nihal Singh Cutout — Shifted ~25–30px downward for ~30–35px top breathing room */}
              <div className="relative z-20 h-[275px] w-full max-w-[265px] translate-x-[clamp(-48px,-8vw,-26px)] translate-y-[18px] sm:h-[330px] sm:max-w-[320px] sm:translate-y-[22px] md:h-[355px] md:max-w-[345px] lg:h-[400px] lg:max-w-[390px] lg:translate-x-0 lg:translate-y-[28px] xl:h-[420px] xl:max-w-[410px] 2xl:h-[435px] 2xl:max-w-[425px]">
                <Image
                  src="/images/nihal-singh.png"
                  alt="Nihal Singh - Digital Face of RailAgents"
                  fill
                  priority
                  unoptimized
                  sizes="(min-width: 1536px) 425px, (min-width: 1280px) 410px, (min-width: 1024px) 390px, (min-width: 768px) 345px, (min-width: 640px) 320px, 265px"
                  className="object-contain object-bottom drop-shadow-[0_10px_24px_rgba(15,39,71,0.18)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          UNIFIED LOWER HERO AREA: POPULAR RAILWAY TOOLS + THREE FEATURE CARDS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="site-container relative z-20 pt-5 pb-5 sm:pt-6 sm:pb-6">
        <div className="space-y-3.5 sm:space-y-4">
          {/* 1. Full-Width Popular Railway Tools Section (~104–112px height on desktop) */}
          <div
            aria-label="Popular Railway Tools"
            className="flex items-center rounded-2xl border border-[#f0e4d8] bg-white px-3 py-4 shadow-[0_4px_18px_rgba(15,39,71,0.05)] sm:px-4 sm:py-[18px] xl:min-h-[108px]"
          >
            <div className="flex w-full flex-col gap-3.5 xl:flex-row xl:items-center xl:gap-4">
              {/* Section Label */}
              <div className="flex shrink-0 items-center justify-between gap-2.5 border-b border-[#f0e4d8] pb-3 xl:self-stretch xl:border-r xl:border-b-0 xl:pr-4 xl:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff3e8] text-[var(--primary)]">
                    <TrainFront aria-hidden="true" className="h-4.5 w-4.5" />
                  </span>
                  <h2 className="text-sm font-extrabold tracking-tight text-[var(--navy)] sm:text-[15px]">
                    Popular Railway Tools
                  </h2>
                </div>
                <InternalLink
                  href="/tools"
                  prefetch={false}
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold text-[var(--primary)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] xl:hidden"
                >
                  <span>All tools</span>
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                </InternalLink>
              </div>

              {/* 6 Railway Tool Shortcut Cards (~68–72px height) */}
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6 sm:gap-2.5">
                {railTools.map((tool) => {
                  const Icon = toolIcons[tool.icon];
                  const colorStyle = heroToolCardColors[tool.id];
                  return (
                    <InternalLink
                      key={tool.href}
                      href={tool.href}
                      prefetch={false}
                      aria-label={`${tool.title} – ${tool.description}`}
                      className={`group flex min-h-[68px] sm:min-h-[70px] min-w-0 items-center justify-between gap-2 rounded-xl border px-2.5 py-2.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-3 ${colorStyle.card} ${colorStyle.focus}`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${colorStyle.iconBox}`}
                        >
                          <Icon aria-hidden="true" className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 text-xs font-bold leading-tight text-[var(--navy)] sm:text-[12.5px]">
                          {tool.shortTitle}
                        </span>
                      </div>
                      <ChevronRight
                        aria-hidden="true"
                        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none ${colorStyle.chevron}`}
                      />
                    </InternalLink>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Compact Full-Width Horizontal Benefits Strip (~72–80px height) */}
          <div
            aria-label="Key platform benefits"
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3"
          >
            {trustItems.map(({ icon: Icon, label, iconClass }) => (
              <div
                key={label}
                className="flex min-h-[72px] sm:min-h-[76px] min-w-0 items-center justify-center gap-3 rounded-xl border border-[#f0e4d8] bg-white px-3.5 py-3 shadow-[0_2px_8px_rgba(15,39,71,0.03)]"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
                >
                  <Icon aria-hidden="true" className="h-4.5 w-4.5" />
                </span>
                <span className="text-xs font-extrabold leading-snug text-[var(--navy)] sm:text-[13.5px]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
