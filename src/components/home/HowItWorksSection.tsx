import { CheckCircle, Search, SlidersHorizontal, TrainTrack } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Select Your Tool or Topic",
    description:
      "Choose from our 6 PRS calculation tools, check your 10-digit PNR, or search our structured library of IRCTC agent and passenger guides.",
    icon: Search,
    highlight: "Instant Tool Access",
  },
  {
    step: "02",
    title: "Review Verified Rules & Slabs",
    description:
      "Inspect exact fee breakdowns, official cancellation slabs, required paperwork checklists, or watch short video demonstrations.",
    icon: SlidersHorizontal,
    highlight: "Tariff Code Verification",
  },
  {
    step: "03",
    title: "Take Action with Confidence",
    description:
      "Complete customer bookings, calculate net bank refunds, file timely TDRs, and manage your ticketing operations accurately.",
    icon: CheckCircle,
    highlight: "Zero Guesswork",
  },
];

export function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="border-b border-[#E5EAF0] bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="site-container">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FFF1E7] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F36B21] border border-[#F36B21]/20">
            <TrainTrack className="h-3.5 w-3.5" aria-hidden="true" />
            Simple Workflow
          </span>
          <h2
            id="how-it-works-heading"
            className="mt-2 text-2xl font-black tracking-tight text-[#142B45] sm:text-3xl lg:text-4xl"
          >
            How RailAgents Works
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#667085] sm:text-base">
            Get quick, dependable railway answers in three straightforward steps.
          </p>
        </div>

        {/* Desktop & Mobile Responsive Connected Timeline */}
        <div className="relative mt-14">
          {/* Desktop Horizontal Connecting Guide Line */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-7 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-[#F36B21]/30 z-0"
          />

          {/* Mobile Vertical Connecting Guide Line */}
          <div
            aria-hidden="true"
            className="md:hidden absolute top-8 bottom-8 left-[27px] w-0.5 border-l-2 border-dashed border-[#F36B21]/30 z-0"
          />

          <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6 lg:gap-8">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#E5EAF0] bg-[#F4F5F7]/40 p-6 sm:p-7 shadow-2xs transition-all duration-200 motion-reduce:transition-none hover:-translate-y-1 hover:border-[#F36B21]/45 hover:bg-white hover:shadow-[0_14px_32px_-6px_rgba(243,107,33,0.14),0_4px_12px_-2px_rgba(20,43,69,0.04)] pl-16 md:pl-7"
                >
                  {/* Step Node for Mobile & Desktop */}
                  <div className="flex items-center justify-between">
                    <span className="absolute -left-0 top-6 md:static flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#F36B21] border border-[#E5EAF0] shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:border-[#F36B21]/45 group-hover:shadow-[0_0_20px_rgba(243,107,33,0.22)]">
                      <Icon aria-hidden="true" className="h-7 w-7" />
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[#F36B21] px-3 py-1 text-xs font-black tracking-wide text-white shadow-[0_0_14px_rgba(243,107,33,0.35)]">
                      Step {item.step}
                    </span>
                  </div>

                  <div>
                    <h3 className="mt-5 text-lg font-bold text-[#142B45] group-hover:text-[#F36B21] transition-colors">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-[#667085] sm:text-sm">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E5EAF0] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                      Phase {item.step}
                    </span>
                    <span className="font-semibold text-[#142B45]">
                      {item.highlight}
                    </span>
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
