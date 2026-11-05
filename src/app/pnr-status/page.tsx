"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CircleHelp,
  Clock3,
  Info,
  Search,
  TicketCheck,
  TrainFront,
  MapPin,
  X,
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
    a: "Yes. The PNR is sent to RailAgents’ railway status provider to retrieve the latest available status. The page does not save it in a user account or browser history.",
  },
];

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

  return <section className="mt-4 overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><Info aria-hidden="true" className="h-5 w-5" /></span><div><h4 className="text-sm font-extrabold text-[#0b2240] sm:text-base">Ticket confirmation prediction</h4><p className="mt-0.5 text-xs text-slate-600">For your RAC or waitlisted passenger status</p></div></div>
      <button type="button" onClick={checkPrediction} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-60"><BadgeCheck aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />{loading ? "Checking prediction…" : result ? "Refresh prediction" : "Check confirmation chance"}</button>
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

function formatLiveDateTime(value: unknown): string {
  if (typeof value !== "string") return displayValue(value);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatLiveTime(value: unknown): string {
  if (typeof value !== "string") return displayValue(value);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getDelayPresentation(value: unknown) {
  if (value === undefined || value === null || value === "" || !Number.isFinite(Number(value))) {
    return { label: "Delay unknown", classes: "bg-slate-100 text-slate-600" };
  }
  const minutes = Number(value);
  if (minutes > 0) return { label: `${minutes} min late`, classes: "bg-amber-100 text-amber-900" };
  if (minutes < 0) return { label: `${Math.abs(minutes)} min early`, classes: "bg-sky-100 text-sky-800" };
  return { label: "On time", classes: "bg-emerald-100 text-emerald-800" };
}

function TrainPositionIcon() {
  return <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[#0b2240] shadow-sm">
    <TrainFront aria-hidden="true" className="h-[21px] w-[21px] stroke-[2.25]" />
  </span>;
}

function LiveRouteTimeline({ route, currentStationCode }: { route: DataRecord[]; currentStationCode: string }) {
  if (route.length === 0) return null;
  const normalizedCurrentCode = currentStationCode.trim().toUpperCase();
  const apiPositionIndex = normalizedCurrentCode === "—" ? -1 : route.findIndex((stop) =>
    displayValue(pickValue(stop, ["stationCode", "code"])).trim().toUpperCase() === normalizedCurrentCode,
  );
  const statusPositionIndex = apiPositionIndex < 0 ? route.findIndex((stop) => {
    const stopStatus = displayValue(pickValue(stop, ["status"])).toLowerCase().replace(/[_-]/g, " ").trim();
    return ["at station", "current", "present", "here"].includes(stopStatus);
  }) : -1;
  const currentIndex = apiPositionIndex >= 0 ? apiPositionIndex : statusPositionIndex;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-label="Live train route timeline">
      <div className="hidden grid-cols-[minmax(100px,0.8fr)_28px_minmax(150px,1.5fr)_minmax(100px,0.8fr)] items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-500 md:grid">
        <span>Arrival · scheduled / actual / predicted</span><span aria-hidden="true" /><span>Station · running status</span><span className="text-right">Departure · scheduled / actual / predicted</span>
      </div>
      <ol className="relative divide-y divide-slate-100">
        {route.map((stop, index) => {
          const status = displayValue(pickValue(stop, ["status"])).toLowerCase();
          const stationName = displayValue(pickValue(stop, ["stationName", "name"]));
          const stationCode = displayValue(pickValue(stop, ["stationCode", "code"]));
          const isCurrent = index === currentIndex;
          const isPassed = currentIndex >= 0 && index < currentIndex;
          const scheduledArrival = pickValue(stop, ["scheduledArrival"]);
          const actualArrival = pickValue(stop, ["actualArrival"]);
          const scheduledDeparture = pickValue(stop, ["scheduledDeparture"]);
          const actualDeparture = pickValue(stop, ["actualDeparture"]);
          const arrivalDelay = getDelayPresentation(pickValue(stop, ["delayArrival"]));
          const departureDelay = getDelayPresentation(pickValue(stop, ["delayDeparture"]));
          const stationTimestamp = pickValue(stop, ["scheduledArrival", "actualArrival", "predictedArrival", "estimatedArrival", "scheduledDeparture", "actualDeparture", "predictedDeparture", "estimatedDeparture"]);

          return <li key={`${stationCode}-${displayValue(pickValue(stop, ["sequence"]))}-${index}`} className={`grid grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)] gap-x-2 gap-y-3 px-3 py-3 transition-colors md:grid-cols-[minmax(100px,0.8fr)_28px_minmax(150px,1.5fr)_minmax(100px,0.8fr)] md:items-center md:gap-3 md:px-5 md:py-3.5 ${isCurrent ? "bg-blue-50/80" : "bg-white hover:bg-slate-50/70"}`}>
            <div className="col-start-1 row-start-2 space-y-1.5 pt-0.5 text-[10px] md:col-start-1 md:row-start-1 md:text-xs">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Scheduled</p>
              <p className="font-bold tabular-nums text-slate-600">{scheduledArrival === undefined ? "—" : formatLiveTime(scheduledArrival)}</p>
              {actualArrival !== undefined && <p className="font-semibold tabular-nums text-emerald-700"><span className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">Actual</span> {formatLiveTime(actualArrival)}</p>}
              {pickValue(stop, ["predictedArrival"]) !== undefined && <p className="font-semibold tabular-nums text-blue-700"><span className="text-[9px] font-bold uppercase tracking-wide text-blue-600">Predicted</span> {formatLiveTime(pickValue(stop, ["predictedArrival"]))}</p>}
              {pickValue(stop, ["estimatedArrival"]) !== undefined && <p className="font-semibold tabular-nums text-blue-700"><span className="text-[9px] font-bold uppercase tracking-wide text-blue-600">Estimated</span> {formatLiveTime(pickValue(stop, ["estimatedArrival"]))}</p>}
              <p className={`inline-flex w-fit rounded-md px-1.5 py-0.5 font-bold ${arrivalDelay.classes}`}>{arrivalDelay.label}</p>
            </div>
            <div className="relative col-start-2 row-span-2 row-start-1 flex self-stretch items-center justify-center md:col-start-2 md:row-span-1 md:row-start-1">
              {currentIndex < 0 ? (
                <span aria-hidden="true" className="absolute left-1/2 z-0 block min-h-[24px] -translate-x-1/2 border-l-2 border-slate-300" style={{ top: index === 0 ? "50%" : 0, bottom: index === route.length - 1 ? "50%" : 0 }} />
              ) : index < currentIndex ? (
                <span aria-hidden="true" className="absolute left-1/2 z-0 block min-h-[24px] -translate-x-1/2 border-l-2 border-emerald-500" style={{ top: index === 0 ? "50%" : 0, bottom: 0 }} />
              ) : index === currentIndex ? (
                <>
                  {index > 0 && <span aria-hidden="true" className="absolute left-1/2 top-0 z-0 block -translate-x-1/2 border-l-2 border-emerald-500" style={{ bottom: "50%" }} />}
                  {index < route.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-1/2 top-1/2 z-0 block -translate-x-1/2 border-l-2 border-slate-300" />}
                </>
              ) : (
                <span aria-hidden="true" className="absolute bottom-0 left-1/2 top-0 z-0 block -translate-x-1/2 border-l-2 border-slate-300" style={{ bottom: index === route.length - 1 ? "50%" : 0 }} />
              )}
              {isCurrent ? <span aria-label="Train's latest reported station" className="relative z-10 flex h-8 w-8 items-center justify-center"><span aria-hidden="true" className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300 opacity-35 motion-safe:animate-ping" /><TrainPositionIcon /></span> : <span aria-hidden="true" className={`relative z-10 h-2.5 w-2.5 rounded-full shadow-sm ${isPassed ? "border border-emerald-600 bg-emerald-500" : "border-2 border-slate-300 bg-white"}`} />}
            </div>
            <div className="col-start-3 row-start-1 min-w-0 md:col-start-3 md:row-start-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h5 className={`text-sm font-extrabold leading-tight sm:text-base ${isCurrent ? "text-blue-950" : "text-[#0b2240]"}`}>{stationName}</h5>
                {stationCode !== "—" && <span className="text-[10px] font-semibold tracking-wide text-slate-500">{stationCode}</span>}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isCurrent ? "bg-blue-100 text-blue-800" : isPassed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{isCurrent ? isPassed ? "Last reported" : "Train location" : isPassed ? "Departed" : status === "upcoming" ? "Upcoming" : status === "—" ? "Status unavailable" : status}</span>
                {pickValue(stop, ["platform"]) !== undefined && <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">Platform {displayValue(pickValue(stop, ["platform"]))}</span>}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-500">
                {stationTimestamp !== undefined && <span>{formatLiveDateTime(stationTimestamp).split(",")[0]}</span>}
                {pickValue(stop, ["sequence"]) !== undefined && <span>Stop {displayValue(pickValue(stop, ["sequence"]))}</span>}
                {pickValue(stop, ["distanceFromOriginKm", "distanceKm", "distance"]) !== undefined && <span>{displayValue(pickValue(stop, ["distanceFromOriginKm", "distanceKm", "distance"]))} km from origin</span>}
                {pickValue(stop, ["speedToNextStationKmph"]) !== undefined && <span>{displayValue(pickValue(stop, ["speedToNextStationKmph"]))} km/h to next</span>}
                {pickValue(stop, ["provenance"]) !== undefined && <span className="capitalize">{displayValue(pickValue(stop, ["provenance"]))} timing</span>}
              </div>
            </div>
            <div className="col-start-3 row-start-2 space-y-1.5 border-l border-slate-100 pl-3 pt-0.5 text-[10px] md:col-start-4 md:row-start-1 md:border-0 md:pl-0 md:text-right md:text-xs">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Scheduled</p>
              <p className="font-bold tabular-nums text-slate-600">{scheduledDeparture === undefined ? "—" : formatLiveTime(scheduledDeparture)}</p>
              {actualDeparture !== undefined && <p className="font-semibold tabular-nums text-emerald-700"><span className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">Actual</span> {formatLiveTime(actualDeparture)}</p>}
              {pickValue(stop, ["predictedDeparture"]) !== undefined && <p className="font-semibold tabular-nums text-blue-700"><span className="text-[9px] font-bold uppercase tracking-wide text-blue-600">Predicted</span> {formatLiveTime(pickValue(stop, ["predictedDeparture"]))}</p>}
              {pickValue(stop, ["estimatedDeparture"]) !== undefined && <p className="font-semibold tabular-nums text-blue-700"><span className="text-[9px] font-bold uppercase tracking-wide text-blue-600">Estimated</span> {formatLiveTime(pickValue(stop, ["estimatedDeparture"]))}</p>}
              <p className={`ml-auto inline-flex w-fit rounded-md px-1.5 py-0.5 font-bold ${departureDelay.classes}`}>{departureDelay.label}</p>
            </div>
          </li>;
        })}
      </ol>
    </section>
  );
}

function LiveTrainStatus({ trainNumber, journeyDate }: { trainNumber: string; journeyDate: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveResult, setLiveResult] = useState<unknown>(null);
  const [dismissed, setDismissed] = useState(false);

  async function checkStatus() {
    setLoading(true);
    setError("");
    setLiveResult(null);
    try {
      const response = await fetch(`/api/trains/${encodeURIComponent(trainNumber)}/live?date=${encodeURIComponent(journeyDate)}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok || body.success !== true || !body.data) {
        throw new Error(typeof body.error === "string" ? body.error : "Could not retrieve live train status.");
      }
      setLiveResult(body.data);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Live train status lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const outer = asRecord(liveResult);
  const record = outer ? asRecord(outer.data) ?? asRecord(outer.result) ?? outer : null;
  const routeValue = record ? pickValue(record, ["route", "stations", "routeStations"]) : undefined;
  const routeStops = Array.isArray(routeValue) ? routeValue.map(asRecord).filter((item): item is DataRecord => item !== null) : [];
  const currentLocation = record ? asRecord(pickValue(record, ["currentLocation", "currentPosition"])) : null;
  const trainInfo = record ? asRecord(pickValue(record, ["train"])) : null;
  const sourceStation = trainInfo ? asRecord(pickValue(trainInfo, ["source", "origin"])) : null;
  const destinationStation = trainInfo ? asRecord(pickValue(trainInfo, ["destination", "to"])) : null;
  const sourceName = displayValue(sourceStation && pickValue(sourceStation, ["name", "stationName"]));
  const sourceCode = displayValue(sourceStation && pickValue(sourceStation, ["code", "stationCode"]));
  const destinationName = displayValue(destinationStation && pickValue(destinationStation, ["name", "stationName"]));
  const destinationCode = displayValue(destinationStation && pickValue(destinationStation, ["code", "stationCode"]));
  const currentStationCode = displayValue(currentLocation && pickValue(currentLocation, ["stationCode", "code"]));
  const currentStationName = displayValue(currentLocation && pickValue(currentLocation, ["stationName", "name"]));
  const currentSpeed = displayValue((currentLocation && pickValue(currentLocation, ["speedKmh", "speed"])) ?? (record && pickValue(record, ["speedKmh", "currentSpeedKmh"])));
  const liveStatus = displayValue(record && pickValue(record, ["status", "trainStatus", "runningStatus"]));
  const delayMinutes = displayValue((currentLocation && pickValue(currentLocation, ["delayMinutes"])) ?? (record && pickValue(record, ["delayMinutes", "delay"])));
  const lastUpdated = displayValue(record && pickValue(record, ["lastUpdatedAt", "updatedAt", "generatedAt"]));
  const isLive = record && pickValue(record, ["isLive"]) === true;
  const trainName = displayValue((trainInfo && pickValue(trainInfo, ["name", "trainName"])) ?? (record && pickValue(record, ["trainName", "name"])));
  const currentRouteIndex = currentStationCode === "—" ? -1 : routeStops.findIndex((stop) => displayValue(pickValue(stop, ["stationCode", "code"])) === currentStationCode);
  const nextStation = currentRouteIndex >= 0
    ? routeStops[currentRouteIndex + 1]
    : routeStops.find((stop) => displayValue(pickValue(stop, ["status"])).toLowerCase() === "upcoming");
  const nextStationName = displayValue(nextStation && pickValue(nextStation, ["stationName", "name"]));
  const delayPresentation = getDelayPresentation(delayMinutes === "—" ? undefined : delayMinutes);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(11,34,64,0.09)]">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#f4f8ff] via-white to-orange-50/70 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b2240] text-white shadow-sm"><TrainFront aria-hidden="true" className="h-5 w-5" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h4 className="text-base font-extrabold text-[#0b2240] sm:text-lg">{trainName !== "—" ? trainName : "Live train status"}</h4><span className="rounded-md bg-[#0b2240] px-2 py-0.5 text-[11px] font-bold text-white">{trainNumber}</span></div><p className="mt-1 text-xs text-slate-600">Live running information for this journey</p></div></div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button type="button" onClick={checkStatus} disabled={loading || trainNumber === "—" || journeyDate === "—"} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0b2240] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#15375d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-wait disabled:opacity-60 sm:text-sm">
            <TrainFront aria-hidden="true" className={`h-4 w-4 ${loading ? "motion-safe:animate-pulse" : ""}`} />
            {loading ? "Finding train…" : liveResult ? "Refresh status" : "Check live status"}
          </button>
          {Boolean(liveResult) && <button type="button" onClick={() => { setDismissed(true); setLiveResult(null); }} aria-label="Close live train status" title="Close live train status" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#0b2240] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
            <X aria-hidden="true" className="h-4 w-4" />
          </button>}
        </div>
      </div>
      {loading && <div role="status" className="border-t border-slate-100 px-4 py-4 sm:px-5"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="h-2 w-2 rounded-full bg-orange-500 motion-safe:animate-pulse" />Fetching the latest train position…</div><div className="h-2 motion-safe:animate-pulse rounded-full bg-slate-100"><div className="h-2 w-1/3 rounded-full bg-orange-200" /></div></div>}
      {error && <p role="alert" className="mx-4 my-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-800 sm:mx-5">{error}</p>}
      {!loading && !error && !liveResult && !dismissed && <div className="border-t border-slate-100 px-4 py-4 sm:px-5"><p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600">Check live status to see this train’s reported location, next stop, delay, and station-by-station timings.</p></div>}
      {Boolean(liveResult) && <div aria-live="polite" className="border-t border-slate-100 p-3 sm:p-5">
        {(sourceName !== "—" || destinationName !== "—") && <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#0b2240] px-3 py-3 text-white sm:px-4"><div className="min-w-0 flex-1"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-200">From</p><p className="mt-0.5 truncate text-sm font-extrabold">{sourceName}</p>{sourceCode !== "—" && <p className="text-[10px] font-semibold text-blue-200">{sourceCode}</p>}</div><ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-400" /><div className="min-w-0 flex-1 text-right"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-200">To</p><p className="mt-0.5 truncate text-sm font-extrabold">{destinationName}</p>{destinationCode !== "—" && <p className="text-[10px] font-semibold text-blue-200">{destinationCode}</p>}</div></div>}
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Journey date</p><p className="mt-1 text-sm font-extrabold text-[#0b2240]">{journeyDate}</p></div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3"><div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-800"><MapPin aria-hidden="true" className="h-3.5 w-3.5" />Last reported location</div><p className="mt-1 text-sm font-extrabold text-[#0b2240]">{currentStationName !== "—" ? currentStationName : "Not reported"}</p>{currentStationCode !== "—" && <p className="mt-0.5 text-xs text-slate-500">{currentStationCode}</p>}{currentSpeed !== "—" && <p className="mt-1 text-[11px] font-bold text-blue-800">{currentSpeed} km/h</p>}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Next station</p><p className="mt-1 text-sm font-extrabold text-[#0b2240]">{nextStationName}</p>{nextStation && displayValue(pickValue(nextStation, ["stationCode", "code"])) !== "—" && <p className="mt-0.5 text-xs text-slate-500">{displayValue(pickValue(nextStation, ["stationCode", "code"]))}</p>}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Train status & delay</p><div className="mt-1 flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${isLive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}><span className={`h-2 w-2 rounded-full ${isLive ? "bg-emerald-600 motion-safe:animate-pulse" : "bg-slate-500"}`} />{isLive ? "Live" : liveStatus !== "—" ? liveStatus : "Unavailable"}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${delayPresentation.classes}`}>{delayPresentation.label}</span></div>{lastUpdated !== "—" && <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-slate-500"><Clock3 aria-hidden="true" className="h-3 w-3" />Updated {formatLiveDateTime(lastUpdated)}</p>}</div>
        </div>
        {routeStops.length > 0 ? <div className="mt-4"><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-extrabold text-[#0b2240]">Journey timeline</h4><div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500"><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" />Departed</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-blue-600" />Train location</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-slate-300" />Upcoming / unknown</span></div></div><LiveRouteTimeline route={routeStops} currentStationCode={currentStationCode} /></div> : <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">Live status was returned, but station-wise route details are not available for this train and date.</p>}
      </div>}
    </div>
  );
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
  const departureTime = displayValue(pickValue(trainRecord ?? record, ["departureTime", "departTime", "depTime", "boardingTime", "departure", "scheduledDepartureTime", "journeyDepartureTime", "journeyDateRaw"]));
  const chartStatus = displayValue(chartingRecord ? pickValue(chartingRecord, ["status", "chartStatus", "chartingStatus"]) : pickValue(record, ["chartStatus", "chartingStatus"]));
  const chartPrepared = chartingRecord ? pickValue(chartingRecord, ["isPrepared", "prepared"]) : pickValue(record, ["chartPrepared", "isChartPrepared"]);
  const estimatedChartTime = displayValue(pickValue(chartingRecord ?? record, ["estimatedPreparationTime", "estimatedChartPreparationTime", "expectedPreparationTime", "estimatedAt"]));
  const isWaitlisted = pickValue(record, ["isWaitlisted"]);
  const bookingFare = displayValue(pickValue(trainRecord ?? record, ["bookingFare", "totalFare", "fare"]));
  const responseMeta = asRecord(pickValue(outer, ["meta"]));
  const generatedAt = displayValue(pickValue(record, ["generatedAt"]) ?? (responseMeta && pickValue(responseMeta, ["timestamp"])));
  const source = displayValue(responseMeta ? pickValue(responseMeta, ["source"]) : undefined);
  const executionTime = displayValue(responseMeta ? pickValue(responseMeta, ["executionTime"]) : undefined);
  const passengerRows = passengers.map((passenger, index) => {
    const booking = displayStatus(pickValue(passenger, ["bookingStatus", "booking", "bookingStatusDetails", "booking_status", "bookingStatusText"]));
    const current = displayStatus(pickValue(passenger, ["currentStatus", "current", "currentStatusDetails", "current_status", "currentStatusText", "status"]));
    const passengerFlags = [
      ["isConfirmed", "Confirmed", "emerald"],
      ["isRAC", "RAC", "blue"],
      ["isWaitlisted", "Waitlisted", "amber"],
      ["isCancelled", "Cancelled", "rose"],
    ] as const;
    const activeFlags = passengerFlags.filter(([key]) => pickValue(passenger, [key]) === true);
    const serial = displayValue(pickValue(passenger, ["serialNumber", "serialNo", "sNo", "sno"]));
    const fare = displayValue(pickValue(passenger, ["totalFare", "fare", "amount"]));
    const passengerChart = displayValue(pickValue(passenger, ["chartStatus", "chartingStatus", "chartPrepared"]) ?? (chartingRecord && pickValue(chartingRecord, ["status", "chartStatus", "chartingStatus"])));
    const remarks = displayValue(pickValue(passenger, ["remarks", "remark", "remarksIfAny"]));
    const trainStatus = displayValue(pickValue(passenger, ["trainStatus", "runningStatus"]));
    return {
      id: `${serial}-${index}`,
      serial: serial === "—" ? index + 1 : serial,
      booking,
      current,
      activeFlags,
      fare,
      chart: passengerChart,
      remarks,
      trainStatus,
    };
  });
  const journeyDetails = [
    ["Train no.", trainNumber], ["Train", trainName], ["Train date", trainDate], ["Boarding date", boardingDate],
    ["From", fromStation], ["To", toStation], ["Reserved up to", reservationUpto], ["Boarding point", boardingStation],
    ["Class", journeyClass], ["Quota", quota],
  ] as const;
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
  const providerOverallStatus = displayStatus(pickValue(record, ["currentStatus", "bookingStatus", "status"]));
  const providerOverallKind = getPnrStatusKind(providerOverallStatus);
  const overallStatusText = passengerKinds.length === 1
    ? unavailableCurrentCount === 0
      ? `All ${passengers.length === 1 ? "passenger" : "passengers"} ${pnrStatusLabels[passengerKinds[0]].toLowerCase()}`
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
      : "border-blue-100 bg-blue-50 text-blue-900";
  const journeyOrigin = boardingStation !== "—" ? boardingStation : fromStation;

  return (
    <section aria-labelledby="pnr-result-title" className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-5">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#101a30] px-4 py-2.5 text-white sm:px-5">
        <div className="flex items-center gap-2"><span className="rounded bg-blue-600 px-2 py-0.5 text-[11px] font-extrabold">PNR</span><h3 id="pnr-result-title" className="font-mono text-sm font-extrabold tracking-wide">{pnr}</h3></div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-200">{journeyClass !== "—" && <span>Class <strong className="text-white">{journeyClass}</strong></span>}{quota !== "—" && <span>Quota <strong className="text-white">{quota}</strong></span>}</div>
      </div>
      <div className="space-y-3 p-3 sm:p-4">
        <section aria-label="Overall ticket status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-3">
          <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0b2240] shadow-sm"><TicketCheck aria-hidden="true" className="h-5 w-5" /></span><div><p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Current ticket status</p><p className="mt-0.5 text-xs text-slate-600">{passengers.length > 0 ? "Status for each passenger is shown below." : "Based on the provider response."}</p></div></div>
          <span className={`inline-flex max-w-full rounded-full border px-3 py-1.5 text-xs font-extrabold ${overallStatusTone}`}>{overallStatusText}</span>
        </section>

        <section aria-label="Journey summary" className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="min-w-0"><h4 className="text-sm font-extrabold text-[#0b2240] sm:text-base">{trainName}</h4><p className="mt-0.5 text-xs font-semibold text-slate-500">Train {trainNumber}</p></div>
            {(journeyClass !== "—" || quota !== "—") && <div className="flex gap-1.5">{journeyClass !== "—" && <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-800">{journeyClass}</span>}{quota !== "—" && <span className="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-800">{quota} quota</span>}</div>}
          </div>
          <div className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
            <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Boarding station</p><p className="mt-1 break-words text-sm font-extrabold text-[#0b2240]">{journeyOrigin}</p></div>
            <ArrowRight aria-hidden="true" className="hidden h-4 w-4 text-orange-500 sm:block" />
            <div className="min-w-0 sm:text-right"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Destination</p><p className="mt-1 break-words text-sm font-extrabold text-[#0b2240]">{toStation}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Journey date</p><p className="mt-1 text-xs font-bold text-[#0b2240]">{trainDate}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Boarding date</p><p className="mt-1 text-xs font-bold text-[#0b2240]">{boardingDate}</p></div>
            <div className="col-span-2 sm:col-span-1"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Departure details</p><p className="mt-1 break-words text-xs font-bold text-[#0b2240]">{departureTime}</p></div>
          </div>
          <details className="group mt-3 border-t border-slate-100 pt-2.5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-bold text-[#0b2240] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"><span>More journey details</span><span aria-hidden="true" className="text-orange-700 transition group-open:rotate-180">⌄</span></summary>
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{journeyDetails.map(([label, value]) => <div key={label} className="min-w-0 rounded-lg bg-slate-50 px-2.5 py-2"><dt className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-xs font-semibold text-slate-800">{value}</dd></div>)}</dl>
          </details>
        </section>

        <section aria-label="Chart preparation status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50/60 px-3.5 py-3">
          <div className="flex min-w-0 items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Clock3 aria-hidden="true" className="h-4 w-4" /></span><div><h4 className="text-xs font-extrabold text-[#0b2240]">Chart preparation</h4><p className="mt-0.5 text-[10px] leading-4 text-slate-600">Provider-reported status; estimates are shown separately.</p></div></div>
          <div className="text-right"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${typeof chartPrepared === "boolean" ? chartPrepared ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900" : getPnrStatusTone(chartStatus)}`}>{typeof chartPrepared === "boolean" ? chartPrepared ? "Prepared" : "Not prepared" : chartStatus !== "—" ? chartStatus : "Not provided"}</span>
            <p className="mt-1 text-[10px] text-slate-500">{estimatedChartTime !== "—" ? <>Estimated: <strong className="text-slate-700">{estimatedChartTime}</strong></> : "No preparation estimate provided"}</p>
          </div>
        </section>

        <PnrPredictionPanel pnr={pnr} passengers={passengers} record={record} />

        <section aria-labelledby="pnr-passenger-title" className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-3"><h4 id="pnr-passenger-title" className="text-sm font-extrabold text-[#0b2240]">Passenger status</h4><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800">{passengers.length} {passengers.length === 1 ? "passenger" : "passengers"}</span></div>
          {passengerRows.length > 0 ? <div className="grid gap-2.5 p-3 sm:grid-cols-2 xl:grid-cols-3">
            {passengerRows.map((passenger) => <article key={passenger.id} className="min-w-0 rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2.5 flex items-center justify-between gap-2"><h5 className="text-xs font-extrabold text-[#0b2240]">Passenger {passenger.serial}</h5><span className={`inline-flex max-w-[65%] rounded-full border px-2 py-1 text-[10px] font-bold ${getPnrStatusTone(passenger.current)}`}>{passenger.current === "—" ? "Status unavailable" : pnrStatusLabels[getPnrStatusKind(passenger.current)]}</span></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="min-w-0 rounded-md bg-blue-50/80 p-2"><p className="text-[9px] font-bold uppercase tracking-wide text-blue-800">Booked as</p><p className="mt-1 break-words text-xs font-bold text-[#0b2240]">{passenger.booking}</p></div>
                <div className="min-w-0 rounded-md bg-emerald-50/80 p-2"><p className="text-[9px] font-bold uppercase tracking-wide text-emerald-800">Current status</p><p className="mt-1 break-words text-xs font-bold text-[#0b2240]">{passenger.current}</p></div>
              </div>
              {passenger.activeFlags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{passenger.activeFlags.map(([, label, tone]) => <span key={label} className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${tone === "emerald" ? "bg-emerald-50 text-emerald-700" : tone === "blue" ? "bg-blue-50 text-blue-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{label}</span>)}</div>}
              <details className="group mt-2 border-t border-slate-100 pt-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[10px] font-bold text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"><span>Fare and other details</span><span aria-hidden="true" className="text-orange-700 transition group-open:rotate-180">⌄</span></summary>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">{[["Fare", passenger.fare], ["Charting", passenger.chart], ["Remarks", passenger.remarks], ["Train status", passenger.trainStatus]].map(([label, value]) => <div key={label}><dt className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-0.5 break-words text-[11px] font-medium text-slate-800">{value}</dd></div>)}</dl>
              </details>
            </article>)}
          </div> : <p className="px-3.5 py-3 text-xs text-slate-600">Passenger-level details were not included in the provider response.</p>}
          <p className="border-t border-slate-100 px-3.5 py-2.5 text-[10px] leading-4 text-slate-500">Ticket status comes from the provider and may change before chart preparation.</p>
        </section>

        {trainNumber !== "—" && trainDate !== "—" && <details className="rounded-xl border border-slate-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3 text-xs font-bold text-[#0b2240] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"><span>Live train running status</span><span aria-hidden="true" className="text-orange-700">Open</span></summary>
          <div className="border-t border-slate-100 px-3.5 pb-3.5"><LiveTrainStatus trainNumber={trainNumber} journeyDate={trainDate} /></div>
        </details>}

        {(isWaitlisted !== undefined || bookingFare !== "—" || generatedAt !== "—" || source !== "—" || executionTime !== "—") && <details className="rounded-xl border border-slate-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3 text-xs font-bold text-[#0b2240] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"><span>Additional ticket and lookup details</span><span aria-hidden="true" className="text-orange-700">Open</span></summary>
          <dl className="grid gap-2 border-t border-slate-100 p-3 sm:grid-cols-2 lg:grid-cols-4">
            {typeof isWaitlisted === "boolean" && <div className="rounded-lg bg-slate-50 p-2.5"><dt className="text-[9px] font-bold uppercase text-slate-500">Waitlisted</dt><dd className="mt-1 text-xs font-semibold text-slate-800">{isWaitlisted ? "Yes" : "No"}</dd></div>}
            {bookingFare !== "—" && <div className="rounded-lg bg-slate-50 p-2.5"><dt className="text-[9px] font-bold uppercase text-slate-500">Booking fare</dt><dd className="mt-1 text-xs font-semibold text-slate-800">₹{Number(bookingFare).toLocaleString("en-IN")}</dd></div>}
            {generatedAt !== "—" && <div className="rounded-lg bg-slate-50 p-2.5"><dt className="text-[9px] font-bold uppercase text-slate-500">Last updated</dt><dd className="mt-1 break-words text-xs font-semibold text-slate-800">{generatedAt}</dd></div>}
            {source !== "—" && <div className="rounded-lg bg-slate-50 p-2.5"><dt className="text-[9px] font-bold uppercase text-slate-500">Data source</dt><dd className="mt-1 text-xs font-semibold uppercase text-slate-800">{source}</dd></div>}
            {executionTime !== "—" && <div className="rounded-lg bg-slate-50 p-2.5"><dt className="text-[9px] font-bold uppercase text-slate-500">Lookup time</dt><dd className="mt-1 text-xs font-semibold text-slate-800">{executionTime} ms</dd></div>}
          </dl>
        </details>}
      </div>
    </section>
  );
}

export default function PnrStatusPage() {
  const [pnr, setPnr] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<unknown>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setMessage("");
    if (!/^\d{10}$/.test(pnr)) {
      setError("Enter a valid 10-digit PNR number.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/pnr/${encodeURIComponent(pnr)}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok || body.success !== true || !body.data) {
        throw new Error(typeof body.error === "string" ? body.error : "Could not retrieve this PNR. Please try again.");
      }
      setResult(body.data);
      setMessage("PNR status retrieved successfully.");
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "PNR lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fdfbf7] text-stone-900">
      <Header />
      <main className="flex-1">
        <section className="border-b border-orange-100 bg-white px-4 py-4 sm:py-5">
          <div className="site-container mx-auto flex max-w-5xl items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><TrainFront aria-hidden="true" className="h-5 w-5" /></span>
            <div><h1 className="text-xl font-extrabold tracking-tight text-[#0b2240] sm:text-2xl">PNR status</h1><p className="mt-0.5 text-xs text-slate-600 sm:text-sm">Check your ticket and journey details using your 10-digit PNR.</p></div>
          </div>
        </section>

        <section aria-labelledby="pnr-search-title" className="px-4 pb-6 pt-4 sm:pb-8">
          <div className="site-container mx-auto max-w-5xl">
            <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm sm:p-5">
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
                          setResult(null);
                        }}
                        placeholder="e.g. 4335734389"
                        aria-describedby="pnr-hint pnr-message"
                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-base font-semibold tracking-[0.12em] text-[#0b2240] outline-none transition placeholder:font-normal placeholder:tracking-normal focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                    <button type="submit" disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-70">
                      <Search aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
                      {loading ? "Checking…" : "Check PNR"}
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><p id="pnr-hint" className="text-[11px] text-slate-500">Digits only · PNR is 10 digits</p><span className="text-[11px] font-semibold tabular-nums text-slate-400">{pnr.length}/10</span></div>
                  {message && <p id="pnr-message" aria-live="polite" className="mt-2 text-xs font-semibold text-emerald-700">{message}</p>}
                  {!message && <span id="pnr-message" className="sr-only" aria-live="polite" />}
                  {error && <p role="alert" className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">{error}</p>}
                </form>
                {loading && <p role="status" className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />Checking your PNR…</p>}
                {!loading && !error && !result && <p className="mt-2 text-[11px] text-slate-500">Your ticket status and journey details will appear here.</p>}
                <details className="group mt-2 border-t border-slate-100 pt-2">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-semibold text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"><Info aria-hidden="true" className="h-3.5 w-3.5" />How your PNR is used</summary>
                  <p className="mt-2 pl-5 text-[11px] leading-4 text-slate-600">Your PNR is sent to the configured railway status provider for this lookup. Avoid using a shared or public device.</p>
                </details>
            </div>
            {result !== null && <PnrResult response={result} pnr={pnr} />}

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
                    <article key={status.code} className="rounded-2xl border border-[#eee2d6] bg-white p-5 shadow-sm sm:p-6">
                      <span className={`inline-flex min-w-14 items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-extrabold ${colors}`}>{status.code}</span>
                      <h3 className="mt-4 text-base font-extrabold text-[#0b2240]">{status.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{status.body}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 grid gap-4 md:grid-cols-2">
              <article className="flex gap-4 rounded-2xl border border-[#eee2d6] bg-white p-5 sm:p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><Clock3 aria-hidden="true" className="h-5 w-5" /></span>
                <div><h2 className="font-extrabold text-[#0b2240]">When is status final?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Reservation status may change before chart preparation. Check the current official status close to departure for the latest update.</p><InternalLink href="/train-chart-preparation-time" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-700 hover:text-orange-800">View chart preparation guide <ArrowRight aria-hidden="true" className="h-4 w-4" /></InternalLink></div>
              </article>
              <article className="flex gap-4 rounded-2xl border border-[#eee2d6] bg-white p-5 sm:p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><BadgeCheck aria-hidden="true" className="h-5 w-5" /></span>
                <div><h2 className="font-extrabold text-[#0b2240]">Still on the waiting list?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Your position can move as bookings change. Review your ticket’s terms and check official updates before you travel.</p><p className="mt-3 text-xs font-medium text-slate-500">Confirmation chances can vary by train, route, quota and date.</p></div>
              </article>
            </section>

            <section aria-labelledby="pnr-faq-title" className="mt-10 rounded-2xl border border-[#eee2d6] bg-white p-5 shadow-sm sm:mt-14 sm:p-8">
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
