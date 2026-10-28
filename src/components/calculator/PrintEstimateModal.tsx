"use client";

import { useEffect, useRef, useState } from "react";
import { Printer, X, Info, Check, Copy } from "lucide-react";
import { CalculationResult, formatINR } from "@/lib/fare-calculator";
import { InteractiveButton } from "@/components/ui/InteractiveButton";

interface PrintEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  referenceId: string;
}

export function PrintEstimateModal({
  isOpen,
  onClose,
  result,
  referenceId,
}: PrintEstimateModalProps) {
  const [copied, setCopied] = useState(false);
  const slipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    // If the browser supports window.print directly:
    if (!slipRef.current) {
      window.print();
      return;
    }

    try {
      // Create an isolated hidden iframe for 100% reliable printing without page chrome interference
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc) {
        window.print();
        return;
      }

      const slipHtml = slipRef.current.innerHTML;

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Fare Estimate Slip - ${referenceId}</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                color: #0f172a;
                background: #ffffff;
                padding: 16px 20px;
                font-size: 13px;
                line-height: 1.5;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .slip-container {
                max-width: 680px;
                margin: 0 auto;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 12px 0;
              }
              th, td {
                padding: 8px 10px;
                border-bottom: 1px solid #e2e8f0;
                text-align: left;
                font-size: 12px;
              }
              th {
                background-color: #f8fafc;
                font-weight: 600;
                color: #475569;
              }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-bold { font-weight: 700; }
              .font-semibold { font-weight: 600; }
              .font-black { font-weight: 900; }
              .text-xs { font-size: 11px; }
              .text-sm { font-size: 13px; }
              .text-lg { font-size: 18px; }
              .text-amber { color: #b45309; }
              .bg-amber { background-color: #fffbeb; }
              .disclaimer-box {
                margin-top: 14px;
                padding: 10px 12px;
                background-color: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 6px;
                font-size: 11px;
                color: #92400e;
              }
              .footer-sign {
                margin-top: 18px;
                padding-top: 12px;
                border-top: 1px dashed #cbd5e1;
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #64748b;
              }
              @page {
                margin: 10mm;
                size: auto;
              }
            </style>
          </head>
          <body>
            <div class="slip-container">
              ${slipHtml}
            </div>
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                setTimeout(function() {
                  window.frameElement && window.frameElement.remove();
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      iframeDoc.close();
    } catch {
      // Fallback to standard window.print if iframe isolation errors
      window.print();
    }
  };


  const handleCopyText = async () => {
    const text = [
      `🚂 *RAIL TICKET FARE ESTIMATE*`,
      `Quotation Ref: ${referenceId}`,
      `Date: ${currentDate}`,
      `---------------------------------`,
      `Passengers: ${result.totalPassengers} (${result.adults} Adult${result.adults === 1 ? "" : "s"}${result.children > 0 ? `, ${result.children} Child${result.children === 1 ? "" : "ren"}` : ""})`,
      `Class: ${result.travelClass.code} - ${result.travelClass.name} (${result.category === "AC" ? "Air Conditioned" : "Non-AC"})`,
      `---------------------------------`,
      `• Total Railway Fare: ${formatINR(result.railwayFare)}`,
      `• IRCTC Convenience Fee: ${formatINR(result.irctcFee)}`,
      `• Agent Service Fee: ${formatINR(result.agentFee)}`,
      `• Payment Gateway Charge: ${formatINR(result.pgCharge)}`,
      result.otherCharges > 0 ? `• Other Charges / Taxes: ${formatINR(result.otherCharges)}` : null,
      `---------------------------------`,
      `*FINAL TOTAL PAYABLE: ${formatINR(result.finalTotalPayable)}*`,
      `Words: ${result.amountInWords}`,
      `---------------------------------`,
      `⚠️ *Disclaimer:* This is an estimated quotation for planning purposes, not a confirmed PRS railway ticket. Fares are subject to availability upon actual booking.`,
      `Provided via RailAgents.in`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="estimate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-orange-200">
        {/* Header Actions Bar (hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#fffaf5] px-4 py-3 sm:px-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-[var(--primary)]">
              <Printer className="h-4 w-4" />
            </span>
            <div>
              <h2 id="estimate-modal-title" className="text-sm font-bold text-[var(--navy)] sm:text-base">
                Customer Fare Estimate Slip
              </h2>
              <p className="text-xs text-slate-500">Ref: {referenceId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
              title="Copy estimate text to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
            <InteractiveButton
              as="button"
              type="button"
              onClick={handlePrint}
              label="Print Slip"
              icon={<Printer className="h-3.5 w-3.5 text-white" />}
              size="sm"
              variant="orange"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close estimate modal"
              className="icon-action ml-1 p-1.5 text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Quotation Content */}
        <div
          ref={slipRef}
          id="printable-estimate-slip"
          className="overflow-y-auto p-5 sm:p-7 text-slate-800 bg-white print:p-0 print:overflow-visible"
        >
          {/* Slip Header */}
          <div className="border-b-2 border-dashed border-orange-200 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-[var(--navy)]">
                    RailAgents<span className="text-[var(--primary)]">.in</span>
                  </span>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[var(--primary-dark)] uppercase tracking-wider">
                    Agent Quotation
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  IRCTC Agent Ticket Fare Breakdown & Payment Estimate
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Quotation No: {referenceId}</p>
                <p className="text-slate-500">Generated: {currentDate}</p>
              </div>
            </div>
          </div>

          {/* Journey & Passenger Meta */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-orange-50/70 p-3.5 text-xs border border-orange-100">
            <div>
              <span className="text-slate-500 block">Category</span>
              <span className="font-bold text-[var(--navy)] text-sm">
                {result.category === "AC" ? "AC (Air Conditioned)" : "Non-AC (Sleeper/2S)"}
              </span>
              <span className="block text-[11px] text-slate-600 truncate">
                {result.category === "AC" ? "IRCTC: ₹35.40 • Agent: ₹40" : "IRCTC: ₹17.70 • Agent: ₹20"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Passengers</span>
              <span className="font-bold text-[var(--navy)] text-sm">
                {result.totalPassengers} Passenger{result.totalPassengers > 1 ? "s" : ""}
              </span>
              <span className="block text-[11px] text-slate-600">
                {result.adults} Adult{result.adults === 1 ? "" : "s"}
                {result.children > 0 ? `, ${result.children} Child` : ""}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">PG Charge Rate</span>
              <span className="font-bold text-slate-700 text-xs">
                {result.railwayFare <= 2000 ? "0.75% (≤ ₹2,000)" : "1.00% (> ₹2,000)"}
              </span>
              <span className="block text-[10px] text-slate-500 truncate">
                {result.pgAppliedRateDescription}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Quota / Status</span>
              <span className="font-bold text-slate-700 text-xs">General / Normal</span>
              <span className="block text-[11px] text-emerald-700 font-medium">Estimated</span>
            </div>
          </div>

          {/* Detailed Itemized Charges Table */}
          <div className="mt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Itemized Charge Breakdown
            </h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 sm:px-4">Charge Component</th>
                    <th className="py-2.5 px-3 sm:px-4 text-center">Description / Rate</th>
                    <th className="py-2.5 px-3 sm:px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-3 sm:px-4 font-medium text-[var(--navy)]">
                      Total Railway Base Fare
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center text-xs text-slate-500">
                      Combined PRS fare for {result.totalPassengers} pax
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-semibold text-slate-900">
                      {formatINR(result.railwayFare)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 sm:px-4">IRCTC Convenience Fee</td>
                    <td className="py-2.5 px-3 sm:px-4 text-center text-xs text-slate-500">
                      {result.category === "AC" ? "Standard AC Fee" : "Standard Non-AC Fee"}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-medium">
                      {formatINR(result.irctcFee)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 sm:px-4">Agent Service Fee</td>
                    <td className="py-2.5 px-3 sm:px-4 text-center text-xs text-slate-500">
                      Booking service charge
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-medium">
                      {formatINR(result.agentFee)}
                    </td>
                  </tr>

                  <tr className="bg-orange-50/40">
                    <td className="py-2.5 px-3 sm:px-4 font-medium text-slate-900">
                      Payment Gateway (PG) Charge
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center text-xs text-slate-600">
                      {result.railwayFare <= 2000
                        ? "Fare ≤ ₹2,000 → Flat ₹0.75"
                        : "Fare > ₹2,000 → 1.00% of Base Fare"}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-semibold text-[var(--primary-dark)]">
                      {formatINR(result.pgCharge)}
                    </td>
                  </tr>

                  {result.otherCharges > 0 ? (
                    <tr>
                      <td className="py-2.5 px-3 sm:px-4">Other Verified Charges / Taxes</td>
                      <td className="py-2.5 px-3 sm:px-4 text-center text-xs text-slate-500">
                        Applicable taxes or charges
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-right font-medium">
                        {formatINR(result.otherCharges)}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
                <tfoot className="border-t-2 border-slate-300 bg-[#fffaf5]">
                  <tr>
                    <td colSpan={2} className="py-3 px-3 sm:px-4 text-sm font-bold text-[var(--navy)]">
                      Final Total Payable:
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-base sm:text-lg font-black text-[var(--primary)]">
                      {formatINR(result.finalTotalPayable)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Total In Words */}
            <div className="mt-2.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 border border-slate-200">
              <span className="font-semibold text-slate-900">Amount in Words: </span>
              <span className="italic">{result.amountInWords}</span>
            </div>
          </div>

          {/* Official Estimate Disclaimer */}
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
              <div className="leading-relaxed">
                <p className="font-bold text-amber-950">Important Estimate Disclaimer:</p>
                <p className="mt-0.5 text-[11px] text-amber-800">
                  This calculation slip is an estimated quotation prepared for customer reference and cost clarity. It is <strong>NOT</strong> an official Indian Railways reservation ticket, e-ticket, or confirmed PNR. Ticket issuance is strictly subject to real-time seat availability and PRS reservation system confirmation at the time of final booking.
                </p>
              </div>
            </div>
          </div>

          {/* Agent Stamp / Verification Box */}
          <div className="mt-6 pt-4 border-t border-dashed border-slate-200 grid grid-cols-2 gap-4 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">Issued by RailAgents Verified Agent</p>
              <p className="text-[11px] mt-0.5">Assistance with IRCTC authorized bookings & travel planning</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-slate-300 w-36 ml-auto" />
              <p className="mt-1 text-[11px] font-medium text-slate-600">Authorized Agent Stamp / Sign</p>
            </div>
          </div>
        </div>

        {/* Footer info in Modal */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 print:hidden">
          <p className="text-xs text-slate-500">
            Press <kbd className="rounded bg-white px-1.5 py-0.5 border text-[10px] font-mono shadow-sm">Ctrl+P</kbd> or click Print Slip.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
