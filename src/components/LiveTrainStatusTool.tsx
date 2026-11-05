"use client";

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
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (!match) return value;
  const h = Number(match[1]);
  return h > 23 || Number(match[2]) > 59 ? value : String(h % 12 || 12).padStart(2, "0") + ":" + match[2] + (h >= 12 ? " PM" : " AM");
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
    hour12: true,
  }).format(date);
}

function getDelayBadge(value: unknown) {
  if ((typeof value !== "string" && typeof value !== "number") || String(value).trim() === "" || !Number.isFinite(Number(value))) {
    return { label: "On Time", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" };
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

function getJourneyState(record: DataRecord, route: DataRecord[], selectedDate: string): JourneyState {
  const explicitStatus = statusText(pickValue(record, ["journeyStatus", "runningStatus", "trainStatus", "operationalStatus", "journey_state", "status"]));
  const cancelled = ["isCancelled", "journeyCancelled", "isJourneyCancelled", "cancelled", "canceled"].some((key) => pickValue(record, [key]) === true)
    || /\b(cancelled|canceled)\b/.test(explicitStatus);
  if (cancelled) return "CANCELLED";

  const notStarted = ["isNotStarted", "notStarted", "journeyNotStarted"].some((key) => pickValue(record, [key]) === true)
    || /\b(not started|yet to start|not departed|before departure|scheduled|departure delayed|delayed departure)\b/.test(explicitStatus);
  if (selectedDate > todayInIndia()) return notStarted ? "NOT_STARTED" : "UNKNOWN";

  const finalStop = route[route.length - 1];
  const finalArrival = finalStop && !hasPredictedProvenance(finalStop) && (
    ["actualArrival", "arrivalTimeActual", "actual_arrival"].some((key) => hasVerifiedActualTime(finalStop, pickValue(finalStop, [key])))
    || ["isArrived", "hasArrived", "arrivalConfirmed"].some((key) => pickValue(finalStop, [key]) === true)
    || /\b(arrived|reached|completed|terminated)\b/.test(statusText(pickValue(finalStop, ["stationStatus", "arrivalStatus", "eventStatus", "status"])))
  );
  if (finalArrival) return "COMPLETED";

  const providerReportsCompleted = ["isCompleted", "journeyCompleted", "isJourneyCompleted", "completed"].some((key) => pickValue(record, [key]) === true)
    || /\b(complete|completed|finished|reached destination|arrived at destination|terminated at destination)\b/.test(explicitStatus);
  if (providerReportsCompleted) return "COMPLETED";

  const originStop = route[0];
  const originDeparted = originStop && !hasPredictedProvenance(originStop) && (
    ["hasDeparted", "isDeparted", "departureConfirmed"].some((key) => pickValue(originStop, [key]) === true)
    || ["actualDeparture", "departureTimeActual", "actual_departure"].some((key) => hasVerifiedActualTime(originStop, pickValue(originStop, [key])))
    || /\b(departed|passed)\b/.test(statusText(pickValue(originStop, ["departureStatus", "eventStatus", "stationStatus", "status"])))
  );
  if (originDeparted || route.slice(1).some(hasConfirmedStationEvent)) return "RUNNING";
  if (notStarted) return "NOT_STARTED";

  const providerReportsRunning = ["isRunning", "isInProgress", "isStarted", "hasDeparted", "journeyStarted"].some((key) => pickValue(record, [key]) === true)
    || /\b(running|in progress|on route|en route|departed)\b/.test(explicitStatus);
  if (providerReportsRunning) return "RUNNING";

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
  computedDay: number;
  dayFormattedString: string;
};

function computeStationDays(route: DataRecord[], originDate: string): RouteStopWithDay[] {
  let currentDay = 1;
  let prevMinutes = -1;

  const parseMinutes = (timeVal: unknown): number => {
    if (typeof timeVal !== "string") return -1;
    const match = /(\d{1,2}):(\d{2})/.exec(timeVal);
    if (!match) return -1;
    return Number(match[1]) * 60 + Number(match[2]);
  };

  const getDayFormatted = (baseDateStr: string, dayNum: number) => {
    const base = new Date(`${baseDateStr}T00:00:00.000Z`);
    if (!Number.isFinite(base.getTime())) return `Day ${dayNum}`;
    base.setUTCDate(base.getUTCDate() + (dayNum - 1));
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      weekday: "short",
    }).format(base);
  };

  return route.map((stop, index) => {
    // 1. Explicit day reported by provider
    const rawDay = pickValue(stop, ["day", "dayCount", "journeyDay", "dayNumber", "day_number"]);
    if (typeof rawDay === "number" && Number.isFinite(rawDay) && rawDay >= 1) {
      currentDay = Math.floor(rawDay);
    } else if (typeof rawDay === "string" && /^\d+$/.test(rawDay.trim())) {
      const parsed = parseInt(rawDay.trim(), 10);
      if (parsed >= 1) currentDay = parsed;
    } else {
      // 2. ISO timestamp difference
      const timestamp = pickValue(stop, [
        "scheduledArrival", "scheduledArrivalTime", "arrivalTimeScheduled",
        "scheduledDeparture", "scheduledDepartureTime", "departureTimeScheduled",
        "actualArrival", "arrivalTimeActual"
      ]);
      if (typeof timestamp === "string" && /^\d{4}-\d{2}-\d{2}/.test(timestamp)) {
        const stopDateStr = timestamp.slice(0, 10);
        const originEpoch = new Date(`${originDate}T00:00:00.000Z`).getTime();
        const stopEpoch = new Date(`${stopDateStr}T00:00:00.000Z`).getTime();
        if (Number.isFinite(originEpoch) && Number.isFinite(stopEpoch)) {
          const diffDays = Math.round((stopEpoch - originEpoch) / (24 * 3600 * 1000));
          if (diffDays >= 0) currentDay = diffDays + 1;
        }
      } else if (index > 0) {
        // 3. Midnight rollover detection: e.g. 23:45 -> 00:30
        const currArr = parseMinutes(pickValue(stop, ["scheduledArrival", "arrivalTimeScheduled", "actualArrival"]));
        const currDep = parseMinutes(pickValue(stop, ["scheduledDeparture", "departureTimeScheduled", "actualDeparture"]));
        const currMinutes = currArr >= 0 ? currArr : currDep;

        if (prevMinutes >= 0 && currMinutes >= 0) {
          if (currMinutes < prevMinutes && prevMinutes - currMinutes > 180) {
            currentDay += 1;
          }
        }
        if (currDep >= 0) prevMinutes = currDep;
        else if (currArr >= 0) prevMinutes = currArr;
      }
    }

    return {
      ...stop,
      computedDay: currentDay,
      dayFormattedString: getDayFormatted(originDate, currentDay),
    };
  });
}

function computeTotalDuration(firstStop: DataRecord, lastStop: DataRecord): string {
  const depTime = pickValue(firstStop, ["scheduledDeparture", "departureTimeScheduled", "scheduledDepartureTime"]);
  const arrTime = pickValue(lastStop, ["scheduledArrival", "arrivalTimeScheduled", "scheduledArrivalTime"]);
  if (typeof depTime === "string" && typeof arrTime === "string") {
    if (/\d{4}-\d{2}-\d{2}T/.test(depTime) && /\d{4}-\d{2}-\d{2}T/.test(arrTime)) {
      const ms = Date.parse(arrTime) - Date.parse(depTime);
      if (ms > 0) {
        const totalMin = Math.floor(ms / 60000);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        return `${h}h ${m}m`;
      }
    }
  }
  return "—";
}

/* =========================================================================
   MMT-STYLE CLEAN ROUTE TIMELINE (With Day Separators)
   ========================================================================= */

function MmtRouteTimeline({
  route,
  currentStationCode,
  journeyState,
  journeyDate,
}: {
  route: RouteStopWithDay[];
  currentStationCode: string;
  journeyState: JourneyState;
  journeyDate: string;
}) {
  if (route.length === 0) return null;

  const canShowObservedEvents = journeyDate <= todayInIndia();
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
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      {/* Table-like Header Strip */}
      <div className="grid grid-cols-[85px_1fr_85px] items-center border-b border-slate-100 bg-[#fffcf9] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:grid-cols-[105px_36px_1fr_105px] sm:px-6">
        <div>Arrival</div>
        <div className="hidden sm:block" />
        <div className="text-center sm:text-left">Station &amp; Platform</div>
        <div className="text-right">Departure</div>
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
          const delayBadge = getDelayBadge(departureDelayValue ?? arrivalDelayValue);

          const hasStopEvent = canShowObservedEvents && hasConfirmedStationEvent(stop);
          const isCurrent = journeyState === "RUNNING" && index === currentIndex;
          const isPassed = journeyState === "COMPLETED" || (currentIndex >= 0 && index < currentIndex) || hasStopEvent;

          // Halt duration and distance
          const halt = displayValue(pickValue(stop, ["haltTime", "halt", "haltMinutes", "haltDuration"]));
          const distance = displayValue(pickValue(stop, ["distanceFromOriginKm", "distanceKm", "distance"]));

          // Day separation check
          const prevStop = index > 0 ? route[index - 1] : null;
          const isNewDay = index === 0 || (prevStop && stop.computedDay !== prevStop.computedDay);

          return (
            <div key={`${stationCode}-${index}`} className="flex flex-col">
              {/* ── DAY SEPARATOR (MakeMyTrip Style) ── */}
              {isNewDay && (
                <div className="flex items-center gap-2.5 border-y border-orange-200/90 bg-[#fff8f2] px-4 py-2 sm:px-6">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white shadow-2xs">
                    {stop.computedDay}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-orange-950">
                    Day {stop.computedDay}
                  </span>
                  <span className="text-orange-300">•</span>
                  <span className="text-xs font-bold text-slate-600">
                    {stop.dayFormattedString}
                  </span>
                </div>
              )}

              {/* STATION ROW */}
              <div
                className={`relative grid grid-cols-[85px_1fr_85px] items-center gap-2 px-4 py-3.5 transition-colors sm:grid-cols-[105px_36px_1fr_105px] sm:gap-4 sm:px-6 ${isCurrent
                    ? "bg-orange-50/70 ring-1 ring-inset ring-orange-200"
                    : isPassed
                      ? "bg-white"
                      : "bg-slate-50/30 text-slate-500"
                  }`}
              >
                {/* ARRIVAL COLUMN */}
                <div className="text-left font-mono">
                  {isOrigin ? (
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Starts</span>
                  ) : (
                    <>
                      <p className={`text-xs font-bold sm:text-sm ${isPassed ? "text-slate-900" : "text-slate-600"}`}>
                        {actualArrival ? formatLiveTime(actualArrival) : scheduledArrival ? formatLiveTime(scheduledArrival) : "—"}
                      </p>
                      {actualArrival && scheduledArrival && actualArrival !== scheduledArrival && (
                        <p className="text-[10px] text-slate-400 line-through">
                          {formatLiveTime(scheduledArrival)}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* CENTER TRACK WITH LIVE TRAIN ICON */}
                <div className="hidden sm:flex relative self-stretch items-center justify-center">
                  {/* Vertical Line Segment */}
                  <div
                    className={`absolute w-1 -translate-x-1/2 left-1/2 ${index === 0
                        ? "top-1/2 bottom-0"
                        : isFinal
                          ? "top-0 bottom-1/2"
                          : "top-0 bottom-0"
                      } ${isPassed ? "bg-emerald-500" : "bg-slate-200"}`}
                  />

                  {/* Node or Train Indicator */}
                  {isCurrent ? (
                    <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-white shadow-md ring-4 ring-orange-100 animate-pulse">
                      <TrainFront className="h-4 w-4" />
                    </div>
                  ) : isPassed ? (
                    <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="relative z-10 h-3 w-3 rounded-full border-2 border-slate-300 bg-white" />
                  )}
                </div>

                {/* STATION NAME & DETAILS */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-xs font-bold sm:text-[14px] ${isCurrent ? "text-orange-950 font-extrabold" : "text-[var(--navy)]"}`}>
                      {stationName}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {stationCode}
                    </span>
                    {platform !== "—" && (
                      <span className="rounded border border-slate-200 bg-white px-1.5 py-0.2 text-[10px] font-medium text-slate-600">
                        PF {platform}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                        Current Location
                      </span>
                    )}
                  </div>

                  {/* Auxiliary Stop Info (Distance & Halt) */}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    {halt !== "—" && <span>Halt: {halt}</span>}
                    {halt !== "—" && distance !== "—" && <span>•</span>}
                    {distance !== "—" && <span>{distance} km</span>}
                  </div>
                </div>

                {/* DEPARTURE COLUMN */}
                <div className="text-right font-mono">
                  {isFinal ? (
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ends</span>
                  ) : (
                    <>
                      <p className={`text-xs font-bold sm:text-sm ${isPassed ? "text-slate-900" : "text-slate-600"}`}>
                        {actualDeparture ? formatLiveTime(actualDeparture) : scheduledDeparture ? formatLiveTime(scheduledDeparture) : "—"}
                      </p>
                      {actualDeparture && scheduledDeparture && actualDeparture !== scheduledDeparture && (
                        <p className="text-[10px] text-slate-400 line-through">
                          {formatLiveTime(scheduledDeparture)}
                        </p>
                      )}
                      {isPassed && delayBadge.label !== "On Time" && (
                        <span className={`mt-0.5 inline-block text-[10px] font-bold ${delayBadge.classes.replace(/border[^\s]*/, "")}`}>
                          {delayBadge.label}
                        </span>
                      )}
                    </>
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
  totalHalts: number;
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

  const dayLetters = ["M", "T", "W", "T", "F", "S", "S"];
  const isDaily = !runsOnText || runsOnText.toLowerCase().includes("daily") || runsOnText === "—";

  return (
    <aside aria-label="Train journey overview" className="space-y-4">
      {/* MAIN OVERVIEW CARD */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {/* Card Header */}
        <div className="border-b border-orange-100 bg-[#fff9f4] p-4">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-orange-500 px-2 py-0.5 text-xs font-black tracking-wider text-white">
              {trainNumber}
            </span>
            <span className="rounded border border-orange-200 bg-white px-2 py-0.5 text-[10px] font-bold text-orange-800 uppercase">
              {trainType !== "—" ? trainType : "Express"}
            </span>
          </div>
          <h3 className="mt-2 text-base font-[900] tracking-tight text-[var(--navy)]">
            {trainName !== "—" ? trainName : `Train ${trainNumber}`}
          </h3>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {sourceCode !== "—" ? sourceCode : "Origin"} → {destinationCode !== "—" ? destinationCode : "Destination"}
          </p>
        </div>

        {/* Origin & Destination Milestones */}
        <div className="p-4 space-y-3.5 border-b border-slate-100 text-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orange-500" />
                Departure
              </span>
              <p className="font-extrabold text-[var(--navy)]">{sourceName !== "—" ? sourceName : "Source"}</p>
              <p className="text-[11px] font-medium text-slate-500">Code: {sourceCode}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900 flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3 text-slate-400" />
                {departureTime}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="px-2 font-semibold text-orange-700 bg-orange-50 rounded-full py-0.5">
              {totalDuration !== "—" ? totalDuration : "Full Route"}
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orange-500" />
                Arrival
              </span>
              <p className="font-extrabold text-[var(--navy)]">{destinationName !== "—" ? destinationName : "Destination"}</p>
              <p className="text-[11px] font-medium text-slate-500">Code: {destinationCode}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900 flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3 text-slate-400" />
                {arrivalTime}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Metrics */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50 p-3 text-center text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Distance</span>
            <p className="mt-0.5 font-black text-slate-900">
              {totalDistance !== "—" ? `${totalDistance} km` : "—"}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Halts</span>
            <p className="mt-0.5 font-black text-slate-900">
              {totalHalts > 0 ? `${totalHalts} Stations` : "—"}
            </p>
          </div>
        </div>

        {/* Runs On Days */}
        <div className="p-4 border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Runs On Days
          </span>
          <div className="flex items-center gap-1.5">
            {dayLetters.map((d, i) => (
              <span
                key={i}
                className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-extrabold ${isDaily
                    ? "bg-orange-100 text-orange-800"
                    : "bg-slate-100 text-slate-400"
                  }`}
              >
                {d}
              </span>
            ))}
            <span className="ml-auto text-[11px] font-bold text-slate-500">
              {isDaily ? "Daily" : runsOnText}
            </span>
          </div>
        </div>

        {/* Available Classes */}
        <div className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Available Classes
          </span>
          <div className="flex flex-wrap gap-1.5">
            {classesList.map((cls) => (
              <span
                key={cls}
                className="rounded-md border border-slate-200 bg-[#fffdfa] px-2 py-0.5 text-xs font-bold text-[var(--navy)]"
              >
                {cls}
              </span>
            ))}
          </div>
        </div>

        {/* Share Button */}
        <div className="border-t border-slate-100 bg-[#faf6f0] p-3 text-center">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-orange-50 hover:text-orange-700 transition"
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
      <div className="rounded-2xl border border-orange-200/90 bg-[#fff9f4] p-4 text-xs space-y-3">
        <div className="flex items-center gap-2 text-orange-950 font-black">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Traveler Utilities</span>
        </div>
        <p className="text-slate-600 text-[11px] leading-relaxed">
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
  onDateChange,
}: {
  trainNumber: string;
  journeyDate: string;
  onDateChange: (newDate: string) => void;
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
        if (!controller.signal.aborted) setLiveResult(body.data);
      } catch (lookupError) {
        if (!controller.signal.aborted) {
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
  const routeStops = computeStationDays(rawRouteStops, journeyDate);

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
  const journeyState = record ? getJourneyState(record, rawRouteStops, journeyDate) : "UNKNOWN";
  const trainName = displayValue(
    (trainInfo && pickValue(trainInfo, ["name", "trainName"])) ??
    (record && pickValue(record, ["trainName", "name"]))
  );
  const delayBadge = getDelayBadge(delayMinutes === "—" ? undefined : delayMinutes);

  // Side card data metrics
  const firstStop = routeStops[0];
  const lastStop = routeStops.length > 0 ? routeStops[routeStops.length - 1] : undefined;
  const totalDistance = lastStop ? displayValue(pickValue(lastStop, ["distanceFromOriginKm", "distanceKm", "distance"])) : "—";
  const totalDuration = firstStop && lastStop ? computeTotalDuration(firstStop, lastStop) : "—";
  const totalHalts = routeStops.length > 2 ? routeStops.length - 2 : routeStops.length;
  const trainType = displayValue(trainInfo && pickValue(trainInfo, ["type", "trainType", "category"]));
  const runsOnText = displayValue(trainInfo && pickValue(trainInfo, ["daysOfRun", "runsOn", "runningDays"]));

  const departureTime = firstStop
    ? formatLiveTime(pickValue(firstStop, ["scheduledDeparture", "departureTimeScheduled", "scheduledDepartureTime"]))
    : "—";
  const arrivalTime = lastStop
    ? formatLiveTime(pickValue(lastStop, ["scheduledArrival", "arrivalTimeScheduled", "scheduledArrivalTime"]))
    : "—";

  const classesList = ["1A", "2A", "3A", "SL", "GEN"];

  const yesterdayStr = getRelativeDate(-1);
  const todayStr = todayInIndia();
  const tomorrowStr = getRelativeDate(1);

  return (
    <div className="mt-6 space-y-5">
      {/* ══ MMT-STYLE TOP SUMMARY HEADER CARD (White and Orange Theme) ══ */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {/* Top Header Strip */}
        <div className="border-b border-orange-100 bg-[#fffaf5] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-orange-500 px-2.5 py-0.5 text-xs font-[900] text-white tracking-wider">
                  {trainNumber}
                </span>
                <h3 className="text-base font-[900] tracking-tight sm:text-lg text-[var(--navy)]">
                  {trainName !== "—" ? trainName : `Train ${trainNumber}`}
                </h3>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
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
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 text-xs font-bold text-orange-900 shadow-2xs transition hover:bg-orange-50 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-orange-600 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Updating..." : "Refresh"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Selector Tabs (Yesterday / Today / Tomorrow) */}
        <div className="flex border-b border-slate-100 bg-white px-4 py-2 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Journey:</span>
            {[yesterdayStr, todayStr, tomorrowStr].map((dStr) => {
              const isActive = journeyDate === dStr;
              return (
                <button
                  key={dStr}
                  type="button"
                  onClick={() => onDateChange(dStr)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${isActive
                      ? "bg-orange-500 text-white shadow-xs"
                      : "bg-[#fffdfa] text-slate-600 hover:bg-orange-50 border border-slate-200"
                    }`}
                >
                  {formatDateTabLabel(dStr)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Status Highlight Banner */}
        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="flex items-center gap-3 py-4 text-slate-600">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              <span className="text-xs font-semibold">Fetching latest train position from live feed...</span>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800">
              {error}
            </div>
          ) : liveResult !== null ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center">
              {/* Metric 1: Operational Status */}
              <div className="rounded-xl border border-slate-100 bg-[#fffaf5] p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Status</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-extrabold ${delayBadge.classes}`}>
                    {String(delayBadge.label)}
                  </span>
                  <span className="text-xs font-bold text-slate-700 capitalize">
                    {journeyState === "RUNNING"
                      ? "Running on route"
                      : journeyState === "NOT_STARTED"
                        ? "Yet to start"
                        : journeyState === "COMPLETED"
                          ? "Reached destination"
                          : String(journeyState)}
                  </span>
                </div>
              </div>

              {/* Metric 2: Live Location */}
              <div className="rounded-xl border border-slate-100 bg-[#fffaf5] p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Reported Location</span>
                <p className="mt-1 truncate text-xs font-extrabold text-[var(--navy)]">
                  {currentStationName !== "—" ? currentStationName : currentStationCode !== "—" ? currentStationCode : "Station En Route"}
                </p>
                {currentSpeed !== "—" && (
                  <p className="text-[11px] font-semibold text-orange-700">Speed: {currentSpeed} km/h</p>
                )}
              </div>

              {/* Metric 3: Journey Date */}
              <div className="rounded-xl border border-slate-100 bg-[#fffaf5] p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scheduled Date</span>
                <p className="mt-1 text-xs font-extrabold text-[var(--navy)]">
                  {formatLiveDate(journeyDate)}
                </p>
              </div>

              {/* Metric 4: Last Updated Time */}
              <div className="rounded-xl border border-slate-100 bg-[#fffaf5] p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Data Updated</span>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  {lastUpdated !== "—" ? formatLiveDateTime(lastUpdated) : "Just now"}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ══ MMT-STYLE 2-COLUMN LAYOUT: TIMELINE (LEFT) & STICKY SIDE CARD (RIGHT) ══ */}
      {liveResult !== null && routeStops.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-6 items-start">
          {/* LEFT COLUMN: Day-wise Route Timeline */}
          <div className="min-w-0 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-extrabold text-[var(--navy)] flex items-center gap-2">
                <Navigation className="h-4 w-4 text-orange-500" />
                <span>Station Timetable &amp; Running Status</span>
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {routeStops.length} Total Stations
              </span>
            </div>

            <MmtRouteTimeline
              route={routeStops}
              currentStationCode={currentStationCode}
              journeyState={journeyState}
              journeyDate={journeyDate}
            />
          </div>

          {/* RIGHT COLUMN: Sticky Side Card */}
          <div className="sticky top-24">
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

export function LiveTrainStatusTool() {
  const searchParams = useSearchParams();
  const queryTrain = searchParams.get("train") ?? "";
  const queryDate = searchParams.get("date") ?? "";
  return <LiveTrainStatusSearch key={`${queryTrain}:${queryDate}`} queryTrain={queryTrain} queryDate={queryDate} />;
}

function LiveTrainStatusSearch({ queryTrain, queryDate }: { queryTrain: string; queryDate: string }) {
  const router = useRouter();

  const [trainQuery, setTrainQuery] = useState(queryTrain);
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

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

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/trains?q=${encodeURIComponent(cleanQ)}&limit=8`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.trains)) {
            setTrainSuggestions(data.trains);
          }
        }
      } catch {
        // Autocomplete error fallback
      } finally {
        setSearchLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [trainQuery, dropdownOpen]);

  function submitLookup(event?: FormEvent<HTMLFormElement>, overrideTrain?: string, overrideDate?: string) {
    if (event) event.preventDefault();
    const tNum = (overrideTrain ?? trainQuery).replace(/\D/g, "").slice(0, 6);
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

    const params = new URLSearchParams();
    params.set("train", tNum);
    params.set("date", dVal);
    router.replace(`/live-train-status?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfa]">
      <Header />

      <main className="flex-1 pb-16">
        {/* ══ MMT-STYLE TOP SEARCH HERO SECTION (WHITE & ORANGE THEME, MAX-W 1240PX) ══ */}
        <section className="relative border-b border-[#f4e4d4] bg-gradient-to-b from-[#fffcf8] via-[#faf6f0] to-[#f6efe6] pt-6 pb-8 sm:pt-8 sm:pb-10">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 text-center">
            {/* Header Badge */}
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-1 text-xs font-[800] uppercase tracking-wider text-[#ea580c] shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#f97316] animate-pulse" />
              Live Train Enquiry • Real-Time GPS &amp; NTES
            </div>

            <h1 className="page-hero-title">
              Live Train <span className="hero-accent">Running Status</span>
            </h1>
            <p className="page-hero-description mx-auto mt-1.5 max-w-xl text-slate-600">
              Check real-time train location, delay status, platform numbers, and station timetables.
            </p>

            {/* MMT-Style Unified Search Card */}
            <div
              ref={searchContainerRef}
              className="relative mx-auto mt-5 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-lg max-w-2xl text-left"
            >
              <form onSubmit={(e) => submitLookup(e)} className="grid gap-3 sm:grid-cols-[1fr_170px_auto] items-end">
                {/* Train Input with Autocomplete */}
                <div className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Train Name or Number
                  </label>
                  <div className="relative flex items-center">
                    <TrainFront className="absolute left-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      autoComplete="off"
                      value={trainQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTrainQuery(val);
                        if (!val.trim()) {
                          setTrainSuggestions([]);
                        }
                        setDropdownOpen(true);
                      }}
                      onFocus={() => setDropdownOpen(true)}
                      placeholder="e.g. 19712 or Jaipur Exp"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-[#fffdfa] pl-10 pr-3 text-sm font-semibold text-[var(--navy)] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {dropdownOpen && (trainSuggestions.length > 0 || searchLoading) && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                      {searchLoading && (
                        <div className="p-3 text-center text-xs text-slate-500">
                          Searching trains...
                        </div>
                      )}
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
                          className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold hover:bg-orange-50/70 border-b border-slate-50 last:border-0"
                        >
                          <span className="font-extrabold text-[var(--navy)]">
                            {item.trainNumber} - {item.trainName}
                          </span>
                          <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                            Select
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Journey Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Journey Date
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-[#fffdfa] pl-10 pr-2 text-xs font-semibold text-[var(--navy)] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-bold text-white shadow-xs transition hover:bg-[#ea580c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  <span>Check Status</span>
                </button>
              </form>

              {validationError && (
                <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                  {validationError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ══ RESULTS CONTAINER (MAX-W 1240PX FOR 2560PX SCREEN ALIGNMENT) ══ */}
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
          {lookup && (
            <LiveTrainStatusResult
              key={`${lookup.trainNumber}-${lookup.journeyDate}`}
              trainNumber={lookup.trainNumber}
              journeyDate={lookup.journeyDate}
              onDateChange={(newDate) => {
                setJourneyDate(newDate);
                submitLookup(undefined, lookup.trainNumber, newDate);
              }}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
