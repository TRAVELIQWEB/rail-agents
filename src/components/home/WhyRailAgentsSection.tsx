import {
  ArrowRight,
  BookCheck,
  CheckCircle2,
  FileCheck2,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";

const valuePillars = [
  {
    icon: FileCheck2,
    title: "Official Gazette Accuracy",
    description:
      "Every rule and calculator is verified against official Ministry of Railways Gazette notifications, Railway Board commercial circulars, and PRS tariff codes.",
    iconBg: "bg-[#FFF1E7]",
    iconColor: "text-[#F36B21]",
    iconBorder: "border-[#F36B21]/20",
    badge: "Gazette Checked",
  },
  {
    icon: BookCheck,
    title: "Plain-Language Clarity",
    description:
      "We strip away convoluted railway terminology and translate complex policies into straightforward, step-by-step instructions that anyone can follow.",
    iconBg: "bg-[#EAF3FA]",
    iconColor: "text-[#142B45]",
    iconBorder: "border-[#142B45]/20",
    badge: "Zero Jargon",
  },
  {
    icon: Scale,
    title: "Built for Real Ticketing",
    description:
      "Our tools, checklists, and guides address real-world ticketing scenarios—handling RAC allocations, Tatkal morning rushes, and exact refund deductions.",
    iconBg: "bg-[#FFF7D9]",
    iconColor: "text-[#B45309]",
    iconBorder: "border-[#B45309]/25",
    badge: "Field Proven",
  },
  {
    icon: ShieldCheck,
    title: "Ethical Standards Only",
    description:
      "We maintain absolute editorial independence. We do not sell unverified quotas, promote touts, or make fabricated claims about ticket guarantees.",
    iconBg: "bg-[#EAF7F0]",
    iconColor: "text-[#16A36A]",
    iconBorder: "border-[#16A36A]/20",
    badge: "100% Ethical",
  },
];

export function WhyRailAgentsSection() {
  return (
    <section
      aria-labelledby="why-railagents-heading"
      className="border-b border-[#E5EAF0] bg-[#EAF3FA]/60 py-12 sm:py-16 lg:py-20"
    >
      <div className="site-container">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Authority Narrative (5 cols) */}
          <div className="lg:col-span-5 text-center lg:text-left">
            <span className="type-caption inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 font-bold uppercase tracking-wider text-[#142B45] border border-[#E5EAF0]">
              <Sparkles className="h-3.5 w-3.5 text-[#F36B21]" aria-hidden="true" />
              Platform Standards
            </span>

            <h2
              id="why-railagents-heading"
              className="type-h2 mt-3 tracking-tight text-[#142B45] "
            >
              The Authoritative Standard for{" "}
              <span className="text-[#F36B21]">Railway Knowledge</span>
            </h2>

            <p className="type-body-small mt-4 leading-relaxed text-[#475467] ">
              Navigating Indian Railways rules should not involve guesswork, fraudulent touts, or conflicting circulars. We decode complex official commercial notifications into transparent, everyday calculations.
            </p>

            {/* Quick Metrics */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2.5 rounded-xl border border-[#E5EAF0] bg-white p-3 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16A36A]" aria-hidden="true" />
                <span className="type-caption  font-bold text-[#142B45]">100% Official Gazette &amp; Circular References</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#E5EAF0] bg-white p-3 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16A36A]" aria-hidden="true" />
                <span className="type-caption  font-bold text-[#142B45]">Zero Touts, Forged Letterheads or Fake Quotas</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#E5EAF0] bg-white p-3 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16A36A]" aria-hidden="true" />
                <span className="type-caption  font-bold text-[#142B45]">Open, Accurate Public PRS Calculators</span>
              </div>
            </div>

            <div className="mt-6">
              <InternalLink
                href="/about"
                prefetch={false}
                className="type-button inline-flex items-center gap-1.5 font-bold text-[#F36B21] hover:text-[#F36B21] transition-colors"
              >
                <span>Read our editorial standards &amp; mission</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </InternalLink>
            </div>
          </div>

          {/* Right Column: 4 Pillars 2x2 Grid (7 cols) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7 sm:gap-5">
            {valuePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="group flex flex-col justify-between rounded-2xl border border-[#E5EAF0] bg-white p-6 shadow-2xs transition-all duration-200 motion-reduce:transition-none hover:-translate-y-1 hover:border-[#F36B21]/40 hover:shadow-[0_14px_30px_-6px_rgba(20,43,69,0.08),0_4px_12px_-2px_rgba(243,107,33,0.08)]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border ${pillar.iconBg} ${pillar.iconColor} ${pillar.iconBorder} transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(243,107,33,0.18)] shadow-2xs`}
                      >
                        <Icon aria-hidden="true" className="h-6 w-6" />
                      </span>
                      <span className="type-caption rounded-full bg-[#F4F5F7] px-2.5 py-0.5 font-bold text-[#142B45]">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="type-card-title mt-5 text-[#142B45] ">
                      {pillar.title}
                    </h3>

                    <p className="type-body-small mt-2 leading-relaxed text-[#667085] ">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
