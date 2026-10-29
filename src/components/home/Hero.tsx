import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  CirclePlay,
  Compass,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Train,
  Users,
} from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";
import { InteractiveButton } from "@/components/ui/InteractiveButton";

const questions = [
  "How does Tatkal booking work?",
  "Can an agent book Tatkal?",
  "How to cancel a ticket?",
  "What is TDR?",
  "What are IRCTC agent timings?",
];

const trustItems = [
  { icon: BookOpen, lines: ["Simple", "Explanations"] },
  { icon: ShieldCheck, lines: ["Practical", "Information"] },
  { icon: Users, lines: ["For Railway Agents", "& Regular Users"] },
];

const quickHighlights = [
  {
    icon: ShieldCheck,
    title: "Authorized IRCTC Rules",
    subtitle: "Section 143 & PSP guidelines",
    href: "/irctc-agent-registration",
  },
  {
    icon: Calculator,
    title: "Agent Fare Calculator",
    subtitle: "Instant PG & service fee slip",
    href: "/train-ticket-agent-fare-calculator",
  },
  {
    icon: Compass,
    title: "Step-by-Step Guides",
    subtitle: "Tatkal, OTP refunds & TDR",
    href: "/guides",
  },
  {
    icon: CirclePlay,
    title: "Video Walkthroughs",
    subtitle: "Practical हिंदी / English tutorials",
    href: "/videos",
  },
];

export function Hero() {
  return (
    /*
     * Mobile  (<768):  single-column flow with a cropped portrait
     * Tablet  (768+):  text and card above a cropped portrait
     * Desktop (1024+): Full viewport height with top 3-col hero + bottom quick-access bar (zero empty vertical space)
     */
    <section className="relative flex flex-col justify-between overflow-hidden bg-[#faf8f5] min-h-[480px] md:h-auto md:min-h-0 lg:min-h-[calc(100vh-74px)] border-b border-[#efe2d3]">

      {/* Railway background */}
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src="/images/hero-railway-bg.webp"
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          unoptimized
          className="object-cover object-right"
        />
      </div>

      {/* Gradient overlay */}
      <div aria-hidden="true" className="hero-railway-backdrop pointer-events-none absolute inset-0" />

      {/* ── MAIN CONTAINER ── */}
      <div className="site-container relative z-10 flex flex-1 flex-col justify-between pt-8 pb-6 sm:pt-10 sm:pb-7 lg:pt-11 lg:pb-7">

        {/* Top / Center Main 3-Column Hero Grid */}
        <div className="grid grid-cols-1 items-start gap-0 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:grid-cols-12">

          {/* ══ COL 1: LEFT TEXT ══ */}
          <div className="flex min-w-0 flex-col items-center py-0 pr-0 text-center md:items-start md:pr-5 md:text-left xl:col-span-5 2xl:col-span-5 wide:col-span-5 xl:pr-6 2xl:pr-8 wide:pr-10">

            {/* Badge */}
            <span className="mb-3.5 inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-[#f0deca] bg-[#fff8f2] py-1.5 pl-1.5 pr-3.5 text-xs font-[700] text-[var(--navy)] shadow-[0_2px_10px_rgba(249,115,22,0.10)] sm:text-[0.8125rem]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] text-white shadow-[0_2px_6px_rgba(249,115,22,0.35)]">
                <Train className="h-3 w-3" />
              </span>
              Travel Information &amp; Guidance
            </span>

            {/* H1 */}
            <h1 className="page-hero-title home-hero-title w-full max-w-[620px] md:max-w-full xl:max-w-[780px] wide:max-w-[860px]">
              <span className="block">
                Everything a <span className="hero-accent">Travel</span>
              </span>{" "}
              <span className="block">
                <span className="hero-accent">Agent</span> Needs to Know.
              </span>
            </h1>

            {/* Description */}
            <p className="page-hero-description mt-3 max-w-[420px] md:max-w-full xl:max-w-[520px] wide:max-w-[700px]">
              Get clear answers, step-by-step guides and video tutorials for IRCTC
              agent registration, ticket booking, Tatkal, cancellation, refunds,
              TDR and more.
            </p>

            {/* CTA Buttons */}
            <div className="mt-5 flex max-w-full flex-col items-stretch gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center md:justify-start wide:mt-6">
              <InteractiveButton
                as="link"
                href="/ask-nihal"
                label="Ask Nihal Singh"
                icon={<MessageCircle className="h-4 w-4" />}
                size="md"
                variant="orange"
              />

              <InternalLink
                href="/videos"
                prefetch={false}
                className="single-line-btn inline-flex min-h-[48px] items-center gap-2.5 rounded-full border border-[#fed7aa] bg-white px-5 py-2.5 text-sm font-[700] text-[var(--primary-dark)] shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-[#fffaf6] hover:shadow-[0_12px_22px_rgba(15,23,42,0.08)] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                <CirclePlay className="h-4 w-4" />
                Watch Video Guides
              </InternalLink>
            </div>

            {/* Trust items */}
            <div className="mt-5 grid w-full max-w-[420px] grid-cols-3 gap-2 sm:gap-2.5 md:max-w-full lg:max-w-[450px] xl:max-w-[560px] wide:mt-6 wide:max-w-[720px] wide:gap-4">
              {trustItems.map(({ icon: Icon, lines }) => (
                <div
                  key={lines[0]}
                  className="flex flex-col items-center justify-center rounded-xl border border-[#f0e4d8] bg-white/95 px-2 py-2.5 text-center shadow-[0_2px_8px_rgba(249,115,22,0.06)] transition-all hover:border-[var(--primary-border)] hover:shadow-md wide:px-4 wide:py-3.5"
                >
                  <span className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff3e8] text-[var(--primary)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[0.6875rem] font-[600] leading-[1.3] text-[var(--navy)] lg:text-xs xl:text-[0.8125rem] wide:text-sm">
                    {lines[0]}
                    <br />
                    {lines[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ COL 2: NIHAL SINGH — ATTRACTIVE LAYERED HERO BACKDROP ══ */}
          <div className="relative order-2 mx-auto mt-3 h-[290px] w-full max-w-[310px] overflow-hidden md:col-span-2 md:row-start-2 md:mt-0 md:h-[370px] md:max-w-[440px] xl:order-none xl:col-start-6 xl:col-span-3 xl:row-auto xl:mt-0 xl:h-[430px] xl:max-w-none xl:self-stretch xl:flex xl:items-end xl:justify-center">
            {/* Outer warm ambient glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[5%] top-[8%] bottom-[5%] rounded-full bg-gradient-to-t from-[#fed7aa]/50 via-[#fde68a]/40 to-transparent blur-2xl"
            />

            {/* Elegant Arch Backdrop */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[10%] top-[8%] bottom-[0] rounded-t-[120px] sm:rounded-t-[140px] border border-white/80 bg-gradient-to-b from-[#fff3e8] via-[#ffebd6] to-[#ffe5cc] shadow-[0_16px_40px_rgba(249,115,22,0.12),inset_0_2px_10px_rgba(255,255,255,0.8)]"
            />

            {/* Subtle halo ring behind turban */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-[10%] h-44 w-44 rounded-full border border-dashed border-[#f97316]/25 animate-[spin_40s_linear_infinite] motion-reduce:animate-none sm:h-52 sm:w-52"
            />

            {/* Sparkle accents floating top-right & top-left */}
            <div className="pointer-events-none absolute top-[9%] right-[14%] z-20 text-[#f97316]">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 drop-shadow-sm" />
            </div>
            <div className="pointer-events-none absolute top-[14%] left-[15%] z-20 text-amber-500/80">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>

            {/* Nihal image — crisp, clear, natural colors with soft shadow */}
            <div className="absolute inset-x-0 top-0 bottom-[-105px] z-10 md:bottom-[-125px] xl:bottom-[-18%]">
              <Image
                src="/images/nihal-singh-cutout.png"
                alt="Nihal Singh"
                fill
                loading="eager"
                sizes="(min-width: 1920px) 400px, (min-width: 1536px) 360px, (min-width: 1280px) 320px, 280px"
                className="object-contain object-bottom drop-shadow-[0_10px_25px_rgba(15,39,71,0.12)]"
              />
            </div>

            {/* Bottom fade */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 xl:h-24 wide:h-28"
              style={{
                background:
                  "linear-gradient(to top, #faf8f5 0%, rgba(250,248,244,0.96) 22%, rgba(250,248,244,0.68) 55%, rgba(250,248,244,0.2) 82%, transparent 100%)",
              }}
            />
          </div>

          {/* ══ COL 3: ASK NIHAL CARD ══ */}
          <div className="order-3 min-w-0 pb-4 sm:pb-6 md:order-none md:col-start-2 md:row-start-1 md:col-span-1 md:pb-4 xl:col-start-9 xl:col-span-4 xl:row-auto xl:flex xl:items-center xl:justify-end xl:pb-0 xl:pl-4 2xl:pl-6">
            <div className="mx-auto w-full min-w-0 max-w-sm rounded-2xl bg-white p-4 shadow-[0_8px_32px_rgba(15,39,71,0.09),0_2px_8px_rgba(15,39,71,0.04)] min-[380px]:p-5 sm:p-5 md:max-w-[340px] xl:max-w-none wide:rounded-3xl wide:p-7">

              {/* Card header */}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[1.375rem] font-[800] leading-[1.18] tracking-[-0.03em] text-[var(--navy)] sm:text-[1.25rem] wide:text-[1.65rem]">
                    Namaste!{" "}
                    <span className="text-[1.1rem]">👋</span>
                    <span className="mt-0.5 block">I&apos;m Nihal Singh</span>
                  </p>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-[#5c6b80] sm:text-[0.7813rem] lg:text-[0.8125rem] xl:text-[0.85rem] wide:text-base">
                    Ask Nihal Singh anything about railway ticket booking. Here
                    are some common questions:
                  </p>
                </div>
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fff3e8] text-[var(--primary)]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* Question rows */}
              <div className="space-y-2 wide:space-y-2.5">
                {questions.map((question, i) => (
                  <InternalLink
                    key={question}
                    href={`/ask-nihal?q=${encodeURIComponent(question)}`}
                    prefetch={false}
                    className={`group flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[0.875rem] font-[500] leading-snug transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] sm:min-h-0 sm:py-2 sm:text-[0.7813rem] lg:text-[0.8125rem] xl:text-[0.85rem] wide:min-h-11 wide:px-4 wide:text-base ${
                      i === 1
                        ? "bg-[#fff3e8] text-[#7c3a0a] hover:bg-[#ffe8d0]"
                        : "bg-[#f4f5f7] text-[var(--navy)] hover:bg-[#fff3e8]"
                    }`}
                  >
                    <span className="min-w-0 flex-1 break-words">{question}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5 sm:h-6 sm:w-6 ${
                        i === 1
                          ? "bg-[var(--primary)] text-white"
                          : "bg-white text-[var(--primary)] shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
                      }`}
                    >
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </InternalLink>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ══ BOTTOM DOCKED QUICK-ACCESS BAR (Fills bottom viewport cleanly with zero empty space) ══ */}
        <div className="my-auto pt-4 border-t border-[#ebd9c7]/80">
          <div className="mb-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span className="inline-flex items-center gap-1.5 text-[#c2410c]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
              Essential Railway Agent Toolkit &amp; Quick Access
            </span>
            <span className="hidden sm:inline text-slate-400">
              Verified IRCTC &amp; Indian Railways Operational Reference
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {quickHighlights.map(({ icon: Icon, title, subtitle, href }) => (
              <InternalLink
                key={title}
                href={href}
                prefetch={false}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[#eedcc9] bg-white/95 px-4 py-3.5 shadow-[0_6px_18px_rgba(15,39,71,0.05)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(249,115,22,0.12)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fff3e8] to-[#ffedd5] text-[var(--primary)] ring-1 ring-orange-200/60 transition-transform duration-200 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <span className="block truncate text-xs sm:text-[13.5px] font-[800] text-[var(--navy)] group-hover:text-[var(--primary-dark)] transition-colors">
                      {title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] font-medium text-slate-500">
                      {subtitle}
                    </span>
                  </div>
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[var(--primary)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:bg-[var(--primary)] group-hover:text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </InternalLink>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
