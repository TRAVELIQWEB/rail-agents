"use client";

import { getWhatsAppUrl } from "@/lib/whatsapp";
import { useWhatsAppSettings } from "@/components/WhatsAppSettingsProvider";

import { AllToolsLink } from "@/components/tools/AllToolsLink";
import { pnrJourneyNotice } from "@/lib/pnr-journey";
import { isWaitingListStatus } from "@/lib/pnr-waitlist";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import {
  ArrowRight,
  Copy,
  Printer,
  CheckCircle2,
  CircleHelp,
  Search,
  Ticket,
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
    color: "border-emerald-200 bg-emerald-50",
    title: "Confirmed",
    body: "Your reservation is confirmed.",
  },
  {
    code: "RAC",
    color: "border-blue-200 bg-blue-50",
    title: "Reservation Against Cancellation",
    body: "You can travel with a valid RAC ticket.",
  },
  {
    code: "WL",
    color: "border-amber-200 bg-amber-50",
    title: "Waiting List",
    body: "Your reservation is not yet confirmed.",
  },
  {
    code: "GNWL",
    color: "border-violet-200 bg-violet-50",
    title: "General Waiting List",
    body: "Waiting list under the general quota.",
  },
  {
    code: "RLWL",
    color: "border-rose-200 bg-rose-50",
    title: "Remote Location Waiting List",
    body: "Waiting list for designated intermediate stations.",
  },
  {
    code: "PQWL",
    color: "border-cyan-200 bg-cyan-50",
    title: "Pooled Quota Waiting List",
    body: "Waiting list under a shared quota.",
  },
  {
    code: "TQWL",
    color: "border-orange-200 bg-orange-50",
    title: "Tatkal Quota Waiting List",
    body: "Waiting list under the Tatkal quota.",
  },
  {
    code: "RSWL",
    color: "border-teal-200 bg-teal-50",
    title: "Roadside Station Waiting List",
    body: "Waiting list for certain roadside stations.",
  },
  {
    code: "RQWL",
    color: "border-fuchsia-200 bg-fuchsia-50",
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
    a: "Yes. Each lookup requests the latest available status from RailAgents’ railway provider. The PNR in the page URL restores your search on refresh or when you open the link again. Only share that link with people you intend to give access to your PNR.",
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
  if (isWaitingListStatus(status)) return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

function getPnrStatusKind(status: string): "confirmed" | "rac" | "waiting" | "cancelled" | "unavailable" {
  if (isCancelledStatus(status)) return "cancelled";
  if (/\bCNF\b|confirmed/i.test(status)) return "confirmed";
  if (/\bRAC\b/i.test(status)) return "rac";
  if (isWaitingListStatus(status)) return "waiting";
  return "unavailable";
}

function formatStation(value: unknown, record: DataRecord, codeAliases: string[], nameAliases: string[]): string {
  const station = asRecord(value);
  if (!station) return displayValue(value ?? pickValue(record, nameAliases) ?? pickValue(record, codeAliases));
  const code = displayValue(pickValue(station, ["code", "stationCode", "stnCode"]));
  const name = displayValue(pickValue(station, ["name", "stationName", "stnName"]));
  if (code !== "—" && name !== "—") return `${name} (${code})`;
  return code !== "—" ? code : name;
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

function journeyDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const date = new Date(value.slice(0, 10) + "T12:00:00Z");
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
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
        <span role="status" aria-live="polite" className="type-caption  font-semibold text-emerald-700">
          {message}
        </span>
      )}
      {!message && <span role="status" aria-live="polite" className="sr-only" />}
      <button
        type="button"
        title="Copy PNR"
        aria-label={message === "Copied" ? "PNR copied" : "Copy PNR number"}
        onClick={copy}
        className="type-button inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-orange-200 bg-white text-orange-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
      >
        <Copy aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

function SharePnrDetails({ createMessage }: { createMessage: () => string }) {
  const whatsappSettings = useWhatsAppSettings();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const body = document.body;
    const rootOverflow = root.style.overflow;
    const bodyOverflow = body.style.overflow;
    const bodyPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${parseFloat(window.getComputedStyle(body).paddingRight) + scrollbarWidth}px`;
    }
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      root.style.overflow = rootOverflow;
      body.style.overflow = bodyOverflow;
      body.style.paddingRight = bodyPadding;
    };
  }, [isOpen]);

  useEffect(() => {
    const textarea = messageRef.current;
    const dialog = dialogRef.current;
    if (!textarea || !dialog || !isOpen) return;
    const fitMessage = () => {
      const scrollTop = textarea.scrollTop;
      textarea.style.overflowY = "hidden";
      // Measure actual wrapped content rather than reserving space for passengers.
      textarea.style.height = "0px";
      const surroundingHeight = dialog.scrollHeight - textarea.offsetHeight + 2;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const modalHeight = Math.min(viewportHeight * 0.85, parseFloat(window.getComputedStyle(dialog).maxHeight));
      const availableHeight = Math.max(0, modalHeight - surroundingHeight);
      textarea.style.height = `${Math.min(Math.max(80, textarea.scrollHeight + 2), availableHeight)}px`;
      textarea.style.overflowY = textarea.scrollHeight > textarea.clientHeight ? "auto" : "hidden";
      textarea.scrollTop = scrollTop;
    };
    fitMessage();
    let lastWidth = dialog.clientWidth;
    const observer = new ResizeObserver(() => {
      if (lastWidth !== dialog.clientWidth) {
        lastWidth = dialog.clientWidth;
        fitMessage();
      }
    });
    observer.observe(dialog);
    window.addEventListener("resize", fitMessage);
    window.visualViewport?.addEventListener("resize", fitMessage);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fitMessage);
      window.visualViewport?.removeEventListener("resize", fitMessage);
    };
  }, [message, isOpen, feedback]);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setFeedback("Message copied.");
    } catch {
      setFeedback("Could not copy the message. Select the text and copy it manually.");
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="type-button inline-flex min-h-9 items-center rounded-lg bg-orange-500 px-3 py-2 font-bold text-white hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 print:hidden"
        onClick={() => {
          setMessage(createMessage());
          setFeedback("");
          dialogRef.current?.showModal();
          setIsOpen(true);
        }}
      >
        Share PNR Details
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="pnr-share-title"
        aria-describedby="pnr-share-description"
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus({ preventScroll: true });
        }}
        className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-1.5rem)] max-w-xl overflow-hidden rounded-xl border border-slate-600 bg-[#111827] p-0 text-white shadow-xl backdrop:bg-[#071426]/85 open:flex open:flex-col print:hidden"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-700 px-3 py-2 sm:px-4">
          <FaWhatsapp aria-hidden="true" className="h-6 w-6 shrink-0 text-[#25D366]" />
          <h2 id="pnr-share-title" className="text-base font-bold leading-tight text-white">Share PNR Details</h2>
          <button type="button" onClick={() => dialogRef.current?.close()} className="ml-auto min-h-9 rounded border border-slate-600 px-3 text-sm text-slate-200 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400">Close</button>
        </div>
        <p id="pnr-share-description" className="shrink-0 px-3 py-1.5 text-xs text-slate-300 sm:px-4">Review or edit your message before sharing.</p>
        <label htmlFor="pnr-share-message" className="sr-only">Message</label>
        <textarea
          ref={messageRef}
          id="pnr-share-message"
          autoFocus
          value={message}
          style={{ fontSize: "16px", lineHeight: "22px" }}
          onChange={(event) => { setMessage(event.target.value); setFeedback(""); }}
          className="mx-3 block min-h-0 w-[calc(100%-1.5rem)] resize-none overscroll-contain rounded-lg border border-slate-600 bg-[#2d323b] p-2.5 font-sans text-base text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 sm:mx-4 sm:w-[calc(100%-2rem)]"
        />
        <div className="mt-1.5 shrink-0 border-t border-slate-700 px-3 py-2 sm:px-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <p role="status" aria-live="polite" className="mr-auto min-w-0 text-xs text-slate-200">{feedback}</p>
            <button type="button" onClick={copyMessage} className="min-h-9 rounded border border-slate-600 px-3 text-sm text-slate-200 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">Copy Message</button>
            {whatsappSettings.enabled && (<a href={getWhatsAppUrl(message)} target="_blank" rel="noopener noreferrer" aria-label="Send — continue to WhatsApp" className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded bg-[#25D366] px-3 text-sm font-semibold text-[#071426] hover:bg-[#20bd5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"><FaWhatsapp aria-hidden="true" className="h-4 w-4 shrink-0" />Send</a>)}
          </div>
        </div>
      </dialog>
    </>
  );
}

function PnrResult({ response, pnr }: { response: unknown; pnr: string }) {
  const outer = asRecord(response) ?? {};
  const record = asRecord(outer.data) ?? asRecord(outer.result) ?? asRecord(outer.pnrStatus) ?? outer;
  const trainRecord = asRecord(pickValue(record, ["train", "trainDetails", "trainInfo"]));
  const chartingRecord = asRecord(pickValue(record, ["charting", "chartDetails"]));
  const fareAliases = ["totalFare", "ticketFare", "bookingFare", "fare"];
  const fareValue = pickValue(record, fareAliases) ?? (trainRecord && pickValue(trainRecord, fareAliases));
  const totalFare = typeof fareValue === "number" && Number.isFinite(fareValue)
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(fareValue)
    : displayValue(fareValue);
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
  const boardingPointRecord = asRecord(boardingValue);
  const boardingTimeAliases = ["boardingTime", "boardingDepartureTime"];
  const departureTimeAliases = ["departureTime", "departTime", "depTime", "scheduledDepartureTime", "journeyDepartureTime"];
  const boardingTime = displayValue(
    pickValue(record, boardingTimeAliases) ??
      (trainRecord && pickValue(trainRecord, boardingTimeAliases)) ??
      (boardingPointRecord && pickValue(boardingPointRecord, boardingTimeAliases)),
  );
  const departureTime = displayValue(
    pickValue(record, departureTimeAliases) ??
      (trainRecord && pickValue(trainRecord, departureTimeAliases)),
  );
  // A raw journey-date timestamp is not a verified boarding/departure time.
  const boardingTimeLabel = boardingTime !== "\u2014"
    ? 'Boarding: ' + boardingTime
    : departureTime !== "\u2014"
      ? 'Departure: ' + departureTime
      : null;
  const chartStatus = displayValue(
    chartingRecord
      ? pickValue(chartingRecord, ["status", "chartStatus", "chartingStatus"])
      : pickValue(record, ["chartStatus", "chartingStatus"]),
  );
  const chartPrepared = chartingRecord
    ? pickValue(chartingRecord, ["isPrepared", "prepared"])
    : pickValue(record, ["chartPrepared", "isChartPrepared"]);

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
      coachBerthLabel: getPnrStatusKind(current) === "waiting" ? "Not allotted (waitlisted)" : coachBerthParts.length > 0 ? coachBerthParts.join(" · ") : "—",
    };
  });

  const passengerStatusCounts = passengerRows.reduce<Record<string, number>>((counts, passenger) => {
    const kind = getPnrStatusKind(passenger.current);
    if (kind !== "unavailable") counts[kind] = (counts[kind] ?? 0) + 1;
    return counts;
  }, {});
  const passengerKinds = Object.keys(passengerStatusCounts) as Array<ReturnType<typeof getPnrStatusKind>>;
  const knownCurrentCount = Object.values(passengerStatusCounts).reduce((total, count) => total + count, 0);
  const unavailableCurrentCount = passengers.length - knownCurrentCount;
  const providerOverallStatus = displayStatus(pickValue(record, ["currentStatus", "status"]));
  const providerOverallKind = getPnrStatusKind(providerOverallStatus);

  const cancelledCount = passengerStatusCounts.cancelled ?? 0;
  const totalPassengers = passengerRows.length;
  const isAllCancelled =
    (totalPassengers > 0 && cancelledCount === totalPassengers) ||
    (totalPassengers === 0 && providerOverallKind === "cancelled");
  const journeyNotice = isAllCancelled ? null : pnrJourneyNotice(
    boardingDate !== "—" ? boardingDate : trainDate,
    departureTime,
  );

  const overallKind: ReturnType<typeof getPnrStatusKind> = isAllCancelled
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

  const ticketTypeSources = [record, chartingRecord].filter((source): source is DataRecord => source !== null);
  const isEticket = ticketTypeSources.some((source) => {
    const electronicFlag = pickValue(source, ["isEticket", "isETicket", "isE_Ticket", "eTicket", "isElectronicTicket"]);
    const type = displayValue(pickValue(source, ["ticketType", "bookingType", "reservationType", "ticketMode"]));
    return electronicFlag === true || electronicFlag === 1 ||
      (typeof electronicFlag === "string" && /^(?:true|yes|y)$/i.test(electronicFlag.trim())) ||
      /\b(?:e[\s-]?ticket|electronic ticket)\b/i.test(type);
  });
  const isFullyWaitlisted = passengerRows.length > 0 && passengerRows.every(
    (passenger) => getPnrStatusKind(passenger.current) === "waiting",
  );
  const isFinalChartedWaitlistedEticket =
    chartState === "prepared" && isEticket && isFullyWaitlisted;

  // Prediction Eligibility & State
  const hasActiveRacOrWaitlistPassenger = passengerRows.some((passenger) => {
    const kind = getPnrStatusKind(passenger.current);
    return kind === "rac" || kind === "waiting";
  });

  const eligibleForPrediction =
    chartState !== "prepared" &&
    !isAllCancelled &&
    overallKind !== "confirmed" &&
    passengers.length > 0 && hasActiveRacOrWaitlistPassenger;

  const [predictionLoading, setPredictionLoading] = useState(eligibleForPrediction);
  const [predictionResult, setPredictionResult] = useState<unknown>(null);
  const predictionRequestSeq = useRef(0);

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
      .catch(() => {
        // The passenger row displays “Unavailable” if the provider returns no estimate.
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
  const classifiedPred = classifyPrediction(rawPredStatus, parsedProb?.numeric ?? null);
  const getConfirmationDisplay = (passenger: (typeof passengerRows)[number]) => {
    const statusKind = getPnrStatusKind(passenger.current);
    const label = statusKind === "confirmed"
      ? "Confirmed ✓"
      : statusKind === "rac"
        ? "RAC – Travel Allowed"
        : statusKind === "cancelled"
          ? "Cancelled ✕"
          : statusKind === "unavailable"
            ? "Prediction Unavailable"
            : isFinalChartedWaitlistedEticket
              ? "Not Confirmed"
              : chartState === "prepared"
                ? "Prediction Unavailable"
                : parsedProb
                  ? parsedProb.formatted
                  : predictionLoading
                    ? "Checking…"
                    : "Prediction Unavailable";
    const tone = statusKind === "confirmed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : statusKind === "rac"
        ? "border-orange-200 bg-orange-50 text-orange-900"
        : statusKind === "cancelled" || label === "Not Confirmed"
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : statusKind === "waiting" && chartState !== "prepared" && parsedProb
            ? classifiedPred.badgeClass
            : "border-slate-200 bg-slate-50 text-slate-700";

    return { label, tone, statusKind };
  };

  // Use the same formatted values and confirmation labels as the result below.
  // Generate only when opened so prediction updates never overwrite an edited draft.
  const createShareMessage = () => {
    const line = (label: string, value: string) => value === "—" || !value.trim() ? [] : [`${label}: ${value}`];
    const transactionId = displayValue(pickValue(record, ["transactionId", "transaction_id", "txnId", "transactionNumber"]));
    const chartLabel = chartState === "prepared" ? "Chart prepared." : chartState === "not_prepared" ? "Chart not prepared yet." : "Chart status unavailable.";
    const trainHeading = [trainNumber, trainName].filter((value) => value !== "—" && value.trim()).join(" – ");
    const routeLine = [...line("From", fromStation), ...line("To", toStation)].join(" → ");
    const compactStatus = (value: string) => value.replace(/\s*\/\s*/g, "/").replace(/\s*[\r\n]+\s*/g, " ");
    return [
      "TRAIN TICKET DETAILS",
      "",
      `PNR: ${pnr}`,
      ...line("Transaction ID", transactionId),
      ...(trainHeading ? [trainHeading] : []),
      ...line("Date", journeyDate(boardingDate !== "—" ? boardingDate : trainDate)),
      ...(routeLine ? [routeLine] : []),
      ...line("Boarding", boardingStation),
      ...line("Reserved Upto", reservationUpto),
      ...line("Class", journeyClass),
      "",
      `PASSENGER STATUS (${passengers.length})`,
      ...passengerRows.map((passenger, index) => {
        const booking = passenger.booking === "—" ? "Booking unavailable" : compactStatus(passenger.booking);
        const current = passenger.current === "—" ? "Current status unavailable" : compactStatus(passenger.current);
        const confirmation = getConfirmationDisplay(passenger).label.replace(/[✓✕]/g, "").trim();
        return `${index + 1}. ${booking} → ${current} | ${confirmation}`;
      }),
      "",
      ...line("Total Fare", totalFare),
      `Chart: ${chartLabel}`,
      ...line("Remarks", displayValue(pickValue(record, ["remarks", "remark"]))),
      ...line("Train Status", displayStatus(pickValue(trainRecord ?? record, ["trainStatus", "runningStatus"]))),
      "Passenger status may change after chart preparation.",
    ].join("\n");
  };

  return (
    <section
      aria-labelledby="pnr-result-title"
      className="mt-3 overflow-hidden rounded-2xl border-[1.5px] border-orange-200 bg-white shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08),0_2px_6px_-2px_rgba(15,23,42,0.05)]"
    >
      {/* 1. PNR OUTPUT HEADING: PNR BAR + BOARDING STATION → TRAIN / DATE / CLASS / QUOTA → RESERVATION UP TO */}
      {journeyNotice && (
        <div role="status" className="pnr-journey-notice flex items-start gap-2.5 border-b border-amber-300 bg-amber-50 px-3 py-2 text-amber-950 sm:px-5">
          <TrainFront aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 motion-safe:animate-pulse" />
          <div>
            <p className="type-body  font-extrabold">{journeyNotice === "scheduled" ? "Scheduled departure time has passed" : "Journey date has passed"}</p>
            <p className="type-body-small mt-0.5 leading-relaxed">{journeyNotice === "scheduled" ? "Based on your boarding date and scheduled time. Check Live Train Status for actual departure and delays." : "This PNR is for an earlier journey date. Check Live Train Status to verify the train’s actual departure."}</p>
          </div>
        </div>
      )}
      <header className="border-b border-orange-200 bg-orange-50/30 px-3 py-2.5 sm:px-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <TicketCheck aria-hidden="true" className="h-4 w-4" />
            </span>
            <h2 id="pnr-result-title" className="type-result-title  tracking-tight text-[#0b2240] ">
              You queried for: PNR Number {pnr}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/^[0-9]{3,6}$/.test(trainNumber) && (
              <InternalLink
                href={`/live-train-status?train=${encodeURIComponent(trainNumber)}&date=${new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())}`}
                className="type-button inline-flex h-9 items-center gap-1.5 rounded-lg bg-orange-500 px-3 font-bold text-white transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 print:hidden"
                aria-label={`View running status for train ${trainNumber}`}
              >
                <TrainFront aria-hidden="true" className="h-4 w-4" />
                Train Running Status
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </InternalLink>
            )}
            {/^[0-9]{10}$/.test(pnr) && Object.keys(record).length > 0 && <SharePnrDetails createMessage={createShareMessage} />}
            <CopyPnr pnr={pnr} />
            <button
              type="button"
              onClick={() => window.print()}
              className="type-button inline-flex h-8 items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-2.5 font-bold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 print:hidden"
            >
              <Printer aria-hidden="true" className="h-3.5 w-3.5 text-orange-600" />
              <span>Print</span>
            </button>
          </div>
        </div>

<dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-orange-200 bg-orange-100 lg:hidden">
  {[
    ["Train Number", trainNumber], ["Train Name", trainName],
    ["Boarding Date", journeyDate(boardingDate !== "\u2014" ? boardingDate : trainDate)],
    ["Boarding Point", boardingStation], ["From", fromStation], ["To", toStation],
    ["Reserved Upto", reservationUpto], ["Class", journeyClass],
  ].map(([label, value]) => (
    <div key={label} className="min-w-0 bg-white px-3 py-2.5">
      <dt className="type-caption font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="type-table mt-0.5 break-words font-medium text-[#0b2240]">
        {value}{label === "Boarding Date" && boardingTimeLabel && <span className="type-caption block text-slate-500">{boardingTimeLabel}</span>}
      </dd>
    </div>
  ))}
</dl>
<div className="hidden overflow-x-auto rounded-lg border border-orange-200 lg:block"><table aria-label="Journey details" className="type-table w-full min-w-[640px] border-collapse text-left"><thead className="type-caption bg-orange-50 text-orange-900"><tr><th scope="col" className="type-table px-4 py-3">Train Number</th><th scope="col" className="type-table px-4 py-3">Train Name</th><th scope="col" className="type-table px-4 py-3">Boarding Date</th><th scope="col" className="type-table px-4 py-3">Boarding Point</th><th scope="col" className="type-table px-4 py-3">From</th><th scope="col" className="type-table px-4 py-3">To</th><th scope="col" className="type-table px-4 py-3">Reserved Upto</th><th scope="col" className="type-table px-4 py-3">Class</th></tr></thead><tbody><tr className="divide-x divide-orange-100 text-[#0b2240]"><td className="type-table px-4 py-4">{trainNumber}</td><td className="type-table px-4 py-4">{trainName}</td><td className="type-table whitespace-nowrap px-4 py-4">{journeyDate(boardingDate !== "\u2014" ? boardingDate : trainDate)}{boardingTimeLabel && <span className="type-caption mt-1 block text-slate-600">{boardingTimeLabel}</span>}</td><td className="type-table px-4 py-4">{boardingStation}</td><td className="type-table px-4 py-4">{fromStation}</td><td className="type-table px-4 py-4">{toStation}</td><td className="type-table px-4 py-4">{reservationUpto}</td><td className="type-table px-4 py-4">{journeyClass}</td></tr></tbody></table></div>
      </header>
      {/* 3. Passenger status and live confirmation estimate */}
      <div className="px-3 py-2.5 sm:px-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 id="pnr-passenger-title" className="type-h3  text-[#0b2240] ">
            Passenger status
          </h3>
          <span className="type-caption rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 font-bold text-orange-800">
            {passengers.length} {passengers.length === 1 ? "passenger" : "passengers"}
          </span>
        </div>

        {passengerRows.length > 0 ? (
          <>
          <div className="space-y-2 lg:hidden">
            {passengerRows.map((passenger) => {
              const confirmation = getConfirmationDisplay(passenger);
              return (
                <article key={passenger.id} className="rounded-lg border border-orange-200 bg-white p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="type-label pt-1 font-bold text-[#0b2240]">Passenger {passenger.serial}</span>
                    <span title={confirmation.statusKind === "rac" ? "RAC allows you to travel, but a full berth is not guaranteed." : undefined} className={`type-table max-w-[65%] whitespace-normal rounded-md border px-2 py-1 text-center font-bold ${confirmation.tone}`}>
                      {confirmation.label}
                    </span>
                  </div>
                  <dl className="space-y-2 border-t border-orange-100 pt-2">
                    <div className="min-w-0">
                      <dt className="type-caption font-medium text-slate-500">Current status</dt>
                      <dd className="type-body-small break-words font-mono font-bold text-slate-900">{passenger.current}</dd>
                    </div>
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                      <dt className="type-caption text-slate-500">Status at booking:</dt>
                      <dd className="type-caption break-words font-mono text-slate-600">{passenger.booking}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto rounded-xl border border-orange-200 lg:block">
            <table
              aria-labelledby="pnr-passenger-title"
              className="type-table w-full min-w-[720px] border-collapse text-left "
            >
              <thead className="type-caption border-b border-orange-200 bg-orange-50 font-bold text-orange-900">
                <tr>
                  <th scope="col" className="type-table px-3 py-2">
                    S. No.
                  </th>
                  <th scope="col" className="type-table px-3 py-2">
                    Booking Status (Coach No., Berth No., Quota)
                  </th>
                  <th scope="col" className="type-table px-3 py-2">
                    *Current Status (Coach No., Berth No.)
                  </th>
                  <th scope="col" className="type-table px-3 py-2">
                    Confirmation Status / Chance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100 bg-white">
                {passengerRows.map((passenger) => {
                  const confirmation = getConfirmationDisplay(passenger);
                  return (
                    <tr key={passenger.id} className="align-middle hover:bg-orange-50/50">
                      <th scope="row" className="type-table whitespace-nowrap px-3 py-2 font-bold text-[#0b2240]">
                        {passenger.serial}
                      </th>
                      <td className="type-table whitespace-nowrap px-3 py-2 font-mono font-medium text-slate-700">
                        {passenger.booking}
                      </td>
                      <td
                        className={`type-table whitespace-nowrap px-3 py-2 font-mono font-bold ${
                          isCancelledStatus(passenger.current) ? "text-rose-800" : "text-slate-900"
                        }`}
                      >
                        <span className={`inline-flex rounded-md border px-2 py-1 ${getPnrStatusTone(passenger.current)}`}>
                          {passenger.current}
                        </span>
                      </td>
                      <td className="type-table whitespace-nowrap px-3 py-2">
                        <span title={confirmation.statusKind === "rac" ? "RAC allows you to travel, but a full berth is not guaranteed." : undefined} className={`inline-flex max-w-full whitespace-normal rounded-md border px-2 py-1 font-bold ${confirmation.tone}`}>
                          {confirmation.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <p className="type-body-small rounded-xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-4 text-slate-600 ">
            Passenger details aren’t available in the railway provider’s response.
          </p>
        )}

<div className="mt-4">
          <dl className="overflow-hidden rounded-lg border border-orange-200 bg-orange-100 lg:hidden">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 bg-white px-3 py-2.5"><dt className="type-table font-semibold text-slate-600">Total Fare</dt><dd className="type-table break-words text-right text-[#0b2240]">{totalFare}</dd></div>
            <div className="border-t border-orange-100 bg-white px-3 py-2.5"><dt className="type-table font-semibold text-slate-600">Chart status</dt><dd className="type-table mt-1"><span className={`inline-flex max-w-full whitespace-normal rounded-md border px-2 py-1 text-left font-semibold ${chartState === "prepared" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{chartState === "prepared" ? "Chart prepared." : chartState === "not_prepared" ? "Chart not prepared yet." : "Chart status unavailable."}</span></dd></div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-orange-100 bg-white px-3 py-2.5"><dt className="type-table font-semibold text-slate-600">Remarks</dt><dd className="type-table break-words text-right text-[#0b2240]">{displayValue(pickValue(record, ["remarks", "remark"]))}</dd></div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-orange-100 bg-white px-3 py-2.5"><dt className="type-table font-semibold text-slate-600">Train Status</dt><dd className="type-table break-words text-right text-[#0b2240]">{displayStatus(pickValue(trainRecord ?? record, ["trainStatus", "runningStatus"]))}</dd></div>
          </dl>
          <div className="hidden overflow-x-auto rounded-lg border border-orange-200 lg:block">
            <table aria-label="Fare and chart preparation details" className="type-table w-full min-w-[640px] border-collapse text-left">
              <thead className="type-caption bg-orange-50 text-orange-900">
                <tr>
                  <th scope="col" className="type-table px-4 py-3">Total Fare</th>
                  <th scope="col" className="type-table px-4 py-3">Chart Preparation</th>
                  <th scope="col" className="type-table px-4 py-3">Remarks if any</th>
                  <th scope="col" className="type-table px-4 py-3">Train Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="divide-x divide-orange-100 text-[#0b2240]">
                  <td className="type-table px-4 py-4">{totalFare}</td>
                  <td className="type-table px-4 py-4">
                    <span className={`inline-flex rounded-md border px-2 py-1 font-semibold ${chartState === "prepared" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                      {chartState === "prepared" ? "Chart prepared." : chartState === "not_prepared" ? "Chart not prepared yet." : "Chart status unavailable."}
                    </span>
                  </td>
                  <td className="type-table px-4 py-4">{displayValue(pickValue(record, ["remarks", "remark"]))}</td>
                  <td className="type-table px-4 py-4">{displayStatus(pickValue(trainRecord ?? record, ["trainStatus", "runningStatus"]))}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {chartState === "not_prepared" && (
            <p className="type-note mt-3 leading-relaxed text-slate-600">
              Passenger status may change after chart preparation.
            </p>
          )}
        </div>
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

  useEffect(() => {
    let active = true;
    const sequence = ++requestSequence.current;
    const isCurrentRequest = () => active && requestSequence.current === sequence;
    if (initialError || !hasUrlLookup)
      return () => {
        active = false;
      };
    if (lookupId && /^\d{10}$/.test(initialPnr)) {
      router.replace(lookupUrl(pathname, searchString, null, initialPnr), { scroll: false });
      return () => { active = false; };
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
    router.push(lookupUrl(pathname, searchString, null, pnr), { scroll: false });
    if (urlPnr === pnr && !lookupId) setRetryCount((count) => count + 1);
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
    <div className="pnr-page-container pnr-page-theme">
      {/* 1. COMPACT PNR SEARCH SECTION */}
      <section
        aria-label={embedded ? "PNR Lookup Form" : undefined}
        aria-labelledby={embedded ? undefined : "pnr-search-title"}
        className="rounded-2xl border border-orange-200 bg-white p-3 shadow-[0_3px_16px_rgba(15,39,71,0.06)] ring-1 ring-orange-100/60 transition-shadow focus-within:border-orange-300 focus-within:ring-orange-200/70 sm:p-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          {/* Title & Compact Help Trigger (Standalone page only) */}
          {!embedded && (
            <div className="flex min-w-0 items-start justify-between gap-3 lg:max-w-[38%]">
              <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 sm:h-10 sm:w-10">
                  <TrainFront aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h1
                    id="pnr-search-title"
                    className="type-page-title pnr-search-heading tracking-tight text-[#0b2240]"
                  >
                    PNR Status Check
                  </h1>
                  <p className="type-body pnr-search-copy text-slate-600">
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
                className={`type-label ${
                  embedded
                    ? "mb-1.5 block font-bold uppercase tracking-wider text-slate-600"
                    : "sr-only"
                }`}
              >
                10-Digit PNR Number
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500">
                    <Ticket aria-hidden="true" className="h-5 w-5" />
                  </div>
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
                    className="type-input h-11 w-full rounded-xl border-2 border-orange-300/80 bg-[#FFFDF9] pl-11 pr-16 font-bold tracking-[0.08em] text-[#0b2240] shadow-[0_2px_8px_rgba(249,115,22,0.06)] outline-none transition duration-150 placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 hover:border-orange-400 hover:bg-white focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 sm:h-12"
                  />
                  <span
                    aria-hidden="true"
                    className={`type-caption pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 font-bold tabular-nums transition-colors ${
                      pnr.length === 10
                        ? "border border-emerald-300 bg-emerald-100 text-emerald-800"
                        : pnr.length > 0
                          ? "border border-orange-200 bg-orange-100 text-orange-800"
                          : "border border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {pnr.length}/10
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="type-button inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 font-bold text-white shadow-sm transition hover:bg-orange-700 hover:shadow-md active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-70 sm:h-12"
                >
                  <Search aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
                  {loading ? "Checking…" : "Check PNR"}
                </button>
              </div>

              {/* Helper row + Collapsible Where to find PNR */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p id="pnr-hint" className="type-body  text-slate-500">
                    Digits only · PNR is 10 digits
                  </p>
                  {message && (
                    <p
                      id="pnr-message"
                      aria-live="polite"
                      className="type-body-small inline-flex items-center gap-1 font-semibold text-emerald-700"
                    >
                      <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                      {message}
                    </p>
                  )}
                  {!message && <span id="pnr-message" className="sr-only" aria-live="polite" />}
                  {loading && (
                    <p
                      role="status"
                      className="type-note inline-flex items-center gap-1.5 font-semibold text-slate-600"
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                      Checking your PNR…
                    </p>
                  )}
                </div>

                <details className="group relative">
                  <summary className="type-caption inline-flex cursor-pointer list-none items-center gap-1 font-semibold text-orange-700 marker:hidden hover:text-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500">
                    <CircleHelp aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Where to find your PNR?</span>
                    <ChevronDown
                      aria-hidden="true"
                      className="h-3 w-3 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="type-body-small mt-1.5 leading-relaxed text-slate-600">Find your 10-digit PNR on your ticket, booking SMS, email or app booking details.</p>
                </details>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2"
                >
                  <p className="type-body  font-semibold text-rose-800">{error}</p>
                  {canRetry && (
                    <button
                      type="button"
                      onClick={retryLookup}
                      className="type-button inline-flex min-h-7 items-center justify-center rounded-md border border-orange-300 bg-white px-2.5 font-bold text-orange-700 transition hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
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
          <p className="type-body  font-bold uppercase tracking-[0.14em] text-orange-600">
            QUICK GUIDE
          </p>
          <h2
            id="status-guide-title"
            className="type-section-compact mt-1 tracking-tight text-[#0b2240] "
          >
            What does your ticket status mean?
          </h2>
          <p className="type-body-small mt-1 leading-relaxed text-slate-600">
            A plain-language reference to Indian Railway reservation and waiting list status codes.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
          {statusTypes.map((status) => (
            <div key={status.code} className={`pnr-guide-item min-w-0 rounded-xl border p-3 ${status.color}`}>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="type-body-small  font-semibold text-[#0b2240]">
                  {status.code}
                </span>
                <span className="type-helper  font-normal text-slate-500">
                  {status.title}
                </span>
              </div>
              <div className="mt-1 flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-orange-500"
                />
                <p className="type-body  leading-[1.5] text-slate-600">
                  {status.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-slate-200/80 pt-3.5">
          <p className="type-body  text-slate-600">
            Ticket status can change until chart preparation.
          </p>
          <InternalLink
            href="/train-chart-preparation-time"
            className="type-button inline-flex items-center gap-1 font-semibold text-orange-700 hover:text-orange-800"
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
          <h2 id="pnr-faq-title" className="type-section-compact  text-[#0b2240] ">
            Frequently asked questions
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {faqs.map((faq) => (
            <details key={faq.q} className="group py-3 first:pt-1 last:pb-0">
              <summary className="type-caption flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-slate-800 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 ">
                <span>{faq.q}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-orange-600 transition-transform duration-150 group-open:rotate-180"
                />
              </summary>
              <p className="type-body-small mt-2 max-w-3xl leading-5 text-slate-600 ">{faq.a}</p>
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
      <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-4 sm:py-5">
        <AllToolsLink />
        {pnrBody}
      </main>
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
  const initialPnr = urlPnr ?? (
    lookupId && typeof window !== "undefined" ? readPnrFromSession(lookupId) ?? "" : ""
  );
  const initialError =
    urlPnr === null && lookupId && typeof window !== "undefined" && !initialPnr
      ? "This private lookup is no longer available in this browser session. Enter your PNR to check again."
      : urlPnr !== null && !/^\d{10}$/.test(urlPnr)
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
      <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-4 sm:py-5">
        <AllToolsLink />
        <div className="pnr-page-container">
          <h1 className="type-page-title mb-4 text-[#142B45] ">PNR Status Check</h1>
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
