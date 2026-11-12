"use client";

import { AllToolsLink } from "@/components/tools/AllToolsLink";
import { hasReportedLivePosition, isEstimatedTracking, reportedDelayMinutes } from "@/lib/train-timing";
import { createTrainSlug, parseTrainSlug } from "@/lib/train-slug";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  RefreshCw,
  Search,
  TrainFront,
  Navigation,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Share2,
  Check,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import styles from "./LiveTrainStatusTool.module.css";

type DataRecord = Record<string, unknown>;

function asRecord(value: unknown): DataRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as DataRecord : null;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return "—";
}

function pickValue(record: DataRecord, keys: string[]): unknown {
  for (const key of keys) {
    const foundKey = Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
    if (foundKey && record[foundKey] !== null && record[foundKey] !== undefined && record[foundKey] !== "") return record[foundKey];
  }
  return undefined;
}

function journeyTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return value;
  const h = Number(match[1]);
  return h > 23 || Number(match[2]) > 59 ? value : String(h % 12 || 12).padStart(2, "0") + ":" + match[2] + (match[3] && match[3] !== "00" ? `:${match[3]}` : "") + (h >= 12 ? " PM" : " AM");
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
    second: date.getUTCSeconds() !== 0 ? "2-digit" : undefined,
    hour12: true,
  }).format(date);
}

function formatLiveDate(value: unknown): string {
  if (typeof value !== "string") return displayValue(value);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatLiveTime(value: unknown): string {
  if (typeof value !== "string") return displayValue(value);
  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(value)) return journeyTime(value);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: date.getUTCSeconds() !== 0 ? "2-digit" : undefined,
    hour12: true,
  }).format(date);
}

function getDelayBadge(value: unknown) {
  if ((typeof value !== "string" && typeof value !== "number") || String(value).trim() === "" || !Number.isFinite(Number(value))) {
    return { label: "Delay unavailable", classes: "bg-slate-50 text-slate-600 border-slate-200" };
  }
  const minutes = Number(value);
  if (minutes > 0) return { label: `Late by ${minutes}m`, classes: "bg-rose-50 text-rose-700 border-rose-200" };
  if (minutes < 0) return { label: `Early by ${Math.abs(minutes)}m`, classes: "bg-blue-50 text-blue-700 border-blue-200" };
  return { label: "Right Time", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

type JourneyState = "NOT_STARTED" | "RUNNING" | "COMPLETED" | "CANCELLED" | "UNKNOWN";

function hasReportedValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "" || typeof value === "object") return false;
  const normalized = String(value).trim().toLowerCase();
  return !["—", "-", "--", "n/a", "na", "unknown", "not available", "no data", "not reported", "null", "undefined"].includes(normalized);
}

function hasValidTimeValue(value: unknown): boolean {
  if (typeof value !== "string" || !hasReportedValue(value)) return false;
  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(value)) {
    const [hours = 0, minutes = 0, seconds = 0] = value.split(":").map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59;
  }
  return Number.isFinite(Date.parse(value));
}

function hasPredictedProvenance(stop: DataRecord): boolean {
  return /\b(predicted|estimated|scheduled|inferred|synthetic|forecast)\b/.test(statusText(pickValue(stop, ["provenance", "timingProvenance", "dataProvenance"])));
}

function hasVerifiedActualTime(stop: DataRecord, value: unknown): boolean {
  if (!hasValidTimeValue(value) || hasPredictedProvenance(stop)) return false;
  if (/\b(upcoming|scheduled|not started)\b/.test(statusText(pickValue(stop, ["status", "stationStatus", "eventStatus"])))) return false;
  if (typeof value === "string" && /\d{4}-\d{2}-\d{2}T/.test(value) && Date.parse(value) > Date.now()) return false;
  const provenance = statusText(pickValue(stop, ["provenance", "timingProvenance", "dataProvenance"]));
  const stationStatus = statusText(pickValue(stop, ["status", "stationStatus", "eventStatus", "arrivalStatus", "departureStatus"]));
  return /\b(observed|confirmed|actual|real time)\b/.test(provenance)
    || ["hasArrived", "isArrived", "arrivalConfirmed", "hasDeparted", "isDeparted", "departureConfirmed"].some((key) => pickValue(stop, [key]) === true)
    || /\b(arrived|departed|passed|reached|completed)\b/.test(stationStatus);
}

function hasConfirmedStationEvent(stop: DataRecord): boolean {
  if (hasPredictedProvenance(stop)) return false;
  const eventFlags = ["hasArrived", "isArrived", "arrivalConfirmed", "hasDeparted", "isDeparted", "departureConfirmed"];
  if (eventFlags.some((key) => pickValue(stop, [key]) === true)) return true;
  if (["actualArrival", "arrivalTimeActual", "actual_arrival", "actualDeparture", "departureTimeActual", "actual_departure"].some((key) => hasVerifiedActualTime(stop, pickValue(stop, [key])))) return true;
  const status = statusText(pickValue(stop, ["status", "stationStatus", "eventStatus", "arrivalStatus", "departureStatus"]));
  return /\b(arrived|departed|passed|reached|completed)\b/.test(status);
}

function statusText(value: unknown): string {
  const record = asRecord(value);
  const raw = record ? pickValue(record, ["status", "code", "value", "label", "name"]) : value;
  return displayValue(raw).toLowerCase().replace(/[_-]/g, " ").trim();
}

/** Display only the journey state explicitly reported by the provider. */
function getJourneyState(record: DataRecord): JourneyState {
  const status = statusText(pickValue(record, ["journeyStatus", "runningStatus", "trainStatus", "operationalStatus", "journey_state", "status"]));
  if (/\b(cancelled|canceled)\b/.test(status) || pickValue(record, ["isCancelled", "journeyCancelled", "isJourneyCancelled"]) === true) return "CANCELLED";
  if (/\b(not started|yet to start|not departed|before departure|scheduled|departure delayed|delayed departure)\b/.test(status) || pickValue(record, ["isNotStarted", "notStarted", "journeyNotStarted"]) === true) return "NOT_STARTED";
  if (/\b(complete|completed|finished|reached destination|arrived at destination|terminated at destination)\b/.test(status) || pickValue(record, ["isCompleted", "journeyCompleted", "isJourneyCompleted"]) === true) return "COMPLETED";
  if (/\b(running|in progress|on route|en route|departed)\b/.test(status) || pickValue(record, ["isRunning", "isInProgress", "isStarted", "journeyStarted"]) === true) return "RUNNING";
  return "UNKNOWN";
}

function todayInIndia(): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = (part: string) => parts.find((item) => item.type === part)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function getRelativeDate(offsetDays: number): string {
  const today = todayInIndia();
  const d = new Date(`${today}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function formatDateTabLabel(dateStr: string): string {
  const today = todayInIndia();
  const yesterday = getRelativeDate(-1);
  const tomorrow = getRelativeDate(1);

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  if (dateStr === tomorrow) return "Tomorrow";

  const d = new Date(`${dateStr}T00:00:00.000Z`);
  if (!Number.isFinite(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" });
}

/* =========================================================================
   DAY-WISE COMPUTATION HELPER (MakeMyTrip Pattern)
   ========================================================================= */

type RouteStopWithDay = DataRecord & {
  computedDay: number | null;
  dayFormattedString: string;
};

function computeStationDays(route: DataRecord[], originDate: string): RouteStopWithDay[] {
  return route.map((stop) => {
    const rawDay = pickValue(stop, ["arrivalDay", "departureDay", "day", "dayCount", "journeyDay", "dayNumber", "day_number"]);
    const parsedDay = typeof rawDay === "number" || typeof rawDay === "string" ? Number(rawDay) : NaN;
    const computedDay = Number.isInteger(parsedDay) && parsedDay >= 1 ? parsedDay : null;
    const date = new Date(originDate + "T00:00:00.000Z");
    let dayFormattedString = "Date unavailable";
    if (computedDay !== null && Number.isFinite(date.getTime())) {
      date.setUTCDate(date.getUTCDate() + computedDay - 1);
      dayFormattedString = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", weekday: "short" }).format(date);
    }
    return { ...stop, computedDay, dayFormattedString };
  });
}

/* =========================================================================
   MMT-STYLE CLEAN ROUTE TIMELINE (With Day Separators)
   ========================================================================= */

function StationTiming({ scheduled, actual, estimated, delay, estimatedDelay, notStarted = false }: {
  scheduled: unknown;
  actual: unknown;
  estimated: unknown;
  delay: number | null;
  estimatedDelay: boolean;
  notStarted?: boolean;
}) {
  const badge = getDelayBadge(delay);
  return (
    <div data-live-timing>
      <p data-timing-scheduled className="type-body leading-5 text-slate-600"><span data-timing-label className="block text-[11px] uppercase tracking-wide sm:inline sm:normal-case sm:tracking-normal">Scheduled</span> <time dateTime={typeof scheduled === "string" ? scheduled : undefined} className="type-caption font-semibold">{hasValidTimeValue(scheduled) ? formatLiveTime(scheduled) : "Not available"}</time></p>
      {!notStarted && <p data-timing-actual className="type-body font-bold leading-5 text-[#142B45]"><span data-timing-label className="block text-[11px] uppercase tracking-wide sm:inline sm:normal-case sm:tracking-normal">Actual</span> {actual ? <time dateTime={String(actual)} title={String(actual)} className="type-caption">{formatLiveTime(actual)}</time> : <span data-timing-missing>{" "}Not reported</span>}</p>}
      {!notStarted && !!estimated && <p className="type-body leading-5 text-slate-600"><span data-timing-label className="block text-[11px] uppercase tracking-wide sm:inline sm:normal-case sm:tracking-normal">Estimated</span> <span>{formatLiveTime(estimated)}</span></p>}
      {!notStarted && (delay !== null ? (
        <strong data-live-event-delay data-late={delay > 0 ? "true" : "false"} className={`type-caption ${"inline-block font-bold leading-5 " + badge.classes.split(" ").filter(c => c.startsWith("text-")).join(" ")}`}>
          {estimatedDelay ? "Estimated: " : ""}{badge.label.replace(/m$/, " min")}
        </strong>
      ) : <span className="type-caption  leading-4 text-slate-500" title="The provider has not supplied a delay for this station event.">Delay not reported</span>)}
    </div>
  );
}

function MmtRouteTimeline({
  route,
  currentStationCode,
  journeyState,
  journeyDate,
  observedDataAllowed,
  livePosition,
}: {
  route: RouteStopWithDay[];
  currentStationCode: string;
  journeyState: JourneyState;
  journeyDate: string;
  observedDataAllowed: boolean;
  livePosition: boolean;
}) {
  if (route.length === 0) return null;

  const canShowObservedEvents = observedDataAllowed && journeyDate <= todayInIndia();
  const notStarted = journeyState === "NOT_STARTED" || journeyDate > todayInIndia();
  const normalizedCurrentCode = currentStationCode.trim().toUpperCase();

  const apiPositionIndex =
    journeyState !== "RUNNING" || normalizedCurrentCode === "—"
      ? -1
      : route.findIndex(
        (stop) =>
          displayValue(pickValue(stop, ["stationCode", "code"])).trim().toUpperCase() === normalizedCurrentCode
      );

  const statusPositionIndex =
    journeyState === "RUNNING" && apiPositionIndex < 0
      ? route.findIndex((stop) => {
        const stopStatus = statusText(pickValue(stop, ["status", "stationStatus", "eventStatus"]));
        return ["at station", "current", "present", "here"].includes(stopStatus);
      })
      : -1;

  const currentIndex = apiPositionIndex >= 0 ? apiPositionIndex : statusPositionIndex;

  return (
    <div data-live-timeline className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      {/* Table-like Header Strip */}
      <div data-live-columns className="type-caption grid grid-cols-2 items-center border-b border-slate-100 bg-[#fffcf9] px-4 py-2.5 font-bold uppercase tracking-wider text-slate-500 sm:grid-cols-[105px_36px_1fr_105px] sm:px-6">
        <div className="order-2 sm:order-1">Arrival</div>
        <div className="order-2 hidden sm:order-2 sm:block" />
        <div className="order-1 col-span-2 text-left sm:order-3 sm:col-span-1">Station &amp; Platform</div>
        <div className="order-3 text-right sm:order-4">Departure</div>
      </div>

      {/* Station List with Connected Line & Day Separators */}
      <div className="relative divide-y divide-slate-100/80">
        {route.map((stop, index) => {
          const stationName = displayValue(pickValue(stop, ["stationName", "name"]));
          const stationCode = displayValue(pickValue(stop, ["stationCode", "code"]));
          const platform = displayValue(pickValue(stop, ["platform", "platformNumber"]));
          const isOrigin = index === 0;
          const isFinal = index === route.length - 1;

          const scheduledArrival = pickValue(stop, ["scheduledArrival", "scheduledArrivalTime", "arrivalTimeScheduled"]);
          const reportedActualArrival = pickValue(stop, ["actualArrival", "arrivalTimeActual", "actual_arrival"]);
          const actualArrival =
            canShowObservedEvents && journeyState !== "NOT_STARTED" && hasVerifiedActualTime(stop, reportedActualArrival)
              ? reportedActualArrival
              : undefined;

          const scheduledDeparture = pickValue(stop, ["scheduledDeparture", "scheduledDepartureTime", "departureTimeScheduled"]);
          const reportedActualDeparture = pickValue(stop, ["actualDeparture", "departureTimeActual", "actual_departure"]);
          const actualDeparture =
            canShowObservedEvents && journeyState !== "NOT_STARTED" && hasVerifiedActualTime(stop, reportedActualDeparture)
              ? reportedActualDeparture
              : undefined;

          const arrivalDelayValue = pickValue(stop, ["delayArrival", "arrivalDelayMinutes", "arrivalDelay"]);
          const departureDelayValue = pickValue(stop, ["delayDeparture", "departureDelayMinutes", "departureDelay"]);
          const estimatedArrival = !actualArrival && hasPredictedProvenance(stop) && hasValidTimeValue(reportedActualArrival)
            ? reportedActualArrival : undefined;
          const estimatedDeparture = !actualDeparture && hasPredictedProvenance(stop) && hasValidTimeValue(reportedActualDeparture)
            ? reportedActualDeparture : undefined;
          const arrivalDelay = reportedDelayMinutes(arrivalDelayValue);
          const departureDelay = reportedDelayMinutes(departureDelayValue);

          const hasStopEvent = canShowObservedEvents && hasConfirmedStationEvent(stop);
          const isCurrent = canShowObservedEvents && livePosition && journeyState === "RUNNING" && index === currentIndex;
          const isPassed = canShowObservedEvents && (journeyState === "COMPLETED" || (currentIndex >= 0 && index < currentIndex) || hasStopEvent);

          // Halt duration and distance
          const halt = displayValue(pickValue(stop, ["haltTime", "halt", "haltMinutes", "haltDuration"]));
          const distance = displayValue(pickValue(stop, ["distanceFromOriginKm", "distanceKm", "distance"]));

          // Day separation check
          const prevStop = index > 0 ? route[index - 1] : null;
          const isNewDay = index === 0 || (prevStop && stop.computedDay !== prevStop.computedDay);

          return (
            <div key={`${stationCode}-${index}`} className="flex flex-col">
              {/* ── DAY SEPARATOR (MakeMyTrip Style) ── */}
              {isNewDay && stop.computedDay !== null && (
                <div data-live-day className="flex items-center gap-2.5 border-y border-orange-200/90 bg-[#fff8f2] px-4 py-2 sm:px-6">
                  <span className="type-caption flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 font-black text-white shadow-2xs">
                    {stop.computedDay}
                  </span>
                  <span className="type-caption  font-black uppercase tracking-wider text-orange-950">
                    Day {stop.computedDay}
                  </span>
                  <span className="text-orange-300">•</span>
                  <span className="type-caption  font-bold text-slate-600">
                    {stop.dayFormattedString}
                  </span>
                </div>
              )}

              {/* STATION ROW */}
              <div
                data-live-station
                className={`relative grid grid-cols-2 items-start gap-x-4 gap-y-3 px-4 py-3.5 transition-colors sm:grid-cols-[105px_36px_1fr_105px] sm:items-center sm:gap-4 sm:px-6 ${isCurrent
                    ? "bg-orange-50/70 ring-1 ring-inset ring-orange-200"
                    : isPassed
                      ? "bg-white"
                      : "bg-slate-50/30 text-slate-500"
                  }`}
              >
                {/* ARRIVAL COLUMN */}
                <div className="order-2 min-w-0 text-left font-mono sm:order-1">
                  {isOrigin ? (
                    <span className="type-caption  font-bold text-slate-400 uppercase tracking-wider">Starts</span>
                  ) : (
                    <StationTiming
                      scheduled={scheduledArrival}
                      actual={actualArrival}
                      estimated={estimatedArrival}
                      delay={arrivalDelay}
                      estimatedDelay={hasPredictedProvenance(stop) || !observedDataAllowed}
                      notStarted={notStarted}
                    />
                  )}
                </div>

                {/* CENTER TRACK WITH LIVE TRAIN ICON */}
                <div data-live-track className="relative hidden self-stretch items-center justify-center sm:order-2 sm:flex">
                  {/* Vertical Line Segment */}
                  <div
                    className={`absolute w-1 -translate-x-1/2 left-1/2 ${index === 0
                        ? "top-1/2 bottom-0"
                        : isFinal
                          ? "top-0 bottom-1/2"
                          : "top-0 bottom-0"
                      } ${isPassed ? livePosition ? "bg-emerald-500" : "bg-yellow-200" : "bg-slate-200"}`}
                  />

                  {/* Node or Train Indicator */}
                  {isCurrent ? (
                    <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100">
                      <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-emerald-400 motion-safe:animate-ping" />
                      <TrainFront aria-hidden="true" className="live-train-moving-icon relative h-4 w-4" />
                    </div>
                  ) : isPassed ? (
                    <div className={`relative z-10 flex h-4 w-4 items-center justify-center rounded-full text-white shadow-xs ${livePosition ? "bg-emerald-500" : "bg-yellow-400"}`}>
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="relative z-10 h-3 w-3 rounded-full border-2 border-slate-300 bg-white" />
                  )}
                </div>

                {/* STATION NAME & DETAILS */}
                <div data-live-station-name className="order-1 col-span-2 min-w-0 sm:order-3 sm:col-span-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`type-caption  font-bold ${isCurrent ? "text-orange-950 font-extrabold" : "text-[var(--navy)]"}`}>
                      {stationName}
                    </span>
                    <span className="type-caption rounded bg-slate-100 px-1.5 py-0.2 font-bold text-slate-600 uppercase tracking-wider">
                      {stationCode}
                    </span>
                    {platform !== "—" && (
                      <span className="type-caption rounded border border-slate-200 bg-white px-1.5 py-0.2 font-medium text-slate-600">
                        PF {platform}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="type-caption inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 font-extrabold text-white">
                        <TrainFront aria-hidden="true" className="h-3 w-3 motion-safe:animate-pulse" />
                        Reported Location
                      </span>
                    )}
                  </div>

                  {/* Auxiliary Stop Info (Distance & Halt) */}
                  <div className="type-caption mt-1 flex flex-wrap items-center gap-2 text-slate-500">
                    {halt !== "—" && <span>Halt: {halt}</span>}
                    {halt !== "—" && distance !== "—" && <span>•</span>}
                    {distance !== "—" && <span>{distance} km</span>}
                  </div>
                </div>

                {/* DEPARTURE COLUMN */}
                <div className="order-3 min-w-0 text-left font-mono sm:order-4 sm:text-right">
                  {isFinal ? (
                    <span className="type-caption  font-bold text-slate-400 uppercase tracking-wider">Ends</span>
                  ) : (
                    <StationTiming
                      scheduled={scheduledDeparture}
                      actual={actualDeparture}
                      estimated={estimatedDeparture}
                      delay={departureDelay}
                      estimatedDelay={hasPredictedProvenance(stop) || !observedDataAllowed}
                      notStarted={notStarted}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   MMT-STYLE STICKY TRAIN INFO SIDE CARD (Right Column)
   ========================================================================= */

function MmtTrainSideCard({
  trainNumber,
  trainName,
  sourceName,
  destinationName,
  sourceCode,
  destinationCode,
  totalDistance,
  totalDuration,
  totalHalts,
  trainType,
  runsOnText,
  classesList,
  departureTime,
  arrivalTime,
}: {
  trainNumber: string;
  trainName: string;
  sourceName: string;
  destinationName: string;
  sourceCode: string;
  destinationCode: string;
  totalDistance: string;
  totalDuration: string;
  totalHalts: string;
  trainType: string;
  runsOnText: string;
  classesList: string[];
  departureTime: string;
  arrivalTime: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      void navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  return (
    <aside aria-label="Train journey overview" className="space-y-3">
      {/* MAIN OVERVIEW CARD */}
      <div data-live-summary className="group/train-summary relative overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-[0_8px_26px_-18px_rgba(243,107,33,0.5)] transition-[box-shadow,border-color] duration-300 hover:border-orange-200 hover:shadow-[0_14px_32px_-18px_rgba(243,107,33,0.62)] motion-reduce:transition-none">
        {/* Card Header */}
        <div className="border-b border-orange-100 bg-gradient-to-br from-[#fff7f0] via-[#fffdfa] to-white p-3">
          <div className="flex items-center justify-between">
            <span className="type-caption rounded-md bg-orange-500 px-2 py-0.5 font-black tracking-wider text-white">
              {trainNumber}
            </span>
            <span className="type-caption max-w-[68%] rounded border border-orange-200 bg-white px-2 py-1 text-right font-bold leading-tight text-orange-800 uppercase">
              {trainType !== "—" ? trainType : "Type unavailable"}
            </span>
          </div>
          <h3 className="type-card-title mt-1.5 leading-tight tracking-tight text-[var(--navy)]">
            {trainName !== "—" ? trainName : `Train ${trainNumber}`}
          </h3>
          <p className="type-caption mt-0.5 font-semibold text-slate-500">
            {sourceCode !== "—" ? sourceCode : "Origin"} → {destinationCode !== "—" ? destinationCode : "Destination"}
          </p>
        </div>

        {/* Origin & Destination Milestones */}
        <div className="type-caption space-y-2.5 border-b border-slate-100 p-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="type-caption  font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orange-500" />
                Departure
              </span>
              <p className="flex flex-wrap items-baseline gap-x-1.5 leading-snug">
                <span className="type-body-small font-extrabold text-[var(--navy)]">{sourceName !== "—" ? sourceName : "Source"}</span>
                <span className="type-caption font-semibold text-slate-500">{sourceCode !== "—" ? sourceCode : "Code unavailable"}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="type-body-small font-black text-slate-900 flex items-center gap-1 justify-end whitespace-nowrap">
                <Clock className="h-3 w-3 text-slate-400" />
                {departureTime}
              </span>
            </div>
          </div>

          <div className="type-caption flex items-center justify-between gap-2 py-0.5 text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="px-2 font-semibold text-orange-700 bg-orange-50 rounded-full py-0.5">
              {totalDuration !== "—" ? totalDuration : "Full Route"}
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex items-start justify-between">
            <div>
              <span className="type-caption  font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orange-500" />
                Arrival
              </span>
              <p className="flex flex-wrap items-baseline gap-x-1.5 leading-snug">
                <span className="type-body-small font-extrabold text-[var(--navy)]">{destinationName !== "—" ? destinationName : "Destination"}</span>
                <span className="type-caption font-semibold text-slate-500">{destinationCode !== "—" ? destinationCode : "Code unavailable"}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="type-body-small font-black text-slate-900 flex items-center gap-1 justify-end whitespace-nowrap">
                <Clock className="h-3 w-3 text-slate-400" />
                {arrivalTime}
              </span>
            </div>
          </div>
        </div>

        {/* Compact train details grid */}
        <div className="grid grid-cols-2 bg-white">
          <div className="border-b border-r border-orange-100/80 bg-orange-50/35 px-3 py-2">
            <span className="type-caption block font-bold uppercase tracking-wider text-slate-500">Distance</span>
            <p className="type-body-small mt-0.5 font-extrabold text-slate-900">{totalDistance !== "—" ? `${totalDistance} km` : "—"}</p>
          </div>
          <div className="border-b border-orange-100/80 bg-orange-50/35 px-3 py-2">
            <span className="type-caption block font-bold uppercase tracking-wider text-slate-500">Total halts</span>
            <p className="type-body-small mt-0.5 font-extrabold text-slate-900">{totalHalts !== "—" ? `${totalHalts} stations` : "Unavailable"}</p>
          </div>
          <div className="border-r border-orange-100/80 px-3 py-2">
            <span className="type-caption block font-bold uppercase tracking-wider text-slate-500">Runs on</span>
            <p className="type-caption mt-0.5 font-medium leading-snug text-slate-700">{runsOnText !== "—" ? runsOnText : "Unavailable"}</p>
          </div>
          <div className="px-3 py-2">
            <span className="type-caption block font-bold uppercase tracking-wider text-slate-500">Classes</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {classesList.length === 0 && <span className="type-caption text-slate-600">Unavailable</span>}
              {classesList.map((cls) => (
                <span key={cls} className="type-caption rounded border border-slate-200 bg-[#fffdfa] px-1.5 py-0.5 font-bold text-[var(--navy)]">{cls}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Share Button */}
        <div className="border-t border-orange-100/80 bg-gradient-to-r from-[#fffaf5] via-white to-[#fffaf5] p-2 text-center">
          <button
            type="button"
            onClick={handleShare}
            className="type-button inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 font-semibold text-slate-700 shadow-2xs transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Share Live Status</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* QUICK COMPLEMENTARY TOOLS CARD */}
      <div className="type-caption rounded-2xl border border-orange-200/90 bg-[#fff9f4] p-4 space-y-3">
        <div className="flex items-center gap-2 text-orange-950 font-black">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Traveler Utilities</span>
        </div>
        <p className="type-body-small text-slate-600 leading-relaxed">
          Need booking dates or passenger reservation status for this journey? Use our instant verified utilities.
        </p>
        <div className="space-y-1.5 pt-1">
          <Link
            href="/pnr-status"
            className="flex items-center justify-between rounded-xl bg-white border border-orange-100 p-2.5 font-bold text-[var(--navy)] hover:border-orange-300 hover:text-orange-600 transition"
          >
            <span>Check PNR Confirmation</span>
            <ArrowRight className="h-3.5 w-3.5 text-orange-500" />
          </Link>
          <Link
            href="/ticket-date-calculator"
            className="flex items-center justify-between rounded-xl bg-white border border-orange-100 p-2.5 font-bold text-[var(--navy)] hover:border-orange-300 hover:text-orange-600 transition"
          >
            <span>Advance Booking Date Calculator</span>
            <ArrowRight className="h-3.5 w-3.5 text-orange-500" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

/* =========================================================================
   MMT-STYLE LIVE RESULT CARD (2-Column Responsive Layout)
   ========================================================================= */

function LiveTrainStatusResult({
  trainNumber,
  journeyDate,
}: {
  trainNumber: string;
  journeyDate: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveResult, setLiveResult] = useState<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);

  const checkStatus = useCallback(
    async (forceRefresh = false) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/trains/${encodeURIComponent(trainNumber)}/live?date=${encodeURIComponent(journeyDate)}${forceRefresh ? "&refresh=1" : ""}`,
          { cache: "no-store", signal: controller.signal }
        );
        const body = await response.json();
        if (!response.ok || body.success !== true || !body.data) {
          throw new Error(typeof body.error === "string" ? body.error : "Could not retrieve live train status.");
        }
        if (!controller.signal.aborted) {
          setLiveResult(body.data);
        }
      } catch (lookupError) {
        if (!controller.signal.aborted) {
          setLiveResult(null);
          setError(lookupError instanceof Error ? lookupError.message : "Live train status lookup failed. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [trainNumber, journeyDate]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void checkStatus();
    }, 0);
    return () => {
      window.clearTimeout(timeout);
      abortRef.current?.abort();
    };
  }, [checkStatus]);

  const outer = asRecord(liveResult);
  const record = outer ? asRecord(outer.data) ?? asRecord(outer.result) ?? outer : null;
  const routeValue = record ? pickValue(record, ["route", "stations", "routeStations"]) : undefined;
  const rawRouteStops: DataRecord[] = Array.isArray(routeValue) ? routeValue.map((item) => asRecord(item) ?? {}) : [];

  // Compute Day-wise segmentations
  const reportedJourneyDate = record ? displayValue(pickValue(record, ["startDate", "journeyDate", "date"])) : "—";
  const routeStops = computeStationDays(rawRouteStops, reportedJourneyDate);

  const currentLocation = record ? asRecord(pickValue(record, ["currentLocation", "currentPosition"])) : null;
  const trainInfo = record ? asRecord(pickValue(record, ["train"])) : null;
  const sourceStation = trainInfo ? asRecord(pickValue(trainInfo, ["source", "origin"])) : null;
  const destinationStation = trainInfo ? asRecord(pickValue(trainInfo, ["destination", "to"])) : null;
  const sourceName = displayValue(sourceStation && pickValue(sourceStation, ["name", "stationName"]));
  const destinationName = displayValue(destinationStation && pickValue(destinationStation, ["name", "stationName"]));
  const sourceCode = displayValue(sourceStation && pickValue(sourceStation, ["code", "stationCode"]));
  const destinationCode = displayValue(destinationStation && pickValue(destinationStation, ["code", "stationCode"]));

  const currentStationCode = displayValue(currentLocation && pickValue(currentLocation, ["stationCode", "code"]));
  const currentStationName = displayValue(currentLocation && pickValue(currentLocation, ["stationName", "name"]));
  const currentSpeed = displayValue(
    (currentLocation && pickValue(currentLocation, ["speedKmh", "speed"])) ??
    (record && pickValue(record, ["speedKmh", "currentSpeedKmh"]))
  );
  const delayMinutes = displayValue(
    (currentLocation && pickValue(currentLocation, ["delayMinutes"])) ??
    (record && pickValue(record, ["delayMinutes", "delay"]))
  );
  const lastUpdated = displayValue(record && pickValue(record, ["lastUpdatedAt", "updatedAt", "generatedAt"]));
  const journeyState = record ? getJourneyState(record) : "UNKNOWN";
  const notStarted = journeyState === "NOT_STARTED" || journeyDate > todayInIndia();
  const estimatedTracking = isEstimatedTracking(record);
  const livePosition = !notStarted && hasReportedLivePosition(record, journeyState === "RUNNING");
  const completedJourney = !notStarted && journeyState === "COMPLETED";

  useEffect(() => {
    if (!livePosition) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void checkStatus(true);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [livePosition, checkStatus]);
  const trainName = displayValue(
    (trainInfo && pickValue(trainInfo, ["name", "trainName"])) ??
    (record && pickValue(record, ["trainName", "name"]))
  );

  // Side card data metrics
  const firstStop = routeStops[0];
  const lastStop = routeStops.length > 0 ? routeStops[routeStops.length - 1] : undefined;
  const lastStopIsDestination = lastStop && destinationCode !== "—"
    && displayValue(pickValue(lastStop, ["stationCode", "code"])).toUpperCase() === destinationCode.toUpperCase();
  const destinationStop = destinationCode !== "—" ? rawRouteStops.find((stop) => displayValue(pickValue(stop, ["stationCode", "code"])).toUpperCase() === destinationCode.toUpperCase()) : undefined;
  const destinationScheduledArrival = destinationStop && pickValue(destinationStop, ["scheduledArrival", "scheduledArrivalTime", "arrivalTimeScheduled"]);
  const reportedDestinationActual = destinationStop && pickValue(destinationStop, ["actualArrival", "arrivalTimeActual", "actual_arrival"]);
  const destinationActualArrival = destinationStop && !estimatedTracking && hasVerifiedActualTime(destinationStop, reportedDestinationActual) ? reportedDestinationActual : undefined;
  const destinationDelay = destinationStop && !estimatedTracking && !hasPredictedProvenance(destinationStop)
    ? reportedDelayMinutes(pickValue(destinationStop, ["delayArrival", "arrivalDelayMinutes", "arrivalDelay"])) : null;
  const lastLocationDelay = estimatedTracking || (record?.isLive === true && statusText(record.trackingMode) !== "none")
    ? reportedDelayMinutes(delayMinutes) : null;
  const delayBadge = notStarted
    ? { label: "Not yet started", classes: "bg-slate-50 text-slate-600 border-slate-200" }
    : getDelayBadge(completedJourney ? destinationDelay : lastLocationDelay);
  const totalDistance = displayValue((trainInfo && pickValue(trainInfo, ["distance", "distanceKm", "totalDistance"]))
    ?? (lastStop && pickValue(lastStop, ["distanceFromOriginKm", "distanceKm", "distance"])));
  const durationValue = trainInfo && pickValue(trainInfo, ["duration", "durationMinutes", "totalDuration"]);
  const totalDuration = typeof durationValue === "number" && Number.isFinite(durationValue) && durationValue >= 0
    ? `${Math.floor(durationValue / 60)}h ${durationValue % 60}m` : displayValue(durationValue);
  const totalHalts = displayValue(trainInfo && pickValue(trainInfo, ["totalHalts", "halts"]));
  const trainType = displayValue(trainInfo && pickValue(trainInfo, ["type", "trainType", "category"]));
  const runDays = trainInfo && pickValue(trainInfo, ["runDays", "daysOfRun", "runsOn", "runningDays"]);
  const runsOnText = Array.isArray(runDays) ? runDays.filter((day) => typeof day === "string").join(", ") || "—" : displayValue(runDays);

  const departureTime = firstStop
    ? formatLiveTime(pickValue(firstStop, ["scheduledDeparture", "departureTimeScheduled", "scheduledDepartureTime"]))
    : "—";
  const arrivalTime = lastStopIsDestination
    ? formatLiveTime(pickValue(lastStop, ["scheduledArrival", "arrivalTimeScheduled", "scheduledArrivalTime"]))
    : "—";

  const reportedClasses = trainInfo && pickValue(trainInfo, ["classes", "availableClasses", "travelClasses"]);
  const classesList = Array.isArray(reportedClasses)
    ? reportedClasses.filter((value): value is string => typeof value === "string" && value.trim() !== "")
    : typeof reportedClasses === "string" ? reportedClasses.split(/[,|]/).map((value) => value.trim()).filter(Boolean) : [];


  return (
    <div className="live-status-result mt-4 space-y-4" data-loaded={liveResult !== null}>
      {/* ══ MMT-STYLE TOP SUMMARY HEADER CARD (White and Orange Theme) ══ */}
      <div data-live-summary className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {/* Top Header Strip */}
        <div className={`border-b px-3 py-2 sm:px-4 ${livePosition ? "border-emerald-100 bg-emerald-50/60" : completedJourney ? "border-yellow-200 bg-yellow-50" : "border-orange-100 bg-[#fffaf5]"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div data-live-train-title className="flex items-center gap-2">
                <span className={`type-caption rounded-md px-2.5 py-0.5 font-extrabold tracking-wider ${livePosition ? "bg-emerald-600 text-white" : completedJourney ? "bg-yellow-100 text-yellow-900" : "bg-orange-500 text-white"}`}>
                  {trainNumber}
                </span>
                <h2 className="type-section-compact  tracking-tight text-[var(--navy)]">
                  {trainName !== "—" ? trainName : `Train ${trainNumber}`}
                </h2>
                {livePosition && (
                  <span className="type-caption inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 font-bold text-emerald-800">
                    <TrainFront aria-hidden="true" className="h-3.5 w-3.5 motion-safe:animate-pulse" />
                    Running
                  </span>
                )}
                {completedJourney && (
                  <span className="type-caption inline-flex shrink-0 items-center gap-1 rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 font-bold text-yellow-900">
                    <TrainFront aria-hidden="true" className="h-3.5 w-3.5" />
                    Reached destination
                  </span>
                )}
              </div>
              <p className="type-body-small mt-0.5 flex items-center gap-1.5 text-slate-600 font-semibold">
                <span>{sourceName !== "—" ? sourceName : "Origin"}</span>
                <ArrowRight className="h-3 w-3 text-orange-500" />
                <span>{destinationName !== "—" ? destinationName : "Destination"}</span>
              </p>
            </div>

            {/* Refresh Action Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void checkStatus(true)}
                disabled={loading}
                className="type-button inline-flex h-9 items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 font-bold text-orange-900 shadow-2xs transition hover:bg-orange-50 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-orange-600 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Updating..." : "Refresh"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Selector Tabs (Yesterday / Today / Tomorrow) */}
        {liveResult !== null && estimatedTracking && (
          <p role="status" className="type-note border-b border-amber-100 bg-amber-50 px-3 py-2 leading-relaxed text-amber-900 sm:px-4">
            The provider is returning estimated or simulated tracking. Actual station times and live delay are unavailable; estimated times below are not confirmed arrivals or departures.
          </p>
        )}
        {liveResult !== null && !estimatedTracking && !notStarted && record?.isLive === false && (
          <p role="status" className="type-note border-b border-slate-100 bg-slate-50 px-3 py-2 leading-relaxed text-slate-600 sm:px-4">Live tracking is unavailable for this journey. Only timetable times and actual events explicitly reported by the provider are shown; missing arrival times and delays are not assumed.</p>
        )}
        {/* Live Status Highlight Banner */}
        <div className="px-3 py-2 sm:px-4">
          {loading ? (
            <div className="flex items-center gap-3 py-4 text-slate-600">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              <span className="type-caption  font-semibold">Fetching latest train position from live feed...</span>
            </div>
          ) : error ? (
            <div className="type-caption rounded-xl border border-rose-200 bg-rose-50 p-3.5 font-semibold text-rose-800">
              {error}
            </div>
          ) : liveResult !== null ? (
            <div data-live-metrics className="grid grid-cols-2 gap-2 lg:grid-cols-4 items-start [&>div]:min-w-0">
              {/* Metric 1: Operational Status */}
              <div className="rounded-xl border border-slate-100 bg-[#fffaf5] px-2.5 py-1.5">
                <span className="type-caption block font-bold uppercase leading-4 tracking-wider text-slate-400">{notStarted ? "Journey Status" : completedJourney ? `Arrival at ${destinationName !== "—" ? destinationName : "destination"}` : "Last Reported Delay"}</span>
                {completedJourney && <div className="type-caption mt-1 leading-5 text-slate-600">
                  <p className="type-body">Scheduled: {hasValidTimeValue(destinationScheduledArrival) ? formatLiveTime(destinationScheduledArrival) : "Not reported"}</p>
                  <p className="type-body font-bold text-[#142B45]">Actual arrival: {destinationActualArrival ? formatLiveTime(destinationActualArrival) : "Not reported"}</p>
                </div>}
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className={`type-caption inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-extrabold ${delayBadge.classes}`}>
                    {!notStarted && !completedJourney && estimatedTracking && reportedDelayMinutes(delayMinutes) !== null ? "Estimated: " : ""}{delayBadge.label.replace(/m$/, " min")}
                  </span>
                  {!notStarted && <span className={`type-caption  font-bold capitalize ${livePosition ? "text-emerald-700" : completedJourney ? "text-yellow-800" : "text-slate-700"}`}>
                    {completedJourney ? "Reached destination" : estimatedTracking ? "Estimated position" : journeyState === "RUNNING"
                      ? "Running on route"
                      : journeyState === "UNKNOWN" ? "Status not reported" : String(journeyState)}
                  </span>}
                </div>
              </div>

              {/* Metric 2: Live Location */}
              <div className="rounded-xl border border-slate-100 bg-[#fffaf5] px-2.5 py-1.5">
                <span className="type-caption block font-bold uppercase leading-4 tracking-wider text-slate-400">{estimatedTracking ? "Estimated Location" : "Last Reported Location"}</span>
                <p className="type-body-small mt-0.5 truncate font-extrabold text-[var(--navy)]">
                  {currentStationName !== "—" ? currentStationName : currentStationCode !== "—" ? currentStationCode : "Unavailable"}
                </p>
                {completedJourney && lastLocationDelay !== null && <p className="type-body-small mt-1 text-slate-600">Last location delay: {estimatedTracking ? "Est. " : ""}{getDelayBadge(lastLocationDelay).label.replace(/m$/, " min")}</p>}
                {!notStarted && currentSpeed !== "—" && (
                  <p className="type-body  font-semibold text-orange-700">Speed: {currentSpeed} km/h</p>
                )}
              </div>

              {/* Metric 3: Journey Date */}
              <div className="rounded-xl border border-slate-100 bg-[#fffaf5] px-2.5 py-1.5">
                <span className="type-caption block font-bold uppercase leading-4 tracking-wider text-slate-400">Scheduled Date</span>
                <p className="type-body-small mt-0.5 font-extrabold text-[var(--navy)]">
                  {reportedJourneyDate !== "—" ? formatLiveDate(reportedJourneyDate) : "Unavailable"}
                </p>
              </div>

              {/* Metric 4: Last Updated Time */}
              <div className="rounded-xl border border-slate-100 bg-[#fffaf5] px-2.5 py-1.5">
                <span className="type-caption block font-bold uppercase leading-4 tracking-wider text-slate-400">Last Provider Update · IST</span>
                <p className="type-body-small mt-0.5 font-semibold text-slate-600">
                  {lastUpdated !== "—" ? formatLiveDateTime(lastUpdated) : "Unavailable"}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ══ MMT-STYLE 2-COLUMN LAYOUT: TIMELINE (LEFT) & STICKY SIDE CARD (RIGHT) ══ */}
      {liveResult !== null && routeStops.length > 0 ? (
        <div data-live-results-grid className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-6 items-start">
          {/* LEFT COLUMN: Day-wise Route Timeline */}
          <div className="min-w-0 space-y-3">
            <div data-live-timetable-heading className="flex items-center justify-between px-1">
              <h2 className="type-section-compact  text-[var(--navy)] flex items-center gap-2">
                <Navigation className="h-4 w-4 text-orange-500" />
                <span>Station Timetable &amp; Running Status</span>
              </h2>
              <span className="type-caption  text-slate-500 font-medium">
                {routeStops.length} Reported Stations
              </span>
            </div>

            <p className="type-body-small px-1 leading-5 text-slate-500">All times in IST. <span className="font-semibold text-slate-600">Scheduled</span> = timetable · <span className="font-semibold text-[#142B45]">Actual</span> = reported time · <span className="font-semibold text-rose-700">Red</span> = late. Missing data is marked “Not reported”.</p>

            <MmtRouteTimeline
              route={routeStops}
              currentStationCode={currentStationCode}
              journeyState={journeyState}
              journeyDate={journeyDate}
              observedDataAllowed={!estimatedTracking}
              livePosition={livePosition}
            />
          </div>

          {/* RIGHT COLUMN: Sticky Side Card */}
          <div className="self-start lg:mt-[72px] lg:sticky lg:top-4">
            <MmtTrainSideCard
              trainNumber={trainNumber}
              trainName={trainName}
              sourceName={sourceName}
              destinationName={destinationName}
              sourceCode={sourceCode}
              destinationCode={destinationCode}
              totalDistance={totalDistance}
              totalDuration={totalDuration}
              totalHalts={totalHalts}
              trainType={trainType}
              runsOnText={runsOnText}
              classesList={classesList}
              departureTime={departureTime}
              arrivalTime={arrivalTime}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================================
   MAIN SEARCH PAGE COMPONENT (Constrained Max-Width for 2560px Displays)
   ========================================================================= */

type LiveLookup = { trainNumber: string; journeyDate: string };

function validateLookup(trainNumber: string, date: string): string {
  if (!/^\d{3,6}$/.test(trainNumber)) return "Enter a valid train number using 3 to 6 digits.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Choose a valid journey date.";
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return "Choose a valid journey date.";
  return "";
}

export function LiveTrainStatusTool({
  initialTrain,
  initialDate,
  embedded = false,
}: {
  initialTrain?: string;
  initialDate?: string;
  embedded?: boolean;
} = {}) {
  const searchParams = useSearchParams();
  const rawTrain = initialTrain ?? (searchParams.get("train") ?? "");
  const parsed = parseTrainSlug(rawTrain);
  const queryTrain = parsed.trainNumber || rawTrain;
  const queryTrainName = parsed.trainName;
  const queryDate = initialDate ?? (searchParams.get("date") ?? "");

  return (
    <LiveTrainStatusSearch
      key={`${queryTrain}:${queryDate}`}
      queryTrain={queryTrain}
      queryTrainName={queryTrainName}
      queryDate={queryDate}
      embedded={embedded}
    />
  );
}

function LiveTrainStatusSearch({
  queryTrain,
  queryTrainName = "",
  queryDate,
  embedded = false,
}: {
  queryTrain: string;
  queryTrainName?: string;
  queryDate: string;
  embedded?: boolean;
}) {
  const router = useRouter();

  const [trainQuery, setTrainQuery] = useState(() => {
    if (queryTrain && queryTrainName) {
      return `${queryTrain} - ${queryTrainName}`;
    }
    return queryTrain;
  });
  const [journeyDate, setJourneyDate] = useState(queryDate);
  const [lookup, setLookup] = useState<LiveLookup | null>(() =>
    queryTrain && queryDate && !validateLookup(queryTrain, queryDate)
      ? { trainNumber: queryTrain, journeyDate: queryDate }
      : null
  );
  const [validationError, setValidationError] = useState(() =>
    queryTrain && queryDate ? validateLookup(queryTrain, queryDate) : ""
  );

  // Autocomplete Suggestions
  const [trainSuggestions, setTrainSuggestions] = useState<Array<{ trainNumber: string; trainName: string }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (embedded || !lookup) return;
    const frame = requestAnimationFrame(() => {
      const results = resultsRef.current;
      if (results && results.getBoundingClientRect().top > window.innerHeight * 0.35) {
        results.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [embedded, lookup]);

  // Close autocomplete on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Train Autocomplete
  useEffect(() => {
    if (!dropdownOpen) return;
    const cleanQ = trainQuery.trim();
    if (cleanQ.length === 0) return;
    let active = true;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/trains?q=${encodeURIComponent(cleanQ)}&limit=8`, { cache: "no-store", signal: controller.signal });
        if (!res.ok) throw new Error("Train search is unavailable");
        const data = await res.json();
        if (data.success !== true || !Array.isArray(data.trains)) throw new Error("Invalid train search response");
        if (active) {
          setTrainSuggestions(data.trains);
          setSearchError("");
        }
      } catch {
        if (active) {
          setTrainSuggestions([]);
          setSearchError("Train search is not available. Enter the train number and try Check Status.");
        }
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 180);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [trainQuery, dropdownOpen]);

  function submitLookup(event?: FormEvent<HTMLFormElement>, overrideTrain?: string, overrideDate?: string) {
    if (event) event.preventDefault();
    const rawVal = overrideTrain ?? trainQuery;
    const parsed = parseTrainSlug(rawVal);
    const tNum = parsed.trainNumber || rawVal.replace(/\D/g, "").slice(0, 6);
    const dVal = overrideDate ?? (journeyDate || todayInIndia());

    if (!tNum) {
      setValidationError("Enter a valid train number using 3 to 6 digits.");
      setLookup(null);
      return;
    }

    const message = validateLookup(tNum, dVal);
    if (message) {
      setValidationError(message);
      setLookup(null);
      return;
    }

    setValidationError("");
    setJourneyDate(dVal);
    setLookup({ trainNumber: tNum, journeyDate: dVal });

    const matchedSuggestion = trainSuggestions.find((s) => s.trainNumber === tNum);
    const tName = matchedSuggestion?.trainName || queryTrainName || parsed.trainName;
    const slug = createTrainSlug(tNum, tName);
    router.replace(`/live-train-status/${slug}?date=${encodeURIComponent(dVal)}`, { scroll: false });
  }

  const searchFormCard = (
    <div
      ref={searchContainerRef}
      data-live-search
      className={
        embedded
          ? "relative rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5 text-left"
          : "relative w-full rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-sm text-left"
      }
    >
      <form onSubmit={(e) => submitLookup(e)} className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:grid-cols-[minmax(0,1fr)_160px_auto] items-end">
        {/* Train Input with Autocomplete */}
        <div className="relative min-w-0 min-[380px]:col-span-2 sm:col-span-1">
          <label htmlFor="live-train-search-input" className="type-label block font-bold uppercase tracking-wider text-slate-600 mb-1">
            Train Name or Number
          </label>
          <div className="relative flex items-center">
            <TrainFront className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              id="live-train-search-input"
              type="text"
              autoComplete="off"
              value={trainQuery}
              onChange={(e) => {
                const val = e.target.value;
                setTrainQuery(val);
                setTrainSuggestions([]);
                setSearchError("");
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="e.g. 19712 or Jaipur Exp"
              className="type-input h-10 w-full rounded-xl border border-slate-200 bg-[#fffdfa] pl-10 pr-3 font-semibold text-[var(--navy)] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 placeholder:text-slate-400"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {dropdownOpen && (trainSuggestions.length > 0 || searchLoading || searchError) && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
              {searchLoading && (
                <div className="type-caption p-3 text-center text-slate-500">
                  Searching trains...
                </div>
              )}
              {searchError && <p role="status" className="type-note p-3 leading-relaxed text-rose-800">{searchError}</p>}
              {trainSuggestions.map((item) => (
                <button
                  key={item.trainNumber}
                  type="button"
                  onClick={() => {
                    setTrainQuery(`${item.trainNumber} - ${item.trainName}`);
                    setDropdownOpen(false);
                    const targetDate = journeyDate || todayInIndia();
                    setJourneyDate(targetDate);
                    submitLookup(undefined, item.trainNumber, targetDate);
                  }}
                  className="type-button flex w-full items-center justify-between px-3.5 py-2.5 text-left font-semibold hover:bg-orange-50/70 border-b border-slate-50 last:border-0"
                >
                  <span className="font-extrabold text-[var(--navy)]">
                    {item.trainNumber} - {item.trainName}
                  </span>
                  <span className="type-caption rounded bg-orange-100 px-1.5 py-0.5 font-bold text-orange-700">
                    Select
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Journey Date */}
        <div>
          <label htmlFor="live-train-journey-date" className="type-label block font-bold uppercase tracking-wider text-slate-600 mb-1">
            Journey Date
          </label>
          <div className="relative flex items-center">
            <Calendar className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="live-train-journey-date"
              type="date"
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="type-input h-10 w-full rounded-xl border border-slate-200 bg-[#fffdfa] pl-10 pr-2 font-semibold text-[var(--navy)] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="type-button inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 font-bold text-white shadow-xs transition hover:bg-[#F36B21] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer"
        >
          <Search className="h-4 w-4" />
          <span>Check Status</span>
        </button>
        {lookup && <div aria-label="Quick journey dates" className="flex flex-wrap items-center gap-1.5 min-[380px]:col-span-2 sm:col-span-3">
          {[-1, 0, 1].map((offset) => {
            const date = getRelativeDate(offset);
            const active = (journeyDate || todayInIndia()) === date;
            return (
              <button
                key={date}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setJourneyDate(date);
                  setDropdownOpen(false);
                  if (trainQuery.trim()) submitLookup(undefined, undefined, date);
                }}
                className={`type-button rounded-md border px-2.5 py-1 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 ${active ? "border-orange-200 bg-orange-50 text-orange-800" : "border-slate-200 bg-white text-slate-600 hover:bg-orange-50"}`}
              >
                {formatDateTabLabel(date)}
              </button>
            );
          })}
        </div>}
      </form>

      {validationError && (
        <p className="type-body-small mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 font-semibold text-rose-800">
          {validationError}
        </p>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        {searchFormCard}

        {lookup ? (
          <div className="site-tool-container">
            <LiveTrainStatusResult
              key={`${lookup.trainNumber}-${lookup.journeyDate}`}
              trainNumber={lookup.trainNumber}
              journeyDate={lookup.journeyDate}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5">
              <div className="type-caption flex items-center gap-2 font-bold text-[var(--navy)]">
                <TrainFront className="h-4 w-4 text-orange-600" />
                <span>Search by Train No. or Name</span>
              </div>
              <p className="type-body-small mt-1 leading-relaxed text-slate-600">
                Enter any 3–6 digit Indian Railway train number or select from live autocomplete suggestions.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5">
              <div className="type-caption flex items-center gap-2 font-bold text-[var(--navy)]">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span>Station-Wise Running Timeline</span>
              </div>
              <p className="type-body-small mt-1 leading-relaxed text-slate-600">
                View current train position, platform numbers, arrival/departure delays, and upcoming halts.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5">
              <div className="type-caption flex items-center gap-2 font-bold text-[var(--navy)]">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>Select Start / Journey Date</span>
              </div>
              <p className="type-body-small mt-1 leading-relaxed text-slate-600">
                Choose the train’s journey date (defaults to today in IST) and switch dates anytime in the result bar.
              </p>
            </div>
          </div>
        )}

        <LiveTrainStatusGuide embedded />
      </div>
    );
  }

  return (
    <div className={`${styles.page} live-status-page flex min-h-screen flex-col bg-[#fffdfa]`}>
      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1 pb-16">
        <AllToolsLink />
        <section className={styles.hero}>
          <div className="site-tool-container">
            <div className="min-w-0">
            <div className={styles.eyebrow}>
              <TrainFront aria-hidden="true" className="h-4 w-4" />
              Live Train Enquiry • Station-wise Status
            </div>

            <h1 className={`type-page-title ${styles.title}`}>
              Live Train <span>Running Status</span>
            </h1>
            <p className={`type-hero-description ${styles.description}`}>
              Check reported train location, delays, arrival and departure times.
            </p>
            </div>

            {searchFormCard}
          </div>
        </section>

        {/* ══ RESULTS CONTAINER (MAX-W 1240PX FOR 2560PX SCREEN ALIGNMENT) ══ */}
        <div ref={resultsRef} className="site-tool-container scroll-mt-24">
          {lookup && (
            <LiveTrainStatusResult
              key={`${lookup.trainNumber}-${lookup.journeyDate}`}
              trainNumber={lookup.trainNumber}
              journeyDate={lookup.journeyDate}
            />
          )}
        </div>

        <LiveTrainStatusGuide />
      </main>

      <Footer />
    </div>
  );
}

function LiveTrainStatusGuide({ embedded = false }: { embedded?: boolean }) {
  const guideItems = [
    {
      icon: MapPin,
      title: "Last reported location",
      text: "This is the latest location available in the feed, so it may not be the train’s exact position right now.",
    },
    {
      icon: Clock,
      title: "Actual and scheduled times",
      text: "The station timeline shows a verified actual time when available; otherwise, it shows the scheduled time.",
    },
    {
      icon: RefreshCw,
      title: "Updates and journey date",
      text: "Check the data-updated time, use Refresh for a new check, and select the date the train starts its journey.",
    },
  ];

  return (
    <section
      aria-labelledby="live-status-guide-heading"
      data-live-guide
      className={`site-tool-container ${embedded ? "mt-6" : "mt-10"} space-y-4`}
    >
      <div className="max-w-3xl">
        <p className="type-body  font-extrabold uppercase tracking-[0.12em] text-orange-700">
          Quick guide
        </p>
        <h2
          id="live-status-guide-heading"
          className="type-section-compact mt-1 tracking-tight text-[var(--navy)] "
        >
          How to read live train status
        </h2>
        <p className="type-body-small mt-1 leading-6 text-slate-600">
          Use the location, station timeline, and update time together to understand the latest available journey information.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guideItems.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <h3 className="type-h3  text-[var(--navy)]">{title}</h3>
            </div>
            <p className="type-body-small mt-2 leading-5 text-slate-600">{text}</p>
          </article>
        ))}
      </div>

      <p className="type-body-small rounded-lg border border-orange-100 bg-orange-50/60 px-3.5 py-3 leading-5 text-slate-700">
        Live updates can be delayed or temporarily unavailable. If a station has no verified actual time, use its scheduled time as a reference and check again before departure.
      </p>
    </section>
  );
}
