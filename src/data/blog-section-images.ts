// Reusable section-level image mapping for RailAgents blog articles.
// Allows attaching Next.js <Image> visuals to specific article sections by slug
// and heading identifier without mutating or duplicating raw HTML in the database.

export type BlogImageVariant = "hero" | "editorial" | "supporting";

export type BlogImagePlacement =
  | "after-intro"
  | "after-heading"
  | "after-first-paragraph";

export interface BlogSectionImageConfig {
  /** Stable identifier for this visual slot */
  id: string;
  /** Case-insensitive substring matching the target H2 heading text (use "__INTRO__" for the intro section) */
  headingMatch: string;
  /** Local image path inside /public/images */
  src: string;
  /** Descriptive, unique SEO and accessibility alt attribute */
  alt: string;
  /** Optional subtle editorial caption below the image */
  caption?: string;
  /** Visual size preset: "hero" (priority), "editorial" (standard H2 visual), or "supporting" (compact visual for FAQs/checklists/tables) */
  variant: BlogImageVariant;
  /** Where inside the matched H2 section to place the image */
  placement: BlogImagePlacement;
  /** CSS object-position value to keep key subjects framed */
  objectPosition?: string;
}

export const BLOG_ARTICLE_SECTION_IMAGES: Record<string, BlogSectionImageConfig[]> = {
  "train-cancelled-train-restored-irctc-refund-tdr-guide": [
    {
      id: "hero-below-intro",
      headingMatch: "__INTRO__",
      src: "/images/train-cancelled-restored-guide.webp",
      alt: "Indian Railways station departure board showing a cancelled train restored to running status while an IRCTC rail agent verifies passenger PNR details",
      caption:
        "Always verify the live operating status of a restored train before initiating a ticket cancellation or refund claim.",
      variant: "hero",
      placement: "after-intro",
      objectPosition: "center center",
    },
    {
      id: "section-1-train-restored-status",
      headingMatch: "1. What Does",
      src: "/images/indian-railway-train-status.webp",
      alt: "IRCTC rail agent checking live Indian Railways train restoration status and schedule updates on the official enquiry portal",
      caption:
        "Checking the latest train running status and recording the timestamp helps agents give accurate advice when a cancelled service is reinstated.",
      variant: "editorial",
      placement: "after-first-paragraph",
      objectPosition: "center center",
    },
    {
      id: "section-2-automatic-refund-system",
      headingMatch: "2. How Does the Automatic Refund System Work",
      src: "/images/irctc-refund-process.webp",
      alt: "IRCTC automatic refund processing workflow showing e-ticket PNR status verification and refund tracking on an agent terminal",
      caption:
        "Automatic refunds apply when a train remains officially cancelled; once a train is restored to run, standard automatic cancellation refund assumptions no longer apply.",
      variant: "editorial",
      placement: "after-first-paragraph",
      objectPosition: "center center",
    },
    {
      id: "section-3-scenario-one-no-travel",
      headingMatch: "3. Scenario One: The Passenger Does Not Want to Travel",
      src: "/images/railway-ticket-cancellation-scenarios.webp",
      alt: "Passenger consulting an authorized IRCTC rail agent to document train cancellation notifications and check refund options before cancelling",
      caption:
        "Documenting the PNR, SMS alerts, and current train status before cancelling prevents avoidable fare deductions when a passenger chooses not to travel.",
      variant: "editorial",
      placement: "after-first-paragraph",
      objectPosition: "center center",
    },
    {
      id: "section-4-scenario-two-will-travel",
      headingMatch: "4. Scenario Two: The Passenger Will Travel If the Train Is Restored",
      src: "/images/restored-train-passenger-journey.webp",
      alt: "Passengers boarding a restored Indian Railways express train at the platform after verifying updated schedule and ticket validity",
      caption:
        "Passengers who still intend to travel should keep their confirmed booking intact and monitor official departure and boarding updates.",
      variant: "editorial",
      placement: "after-first-paragraph",
      objectPosition: "center center",
    },
    {
      id: "section-5-scenario-three-tdr-filing",
      headingMatch: "5. Scenario Three: The Train Is Restored, but the Passenger Cannot Travel",
      src: "/images/railway-tdr-filing-guide.webp",
      alt: "Step-by-step online Ticket Deposit Receipt (TDR) filing on the IRCTC portal for a restored train when the passenger cannot travel",
      caption:
        "Filing a Ticket Deposit Receipt (TDR) with the accurate restoration reason within the permitted window is essential when the passenger cannot undertake the journey.",
      variant: "editorial",
      placement: "after-first-paragraph",
      objectPosition: "center center",
    },
    {
      id: "section-6-railmadad-grievance",
      headingMatch: "6. What If More Than 72 Hours Have Passed",
      src: "/images/railmadad-grievance-guide.webp",
      alt: "Filing an official railway refund grievance on the Indian Railways RailMadad portal and 139 helpline with PNR and notification records",
      caption:
        "When a restoration SMS was missing or a filing window has elapsed, passengers and agents can submit documented records for official review via RailMadad or helpline 139.",
      variant: "editorial",
      placement: "after-first-paragraph",
      objectPosition: "center center",
    },
    {
      id: "section-7-quick-reference-table",
      headingMatch: "7. Quick Reference Table for Rail Agents",
      src: "/images/rail-agent-quick-reference-guide.webp",
      alt: "IRCTC rail agent reviewing a quick-reference decision chart for cancelled and restored train refund scenarios",
      caption:
        "Quick-reference decision workflow for evaluating cancelled vs. restored train bookings at the agency desk.",
      variant: "supporting",
      placement: "after-heading",
      objectPosition: "center center",
    },
    {
      id: "section-8-common-mistakes",
      headingMatch: "8. Common Mistakes to Avoid",
      src: "/images/railway-refund-mistakes-guide.webp",
      alt: "Senior IRCTC travel agency supervisor guiding an agent on refund verification and TDR reason selection to avoid cancellation errors",
      caption:
        "Verifying current running status, understanding ₹0 refund displays, and selecting the exact TDR reason help agents avoid costly refund errors.",
      variant: "editorial",
      placement: "after-heading",
      objectPosition: "center center",
    },
    {
      id: "section-9-agent-checklist",
      headingMatch: "9. Practical Checklist for IRCTC Rail Agents",
      src: "/images/irctc-agent-compliance-checklist.webp",
      alt: "IRCTC rail agent compliance checklist with PNR status logs, notification records, and TDR reference documentation",
      caption:
        "A structured pre-cancellation checklist helps IRCTC agents verify PNR status, preserve SMS evidence, and track TDR or grievance reference numbers.",
      variant: "supporting",
      placement: "after-first-paragraph",
      objectPosition: "center center",
    },
    {
      id: "section-10-frequently-asked-questions",
      headingMatch: "10. Frequently Asked Questions",
      src: "/images/railway-refund-faq-guide.webp",
      alt: "Indian Railways passenger assistance desk and authorized IRCTC agent answering common train cancellation, restoration, and TDR refund questions",
      caption:
        "Clear answers on automatic refunds, ₹0 display messages, TDR filing windows, and RailMadad escalation help passengers make informed decisions.",
      variant: "supporting",
      placement: "after-heading",
      objectPosition: "center center",
    },
  ],
};

export function getBlogSectionImages(slug: string): BlogSectionImageConfig[] {
  return BLOG_ARTICLE_SECTION_IMAGES[slug] ?? [];
}
