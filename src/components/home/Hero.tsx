import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CirclePlay,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Train,
  Users,
} from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";

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

export function Hero() {
  return (
    /*
     * Mobile  (<768):  single-column flow with a cropped portrait
     * Tablet  (768+):  text and card above a cropped portrait
     * Desktop (1280+): 3 cols (text | Nihal | card)
     */
    <section className="relative flex flex-col overflow-hidden bg-[#faf8f5] min-h-[460px] md:h-auto md:min-h-0 xl:h-[calc(100svh-72px)] xl:min-h-[560px] xl:max-h-[660px] 2xl:max-h-[680px] wide:max-h-[700px]">

      {/* Railway background */}
      <div aria-hidden="true" className="hero-railway-backdrop absolute inset-0" />

      {/* Gradient overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, #faf8f4 0%, #faf8f4 26%, rgba(250,248,244,0.92) 40%, rgba(250,248,244,0.55) 56%, rgba(250,248,244,0.1) 70%, transparent 80%)",
        }}
      />

      {/* ── MAIN CONTAINER ── */}
      <div className="site-container relative z-10 flex flex-1 flex-col justify-center py-4 sm:py-5 lg:py-5 wide:py-6">

        {/*
         * Grid:
         *  mobile  (<768px):  1 col, items stack
         *  tablet  (768px+):  2 cols [text | card], portrait follows
         *  desktop (1280px+): 3 cols via xl:grid-cols-12 with col-spans
         */}
        <div className="grid grid-cols-1 items-center gap-0 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:grid-cols-12 xl:items-center">

          {/* ══ COL 1: LEFT TEXT ══ */}
          <div className="flex min-w-0 flex-col items-center justify-center py-4 pr-0 text-center sm:py-5 md:items-start md:py-4 md:pr-5 md:text-left xl:col-span-5 xl:py-4 xl:pr-6 2xl:pr-8 wide:pr-10">

            {/* Badge */}
            <span className="mb-4 inline-flex w-fit max-w-full items-center gap-2.5 rounded-full border border-[#f0deca] bg-[#fff8f2] py-[7px] pl-[7px] pr-4 text-[0.75rem] font-[700] text-[var(--navy)] shadow-[0_2px_10px_rgba(249,115,22,0.10)] sm:text-[0.8125rem] lg:text-[0.875rem]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] text-white shadow-[0_2px_6px_rgba(249,115,22,0.35)]">
                <Train className="h-3.5 w-3.5" />
              </span>
              Travel Information & Guidance
            </span>

            {/* H1 */}
            <h1 className="max-w-[500px] text-[clamp(2rem,7vw,2.5rem)] font-[800] leading-[1.06] tracking-[-0.045em] text-[var(--navy)] md:max-w-full md:text-[clamp(2rem,4vw,2.8rem)] xl:max-w-[720px] xl:text-[clamp(3.1rem,3.4vw,4rem)] wide:max-w-[820px] wide:text-[3.25rem]">
              Everything a
              <span className="block text-[var(--primary)]">
                Travel Agent Needs
              </span>
              to Know.
            </h1>

            {/* Description */}
            <p className="mt-3.5 max-w-[420px] text-[0.875rem] leading-[1.68] text-[#5c6b80] md:max-w-full lg:text-base xl:max-w-[520px] xl:text-[1.025rem] wide:max-w-[700px] wide:text-lg">
              Get clear answers, step-by-step guides and video tutorials for IRCTC
              agent registration, ticket booking, Tatkal, cancellation, refunds,
              TDR and more.
            </p>

            {/* CTA Buttons */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 wide:mt-7 md:justify-start">
              <InternalLink
                href="/ask-nihal"
                prefetch={false}
                className="group inline-flex min-h-[46px] items-center gap-2.5 rounded-full bg-[var(--primary)] px-5 py-2.5 text-[0.9rem] font-[600] text-white shadow-[0_4px_18px_rgba(249,115,22,0.36)] transition-all duration-200 hover:bg-[var(--primary-hover)] hover:shadow-[0_6px_24px_rgba(249,115,22,0.46)] hover:-translate-y-px active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] lg:text-[0.95rem] xl:text-base wide:min-h-[54px] wide:px-7"
              >
                <MessageCircle className="h-[17px] w-[17px]" />
                Ask Nihal Singh
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </InternalLink>

              <InternalLink
                href="/videos"
                prefetch={false}
                className="inline-flex min-h-[46px] items-center gap-2.5 rounded-full border-2 border-[var(--primary)] bg-white px-5 py-2.5 text-[0.9rem] font-[600] text-[var(--primary)] transition-all duration-200 hover:bg-[#fff7f0] hover:-translate-y-px active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] lg:text-[0.95rem] xl:text-base wide:min-h-[54px] wide:px-7"
              >
                <CirclePlay className="h-[17px] w-[17px]" />
                Watch Video Guides
              </InternalLink>
            </div>

            {/* Trust items */}
            <div className="mt-5 grid w-full max-w-[420px] grid-cols-3 gap-2 sm:gap-2.5 md:max-w-full lg:max-w-[450px] xl:max-w-[560px] wide:mt-7 wide:max-w-[720px] wide:gap-4">
              {trustItems.map(({ icon: Icon, lines }) => (
                <div
                  key={lines[0]}
                  className="flex flex-col items-center justify-center rounded-xl border border-[#f0e4d8] bg-white/95 px-2 py-2.5 text-center shadow-[0_2px_8px_rgba(249,115,22,0.06)] transition-all hover:border-[var(--primary-border)] hover:shadow-md wide:px-4 wide:py-4"
                >
                  <span className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff3e8] text-[var(--primary)] wide:h-10 wide:w-10">
                    <Icon className="h-4 w-4 wide:h-5 wide:w-5" />
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
          <div className="relative order-2 mx-auto mt-3 h-[290px] w-full max-w-[310px] overflow-hidden md:col-span-2 md:row-start-2 md:mt-0 md:h-[370px] md:max-w-[440px] xl:order-none xl:col-start-6 xl:col-span-3 xl:row-auto xl:mt-0 xl:h-auto xl:max-w-none xl:self-stretch xl:flex xl:items-end xl:justify-center">
            {/* Outer warm ambient glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[5%] top-[8%] bottom-[5%] rounded-full bg-gradient-to-t from-[#fed7aa]/50 via-[#fde68a]/40 to-transparent blur-2xl"
            />

            {/* Elegant Arch Backdrop */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[10%] top-[10%] bottom-[0] rounded-t-[120px] sm:rounded-t-[140px] border border-white/80 bg-gradient-to-b from-[#fff3e8] via-[#ffebd6] to-[#ffe5cc] shadow-[0_16px_40px_rgba(249,115,22,0.12),inset_0_2px_10px_rgba(255,255,255,0.8)]"
            />

            {/* Subtle halo ring behind turban */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-[12%] h-44 w-44 rounded-full border border-dashed border-[#f97316]/25 animate-[spin_40s_linear_infinite] motion-reduce:animate-none sm:h-52 sm:w-52"
            />

            {/* Sparkle accents floating top-right & top-left */}
            <div className="pointer-events-none absolute top-[11%] right-[14%] z-20 text-[#f97316]">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 drop-shadow-sm" />
            </div>
            <div className="pointer-events-none absolute top-[16%] left-[15%] z-20 text-amber-500/80">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>

            {/* Nihal image — crisp, clear, natural colors with soft shadow */}
            <div className="absolute inset-x-0 top-0 bottom-[-105px] z-10 md:bottom-[-125px] xl:bottom-[-20%]">
              <Image
                src="/images/nihal-singh-cutout.png"
                alt="Nihal Singh"
                fill
                priority
                sizes="(min-width: 1920px) 400px, (min-width: 1536px) 360px, (min-width: 1280px) 320px, 280px"
                className="object-contain object-bottom drop-shadow-[0_10px_25px_rgba(15,39,71,0.12)]"
              />
            </div>

            {/* Bottom fade */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 xl:h-28 wide:h-32"
              style={{
                background:
                  "linear-gradient(to top, #faf8f5 0%, rgba(250,248,244,0.96) 22%, rgba(250,248,244,0.68) 55%, rgba(250,248,244,0.2) 82%, transparent 100%)",
              }}
            />
          </div>

          {/* ══ COL 3: ASK NIHAL CARD ══ */}
          <div className="order-3 min-w-0 pb-8 sm:pb-10 md:order-none md:col-start-2 md:row-start-1 md:col-span-1 md:pb-6 xl:col-start-9 xl:col-span-4 xl:row-auto xl:flex xl:items-center xl:justify-end xl:pb-0 xl:pl-4 2xl:pl-6">
            <div className="mx-auto w-full min-w-0 max-w-sm rounded-2xl bg-white p-4 shadow-[0_8px_32px_rgba(15,39,71,0.09),0_2px_8px_rgba(15,39,71,0.04)] min-[380px]:p-5 sm:p-5 md:max-w-[340px] xl:max-w-none wide:rounded-3xl wide:p-8">

              {/* Card header */}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[1.375rem] font-[800] leading-[1.18] tracking-[-0.03em] text-[var(--navy)] sm:text-[1.25rem] wide:text-[1.75rem]">
                    Namaste!{" "}
                    <span className="text-[1.1rem]">👋</span>
                    <span className="mt-0.5 block">I&apos;m Nihal Singh</span>
                  </p>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[#5c6b80] sm:text-[0.7813rem] lg:text-[0.8125rem] xl:text-[0.875rem] wide:text-base">
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
                    className={`group flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-[0.875rem] font-[500] leading-snug transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] sm:min-h-0 sm:py-2 sm:text-[0.7813rem] lg:text-[0.8125rem] xl:text-[0.875rem] wide:min-h-12 wide:px-4 wide:text-base ${
                      i === 1
                        ? "bg-[#fff3e8] text-[#7c3a0a] hover:bg-[#ffe8d0]"
                        : "bg-[#f4f5f7] text-[var(--navy)] hover:bg-[#fff3e8]"
                    }`}
                  >
                    <span className="min-w-0 flex-1 break-words">{question}</span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5 sm:h-6 sm:w-6 ${
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
      </div>
    </section>
  );
}
