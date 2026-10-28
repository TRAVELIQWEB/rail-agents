"use client";

import { useState } from "react";
import { CheckSquare, Square, Printer, RotateCcw, CheckCircle2 } from "lucide-react";

type ChecklistItem = {
  id: string;
  label: string;
  category: "before" | "after" | "cancel";
  mandatory?: boolean;
};

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Before Booking
  {
    id: "b1",
    category: "before",
    label: "Confirm you are logged into your authorized commercial agent portal (never a personal IRCTC ID).",
    mandatory: true,
  },
  {
    id: "b2",
    category: "before",
    label: "Collect and verify exact passenger details: spelling of names, accurate ages, gender, and destination address if required.",
    mandatory: true,
  },
  {
    id: "b3",
    category: "before",
    label: "Enter the customer's own active mobile number (never the agency's number) for direct PNR and cancellation alerts.",
    mandatory: true,
  },
  {
    id: "b4",
    category: "before",
    label: "Obtain and record genuine customer consent/booking requisition slip as mandated under your scheme.",
    mandatory: true,
  },
  {
    id: "b5",
    category: "before",
    label: "Transparently inform the customer of total charges: railway fare + PG charge + permissible service charge.",
    mandatory: true,
  },
  {
    id: "b6",
    category: "before",
    label: "Explain ticket status realistically: confirm whether the seat is Confirmed, RAC, or Waitlisted (never promise charting).",
    mandatory: true,
  },

  // After Booking
  {
    id: "a1",
    category: "after",
    label: "Verify the issued ticket details (PNR, train number, class, quota, journey date, passenger names).",
    mandatory: true,
  },
  {
    id: "a2",
    category: "after",
    label: "Hand over the complete Electronic Reservation Slip (ERS) printout showing the official agency header and printed fare.",
    mandatory: true,
  },
  {
    id: "a3",
    category: "after",
    label: "Provide a valid receipt detailing the exact fare and authorized agency service charge collected.",
    mandatory: true,
  },
  {
    id: "a4",
    category: "after",
    label: "Safely file and archive the customer requisition slip, identification copy (if taken), and transaction ledger.",
    mandatory: true,
  },
  {
    id: "a5",
    category: "after",
    label: "Ensure passenger personal data and contact numbers are protected against third-party disclosure.",
    mandatory: true,
  },

  // Cancellation & Refund
  {
    id: "c1",
    category: "cancel",
    label: "Verify that the cancellation request originates directly from the passenger named on the ticket.",
    mandatory: true,
  },
  {
    id: "c2",
    category: "cancel",
    label: "Inspect ticket charting status and verify applicable Railway cancellation deduction slabs before proceeding.",
    mandatory: true,
  },
  {
    id: "c3",
    category: "cancel",
    label: "Execute cancellation through the official agent interface or file TDR within the permitted railway timeframe.",
    mandatory: true,
  },
  {
    id: "c4",
    category: "cancel",
    label: "Authenticate the refund through customer OTP verification or the prescribed PSP refund confirmation flow.",
    mandatory: true,
  },
  {
    id: "c5",
    category: "cancel",
    label: "Provide the passenger with the official cancellation slip showing the exact refund amount calculated by Indian Railways.",
    mandatory: true,
  },
  {
    id: "c6",
    category: "cancel",
    label: "Explain the official refund disbursement timeline clearly without making unverified promises.",
    mandatory: true,
  },
];

export function AgentComplianceChecklist() {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReset = () => {
    setCheckedIds({});
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const totalItems = CHECKLIST_ITEMS.length;
  const completedCount = Object.values(checkedIds).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalItems) * 100);

  const renderSection = (category: "before" | "after" | "cancel", title: string, subtitle: string) => {
    const items = CHECKLIST_ITEMS.filter((item) => item.category === category);
    return (
      <div className="mb-6 last:mb-0">
        <div className="mb-3 border-b border-slate-200 pb-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--navy)]">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="space-y-2.5">
          {items.map((item) => {
            const isChecked = !!checkedIds[item.id];
            return (
              <label
                key={item.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                  isChecked
                    ? "border-emerald-200 bg-emerald-50/50 text-emerald-950"
                    : "border-slate-200/90 bg-white hover:border-orange-200 hover:bg-orange-50/20 text-slate-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleItem(item.id)}
                  className="sr-only"
                />
                <span className="mt-0.5 shrink-0 text-slate-400">
                  {isChecked ? (
                    <CheckSquare className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400" />
                  )}
                </span>
                <span className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                  {item.label}
                  {item.mandatory && (
                    <span className="ml-2 inline-flex items-center rounded-sm bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                      Mandatory
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-7 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-extrabold text-[var(--navy)]">Interactive Agent Daily Compliance Checklist</h3>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Use this practical verification protocol every booking day to protect your agency against complaints, audit findings, and license suspensions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-slate-600" />
            <span>Print Checklist</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Reset checked items"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-5 print:hidden">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-slate-700">
          <span>Daily Verification Progress</span>
          <span className="text-orange-600">{completedCount} of {totalItems} completed ({progressPercent}%)</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="mt-5">
        {renderSection("before", "Phase 1: Before Initiating Booking", "Intake verification, passenger data validation & fare transparency")}
        {renderSection("after", "Phase 2: Post-Booking & Delivery", "ERS printouts, genuine receipts & record retention")}
        {renderSection("cancel", "Phase 3: Cancellation, TDR & Refunds", "Customer authorization, OTP authentication & refund confirmation")}
      </div>

      {/* Print Footer Note */}
      <div className="mt-5 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
        <p>
          <strong>Notice:</strong> This compliance checklist is an educational standard formulated by RailAgents for retail ticketing counters. Keep completed printed logs at your counter to demonstrate active compliance during authorized railway inspections.
        </p>
      </div>
    </div>
  );
}
