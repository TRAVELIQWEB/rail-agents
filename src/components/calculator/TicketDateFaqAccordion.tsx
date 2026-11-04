"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface TicketDateFaqAccordionProps {
  items: FaqItem[];
}

export function TicketDateFaqAccordion({ items }: TicketDateFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="divide-y divide-[#ede1d3] rounded-2xl border border-[#ede1d3] bg-[#fffcf8] shadow-[0_4px_20px_rgba(180,140,100,0.06)] overflow-hidden">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const buttonId = `ticket-date-faq-btn-${idx}`;
        const panelId = `ticket-date-faq-panel-${idx}`;

        return (
          <div key={item.question} className="transition-colors duration-200">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(idx)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 text-left text-xs sm:text-sm font-bold transition-all duration-200 ease-out cursor-pointer hover:bg-[#faf5ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 ${
                  isOpen ? "text-orange-950 bg-[#faf5ee]" : "text-stone-800"
                }`}
              >
                <span className="leading-snug">{item.question}</span>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 shrink-0 ${
                    isOpen
                      ? "bg-orange-500 text-white shadow-xs rotate-180"
                      : "bg-[#f5ede3] text-stone-500"
                  }`}
                >
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </button>
            </h3>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 text-xs sm:text-[13px] text-stone-600 leading-relaxed bg-[#faf5ee]/60 border-t border-[#f4e9dd]/60 animate-in fade-in duration-200 motion-reduce:animate-none"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
