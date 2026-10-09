export const guideCategories = [
  "All",
  "Getting Started",
  "IRCTC Agent",
  "Booking",
  "Tatkal",
  "Cancellation & Refund",
  "Troubleshooting",
  "Business Tips",
] as const;

export type GuideCategory = (typeof guideCategories)[number];

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Guide = {
  slug: string;
  category: Exclude<GuideCategory, "All">;
  title: string;
  summary: string;
  readTime: number;
  updatedAt: string;
  keywords: string[];
  quickAnswer: string;
  sections: GuideSection[];
};

export const guides: Guide[] = [
  {
    slug: "become-irctc-agent",
    category: "Getting Started",
    title: "How to Become an IRCTC Agent",
    summary: "A practical overview of the questions and preparation involved before starting an agent registration enquiry.",
    readTime: 5,
    updatedAt: "2026-10-09",
    keywords: ["start", "registration", "new agent", "requirements"],
    quickAnswer: "Start by understanding the current authorized registration route, checking its latest eligibility and document requirements, and confirming the terms directly with the provider before submitting personal information or payment.",
    sections: [
      { heading: "Understand the role", paragraphs: ["A railway ticketing agent helps customers with permitted booking and related support through the applicable authorized system. The exact services, access, and conditions depend on the current provider terms."] },
      { heading: "Prepare before applying", paragraphs: ["First identify the authorized provider you intend to work with. Ask for the latest written eligibility criteria, required documents, charges, renewal terms, and support arrangements. These details can change, so confirm them at the time of application."] },
      { heading: "A sensible registration checklist", paragraphs: ["Use this checklist to organize your enquiry. It is not an official or complete document list; request the current list from the provider."], bullets: ["Confirm the provider and its authorization", "Request current eligibility and document requirements", "Understand all charges and payment terms in writing", "Review account security, support, and renewal conditions", "Keep copies of application and payment records"] },
      { heading: "Avoid common pitfalls", paragraphs: ["Do not rely on forwarded fee lists or guaranteed approval claims. Never share passwords or one-time codes, and do not make a payment until you have verified the recipient and terms."] },
    ],
  },
  {
    slug: "documents-irctc-agent-registration",
    category: "IRCTC Agent",
    title: "Documents Required for IRCTC Agent Registration",
    summary: "How to confirm the current document checklist and prepare clear, consistent application information.",
    readTime: 4,
    updatedAt: "2026-10-09",
    keywords: ["paperwork", "identity", "proof", "application"],
    quickAnswer: "Document requirements vary by provider and can change. Request the current official checklist before preparing or sharing identity, address, or business documents.",
    sections: [
      { heading: "Get the current checklist first", paragraphs: ["There is no one-size-fits-all list to rely on here. Ask the provider which documents are required, acceptable formats, validity rules, and how documents should be submitted."] },
      { heading: "Prepare documents carefully", paragraphs: ["Once you receive the checklist, make sure names and details are consistent across documents. Use readable, complete copies and follow the provider's instructions for secure submission."] },
      { heading: "Protect your information", paragraphs: ["Submit sensitive documents only through a verified channel. Avoid sending identity documents to unverified agents or public groups, and retain a record of what you submitted and when."] },
      { heading: "Questions to ask", paragraphs: ["Clarify whether originals are needed, whether documents expire, how corrections are handled, and who can access your submitted information."] },
    ],
  },
  {
    slug: "registration-process-explained",
    category: "IRCTC Agent",
    title: "IRCTC Agent Registration Process Explained",
    summary: "A step-by-step way to understand an application, verify terms, and track follow-up safely.",
    readTime: 5,
    updatedAt: "2026-10-09",
    keywords: ["apply", "steps", "process", "status"],
    quickAnswer: "The exact process depends on the authorized provider. Get its current instructions in writing, complete each requested step through verified channels, and keep a record of your application and correspondence.",
    sections: [
      { heading: "1. Verify the route", paragraphs: ["Identify the provider and confirm that the route is appropriate for the service you want. Use contact details from its official source rather than an unsolicited message."] },
      { heading: "2. Review requirements and terms", paragraphs: ["Read the current eligibility, document, fee, renewal, and support information. Ask for clarification before sharing documents or paying."] },
      { heading: "3. Submit and track", paragraphs: ["Follow the provider's instructions exactly. Save confirmation numbers, receipts, and messages so you can follow up through the same verified channel."] },
      { heading: "4. Confirm next steps", paragraphs: ["Wait for confirmation from the provider and follow only its official onboarding instructions. Do not assume a particular processing timeline or approval outcome."] },
    ],
  },
  {
    slug: "tatkal-booking-guide-agents",
    category: "Tatkal",
    title: "Tatkal Booking Guide for Railway Agents",
    summary: "A customer-first preparation guide for time-sensitive bookings, with reminders to verify current rules.",
    readTime: 4,
    updatedAt: "2026-10-09",
    keywords: ["tatkal", "urgent", "availability", "booking"],
    quickAnswer: "For a time-sensitive booking, confirm the journey details and passenger information with the customer in advance, then follow the current official booking rules and availability shown by the authorized system.",
    sections: [
      { heading: "Prepare accurate details", paragraphs: ["Confirm the requested train, date, class, boarding point, destination, and each passenger's details with the customer before attempting a booking."] },
      { heading: "Check current booking rules", paragraphs: ["Opening times, eligibility, limits, and other conditions can be updated by the relevant authority. Check the current official information instead of relying on old posts or screenshots."] },
      { heading: "Set expectations", paragraphs: ["Availability can change quickly and a booking is not guaranteed until the system confirms it. Explain this clearly and never promise a confirmed seat before a valid booking is issued."] },
      { heading: "After the attempt", paragraphs: ["Share the actual booking status and reference details with the customer. If the booking fails, explain the displayed result and any next steps indicated by the system."] },
    ],
  },
  {
    slug: "ticket-cancellation-refund-guide",
    category: "Cancellation & Refund",
    title: "Railway Ticket Cancellation and Refund Guide",
    summary: "A clear process for checking cancellation options, communicating outcomes, and tracking a refund query.",
    readTime: 5,
    updatedAt: "2026-10-09",
    keywords: ["cancel", "refund status", "ticket", "money back"],
    quickAnswer: "Check the ticket's current status and the official cancellation and refund terms that apply to it. Available options and deductions may depend on ticket type, timing, and current rules.",
    sections: [
      { heading: "Review the booking", paragraphs: ["Verify the booking reference, passenger, journey, and current ticket status before taking action. Make sure the customer clearly requests the change or cancellation."] },
      { heading: "Check applicable terms", paragraphs: ["Consult the current official policy for that ticket and status. Do not quote a fixed refund amount or timeline without checking the terms shown for the booking."] },
      { heading: "Submit through the correct channel", paragraphs: ["Use the authorized system's available cancellation or support process. Keep the confirmation or request reference and communicate what the system reports."] },
      { heading: "Follow up on a pending refund", paragraphs: ["If the amount has not appeared as expected, use the official support route with the booking and transaction references. Avoid promising when funds will arrive unless the provider confirms it."] },
    ],
  },
  {
    slug: "irctc-login-problems-solutions",
    category: "Troubleshooting",
    title: "Common IRCTC Login Problems and Solutions",
    summary: "A safe first-check list for sign-in errors, verification issues, and account access concerns.",
    readTime: 4,
    updatedAt: "2026-10-09",
    keywords: ["password", "otp", "sign in", "account locked"],
    quickAnswer: "Check the username, connection, and current service message; use the official password-recovery flow if needed. Never share passwords or one-time codes with anyone offering support.",
    sections: [
      { heading: "Check basic sign-in details", paragraphs: ["Carefully re-enter the registered username and password, check keyboard case settings, and retry with a stable connection and an up-to-date browser or app."] },
      { heading: "Use official recovery options", paragraphs: ["If credentials are not accepted, use the account recovery option provided by the official service. Follow its verification steps and avoid third-party recovery links."] },
      { heading: "Handle verification messages safely", paragraphs: ["One-time codes are private. Do not share them with a caller, chat contact, or person claiming they need the code to fix your account."] },
      { heading: "When the issue continues", paragraphs: ["Note the exact error and time, then contact official support through its published channel. Do not repeatedly submit details to unverified pages."] },
    ],
  },
  {
    slug: "failed-railway-booking",
    category: "Troubleshooting",
    title: "How to Handle Failed Railway Bookings",
    summary: "Steps to verify booking status and payment before retrying or contacting support.",
    readTime: 4,
    updatedAt: "2026-10-09",
    keywords: ["payment", "failed transaction", "booking status", "retry"],
    quickAnswer: "Before trying again, check the booking history and payment status in the authorized system. This helps avoid duplicate attempts when a transaction is still processing or a booking was created despite an unclear screen.",
    sections: [
      { heading: "Pause and verify", paragraphs: ["A timeout or interrupted page does not always show the final transaction result. Check the booking history and transaction record before starting another booking."] },
      { heading: "Record what happened", paragraphs: ["Keep the time, journey details, transaction reference, and any on-screen message. Do not share full payment credentials or one-time codes."] },
      { heading: "Follow the displayed support route", paragraphs: ["If the status remains unclear, contact the authorized service using its official help channel and provide the relevant reference details."] },
      { heading: "Explain the outcome to the customer", paragraphs: ["Share only the status confirmed by the system. If a payment or refund is pending, explain that it needs to be tracked through the provider rather than promising a result or timeline."] },
    ],
  },
  {
    slug: "railway-booking-rules-agents",
    category: "Booking",
    title: "Important Railway Booking Rules for Agents",
    summary: "Good habits for checking current rules, entering accurate details, and keeping booking records.",
    readTime: 4,
    updatedAt: "2026-10-09",
    keywords: ["rules", "policy", "passenger details", "records"],
    quickAnswer: "Use the current rules displayed by the authorized booking system and official railway sources. Verify passenger details and communicate the confirmed status without guaranteeing availability.",
    sections: [
      { heading: "Use current official information", paragraphs: ["Booking rules may vary by service or change over time. Check the latest official terms for the booking in question rather than treating old material as current policy."] },
      { heading: "Confirm details before submission", paragraphs: ["Read back travel and passenger details to the customer. Small errors can create avoidable problems, and changes may not always be possible after booking."] },
      { heading: "Keep clear records", paragraphs: ["Retain booking references and customer instructions securely according to your business process. Limit access to personal information and share it only when needed to support the booking."] },
      { heading: "Communicate accurately", paragraphs: ["Explain the displayed fare, status, and conditions as shown. Never describe a waitlist or pending transaction as a confirmed booking."] },
    ],
  },
  {
    slug: "start-ticket-booking-for-customers",
    category: "Getting Started",
    title: "How to Start Railway Ticket Booking for Customers",
    summary: "A repeatable customer intake checklist for collecting trip details and confirming a booking request.",
    readTime: 4,
    updatedAt: "2026-10-09",
    keywords: ["customer", "trip details", "workflow", "booking request"],
    quickAnswer: "Start by recording the customer's requested journey and passenger details, confirm them before submission, and communicate availability and final status exactly as shown in the authorized system.",
    sections: [
      { heading: "Collect the journey request", paragraphs: ["Ask for origin, destination, journey date, preferred train or time, class, boarding point, and any reasonable alternatives the customer would accept."] },
      { heading: "Confirm passenger information", paragraphs: ["Collect only the information required by the authorized booking workflow. Read the details back for confirmation and handle personal data carefully."] },
      { heading: "Check options and explain them", paragraphs: ["Present the available options and their displayed conditions. Availability and price can change before a booking is completed."] },
      { heading: "Close the loop", paragraphs: ["After the attempt, give the customer the actual confirmed status and reference. If it did not complete, describe the next step indicated by the system."] },
    ],
  },
  {
    slug: "mistakes-new-railway-agents-avoid",
    category: "Business Tips",
    title: "Common Mistakes New Railway Agents Should Avoid",
    summary: "Practical service and security habits that help prevent misunderstandings during customer support.",
    readTime: 4,
    updatedAt: "2026-10-09",
    keywords: ["new agent", "mistakes", "security", "customer service"],
    quickAnswer: "Verify current provider terms, confirm customer details, protect account credentials, and communicate only outcomes confirmed by the booking system.",
    sections: [
      { heading: "Do not rely on outdated rules", paragraphs: ["Old screenshots, social posts, and forwarded messages may be incomplete. Check the current official source whenever policy or eligibility matters."] },
      { heading: "Do not promise what the system has not confirmed", paragraphs: ["Availability, payment, and refunds can remain uncertain while a transaction is processing. Set clear expectations and wait for a confirmed status."] },
      { heading: "Keep credentials private", paragraphs: ["Never disclose passwords or one-time codes. Use secure devices and follow the provider's account security instructions."] },
      { heading: "Keep customer communication organized", paragraphs: ["Confirm instructions, share references, and explain next steps in plain language. This reduces confusion when a booking needs follow-up."] },
    ],
  },
  {
    slug: "waitlist-rac-confirmed-tickets",
    category: "Booking",
    title: "Understanding Waitlist, RAC and Confirmed Tickets",
    summary: "A plain-language overview of common status labels and why customers should check the final booking status.",
    readTime: 4,
    updatedAt: "2026-10-09",
    keywords: ["waitlisted", "rac", "confirmed", "status"],
    quickAnswer: "These labels indicate different booking statuses. Explain the status shown for the specific ticket and verify current travel and charting rules through official sources before advising what it means for a journey.",
    sections: [
      { heading: "Read the status on the ticket", paragraphs: ["A confirmed status, a reservation-against-cancellation status, and a waitlist status are not interchangeable. Refer to the exact status and any related details shown on the booking."] },
      { heading: "Check current official guidance", paragraphs: ["Travel eligibility and status handling can depend on current rules and booking context. Use official railway information for advice about a specific ticket."] },
      { heading: "Explain uncertainty clearly", paragraphs: ["A status can change, and a future outcome should not be promised. Tell the customer when and where to check for the latest status."] },
      { heading: "Before the journey", paragraphs: ["Ask the customer to verify the final ticket status and relevant instructions through the official channel before travelling."] },
    ],
  },
  {
    slug: "handle-customer-booking-queries",
    category: "Business Tips",
    title: "How to Handle Customer Booking Queries",
    summary: "A simple framework for understanding a customer's issue, checking facts, and giving a useful next step.",
    readTime: 4,
    updatedAt: "2026-10-09",
    keywords: ["support", "customer questions", "communication", "help"],
    quickAnswer: "Clarify the customer's question, verify the relevant booking or current official information, explain what is known, and give a specific next step without guessing.",
    sections: [
      { heading: "Listen and clarify", paragraphs: ["Ask what the customer is trying to do and what message or status they see. Confirm key details without requesting unnecessary sensitive information."] },
      { heading: "Check before answering", paragraphs: ["Use the booking record or current official source relevant to the question. If you cannot verify a fee, rule, or timeline, say so and help the customer find the right source."] },
      { heading: "Give a clear next step", paragraphs: ["Use short, direct language. Explain what the customer can do next, which reference to keep, and where to follow up if the issue continues."] },
      { heading: "Close with a record", paragraphs: ["Note the query and the guidance given using your normal secure process. This helps maintain continuity if the customer returns."] },
    ],
  },
];

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
