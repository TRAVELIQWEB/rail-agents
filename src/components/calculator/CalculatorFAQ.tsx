"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "How is the payment gateway charge calculated?",
    a: "Payment gateway charges apply to the combined ticket fare and IRCTC convenience fee: 0.75% for amounts up to and including ₹2,000, and 1.00% for amounts exceeding ₹2,000, accurately rounded to two decimal places.",
  },
  {
    q: "What is the maximum number of passengers allowed?",
    a: "Under Indian Railways general quota rules, a maximum of 6 passengers (adults and children combined) can be booked on a single ticket. The calculator validates this limit live.",
  },
  {
    q: "Is the printed estimate a confirmed railway ticket?",
    a: "No. The printed slip is a customer fare quotation to provide a clear, itemized breakdown before booking. A confirmed railway journey requires actual PRS booking and valid PNR generation.",
  },
  {
    q: "How can I register as an IRCTC agent?",
    a: "You can become an authorized IRCTC train ticket agent by registering through recognized principal service providers with valid KYC documents, commercial PAN, and digital signature certificates.",
  },
];

export function CalculatorFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="divide-y divide-[#ede1d3] rounded-2xl border border-[#ede1d3] bg-[#fffcf8] shadow-[0_4px_20px_rgba(180,140,100,0.06)] overflow-hidden">
      {FAQS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="transition-colors duration-200">
            <button
              type="button"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 text-left text-xs sm:text-sm font-bold transition-all duration-200 ease-out cursor-pointer hover:bg-[#faf5ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 ${
                isOpen ? "text-orange-950 bg-[#faf5ee]" : "text-stone-800"
              }`}
            >
              <span className="leading-snug">{item.q}</span>
              <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 shrink-0 ${isOpen ? "bg-orange-500 text-white shadow-xs rotate-180" : "bg-[#f5ede3] text-stone-500"}`}>
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 text-xs sm:text-[13px] text-stone-600 leading-relaxed bg-[#faf5ee]/60 border-t border-[#f4e9dd]/60 animate-in fade-in duration-200 motion-reduce:animate-none">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
