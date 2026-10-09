import { InternalLink } from "@/components/ui/InternalLink";
import {
  ArrowRight,
  Quote,
  Star,
} from "lucide-react";

const testimonials = [
  {
    name: "Rakesh Verma",
    location: "Travel Agent, Delhi",
    initials: "RV",
    quote:
      "The clear guides helped me understand the IRCTC registration process.",
  },
  {
    name: "Pooja Sharma",
    location: "Agent, Lucknow",
    initials: "PS",
    quote:
      "The video tutorials are excellent. I got answers to all my doubts in one place.",
  },
  {
    name: "Amit Patel",
    location: "Agent, Ahmedabad",
    initials: "AP",
    quote:
      "Simple and accurate information. This website saves a lot of time for railway agents.",
  },
];

export function Testimonials() {
  return (
    <section className="site-container py-8 sm:py-10 lg:py-12 2xl:py-14 wide:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:gap-10 wide:gap-14">
        {/* LEFT SIDE */}
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[0.8125rem] font-[800] uppercase tracking-[0.12em] text-[#e96713]">
                What Our Users Say
              </p>

              <h2 className="max-w-[760px] text-[clamp(2rem,3.5vw,3.25rem)] font-extrabold leading-[1.08] tracking-[-0.045em] text-[var(--navy)] wide:max-w-[900px] wide:text-[3.75rem]">
                What Travel Agents Say About RailAgents
              </h2>
            </div>

          </div>

          {/* TESTIMONIAL CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="
                  group
                  relative
                  flex
                  items-center
                  text-center
                  min-h-[270px]
                  flex-col
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-[#f1e4d9]
                  bg-white
                  p-5
                  shadow-[0_6px_24px_rgba(15,39,71,0.04)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[#fdc99f]
                  hover:shadow-[0_16px_38px_rgba(15,39,71,0.08)]
                  wide:min-h-[320px]
                  wide:p-7
                  sm:items-stretch
                  sm:text-left
                "
              >
                {/* decorative orange glow */}
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -right-10
                    -top-10
                    h-28
                    w-28
                    rounded-full
                    bg-orange-100/60
                    blur-2xl
                  "
                />

                {/* TOP PROFILE */}
              <div className="relative z-10 flex w-full flex-col items-center justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <span
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#fff0df]
                        text-[0.875rem]
                        font-[800]
                        text-[#b9500c]
                      "
                    >
                      {testimonial.initials}
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate text-[0.95rem] font-[800] text-[var(--navy)]">
                        {testimonial.name}
                      </h3>

                      <p className="truncate text-[0.8125rem] text-slate-600">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>

                  <Quote className="hidden h-7 w-7 shrink-0 text-[#ffe0c2] sm:block" />
                </div>

                {/* STARS */}
                <div
                  className="relative z-10 mt-4 flex justify-center gap-1 text-[#f59e0b] sm:justify-start"
                  aria-label="5 out of 5 stars"
                >
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className="h-3.5 w-3.5 fill-current"
                    />
                  ))}
                </div>

                {/* QUOTE AREA */}
                <div
                  className="
                    relative
                    z-10
                    mt-4
                    flex
                    flex-1
                    items-center
                    rounded-2xl
                    bg-[#fffaf5]
                    px-4
                    py-4
                  "
                >
                  <p className="text-center text-[0.92rem] leading-[1.65] text-slate-600 sm:text-left">
                    “{testimonial.quote}”
                  </p>
                </div>

                {/* BOTTOM DECORATIVE LINE */}
              <div className="relative z-10 mx-auto mt-4 h-[3px] w-10 rounded-full bg-[var(--primary)] transition-all duration-300 group-hover:w-16 sm:mx-0" />
              </article>
            ))}
          </div>
        </div>

        {/* RIGHT CTA CARD */}
        <aside
          className="
            relative
            isolate
            flex
            min-h-[320px]
            flex-col
            justify-center
            overflow-hidden
            rounded-[28px]
            border
            border-[#ffe1c2]
            bg-[linear-gradient(115deg,#fffaf4_0%,#ffead7_100%)]
            p-7
            items-center
            text-center
            shadow-[0_12px_35px_rgba(249,115,22,0.08)]
            lg:items-start
            lg:p-8
            lg:text-left
            wide:min-h-[400px]
            wide:p-10
          "
        >
          {/* train image */}
          <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[58%] opacity-40">
            <div className="absolute inset-0 bg-gradient-to-r from-[#fff4e8] via-[#fff4e8]/70 to-transparent" />

            <ImageTrainBackdrop />
          </div>

          {/* glow */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-24
              -left-16
              -z-10
              h-64
              w-64
              rounded-full
              bg-orange-200/30
              blur-[70px]
            "
          />

          <p className="mb-3 text-[0.8125rem] font-[800] uppercase tracking-[0.12em] text-[#e96713]">
            Explore IRCTC Agent Information
          </p>

          <h2 className="max-w-[360px] text-[2rem] font-[800] leading-[1.1] tracking-[-0.045em] text-[var(--navy)] wide:max-w-[460px] wide:text-[2.5rem]">
            Understand the IRCTC Agent Process
          </h2>

          <p className="mx-auto mt-4 max-w-[390px] text-[0.92rem] leading-[1.65] text-slate-600 lg:mx-0 wide:max-w-[480px] wide:text-lg">
            Explore practical guides about the registration process, documents,
            and details to verify with the relevant authorized provider.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
            <InternalLink
              href="/irctc-agent-registration"
              prefetch={false}
              className="
                inline-flex
                min-h-[46px]
                items-center
                gap-2
                rounded-xl
                bg-[var(--primary)]
                px-5
                text-[0.9rem]
                font-[600]
                text-white
                shadow-[0_8px_22px_rgba(249,115,22,0.28)]
                transition
                hover:-translate-y-[1px]
                hover:bg-[var(--primary-hover)]
              "
            >
              Understand the Process
              <ArrowRight className="h-4 w-4" />
            </InternalLink>

            <InternalLink
              href="/about"
              prefetch={false}
              className="
                inline-flex
                min-h-[46px]
                items-center
                rounded-xl
                border
                border-[#f97316]/40
                bg-white/80
                px-5
                text-[0.9rem]
                font-[600]
                text-[#b9500c]
                backdrop-blur-sm
                transition
                hover:bg-white
              "
            >
              Learn More
            </InternalLink>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ImageTrainBackdrop() {
  return (
    <div className="absolute inset-0">
      <div
        className="
          absolute
          inset-0
          bg-[url('/images/hero-railway-bg.png')]
          bg-cover
          bg-center
          opacity-80
        "
      />
    </div>
  );
}
