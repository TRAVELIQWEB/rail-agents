"use client";

import { useEffect, useRef, useState } from "react";
import {
  Calculator,
  CalendarClock,
  ChevronDown,
  Clipboard,
  Printer,
  RotateCcw,
  ShieldCheck,
  TrainFront,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { initializeIRCTCCalculator } from "@/lib/irctc-cancellation-calculator";

const fieldClassName =
  "mt-1.5 h-10 sm:h-11 w-full min-w-0 rounded-xl border border-[#e4d5c4] bg-white px-3 text-xs sm:text-sm font-semibold text-stone-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all placeholder:text-stone-400 hover:border-orange-300 focus:border-orange-500 focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_3px_rgba(249,115,22,0.18)]";
const quietButtonClassName =
  "inline-flex min-h-9 sm:min-h-10 items-center justify-center rounded-xl border border-[#e4d5c4] bg-white px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-stone-700 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all hover:border-orange-300 hover:bg-[#fff9f3] hover:text-orange-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer";
const choiceButtonClassName =
  "min-h-11 sm:min-h-12 rounded-xl border border-[#e4d5c4] bg-[#faf6f0]/70 px-3.5 py-2 sm:py-2.5 text-left text-xs sm:text-sm text-stone-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:text-stone-900 hover:shadow-[0_4px_12px_rgba(249,115,22,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer";

function SectionTitle({
  icon,
  title,
  description,
  step,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  step: string;
}) {
  return (
    <div className="mb-4 sm:mb-5 flex items-start gap-3 border-b border-[#f0e3d5] pb-3">
      <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100/70 text-orange-700 ring-1 ring-orange-200">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-900 border border-orange-200">
            Step {step}
          </span>
          <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-stone-900">
            {title}
          </h2>
        </div>
        {description ? (
          <p className="mt-0.5 text-[11px] sm:text-xs leading-relaxed text-stone-500">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PassengerChoices({
  kind,
  label,
}: {
  kind: "total" | "cancel";
  label: string;
}) {
  const className =
    kind === "total" ? "total-pax-btn" : "cancel-pax-btn";
  const dataName = kind === "total" ? "data-totalpax" : "data-cancelpax";
  const inputId =
    kind === "total" ? "totalPassengersInput" : "cancelPassengersInput";

  return (
    <fieldset className="min-w-0">
      <legend className="text-xs sm:text-sm font-bold text-stone-800">{label}</legend>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5, 6].map((count) => (
          <button
            key={count}
            type="button"
            {...{ [dataName]: count }}
            className={`${className} inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-[#e4d5c4] bg-white p-0 text-center text-xs sm:text-sm font-bold text-stone-700 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-[#fff9f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer`}
            aria-label={`${label}: ${count}`}
          >
            {count}
          </button>
        ))}
        <label className="sr-only" htmlFor={inputId}>
          {label}, enter a number
        </label>
        <input
          id={inputId}
          type="number"
          placeholder="Qty"
          className={`${fieldClassName} mt-0 h-9 sm:h-10 w-16 px-2 text-center text-xs sm:text-sm font-bold`}
        />
      </div>
    </fieldset>
  );
}

export function IRCTCCancellationRefundCalculator() {
  const calculatorRootRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState("");

  async function copyRefundSummary() {
    const root = calculatorRootRef.current;
    if (!root) return;

    const value = (id: string) => root.querySelector(`#${id}`)?.textContent?.trim() ?? "";
    const breakdown = [...root.querySelectorAll("#refundResults .refund-line")]
      .map((line) => line.textContent?.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join("\n");
    const summary = [
      "IRCTC Cancellation & Refund Estimate",
      `Estimated refund: ${value("finalNetRefundDisplay")}`,
      `Ticket amount paid: ${value("receiptGrandTotalPaid")}`,
      `Cancellation charges: ${value("finalRailwayCutDisplay")}`,
      "",
      "Refund breakdown:",
      breakdown,
      "",
      value("ruleExplanationText"),
    ]
      .filter((line) => line !== "")
      .join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("Refund summary copied.");
    } catch (error) {
      console.error("Unable to copy the refund summary.", error);
      setCopyStatus("Could not copy the summary. Check clipboard permissions and try again.");
    }
  }

  useEffect(() => {
    if (calculatorRootRef.current) {
      initializeIRCTCCalculator(calculatorRootRef.current);
    }
  }, []);

  return (
    <div
      className="refund-calculator pb-12 text-slate-800"
      ref={calculatorRootRef}
    >
      <style>{`
        .refund-calculator {
          background: #f8fafc;
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
          border: 1px solid #ede1d3;
          border-radius: 1.25rem;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(180, 140, 100, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }
        .refund-calculator .active-card,
        .refund-calculator .active-pill,
        .refund-calculator .active-green-pill {
          border-color: #0891b2 !important;
          background: #ecfeff !important;
          color: #0b2240 !important;
          font-weight: 700 !important;
          box-shadow:
            inset 0 1px 1px rgb(255 255 255 / 80%),
            0 0 0 2px rgb(8 145 178 / 14%),
            0 3px 8px rgb(8 145 178 / 10%) !important;
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
          min-height: 2.375rem;
          border: 1px solid #e4d5c4;
          border-radius: .75rem;
          background: #fffdfa;
          color: #0f2747;
          padding: .45rem .85rem;
          font-size: .8125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 180ms ease;
        }
        .refund-calculator #togglePgBtn,
        .refund-calculator #toggleRoundingBtn,
        .refund-calculator #toggleRuleRegimeBtn {
          min-height: 2.375rem;
          border: 1px solid #0f2747;
          border-radius: .75rem;
          background: #0f2747;
          color: white;
          padding: .45rem .85rem;
          font-size: .8125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 180ms ease;
        }
        .refund-calculator #togglePgBtn:hover,
        .refund-calculator #toggleRoundingBtn:hover,
        .refund-calculator #toggleRuleRegimeBtn:hover {
          border-color: #ea580c;
          background: #ea580c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
        }
        .refund-calculator #receiptModeTitle,
        .refund-calculator #ruleExplanationText,
        .refund-calculator #smartTipText,
        .refund-calculator #regimeComparisonNote {
          overflow-wrap: anywhere;
        }
        .refund-calculator .refund-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: .75rem;
          padding: .65rem 0;
          border-bottom: 1px solid #f2e7db;
          font-size: .8125rem;
        }
        .refund-calculator .refund-line > :last-child {
          flex-shrink: 0;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .refund-calculator .refund-line:last-child { border-bottom: 0; }
        .refund-calculator input[type="checkbox"] {
          width: 1.125rem;
          height: 1.125rem;
          accent-color: #ea580c;
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
          background: #0b2240;
        }
        .refund-calculator #receiptPerPaxFormulaBadge {
          border: 1px solid #fbd38d;
          background: #fffaf0;
          color: #9c4221;
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
        @media print {
          body * { visibility: hidden !important; }
          #refundResults, #refundResults * { visibility: visible !important; }
          #refundResults {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
          }
          #refundResults > section {
            box-shadow: none !important;
            border: 0 !important;
          }
          #refundResults .no-print { display: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-[1480px] px-3 pt-4 sm:px-6 sm:pt-7 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#efdfd2] bg-white/90 p-3 shadow-[0_4px_18px_rgba(15,39,71,0.04)] sm:p-3.5">
          <div className="flex flex-wrap gap-2">
            <button type="button" id="toggleRuleRegimeBtn">
              <TrainFront aria-hidden="true" className="mr-1.5 inline h-4 w-4" />
              Train rules: <span id="ruleRegimeBadge" />
            </button>
            <button type="button" id="toggleRoundingBtn" />
          </div>
        </div>

        <div id="calculatorLayout" className="grid min-w-0 grid-cols-1 items-start gap-5 lg:gap-7">
          <div className="min-w-0 space-y-5">
            <section className="calculator-panel min-w-0 border bg-white p-4 sm:p-6">
              <SectionTitle
                icon={<TrainFront aria-hidden="true" className="h-5 w-5" />}
                title="Booking details"
                step="01"
                description="Choose how the ticket was booked and select its class and current status."
              />

              <fieldset>
                <legend className="text-sm font-semibold text-slate-800">Booking source</legend>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button type="button" data-source="PERSONAL" className={`source-btn ${choiceButtonClassName}`}>
                    <span className="block font-semibold text-[#0f2747]">Personal IRCTC ID</span>
                    <span className="mt-1 block text-xs text-slate-500">IRCTC fee applies; no agent fee</span>
                  </button>
                  <button type="button" data-source="AGENT" className={`source-btn ${choiceButtonClassName}`}>
                    <span className="block font-semibold text-[#0f2747]">Authorized agent ID</span>
                    <span className="mt-1 block text-xs text-slate-500">IRCTC, agent and PG charges</span>
                  </button>
                  <button type="button" data-source="COUNTER" className={`source-btn ${choiceButtonClassName}`}>
                    <span className="block font-semibold text-[#0f2747]">Railway counter</span>
                    <span className="mt-1 block text-xs text-slate-500">No IRCTC, agent or PG fees</span>
                  </button>
                </div>
              </fieldset>

              <div id="personalPaymentSubBar" className="mt-4 hidden flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Personal ID payment method</p>
                  <p className="mt-0.5 text-xs text-slate-500">Choose the payment method used for the booking.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" data-pay="CARD" className={quietButtonClassName}>Card / NetBanking</button>
                  <button type="button" data-pay="UPI" className={quietButtonClassName}>BHIM / UPI</button>
                </div>
              </div>

              <div id="agentPgSubBar" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-100 bg-cyan-50/60 p-3">
                <p className="min-w-0 flex-1 text-xs leading-relaxed text-slate-600">
                  <span id="agentPgDescription" />
                </p>
                <button type="button" id="togglePgBtn">Payment gateway</button>
              </div>

              <div className="mt-5 grid min-w-0 gap-5 sm:grid-cols-2">
                <fieldset className="min-w-0">
                  <legend className="text-sm font-semibold text-slate-800">Travel class</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      ["1AC", "1AC / Executive"],
                      ["2AC", "2AC / First Class"],
                      ["3AC", "3AC / CC / 3E"],
                      ["SL", "Sleeper (SL)"],
                      ["2S", "Second Sitting (2S)"],
                    ].map(([value, label]) => (
                      <button key={value} type="button" data-class={value} className={`class-btn ${choiceButtonClassName}`}>
                        <span className="block font-semibold">{label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="min-w-0">
                  <legend className="text-sm font-semibold text-slate-800">Ticket status at cancellation</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      ["CNF", "Confirmed (CNF)"],
                      ["RAC", "RAC"],
                      ["WL", "Waitlisted (WL)"],
                      ["TQ_CNF", "Tatkal confirmed"],
                      ["TQWL", "Tatkal waitlist"],
                      ["TRAIN_CANCELLED", "Train cancelled"],
                    ].map(([value, label]) => (
                      <button key={value} type="button" data-status={value} className={`status-btn ${choiceButtonClassName}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="mb-2 text-sm font-semibold text-slate-800">Applicable cancellation rule set</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" id="regimeActualBtn" className="regime-choice" />
                  <button type="button" id="regimeRumoredBtn" className="regime-choice" />
                </div>
              </div>
            </section>

            <section className="calculator-panel min-w-0 border bg-white p-4 sm:p-6">
              <SectionTitle
                icon={<CalendarClock aria-hidden="true" className="h-5 w-5" />}
                title="Cancellation timing"
                step="02"
                description="Set the exact cancellation and departure times, or select a time band."
              />
              <p id="slabSectionTitleLabel" className="mb-2 text-sm font-semibold text-slate-800" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                <div id="quickTimeBandOptions" className="contents" />
              </div>

              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="cancelDateTime" className="text-sm font-semibold text-slate-800">Cancellation date and time</label>
                    <button type="button" id="setNowBtn" className="text-xs font-semibold text-cyan-800 hover:underline">Use current time</button>
                  </div>
                  <input id="cancelDateTime" type="datetime-local" className={fieldClassName} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="departureDateTime" className="text-sm font-semibold text-slate-800">Train departure date and time</label>
                  <input id="departureDateTime" type="datetime-local" className={fieldClassName} />
                </div>
              </div>
              <p id="calculatedGapLabel" className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600" aria-live="polite">
                Choose a time band or enter both train times.
              </p>
              <label htmlFor="chartPreparedCheckbox" className="mt-3 flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                <input id="chartPreparedCheckbox" type="checkbox" className="mt-0.5 shrink-0" />
                <span>The first reservation chart had been prepared when the ticket was cancelled.</span>
              </label>
            </section>

            <section className="calculator-panel min-w-0 border bg-white p-4 sm:p-6">
              <SectionTitle
                icon={<Users aria-hidden="true" className="h-5 w-5" />}
                title="Passengers and fare"
                step="03"
                description="Enter the booked and cancelling passenger counts, then provide the ticket amount."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <PassengerChoices kind="total" label="Passengers on the ticket" />
                <PassengerChoices kind="cancel" label="Passengers being cancelled" />
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-800">Fare entry method</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" id="modeGrandTotalBtn" className={quietButtonClassName}>Total paid</button>
                  <button type="button" id="modePureFareBtn" className={quietButtonClassName}>Railway fare only</button>
                </div>
              </div>

              <div id="grandTotalInputPanel" className="mt-4">
                <label htmlFor="enteredGrandTotalInput" className="text-sm font-semibold text-slate-800">Total amount paid for the ticket</label>
                <p className="mt-1 text-xs text-slate-500">Include railway fare, catering, IRCTC and agent fees, payment gateway charge and insurance.</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-500">₹</span>
                  <input id="enteredGrandTotalInput" type="number" step="0.01" placeholder="Enter total ticket amount" className={`${fieldClassName} pl-8`} />
                </div>
              </div>
              <div id="pureFareInputPanel" className="mt-4 hidden grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="pureTotalFareInput" className="text-sm font-semibold text-slate-800">Total railway fare (including GST)</label>
                  <input id="pureTotalFareInput" type="number" step="1" placeholder="Enter total railway fare" className={fieldClassName} />
                </div>
                <div>
                  <label htmlFor="purePerPaxFareInput" className="text-sm font-semibold text-slate-800">Railway fare per passenger</label>
                  <input id="purePerPaxFareInput" type="number" step="1" placeholder="Enter fare per passenger" className={fieldClassName} />
                </div>
              </div>

              <div className="mt-4 grid gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-2">
                <p>Railway fare (excluding food): <strong id="stripPureTotalFare" className="text-slate-900">₹0.00</strong></p>
                <p>Railway fare per passenger: <strong id="stripPurePerPaxFare" className="text-slate-900">₹0.00</strong></p>
                <p id="topSourceSummaryBadge" className="sm:col-span-2">Booking fee details appear after calculation.</p>
                <p id="stripPgFormulaLine" className="hidden sm:col-span-2">Payment gateway base: <span id="stripPgBaseSum">₹0.00</span> · <span id="stripPgFormulaResult">Shown after calculation</span></p>
                <p className="sm:col-span-2">Cancellation base before GST: <span id="stripExGstBreakdownText">₹0.00</span></p>
              </div>

              <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <div className="min-w-0 rounded-2xl border border-orange-200 bg-orange-50/60 p-4 shadow-[0_2px_8px_rgba(194,65,12,0.04)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-700 ring-1 ring-orange-200">
                        <UtensilsCrossed aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#0f2747]">Catering included</p>
                      <p className="mt-0.5 text-xs text-slate-500">Enter the total charge or its per-passenger amount.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" id="catNoBtn" className={quietButtonClassName}>No</button>
                      <button type="button" id="catYesBtn" className={quietButtonClassName}>Yes</button>
                    </div>
                  </div>
                  <div id="cateringInputsArea" className="mt-3 hidden gap-3">
                    <div>
                      <label htmlFor="totalCateringInput" className="text-xs font-semibold text-slate-700">Total catering charge (including GST)</label>
                      <input id="totalCateringInput" type="number" step="1" placeholder="Enter total catering charge" className={fieldClassName} />
                    </div>
                    <div>
                      <label htmlFor="perPaxCateringInput" className="text-xs font-semibold text-slate-700">Catering per passenger</label>
                      <input id="perPaxCateringInput" type="number" step="1" placeholder="Enter catering per passenger" className={fieldClassName} />
                    </div>
                    <p className="text-xs text-slate-500">Excluding GST: <strong id="catExGstDisplay">₹0.00</strong> · GST: <strong id="catGstDisplay">₹0.00</strong></p>
                    <div id="cateringPresetOptions" className="flex flex-wrap gap-2" />
                  </div>
                </div>

                <div className="min-w-0 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-[0_2px_8px_rgba(14,116,144,0.04)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 ring-1 ring-sky-200">
                        <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#0f2747]">Travel insurance included</p>
                      <p className="mt-0.5 text-xs text-slate-500">Select the rate and refund eligibility if applicable.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" id="insNoBtn" className={quietButtonClassName}>No</button>
                      <button type="button" id="insYesBtn" className={quietButtonClassName}>Yes</button>
                    </div>
                  </div>
                  <div id="insuranceInputsArea" className="mt-3 hidden space-y-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-700">Rate per passenger</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div id="insurancePresetOptions" className="contents" />
                        <label className="sr-only" htmlFor="customInsRateInput">Custom insurance rate per passenger</label>
                        <input id="customInsRateInput" type="number" step="0.05" placeholder="Custom" className={`${fieldClassName} mt-0 h-9 w-24`} />
                      </div>
                    </div>
                    <label htmlFor="insRefundableCheckbox" className="flex items-center gap-2 text-xs text-slate-700">
                      <input id="insRefundableCheckbox" type="checkbox" />
                      Add insurance refund to the estimated refund
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5 border-t border-[#f0e3d5] pt-4 sm:flex-row">
                <button
                  type="button"
                  id="calculateRefundBtn"
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#0b2240] px-6 py-3 text-sm sm:text-base font-extrabold text-white shadow-[0_3px_10px_rgba(11,34,64,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#12345c] hover:shadow-[0_6px_16px_rgba(11,34,64,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 cursor-pointer"
                >
                  <Calculator aria-hidden="true" className="mr-2 h-5 w-5" />
                  <span id="calculateRefundButtonText">Calculate Refund</span>
                </button>
                <button
                  type="button"
                  className={`${quietButtonClassName} min-h-12 px-5 text-sm`}
                  onClick={() => window.location.reload()}
                  aria-label="Reset all ticket details to their default values"
                >
                  <RotateCcw aria-hidden="true" className="mr-2 h-4 w-4 text-stone-500" />
                  Reset
                </button>
              </div>
              <p id="calculatorValidationMessage" className="mt-3 hidden rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-rose-800" role="alert" />
            </section>

            <details className="rounded-2xl border border-[#ede1d3] bg-[#fffcf8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-xs sm:text-sm font-bold text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 sm:px-6">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  Load a built-in verification scenario
                </span>
                <ChevronDown aria-hidden="true" className="h-4 w-4 text-stone-500" />
              </summary>
              <div className="border-t border-[#f0e3d5] p-4 sm:p-6 bg-white/70">
                <p id="activeTestBadge" className="mb-3 text-xs text-stone-500">No scenario selected</p>
                <div id="verificationScenarioOptions" className="flex flex-wrap gap-2" />
              </div>
            </details>
          </div>

          <aside id="refundInfo" className="min-w-0 lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-2xl border border-[#dbe5ed] bg-white shadow-[0_8px_30px_rgba(15,39,71,0.06)]">
              <div className="border-b border-white/10 bg-[#0b2240] p-5 text-white sm:p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-cyan-200">
                  <Calculator aria-hidden="true" className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">Refund Calculator</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">
                  Your estimated refund and detailed calculation breakdown will appear here after you enter your ticket details and calculate the refund.
                </p>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-sm font-bold text-[#0b2240]">How it works</h3>
                <ol className="mt-3 space-y-3">
                  {[
                    "Enter your ticket details.",
                    "Provide journey and cancellation timing.",
                    "Enter passenger and fare information.",
                    "Click Calculate Refund to view your estimate.",
                  ].map((step, index) => (
                    <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-[#0b2240] ring-1 ring-cyan-100">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    ["PRS-based calculation", "Aligned with the original calculation engine."],
                    ["Detailed refund breakdown", "Review the applicable charges and components."],
                    ["Estimated refund information", "A clear estimate to help explain the outcome."],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-xl bg-slate-50 px-3 py-2.5">
                      <p className="text-xs font-bold text-[#0b2240]">{title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </aside>

          <aside id="refundResults" aria-live="polite" className="hidden min-w-0 space-y-4 lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-2xl border bg-white">
              <div className="p-5 text-white sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-200">Estimated refund</p>
                    <p id="receiptModeTitle" className="mt-1 text-xs text-slate-300">Enter your details, then calculate your refund</p>
                  </div>
                  <span id="receiptPaxBadge" className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-orange-100">Ready to calculate</span>
                </div>
                <p id="finalNetRefundDisplay" className="mt-5 break-words text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">—</p>
                <p id="perPaxNetRefundSub" className="mt-1 text-xs text-slate-300">Calculate to see the estimated refund</p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-4">
                  <div>
                    <p className="text-[11px] text-slate-300">Cancellation charges</p>
                    <p id="finalRailwayCutDisplay" className="mt-1 text-lg font-bold tabular-nums">—</p>
                    <p id="perPaxRailwayCutSub" className="mt-0.5 text-[11px] text-slate-300">Shown after calculation</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-300">Ticket amount paid</p>
                    <p id="receiptGrandTotalPaid" className="mt-1 text-lg font-bold tabular-nums">—</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <p className="text-xs font-semibold text-slate-500">Share or print this estimate</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" id="copyRefundSummaryBtn" onClick={copyRefundSummary} disabled className={`${quietButtonClassName} disabled:cursor-not-allowed disabled:opacity-50`}>
                      <Clipboard aria-hidden="true" className="mr-1.5 h-4 w-4" />
                      Copy summary
                    </button>
                    <button type="button" id="printRefundReportBtn" onClick={() => window.print()} disabled className={`${quietButtonClassName} disabled:cursor-not-allowed disabled:opacity-50`}>
                      <Printer aria-hidden="true" className="mr-1.5 h-4 w-4" />
                      Print
                    </button>
                  </div>
                  <p id="copySummaryStatus" className="w-full text-xs font-medium text-emerald-700" role="status" aria-live="polite">{copyStatus}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4 text-orange-600" />
                  <h2 className="text-sm font-bold text-[#0f2747]">Refund breakdown</h2>
                </div>
                <p id="receiptBookingSourceTag" className="mt-1 text-xs text-slate-500">Agent ID</p>

                <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50">
                  <summary className="cursor-pointer px-3 py-2.5 text-xs font-bold text-[#0b2240] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700">
                    Understand the refund terms
                  </summary>
                  <div className="grid gap-2 border-t border-slate-200 px-3 py-3 text-xs leading-relaxed text-slate-600 sm:grid-cols-2">
                    <p><strong className="text-slate-800">Cancellation charge:</strong> The railway deduction applied under the selected ticket status and cancellation timing.</p>
                    <p><strong className="text-slate-800">Other deductions:</strong> Applicable booking and payment fees shown separately in the breakdown.</p>
                    <p><strong className="text-slate-800">Estimated refund:</strong> An estimate based on the entered fare and ticket details.</p>
                    <p><strong className="text-slate-800">PRS calculation:</strong> The detailed rows above show the fare base, charge, tax and rounding components.</p>
                  </div>
                </details>

                <div className="mt-3">
                  <div className="refund-line"><span>IRCTC convenience fee</span><span id="receiptIrctcFee">—</span></div>
                  <div id="receiptInsuranceRow" className="refund-line" style={{ display: "none" }}><span>Travel insurance (<span id="receiptInsStatusText">Refundable</span>)</span><span id="receiptInsuranceFee">—</span></div>
                  <div id="receiptPgBaseRow" className="refund-line"><span>Payment gateway calculation base</span><span id="receiptPgBaseVal">—</span></div>
                  <div id="receiptPgFeeRow" className="refund-line"><span>Payment gateway fee · <span id="receiptPgSlabLabel">Shown after calculation</span></span><span id="receiptPgFee">—</span></div>
                  <div id="receiptAgentFeeRow" className="refund-line"><span>Agent service fee</span><span id="receiptAgentFee">—</span></div>
                  <div className="refund-line font-semibold"><span>Railway fare and catering total</span><span id="receiptPureRailwayTotal">—</span></div>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#0f2747]">PRS cancellation calculation</h3>
                    <span id="receiptPerPaxFormulaBadge" className="rounded bg-cyan-50 px-2 py-1 text-xs font-semibold text-[#0b2240]">Calculated when you click Calculate refund</span>
                  </div>
                  <div className="mt-2">
                    <div className="refund-line"><span>Railway fare for <span id="receiptCancelPaxCount">—</span> cancelling passenger(s)</span><span id="receiptCancellingTrainFare">—</span></div>
                    <div id="receiptCateringRow" className="refund-line"><span>Catering for cancelling passengers</span><span id="receiptCancellingCatering">—</span></div>
                    <div id="receiptExGstBaseRow" className="refund-line"><span>Cancellation base before GST</span><span id="receiptExGstBaseVal">—</span></div>
                    <div className="refund-line"><span id="receiptBaseCancelCutLabel">Base cancellation charge</span><span id="receiptBaseCancelCut">—</span></div>
                    <div className="refund-line"><span>GST on cancellation charge</span><span id="receiptGstCancelCut">—</span></div>
                    <div className="refund-line"><span>Additional rounding</span><span id="receiptRoundingCut">—</span></div>
                    <div className="refund-line font-bold text-rose-700"><span>Total railway cancellation charge</span><span id="receiptTotalRailwayCut">—</span></div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3">
                  <div className="refund-line"><span>Railway fare and catering</span><span id="receiptNetTrainRefund">—</span></div>
                  <div className="refund-line"><span>Cancellation charge</span><span id="receiptNetFoodRefund">—</span></div>
                  <div id="receiptNetInsRefundRow" className="refund-line"><span>Insurance refund</span><span id="receiptNetInsRefund">—</span></div>
                  <div className="refund-line font-bold text-[#0f2747]"><span>Estimated bank refund</span><span id="receiptFinalBankRefund">—</span></div>
                </div>

                <div id="ruleExplanationAlert" className="mt-4 rounded-xl border border-orange-100 bg-orange-50/60 p-3.5">
                  <p className="text-xs font-bold text-[#0f2747]">Applicable cancellation rule</p>
                  <p id="ruleExplanationText" className="mt-1 text-xs leading-relaxed text-slate-700" />
                  <p id="smartTipText" className="mt-2 text-xs font-medium leading-relaxed text-slate-700" />
                  <div id="regimeComparisonNote" className="mt-2 border-t border-cyan-100 pt-2 text-xs leading-relaxed text-slate-600" />
                </div>
              </div>
            </section>

          </aside>
        </div>

        <section className="calculator-panel mt-8 border bg-white p-4 sm:p-6">
          <h2 className="text-base font-bold text-[#0f2747]">Cancellation rule reference</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-orange-100 bg-orange-50 text-[#0f2747]">
                  <th className="p-3 font-semibold">Cancellation timing</th>
                  <th className="p-3 font-semibold">Regular trains</th>
                  <th className="p-3 font-semibold">Vande Bharat Sleeper / Amrit Bharat II</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr><th className="p-3 font-medium">Early</th><td className="p-3">More than 48 hours: class-wise flat charge</td><td className="p-3">More than 72 hours: 25% cancellation charge</td></tr>
                <tr><th className="p-3 font-medium">Medium</th><td className="p-3">48 to 12 hours: 25% cancellation charge</td><td className="p-3">72 to 8 hours: 50% cancellation charge</td></tr>
                <tr><th className="p-3 font-medium">Late</th><td className="p-3">Under 12 and over 4 hours before chart: 50% charge</td><td className="p-3">72 to 8 hours: 50% cancellation charge</td></tr>
                <tr><th className="p-3 font-medium">Chart prepared / no-refund window</th><td className="p-3">Chart prepared or under 4 hours: no refund for confirmed tickets</td><td className="p-3">Chart prepared or under 8 hours: no refund for confirmed tickets</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

    </div>
  );
}
