"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Copy,
  Printer,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  CircleHelp,
  Clock3,
  Info,
  Search,
  TicketCheck,
  TrainFront,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { InternalLink } from "@/components/ui/InternalLink";

const statusTypes = [
  {
    code: "CNF",
    title: "Confirmed",
    body: "A seat or berth is confirmed. Coach and berth details may appear after chart preparation.",
    tone: "emerald",
  },
  {
    code: "RAC",
    title: "Reservation Against Cancellation",
    body: "You can board. A shared berth may be assigned, with a chance of an upgrade later.",
    tone: "blue",
  },
  {
    code: "WL",
    title: "Waiting List",
    body: "A berth is not confirmed yet. Your position can change as other passengers cancel.",
    tone: "amber",
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

function getPnrStatusTone(status: string) {
  if (/\bCNF\b|confirmed/i.test(status)) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (/\bRAC\b/i.test(status)) return "border-blue-200 bg-blue-50 text-blue-800";
  if (/\bWL\b|waitlist/i.test(status)) return "border-amber-200 bg-amber-50 text-amber-900";
  if (/cancel/i.test(status)) return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function getPnrStatusKind(status: string): "confirmed" | "rac" | "waiting" | "cancelled" | "unavailable" {
  if (/\bCNF\b|confirmed/i.test(status)) return "confirmed";
  if (/\bRAC\b/i.test(status)) return "rac";
  if (/\bWL\b|waitlist/i.test(status)) return "waiting";
  if (/cancel/i.test(status)) return "cancelled";
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

function pickValue(record: DataRecord, keys: string[]): unknown {
  for (const key of keys) {
    const foundKey = Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
    if (foundKey && record[foundKey] !== null && record[foundKey] !== undefined && record[foundKey] !== "") {
      return record[foundKey];
    }
  }
  return undefined;
}

function isRacOrWaitlisted(value: unknown): boolean {
  const record = asRecord(value);
  const status = record
    ? pickValue(record, ["status", "statusText", "currentStatus", "formatted", "displayText"])
    : value;
  return /^(?:RAC|[A-Z]*WL)(?:$|[\s/:-])/i.test(displayValue(status).trim());
}

function PredictionFieldTables({ name, value, depth = 0 }: { name: string; value: unknown; depth?: number }) {
  const record = asRecord(value);
  const rows = Array.isArray(value) ? value : null;
  const scalarEntries = record ? Object.entries(record).filter(([, item]) => item === null || typeof item !== "object") : [];
  const nestedEntries = record ? Object.entries(record).filter(([, item]) => item !== null && typeof item === "object") : [];
  const objectRows = rows?.map(asRecord).filter((item): item is DataRecord => item !== null) ?? [];
  const columns = [...new Set(objectRows.flatMap((item) => Object.keys(item)))];

  return <section className={depth > 0 ? "mt-3 border-l-2 border-slate-100 pl-3" : ""}>
    {name && <h5 className="mb-2 text-xs font-extrabold text-[#0b2240]">{name}</h5>}
    {scalarEntries.length > 0 && <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[320px] border-collapse text-left text-xs"><tbody className="divide-y divide-slate-100">{scalarEntries.map(([key, item]) => <tr key={key} className="even:bg-slate-50/60"><th scope="row" className="w-1/3 px-3 py-2 font-semibold text-slate-600">{key}</th><td className="break-words px-3 py-2 text-slate-800">{item === null ? "—" : String(item)}</td></tr>)}</tbody></table></div>}
    {rows && rows.length === 0 && <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">No passenger prediction details were returned.</p>}
    {rows && rows.length > 0 && objectRows.length === rows.length && <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-max border-collapse text-left text-xs"><thead className="bg-slate-50"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap border-b border-slate-200 px-3 py-2 font-bold text-slate-600">{column}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{objectRows.map((item, index) => <tr key={String(item.serialNumber ?? item.passengerNumber ?? index)} className="align-top even:bg-slate-50/60">{columns.map((column) => <td key={column} className="max-w-64 whitespace-nowrap px-3 py-2 text-slate-800">{Object.prototype.hasOwnProperty.call(item, column) ? (typeof item[column] === "object" ? JSON.stringify(item[column]) : String(item[column])) : "—"}</td>)}</tr>)}</tbody></table></div>}
    {rows && rows.length > 0 && objectRows.length !== rows.length && <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[240px] border-collapse text-left text-xs"><thead className="bg-slate-50"><tr><th className="border-b border-slate-200 px-3 py-2 font-bold text-slate-600">#</th><th className="border-b border-slate-200 px-3 py-2 font-bold text-slate-600">Value</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((item, index) => <tr key={index}><td className="px-3 py-2 text-slate-500">{index + 1}</td><td className="break-words px-3 py-2 text-slate-800">{String(item)}</td></tr>)}</tbody></table></div>}
    {nestedEntries.map(([key, item]) => <PredictionFieldTables key={key} name={key} value={item} depth={depth + 1} />)}
  </section>;
}

function PnrPredictionPanel({ pnr, passengers, record }: { pnr: string; passengers: DataRecord[]; record: DataRecord }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const eligible = passengers.some((passenger) => {
    const current = pickValue(passenger, ["current", "currentStatus", "currentStatusDetails", "current_status"]);
    const booking = pickValue(passenger, ["booking", "bookingStatus", "bookingStatusDetails", "booking_status"]);
    return pickValue(passenger, ["isRAC"]) === true || pickValue(passenger, ["isWaitlisted"]) === true || isRacOrWaitlisted(current ?? booking);
  }) || pickValue(record, ["isRAC", "isWaitlisted"]) === true || (passengers.length === 0 && isRacOrWaitlisted(pickValue(record, ["currentStatus", "bookingStatus", "status"])));

  async function checkPrediction() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`/api/pnr/${encodeURIComponent(pnr)}/prediction`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok || body.success !== true || !body.data) {
        throw new Error(typeof body.error === "string" ? body.error : "Could not retrieve a confirmation prediction.");
      }
      setResult(body.data);
    } catch (predictionError) {
      setError(predictionError instanceof Error ? predictionError.message : "Prediction lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!eligible) return null;

  const outer = asRecord(result);
  const data = outer ? asRecord(outer.data) ?? asRecord(outer.result) ?? outer : null;
  const prediction = data ? asRecord(pickValue(data, ["prediction", "confirmationPrediction", "predictionDetails"])) ?? data : null;
  const predictionStatus = displayValue(prediction && pickValue(prediction, ["predictionStatus", "predictedStatus", "recommendation", "outcome", "status", "prediction"]));
  const probability = displayValue(prediction && pickValue(prediction, ["confirmationProbability", "probability", "confirmationChance", "chancePercentage", "confirmationPercentage", "chance"]));
  const summary = displayValue(prediction && pickValue(prediction, ["message", "summary", "explanation", "reason", "predictionText", "description"]));

  return <section className="mt-4 overflow-hidden rounded-xl border border-orange-200 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><Info aria-hidden="true" className="h-5 w-5" /></span><div><h4 className="text-sm font-extrabold text-[#0b2240] sm:text-base">Ticket confirmation prediction</h4><p className="mt-0.5 text-xs text-slate-600">For your RAC or waitlisted passenger status</p></div></div>
      <button type="button" onClick={checkPrediction} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-60"><BadgeCheck aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />{loading ? "Checking prediction…" : result ? "Refresh prediction" : "Check confirmation chance"}</button>
    </div>
    {error && <p role="alert" className="mx-4 mt-3 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-800 sm:mx-5">{error}</p>}
    {Boolean(result) && <div aria-live="polite" className="space-y-3 p-4 sm:p-5">
      {(predictionStatus !== "—" || probability !== "—" || summary !== "—") && <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Prediction result</p><p className="mt-1 text-lg font-extrabold text-[#0b2240]">{predictionStatus !== "—" ? predictionStatus : "Status estimate"}</p>{summary !== "—" && <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600">{summary}</p>}</div>
          {probability !== "—" && <div className="min-w-28 rounded-xl bg-emerald-50 px-4 py-3 text-center"><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Confirmation chance</p><p className="mt-1 text-xl font-extrabold text-emerald-800">{probability}</p></div>}
        </div>
      </div>}
      {data && <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4"><h5 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">Prediction details</h5><PredictionFieldTables name="" value={data} />{Boolean(outer?.meta) && <PredictionFieldTables name="meta" value={outer?.meta} depth={1} />}</div>}
    </div>}
  </section>;
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
function StationName({ value }: { value: string }) {
  const match = /^(.*?)\s*\(([^)]+)\)$/.exec(value);
  return <p className="mt-1 break-words text-base font-bold tracking-tight text-[#0F172A] sm:text-lg">{match ? <>{match[1]} <span className="text-sm font-medium text-slate-500">({match[2]})</span></> : value === "—" ? "Station unavailable" : value}</p>;
}
function PassengerConfirmation({ status }: { status: string }) {
  const kind = getPnrStatusKind(status);
  const label = status === "—" ? pnrStatusLabels.unavailable : pnrStatusLabels[kind];
  if (kind === "confirmed") return <span className="inline-flex cursor-default items-center gap-1.5 text-xs font-medium text-emerald-700"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-600" />{label}</span>;
  return <span className={`inline-flex cursor-default rounded-md border px-2 py-1 text-xs font-semibold ${getPnrStatusTone(status)}`}>{label}</span>;
}
function CopyPnr({ pnr }: { pnr: string }) {
  const [message, setMessage] = useState("");
  async function copy() {
    try { await navigator.clipboard.writeText(pnr); setMessage("PNR copied"); }
    catch { setMessage("Select the PNR to copy manually."); }
  }
  return <div className="group/copy relative flex items-center gap-2"><button type="button" title="Copy PNR" aria-label={message === "PNR copied" ? "PNR copied" : "Copy PNR number"} onClick={copy} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"><Copy aria-hidden="true" className="h-4 w-4" /></button><span role="status" aria-live="polite" className="text-xs text-slate-600">{message}</span><span aria-hidden="true" className="pointer-events-none absolute right-0 top-full z-20 mt-1 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 shadow transition-opacity group-hover/copy:opacity-100 group-focus-within/copy:opacity-100">Copy PNR</span></div>;
}

function PnrResult({ response, pnr }: { response: unknown; pnr: string }) {
  const outer = asRecord(response) ?? {};
  const record = asRecord(outer.data) ?? asRecord(outer.result) ?? asRecord(outer.pnrStatus) ?? outer;
  const trainRecord = asRecord(pickValue(record, ["train", "trainDetails", "trainInfo"]));
  const chartingRecord = asRecord(pickValue(record, ["charting", "chartDetails"]));
  const trainNumber = displayValue(pickValue(record, ["trainNumber", "train_no", "trainNo", "train_num"]) ?? (trainRecord && pickValue(trainRecord, ["trainNumber", "train_no", "trainNo", "number"])));
  const trainName = displayValue(pickValue(record, ["trainName", "train_name"]) ?? (trainRecord && pickValue(trainRecord, ["trainName", "train_name", "name"])));
  const trainDate = displayValue(pickValue(trainRecord ?? record, ["trainDate", "journeyDate", "dateOfJourney", "doj", "journey_date", "travelDate"]));
  const boardingDate = displayValue(pickValue(record, ["boardingDate", "boarding_date", "dateOfBoarding"]) ?? pickValue(trainRecord ?? record, ["boardingDate", "boarding_date", "dateOfBoarding", "journeyDate"]));
  const journeyClass = displayValue(pickValue(trainRecord ?? record, ["journeyClass", "class", "className", "trainClass"]));
  const passengersValue = pickValue(record, ["passengers", "passengerStatus", "passengerDetails", "passengerList", "psgnDtlList"]);
  const passengers = Array.isArray(passengersValue) ? passengersValue.map(asRecord).filter((item): item is DataRecord => item !== null) : [];
  const firstBooking = passengers.length ? asRecord(pickValue(passengers[0], ["booking", "bookingStatus"])) : null;
  const quota = displayValue(pickValue(record, ["quota", "quotaName", "quotaCode"]) ?? (firstBooking && pickValue(firstBooking, ["quota"])));
  const fromValue = pickValue(trainRecord ?? record, ["from", "source", "origin", "fromStation", "originStation"]);
  const toValue = pickValue(trainRecord ?? record, ["to", "destination", "toStation", "destinationStation", "reservationUpto"]);
  const reservationUptoValue = pickValue(trainRecord ?? record, ["reservationUpto", "reservationUptoStation", "reservedUpto"]);
  const boardingValue = pickValue(trainRecord ?? record, ["boardingStation", "boardingPoint", "boarding_point"]);
  const fromStation = formatStation(fromValue, trainRecord ?? record,
    ["fromCode", "sourceCode", "originCode", "fromStationCode", "sourceStationCode"],
    ["fromName", "sourceName", "originName", "fromStationName", "sourceStationName"]);
  const toStation = formatStation(toValue, trainRecord ?? record,
    ["toCode", "destinationCode", "toStationCode", "destinationStationCode", "reservationUptoCode"],
    ["toName", "destinationName", "toStationName", "destinationStationName", "reservationUptoName"]);
  const reservationUpto = formatStation(reservationUptoValue, trainRecord ?? record,
    ["reservationUptoCode", "reservedUptoCode"], ["reservationUptoName", "reservedUptoName"]);
  const boardingStation = formatStation(boardingValue, trainRecord ?? record,
    ["boardingStationCode", "boardingPointCode", "boardingCode"],
    ["boardingStationName", "boardingPointName", "boardingName"]);
  const departureTime = displayValue(pickValue(trainRecord ?? record, ["departureTime", "departTime", "depTime", "boardingTime", "departure", "scheduledDepartureTime", "journeyDepartureTime"]));
  const chartStatus = displayValue(chartingRecord ? pickValue(chartingRecord, ["status", "chartStatus", "chartingStatus"]) : pickValue(record, ["chartStatus", "chartingStatus"]));
  const chartPrepared = chartingRecord ? pickValue(chartingRecord, ["isPrepared", "prepared"]) : pickValue(record, ["chartPrepared", "isChartPrepared"]);
  const estimatedChartTime = displayValue(pickValue(chartingRecord ?? record, ["estimatedPreparationTime", "estimatedChartPreparationTime", "expectedPreparationTime", "estimatedAt"]));
  const passengerRows = passengers.map((passenger, index) => {
    const booking = displayStatus(pickValue(passenger, ["bookingStatus", "booking", "bookingStatusDetails", "booking_status", "bookingStatusText"]));
    const current = displayStatus(pickValue(passenger, ["currentStatus", "current", "currentStatusDetails", "current_status", "currentStatusText", "status"]));
    const allocation = asRecord(pickValue(passenger, ["currentStatus", "current", "currentStatusDetails", "current_status"]));
    const parts = current.split(/\s*\/\s*/);
    const allocated = /^(CNF|RAC)$/i.test(parts[0]) && parts.length >= 3;
    const coach = displayValue((allocation && pickValue(allocation, ["coach", "coachId", "coachNumber", "coachNo"])) ?? (allocated ? parts[1] : undefined));
    const seat = displayValue((allocation && pickValue(allocation, ["berth", "berthNo", "berthNumber", "seatNumber", "seatNo"])) ?? (allocated ? parts[2] : undefined));
    const seatType = displayValue(allocation && pickValue(allocation, ["berthCode", "berthType", "seatType"]));
    const passengerFlags = [
      ["isConfirmed", "Confirmed", "emerald"],
      ["isRAC", "RAC", "blue"],
      ["isWaitlisted", "Waitlisted", "amber"],
      ["isCancelled", "Cancelled", "rose"],
    ] as const;
    const activeFlags = passengerFlags.filter(([key]) => pickValue(passenger, [key]) === true);
    const serial = displayValue(pickValue(passenger, ["serialNumber", "serialNo", "sNo", "sno"]));
    return {
      id: `${serial}-${index}`,
      serial: serial === "—" ? index + 1 : serial,
      booking,
      current,
      coach,
      seat,
      seatType,
      activeFlags,
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
  const overallStatusText = passengerKinds.length === 1
    ? unavailableCurrentCount === 0
      ? passengerKinds[0] === "confirmed" ? "Ticket Confirmed" : pnrStatusLabels[passengerKinds[0]]
      : `${passengerStatusCounts[passengerKinds[0]]} current ${pnrStatusLabels[passengerKinds[0]].toLowerCase()} · ${unavailableCurrentCount} unavailable`
    : passengerKinds.length > 1
      ? [...passengerKinds.map((kind) => `${passengerStatusCounts[kind]} ${pnrStatusLabels[kind].toLowerCase()}`), ...(unavailableCurrentCount > 0 ? [`${unavailableCurrentCount} current unavailable`] : [])].join(" · ")
      : providerOverallKind !== "unavailable"
        ? pnrStatusLabels[providerOverallKind]
        : bookingKinds.length > 0
          ? `Current status unavailable · booking: ${bookingKinds.map((kind) => `${passengerBookingCounts[kind]} ${pnrStatusLabels[kind].toLowerCase()}`).join(" · ")}`
          : "Status unavailable";
  const overallStatusTone = passengerKinds.length === 1 && unavailableCurrentCount === 0
    ? getPnrStatusTone(pnrStatusLabels[passengerKinds[0]])
    : providerOverallKind !== "unavailable" && passengerKinds.length === 0
      ? getPnrStatusTone(providerOverallStatus)
      : "border-slate-200 bg-slate-50 text-slate-700";
  const isPrepared = chartPrepared === true || (chartPrepared !== false && /^(?:chart\s+)?prepared$/i.test(chartStatus.trim()));
  const arrival = displayValue(pickValue(trainRecord ?? record, ["actualArrivalTime", "arrivalTimeActual", "actualArrival", "actual_arrival"]));
  const journeyOrigin = boardingStation !== "—" ? boardingStation : fromStation;

  const trainLabel = `${trainNumber !== "—" ? `${trainNumber} · ` : ""}${trainName !== "—" ? trainName : "Train details unavailable"}`;
  const chartLabel = isPrepared ? "Prepared" : chartPrepared === false ? "Not prepared" : chartStatus !== "—" ? chartStatus : "Status unavailable";
  const isOverallConfirmed = getPnrStatusKind(overallStatusText) === "confirmed";

  return (
    <div className="mx-auto mt-3 w-full max-w-[1100px] space-y-3 sm:mt-4">
      <section aria-labelledby="pnr-result-title" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700"><TicketCheck aria-hidden="true" className="h-5 w-5" /></span>
            <div className="min-w-0"><h3 id="pnr-result-title" className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">PNR {pnr}</h3></div>
          </div>
          <div className="flex items-center gap-2"><CopyPnr pnr={pnr} /><button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center gap-2 rounded-lg border border-orange-200 bg-white px-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 print:hidden"><Printer aria-hidden="true" className="h-4 w-4" /><span className="hidden sm:inline">Print</span></button></div>
        </header>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-slate-200 px-4 py-3 sm:grid-cols-4 sm:px-5">
          <div className="min-w-0"><dt className="text-xs font-medium text-slate-500 sm:text-sm">Train number / name</dt><dd className="mt-1 break-words text-base font-bold text-slate-900 sm:text-lg">{trainLabel}</dd>{journeyClass !== "—" && <p className="mt-1 text-xs text-slate-600">{journeyClass}{quota !== "—" ? ` · ${quota === "GN" ? "General quota" : quota}` : ""}</p>}</div>
          <div><dt className="text-xs font-medium text-slate-500 sm:text-sm">Journey date</dt><dd className="mt-1 text-sm font-bold text-slate-900 sm:text-base">{journeyDate(trainDate)}</dd></div>
          <div><dt className="text-xs font-medium text-slate-500 sm:text-sm">Current status</dt><dd className="mt-1"><span className={`inline-flex max-w-full cursor-default items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${isOverallConfirmed ? "border-emerald-200 bg-emerald-50 text-emerald-800" : overallStatusTone}`}>{isOverallConfirmed && <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}{overallStatusText}</span></dd></div>
          <div><dt className="text-xs font-medium text-slate-500 sm:text-sm">Chart prepared</dt><dd className="mt-1"><span className="inline-flex cursor-default items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800"><ClipboardCheck aria-hidden="true" className="h-3.5 w-3.5" />{chartLabel}</span></dd>{!isPrepared && estimatedChartTime !== "—" && <p className="mt-1 text-xs text-slate-600">Estimated {formatPnrDateTime(estimatedChartTime)}</p>}</div>
        </dl>

        <section aria-labelledby="pnr-passenger-title" className="px-4 py-3 sm:px-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h4 id="pnr-passenger-title" className="text-base font-bold text-slate-900">Passenger status</h4><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{passengers.length} {passengers.length === 1 ? "passenger" : "passengers"}</span></div>
          {passengerRows.length > 0 ? <>
            <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block">
              <table className="w-full table-fixed border-collapse text-left text-sm">
                <thead className="border-b border-orange-100 bg-orange-50 text-slate-800"><tr><th scope="col" className="w-[12%] px-4 py-2.5 font-semibold">S.No</th><th scope="col" className="w-[29%] px-4 py-2.5 font-semibold">Booking status</th><th scope="col" className="w-[35%] px-4 py-2.5 font-semibold">Current status</th><th scope="col" className="w-[24%] px-4 py-2.5 font-semibold">Confirmation</th></tr></thead>
                <tbody className="divide-y divide-slate-200">{passengerRows.map((passenger) => <tr key={passenger.id} className="align-middle"><th scope="row" className="px-4 py-3 font-semibold text-slate-700">Passenger {passenger.serial}</th><td className="break-words px-4 py-3 font-mono text-xs text-slate-700">{passenger.booking}</td><td className="break-words px-4 py-3"><p className="font-mono text-xs font-semibold text-slate-900">{passenger.current}</p>{passenger.coach !== "—" || passenger.seat !== "—" ? <p className="mt-0.5 text-xs text-slate-600">{passenger.coach !== "—" ? `Coach ${passenger.coach}` : ""}{passenger.coach !== "—" && passenger.seat !== "—" ? " · " : ""}{passenger.seat !== "—" ? `Seat ${passenger.seat}` : ""}</p> : null}</td><td className="px-4 py-3"><PassengerConfirmation status={passenger.current} /></td></tr>)}</tbody>
              </table>
            </div>
            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 md:hidden">{passengerRows.map((passenger) => <article key={passenger.id} className="space-y-2 p-3"><div className="flex items-center justify-between gap-3"><h5 className="font-semibold text-slate-900">Passenger {passenger.serial}</h5><PassengerConfirmation status={passenger.current} /></div><dl className="grid grid-cols-2 gap-2 text-xs"><div className="min-w-0"><dt className="text-slate-500">Booking status</dt><dd className="mt-1 break-words font-mono font-medium text-slate-800">{passenger.booking}</dd></div><div className="min-w-0"><dt className="text-slate-500">Current status</dt><dd className="mt-1 break-words font-mono font-semibold text-slate-900">{passenger.current}</dd></div></dl>{(passenger.coach !== "—" || passenger.seat !== "—") && <p className="text-xs font-medium text-slate-600">{passenger.coach !== "—" ? `Coach ${passenger.coach}` : ""}{passenger.coach !== "—" && passenger.seat !== "—" ? " · " : ""}{passenger.seat !== "—" ? `Seat ${passenger.seat}` : ""}</p>}</article>)}</div>
          </> : <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">Passenger details aren’t available in the railway provider’s response.</p>}
        </section>
        <div className="border-t border-slate-200 px-4 py-2 sm:px-5"><PnrPredictionPanel pnr={pnr} passengers={passengers} record={record} /></div>
      </section>

      <section aria-labelledby="pnr-train-details-title" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-3 flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-700"><TrainFront aria-hidden="true" className="h-5 w-5" /></span><div><h4 id="pnr-train-details-title" className="text-base font-bold text-slate-900">Train details</h4></div></header>
        <div className="grid w-full grid-cols-[16px_minmax(0,1fr)] gap-x-4 md:grid-cols-[minmax(190px,0.9fr)_minmax(0,1.5fr)_minmax(220px,1fr)] md:items-center md:gap-x-5">
          <div aria-hidden="true" className="col-start-1 row-start-1 row-end-3 flex flex-col items-center py-2 md:hidden"><span className="h-3 w-3 rounded-full border-[3px] border-blue-600 bg-white" /><span className="min-h-10 w-px flex-1 bg-slate-300" /><span className="h-3 w-3 rounded-full border-[3px] border-orange-600 bg-white" /></div>
          <div className="col-start-2 min-w-0 pb-3 md:col-start-1 md:pb-0"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Boarding from</p><StationName value={journeyOrigin} />{boardingDate !== "—" && boardingDate !== trainDate && <p className="mt-1.5 text-sm text-slate-600">Boarding date: {journeyDate(boardingDate)}</p>}{departureTime !== "—" && <p className="mt-1 text-sm font-semibold text-slate-900">Departs {journeyTime(departureTime)}</p>}</div>
          <div aria-hidden="true" className="relative col-start-2 hidden h-8 items-center md:col-start-2 md:flex"><span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-300" /><span className="relative z-10 h-3 w-3 shrink-0 rounded-full border-2 border-blue-600 bg-white" /><TrainFront className="relative z-10 mx-auto h-5 w-5 shrink-0 text-orange-600" /><span className="relative z-10 h-3 w-3 shrink-0 rounded-full border-2 border-orange-600 bg-white" /></div>
          <div className="col-start-2 min-w-0 md:col-start-3"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Reservation up to</p><StationName value={reservationUpto !== "—" ? reservationUpto : toStation} />{arrival !== "—" && <p className="mt-2 text-sm text-slate-600">Arrival <strong>{journeyTime(arrival)}</strong></p>}</div>
        </div>
      </section>

    </div>
  );
}

function PnrResultSkeleton() {
  return <div aria-busy="true" aria-label="Loading PNR ticket status" className="mx-auto mt-3 w-full max-w-[1100px] space-y-3 sm:mt-4">
    <span className="sr-only">Loading the latest ticket status…</span>
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-5"><span className="h-10 w-10 rounded-xl bg-orange-50" /><div className="space-y-2"><div className="h-4 w-40 rounded bg-slate-200" /><div className="h-3 w-24 rounded bg-slate-100" /></div></div>
      <div className="grid grid-cols-2 gap-4 border-b border-slate-100 px-4 py-4 sm:grid-cols-4 sm:px-5">{[0, 1, 2, 3].map((item) => <div key={item} className="space-y-2"><div className="h-3 w-20 rounded bg-slate-100" /><div className="h-4 w-28 max-w-full rounded bg-slate-200" /></div>)}</div>
      <div className="space-y-3 px-4 py-4 sm:px-5"><div className="h-4 w-32 rounded bg-slate-200" /><div className="h-10 w-full rounded-lg bg-orange-50" /><div className="h-12 w-full rounded-lg bg-slate-100" /></div>
    </div>
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-5 h-5 w-32 rounded bg-slate-200" /><div className="flex items-center gap-3"><div className="h-4 w-32 rounded bg-slate-100" /><div className="h-1 flex-1 rounded bg-slate-200" /><div className="h-4 w-36 rounded bg-slate-100" /></div></div>
  </div>;
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
}) {
  const [pnr, setPnr] = useState(() => initialPnr || (lookupId && typeof window !== "undefined" ? readPnrFromSession(lookupId) ?? "" : ""));
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
    if (initialError || !hasUrlLookup) return () => { active = false; };
    if (lookupId && urlPnr !== null) {
      router.replace(lookupUrl(pathname, searchString, lookupId), { scroll: false });
      return () => { active = false; };
    }
    if (!lookupId && urlPnr !== null) {
      if (!legacyLookupId.current) legacyLookupId.current = savePnrToSession(urlPnr);
      if (legacyLookupId.current) {
        router.replace(lookupUrl(pathname, searchString, legacyLookupId.current), { scroll: false });
        return () => { active = false; };
      }
    }

    if (!/^\d{10}$/.test(initialPnr)) return () => { active = false; };
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

    return () => { active = false; };
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

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900">
      <Header />
      <main className="flex-1">
        <section className="border-b border-orange-100 bg-white px-4 pt-8 pb-6 sm:pt-10 sm:pb-8 lg:pt-11 lg:pb-8">
          <div className="mx-auto flex w-full max-w-[1100px] items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><TrainFront aria-hidden="true" className="h-5 w-5" /></span>
            <div><h1 className="text-xl font-extrabold tracking-tight text-[#0b2240] sm:text-2xl">PNR Status Check</h1><p className="mt-0.5 text-xs text-slate-600 sm:text-sm">Check your ticket and journey details using your 10-digit PNR.</p></div>
          </div>
        </section>

        <section aria-labelledby="pnr-search-title" className="px-4 pb-6 pt-4 sm:pb-8">
          <div className="mx-auto w-full max-w-[1100px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[var(--primary)]"><TicketCheck aria-hidden="true" className="h-4 w-4" /></span>
                  <div><h2 id="pnr-search-title" className="text-base font-extrabold text-[#0b2240]">Find your booking status</h2><p className="mt-0.5 text-xs text-slate-600">Enter the 10-digit PNR printed on your ticket.</p></div>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                  <label htmlFor="pnr-number" className="sr-only">PNR number</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
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
                        placeholder="e.g. 4335734389"
                        aria-describedby="pnr-hint pnr-message"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-base font-semibold tracking-[0.12em] text-[#0b2240] outline-none transition placeholder:font-normal placeholder:tracking-normal focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                    <button type="submit" disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-70">
                      <Search aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
                      {loading ? "Checking…" : "Check PNR"}
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><p id="pnr-hint" className="text-[11px] text-slate-500">Digits only · PNR is 10 digits</p><span className="text-[11px] font-semibold tabular-nums text-slate-400">{pnr.length}/10</span></div>
                  {message && <p id="pnr-message" aria-live="polite" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />{message}</p>}
                  {!message && <span id="pnr-message" className="sr-only" aria-live="polite" />}
                  {error && <div role="alert" className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2"><p className="text-xs font-semibold text-rose-800">{error}</p>{canRetry && <button type="button" onClick={retryLookup} className="inline-flex min-h-8 items-center justify-center rounded-md border border-orange-300 bg-white px-3 text-xs font-bold text-orange-700 transition hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">Retry</button>}</div>}
                </form>
                {loading && <p role="status" className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />Checking your PNR…</p>}
                {!hasUrlLookup && !loading && !error && !result && <p className="mt-2 text-[11px] text-slate-500">Your ticket status and journey details will appear here.</p>}
                <details className="group mt-2 border-t border-slate-100 pt-2">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-semibold text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"><Info aria-hidden="true" className="h-3.5 w-3.5" />How your PNR is used</summary>
                  <p className="mt-2 pl-5 text-[11px] leading-4 text-slate-600">Your PNR is sent to the configured railway status provider for this lookup. Avoid using a shared or public device.</p>
                </details>
            </div>
            {loading ? <PnrResultSkeleton /> : result !== null && <PnrResult response={result} pnr={resultPnr} />}

            <section aria-labelledby="status-guide-title" className="mt-10 sm:mt-14">
              <div className="mb-5 max-w-2xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">Quick guide</p>
                <h2 id="status-guide-title" className="mt-2 text-2xl font-extrabold tracking-tight text-[#0b2240] sm:text-3xl">What does your ticket status mean?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">A quick, plain-language guide to the most common reservation statuses.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {statusTypes.map((status) => {
                  const colors = status.tone === "emerald"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : status.tone === "blue"
                      ? "border-blue-200 bg-blue-50 text-blue-800"
                      : "border-amber-200 bg-amber-50 text-amber-800";
                  return (
                    <article key={status.code} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                      <span className={`inline-flex min-w-14 items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-extrabold ${colors}`}>{status.code}</span>
                      <h3 className="mt-4 text-base font-extrabold text-[#0b2240]">{status.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{status.body}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 grid gap-4 md:grid-cols-2">
              <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><Clock3 aria-hidden="true" className="h-5 w-5" /></span>
                <div><h2 className="font-extrabold text-[#0b2240]">When is status final?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Reservation status may change before chart preparation. Check the current official status close to departure for the latest update.</p><InternalLink href="/train-chart-preparation-time" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-800">View chart preparation guide <ArrowRight aria-hidden="true" className="h-4 w-4" /></InternalLink></div>
              </article>
              <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><BadgeCheck aria-hidden="true" className="h-5 w-5" /></span>
                <div><h2 className="font-extrabold text-[#0b2240]">Still on the waiting list?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Your position can move as bookings change. Review your ticket’s terms and check official updates before you travel.</p><p className="mt-3 text-xs font-medium text-slate-500">Confirmation chances can vary by train, route, quota and date.</p></div>
              </article>
            </section>

            <section aria-labelledby="pnr-faq-title" className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-14 sm:p-8">
              <div className="mb-4 flex items-center gap-2"><CircleHelp aria-hidden="true" className="h-5 w-5 text-orange-600" /><h2 id="pnr-faq-title" className="text-xl font-extrabold text-[#0b2240]">Frequently asked questions</h2></div>
              <div className="divide-y divide-stone-100">
                {faqs.map((faq) => <details key={faq.q} className="group py-4 first:pt-2 last:pb-1"><summary className="cursor-pointer list-none pr-6 text-sm font-bold text-slate-800 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500">{faq.q}<span aria-hidden="true" className="float-right text-orange-700 transition group-open:rotate-45">＋</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{faq.a}</p></details>)}
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function PnrStatusPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const urlPnr = searchParams.get("pnr");
  const lookupId = searchParams.get("lookup");
  const hasUrlLookup = searchParams.has("pnr") || searchParams.has("lookup");
  const initialPnr = lookupId && typeof window !== "undefined"
    ? readPnrFromSession(lookupId) ?? ""
    : urlPnr ?? "";
  const initialError = lookupId && typeof window !== "undefined" && !initialPnr
    ? "This private lookup is no longer available in this browser session. Enter your PNR to check again."
    : urlPnr !== null && !/^\d{10}$/.test(urlPnr) && !lookupId
      ? "Enter a valid 10-digit PNR number."
      : "";
  const queryIdentity = lookupId ? `lookup:${lookupId}` : urlPnr !== null ? `pnr:${urlPnr}` : "empty";

  return <PnrStatusPageView
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
  />;
}

function PnrStatusPageFallback() {
  return <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900">
    <Header />
    <main className="flex-1 px-4 py-5">
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><TicketCheck aria-hidden="true" className="h-5 w-5" /></span>
          <div><h1 className="text-xl font-extrabold tracking-tight text-[#0b2240] sm:text-2xl">PNR Status Check</h1><p className="mt-0.5 text-xs text-slate-600 sm:text-sm">Check your ticket and journey details using your 10-digit PNR.</p></div>
        </div>
        <div aria-hidden="true" className="mb-4 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-4 h-5 w-48 rounded bg-slate-200" /><div className="flex gap-2"><div className="h-11 flex-1 rounded-lg bg-slate-100" /><div className="h-11 w-32 rounded-lg bg-orange-100" /></div></div>
        <PnrResultSkeleton />
      </div>
    </main>
    <Footer />
  </div>;
}

export default function PnrStatusPage() {
  return <Suspense fallback={<PnrStatusPageFallback />}><PnrStatusPageContent /></Suspense>;
}
