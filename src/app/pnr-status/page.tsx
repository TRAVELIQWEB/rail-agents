"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Copy,
  Printer,
  CheckCircle2,
  ClipboardCheck,
  CircleHelp,
  Info,
  RefreshCw,
  Search,
  TicketCheck,
  TrainFront,
  ChevronDown,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { InternalLink } from "@/components/ui/InternalLink";

const statusTypes = [
  {
    code: "CNF",
    title: "Confirmed",
    body: "Your reservation is confirmed.",
  },
  {
    code: "RAC",
    title: "Reservation Against Cancellation",
    body: "You can travel with a valid RAC ticket.",
  },
  {
    code: "WL",
    title: "Waiting List",
    body: "Your reservation is not yet confirmed.",
  },
  {
    code: "GNWL",
    title: "General Waiting List",
    body: "Waiting list under the general quota.",
  },
  {
    code: "RLWL",
    title: "Remote Location Waiting List",
    body: "Waiting list for designated intermediate stations.",
  },
  {
    code: "PQWL",
    title: "Pooled Quota Waiting List",
    body: "Waiting list under a shared quota.",
  },
  {
    code: "TQWL",
    title: "Tatkal Quota Waiting List",
    body: "Waiting list under the Tatkal quota.",
  },
  {
    code: "RSWL",
    title: "Roadside Station Waiting List",
    body: "Waiting list for certain roadside stations.",
  },
  {
    code: "RQWL",
    title: "Request Waiting List",
    body: "Waiting list for certain station pairs.",
  },
];

const faqs = [
  {
    q: "Where can I find my PNR number?",
    a: "Your 10-digit PNR is printed near the top of your railway ticket or shown in your booking details in the app where you booked.",
  },
  {
    q: "What do CNF, RAC and WL mean?",
    a: "CNF means confirmed, RAC means you may travel with a shared berth, and WL means you are still waiting for a confirmed reservation. The exact meaning can depend on your ticket type and current railway rules.",
  },
  {
    q: "When does my PNR status become final?",
    a: "Your status can change before the reservation chart is prepared. Check the latest official railway status close to departure for the most reliable update.",
  },
  {
    q: "Is this page showing live PNR results?",
    a: "Yes. Each lookup requests the latest available status from RailAgents’ railway provider. A private lookup link is kept in this browser session so refresh can restore your search; if session storage is unavailable, the PNR may appear in the page URL and browser history.",
  },
];

const PNR_SESSION_KEY_PREFIX = "railagents:pnr-lookup:";
const pendingPnrLookups = new Map<string, Promise<unknown>>();

function readPnrFromSession(lookupId: string): string | null {
  try {
    const value = window.sessionStorage.getItem(`${PNR_SESSION_KEY_PREFIX}${lookupId}`);
    return value && /^\d{10}$/.test(value) ? value : null;
  } catch {
    return null;
  }
}

function savePnrToSession(pnr: string): string | null {
  try {
    const bytes = window.crypto.getRandomValues(new Uint8Array(16));
    const lookupId = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    window.sessionStorage.setItem(`${PNR_SESSION_KEY_PREFIX}${lookupId}`, pnr);
    return lookupId;
  } catch {
    return null;
  }
}

function lookupUrl(pathname: string, currentSearch: string, lookupId: string | null, rawPnr?: string): string {
  const params = new URLSearchParams(currentSearch);
  params.delete("pnr");
  params.delete("lookup");
  if (lookupId) params.set("lookup", lookupId);
  else if (rawPnr) params.set("pnr", rawPnr);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function fetchPnrLookup(pnr: string, forceRefresh = false): Promise<unknown> {
  const lookupKey = `${pnr}:${forceRefresh ? "fresh" : "cached"}`;
  const pending = pendingPnrLookups.get(lookupKey);
  if (pending) return pending;

  const request = (async () => {
    const response = await fetch(`/api/pnr/${encodeURIComponent(pnr)}${forceRefresh ? "?refresh=1" : ""}`, { cache: "no-store" });
    const body = await response.json();
    if (!response.ok || body.success !== true || !body.data) {
      throw new Error(typeof body.error === "string" ? body.error : "Could not retrieve this PNR. Please try again.");
    }
    return body.data as unknown;
  })();
  pendingPnrLookups.set(lookupKey, request);
  void request.then(
    () => { if (pendingPnrLookups.get(lookupKey) === request) pendingPnrLookups.delete(lookupKey); },
    () => { if (pendingPnrLookups.get(lookupKey) === request) pendingPnrLookups.delete(lookupKey); },
  );
  return request;
}

type DataRecord = Record<string, unknown>;

function asRecord(value: unknown): DataRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as DataRecord
    : null;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return "—";
}

function pickValue(record: DataRecord, keys: string[]): unknown {
  for (const key of keys) {
    const foundKey = Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
    if (foundKey && record[foundKey] !== null && record[foundKey] !== undefined && record[foundKey] !== "") {
      return record[foundKey];
    }
  }
  return undefined;
}

function displayStatus(value: unknown): string {
  const plain = displayValue(value);
  if (plain !== "—") return plain;
  const record = asRecord(value);
  if (!record) return "—";
  const formatted = displayValue(pickValue(record, ["formatted", "displayText", "label"]));
  if (formatted !== "—") return formatted;
  const parts = [
    pickValue(record, ["status", "statusText", "bookingStatus", "currentStatus"]),
    pickValue(record, ["coach", "coachId", "coachNumber", "coachNo"]),
    pickValue(record, ["berth", "berthNo", "berthNumber", "seatNumber", "seatNo"]),
    pickValue(record, ["berthCode", "berthType", "seatType"]),
    pickValue(record, ["quota"]),
  ].map(displayValue).filter((part) => part !== "—");
  return parts.length ? parts.join(" / ") : "—";
}

function isCancelledStatus(status: string): boolean {
  const trimmed = status.trim();
  if (!trimmed || trimmed === "—") return false;
  return /\b(?:CAN|CANCELLED|CANCELED)\b|^CAN(?:$|[\s/:-])|cancel/i.test(trimmed);
}

function getPnrStatusTone(status: string) {
  if (isCancelledStatus(status)) return "border-rose-200 bg-rose-50 text-rose-800";
  if (/\bCNF\b|confirmed/i.test(status)) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (/\bRAC\b/i.test(status)) return "border-blue-200 bg-blue-50 text-blue-800";
  if (/\bWL\b|waitlist|waiting/i.test(status)) return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

function getPnrStatusDotTone(status: string) {
  if (isCancelledStatus(status)) return "bg-rose-600";
  if (/\bCNF\b|confirmed/i.test(status)) return "bg-emerald-600";
  if (/\bRAC\b/i.test(status)) return "bg-blue-600";
  if (/\bWL\b|waitlist|waiting/i.test(status)) return "bg-amber-500";
  return "bg-slate-400";
}

function getPnrStatusKind(status: string): "confirmed" | "rac" | "waiting" | "cancelled" | "unavailable" {
  if (isCancelledStatus(status)) return "cancelled";
  if (/\bCNF\b|confirmed/i.test(status)) return "confirmed";
  if (/\bRAC\b/i.test(status)) return "rac";
  if (/\bWL\b|waitlist|waiting/i.test(status)) return "waiting";
  return "unavailable";
}

const pnrStatusLabels = {
  confirmed: "Confirmed",
  rac: "RAC",
  waiting: "Waiting list",
  cancelled: "Cancelled",
  unavailable: "Status unavailable",
} as const;

function formatStation(value: unknown, record: DataRecord, codeAliases: string[], nameAliases: string[]): string {
  const station = asRecord(value);
  if (!station) return displayValue(value ?? pickValue(record, nameAliases) ?? pickValue(record, codeAliases));
  const code = displayValue(pickValue(station, ["code", "stationCode", "stnCode"]));
  const name = displayValue(pickValue(station, ["name", "stationName", "stnName"]));
  if (code !== "—" && name !== "—") return `${name} (${code})`;
  return code !== "—" ? code : name;
}

function isRacOrWaitlisted(value: unknown): boolean {
  const record = asRecord(value);
  const status = record
    ? pickValue(record, ["status", "statusText", "currentStatus", "formatted", "displayText"])
    : value;
  return /^(?:RAC|[A-Z]*WL)(?:$|[\s/:-])/i.test(displayValue(status).trim());
}

/** Validate and format provider probability value without inventing percentages. */
function parseProviderProbability(value: unknown): { formatted: string; numeric: number | null } | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0 || value > 100) return null;
    const rounded = Math.round(value * 10) / 10;
    return { formatted: `${rounded}%`, numeric: rounded };
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "—" || /^(n\/a|null|undefined|unknown|none)$/i.test(trimmed)) return null;
    const match = /^(\d+(?:\.\d+)?)\s*%?$/.exec(trimmed);
    if (match) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) {
        const rounded = Math.round(parsed * 10) / 10;
        return { formatted: `${rounded}%`, numeric: rounded };
      }
    }
  }
  return null;
}

type PredictionToneKind = "high" | "medium" | "low" | "unknown";

function classifyPrediction(
  rawStatus: string,
  probabilityNumeric: number | null,
): {
  kind: PredictionToneKind;
  headline: string;
  badgeLabel: string;
  badgeClass: string;
  panelBorderClass: string;
  dividerClass: string;
  dotClass: string;
} {
  const normalized = rawStatus.trim();
  let kind: PredictionToneKind = "unknown";

  if (normalized !== "—") {
    if (/\b(high|confirmed|cnf|probable|very\s+likely|good)\b/i.test(normalized)) {
      kind = "high";
    } else if (/\b(medium|moderate|fair|average)\b/i.test(normalized)) {
      kind = "medium";
    } else if (/\b(low|unlikely|poor|slim)\b/i.test(normalized)) {
      kind = "low";
    } else if (/\b(rac)\b/i.test(normalized)) {
      if (probabilityNumeric !== null) {
        kind = probabilityNumeric >= 70 ? "high" : probabilityNumeric >= 40 ? "medium" : "low";
      } else {
        kind = "medium";
      }
    } else if (/\b([a-z]*wl|waitlist|waiting)\b/i.test(normalized)) {
      if (probabilityNumeric !== null) {
        kind = probabilityNumeric >= 70 ? "high" : probabilityNumeric >= 40 ? "medium" : "low";
      } else {
        kind = "low";
      }
    }
  } else if (probabilityNumeric !== null) {
    kind = probabilityNumeric >= 70 ? "high" : probabilityNumeric >= 40 ? "medium" : "low";
  }

  const isRawCodeOnly =
    normalized === "—" ||
    /^(high|medium|moderate|low|wl|[a-z]+wl|rac|cnf|confirmed|waitlist|waiting)$/i.test(normalized);

  const defaultHeadline =
    kind === "high"
      ? "High confirmation chance"
      : kind === "medium"
        ? "Medium confirmation chance"
        : kind === "low"
          ? "Low confirmation chance"
          : "Prediction status unavailable";

  const headline = isRawCodeOnly ? defaultHeadline : normalized;

  if (kind === "high") {
    return {
      kind,
      headline,
      badgeLabel: "High chance",
      badgeClass: "border-emerald-300 bg-emerald-50 text-emerald-900",
      panelBorderClass: "border-2 border-[#86EFAC] bg-[#F0FDF4]/65",
      dividerClass: "border-[#86EFAC]/50",
      dotClass: "bg-emerald-600",
    };
  }
  if (kind === "medium") {
    return {
      kind,
      headline,
      badgeLabel: "Medium chance",
      badgeClass: "border-amber-300 bg-amber-50 text-amber-900",
      panelBorderClass: "border-2 border-[#FBBF24] bg-[#FFFBEB]/65",
      dividerClass: "border-[#FBBF24]/45",
      dotClass: "bg-amber-500",
    };
  }
  if (kind === "low") {
    return {
      kind,
      headline,
      badgeLabel: "Low chance",
      badgeClass: "border-rose-300 bg-rose-50 text-rose-900",
      panelBorderClass: "border-2 border-[#FCA5A5] bg-[#FEF2F2]/65",
      dividerClass: "border-[#FCA5A5]/50",
      dotClass: "bg-rose-600",
    };
  }
  return {
    kind,
    headline,
    badgeLabel: "Unavailable",
    badgeClass: "border-slate-300 bg-slate-100 text-slate-700",
    panelBorderClass: "border-2 border-slate-300 bg-slate-50/80",
    dividerClass: "border-slate-200",
    dotClass: "bg-slate-400",
  };
}

function humanizeFieldKey(key: string): string {
  const dictionary: Record<string, string> = {
    pnrnumber: "PNR number",
    chancepercent: "Estimated probability",
    confirmationprobability: "Estimated probability",
    probability: "Estimated probability",
    confirmationchance: "Confirmation chance",
    chancepercentage: "Estimated probability",
    status: "Prediction classification",
    predictionstatus: "Prediction classification",
    predictedstatus: "Predicted status",
    message: "Summary note",
    summary: "Summary note",
    explanation: "Explanation",
    trends: "Historical trends",
    serialnumber: "Passenger #",
    passengernumber: "Passenger #",
    bookingstatus: "Booking status",
    currentstatus: "Current status",
  };
  const lower = key.toLowerCase();
  if (dictionary[lower]) return dictionary[lower];
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatTechnicalCellValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (/chance|probability|percent/i.test(key)) {
    const parsed = parseProviderProbability(value);
    if (parsed) return parsed.formatted;
  }
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === "object" && item !== null ? JSON.stringify(item) : String(item))).join(", ") || "—";
    }
    return JSON.stringify(value);
  }
  return String(value);
}

function ExpandablePredictionDetails({ data, meta }: { data: DataRecord; meta?: unknown }) {
  const scalarEntries = Object.entries(data).filter(
    ([key, item]) =>
      (item === null || typeof item !== "object") &&
      key.toLowerCase() !== "pnrnumber" &&
      item !== null &&
      item !== undefined &&
      item !== "",
  );
  const nestedEntries = Object.entries(data).filter(
    ([, item]) => item !== null && typeof item === "object",
  );
  const metaRecord = asRecord(meta);
  const metaEntries = metaRecord
    ? Object.entries(metaRecord).filter(([, item]) => item !== null && item !== undefined && item !== "")
    : [];

  if (scalarEntries.length === 0 && nestedEntries.length === 0 && metaEntries.length === 0) {
    return null;
  }

  return (
    <details className="group mt-2.5 rounded-xl border border-slate-200 bg-slate-50/70">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-2 text-xs font-bold text-[#0b2240] marker:hidden hover:bg-slate-100/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600">
        <span className="inline-flex items-center gap-1.5">
          <Info aria-hidden="true" className="h-3.5 w-3.5 text-orange-600" />
          Prediction details
        </span>
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 text-slate-500 transition-transform duration-150 group-open:rotate-180"
        />
      </summary>
      <div className="space-y-2.5 border-t border-slate-200 bg-white px-3.5 py-3 text-xs">
        {scalarEntries.length > 0 && (
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {scalarEntries.map(([key, item]) => (
              <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2">
                <dt className="text-[11px] font-semibold text-slate-500">{humanizeFieldKey(key)}</dt>
                <dd className="mt-0.5 break-words font-bold text-slate-800">
                  {formatTechnicalCellValue(key, item)}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {nestedEntries.map(([key, item]) => {
          if (Array.isArray(item)) {
            if (item.length === 0) return null;
            const objectRows = item.map(asRecord).filter((r): r is DataRecord => r !== null);
            if (objectRows.length === item.length) {
              const columns = [...new Set(objectRows.flatMap((row) => Object.keys(row)))];
              return (
                <div key={key} className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {humanizeFieldKey(key)}
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full min-w-max border-collapse text-left text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          {columns.map((col) => (
                            <th key={col} className="border-b border-slate-200 px-2.5 py-1.5 font-semibold text-slate-600">
                              {humanizeFieldKey(col)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {objectRows.map((row, idx) => (
                          <tr key={idx} className="even:bg-slate-50/40">
                            {columns.map((col) => (
                              <td key={col} className="px-2.5 py-1.5 text-slate-800">
                                {formatTechnicalCellValue(col, row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }
            return (
              <div key={key} className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {humanizeFieldKey(key)}
                </p>
                <ul className="list-inside list-disc space-y-1 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-slate-700">
                  {item.map((entry, idx) => (
                    <li key={idx}>{formatTechnicalCellValue(key, entry)}</li>
                  ))}
                </ul>
              </div>
            );
          }

          const subRecord = asRecord(item);
          if (!subRecord) return null;
          const subEntries = Object.entries(subRecord).filter(
            ([, val]) => val !== null && val !== undefined && val !== "",
          );
          if (subEntries.length === 0) return null;

          return (
            <div key={key} className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {humanizeFieldKey(key)}
              </p>
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {subEntries.map(([subKey, subVal]) => (
                  <div key={subKey} className="rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-1.5">
                    <dt className="text-[11px] font-semibold text-slate-500">{humanizeFieldKey(subKey)}</dt>
                    <dd className="mt-0.5 break-words font-semibold text-slate-800">
                      {formatTechnicalCellValue(subKey, subVal)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}

        {metaEntries.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
            {metaEntries.map(([k, v]) => (
              <span key={k}>
                <strong className="font-semibold text-slate-600">{humanizeFieldKey(k)}:</strong>{" "}
                {formatTechnicalCellValue(k, v)}
              </span>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

function journeyDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const date = new Date(value.slice(0, 10) + "T12:00:00Z");
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

function formatPnrDateTime(value: unknown): string {
  if (typeof value !== "string") return displayValue(value);
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(date)
    : value;
}

function journeyTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (!match) {
    const date = new Date(value);
    return /T\d{2}:\d{2}/.test(value) && Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }).format(date)
      : value;
  }
  const h = Number(match[1]);
  return h > 23 || Number(match[2]) > 59 ? value : String(h % 12 || 12).padStart(2, "0") + ":" + match[2] + (h >= 12 ? " PM" : " AM");
}

function StationDisplay({ value }: { value: string }) {
  const match = /^(.*?)\s*\(([^)]+)\)$/.exec(value);
  return (
    <p className="break-words text-sm font-extrabold tracking-tight text-[#0F172A] sm:text-base">
      {match ? (
        <>
          {match[1]}{" "}
          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-slate-700">
            {match[2]}
          </span>
        </>
      ) : value === "—" ? (
        "Station unavailable"
      ) : (
        value
      )}
    </p>
  );
}

function PassengerConfirmation({ status }: { status: string }) {
  const kind = getPnrStatusKind(status);
  const label = status === "—" ? pnrStatusLabels.unavailable : pnrStatusLabels[kind];
  const tone = getPnrStatusTone(status);
  const dotTone = getPnrStatusDotTone(status);
  return (
    <span className={`inline-flex cursor-default items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-bold ${tone}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotTone}`} />
      {label}
    </span>
  );
}

function CopyPnr({ pnr }: { pnr: string }) {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(pnr);
      setMessage("Copied");
      window.setTimeout(() => setMessage(""), 2500);
    } catch {
      setMessage("Copy manually");
    }
  }
  return (
    <div className="group/copy relative flex items-center gap-1.5">
      {message && (
        <span role="status" aria-live="polite" className="text-[11px] font-semibold text-emerald-700">
          {message}
        </span>
      )}
      {!message && <span role="status" aria-live="polite" className="sr-only" />}
      <button
        type="button"
        title="Copy PNR"
        aria-label={message === "Copied" ? "PNR copied" : "Copy PNR number"}
        onClick={copy}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
      >
        <Copy aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

function PnrResult({ response, pnr }: { response: unknown; pnr: string }) {
  const outer = asRecord(response) ?? {};
  const record = asRecord(outer.data) ?? asRecord(outer.result) ?? asRecord(outer.pnrStatus) ?? outer;
  const trainRecord = asRecord(pickValue(record, ["train", "trainDetails", "trainInfo"]));
  const chartingRecord = asRecord(pickValue(record, ["charting", "chartDetails"]));
  const trainNumber = displayValue(
    pickValue(record, ["trainNumber", "train_no", "trainNo", "train_num"]) ??
      (trainRecord && pickValue(trainRecord, ["trainNumber", "train_no", "trainNo", "number"])),
  );
  const trainName = displayValue(
    pickValue(record, ["trainName", "train_name"]) ??
      (trainRecord && pickValue(trainRecord, ["trainName", "train_name", "name"])),
  );
  const trainDate = displayValue(
    pickValue(trainRecord ?? record, ["trainDate", "journeyDate", "dateOfJourney", "doj", "journey_date", "travelDate"]),
  );
  const boardingDate = displayValue(
    pickValue(record, ["boardingDate", "boarding_date", "dateOfBoarding"]) ??
      pickValue(trainRecord ?? record, ["boardingDate", "boarding_date", "dateOfBoarding", "journeyDate"]),
  );
  const journeyClass = displayValue(
    pickValue(trainRecord ?? record, ["journeyClass", "class", "className", "trainClass"]),
  );
  const passengersValue = pickValue(record, [
    "passengers",
    "passengerStatus",
    "passengerDetails",
    "passengerList",
    "psgnDtlList",
  ]);
  const passengers = Array.isArray(passengersValue)
    ? passengersValue.map(asRecord).filter((item): item is DataRecord => item !== null)
    : [];
  const firstBooking = passengers.length ? asRecord(pickValue(passengers[0], ["booking", "bookingStatus"])) : null;
  const quota = displayValue(
    pickValue(record, ["quota", "quotaName", "quotaCode"]) ?? (firstBooking && pickValue(firstBooking, ["quota"])),
  );
  const fromValue = pickValue(trainRecord ?? record, ["from", "source", "origin", "fromStation", "originStation"]);
  const toValue = pickValue(trainRecord ?? record, [
    "to",
    "destination",
    "toStation",
    "destinationStation",
    "reservationUpto",
  ]);
  const reservationUptoValue = pickValue(trainRecord ?? record, [
    "reservationUpto",
    "reservationUptoStation",
    "reservedUpto",
  ]);
  const boardingValue = pickValue(trainRecord ?? record, ["boardingStation", "boardingPoint", "boarding_point"]);
  const fromStation = formatStation(
    fromValue,
    trainRecord ?? record,
    ["fromCode", "sourceCode", "originCode", "fromStationCode", "sourceStationCode"],
    ["fromName", "sourceName", "originName", "fromStationName", "sourceStationName"],
  );
  const toStation = formatStation(
    toValue,
    trainRecord ?? record,
    ["toCode", "destinationCode", "toStationCode", "destinationStationCode", "reservationUptoCode"],
    ["toName", "destinationName", "toStationName", "destinationStationName", "reservationUptoName"],
  );
  const reservationUpto = formatStation(
    reservationUptoValue,
    trainRecord ?? record,
    ["reservationUptoCode", "reservedUptoCode"],
    ["reservationUptoName", "reservedUptoName"],
  );
  const boardingStation = formatStation(
    boardingValue,
    trainRecord ?? record,
    ["boardingStationCode", "boardingPointCode", "boardingCode"],
    ["boardingStationName", "boardingPointName", "boardingName"],
  );
  const departureTime = displayValue(
    pickValue(trainRecord ?? record, [
      "departureTime",
      "departTime",
      "depTime",
      "boardingTime",
      "departure",
      "scheduledDepartureTime",
      "journeyDepartureTime",
    ]),
  );
  const chartStatus = displayValue(
    chartingRecord
      ? pickValue(chartingRecord, ["status", "chartStatus", "chartingStatus"])
      : pickValue(record, ["chartStatus", "chartingStatus"]),
  );
  const chartPrepared = chartingRecord
    ? pickValue(chartingRecord, ["isPrepared", "prepared"])
    : pickValue(record, ["chartPrepared", "isChartPrepared"]);
  const estimatedChartTime = displayValue(
    pickValue(chartingRecord ?? record, [
      "estimatedPreparationTime",
      "estimatedChartPreparationTime",
      "expectedPreparationTime",
      "estimatedAt",
    ]),
  );

  const passengerRows = passengers.map((passenger, index) => {
    const booking = displayStatus(
      pickValue(passenger, ["bookingStatus", "booking", "bookingStatusDetails", "booking_status", "bookingStatusText"]),
    );
    const current = displayStatus(
      pickValue(passenger, [
        "currentStatus",
        "current",
        "currentStatusDetails",
        "current_status",
        "currentStatusText",
        "status",
      ]),
    );
    const allocation = asRecord(pickValue(passenger, ["currentStatus", "current", "currentStatusDetails", "current_status"]));
    const parts = current.split(/\s*\/\s*/);
    const allocated = /^(CNF|RAC)$/i.test(parts[0]) && parts.length >= 3;
    const coach = displayValue(
      (allocation && pickValue(allocation, ["coach", "coachId", "coachNumber", "coachNo"])) ??
        (allocated ? parts[1] : undefined),
    );
    const seat = displayValue(
      (allocation && pickValue(allocation, ["berth", "berthNo", "berthNumber", "seatNumber", "seatNo"])) ??
        (allocated ? parts[2] : undefined),
    );
    const seatType = displayValue(allocation && pickValue(allocation, ["berthCode", "berthType", "seatType"]));
    const serial = displayValue(pickValue(passenger, ["serialNumber", "serialNo", "sNo", "sno"]));
    const coachBerthParts = [
      coach !== "—" ? `Coach ${coach}` : null,
      seat !== "—" ? `Berth ${seat}` : null,
      seatType !== "—" ? `(${seatType})` : null,
    ].filter(Boolean);

    return {
      id: `${serial}-${index}`,
      serial: serial === "—" ? index + 1 : serial,
      booking,
      current,
      coach,
      seat,
      seatType,
      coachBerthLabel: coachBerthParts.length > 0 ? coachBerthParts.join(" · ") : "—",
    };
  });

  const passengerStatusCounts = passengerRows.reduce<Record<string, number>>((counts, passenger) => {
    const kind = getPnrStatusKind(passenger.current);
    if (kind !== "unavailable") counts[kind] = (counts[kind] ?? 0) + 1;
    return counts;
  }, {});
  const passengerBookingCounts = passengerRows.reduce<Record<string, number>>((counts, passenger) => {
    const kind = getPnrStatusKind(passenger.booking);
    if (kind !== "unavailable") counts[kind] = (counts[kind] ?? 0) + 1;
    return counts;
  }, {});
  const passengerKinds = Object.keys(passengerStatusCounts) as Array<keyof typeof pnrStatusLabels>;
  const bookingKinds = Object.keys(passengerBookingCounts) as Array<keyof typeof pnrStatusLabels>;
  const knownCurrentCount = Object.values(passengerStatusCounts).reduce((total, count) => total + count, 0);
  const unavailableCurrentCount = passengers.length - knownCurrentCount;
  const providerOverallStatus = displayStatus(pickValue(record, ["currentStatus", "status"]));
  const providerOverallKind = getPnrStatusKind(providerOverallStatus);

  const cancelledCount = passengerStatusCounts.cancelled ?? 0;
  const totalPassengers = passengerRows.length;
  const isAllCancelled =
    (totalPassengers > 0 && cancelledCount === totalPassengers) ||
    (totalPassengers === 0 && providerOverallKind === "cancelled");
  const isPartiallyCancelled =
    totalPassengers > 0 && cancelledCount > 0 && cancelledCount < totalPassengers;

  const overallStatusText = isAllCancelled
    ? totalPassengers > 1
      ? `All ${totalPassengers} Passengers Cancelled`
      : totalPassengers === 1
        ? "All 1 Passenger Cancelled"
        : pnrStatusLabels.cancelled
    : isPartiallyCancelled
      ? `${cancelledCount} of ${totalPassengers} Passengers Cancelled`
      : passengerKinds.length === 1
        ? unavailableCurrentCount === 0
          ? passengerKinds[0] === "confirmed"
            ? "Confirmed (CNF)"
            : pnrStatusLabels[passengerKinds[0]]
          : `${passengerStatusCounts[passengerKinds[0]]} ${pnrStatusLabels[passengerKinds[0]].toLowerCase()} · ${unavailableCurrentCount} unavailable`
        : passengerKinds.length > 1
          ? [
              ...passengerKinds.map((kind) => `${passengerStatusCounts[kind]} ${pnrStatusLabels[kind].toLowerCase()}`),
              ...(unavailableCurrentCount > 0 ? [`${unavailableCurrentCount} unavailable`] : []),
            ].join(" · ")
          : providerOverallKind !== "unavailable"
            ? pnrStatusLabels[providerOverallKind]
            : bookingKinds.length > 0
              ? `Booking: ${bookingKinds.map((kind) => `${passengerBookingCounts[kind]} ${pnrStatusLabels[kind].toLowerCase()}`).join(" · ")}`
              : "Status unavailable";

  const overallKind: keyof typeof pnrStatusLabels = isAllCancelled
    ? "cancelled"
    : passengerKinds.length === 1 && unavailableCurrentCount === 0
      ? passengerKinds[0]
      : passengerKinds.includes("waiting")
        ? "waiting"
        : passengerKinds.includes("rac")
          ? "rac"
          : passengerKinds.includes("confirmed")
            ? "confirmed"
            : providerOverallKind;

  const overallStatusTone = getPnrStatusTone(pnrStatusLabels[overallKind]);
  const overallDotTone = getPnrStatusDotTone(pnrStatusLabels[overallKind]);

  const bookingPanelSurface =
    overallKind === "confirmed"
      ? "border-2 border-[#86EFAC] bg-[#F0FDF4]/65"
      : overallKind === "rac"
        ? "border-2 border-[#93C5FD] bg-[#EFF6FF]/65"
        : overallKind === "waiting"
          ? "border-2 border-[#F5B942] bg-[#FFFBEB]/65"
          : overallKind === "cancelled"
            ? "border-2 border-[#FCA5A5] bg-[#FEF2F2]/65"
            : "border-2 border-slate-300 bg-slate-50/80";

  const bookingPanelDivider =
    overallKind === "confirmed"
      ? "border-[#86EFAC]/50"
      : overallKind === "rac"
        ? "border-[#93C5FD]/50"
        : overallKind === "waiting"
          ? "border-[#F5B942]/45"
          : overallKind === "cancelled"
            ? "border-[#FCA5A5]/50"
            : "border-slate-200";

  // Primary position or coach/berth summary for Status Panel A
  const primaryPassenger = passengerRows[0];
  const currentPositionDetail = primaryPassenger
    ? passengerRows.length === 1 && !isAllCancelled
      ? primaryPassenger.coachBerthLabel !== "—"
        ? `${primaryPassenger.current} · ${primaryPassenger.coachBerthLabel}`
        : `Current: ${primaryPassenger.current}${primaryPassenger.booking !== "—" ? ` (Booked: ${primaryPassenger.booking})` : ""}`
      : passengerRows.map((p) => `P${p.serial}: ${p.current}`).join(" · ")
    : providerOverallStatus !== "—"
      ? `Current status: ${providerOverallStatus}`
      : "Passenger status details listed below";

  // Chart preparation classification (Prepared vs Not Prepared vs Unknown)
  const isChartExplicitlyPrepared =
    chartPrepared === true ||
    (chartPrepared !== false && /^(?:chart\s+)?prepared$/i.test(chartStatus.trim()) && !/not/i.test(chartStatus));
  const isChartExplicitlyNotPrepared =
    chartPrepared === false || /not\s+prepared|unprepared|pending/i.test(chartStatus.trim());

  const chartState: "prepared" | "not_prepared" | "unknown" = isChartExplicitlyPrepared
    ? "prepared"
    : isChartExplicitlyNotPrepared
      ? "not_prepared"
      : "unknown";

  const chartBadgeLabel =
    chartState === "prepared"
      ? "Prepared"
      : chartState === "not_prepared"
        ? "Not Prepared"
        : chartStatus !== "—"
          ? chartStatus
          : "Unknown";

  const chartBadgeTone =
    chartState === "prepared"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : chartState === "not_prepared"
        ? "border-blue-300 bg-blue-50 text-blue-900"
        : "border-slate-300 bg-slate-100 text-slate-700";

  const chartPanelSurface =
    chartState === "prepared"
      ? "border-2 border-[#86EFAC] bg-[#F0FDF4]/65"
      : chartState === "not_prepared"
        ? "border-2 border-[#93C5FD] bg-[#EFF6FF]/65"
        : "border-2 border-slate-300 bg-slate-50/80";

  const chartPanelDivider =
    chartState === "prepared"
      ? "border-[#86EFAC]/50"
      : chartState === "not_prepared"
        ? "border-[#93C5FD]/50"
        : "border-slate-200";

  const arrival = displayValue(
    pickValue(trainRecord ?? record, ["actualArrivalTime", "arrivalTimeActual", "actualArrival", "actual_arrival"]),
  );
  const journeyOrigin = boardingStation !== "—" ? boardingStation : fromStation;
  const journeyDestination = reservationUpto !== "—" ? reservationUpto : toStation;
  const hasDistinctOrigin = fromStation !== "—" && boardingStation !== "—" && fromStation !== boardingStation;
  const hasDistinctDestination = toStation !== "—" && reservationUpto !== "—" && toStation !== reservationUpto;

  const trainLabel = `${trainNumber !== "—" ? `${trainNumber} · ` : ""}${trainName !== "—" ? trainName : "Train details unavailable"}`;

  // Prediction Eligibility & State
  const hasActiveRacOrWaitlistPassenger = passengers.some((passenger) => {
    const currentRaw = pickValue(passenger, [
      "currentStatus",
      "current",
      "currentStatusDetails",
      "current_status",
      "currentStatusText",
      "status",
    ]);
    const currentText = displayStatus(currentRaw);
    if (isCancelledStatus(currentText) || /\bCNF\b|confirmed/i.test(currentText)) {
      return false;
    }
    if (currentText !== "—") {
      return isRacOrWaitlisted(currentRaw);
    }
    const bookingRaw = pickValue(passenger, [
      "bookingStatus",
      "booking",
      "bookingStatusDetails",
      "booking_status",
      "bookingStatusText",
    ]);
    return (
      pickValue(passenger, ["isRAC"]) === true ||
      pickValue(passenger, ["isWaitlisted"]) === true ||
      isRacOrWaitlisted(bookingRaw)
    );
  });

  const eligibleForPrediction =
    !isAllCancelled &&
    (passengers.length > 0
      ? hasActiveRacOrWaitlistPassenger
      : pickValue(record, ["isRAC", "isWaitlisted"]) === true ||
        isRacOrWaitlisted(pickValue(record, ["currentStatus", "bookingStatus", "status"])));

  const waitlistPassenger = passengerRows.find(
    (p) =>
      !isCancelledStatus(p.current) &&
      (isRacOrWaitlisted(p.current) || (p.current === "—" && isRacOrWaitlisted(p.booking))),
  );
  const currentWaitlistPosition = waitlistPassenger ? waitlistPassenger.current : "—";

  const [predictionLoading, setPredictionLoading] = useState(eligibleForPrediction);
  const [predictionError, setPredictionError] = useState("");
  const [predictionResult, setPredictionResult] = useState<unknown>(null);
  const predictionRequestSeq = useRef(0);

  async function fetchPredictionData() {
    const seq = ++predictionRequestSeq.current;
    setPredictionLoading(true);
    setPredictionError("");
    try {
      const res = await fetch(`/api/pnr/${encodeURIComponent(pnr)}/prediction`, { cache: "no-store" });
      const body = await res.json();
      if (!res.ok || body.success !== true || !body.data) {
        throw new Error(
          typeof body.error === "string" ? body.error : "Could not retrieve a confirmation prediction.",
        );
      }
      if (predictionRequestSeq.current === seq) {
        setPredictionResult(body.data);
      }
    } catch (err) {
      if (predictionRequestSeq.current === seq) {
        setPredictionError(
          err instanceof Error ? err.message : "Prediction lookup failed. Please try again.",
        );
      }
    } finally {
      if (predictionRequestSeq.current === seq) {
        setPredictionLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!eligibleForPrediction) return;
    let active = true;
    const seq = ++predictionRequestSeq.current;
    fetch(`/api/pnr/${encodeURIComponent(pnr)}/prediction`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok || body.success !== true || !body.data) {
          throw new Error(
            typeof body.error === "string" ? body.error : "Could not retrieve a confirmation prediction.",
          );
        }
        if (active && predictionRequestSeq.current === seq) {
          setPredictionResult(body.data);
        }
      })
      .catch((err: unknown) => {
        if (active && predictionRequestSeq.current === seq) {
          setPredictionError(
            err instanceof Error ? err.message : "Prediction lookup failed. Please try again.",
          );
        }
      })
      .finally(() => {
        if (active && predictionRequestSeq.current === seq) {
          setPredictionLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [eligibleForPrediction, pnr]);

  const predOuter = asRecord(predictionResult);
  const predData = predOuter ? asRecord(predOuter.data) ?? asRecord(predOuter.result) ?? predOuter : null;
  const predRecord = predData
    ? asRecord(pickValue(predData, ["prediction", "confirmationPrediction", "predictionDetails"])) ?? predData
    : null;
  const rawPredStatus = displayValue(
    predRecord &&
      pickValue(predRecord, [
        "predictionStatus",
        "predictedStatus",
        "recommendation",
        "outcome",
        "status",
        "prediction",
      ]),
  );
  const rawPredProb = predRecord
    ? pickValue(predRecord, [
        "chancePercent",
        "confirmationProbability",
        "probability",
        "confirmationChance",
        "chancePercentage",
        "confirmationPercentage",
        "chance",
      ])
    : undefined;
  const parsedProb = parseProviderProbability(rawPredProb);
  const predSummary = displayValue(
    predRecord &&
      pickValue(predRecord, ["message", "summary", "explanation", "reason", "predictionText", "description"]),
  );
  const classifiedPred = classifyPrediction(rawPredStatus, parsedProb?.numeric ?? null);

  const predictionPanelSurface = predictionResult
    ? classifiedPred.panelBorderClass
    : predictionError
      ? "border-2 border-[#FCA5A5] bg-[#FEF2F2]/65"
      : overallKind === "confirmed" && !eligibleForPrediction
        ? "border-2 border-[#86EFAC] bg-[#F0FDF4]/65"
        : "border-2 border-slate-300 bg-slate-50/80";

  const predictionPanelDivider = predictionResult
    ? classifiedPred.dividerClass
    : predictionError
      ? "border-[#FCA5A5]/50"
      : overallKind === "confirmed" && !eligibleForPrediction
        ? "border-[#86EFAC]/50"
        : "border-slate-200";

  return (
    <section
      aria-labelledby="pnr-result-title"
      className="mt-4 overflow-hidden rounded-2xl border-[1.5px] border-slate-300 bg-white shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08),0_2px_6px_-2px_rgba(15,23,42,0.05)]"
    >
      {/* 1. PNR OUTPUT HEADING: PNR BAR + BOARDING STATION → TRAIN / DATE / CLASS / QUOTA → RESERVATION UP TO */}
      <header className="border-b border-slate-300 bg-white px-4 py-3.5 sm:px-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <TicketCheck aria-hidden="true" className="h-4 w-4" />
            </span>
            <h2 id="pnr-result-title" className="text-sm font-extrabold tracking-tight text-[#0b2240] sm:text-base">
              PNR {pnr}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <CopyPnr pnr={pnr} />
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-[#0b2240] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 print:hidden"
            >
              <Printer aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div
          aria-label="Journey route and timing details"
          className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4"
        >
          {/* Boarding / From Station */}
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {boardingStation !== "—" ? "Boarding station" : "Origin station"}
            </p>
            <div className="mt-0.5">
              <StationDisplay value={journeyOrigin} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600">
              {departureTime !== "—" && (
                <span className="font-semibold text-slate-800">Departs {journeyTime(departureTime)}</span>
              )}
              {boardingDate !== "—" && <span>{journeyDate(boardingDate)}</span>}
              {hasDistinctOrigin && (
                <span className="rounded border border-slate-300/80 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-600">
                  Train origin: {fromStation}
                </span>
              )}
            </div>
          </div>

          {/* Center Route & Train Badge */}
          <div className="flex flex-col items-start justify-center rounded-xl border border-slate-300 bg-slate-50/80 px-3.5 py-2 md:items-center md:text-center">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#0b2240]">
              <TrainFront aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-600" />
              <span>{trainLabel}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-600">
              <span>{journeyDate(trainDate)}</span>
              {journeyClass !== "—" && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="rounded border border-slate-300/80 bg-white px-1.5 py-0.5 text-[#0b2240]">
                    {journeyClass}
                  </span>
                </>
              )}
              {quota !== "—" && (
                <span className="rounded border border-slate-300/80 bg-white px-1.5 py-0.5 text-slate-700">
                  {quota === "GN" ? "GN Quota" : quota}
                </span>
              )}
            </div>
          </div>

          {/* Destination / Reservation Upto Station */}
          <div className="min-w-0 md:text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {reservationUpto !== "—" ? "Reservation up to" : "Destination station"}
            </p>
            <div className="mt-0.5">
              <StationDisplay value={journeyDestination} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 md:justify-end">
              {arrival !== "—" && (
                <span className="font-semibold text-slate-800">Arrives {journeyTime(arrival)}</span>
              )}
              {hasDistinctDestination && (
                <span className="rounded border border-slate-300/80 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-600">
                  Train destination: {toStation}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. THREE-COLUMN STATUS SUMMARY ROW */}
      <div className="grid grid-cols-1 gap-3 border-b border-slate-300 bg-white p-4 lg:grid-cols-3 sm:px-5">
        {/* Panel A: Current Booking Status */}
        <article
          aria-label="Current booking status"
          className={`flex flex-col justify-between rounded-xl p-3.5 ${bookingPanelSurface}`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Current booking status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${overallStatusTone}`}
              >
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${overallDotTone}`} />
                {pnrStatusLabels[overallKind]}
              </span>
            </div>
            <p
              className={`mt-2 text-base font-extrabold sm:text-lg ${
                isAllCancelled || overallKind === "cancelled" ? "text-rose-800" : "text-[#0b2240]"
              }`}
            >
              {overallStatusText}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-700">{currentPositionDetail}</p>
          </div>
          <p className={`mt-2.5 border-t pt-2 text-[11px] text-slate-600 ${bookingPanelDivider}`}>
            {overallKind === "confirmed"
              ? "Seat/berth reservation is confirmed."
              : overallKind === "rac"
                ? "RAC allows boarding with a shared berth; may upgrade."
                : overallKind === "waiting"
                  ? "Waitlisted ticket; check status before chart preparation."
                  : "Live status reported by the railway provider."}
          </p>
        </article>

        {/* Panel B: Ticket Confirmation Prediction */}
        <article
          aria-label="Ticket confirmation prediction"
          className={`flex flex-col justify-between rounded-xl p-3.5 ${predictionPanelSurface}`}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Confirmation prediction
              </span>
              {isAllCancelled ? null : predictionLoading ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-800">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                  Checking…
                </span>
              ) : predictionResult ? (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${classifiedPred.badgeClass}`}
                >
                  <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${classifiedPred.dotClass}`} />
                  {classifiedPred.badgeLabel}
                </span>
              ) : overallKind === "confirmed" && !eligibleForPrediction ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900">
                  <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
                  Confirmed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                  Estimate
                </span>
              )}
            </div>

            {isAllCancelled ? (
              <div className="mt-2">
                <p className="text-base font-extrabold text-[#0b2240] sm:text-lg">Not Applicable</p>
                <p className="mt-1 text-xs text-slate-700">
                  Confirmation prediction is not applicable to cancelled tickets.
                </p>
              </div>
            ) : predictionLoading ? (
              <div className="mt-2.5 space-y-2" aria-live="polite">
                <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
                <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
              </div>
            ) : predictionError ? (
              <div role="alert" className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs text-rose-800">
                <p className="font-semibold">{predictionError}</p>
              </div>
            ) : predictionResult ? (
              <div className="mt-2" aria-live="polite">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-base font-extrabold text-[#0b2240] sm:text-lg">{classifiedPred.headline}</p>
                  {parsedProb && (
                    <span className={` rounded-md border px-2 py-0.5 text-xs font-extrabold ${classifiedPred.badgeClass}`}>
                      Estimated probability: {parsedProb.formatted}
                    </span>
                  )}
                </div>
                {currentWaitlistPosition !== "—" && (
                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    Current position: <span className="font-mono">{currentWaitlistPosition}</span>
                  </p>
                )}
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {predSummary !== "—"
                    ? predSummary
                    : classifiedPred.kind === "high"
                      ? "Favorable trend based on current position and historical movement."
                      : classifiedPred.kind === "medium"
                        ? "Moderate chance; status may progress closer to chart preparation."
                        : classifiedPred.kind === "low"
                          ? "Waitlist position is currently deep; monitor status before charting."
                          : "Provider returned an estimate without additional commentary."}
                </p>
              </div>
            ) : overallKind === "confirmed" && !eligibleForPrediction ? (
              <div className="mt-2">
                <p className="text-base font-extrabold text-[#0b2240] sm:text-lg">Already Confirmed</p>
                <p className="mt-1 text-xs text-slate-700">
                  Your booking is confirmed. Waitlist confirmation prediction is only needed for RAC or WL tickets.
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm font-bold text-[#0b2240]">
                  {eligibleForPrediction ? "Check waitlist confirmation chance" : "Prediction not requested"}
                </p>
                <p className="mt-1 text-xs text-slate-700">
                  Request an estimated confirmation classification from the prediction provider.
                </p>
              </div>
            )}
          </div>

          <div className={`mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t pt-2 ${predictionPanelDivider}`}>
            <span className="text-[11px] font-medium text-slate-600">
              Estimate only · Not a guarantee
            </span>
            {!isAllCancelled && (
              <button
                type="button"
                onClick={fetchPredictionData}
                disabled={predictionLoading}
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-orange-200 bg-white px-2.5 text-[11px] font-bold text-orange-700 transition hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-60 print:hidden"
              >
                <RefreshCw aria-hidden="true" className={`h-3 w-3 ${predictionLoading ? "animate-spin" : ""}`} />
                {predictionLoading ? "Checking…" : predictionResult ? "Refresh Prediction" : "Check Prediction"}
              </button>
            )}
          </div>
        </article>

        {/* Panel C: Chart Preparation */}
        <article
          aria-label="Chart preparation status"
          className={`flex flex-col justify-between rounded-xl p-3.5 ${chartPanelSurface}`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Chart preparation
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${chartBadgeTone}`}
              >
                <ClipboardCheck aria-hidden="true" className="h-3 w-3" />
                {chartBadgeLabel}
              </span>
            </div>
            <p className="mt-2 text-base font-extrabold text-[#0b2240] sm:text-lg">
              {chartState === "prepared"
                ? "Reservation Chart Prepared"
                : chartState === "not_prepared"
                  ? "Chart Not Prepared Yet"
                  : chartStatus !== "—"
                    ? chartStatus
                    : "Chart Status Unknown"}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-700">
              {chartState === "prepared"
                ? "Final coach and berth allocations have been generated."
                : chartState === "not_prepared"
                  ? estimatedChartTime !== "—"
                    ? `Estimated preparation: ${formatPnrDateTime(estimatedChartTime)}`
                    : "Seat and berth numbers may update when the chart is prepared."
                  : "Provider did not confirm whether the reservation chart is prepared."}
            </p>
          </div>
          <p className={`mt-2.5 border-t pt-2 text-[11px] text-slate-600 ${chartPanelDivider}`}>
            First chart is typically prepared ~4 hours before departure.
          </p>
        </article>
      </div>

      {/* 3. COMPACT PASSENGER STATUS TABLE & EXPANDABLE PREDICTION DETAILS */}
      <div className="px-4 py-3.5 sm:px-5">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h3 id="pnr-passenger-title" className="text-sm font-extrabold text-[#0b2240] sm:text-base">
            Passenger status
          </h3>
          <span className="rounded-full border border-slate-300/80 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            {passengers.length} {passengers.length === 1 ? "passenger" : "passengers"}
          </span>
        </div>

        {passengerRows.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-300">
            <table
              aria-labelledby="pnr-passenger-title"
              className="w-full min-w-[520px] border-collapse text-left text-xs sm:text-sm"
            >
              <thead className="border-b border-slate-300 bg-slate-100/70 text-xs font-bold text-slate-700">
                <tr>
                  <th scope="col" className="px-3.5 py-2.5">
                    Passenger
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Booking status
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Current status
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Coach / Berth
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {passengerRows.map((passenger) => (
                  <tr key={passenger.id} className="align-middle hover:bg-slate-50/60">
                    <th scope="row" className="whitespace-nowrap px-3.5 py-2.5 font-bold text-[#0b2240]">
                      Passenger {passenger.serial}
                    </th>
                    <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-xs font-medium text-slate-700">
                      {passenger.booking}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3.5 py-2.5 font-mono text-xs font-bold ${
                        isCancelledStatus(passenger.current) ? "text-rose-800" : "text-slate-900"
                      }`}
                    >
                      {passenger.current}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5 text-xs font-medium text-slate-700">
                      {passenger.coachBerthLabel}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-2.5">
                      <PassengerConfirmation status={passenger.current} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-xs text-slate-600 sm:text-sm">
            Passenger details aren’t available in the railway provider’s response.
          </p>
        )}

        {/* Technical Prediction Details (Collapsible Accordion) */}
        {predData && <ExpandablePredictionDetails data={predData} meta={predOuter?.meta} />}
      </div>
    </section>
  );
}

function PnrResultSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading PNR ticket status"
      className="mt-4 animate-pulse overflow-hidden rounded-2xl border-[1.5px] border-slate-300 bg-white shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08),0_2px_6px_-2px_rgba(15,23,42,0.05)]"
    >
      <span className="sr-only">Loading the latest ticket status…</span>
      <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-orange-50" />
            <div className="h-4 w-36 rounded bg-slate-200" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-100" />
            <div className="h-8 w-16 rounded-lg bg-slate-100" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="h-9 w-48 rounded-xl bg-slate-100" />
          <div className="h-5 w-32 rounded bg-slate-200" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/40 p-4 lg:grid-cols-3 sm:px-5">
        {[0, 1, 2].map((item) => (
          <div key={item} className="space-y-2 rounded-xl border border-slate-100 bg-white p-3.5">
            <div className="h-3 w-28 rounded bg-slate-100" />
            <div className="h-5 w-36 rounded bg-slate-200" />
            <div className="h-3 w-44 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="space-y-2.5 px-4 py-3.5 sm:px-5">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-20 w-full rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function PnrStatusPageView({
  router,
  pathname,
  searchString,
  urlPnr,
  lookupId,
  queryIdentity,
  hasUrlLookup,
  initialPnr,
  initialError,
  embedded = false,
}: {
  router: ReturnType<typeof useRouter>;
  pathname: string;
  searchString: string;
  urlPnr: string | null;
  lookupId: string | null;
  queryIdentity: string;
  hasUrlLookup: boolean;
  initialPnr: string;
  initialError: string;
  embedded?: boolean;
}) {
  const [pnr, setPnr] = useState(
    () => initialPnr || (lookupId && typeof window !== "undefined" ? readPnrFromSession(lookupId) ?? "" : ""),
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(hasUrlLookup && !initialError);
  const [error, setError] = useState(initialError);
  const [canRetry, setCanRetry] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [resultPnr, setResultPnr] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const requestSequence = useRef(0);
  const legacyLookupId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const sequence = ++requestSequence.current;
    const isCurrentRequest = () => active && requestSequence.current === sequence;
    if (initialError || !hasUrlLookup)
      return () => {
        active = false;
      };
    if (lookupId && urlPnr !== null) {
      router.replace(lookupUrl(pathname, searchString, lookupId), { scroll: false });
      return () => {
        active = false;
      };
    }
    if (!lookupId && urlPnr !== null) {
      if (!legacyLookupId.current) legacyLookupId.current = savePnrToSession(urlPnr);
      if (legacyLookupId.current) {
        router.replace(lookupUrl(pathname, searchString, legacyLookupId.current), { scroll: false });
        return () => {
          active = false;
        };
      }
    }

    if (!/^\d{10}$/.test(initialPnr))
      return () => {
        active = false;
      };
    fetchPnrLookup(initialPnr, retryCount > 0)
      .then((data) => {
        if (!isCurrentRequest()) return;
        setResult(data);
        setResultPnr(initialPnr);
        setMessage("PNR status retrieved successfully.");
      })
      .catch((lookupError: unknown) => {
        if (!isCurrentRequest()) return;
        setError(lookupError instanceof Error ? lookupError.message : "PNR lookup failed. Please try again.");
        setCanRetry(true);
      })
      .finally(() => {
        if (isCurrentRequest()) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hasUrlLookup, initialError, initialPnr, lookupId, pathname, queryIdentity, retryCount, router, searchString, urlPnr]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCanRetry(false);
    setMessage("");
    if (!/^\d{10}$/.test(pnr)) {
      setError("Enter a valid 10-digit PNR number.");
      return;
    }
    setPnr(pnr);
    setResult(null);
    setResultPnr("");
    setLoading(true);
    const newLookupId = savePnrToSession(pnr);
    router.push(lookupUrl(pathname, searchString, newLookupId, newLookupId ? undefined : pnr), { scroll: false });
    if (!newLookupId) setRetryCount((count) => count + 1);
  }

  function retryLookup() {
    if (!/^\d{10}$/.test(pnr)) return;
    setResult(null);
    setResultPnr("");
    setError("");
    setCanRetry(false);
    setLoading(true);
    setRetryCount((count) => count + 1);
  }

  const pnrBody = (
    <div className="pnr-page-container">
      {/* 1. COMPACT PNR SEARCH SECTION */}
      <section
        aria-label={embedded ? "PNR Lookup Form" : undefined}
        aria-labelledby={embedded ? undefined : "pnr-search-title"}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          {/* Title & Compact Help Trigger (Standalone page only) */}
          {!embedded && (
            <div className="flex min-w-0 items-start justify-between gap-3 lg:max-w-[38%]">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <TrainFront aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h1
                    id="pnr-search-title"
                    className="text-lg font-extrabold tracking-tight text-[#0b2240] sm:text-xl"
                  >
                    PNR Status Check
                  </h1>
                  <p className="text-xs text-slate-600">
                    Enter your 10-digit PNR for live status, chart &amp; prediction.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Compact Horizontal Search Form */}
          <div className="min-w-0 flex-1">
            <form onSubmit={handleSubmit} noValidate>
              <label
                htmlFor="pnr-number"
                className={
                  embedded
                    ? "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
                    : "sr-only"
                }
              >
                10-Digit PNR Number
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <input
                    id="pnr-number"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={10}
                    value={pnr}
                    onChange={(event) => {
                      setPnr(event.target.value.replace(/\D/g, "").slice(0, 10));
                      setMessage("");
                      setError("");
                      setCanRetry(false);
                    }}
                    placeholder="Enter 10-digit PNR (e.g. 4335734389)"
                    aria-describedby="pnr-hint pnr-message"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-3.5 pr-14 text-base font-semibold tracking-[0.1em] text-[#0b2240] outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold tabular-nums text-slate-400"
                  >
                    {pnr.length}/10
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-70"
                >
                  <Search aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
                  {loading ? "Checking…" : "Check PNR"}
                </button>
              </div>

              {/* Helper row + Collapsible Where to find PNR */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p id="pnr-hint" className="text-[11px] text-slate-500">
                    Digits only · PNR is 10 digits
                  </p>
                  {message && (
                    <p
                      id="pnr-message"
                      aria-live="polite"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700"
                    >
                      <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                      {message}
                    </p>
                  )}
                  {!message && <span id="pnr-message" className="sr-only" aria-live="polite" />}
                  {loading && (
                    <p
                      role="status"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600"
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                      Checking your PNR…
                    </p>
                  )}
                </div>

                <details className="group relative">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[11px] font-semibold text-orange-700 marker:hidden hover:text-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500">
                    <CircleHelp aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Where to find your PNR?</span>
                    <ChevronDown
                      aria-hidden="true"
                      className="h-3 w-3 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="mt-2 rounded-xl border border-orange-100 bg-[#fffaf5] p-3 text-xs leading-relaxed text-slate-600 shadow-md lg:absolute lg:right-0 lg:z-30 lg:mt-1.5 lg:w-80">
                    <p className="font-bold text-[#0b2240]">Where to find your 10-digit PNR</p>
                    <p className="mt-1">
                      Printed at the top-left of a railway counter ticket or shown in your IRCTC e-ticket and booking SMS.
                    </p>
                    <p className="mt-2 border-t border-orange-200/60 pt-1.5 text-[11px] text-slate-500">
                      <strong className="font-semibold text-[#0b2240]">Privacy:</strong> Your PNR is sent to the configured railway status provider for this lookup. Avoid using a shared or public device.
                    </p>
                  </div>
                </details>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2"
                >
                  <p className="text-xs font-semibold text-rose-800">{error}</p>
                  {canRetry && (
                    <button
                      type="button"
                      onClick={retryLookup}
                      className="inline-flex min-h-7 items-center justify-center rounded-md border border-orange-300 bg-white px-2.5 text-xs font-bold text-orange-700 transition hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* 2 & 3. UNIFIED PNR RESULT DASHBOARD (INCLUDING PASSENGERS & PREDICTION) */}
      {loading ? (
        <PnrResultSkeleton />
      ) : (
        result !== null && <PnrResult response={result} pnr={resultPnr} />
      )}

      {/* 4. COMPACT QUICK GUIDE SECTION */}
      <section
        aria-labelledby="status-guide-title"
        className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-5 sm:px-6"
      >
        <div className="border-b border-slate-200/80 pb-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600">
            QUICK GUIDE
          </p>
          <h2
            id="status-guide-title"
            className="mt-1 text-lg font-extrabold tracking-tight text-[#0b2240] sm:text-xl"
          >
            What does your ticket status mean?
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
            A plain-language reference to Indian Railway reservation and waiting list status codes.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
          {statusTypes.map((status) => (
            <div key={status.code} className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[14px] font-semibold text-[#0b2240]">
                  {status.code}
                </span>
                <span className="text-[12.5px] font-normal text-slate-500">
                  {status.title}
                </span>
              </div>
              <div className="mt-1 flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-orange-500"
                />
                <p className="text-[12.5px] leading-[1.5] text-slate-600">
                  {status.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-slate-200/80 pt-3.5">
          <p className="text-[12.5px] text-slate-600">
            Ticket status can change until chart preparation.
          </p>
          <InternalLink
            href="/train-chart-preparation-time"
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-orange-700 hover:text-orange-800"
          >
            View chart preparation guide <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </InternalLink>
        </div>
      </section>

      {/* 5. COMPACT FAQ SECTION */}
      <section
        aria-labelledby="pnr-faq-title"
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="mb-2 flex items-center gap-2">
          <CircleHelp aria-hidden="true" className="h-4 w-4 text-orange-600" />
          <h2 id="pnr-faq-title" className="text-base font-extrabold text-[#0b2240] sm:text-lg">
            Frequently asked questions
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {faqs.map((faq) => (
            <details key={faq.q} className="group py-3 first:pt-1 last:pb-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold text-slate-800 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 sm:text-sm">
                <span>{faq.q}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-orange-600 transition-transform duration-150 group-open:rotate-180"
                />
              </summary>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600 sm:text-sm">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );

  if (embedded) {
    return pnrBody;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900">
      <Header />
      <main className="flex-1 px-4 py-4 sm:py-5">{pnrBody}</main>
      <Footer />
    </div>
  );
}

export function PnrStatusTool({ embedded = false }: { embedded?: boolean } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const urlPnr = searchParams.get("pnr");
  const lookupId = searchParams.get("lookup");
  const hasUrlLookup = searchParams.has("pnr") || searchParams.has("lookup");
  const initialPnr =
    lookupId && typeof window !== "undefined"
      ? readPnrFromSession(lookupId) ?? ""
      : urlPnr ?? "";
  const initialError =
    lookupId && typeof window !== "undefined" && !initialPnr
      ? "This private lookup is no longer available in this browser session. Enter your PNR to check again."
      : urlPnr !== null && !/^\d{10}$/.test(urlPnr) && !lookupId
        ? "Enter a valid 10-digit PNR number."
        : "";
  const queryIdentity = lookupId ? `lookup:${lookupId}` : urlPnr !== null ? `pnr:${urlPnr}` : "empty";

  return (
    <PnrStatusPageView
      key={queryIdentity}
      router={router}
      pathname={pathname}
      searchString={searchString}
      urlPnr={urlPnr}
      lookupId={lookupId}
      queryIdentity={queryIdentity}
      hasUrlLookup={hasUrlLookup}
      initialPnr={initialPnr}
      initialError={initialError}
      embedded={embedded}
    />
  );
}

function PnrStatusPageContent() {
  return <PnrStatusTool embedded={false} />;
}

function PnrStatusPageFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900">
      <Header />
      <main className="flex-1 px-4 py-4 sm:py-5">
        <div className="pnr-page-container">
          <div
            aria-hidden="true"
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="h-10 w-10 rounded-xl bg-orange-50" />
                <div className="space-y-1.5">
                  <div className="h-5 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-56 rounded bg-slate-100" />
                </div>
              </div>
              <div className="flex flex-1 gap-2">
                <div className="h-11 flex-1 rounded-lg bg-slate-100" />
                <div className="h-11 w-32 rounded-lg bg-orange-100" />
              </div>
            </div>
          </div>
          <PnrResultSkeleton />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PnrStatusPage() {
  return (
    <Suspense fallback={<PnrStatusPageFallback />}>
      <PnrStatusPageContent />
    </Suspense>
  );
}
