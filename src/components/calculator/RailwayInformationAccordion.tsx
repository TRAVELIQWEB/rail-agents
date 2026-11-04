"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, BookOpen } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How is the 60-day ARP calculated?",
    answer:
      "Under Indian Railways rules, general reservations open at 8:00 AM IST exactly 60 calendar days before departure from the train's originating station, excluding the journey date itself (Booking Date = Journey Date − 60 Days).",
  },
  {
    question: "When does Tatkal booking open?",
    answer:
      "Tatkal opens exactly 1 day before the train leaves its originating station: AC classes (1A, 2A, 3A, 3E, CC, EC) open at 10:00 AM IST, and Non-AC classes (SL, 2S) open at 11:00 AM IST.",
  },
  {
    question: "What are authorised agent booking restrictions?",
    answer:
      "Authorised IRCTC agents cannot book during initial rush periods: restricted during 8:00–8:10 AM for General opening, and during 10:00–10:30 AM (AC) and 11:00–11:30 AM (Non-AC) for Tatkal opening.",
  },
  {
    question: "Do some trains have a shorter ARP?",
    answer:
      "Yes, certain notified short-distance intercity expresses or special trains may have shorter designated reservation periods (such as 30 days). Standard 60 days applies to all other trains.",
  },
  {
    question: "Why does the originating station matter?",
    answer:
      "Booking dates are always determined by the date the train departs from its originating station. If a multi-day train starts earlier than your boarding date, your booking window opens based on the origin departure date.",
  },
];

export function RailwayInformationAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-6">
      {/* 5. IMPORTANT BOOKING RULES */}
      <section aria-labelledby="important-booking-rules-heading">
        <div className="rounded-xl bg-white p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-[#ede5db] space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <BookOpen className="h-4 w-4 text-orange-600" />
            <h3
              id="important-booking-rules-heading"
              className="text-xs font-bold uppercase tracking-wider text-stone-900"
            >
              Important Booking Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#faf8f5] border border-stone-200">
              <strong className="block text-stone-900 font-extrabold mb-1">
                1. Standard 60-Day ARP
              </strong>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Reservations open at <strong>8:00 AM IST</strong> exactly 60 calendar days before departure, excluding the journey date.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/90">
              <div className="flex items-center justify-between mb-1">
                <strong className="block text-amber-950 font-extrabold">
                  2. Tatkal Timings &amp; Classes
                </strong>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900">1 Day Prior</span>
              </div>
              <p className="text-amber-900 text-[11px] leading-relaxed">
                • <strong>AC (10:00 AM IST):</strong> 1A, 2A, 3A, 3E, CC, EC<br />
                • <strong>Non-AC (11:00 AM IST):</strong> SL, 2S
              </p>
            </div>

            <div className="p-3 rounded-lg bg-orange-50/70 border border-orange-200/90">
              <div className="flex items-center justify-between mb-1">
                <strong className="block text-orange-950 font-extrabold">
                  3. Authorised Agent Restrictions
                </strong>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-200/80 text-orange-900">Official</span>
              </div>
              <p className="text-orange-900 text-[11px] leading-relaxed">
                • <strong>General Opening:</strong> Restricted 8:00–8:10 AM<br />
                • <strong>AC Tatkal:</strong> Restricted 10:00–10:30 AM<br />
                • <strong>Non-AC Tatkal:</strong> Restricted 11:00–11:30 AM
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#faf8f5] border border-stone-200">
              <strong className="block text-stone-900 font-extrabold mb-1">
                4. Origin Station Rule
              </strong>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Booking opens based on when the train leaves its first originating terminal, not an intermediate boarding stop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <section aria-labelledby="faq-heading">
        <div className="rounded-xl bg-white p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-[#ede5db] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <HelpCircle className="h-4 w-4 text-orange-600" />
            <h3
              id="faq-heading"
              className="text-xs font-bold uppercase tracking-wider text-stone-900"
            >
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-lg border border-stone-200 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full text-left px-3.5 py-2.5 bg-[#faf8f5] hover:bg-stone-100/80 flex items-center justify-between gap-3 text-xs font-bold text-stone-900 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-stone-500 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-orange-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-3.5 text-xs text-stone-600 bg-white leading-relaxed border-t border-stone-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
