"use client";

import { useId, useMemo, useState } from "react";
import {
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import {
  CalculatorFormState,
  INITIAL_CALCULATOR_STATE,
  TicketCategory,
  calculateFare,
  formatINR,
} from "@/lib/fare-calculator";
import { PrintEstimateModal } from "./PrintEstimateModal";
import { InteractiveButton } from "@/components/ui/InteractiveButton";

export function FareCalculator() {
  const [form, setForm] = useState<CalculatorFormState>(INITIAL_CALCULATOR_STATE);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Stable quotation ID using useId and static fallback to avoid cascading render issues
  const rawId = useId();
  const quotationRefId = useMemo(() => {
    const cleanId = rawId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "EST";
    return `RA-EST-${cleanId}`;
  }, [rawId]);

  // Live calculation
  const result = useMemo(() => calculateFare(form), [form]);

  // Handle passenger change via dropdown
  const handleAdultSelect = (value: number) => {
    setForm((prev) => ({
      ...prev,
      adults: value,
    }));
  };

  const handleChildSelect = (value: number) => {
    setForm((prev) => ({
      ...prev,
      children: value,
    }));
  };

  // Handle category switch (only AC or Non-AC, no class needed)
  const handleCategoryChange = (newCat: TicketCategory) => {
    const defaultIrctc = newCat === "AC" ? 35.40 : 17.70;
    const defaultAgent = newCat === "AC" ? 40 : 20;
    setForm((prev) => ({
      ...prev,
      category: newCat,
      travelClassCode: newCat,
      irctcFee: defaultIrctc.toString(),
      agentFee: defaultAgent.toString(),
    }));
  };

  // Reset to initial state
  const handleReset = () => {
    setForm(INITIAL_CALCULATOR_STATE);
  };

  // Copy WhatsApp quotation text
  const handleCopySummary = async () => {
    const text = [
      `🚂 *IRCTC TICKET FARE ESTIMATE*`,
      `Quotation Ref: ${quotationRefId}`,
      `Category: ${result.category === "AC" ? "AC (Air Conditioned)" : "Non-AC"}`,
      `Passengers: ${result.totalPassengers} (${result.adults} Adult${result.adults === 1 ? "" : "s"}${result.children > 0 ? `, ${result.children} Child${result.children === 1 ? "" : "ren"}` : ""})`,
      `---------------------------------`,
      `• Adult Fare: ${result.adults} × ${formatINR(result.adultFare)} = ${formatINR(result.adultsTotalFare)}`,
      result.children > 0 ? `• Child Fare: ${result.children} × ${formatINR(result.childFare)} = ${formatINR(result.childrenTotalFare)}` : null,
      `• Total Base Fare: ${formatINR(result.railwayFare)}`,
      `• IRCTC Fee (${result.category}): ${formatINR(result.irctcFee)}`,
      `• Subtotal (Fare + IRCTC): ${formatINR(result.subtotalBeforePG)}`,
      `• PG Charge (${result.pgAppliedRateDescription}): ${formatINR(result.pgCharge)}`,
      `• Agent Service Fee (${result.category}): ${formatINR(result.agentFee)}`,
      `---------------------------------`,
      `*FINAL TOTAL PAYABLE: ${formatINR(result.finalTotalPayable)}*`,
      `Amount in Words: ${result.amountInWords}`,
      `---------------------------------`,
      `Calculated via RailAgents.in`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      // Fallback
    }
  };

  const isOverMaxPassengers = form.adults + form.children > 6;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Outer Shell: Warm Sand & Amber Orange Theme */}
      <div className="relative rounded-2xl bg-[#fffcf8] p-2.5 sm:p-5 lg:p-6 shadow-[0_4px_24px_rgba(249,115,22,0.06),0_1px_4px_rgba(0,0,0,0.04)] border border-[#f2e6d9] hover:shadow-[0_8px_30px_rgba(249,115,22,0.09)] transition-all duration-300 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-5 lg:gap-8 items-stretch">

          {/* Left Column: Passenger & Category Inputs (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-2 sm:space-y-4">

            {/* Passenger Workspace Header */}
            <div>
              <div className="flex items-center justify-between pb-1.5 mb-2 sm:pb-3 sm:mb-4 border-b border-[#f0e3d5]">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                  <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-900">
                    Passenger & Fare Details
                  </h3>
                </div>
              </div>

              {isOverMaxPassengers && (
                <div className="mb-2 p-1.5 sm:p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center justify-between">
                  <span>Maximum 6 passengers allowed on a single booking.</span>
                </div>
              )}

              {/* Clean Structured Passenger Cards with Clear Visual Separation */}
              <div className="space-y-2 sm:space-y-3">
                {/* Row 1: Adults Card */}
                <div className="rounded-xl sm:rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/80 p-2.5 sm:p-3.5 shadow-[0_2px_8px_rgba(180,140,100,0.04)] transition-all">
                  <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-3 items-end">
                    <div className="sm:col-span-4">
                      <label htmlFor="adults-select" className="text-[11px] sm:text-xs font-bold text-stone-800 block mb-1">
                        Adults (12+ yrs)
                      </label>
                      <div className="relative">
                        <select
                          id="adults-select"
                          value={form.adults}
                          onChange={(e) => handleAdultSelect(parseInt(e.target.value, 10))}
                          className="w-full h-10 sm:h-11 appearance-none rounded-lg border border-[#e4d5c4] bg-white px-3 pr-8 text-xs sm:text-sm font-semibold text-stone-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-orange-300 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_2px_6px_rgba(249,115,22,0.08)] focus:border-orange-500 focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_3px_rgba(249,115,22,0.18)] focus:outline-none cursor-pointer"
                        >
                          {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? "Adult" : "Adults"}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="adult-fare-input" className="text-[11px] sm:text-xs font-bold text-stone-800 block mb-1">
                        Fare per Adult
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs sm:text-sm font-bold text-orange-500/80">
                          ₹
                        </span>
                        <input
                          id="adult-fare-input"
                          type="number"
                          min="0"
                          max="100000"
                          step="any"
                          placeholder="0.00"
                          value={form.adultFare}
                          onWheel={(e) => e.currentTarget.blur()}
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e" || e.key === "E") {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || (Number(val) >= 0 && Number(val) <= 100000)) {
                              setForm((prev) => ({
                                ...prev,
                                adultFare: val,
                              }));
                            }
                          }}
                          className="w-full h-10 sm:h-11 rounded-lg border border-[#e4d5c4] bg-white pl-6 pr-2.5 text-xs sm:text-sm font-semibold text-stone-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-orange-300 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_2px_6px_rgba(249,115,22,0.08)] focus:border-orange-500 focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_3px_rgba(249,115,22,0.18)] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-4 flex items-center justify-between sm:flex-col sm:items-end sm:justify-center border-t sm:border-t-0 sm:border-l border-[#e8dcd0] pt-1.5 sm:pt-0 sm:pl-4">
                      <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        Adults Subtotal
                      </span>
                      <span className="text-xs sm:text-base font-extrabold text-stone-900 block mt-0.5 tabular-nums">
                        {form.adultFare.trim() !== "" && result.adultsTotalFare > 0 ? formatINR(result.adultsTotalFare) : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Children Card */}
                <div className="rounded-xl sm:rounded-2xl border border-[#ede1d3] bg-[#faf6f0]/80 p-2.5 sm:p-3.5 transition-all shadow-[0_2px_8px_rgba(180,140,100,0.04)]">
                  <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-3 items-end">
                    <div className="sm:col-span-4">
                      <label htmlFor="children-select" className="text-[11px] sm:text-xs font-bold text-stone-800 block mb-1">
                        Child (5-11 yrs)
                      </label>
                      <div className="relative">
                        <select
                          id="children-select"
                          value={form.children}
                          onChange={(e) => handleChildSelect(parseInt(e.target.value, 10))}
                          className="w-full h-10 sm:h-11 appearance-none rounded-lg border border-[#e4d5c4] bg-white px-3 pr-8 text-xs sm:text-sm font-semibold text-stone-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-orange-300 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_2px_6px_rgba(249,115,22,0.08)] focus:border-orange-500 focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_3px_rgba(249,115,22,0.18)] focus:outline-none cursor-pointer"
                        >
                          {[0, 1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? "Child" : "Children"}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="child-fare-input" className="text-[11px] sm:text-xs font-bold text-stone-800 block mb-1">
                        Fare per Child
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs sm:text-sm font-bold text-orange-500/80">
                          ₹
                        </span>
                        <input
                          id="child-fare-input"
                          type="number"
                          min="0"
                          max="100000"
                          step="any"
                          placeholder="0.00"
                          value={form.childFare ?? ""}
                          onWheel={(e) => e.currentTarget.blur()}
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e" || e.key === "E") {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || (Number(val) >= 0 && Number(val) <= 100000)) {
                              setForm((prev) => ({
                                ...prev,
                                childFare: val,
                              }));
                            }
                          }}
                          className="w-full h-10 sm:h-11 rounded-lg border border-[#e4d5c4] bg-white pl-6 pr-2.5 text-xs sm:text-sm font-semibold text-stone-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-orange-300 hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_2px_6px_rgba(249,115,22,0.08)] focus:border-orange-500 focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_3px_rgba(249,115,22,0.18)] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-4 flex items-center justify-between sm:flex-col sm:items-end sm:justify-center border-t sm:border-t-0 sm:border-l border-[#e8dcd0] pt-1.5 sm:pt-0 sm:pl-4">
                      <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        Children Subtotal
                      </span>
                      <span className="text-xs sm:text-base font-extrabold text-stone-900 block mt-0.5 tabular-nums">
                        {form.children > 0 && form.childFare && form.childFare.trim() !== ""
                          ? formatINR(result.childrenTotalFare)
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Combined Base Fare Bar */}
                <div className="p-2 sm:p-2.5 sm:px-3.5 bg-white rounded-xl border border-[#ede1d3] flex items-center justify-between gap-2 shadow-[0_2px_8px_rgba(180,140,100,0.05)]">
                  <div className="text-left shrink-0">
                    <span className="text-[9px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider block">
                      Total Pax
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs sm:text-sm font-extrabold text-stone-900 block tabular-nums">
                        {result.totalPassengers} Pax
                      </span>
                      <span className="text-stone-400 text-[10px] sm:text-xs hidden sm:inline truncate">
                        ({result.adults} Adults, {result.children} Children)
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider block">
                      Total Base Fare
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-stone-900 block mt-0.5 tabular-nums">
                      {result.railwayFare > 0 ? formatINR(result.railwayFare) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Train Category (Segmented Control) */}
            <div className="pt-0.5">
              <div className="flex items-center justify-between pb-1 mb-1 sm:pb-1.5 sm:mb-1.5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-stone-400" />
                  <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-900">
                    Train Category
                  </h3>
                </div>
                <span className="text-[9px] sm:text-[11px] font-semibold text-stone-600 bg-[#faf6f0] px-2 py-0.5 rounded-md border border-[#ede1d3]">
                  {form.category === "AC" ? "IRCTC: ₹35.40 • Agent: ₹40" : "IRCTC: ₹17.70 • Agent: ₹20"}
                </span>
              </div>

              {/* Clean Segmented Control: "AC" and "Non-AC" on mobile, full names on desktop */}
              <div role="group" aria-label="Select Train Category" className="grid grid-cols-2 gap-1 sm:gap-1.5 p-1 rounded-xl sm:rounded-2xl bg-[#f5ede3] border border-[#e8dcd0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]">
                <button
                  type="button"
                  aria-pressed={form.category === "AC"}
                  onClick={() => handleCategoryChange("AC")}
                  className={`py-1.5 sm:py-2.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ease-out cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 ${form.category === "AC"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_12px_rgba(249,115,22,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] -translate-y-0.5"
                      : "text-stone-600 hover:text-stone-900 hover:bg-white/80 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                >
                  <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-colors ${form.category === "AC" ? "bg-white shadow-xs" : "bg-stone-400"}`} />
                  <span>AC</span>
                  <span className="hidden sm:inline">(Air Conditioned)</span>
                </button>
                <button
                  type="button"
                  aria-pressed={form.category === "NON_AC"}
                  onClick={() => handleCategoryChange("NON_AC")}
                  className={`py-1.5 sm:py-2.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ease-out cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 ${form.category === "NON_AC"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_12px_rgba(249,115,22,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] -translate-y-0.5"
                      : "text-stone-600 hover:text-stone-900 hover:bg-white/80 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                >
                  <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-colors ${form.category === "NON_AC" ? "bg-white shadow-xs" : "bg-stone-400"}`} />
                  <span>Non-AC</span>
                  <span className="hidden sm:inline">(Sleeper/2S)</span>
                </button>
              </div>
            </div>

            {/* Action Toolbar: 3-column grid on mobile, flex on desktop */}
            <div className="pt-2 sm:pt-2.5 border-t border-[#f0e3d5] grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset fare calculator to defaults"
                className="col-span-2 inline-flex min-h-10 items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-[#e4d5c4] bg-white px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-stone-700 shadow-2xs hover:bg-[#faf6f0] hover:border-orange-300 hover:text-orange-700 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer group focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 sm:col-span-1"
                title="Reset calculation to default"
              >
                <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-stone-500 group-hover:-rotate-45 transition-transform duration-200" />
                <span>Reset</span>
              </button>
              <div className="col-span-2 grid grid-cols-2 gap-1.5 sm:col-span-1 sm:flex sm:items-center sm:gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  aria-label="Copy fare estimate breakdown to clipboard"
                  className="w-full sm:w-auto text-center rounded-lg border border-[#e4d5c4] bg-white px-1.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-stone-700 shadow-2xs hover:bg-[#faf6f0] hover:border-orange-300 hover:text-stone-900 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer truncate focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
                >
                  {copiedSummary ? "Copied" : "Copy"}
                </button>
                <InteractiveButton
                  as="button"
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  aria-label="Open print quotation modal"
                  label="Print Slip"
                  size="sm"
                  variant="orange"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Clean, Well-Defined Fare Summary Statement (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between pt-5 mt-3 border-t-2 border-dashed border-[#ecdccb] lg:pt-0 lg:mt-0 lg:border-t-0" aria-live="polite" aria-atomic="true">
            {/* Top group: Header + Fare Summary Content Card */}
            <div className="space-y-2 sm:space-y-3">
              {/* Summary Header aligned with left column header */}
              <div className="flex items-center justify-between pb-1.5 mb-2 sm:pb-3 sm:mb-4 border-b border-[#f0e3d5]">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="h-2 w-2 rounded-full bg-stone-800" />
                  <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-900">
                    Fare Summary
                  </h3>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-stone-700 bg-white px-2.5 py-0.5 rounded-md border border-[#e4d5c4] shadow-2xs">
                  {result.category === "AC" ? "AC" : "Non-AC"} • {result.totalPassengers} Pax
                </span>
              </div>

              {/* Fare Summary Content Card */}
              <div className="rounded-xl sm:rounded-2xl bg-[#faf6f0] p-3 sm:p-4.5 border border-[#ede1d3] shadow-[0_2px_12px_rgba(180,140,100,0.05)]">
                {/* Well-Defined Ledger Rows */}
                <div className="rounded-xl border border-[#e6d8c9] bg-white divide-y divide-[#f2e7dc] overflow-hidden shadow-2xs">
                  {/* Meta details */}
                  <div className="grid grid-cols-12 px-3.5 py-2.5 sm:py-3 text-xs">
                    <span className="col-span-6 text-stone-500 font-semibold">Category</span>
                    <span className="col-span-6 text-right font-bold text-stone-900">
                      {result.category === "AC" ? "AC (Air Conditioned)" : "Non-AC (Sleeper/2S)"}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 px-3.5 py-2.5 sm:py-3 text-xs">
                    <span className="col-span-6 text-stone-500 font-semibold">Passengers</span>
                    <span className="col-span-6 text-right font-bold text-stone-900">
                      {result.adults} {result.adults === 1 ? "Adult" : "Adults"}{result.children > 0 ? `, ${result.children} ${result.children === 1 ? "Child" : "Children"}` : ""}
                    </span>
                  </div>

                  {/* Item 1: Base Ticket Fare */}
                  <div className="grid grid-cols-12 px-3.5 py-3 sm:py-3.5 text-xs bg-[#fdfbf7]">
                    <span className="col-span-6 text-stone-700 font-bold">Base Ticket Fare</span>
                    <span className="col-span-6 text-right font-extrabold text-stone-900 tabular-nums">
                      {result.railwayFare > 0 ? formatINR(result.railwayFare) : "—"}
                    </span>
                  </div>

                  {/* Item 2: IRCTC Convenience Fee */}
                  <div className="grid grid-cols-12 px-3.5 py-3 sm:py-3.5 text-xs">
                    <span className="col-span-6 text-stone-700 font-bold">IRCTC Convenience Fee</span>
                    <span className="col-span-6 text-right font-extrabold text-stone-900 tabular-nums">
                      {result.railwayFare > 0 ? formatINR(result.irctcFee) : "—"}
                    </span>
                  </div>

                  {/* Item 3: Payment Gateway Charge */}
                  <div className="grid grid-cols-12 px-3.5 py-3 sm:py-3.5 text-xs bg-[#fdfbf7]">
                    <div className="col-span-7 pr-1">
                      <span className="text-stone-700 font-bold block">Payment Gateway (PG)</span>
                      <span className="inline-block text-[9.5px] font-semibold text-amber-800 bg-amber-100/70 border border-amber-200/80 px-1.5 py-0.2 rounded mt-0.5 whitespace-nowrap">
                        {result.railwayFare > 2000 ? "1% on (Fare + IRCTC)" : "0.75% on (Fare + IRCTC)"}
                      </span>
                    </div>
                    <span className="col-span-5 text-right font-extrabold text-stone-900 tabular-nums self-center">
                      {result.railwayFare > 0 ? formatINR(result.pgCharge) : "—"}
                    </span>
                  </div>

                  {/* Item 4: Agent Service Fee */}
                  <div className="grid grid-cols-12 px-3.5 py-3 sm:py-3.5 text-xs">
                    <span className="col-span-6 text-stone-700 font-bold">Agent Service Fee</span>
                    <span className="col-span-6 text-right font-extrabold text-stone-900 tabular-nums">
                      {result.railwayFare > 0 ? formatINR(result.agentFee) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Distinct, Separated Total Payable Amount Card */}
            <div className="mt-3.5 sm:mt-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 p-4 sm:p-5 text-white shadow-[0_4px_16px_rgba(249,115,22,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-orange-400/40">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-orange-100">
                  Total Payable Amount
                </span>
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight tabular-nums shrink-0">
                  {result.railwayFare > 0 ? formatINR(result.finalTotalPayable) : "—"}
                </span>
              </div>
              {result.railwayFare > 0 && result.amountInWords && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <span className="text-[11px] sm:text-xs text-orange-50/95 font-medium block leading-snug break-words">
                    {result.amountInWords}
                  </span>
                </div>
              )}
              {result.railwayFare <= 0 && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <span className="text-[11px] sm:text-xs text-orange-100/90 font-medium block leading-snug">
                    Enter passenger fare details on the left to calculate total amount.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Sticky Bottom Bar for Mobile Viewport */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#fffcf8]/95 backdrop-blur-md border-t border-[#ede1d3] px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between gap-2">
        <div className="min-w-0 pr-1">
          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block truncate">
            Total ({result.category === "AC" ? "AC" : "Non-AC"})
          </span>
          <span className="text-base font-black text-orange-600 leading-tight block truncate tabular-nums">
            {result.railwayFare > 0 ? formatINR(result.finalTotalPayable) : "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-[#e4d5c4] bg-white p-1.5 text-stone-600 shadow-2xs hover:bg-[#faf6f0] active:scale-95 transition-all cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopySummary}
            className="rounded-lg border border-[#e4d5c4] bg-white px-2.5 py-1.5 text-[11px] font-bold text-stone-700 shadow-2xs hover:bg-[#faf6f0] active:scale-95 transition-all cursor-pointer"
          >
            {copiedSummary ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Print Slip
          </button>
        </div>
      </div>

      {/* Print Estimate Slip Modal */}
      <PrintEstimateModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        result={result}
        referenceId={quotationRefId}
      />
    </div>
  );
}
