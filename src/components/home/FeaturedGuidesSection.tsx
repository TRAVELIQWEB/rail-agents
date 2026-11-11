import Image from "next/image";
import { ArrowRight, BookOpen, Clock, Sparkles } from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";

const leadGuide = {
  slug: "verify-authorised-irctc-psp-agent-id",
  title: "How to Verify an Authorised IRCTC PSP Before Buying an Agent ID",
  category: "Agent Business",
  readTime: "6 min read",
  excerpt:
    "Planning to purchase an IRCTC Agent ID or RSP license? Learn how to inspect the official Principal Service Provider registry, avoid fraudulent portals, and secure your investment against blacklist penalties.",
  image: "/images/irctc-agent-compliance-checklist.webp",
};

const supportingGuides = [
  {
    slug: "indian-railways-senior-citizen-quota-lower-berth-booking-rules-eligibility-guide",
    title: "Indian Railways Senior Citizen Quota (SS): Eligibility & Lower Berth Rules",
    category: "Commercial Rules",
    readTime: "7 min read",
    excerpt:
      "Complete guide to the Senior Citizen Lower Berth Quota: male and female age thresholds, coach-wise berth quotas, and automatic allotment conditions.",
    image: "/images/senior-citizen-quota-lower-berth-rules-cover.jpg",
  },
  {
    slug: "indian-railways-nt-rule-confirmed-ticket-seat",
    title: "Can You Lose Your Confirmed Train Seat? Indian Railways NT Rule Explained",
    category: "Passenger Rights",
    readTime: "5 min read",
    excerpt:
      "Understand what the Indian Railways NT (Not Turned Up) rule means, how TTE Handheld Terminals record attendance, and when an empty seat is transferred to RAC travelers.",
    image: "/images/restored-train-passenger-journey.webp",
  },
  {
    slug: "indian-railways-luggage-rules-free-baggage-allowance",
    title: "Indian Railways Luggage Rules: Free Allowance, Dimensions & Extra Charges",
    category: "Travel Guidelines",
    readTime: "6 min read",
    excerpt:
      "Official free luggage limits across 1AC, 2AC, 3AC, and Sleeper classes. Learn parcel booking rates, marginal allowance buffers, and penalties.",
    image: "/images/indian-railways-luggage-rules-cover.jpg",
  },
];

export function FeaturedGuidesSection() {
  return (
    <section
      aria-labelledby="featured-guides-heading"
      className="border-b border-[#E5EAF0] bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="site-container">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-[#E5EAF0] pb-6 sm:flex-row sm:items-end sm:pb-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FFF1E7] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F36B21] border border-[#F36B21]/20">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Editorial Journal
            </span>
            <h2
              id="featured-guides-heading"
              className="mt-2 text-2xl font-black tracking-tight text-[#142B45] sm:text-3xl lg:text-4xl"
            >
              Featured Railway Guides
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#667085] sm:text-base">
              In-depth, evergreen references on commercial railway rules, ticketing policies, and agent compliance.
            </p>
          </div>

          <InternalLink
            href="/blog"
            prefetch={false}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E5EAF0] bg-white px-4 py-2 text-sm font-bold text-[#F36B21] shadow-2xs hover:border-[#F36B21]/50 hover:bg-[#FFF1E7]/40 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F36B21]"
          >
            <span>View all articles</span>
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
            />
          </InternalLink>
        </div>

        {/* Magazine-Style Editorial Composition */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Lead Feature Story (7 cols) */}
          <article className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E5EAF0] bg-[#F4F5F7]/30 shadow-xs transition-all duration-300 motion-reduce:transition-none hover:-translate-y-1 hover:border-[#F36B21]/50 hover:bg-white hover:shadow-[0_20px_40px_-12px_rgba(20,43,69,0.12),0_4px_16px_-4px_rgba(243,107,33,0.1)] lg:col-span-7">
            <div>
              {/* Large 16:9 Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#142B45]">
                <Image
                  src={leadGuide.image}
                  alt={leadGuide.title}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="rounded-full bg-[#142B45]/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-xs">
                    {leadGuide.category}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-[#F36B21] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Lead Guide
                  </span>
                </div>
              </div>

              {/* Lead Body Content */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
                  <Clock aria-hidden="true" className="h-4 w-4 text-[#F36B21]" />
                  <span>{leadGuide.readTime}</span>
                </div>

                <h3 className="mt-3 text-xl font-black leading-snug text-[#142B45] group-hover:text-[#F36B21] transition-colors sm:text-2xl">
                  <InternalLink href={`/blog/${leadGuide.slug}`} prefetch={false}>
                    {leadGuide.title}
                  </InternalLink>
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-[#475467] sm:text-base">
                  {leadGuide.excerpt}
                </p>
              </div>
            </div>

            <div className="border-t border-[#E5EAF0] bg-white px-6 py-4 sm:px-8 flex items-center justify-between">
              <span className="text-xs font-bold text-[#667085]">Full Editorial Breakdown</span>
              <InternalLink
                href={`/blog/${leadGuide.slug}`}
                prefetch={false}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F36B21] transition-transform duration-150 group-hover:translate-x-1"
              >
                <span>Read comprehensive guide</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </InternalLink>
            </div>
          </article>

          {/* Right Column: 3 Supporting Guides (5 cols) */}
          <div className="flex flex-col justify-between gap-5 lg:col-span-5">
            {supportingGuides.map((guide) => (
              <article
                key={guide.slug}
                className="group flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 overflow-hidden rounded-2xl border border-[#E5EAF0] bg-white p-4 shadow-2xs transition-all duration-200 motion-reduce:transition-none hover:-translate-y-0.5 hover:border-[#F36B21]/45 hover:shadow-[0_10px_24px_-6px_rgba(20,43,69,0.08),0_2px_8px_-2px_rgba(243,107,33,0.08)]"
              >
                {/* 16:9 Thumbnail */}
                <div className="relative aspect-[16/9] w-full sm:w-44 lg:w-full xl:w-44 shrink-0 overflow-hidden rounded-xl bg-[#F4F5F7]">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    sizes="(min-width: 1280px) 180px, (min-width: 640px) 180px, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 rounded-md bg-[#142B45]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {guide.category}
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#667085]">
                      <Clock aria-hidden="true" className="h-3 w-3 text-[#F36B21]" />
                      <span>{guide.readTime}</span>
                    </div>

                    <h4 className="mt-1 text-sm font-bold leading-snug text-[#142B45] group-hover:text-[#F36B21] transition-colors line-clamp-2">
                      <InternalLink href={`/blog/${guide.slug}`} prefetch={false}>
                        {guide.title}
                      </InternalLink>
                    </h4>

                    <p className="mt-1 text-xs leading-relaxed text-[#667085] line-clamp-2">
                      {guide.excerpt}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#E5EAF0]/60 flex items-center justify-between text-xs font-bold text-[#F36B21]">
                    <span>Read guide</span>
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
