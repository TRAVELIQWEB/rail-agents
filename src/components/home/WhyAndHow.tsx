import Image from "next/image";
import { InternalLink } from "@/components/ui/InternalLink";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  CircleCheck,
  ListChecks,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const steps = [
  {
    title: "Ask Your Question",
    description: "Type your query or choose from common questions.",
    icon: Search,
    color: "bg-[#f97316]",
  },
  {
    title: "Get Step-by-Step Guide",
    description: "Read detailed instructions or watch video tutorials.",
    icon: ListChecks,
    color: "bg-[#4ba9f5]",
  },
  {
    title: "Take Action",
    description: "Follow the guide and complete your task with confidence.",
    icon: CircleCheck,
    color: "bg-[#0bb982]",
  },
];

export function WhyAndHow() {
  return (
    <>
      {/* =========================================================
          SECTION 1: WHY RAILAGENTS (ULTRA-WIDE ENHANCED FOR 2560px)
      ========================================================== */}
      <section className="relative overflow-hidden bg-[#fffdfa] py-8 sm:py-12 lg:py-14 2xl:py-16 wide:py-16">
        {/* Train graphic in bottom left */}
        <div className="pointer-events-none absolute -bottom-6 left-0 -z-0 h-60 w-1/2 max-w-lg opacity-25 sm:opacity-35 wide:h-80 wide:max-w-xl">
          <Image
            src="/images/hero-railway-bg.png"
            alt=""
            fill
            sizes="50vw"
            className="object-contain object-bottom-left"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fffdfa] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fffdfa]/60 to-[#fffdfa]" />
        </div>

        <div className="site-container relative z-10 grid grid-cols-1 items-center gap-10 lg:gap-12 xl:grid-cols-12 xl:gap-12 wide:gap-14">
          {/* LEFT CONTENT COLUMN */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left xl:col-span-5">
            {/* Top Tag */}
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#ea580c] wide:text-sm">
              <span className="h-2 w-2 rounded-full bg-[#f97316] wide:h-2.5 wide:w-2.5" />
              WHY RAILAGENTS
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-[3.1rem] font-extrabold leading-[1.12] tracking-tight text-[#0f2747] wide:text-[3.5rem] wide:leading-[1.1]">
              Your guide to{" "}
              <span className="relative inline-block text-[#f97316]">
                railway agent information
                {/* Decorative underline accent stroke */}
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-[#f97316]/30 wide:h-4"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M 2,8 Q 100,2 198,8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            {/* Subtitle Paragraph */}
            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base wide:max-w-xl wide:text-lg wide:leading-relaxed">
              Clear explanations and practical guides for common IRCTC agent
              questions, railway bookings, and travel topics.
            </p>

            {/* CTA Button */}
            <InternalLink
              href="/about"
              prefetch={false}
              className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ff5500] to-[#f97316] px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(249,115,22,0.32)] transition-all duration-200 hover:scale-105 hover:shadow-[0_12px_28px_rgba(249,115,22,0.42)] active:scale-100 sm:text-base wide:px-8 wide:py-4 wide:text-base"
            >
              Know More About Us
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 wide:h-5 wide:w-5" />
            </InternalLink>
          </div>

          {/* RIGHT CARDS COLUMN */}
          <div className="relative xl:col-span-7 wide:max-w-[1050px] wide:ml-auto">
            {/* Background Railway Track Line */}
            <svg
              className="pointer-events-none absolute inset-0 hidden h-full w-full stroke-[#fdba74]/35 sm:block"
              viewBox="0 0 600 480"
              fill="none"
            >
              <path
                d="M 100 160 C 220 70, 420 70, 480 190 C 520 270, 420 370, 240 370 C 140 370, 100 430, 220 460"
                strokeWidth="10"
                strokeDasharray="6 8"
                strokeLinecap="round"
              />
            </svg>

            {/* Decorative Sparkles & Floating Dots */}
            <div className="pointer-events-none absolute -top-5 right-12 text-[#f97316] wide:-top-8 wide:right-16">
              <svg className="h-6 w-6 wide:h-8 wide:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M18.36 5.64l-2.83 2.83M22 12h-4" />
              </svg>
            </div>
            <div className="pointer-events-none absolute top-12 right-2 h-2.5 w-2.5 rounded-full bg-purple-400 wide:h-3.5 wide:w-3.5" />
            <div className="pointer-events-none absolute bottom-16 left-4 h-3 w-3 rounded-full bg-orange-400 wide:h-4 wide:w-4" />
            <div className="pointer-events-none absolute bottom-4 right-1/3 h-2 w-2 rounded-full bg-teal-400 wide:h-3 wide:w-3" />

            {/* 2x2 Cards Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-7 xl:grid-cols-1 2xl:grid-cols-2 wide:gap-8">
              {/* CARD 1: EASY EXPLANATIONS */}
              <div className="group relative flex flex-col items-center gap-5 overflow-hidden rounded-[24px] border border-[#fee6d3] bg-white p-5 text-center shadow-[0_10px_30px_rgba(249,115,22,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#fdba74] hover:shadow-[0_16px_36px_rgba(249,115,22,0.12)] sm:-rotate-2 sm:flex-row sm:items-start sm:justify-between sm:text-left sm:p-6 hover:rotate-0 wide:rounded-[28px] wide:p-7">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#fff2e6] blur-xl wide:h-40 wide:w-40" />

                <div className="relative z-10 flex max-w-full flex-col items-center text-center sm:max-w-[58%] sm:items-start sm:text-left">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffebd6] text-[#f97316] shadow-sm wide:h-13 wide:w-13">
                    <BookOpen className="h-5 w-5 wide:h-6 wide:w-6" />
                  </div>

                  <h3 className="mt-3 text-base font-extrabold text-[#0f2747] sm:text-lg wide:text-xl">
                    Easy Explanations
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 wide:text-sm">
                    Complex railway processes explained in simple language.
                  </p>

                  <span className="mt-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ffebd6] text-[#f97316] transition-transform duration-200 group-hover:translate-x-1 wide:h-8 wide:w-8">
                    <ArrowRight className="h-3.5 w-3.5 wide:h-4 wide:w-4" />
                  </span>
                </div>

                <div className="relative z-10 flex w-full shrink-0 items-center justify-center pt-1 sm:w-auto">
                  <div className="absolute -top-3 right-2 text-xs font-bold text-orange-400 select-none wide:text-sm">
                    \|/
                  </div>
                  <div className="relative w-24 rounded-xl border border-orange-100 bg-gradient-to-br from-white to-[#fff8f0] p-3 shadow-md rotate-6 sm:w-28 wide:w-32 wide:p-3.5">
                    <div className="mb-2 h-1.5 w-3/4 rounded-full bg-slate-200" />
                    <div className="mb-2 h-2 w-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500" />
                    <div className="mb-2 h-1.5 w-5/6 rounded-full bg-slate-200" />
                    <div className="h-1.5 w-2/3 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>

              {/* CARD 2: STEP-BY-STEP GUIDES */}
              <div className="group relative flex flex-col items-center gap-5 overflow-hidden rounded-[24px] border border-[#e0e7ff] bg-white p-5 text-center shadow-[0_10px_30px_rgba(99,102,241,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c7d2fe] hover:shadow-[0_16px_36px_rgba(99,102,241,0.12)] sm:rotate-2 sm:mt-6 sm:flex-row sm:items-start sm:justify-between sm:text-left sm:p-6 hover:rotate-0 wide:rounded-[28px] wide:p-7">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#eef2ff] blur-xl wide:h-40 wide:w-40" />

                <div className="relative z-10 flex max-w-full flex-col items-center text-center sm:max-w-[58%] sm:items-start sm:text-left">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#6366f1] shadow-sm wide:h-13 wide:w-13">
                    <ListChecks className="h-5 w-5 wide:h-6 wide:w-6" />
                  </div>

                  <h3 className="mt-3 text-base font-extrabold text-[#0f2747] sm:text-lg wide:text-xl">
                    Step-by-Step Guides
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 wide:text-sm">
                    Detailed articles and videos to help you every time.
                  </p>

                  <span className="mt-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#eef2ff] text-[#6366f1] transition-transform duration-200 group-hover:translate-x-1 wide:h-8 wide:w-8">
                    <ArrowRight className="h-3.5 w-3.5 wide:h-4 wide:w-4" />
                  </span>
                </div>

                <div className="relative z-10 flex w-full shrink-0 items-center justify-center pt-2 sm:w-auto">
                  <div className="relative w-24 space-y-1.5 -rotate-3 sm:w-28 wide:w-32 wide:space-y-2">
                    <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-white p-1.5 shadow-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white wide:h-6 wide:w-6 wide:text-xs">1</span>
                      <div className="h-1.5 w-10 rounded-full bg-indigo-100 wide:h-2" />
                    </div>
                    <div className="flex translate-x-1 items-center gap-2 rounded-lg border border-indigo-100 bg-white p-1.5 shadow-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white wide:h-6 wide:w-6 wide:text-xs">2</span>
                      <div className="h-1.5 w-8 rounded-full bg-blue-100 wide:h-2" />
                    </div>
                    <div className="flex translate-x-2 items-center gap-2 rounded-lg border border-indigo-100 bg-white p-1.5 shadow-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-400 text-[10px] font-bold text-white wide:h-6 wide:w-6 wide:text-xs">3</span>
                      <div className="h-1.5 w-6 rounded-full bg-indigo-100 wide:h-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: UPDATED INFORMATION */}
              <div className="group relative flex flex-col items-center gap-5 overflow-hidden rounded-[24px] border border-[#ffedd5] bg-white p-5 text-center shadow-[0_10px_30px_rgba(245,158,11,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#fde68a] hover:shadow-[0_16px_36px_rgba(245,158,11,0.12)] sm:-rotate-1 sm:flex-row sm:items-start sm:justify-between sm:text-left sm:p-6 hover:rotate-0 wide:rounded-[28px] wide:p-7">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#fff7ed] blur-xl wide:h-40 wide:w-40" />

                <div className="relative z-10 flex max-w-full flex-col items-center text-center sm:max-w-[58%] sm:items-start sm:text-left">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffedd5] text-[#d97706] shadow-sm wide:h-13 wide:w-13">
                    <BadgeCheck className="h-5 w-5 wide:h-6 wide:w-6" />
                  </div>

                  <h3 className="mt-3 text-base font-extrabold text-[#0f2747] sm:text-lg wide:text-xl">
                    Check Current Sources
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 wide:text-sm">
                    Verify current rules, charges, and updates with official sources.
                  </p>

                  <span className="mt-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ffedd5] text-[#d97706] transition-transform duration-200 group-hover:translate-x-1 wide:h-8 wide:w-8">
                    <ArrowRight className="h-3.5 w-3.5 wide:h-4 wide:w-4" />
                  </span>
                </div>

                <div className="relative z-10 flex w-full shrink-0 items-center justify-center pt-1 sm:w-auto">
                  <div className="relative w-24 rounded-xl border border-amber-100 bg-white p-2.5 shadow-md sm:w-28 wide:w-32 wide:p-3">
                    <span className="text-[10px] font-black tracking-wider text-amber-600 wide:text-xs">IRCTC</span>
                    <div className="mt-1 space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-slate-200 wide:h-2" />
                      <div className="h-1.5 w-3/4 rounded-full bg-slate-100 wide:h-2" />
                    </div>

                    <div className="absolute -right-3 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-lg shadow-orange-300/50 wide:h-10 wide:w-10">
                      <Bell className="h-4 w-4 fill-white wide:h-5 wide:w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 4: TRUSTED BY AGENTS */}
              <div className="group relative flex flex-col items-center gap-5 overflow-hidden rounded-[24px] border border-[#ccfbf1] bg-white p-5 text-center shadow-[0_10px_30px_rgba(13,148,136,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#99f6e4] hover:shadow-[0_16px_36px_rgba(13,148,136,0.12)] sm:rotate-2 sm:mt-6 sm:flex-row sm:items-start sm:justify-between sm:text-left sm:p-6 hover:rotate-0 wide:rounded-[28px] wide:p-7">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#f0fdf4] blur-xl wide:h-40 wide:w-40" />

                <div className="relative z-10 flex max-w-full flex-col items-center text-center sm:max-w-[58%] sm:items-start sm:text-left">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ccfbf1] text-[#0d9488] shadow-sm wide:h-13 wide:w-13">
                    <UsersRound className="h-5 w-5 wide:h-6 wide:w-6" />
                  </div>

                  <h3 className="mt-3 text-base font-extrabold text-[#0f2747] sm:text-lg wide:text-xl">
                    For Agents & Travellers
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 wide:text-sm">
                    Useful information for new agents and everyday travellers.
                  </p>

                  <span className="mt-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ccfbf1] text-[#0d9488] transition-transform duration-200 group-hover:translate-x-1 wide:h-8 wide:w-8">
                    <ArrowRight className="h-3.5 w-3.5 wide:h-4 wide:w-4" />
                  </span>
                </div>

                <div className="relative z-10 flex w-full shrink-0 items-center justify-center pt-2 sm:w-auto">
                  <div className="relative flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ccfbf1]/60 text-teal-600 sm:h-20 sm:w-20 wide:h-24 wide:w-24">
                      <UsersRound className="h-8 w-8 text-[#0d9488] wide:h-10 wide:w-10" />
                    </div>

                    <div className="absolute -bottom-1 -right-2 flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md wide:h-9 wide:w-9">
                      <ShieldCheck className="h-4 w-4 fill-white wide:h-5 wide:w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 2: HOW IT WORKS (ULTRA-WIDE ENHANCED FOR 2560px)
      ========================================================== */}
      <section className="relative isolate overflow-hidden py-8 sm:py-10 lg:py-12 2xl:py-14 wide:py-14">
        <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-2/5 opacity-[0.08]">
          <Image
            src="/images/hero-railway-bg.png"
            alt=""
            fill
            sizes="40vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
        </div>
        <div className="site-container">
          <div className="mx-auto max-w-[720px] text-center md:mx-0 md:text-left wide:max-w-[850px]">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#c2410c] wide:text-base">
              <ShieldCheck className="h-4 w-4 wide:h-5 wide:w-5" />
              How It Works
            </p>
            <h2 className="text-[clamp(2rem,4vw,2.5rem)] font-extrabold leading-tight tracking-[-0.04em] text-[var(--navy)] wide:text-[3.25rem]">
              Get answers in three simple steps
            </h2>
          </div>

          <div className="relative mt-9 grid gap-6 md:grid-cols-2 md:gap-7 xl:grid-cols-3 lg:mt-12 lg:gap-8 wide:mt-14 wide:gap-12 wide:max-w-[1550px] wide:mx-auto">
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-[#f7bf8e] xl:block wide:top-10"
            />
            {steps.map(({ title, description, icon: Icon, color }, index) => (
              <article key={title} className="relative z-10 flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left xl:block xl:text-left">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white ring-8 ring-white ${color} wide:h-20 wide:w-20`}
                >
                  <Icon className="h-7 w-7 wide:h-8 wide:w-8" />
                </div>
                <div className="min-w-0 pt-1 xl:pt-5 wide:pt-6">
                  <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#c2410c] wide:text-base">
                    Step 0{index + 1}
                  </p>
                  <h3 className="mt-1 text-xl font-bold leading-snug text-[var(--navy)] wide:text-2xl">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-[350px] text-base leading-relaxed text-slate-600 wide:max-w-[380px] wide:text-lg">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <Image
            src="/images/railagents-express.svg"
            alt=""
            width={260}
            height={90}
            className="pointer-events-none absolute bottom-0 right-0 hidden h-auto w-[190px] opacity-40 lg:block xl:w-[220px] wide:w-[260px]"
          />
        </div>
      </section>
    </>
  );
}
