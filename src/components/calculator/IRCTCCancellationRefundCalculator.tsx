"use client";

import { useEffect, useRef } from "react";
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Clock,
  HelpCircle,
  Info,
  Printer,
  RotateCcw,
  ShieldCheck,
  TrainFront,
} from "lucide-react";
import { initializeIRCTCCalculator } from "@/lib/irctc-cancellation-calculator";

const fieldClassName =
  "mt-1.5 h-9 w-full min-w-0 rounded-xl border border-stone-200 bg-white px-3 type-caption type-body-small font-semibold text-stone-900 shadow-2xs outline-none transition-all placeholder:text-stone-400 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200";
const quietButtonClassName =
  "inline-flex min-h-7.5 sm:min-h-8 items-center justify-center rounded-lg border border-stone-200 bg-white px-2.5 py-1 type-caption font-bold text-stone-700 shadow-2xs transition-all hover:border-orange-300 hover:bg-[#fff9f3] hover:text-orange-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 cursor-pointer";
const choiceButtonClassName =
  "relative flex flex-col justify-center min-h-[58px] rounded-2xl border border-stone-200 bg-white p-3 text-left transition-all hover:border-orange-300 hover:bg-[#fffdfa] hover:shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 cursor-pointer";

function BlockHeader({
  step,
  title,
  question,
}: {
  step: string;
  title: string;
  question: string;
}) {
  return (
    <div className="mb-2.5">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="type-caption flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f36b21] text-white font-black shadow-2xs">
          {step}
        </span>
        <h3 className="type-h3  tracking-tight text-[#0f2747]">
          {title}
        </h3>
        <span className="type-caption  font-medium text-stone-500">{question}</span>
      </div>
    </div>
  );
}

function PassengerChoices({
  kind,
  label,
  helper,
}: {
  kind: "total" | "cancel";
  label: string;
  helper: string;
}) {
  const className =
    kind === "total" ? "total-pax-btn" : "cancel-pax-btn";
  const dataName = kind === "total" ? "data-totalpax" : "data-cancelpax";
  const inputId =
    kind === "total" ? "totalPassengersInput" : "cancelPassengersInput";

  return (
    <fieldset className="min-w-0">
      <legend className="type-caption flex flex-wrap items-center justify-between gap-1 font-bold text-stone-800">
        <span>{label}</span>
        <span className="type-caption  font-normal text-stone-400">{helper}</span>
      </legend>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {[1, 2, 3, 4, 5, 6].map((count) => (
          <button
            key={count}
            type="button"
            {...{ [dataName]: count }}
            className={`type-button ${className} inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white p-0 text-center font-bold text-stone-700 shadow-2xs transition-all hover:border-orange-300 hover:bg-[#fff9f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 cursor-pointer`}
            aria-label={`${label}: ${count}`}
          >
            {count}
          </button>
        ))}
        <label className="type-label sr-only" htmlFor={inputId}>
          {label}, enter a number from 1 to 12
        </label>
        <input
          id={inputId}
          type="number"
          min="1"
          max="12"
          placeholder="Qty"
          className={`type-input ${fieldClassName} mt-0 h-9 w-14 px-1.5 text-center font-bold`}
        />
      </div>
    </fieldset>
  );
}

export function IRCTCCancellationRefundCalculator() {
  const calculatorRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = calculatorRootRef.current;
    if (!root) return;
    const cleanup = initializeIRCTCCalculator(root);
    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <div
      className="refund-calculator pb-12 text-slate-800"
      ref={calculatorRootRef}
    >
      <style>{`
        .refund-calculator {
          background:
            radial-gradient(ellipse at 85% 5%, rgb(255 237 213 / 35%), transparent 24rem),
            linear-gradient(180deg, #fffdfa 0%, #faf6f0 55%, #fffdfa 100%);
        }
        @media (min-width: 1024px) {
          .refund-calculator #calculatorLayout {
            grid-template-columns: minmax(0, 1.2fr) minmax(320px, .8fr);
          }
        }
        .refund-calculator button { font: inherit; }
        .refund-calculator .calculator-panel {
          position: relative;
          overflow: hidden;
          border: 1px solid #ebd9c7;
          border-radius: 1.25rem;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(180, 140, 100, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }
        .refund-calculator .active-card {
          border-color: #F36B21 !important;
          background: #fff7ed !important;
          color: #9a3412 !important;
          font-weight: 700 !important;
          box-shadow:
            inset 0 1px 1px rgb(255 255 255 / 80%),
            0 0 0 2px rgb(243 107 33 / 25%),
            0 4px 12px rgb(243 107 33 / 10%) !important;
        }
        .refund-calculator .active-card svg {
          color: #ea580c !important;
        }
        .refund-calculator .active-pill {
          border-color: #F36B21 !important;
          background: #F36B21 !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          box-shadow: 0 2px 6px rgba(243, 107, 33, 0.3) !important;
        }
        .refund-calculator .active-green-pill {
          border-color: #16a34a !important;
          background: #16a34a !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.3) !important;
        }
        .refund-calculator button:not(:disabled) {
          transition:
            color 160ms ease,
            background-color 160ms ease,
            border-color 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
        }
        .refund-calculator button:not(:disabled):active {
          transform: translateY(1px);
        }
        .refund-calculator input:not([type="checkbox"]) {
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }
        .refund-calculator #regimeActualBtn,
        .refund-calculator #regimeRumoredBtn {
          min-height: 2rem;
          border: 1px solid #e4d5c4;
          border-radius: .5rem;
          background: #fffdfa;
          color: #0f2747;
          padding: .35rem .75rem;
          font-size: .75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 180ms ease;
          max-width: 100%;
          white-space: normal;
          text-align: center;
          word-break: break-word;
        }
        .refund-calculator #regimeActualBtn.active,
        .refund-calculator #regimeRumoredBtn.active {
          border-color: #F36B21;
          background: #fff7ed;
          color: #9a3412;
        }
        .refund-calculator #togglePgBtn,
        .refund-calculator #toggleRoundingBtn,
        .refund-calculator #toggleRuleRegimeBtn {
          min-height: 1.85rem;
          border: 1px solid #e4d5c4;
          border-radius: .5rem;
          background: #fffdfa;
          color: #0f2747;
          padding: .25rem .65rem;
          font-size: .75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 180ms ease;
          max-width: 100%;
          white-space: normal;
          text-align: left;
          word-break: break-word;
        }
        .refund-calculator #togglePgBtn:hover,
        .refund-calculator #toggleRoundingBtn:hover,
        .refund-calculator #toggleRuleRegimeBtn:hover {
          border-color: #F36B21;
          background: #fff7ed;
          color: #9a3412;
        }
        .refund-calculator #receiptModeTitle,
        .refund-calculator #ruleExplanationText,
        .refund-calculator #smartTipText,
        .refund-calculator #regimeComparisonNote {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .refund-calculator .refund-line {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: .5rem;
          padding: .4rem 0;
          border-bottom: 1px solid #f2e7db;
          font-size: .75rem;
          line-height: 1.35;
        }
        .refund-calculator .refund-line > :first-child {
          min-width: 0;
          word-break: break-word;
        }
        .refund-calculator .refund-line > :last-child {
          flex-shrink: 0;
          text-align: right;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .refund-calculator .refund-line:last-child { border-bottom: 0; }
        .refund-calculator input[type="checkbox"] {
          width: 1.125rem;
          height: 1.125rem;
          accent-color: #F36B21;
          cursor: pointer;
        }
        .refund-calculator #refundResults > section {
          border: 1px solid #ede1d3;
          border-radius: 1.25rem;
          box-shadow: 0 8px 30px rgba(15, 39, 71, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .refund-calculator #refundResults > section > div:first-child {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0b2240 0%, #0f2747 65%, #183b63 100%);
        }
        .refund-calculator #receiptPerPaxFormulaBadge {
          border: 1px solid #fed7aa;
          background: #fff7ed;
          color: #9a3412;
          font-weight: 700;
        }
        .refund-calculator #regimeComparisonNote {
          border: 1px solid #fed7aa;
          border-radius: .75rem;
          background: #fff8f0;
          padding: .75rem;
        }
        .refund-calculator #activeTestBadge {
          display: inline-flex;
          align-items: center;
          border: 1px solid #fed7aa;
          border-radius: 999px;
          background: #fff7ed;
          padding: .35rem .85rem;
          color: #9a3412;
          font-weight: 700;
        }
        .refund-calculator #topSourceSummaryBadge {
          border-radius: .75rem;
          border: 1px solid #fed7aa;
          background: #fff7ed;
          padding: .5rem .85rem;
          color: #9a3412;
          font-weight: 700;
        }
        .refund-calculator #personalPaymentSubBar,
        .refund-calculator #agentPgSubBar {
          border-color: #eeddcc;
          background: linear-gradient(135deg, #fff7ed 0%, #faf5ef 100%);
        }
        .refund-calculator #refundResults .refund-line > :first-child {
          color: #475569;
        }
        .refund-calculator .refund-line.font-bold,
        .refund-calculator .refund-line.font-semibold {
          color: #0f2747;
        }
        @media (max-width: 639px) {
          .refund-calculator .refund-line {
            align-items: flex-start;
            font-size: .75rem;
          }
          .refund-calculator .refund-line > :last-child {
            min-width: 0;
            flex-shrink: 1;
            overflow-wrap: anywhere;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1360px] px-3 pt-3 sm:px-6">
        
        {/* Friendly Quick-Start Guide Banner for First-Time Users */}
        <section className="mb-4 rounded-2xl border border-orange-200/80 bg-gradient-to-r from-[#fff9f3] via-[#fffbf7] to-[#fff7f0] p-3.5 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="type-caption flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-white font-black shadow-xs">
                  ✓
                </span>
                <h2 className="type-section-compact  text-[#0f2747]">
                  Calculate Your Railway Refund in 3 Simple Steps
                </h2>
              </div>
              <p className="type-body-small mt-1 text-stone-600 sm:max-w-2xl">
                Find out your exact net refund to bank, PRS cancellation cuts, clerkage fees, and GST before cancelling your ticket.
              </p>
            </div>

            {/* Subtle Rule Badges & Settings */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                id="toggleRuleRegimeBtn"
                className="type-button inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 font-bold text-[#0f2747] shadow-2xs hover:border-orange-300"
                title="Click to toggle between Regular trains and Vande Bharat Sleeper rules"
              >
                <TrainFront aria-hidden="true" className="h-3 w-3 text-orange-600" />
                <span>Rules:</span>
                <span id="ruleRegimeBadge" className="text-orange-950 font-bold">Regular trains (48h / 12h / 4h)</span>
              </button>
              <button
                type="button"
                id="toggleRoundingBtn"
                className="type-button inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 font-bold text-[#0f2747] shadow-2xs hover:border-orange-300"
                title="Indian Railways rounds final refund to next ₹5"
              >
                <span>₹5 Rounding:</span>
                <span id="roundingStateBadge" className="text-orange-950 font-bold">On</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main 2-Column Grid */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.38fr)_minmax(340px,0.85fr)] lg:gap-5">
          <div className="min-w-0 space-y-4">
            
            {/* Step 1: Ticket Details Panel */}
            <section className="calculator-panel min-w-0 bg-white p-4 sm:p-5">
              
              {/* 01 Booking Source */}
              <fieldset>
                <BlockHeader
                  step="01"
                  title="Booking Source"
                  question="How did you book your ticket?"
                />
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    data-source="PERSONAL"
                    className={`type-button source-btn ${choiceButtonClassName}`}
                  >
                    <span className="type-caption block font-bold text-[#0f2747] leading-snug">Personal IRCTC ID</span>
                    <span className="type-caption mt-0.5 block text-stone-500 font-medium leading-tight">Direct online ID</span>
                  </button>
                  <button
                    type="button"
                    data-source="AGENT"
                    className={`type-button source-btn ${choiceButtonClassName}`}
                  >
                    <span className="type-caption block font-bold text-[#0f2747] leading-snug">Agent ID</span>
                    <span className="type-caption mt-0.5 block text-stone-500 font-medium leading-tight">Authorized agent</span>
                  </button>
                  <button
                    type="button"
                    data-source="COUNTER"
                    className={`type-button source-btn ${choiceButtonClassName}`}
                  >
                    <span className="type-caption block font-bold text-[#0f2747] leading-snug">Railway Counter</span>
                    <span className="type-caption mt-0.5 block text-stone-500 font-medium leading-tight">PRS window ticket</span>
                  </button>
                </div>
              </fieldset>

              {/* Conditional Personal Payment Sub-bar */}
              <div
                id="personalPaymentSubBar"
                className="type-caption mt-2.5 hidden flex flex-wrap items-center justify-between gap-2 rounded-xl border border-orange-200/70 bg-orange-50/40 px-3.5 py-2 "
              >
                <span className="font-bold text-[#0f2747]">Payment method used:</span>
                <div className="flex gap-1.5">
                  <button type="button" data-pay="CARD" className={`type-button pay-btn ${quietButtonClassName}`}>Card / NetBanking</button>
                  <button type="button" data-pay="UPI" className={`type-button pay-btn ${quietButtonClassName}`}>BHIM / UPI</button>
                </div>
              </div>

              {/* Conditional Agent PG Sub-bar */}
              <div
                id="agentPgSubBar"
                className="type-caption mt-2.5 hidden flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200/80 bg-sky-50/50 px-3.5 py-2 "
              >
                <p id="agentPgDescription" className="type-body-small min-w-0 flex-1 leading-relaxed text-slate-700">
                  Agent PG fee: 0.75% up to ₹2,000, 1% above ₹2,000.
                </p>
                <button type="button" id="togglePgBtn" className={`type-button ${quietButtonClassName}`}>Payment gateway: On</button>
              </div>

              {/* 02 Travel Class (Row 1 — Full Width) */}
              <fieldset className="mt-4 border-t border-stone-100 pt-3.5 min-w-0">
                <BlockHeader
                  step="02"
                  title="Travel Class"
                  question="Class determines flat deduction"
                />
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    ["SL", "Sleeper (SL)", "Non-AC"],
                    ["3AC", "3AC / CC / 3E", "AC 3-Tier"],
                    ["2AC", "2AC / 1st", "AC 2-Tier"],
                    ["1AC", "1AC / Exec", "First AC"],
                    ["2S", "2S (Sitting)", "Second Sitting"],
                  ].map(([value, label, sub]) => (
                    <button
                      key={value}
                      type="button"
                      data-class={value}
                      className={`type-button class-btn ${choiceButtonClassName}`}
                    >
                      <span className="type-caption block font-bold text-[#0f2747] leading-snug">{label}</span>
                      <span className="type-caption mt-0.5 block text-stone-500 font-medium leading-tight">{sub}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* 03 Ticket Status (Row 2 — Full Width) */}
              <fieldset className="mt-4 border-t border-stone-100 pt-3.5 min-w-0">
                <BlockHeader
                  step="03"
                  title="Ticket status at cancellation"
                  question="Status affects refund %"
                />
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    ["CNF", "CNF (Confirmed)", "Guaranteed berth"],
                    ["RAC", "RAC", "Half berth"],
                    ["WL", "WL (Waitlist)", "Clerkage cut only"],
                    ["TQ_CNF", "Tatkal CNF", "0% refund"],
                    ["TQWL", "Tatkal WL", "Clerkage cut only"],
                    ["TRAIN_CANCELLED", "Train Cancelled", "100% full refund"],
                  ].map(([value, label, sub]) => (
                    <button
                      key={value}
                      type="button"
                      data-status={value}
                      className={`type-button status-btn ${choiceButtonClassName}`}
                    >
                      <span className="type-caption block font-bold text-[#0f2747] leading-snug">{label}</span>
                      <span className="type-caption mt-0.5 block text-stone-500 font-medium leading-tight">{sub}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Collapsible Rule Regime Option for Advanced Users */}
              <div className="mt-4 border-t border-stone-100 pt-3">
                <details className="group">
                  <summary className="type-caption flex cursor-pointer items-center justify-between font-bold text-slate-500 hover:text-orange-600">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle aria-hidden="true" className="h-3 w-3 text-slate-400" />
                      <span>Advanced: Cancellation Rule Regime (Regular vs Vande Bharat Sleeper)</span>
                    </span>
                    <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition group-open:rotate-180" />
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-1.5 pt-1">
                    <button type="button" id="regimeActualBtn" className="type-button regime-choice">Regular trains · 48h / 12h / 4h</button>
                    <button type="button" id="regimeRumoredBtn" className="type-button regime-choice">Vande Bharat Sleeper · 72h / 8h</button>
                  </div>
                </details>
              </div>
            </section>

            {/* Step 2: Cancellation Timing Panel */}
            <section className="calculator-panel min-w-0 bg-white p-4 sm:p-5">
              <BlockHeader
                step="04"
                title="Cancellation Timing"
                question="When are you cancelling relative to train departure?"
              />

              {/* Method 1: Quick Slabs */}
              <div>
                <p id="slabSectionTitleLabel" className="type-body sr-only">
                  Quick time bands · Regular trains
                </p>

                <div id="quickTimeBandOptions" className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                  {[
                    ["80", "slabBtn1Title", "> 48 hours", "slabBtn1Sub", "Flat deduction"],
                    ["14.83", "slabBtn2Title", "48h to 12h", "slabBtn2Sub", "25% cut"],
                    ["9", "slabBtn3Title", "12h to 4h", "slabBtn3Sub", "50% cut"],
                    ["2", "slabBtn4Title", "Chart prepared / < 4h", "slabBtn4Sub", "No CNF refund"],
                    ["0.25", null, "< 30 minutes", null, "0% refund (RAC/WL)"],
                  ].map(([hours, titleId, title, subId, sub]) => (
                    <button
                      key={hours as string}
                      type="button"
                      data-time-band={hours as string}
                      className={`type-button slab-btn ${choiceButtonClassName}`}
                    >
                      <span id={(titleId as string) || undefined} className="type-caption block font-bold text-[#0f2747] leading-snug">
                        {title as string}
                      </span>
                      <span id={(subId as string) || undefined} className="type-caption mt-0.5 block text-stone-500 font-medium leading-tight">
                        {sub as string}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method 2: Or Journey Datetime Inputs */}
              <div className="mt-4 border-t border-dashed border-stone-200 pt-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="type-caption  font-bold text-slate-700">Or calculate from exact Journey Dates &amp; Times</span>
                </div>

                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <label htmlFor="cancelDateTime" className="type-label  font-bold text-slate-800">
                        Cancellation date &amp; time
                      </label>
                      <button
                        type="button"
                        id="setNowBtn"
                        className="type-button  font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                      >
                        Use current time
                      </button>
                    </div>
                    <input id="cancelDateTime" type="datetime-local" className={`type-input ${fieldClassName}`} />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="departureDateTime" className="type-label  font-bold text-slate-800">
                      Train departure date &amp; time
                    </label>
                    <input id="departureDateTime" type="datetime-local" className={`type-input ${fieldClassName}`} />
                  </div>
                </div>

                <p
                  id="calculatedGapLabel"
                  className="type-body-small mt-2.5 rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-2 font-semibold text-slate-600"
                  aria-live="polite"
                >
                  Choose a quick time band above or enter both dates to calculate the remaining hours.
                </p>

                <label
                  htmlFor="chartPreparedCheckbox"
                  className="type-label mt-2.5 flex cursor-pointer items-start gap-2.5 rounded-xl border border-stone-200/80 bg-stone-50/40 p-2.5 text-slate-700 transition hover:bg-stone-50"
                >
                  <input id="chartPreparedCheckbox" type="checkbox" className="type-input mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-900">First reservation chart was already prepared</span>
                    <p className="type-body  text-stone-500">Check this if the train reservation chart was finalized before you submitted the cancellation.</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Step 3: Passengers & Fare Panel */}
            <section className="calculator-panel min-w-0 bg-white p-4 sm:p-5">
              <BlockHeader
                step="05"
                title="Passengers &amp; Paid Fare"
                question="How many passengers and what is the total fare paid?"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <PassengerChoices kind="total" label="Booked passengers on ticket" helper="Total persons on ticket" />
                <PassengerChoices kind="cancel" label="Cancelling passengers" helper="Persons being cancelled" />
              </div>

              {/* Fare Mode Selector */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
                <span className="type-caption  font-bold text-slate-800">Fare entry mode:</span>
                <div className="flex gap-1.5">
                  <button type="button" id="modeGrandTotalBtn" className={`type-button ${quietButtonClassName}`}>Total paid amount</button>
                  <button type="button" id="modePureFareBtn" className={`type-button ${quietButtonClassName}`}>Railway pure fare only</button>
                </div>
              </div>

              {/* Total Paid Amount Input */}
              <div id="grandTotalInputPanel" className="mt-2">
                <label htmlFor="enteredGrandTotalInput" className="type-label  font-bold text-slate-800">
                  Total amount paid for ticket (₹)
                </label>
                <div className="relative mt-1.5">
                  <span className="type-body-small pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-400 ">
                    ₹
                  </span>
                  <input
                    id="enteredGrandTotalInput"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1450 (Total amount on booking SMS or ticket PDF)"
                    className={`type-input ${fieldClassName} mt-0 h-11 pl-8 font-bold text-[#0f2747]`}
                  />
                </div>
                <p className="type-body-small mt-1 text-stone-500">
                  Enter the final total amount shown on your ticket SMS or PDF receipt.
                </p>
              </div>

              {/* Pure Fare Input Panel (Advanced) */}
              <div id="pureFareInputPanel" className="mt-2 hidden grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="pureTotalFareInput" className="type-label  font-bold text-slate-800">Total railway fare (incl. GST)</label>
                  <input id="pureTotalFareInput" type="number" min="0" step="1" placeholder="Total fare" className={`type-input ${fieldClassName}`} />
                </div>
                <div>
                  <label htmlFor="purePerPaxFareInput" className="type-label  font-bold text-slate-800">Railway fare per passenger</label>
                  <input id="purePerPaxFareInput" type="number" min="0" step="1" placeholder="Per pax fare" className={`type-input ${fieldClassName}`} />
                </div>
              </div>

              {/* Live Fare Breakdown Strip (kept clean) */}
              <div className="type-caption mt-3.5 grid gap-1.5 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 text-slate-600 sm:grid-cols-2">
                <p className="type-body">Base railway fare: <strong id="stripPureTotalFare" className="text-slate-900">₹0.00</strong></p>
                <p className="type-body">Fare per passenger: <strong id="stripPurePerPaxFare" className="text-slate-900">₹0.00</strong></p>
                <p id="topSourceSummaryBadge" className="type-body sm:col-span-2 ">Deductions and net refund will calculate upon clicking below.</p>
                <p id="stripPgFormulaLine" className="type-body hidden sm:col-span-2 ">Payment gateway base: <span id="stripPgBaseSum">₹0.00</span> · <span id="stripPgFormulaResult">Shown after calculation</span></p>
                <p className="type-body sm:col-span-2 ">Cancellation base before GST: <span id="stripExGstBreakdownText">₹0.00</span></p>
              </div>

              {/* Optional Extras: Catering & Insurance */}
              <div className="mt-4 grid gap-3 border-t border-stone-100 pt-3.5 sm:grid-cols-2">
                
                {/* Catering card */}
                <div className="min-w-0 rounded-xl border border-orange-200/80 bg-orange-50/30 p-3">
                  <div className="flex items-center justify-between gap-1.5">
                    <div>
                      <span className="type-caption  font-bold text-[#0f2747]">Food / Catering included?</span>
                      <p className="type-body  text-stone-500">Meals in Rajdhani, Shatabdi, Vande Bharat</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" id="catNoBtn" className={`type-button ${quietButtonClassName}`}>No</button>
                      <button type="button" id="catYesBtn" className={`type-button ${quietButtonClassName}`}>Yes</button>
                    </div>
                  </div>
                  <div id="cateringInputsArea" className="mt-2.5 hidden space-y-2 border-t border-orange-200/60 pt-2">
                    <div>
                      <label htmlFor="totalCateringInput" className="type-label  font-semibold text-slate-700">Total catering (incl. GST)</label>
                      <input id="totalCateringInput" type="number" min="0" step="1" placeholder="Total food" className={`type-input ${fieldClassName}`} />
                    </div>
                    <div>
                      <label htmlFor="perPaxCateringInput" className="type-label  font-semibold text-slate-700">Catering per passenger</label>
                      <input id="perPaxCateringInput" type="number" min="0" step="1" placeholder="Per pax" className={`type-input ${fieldClassName}`} />
                    </div>
                    <p className="type-body  text-slate-500">Excl. GST: <strong id="catExGstDisplay">₹0.00</strong> · GST: <strong id="catGstDisplay">₹0.00</strong></p>
                    <div id="cateringPresetOptions" className="flex flex-wrap gap-1">
                      {[["363", "Vande Bharat"], ["150", "₹150"], ["300", "₹300"]].map(([value, label]) => (
                        <button key={value} type="button" data-catering-preset-id={value} className={`type-button food-preset-btn ${quietButtonClassName} min-h-7 px-1.5 `}>{value === "363" ? "₹363 · " : ""}{label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Insurance card */}
                <div className="min-w-0 rounded-xl border border-sky-200/80 bg-sky-50/30 p-3">
                  <div className="flex items-center justify-between gap-1.5">
                    <div>
                      <span className="type-caption  font-bold text-[#0f2747]">Travel insurance opted?</span>
                      <p className="type-body  text-stone-500">Usually ₹0.45 per passenger</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" id="insNoBtn" className={`type-button ${quietButtonClassName}`}>No</button>
                      <button type="button" id="insYesBtn" className={`type-button ${quietButtonClassName}`}>Yes</button>
                    </div>
                  </div>
                  <div id="insuranceInputsArea" className="mt-2.5 hidden space-y-2 border-t border-sky-200/60 pt-2">
                    <div>
                      <span className="type-caption  font-semibold text-slate-700">Rate per passenger</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <div id="insurancePresetOptions" className="flex flex-wrap gap-1">
                          <button type="button" data-insurance-preset-id="0.45" className={`type-button ins-rate-btn ${quietButtonClassName} min-h-7 `}>₹0.45</button>
                          <button type="button" data-insurance-preset-id="0.35" className={`type-button ins-rate-btn ${quietButtonClassName} min-h-7 `}>₹0.35</button>
                        </div>
                        <label className="type-label sr-only" htmlFor="customInsRateInput">Custom insurance rate per passenger</label>
                        <input id="customInsRateInput" type="number" min="0" step="0.05" placeholder="Custom" className={`type-input ${fieldClassName} mt-0 h-7 w-20 `} />
                      </div>
                    </div>
                    <label htmlFor="insRefundableCheckbox" className="type-label flex items-center gap-1.5 text-slate-700">
                      <input id="insRefundableCheckbox" type="checkbox" className="type-input" />
                      Add insurance refund to total
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-5 flex flex-col gap-2.5 border-t border-stone-200 pt-4 sm:flex-row">
                <button
                  type="button"
                  id="calculateRefundBtn"
                  className="type-button inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 px-6 font-extrabold text-white shadow-md transition hover:from-orange-700 hover:to-amber-700 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 cursor-pointer"
                >
                  <Calculator aria-hidden="true" className="mr-2 h-4 w-4" />
                  <span id="calculateRefundButtonText">Calculate Exact Refund Breakdown</span>
                </button>
                <button
                  type="button"
                  id="resetCalculatorBtn"
                  className={`type-button ${quietButtonClassName} min-h-12 px-4 font-bold text-stone-600`}
                  aria-label="Reset all ticket details to their default values"
                >
                  <RotateCcw aria-hidden="true" className="mr-1.5 h-3.5 w-3.5 text-stone-500" />
                  Reset
                </button>
              </div>

              <p
                id="calculatorValidationMessage"
                className="type-body-small mt-3 hidden rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 font-bold text-rose-800 shadow-2xs"
                role="alert"
              />
            </section>
          </div>

          {/* Right Column: Dynamic Output / Receipt Sidebar */}
          <div className="min-w-0 lg:sticky lg:top-20">
            
            {/* Empty State before calculation */}
            <aside id="refundInfo" className="min-w-0">
              <section className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
                <div className="border-b border-white/10 bg-gradient-to-br from-[#0b2240] via-[#0f2747] to-[#183b63] p-4 text-white sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white shadow-xs">
                      <Calculator aria-hidden="true" className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <h2 className="type-section-compact  tracking-tight">Your Refund Summary</h2>
                      <p className="type-body  text-slate-300">Official PRS Indian Railways Rules</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <p className="type-body  font-extrabold uppercase tracking-wider text-slate-500">
                    What this calculator provides:
                  </p>
                  
                  <div className="type-caption mt-3 space-y-2.5 text-slate-700">
                    <div className="flex items-start gap-2.5 rounded-xl border border-stone-100 bg-[#fffdfa] p-2.5">
                      <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <strong className="block text-slate-900">Net Refund Credited to Bank</strong>
                        <span className="type-caption  text-slate-500">The exact money you will receive in your account.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-stone-100 bg-[#fffdfa] p-2.5">
                      <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                      <div>
                        <strong className="block text-slate-900">Railway Deductions (PRS Rules)</strong>
                        <span className="type-caption  text-slate-500">Flat clerkage fee or 25%/50% cancellation cut + GST.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-stone-100 bg-[#fffdfa] p-2.5">
                      <Info aria-hidden="true" className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
                      <div>
                        <strong className="block text-slate-900">Convenience &amp; Gateway Fees</strong>
                        <span className="type-caption  text-slate-500">Transparent view of non-refundable convenience charges.</span>
                      </div>
                    </div>
                  </div>

                  <div className="type-caption mt-4 rounded-xl border border-orange-200/80 bg-orange-50/50 p-3 text-orange-950">
                    <p className="type-body font-bold flex items-center gap-1.5">
                      <Clock aria-hidden="true" className="h-3.5 w-3.5 text-orange-600" />
                      Ready to check?
                    </p>
                    <p className="type-body-small mt-1 text-stone-600">
                      Fill the details on the left and click <strong>Calculate Exact Refund</strong> to get your itemized refund breakdown.
                    </p>
                  </div>
                </div>
              </section>
            </aside>

            {/* Calculated Results Card */}
            <aside id="refundResults" aria-live="polite" className="hidden min-w-0 space-y-3">
              <section className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
                
                {/* Header with Net Refund Display */}
                <div className="p-4 text-white sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div>
                      <p className="type-body  font-extrabold uppercase tracking-wider text-orange-200">Estimated Net Refund</p>
                      <p id="receiptModeTitle" className="type-body  text-slate-300">Ticket breakdown</p>
                    </div>
                    <span id="receiptPaxBadge" className="type-caption rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-orange-100">Ready</span>
                  </div>
                  <p id="finalNetRefundDisplay" className="type-amount mt-3 break-words font-black tracking-tight tabular-nums text-emerald-300">₹0.00</p>
                  <p id="perPaxNetRefundSub" className="type-body-small mt-0.5 text-slate-300">Net refundable amount to bank</p>
                  
                  <div className="type-caption mt-3.5 grid grid-cols-2 gap-2 border-t border-white/15 pt-3 ">
                    <div>
                      <p className="type-body  text-slate-300">Cancellation cut</p>
                      <p id="finalRailwayCutDisplay" className="type-body  font-bold tabular-nums text-rose-300">- ₹0.00</p>
                      <p id="perPaxRailwayCutSub" className="type-body  text-slate-300">₹0.00 / pax</p>
                    </div>
                    <div>
                      <p className="type-body  text-slate-300">Ticket paid</p>
                      <p id="receiptGrandTotalPaid" className="type-body  font-bold tabular-nums">₹0.00</p>
                    </div>
                  </div>
                </div>

                {/* Breakdown items */}
                <div className="type-caption p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-[#0f2747]">
                      <ShieldCheck aria-hidden="true" className="h-4 w-4 text-orange-600" />
                      <span>Refund Breakdown</span>
                    </div>
                    <span id="receiptBookingSourceTag" className="type-caption rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">Agent ID</span>
                  </div>

                  <div className="type-caption mt-2.5 divide-y divide-slate-100 ">
                    <div className="refund-line py-1.5"><span>IRCTC convenience fee</span><span id="receiptIrctcFee">- ₹0.00</span></div>
                    <div id="receiptInsuranceRow" className="refund-line py-1.5" style={{ display: "none" }}><span>Travel insurance (<span id="receiptInsStatusText">Refundable</span>)</span><span id="receiptInsuranceFee">₹0.00</span></div>
                    <div id="receiptPgBaseRow" className="refund-line py-1.5"><span>Payment gateway base</span><span id="receiptPgBaseVal">₹0.00</span></div>
                    <div id="receiptPgFeeRow" className="refund-line py-1.5"><span>PG fee · <span id="receiptPgSlabLabel">Shown</span></span><span id="receiptPgFee">- ₹0.00</span></div>
                    <div id="receiptAgentFeeRow" className="refund-line py-1.5"><span>Agent service fee</span><span id="receiptAgentFee">- ₹0.00</span></div>
                    <div className="refund-line py-1.5 font-bold text-[#0f2747]"><span>Railway fare total</span><span id="receiptPureRailwayTotal">₹0.00</span></div>
                  </div>

                  {/* PRS Deductions Section */}
                  <div className="mt-3.5 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0f2747]">PRS Deductions</span>
                      <span id="receiptPerPaxFormulaBadge" className="type-caption rounded bg-orange-50 px-1.5 py-0.5 font-bold text-orange-900 border border-orange-200">Rule Applied</span>
                    </div>
                    <div className="type-caption mt-1.5 divide-y divide-slate-100 ">
                      <div className="refund-line py-1"><span>Cancelling pax (<span id="receiptCancelPaxCount">1</span>) fare</span><span id="receiptCancellingTrainFare">₹0.00</span></div>
                      <div id="receiptCateringRow" className="refund-line py-1"><span>Catering for cancelling pax</span><span id="receiptCancellingCatering">₹0.00</span></div>
                      <div id="receiptExGstBaseRow" className="refund-line py-1"><span>Cancellation base excl. GST</span><span id="receiptExGstBaseVal">₹0.00</span></div>
                      <div className="refund-line py-1"><span id="receiptBaseCancelCutLabel">Base cancellation charge</span><span id="receiptBaseCancelCut">- ₹0.00</span></div>
                      <div className="refund-line py-1"><span>GST on cancellation</span><span id="receiptGstCancelCut">- ₹0.00</span></div>
                      <div className="refund-line py-1"><span>Rounding adjustment</span><span id="receiptRoundingCut">- ₹0.00</span></div>
                      <div className="refund-line py-1 font-bold text-rose-700"><span>Total railway cut</span><span id="receiptTotalRailwayCut">- ₹0.00</span></div>
                    </div>
                  </div>

                  {/* Final Net Calculation Box */}
                  <div className="type-caption mt-3.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 ">
                    <div className="refund-line py-0.5"><span>Fare + catering</span><span id="receiptNetTrainRefund">₹0.00</span></div>
                    <div className="refund-line py-0.5"><span>Cancellation cut</span><span id="receiptNetFoodRefund">- ₹0.00</span></div>
                    <div id="receiptNetInsRefundRow" className="refund-line py-0.5"><span>Insurance refund</span><span id="receiptNetInsRefund">+ ₹0.00</span></div>
                    <div className="type-body-small refund-line py-1 font-black text-[#0f2747] border-t border-slate-200 mt-1"><span>Estimated bank refund</span><span id="receiptFinalBankRefund" className="text-emerald-700">₹0.00</span></div>
                  </div>

                  {/* Rule explanation alert */}
                  <div id="ruleExplanationAlert" className="type-caption mt-3.5 rounded-xl border border-orange-200/80 bg-orange-50/60 p-3 ">
                    <p className="type-body font-bold text-[#0f2747]">Cancellation rule applicable:</p>
                    <p id="ruleExplanationText" className="type-body mt-1 text-slate-700" />
                    <p id="smartTipText" className="type-body mt-1 text-slate-700" />
                    <div id="regimeComparisonNote" className="mt-1 text-slate-600" />
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      id="copyRefundSummaryBtn"
                      className={`type-button ${quietButtonClassName} flex-1 min-h-9 font-bold`}
                    >
                      <Clipboard aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />
                      Copy Summary
                    </button>
                    <button
                      type="button"
                      id="printRefundReportBtn"
                      className={`type-button ${quietButtonClassName} min-h-9 font-bold`}
                    >
                      <Printer aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />
                      Print
                    </button>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>

        {/* Collapsible Rules Reference & Slabs */}
        <details className="mt-6 rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
          <summary className="type-caption flex cursor-pointer list-none items-center justify-between p-3.5 font-bold text-[#0f2747] hover:text-orange-600 sm:px-5">
            <span className="flex items-center gap-2">
              <Calculator aria-hidden="true" className="h-4 w-4 text-orange-600" />
              <span>View Official Indian Railways (PRS) Cancellation Rules &amp; Slab Table</span>
            </span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-slate-400" />
          </summary>
          <div className="border-t border-slate-100 p-4 sm:p-5 overflow-x-auto">
            <table className="type-table w-full min-w-[620px] border-collapse text-left ">
              <thead>
                <tr className="border-b border-orange-100 bg-orange-50/70 text-[#0f2747]">
                  <th className="type-table p-2.5 font-bold">Cancellation timing</th>
                  <th className="type-table p-2.5 font-bold">Regular trains (48h / 12h / 4h)</th>
                  <th className="type-table p-2.5 font-bold">Vande Bharat Sleeper (72h / 8h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr><th className="type-table p-2.5 font-semibold text-slate-800">&gt; 48 hours</th><td className="type-table p-2.5">Flat per-class clerkage fee (₹60 to ₹240)</td><td className="type-table p-2.5">&gt; 72 hours: 25% cancellation charge</td></tr>
                <tr><th className="type-table p-2.5 font-semibold text-slate-800">48h to 12h</th><td className="type-table p-2.5">25% of fare (subject to minimum flat fee)</td><td className="type-table p-2.5">72h to 8h: 50% cancellation charge</td></tr>
                <tr><th className="type-table p-2.5 font-semibold text-slate-800">12h to 4h</th><td className="type-table p-2.5">50% of fare (before reservation chart preparation)</td><td className="type-table p-2.5">72h to 8h: 50% cancellation charge</td></tr>
                <tr><th className="type-table p-2.5 font-semibold text-slate-800">&lt; 4h / Chart Prepared</th><td className="type-table p-2.5">No refund for Confirmed tickets. RAC / Waitlist clerkage applies.</td><td className="type-table p-2.5">&lt; 8h or chart prepared: No refund for CNF</td></tr>
              </tbody>
            </table>
          </div>
        </details>

      </div>
    </div>
  );
}
