import Image from "next/image";
import { ArrowRight, HelpCircle, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";

const sampleQuestions = [
  "Can I transfer a confirmed ticket to a family member?",
  "How does the Tatkal 10:00 AM opening lockout rule work?",
  "What is the exact refund on chart-prepared waitlisted e-tickets?",
];

export function AskNihalSection() {
  return (
    <section
      aria-labelledby="ask-nihal-heading"
      className="border-b border-[#E5EAF0] bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="site-container">
        {/* Main High-Impact Navy & Orange Promotional Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#142B45]/10 bg-gradient-to-br from-[#142B45] via-[#0E2034] to-[#081422] p-7 sm:p-10 lg:p-14 text-white shadow-xl">
          {/* Subtle warm orange & blue ambient radial glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(243,107,33,0.35)_0%,rgba(243,107,33,0.08)_50%,transparent_70%)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#2563EB]/15 blur-3xl"
          />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Column (Copy & Prompts) */}
            <div className="lg:col-span-8 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F36B21]/40 bg-[#F36B21]/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#F36B21] shadow-2xs">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                Railway Guidance Desk
              </span>

              <h2
                id="ask-nihal-heading"
                className="mt-4 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-white leading-tight"
              >
                Have a Complex Railway Question?{" "}
                <span className="text-[#F36B21]">Ask Nihal Singh</span>
              </h2>

              <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Whether you need clarity on Tatkal timings, cancelled train refunds, RAC allocations, or IRCTC agent verification terms, get a structured, step-by-step answer.
              </p>

              {/* Sample Question Chips */}
              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold text-slate-400">Popular queries visitors ask:</p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {sampleQuestions.map((q) => (
                    <InternalLink
                      key={q}
                      href="/ask-nihal"
                      prefetch={false}
                      className="rounded-lg border border-white/15 bg-white/10 px-3 py-1 text-xs text-slate-200 hover:border-[#F36B21] hover:bg-[#F36B21]/20 transition-colors"
                    >
                      &ldquo;{q}&rdquo;
                    </InternalLink>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 sm:gap-4 w-full sm:w-auto">
                <InternalLink
                  href="/ask-nihal"
                  prefetch={false}
                  className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-[#F36B21] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_-4px_rgba(243,107,33,0.5),0_0_20px_rgba(243,107,33,0.3)] transition-all duration-150 hover:bg-[#F36B21] hover:shadow-[0_12px_28px_-4px_rgba(243,107,33,0.65),0_0_30px_rgba(243,107,33,0.45)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                  <span>Ask Nihal Singh</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                  />
                </InternalLink>

                <InternalLink
                  href="/guides"
                  prefetch={false}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-all duration-150 hover:bg-white/10 hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <HelpCircle aria-hidden="true" className="h-4 w-4 text-slate-300" />
                  <span>Browse FAQs &amp; Rules</span>
                </InternalLink>
              </div>

              {/* Persona Transparency Disclaimer */}
              <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 text-left">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#16A36A]"
                />
                <p className="text-[11px] leading-relaxed text-slate-300">
                  <strong className="text-white">Transparency Notice:</strong> Nihal Singh is a fictional digital persona created by RailAgents to explain ticketing rules in accessible language. Answers are derived strictly from official Ministry of Railways documentation.
                </p>
              </div>
            </div>

            {/* Right Side Avatar Representation */}
            <div className="flex justify-center lg:col-span-4 lg:justify-end">
              <div className="relative w-48 h-56 sm:w-56 sm:h-64">
                {/* Soft orange radial glow against navy */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(243,107,33,0.35)_0%,rgba(243,107,33,0.08)_50%,transparent_70%)] blur-2xl"
                />

                <div className="relative h-full w-full overflow-hidden rounded-3xl border-2 border-white/20 bg-gradient-to-t from-white/15 via-white/5 to-transparent p-3 shadow-2xl">
                  <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#142B45]/60">
                    <Image
                      src="/images/nihal-singh.webp"
                      alt="Nihal Singh Digital Persona"
                      fill
                      sizes="(min-width: 640px) 224px, 192px"
                      className="object-contain object-bottom drop-shadow-lg"
                    />
                    <div className="absolute bottom-2 inset-x-2 rounded-lg bg-[#142B45]/90 py-1 text-center text-[10px] font-bold text-[#F36B21] backdrop-blur-xs border border-white/10">
                      Online Guidance Desk
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
