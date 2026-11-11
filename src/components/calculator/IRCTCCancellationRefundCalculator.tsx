"use client";

import { useEffect, useRef } from "react";
import {
  Calculator,
  CalendarClock,
  ChevronDown,
  Clipboard,
  Printer,
  RotateCcw,
  ShieldCheck,
  TrainFront,
  Users,
} from "lucide-react";
import { initializeIRCTCCalculator } from "@/lib/irctc-cancellation-calculator";

const fieldClassName =
  "mt-1 h-9 sm:h-9.5 w-full min-w-0 rounded-lg border border-[#e4d5c4] bg-white px-2.5 text-xs sm:text-sm font-semibold text-stone-900 shadow-2xs outline-none transition-all placeholder:text-stone-400 hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200";
const quietButtonClassName =
  "inline-flex min-h-8 sm:min-h-8.5 items-center justify-center rounded-lg border border-[#e4d5c4] bg-white px-2.5 py-1 text-xs font-bold text-stone-700 shadow-2xs transition-all hover:border-orange-300 hover:bg-[#fff9f3] hover:text-orange-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 cursor-pointer";
const choiceButtonClassName =
  "min-h-9 sm:min-h-10 rounded-lg border border-[#e4d5c4] bg-[#faf6f0]/70 px-2.5 py-1.5 text-left text-xs text-stone-700 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:text-stone-900 hover:shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 cursor-pointer";

function SectionTitle({
  icon,
  title,
  step,
}: {
  icon: React.ReactNode;
  title: string;
  step: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-[#f0e3d5] pb-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100/70 text-orange-700 ring-1 ring-orange-200/80">
        {icon}
      </span>
      <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-extrabold text-orange-900 border border-orange-200">
        Step {step}
      </span>
      <h2 className="text-xs sm:text-sm font-extrabold tracking-tight text-stone-900">
        {title}
      </h2>
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
      <legend className="text-xs font-bold text-stone-800">{label}</legend>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {[1, 2, 3, 4, 5, 6].map((count) => (
          <button
            key={count}
            type="button"
            {...{ [dataName]: count }}
            className={`${className} inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e4d5c4] bg-white p-0 text-center text-xs font-bold text-stone-700 shadow-2xs transition-all hover:border-orange-300 hover:bg-[#fff9f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 cursor-pointer`}
            aria-label={`${label}: ${count}`}
          >
            {count}
          </button>
        ))}
        <label className="sr-only" htmlFor={inputId}>
          {label}, enter a number from 1 to 12
        </label>
        <input
          id={inputId}
          type="number"
          min="1"
          max="12"
          placeholder="Qty"
          className={`${fieldClassName} mt-0 h-8 w-14 px-1.5 text-center text-xs font-bold`}
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
          border: 1px solid #ede1d3;
          border-radius: 1.25rem;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(180, 140, 100, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }
        .refund-calculator .active-card,
        .refund-calculator .active-pill,
        .refund-calculator .active-green-pill {
          border-color: #F36B21 !important;
          background: #fff7ed !important;
          color: #9a3412 !important;
          font-weight: 700 !important;
          box-shadow:
            inset 0 1px 1px rgb(255 255 255 / 80%),
            0 0 0 2px rgb(249 115 22 / 20%),
            0 4px 12px rgb(249 115 22 / 10%) !important;
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
        .refund-calculator #togglePgBtn,
        .refund-calculator #toggleRoundingBtn,
        .refund-calculator #toggleRuleRegimeBtn {
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
          padding: .35rem 0;
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
      `}</style>

      <div className="mx-auto max-w-[1360px] px-3 pt-2.5 sm:px-6">
        {/* Compact status pill toolbar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
          <button type="button" id="toggleRuleRegimeBtn" className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4d5c4] bg-[#fffdfa] px-2.5 py-1 text-xs font-bold text-[#0f2747] hover:border-orange-300">
            <TrainFront aria-hidden="true" className="h-3.5 w-3.5 text-orange-600" />
            <span>Rules:</span>
            <span id="ruleRegimeBadge" className="text-orange-950 font-bold">Regular trains (48h / 12h / 4h)</span>
          </button>
          <button type="button" id="toggleRoundingBtn" className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4d5c4] bg-[#fffdfa] px-2.5 py-1 text-xs font-bold text-[#0f2747] hover:border-orange-300">
            <span>₹5 Rounding:</span>
            <span id="roundingStateBadge" className="text-orange-950 font-bold">On</span>
          </button>
        </div>

        <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.38fr)_minmax(330px,0.85fr)] lg:gap-5">
          <div className="min-w-0 space-y-3.5">
            {/* Step 1: Booking details */}
            <section className="calculator-panel min-w-0 border bg-white p-3.5 sm:p-4">
              <SectionTitle
                icon={<TrainFront aria-hidden="true" className="h-4 w-4" />}
                title="Booking details"
                step="01"
              />

              <fieldset>
                <legend className="text-xs font-bold text-slate-800">Booking source</legend>
                <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                  <button type="button" data-source="PERSONAL" className={`source-btn ${choiceButtonClassName} text-center`}>
                    <span className="block font-bold text-[#0f2747]">Personal IRCTC ID</span>
                    <span className="block text-[10px] text-slate-500">IRCTC fee applies</span>
                  </button>
                  <button type="button" data-source="AGENT" className={`source-btn ${choiceButtonClassName} text-center`}>
                    <span className="block font-bold text-[#0f2747]">Authorized agent ID</span>
                    <span className="block text-[10px] text-slate-500">IRCTC + Agent + PG</span>
                  </button>
                  <button type="button" data-source="COUNTER" className={`source-btn ${choiceButtonClassName} text-center`}>
                    <span className="block font-bold text-[#0f2747]">Railway counter</span>
                    <span className="block text-[10px] text-slate-500">No extra charges</span>
                  </button>
                </div>
              </fieldset>

              <div id="personalPaymentSubBar" className="mt-2.5 hidden flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
                <span className="font-semibold text-slate-700">Payment mode:</span>
                <div className="flex gap-1.5">
                  <button type="button" data-pay="CARD" className={`pay-btn ${quietButtonClassName}`}>Card / NetBanking</button>
                  <button type="button" data-pay="UPI" className={`pay-btn ${quietButtonClassName}`}>BHIM / UPI</button>
                </div>
              </div>

              <div id="agentPgSubBar" className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cyan-100 bg-cyan-50/60 px-3 py-1.5 text-xs">
                <p id="agentPgDescription" className="min-w-0 flex-1 text-[11px] leading-relaxed text-slate-600">
                  Agent PG fee: 0.75% up to ₹2,000, 1% above ₹2,000.
                </p>
                <button type="button" id="togglePgBtn" className={quietButtonClassName}>Payment gateway: On</button>
              </div>

              <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
                <fieldset className="min-w-0">
                  <legend className="text-xs font-bold text-slate-800">Travel class</legend>
                  <div className="mt-1.5 grid grid-cols-2 gap-1 sm:grid-cols-3">
                    {[
                      ["1AC", "1AC / Exec"],
                      ["2AC", "2AC / 1st"],
                      ["3AC", "3AC / CC / 3E"],
                      ["SL", "Sleeper (SL)"],
                      ["2S", "2S (Sitting)"],
                    ].map(([value, label]) => (
                      <button key={value} type="button" data-class={value} className={`class-btn ${choiceButtonClassName} text-center`}>
                        <span className="block font-bold">{label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="min-w-0">
                  <legend className="text-xs font-bold text-slate-800">Ticket status at cancellation</legend>
                  <div className="mt-1.5 grid grid-cols-2 gap-1 sm:grid-cols-3">
                    {[
                      ["CNF", "CNF (Confirmed)"],
                      ["RAC", "RAC"],
                      ["WL", "WL (Waitlist)"],
                      ["TQ_CNF", "Tatkal CNF"],
                      ["TQWL", "Tatkal WL"],
                      ["TRAIN_CANCELLED", "Train Cancelled"],
                    ].map(([value, label]) => (
                      <button key={value} type="button" data-status={value} className={`status-btn ${choiceButtonClassName} text-center`}>
                        <span className="block font-bold">{label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2.5">
                <p className="mb-1.5 text-xs font-bold text-slate-800">Cancellation rule regime</p>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" id="regimeActualBtn" className="regime-choice">Regular trains · 48h / 12h / 4h</button>
                  <button type="button" id="regimeRumoredBtn" className="regime-choice">Vande Bharat Sleeper · 72h / 8h</button>
                </div>
              </div>
            </section>

            {/* Step 2: Cancellation timing */}
            <section className="calculator-panel min-w-0 border bg-white p-3.5 sm:p-4">
              <SectionTitle
                icon={<CalendarClock aria-hidden="true" className="h-4 w-4" />}
                title="Cancellation timing"
                step="02"
              />
              <p id="slabSectionTitleLabel" className="mb-1.5 text-xs font-bold text-slate-800">
                Quick time bands · Regular trains (48h / 12h / 4h)
              </p>
              <div id="quickTimeBandOptions" className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-5">
                {[
                  ["80", "slabBtn1Title", "> 48 hours", "slabBtn1Sub", "Flat cancellation charge"],
                  ["14.83", "slabBtn2Title", "48h to 12h", "slabBtn2Sub", "25% cancellation charge"],
                  ["9", "slabBtn3Title", "12h to 4h", "slabBtn3Sub", "50% charge (before chart)"],
                  ["2", "slabBtn4Title", "Chart prepared / < 4h", "slabBtn4Sub", "Confirmed: no refund"],
                  ["0.25", null, "< 30 minutes", null, "Waitlist rules apply"],
                ].map(([hours, titleId, title, subId, sub]) => (
                  <button key={hours} type="button" data-time-band={hours} className={`slab-btn ${choiceButtonClassName} min-h-[52px]`}>
                    <span id={titleId || undefined} className="block font-bold text-[#0f2747]">{title}</span>
                    <span id={subId || undefined} className="block text-[10px] text-slate-500">{sub}</span>
                  </button>
                ))}
              </div>

              <div className="mt-3 grid min-w-0 gap-2.5 sm:grid-cols-2">
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <label htmlFor="cancelDateTime" className="text-xs font-bold text-slate-800">Cancellation date &amp; time</label>
                    <button type="button" id="setNowBtn" className="text-[11px] font-bold text-orange-600 hover:underline">Use current time</button>
                  </div>
                  <input id="cancelDateTime" type="datetime-local" className={fieldClassName} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="departureDateTime" className="text-xs font-bold text-slate-800">Train departure date &amp; time</label>
                  <input id="departureDateTime" type="datetime-local" className={fieldClassName} />
                </div>
              </div>
              <p id="calculatedGapLabel" className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600" aria-live="polite">
                Choose a time band or enter both train times.
              </p>
              <label htmlFor="chartPreparedCheckbox" className="mt-2 flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200/80 p-2 text-xs text-slate-700">
                <input id="chartPreparedCheckbox" type="checkbox" className="mt-0.5 shrink-0" />
                <span>First reservation chart had been prepared when the ticket was cancelled.</span>
              </label>
            </section>

            {/* Step 3: Passengers and fare */}
            <section className="calculator-panel min-w-0 border bg-white p-3.5 sm:p-4">
              <SectionTitle
                icon={<Users aria-hidden="true" className="h-4 w-4" />}
                title="Passengers &amp; fare"
                step="03"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <PassengerChoices kind="total" label="Booked passengers" />
                <PassengerChoices kind="cancel" label="Cancelling passengers" />
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Fare entry mode:</span>
                  <div className="flex gap-1.5">
                    <button type="button" id="modeGrandTotalBtn" className={quietButtonClassName}>Total paid</button>
                    <button type="button" id="modePureFareBtn" className={quietButtonClassName}>Railway fare only</button>
                  </div>
                </div>
              </div>

              <div id="grandTotalInputPanel" className="mt-2">
                <label htmlFor="enteredGrandTotalInput" className="text-xs font-bold text-slate-800">Total amount paid for ticket (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">₹</span>
                  <input id="enteredGrandTotalInput" type="number" min="0" step="0.01" placeholder="e.g. 1250" className={`${fieldClassName} pl-7`} />
                </div>
              </div>
              <div id="pureFareInputPanel" className="mt-2 hidden grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="pureTotalFareInput" className="text-xs font-bold text-slate-800">Total railway fare (incl. GST)</label>
                  <input id="pureTotalFareInput" type="number" min="0" step="1" placeholder="Total fare" className={fieldClassName} />
                </div>
                <div>
                  <label htmlFor="purePerPaxFareInput" className="text-xs font-bold text-slate-800">Railway fare per passenger</label>
                  <input id="purePerPaxFareInput" type="number" min="0" step="1" placeholder="Per pax fare" className={fieldClassName} />
                </div>
              </div>

              <div className="mt-3 grid gap-1.5 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 sm:grid-cols-2">
                <p>Base fare: <strong id="stripPureTotalFare" className="text-slate-900">₹0.00</strong></p>
                <p>Per passenger: <strong id="stripPurePerPaxFare" className="text-slate-900">₹0.00</strong></p>
                <p id="topSourceSummaryBadge" className="sm:col-span-2 text-[11px]">Fee details appear after calculation.</p>
                <p id="stripPgFormulaLine" className="hidden sm:col-span-2 text-[11px]">Payment gateway base: <span id="stripPgBaseSum">₹0.00</span> · <span id="stripPgFormulaResult">Shown after calculation</span></p>
                <p className="sm:col-span-2 text-[11px]">Cancellation base before GST: <span id="stripExGstBreakdownText">₹0.00</span></p>
              </div>

              <div className="mt-3 grid gap-2.5 border-t border-slate-100 pt-3 sm:grid-cols-2">
                {/* Catering card */}
                <div className="min-w-0 rounded-xl border border-orange-200/80 bg-orange-50/40 p-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-[#0f2747]">Catering included?</span>
                    <div className="flex gap-1">
                      <button type="button" id="catNoBtn" className={quietButtonClassName}>No</button>
                      <button type="button" id="catYesBtn" className={quietButtonClassName}>Yes</button>
                    </div>
                  </div>
                  <div id="cateringInputsArea" className="mt-2 hidden space-y-1.5">
                    <div>
                      <label htmlFor="totalCateringInput" className="text-[11px] font-semibold text-slate-700">Total catering (incl. GST)</label>
                      <input id="totalCateringInput" type="number" min="0" step="1" placeholder="Total food" className={fieldClassName} />
                    </div>
                    <div>
                      <label htmlFor="perPaxCateringInput" className="text-[11px] font-semibold text-slate-700">Catering per passenger</label>
                      <input id="perPaxCateringInput" type="number" min="0" step="1" placeholder="Per pax" className={fieldClassName} />
                    </div>
                    <p className="text-[10px] text-slate-500">Excl. GST: <strong id="catExGstDisplay">₹0.00</strong> · GST: <strong id="catGstDisplay">₹0.00</strong></p>
                    <div id="cateringPresetOptions" className="flex flex-wrap gap-1">
                      {[["363", "Vande Bharat"], ["150", "₹150"], ["300", "₹300"]].map(([value, label]) => (
                        <button key={value} type="button" data-catering-preset-id={value} className={`food-preset-btn ${quietButtonClassName} min-h-7 px-1.5 text-[11px]`}>{value === "363" ? "₹363 · " : ""}{label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Insurance card */}
                <div className="min-w-0 rounded-xl border border-sky-200/80 bg-sky-50/40 p-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-[#0f2747]">Travel insurance?</span>
                    <div className="flex gap-1">
                      <button type="button" id="insNoBtn" className={quietButtonClassName}>No</button>
                      <button type="button" id="insYesBtn" className={quietButtonClassName}>Yes</button>
                    </div>
                  </div>
                  <div id="insuranceInputsArea" className="mt-2 hidden space-y-1.5">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-700">Rate per passenger</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <div id="insurancePresetOptions" className="flex flex-wrap gap-1">
                        <button type="button" data-insurance-preset-id="0.45" className={`ins-rate-btn ${quietButtonClassName} min-h-7 text-[11px]`}>₹0.45</button>
                        <button type="button" data-insurance-preset-id="0.35" className={`ins-rate-btn ${quietButtonClassName} min-h-7 text-[11px]`}>₹0.35</button>
                        </div>
                        <label className="sr-only" htmlFor="customInsRateInput">Custom insurance rate per passenger</label>
                        <input id="customInsRateInput" type="number" min="0" step="0.05" placeholder="Custom" className={`${fieldClassName} mt-0 h-7 w-20 text-xs`} />
                      </div>
                    </div>
                    <label htmlFor="insRefundableCheckbox" className="flex items-center gap-1.5 text-[11px] text-slate-700">
                      <input id="insRefundableCheckbox" type="checkbox" />
                      Add insurance refund to total
                    </label>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-4 flex flex-col gap-2 border-t border-[#f0e3d5] pt-3 sm:flex-row">
                <button
                  type="button"
                  id="calculateRefundBtn"
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-orange-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-orange-700 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 cursor-pointer"
                >
                  <Calculator aria-hidden="true" className="mr-2 h-4 w-4" />
                  <span id="calculateRefundButtonText">Calculate Refund</span>
                </button>
                <button
                  type="button"
                  id="resetCalculatorBtn"
                  className={`${quietButtonClassName} min-h-11 px-4 text-xs font-bold`}
                  aria-label="Reset all ticket details to their default values"
                >
                  <RotateCcw aria-hidden="true" className="mr-1.5 h-3.5 w-3.5 text-stone-500" />
                  Reset
                </button>
              </div>
              <p id="calculatorValidationMessage" className="mt-2.5 hidden rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800" role="alert" />
            </section>
          </div>

          {/* Right Workspace / Results column */}
          <div className="min-w-0 lg:sticky lg:top-20">
            {/* Empty state before calculation */}
            <aside id="refundInfo" className="min-w-0">
              <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                <div className="border-b border-white/10 bg-[#0b2240] p-4 text-white sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white shadow-2xs">
                      <Calculator aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="text-base font-bold tracking-tight">Refund Estimate</h2>
                      <p className="text-[11px] text-slate-300">Official PRS cancellation rules</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-xs sm:p-5">
                  <p className="font-semibold text-slate-700">How to get your refund estimate:</p>
                  <ol className="mt-2.5 space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-900">1</span>
                      <span>Select booking source, class &amp; ticket status.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-900">2</span>
                      <span>Choose time band or exact departure timing.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-900">3</span>
                      <span>Enter passengers &amp; fare, then click Calculate.</span>
                    </li>
                  </ol>
                  <div className="mt-3.5 rounded-lg border border-orange-100 bg-[#fffaf5] p-2.5 text-[11px] text-slate-600">
                    Your complete breakdown including cancellation fee, clerkage, and net bank refund will appear here.
                  </div>
                </div>
              </section>
            </aside>

            {/* Calculated Results Card */}
            <aside id="refundResults" aria-live="polite" className="hidden min-w-0 space-y-3">
              <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                <div className="p-4 text-white sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-orange-200">Estimated Net Refund</p>
                      <p id="receiptModeTitle" className="text-[11px] text-slate-300">Ticket breakdown</p>
                    </div>
                    <span id="receiptPaxBadge" className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] text-orange-100">Ready</span>
                  </div>
                  <p id="finalNetRefundDisplay" className="mt-3 break-words text-3xl font-black tracking-tight tabular-nums sm:text-4xl">₹0.00</p>
                  <p id="perPaxNetRefundSub" className="mt-0.5 text-[11px] text-slate-300">Net refundable amount to bank</p>
                  
                  <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-white/15 pt-3 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-300">Cancellation cut</p>
                      <p id="finalRailwayCutDisplay" className="text-base font-bold tabular-nums">- ₹0.00</p>
                      <p id="perPaxRailwayCutSub" className="text-[10px] text-slate-300">₹0.00 / pax</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-300">Ticket paid</p>
                      <p id="receiptGrandTotalPaid" className="text-base font-bold tabular-nums">₹0.00</p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 text-xs sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-[#0f2747]">
                      <ShieldCheck aria-hidden="true" className="h-4 w-4 text-orange-600" />
                      <span>Refund Breakdown</span>
                    </div>
                    <span id="receiptBookingSourceTag" className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">Agent ID</span>
                  </div>

                  <div className="mt-2.5 divide-y divide-slate-100 text-xs">
                    <div className="refund-line py-1.5"><span>IRCTC convenience fee</span><span id="receiptIrctcFee">- ₹0.00</span></div>
                    <div id="receiptInsuranceRow" className="refund-line py-1.5" style={{ display: "none" }}><span>Travel insurance (<span id="receiptInsStatusText">Refundable</span>)</span><span id="receiptInsuranceFee">₹0.00</span></div>
                    <div id="receiptPgBaseRow" className="refund-line py-1.5"><span>Payment gateway base</span><span id="receiptPgBaseVal">₹0.00</span></div>
                    <div id="receiptPgFeeRow" className="refund-line py-1.5"><span>PG fee · <span id="receiptPgSlabLabel">Shown</span></span><span id="receiptPgFee">- ₹0.00</span></div>
                    <div id="receiptAgentFeeRow" className="refund-line py-1.5"><span>Agent service fee</span><span id="receiptAgentFee">- ₹0.00</span></div>
                    <div className="refund-line py-1.5 font-bold"><span>Railway fare total</span><span id="receiptPureRailwayTotal">₹0.00</span></div>
                  </div>

                  <div className="mt-3 border-t border-slate-200 pt-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0f2747]">PRS Deductions</span>
                      <span id="receiptPerPaxFormulaBadge" className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-900 border border-orange-200">Rule Applied</span>
                    </div>
                    <div className="mt-1.5 divide-y divide-slate-100 text-xs">
                      <div className="refund-line py-1"><span>Cancelling pax (<span id="receiptCancelPaxCount">1</span>) fare</span><span id="receiptCancellingTrainFare">₹0.00</span></div>
                      <div id="receiptCateringRow" className="refund-line py-1"><span>Catering for cancelling pax</span><span id="receiptCancellingCatering">₹0.00</span></div>
                      <div id="receiptExGstBaseRow" className="refund-line py-1"><span>Cancellation base excl. GST</span><span id="receiptExGstBaseVal">₹0.00</span></div>
                      <div className="refund-line py-1"><span id="receiptBaseCancelCutLabel">Base cancellation charge</span><span id="receiptBaseCancelCut">- ₹0.00</span></div>
                      <div className="refund-line py-1"><span>GST on cancellation</span><span id="receiptGstCancelCut">- ₹0.00</span></div>
                      <div className="refund-line py-1"><span>Rounding adjustment</span><span id="receiptRoundingCut">- ₹0.00</span></div>
                      <div className="refund-line py-1 font-bold text-rose-700"><span>Total railway cut</span><span id="receiptTotalRailwayCut">- ₹0.00</span></div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-slate-200/90 bg-slate-50 p-2 text-xs">
                    <div className="refund-line py-0.5"><span>Fare + catering</span><span id="receiptNetTrainRefund">₹0.00</span></div>
                    <div className="refund-line py-0.5"><span>Cancellation cut</span><span id="receiptNetFoodRefund">- ₹0.00</span></div>
                    <div id="receiptNetInsRefundRow" className="refund-line py-0.5"><span>Insurance refund</span><span id="receiptNetInsRefund">+ ₹0.00</span></div>
                    <div className="refund-line py-0.5 font-black text-[#0f2747] text-sm"><span>Estimated bank refund</span><span id="receiptFinalBankRefund">₹0.00</span></div>
                  </div>

                  <div id="ruleExplanationAlert" className="mt-3 rounded-xl border border-orange-100 bg-orange-50/60 p-2.5 text-xs">
                    <p className="font-bold text-[#0f2747]">Cancellation rule applicable:</p>
                    <p id="ruleExplanationText" className="mt-0.5 text-slate-700" />
                    <p id="smartTipText" className="mt-1 text-slate-700" />
                    <div id="regimeComparisonNote" className="mt-1 text-slate-600" />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-2.5">
                    <button
                      type="button"
                      id="copyRefundSummaryBtn"
                      className={`${quietButtonClassName} flex-1 min-h-8 text-xs font-bold`}
                    >
                      <Clipboard aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />
                      Copy Summary
                    </button>
                    <button
                      type="button"
                      id="printRefundReportBtn"
                      className={`${quietButtonClassName} min-h-8 text-xs font-bold`}
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
        <details className="mt-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <summary className="flex cursor-pointer list-none items-center justify-between p-3 text-xs font-bold text-[#0f2747] hover:text-orange-600 sm:px-4">
            <span className="flex items-center gap-1.5">
              <Calculator aria-hidden="true" className="h-3.5 w-3.5 text-orange-600" />
              View IRCTC Cancellation Rules &amp; Time Slabs Reference Table
            </span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-slate-400" />
          </summary>
          <div className="border-t border-slate-100 p-3 sm:p-4 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-orange-100 bg-orange-50/70 text-[#0f2747]">
                  <th className="p-2.5 font-bold">Cancellation timing</th>
                  <th className="p-2.5 font-bold">Regular trains (48h / 12h / 4h)</th>
                  <th className="p-2.5 font-bold">Vande Bharat Sleeper (72h / 8h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr><th className="p-2.5 font-semibold text-slate-800">Early</th><td className="p-2.5">&gt; 48 hours: Flat per-class clerkage fee</td><td className="p-2.5">&gt; 72 hours: 25% cancellation charge</td></tr>
                <tr><th className="p-2.5 font-semibold text-slate-800">Medium</th><td className="p-2.5">48h to 12h: 25% cancellation charge</td><td className="p-2.5">72h to 8h: 50% cancellation charge</td></tr>
                <tr><th className="p-2.5 font-semibold text-slate-800">Late</th><td className="p-2.5">12h to 4h: 50% cancellation charge</td><td className="p-2.5">72h to 8h: 50% cancellation charge</td></tr>
                <tr><th className="p-2.5 font-semibold text-slate-800">Chart prepared</th><td className="p-2.5">&lt; 4h or chart prepared: No refund for CNF</td><td className="p-2.5">&lt; 8h or chart prepared: No refund for CNF</td></tr>
              </tbody>
            </table>
          </div>
        </details>


      </div>

    </div>
  );
}
