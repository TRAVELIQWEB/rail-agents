"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, MapPin, Search, TrainFront, X } from "lucide-react";
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

function formatApiValue(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => typeof item === "object" && item !== null ? JSON.stringify(item) : displayValue(item)).join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return displayValue(value);
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
    hour12: false,
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

function getDelayPresentation(value: unknown) {
  if ((typeof value !== "string" && typeof value !== "number") || String(value).trim() === "" || !Number.isFinite(Number(value))) {
    return { label: "Delay not reported", classes: "bg-slate-100 text-slate-600" };
  }
  const minutes = Number(value);
  if (minutes > 0) return { label: `${minutes} min late`, classes: "bg-amber-100 text-amber-900" };
  if (minutes < 0) return { label: `${Math.abs(minutes)} min early`, classes: "bg-sky-100 text-sky-800" };
  return { label: "On time", classes: "bg-emerald-100 text-emerald-800" };
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
  // A future service cannot have completed or started, even if the feed fills
  // "actual" timestamps with timetable-based predictions.
  if (selectedDate > todayInIndia()) return notStarted ? "NOT_STARTED" : "UNKNOWN";

  // `isLive` describes the provider feed, not whether the train is currently moving.
  // Do not infer a running or completed journey from that flag.
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

function isTomorrowInIndia(journeyDate: string): boolean {
  const today = todayInIndia();
  const tomorrow = new Date(`${today}T00:00:00.000Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return journeyDate === tomorrow.toISOString().slice(0, 10);
}

function scheduledDepartureHasPassed(value: unknown, journeyDate: string): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(journeyDate)) return false;
  const timeOnly = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
  const timestamp = timeOnly
    ? Date.parse(`${journeyDate}T${timeOnly[1].padStart(2, "0")}:${timeOnly[2]}:${value.split(":")[2] ?? "00"}+05:30`)
    : /\d{4}-\d{2}-\d{2}T/.test(value)
      ? Date.parse(/[Zz]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}+05:30`)
      : Number.NaN;
  return Number.isFinite(timestamp) && timestamp < Date.now();
}

function parseAbsoluteTime(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function TrainPositionIcon() {
  return <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[#0b2240] shadow-sm">
    <TrainFront aria-hidden="true" className="h-[21px] w-[21px] stroke-[2.25]" />
  </span>;
}

function LiveRouteTimeline({ route, currentStationCode, journeyState, journeyDate }: { route: DataRecord[]; currentStationCode: string; journeyState: JourneyState; journeyDate: string }) {
  if (route.length === 0) return null;
  const canShowObservedEvents = journeyDate <= todayInIndia();
  const normalizedCurrentCode = currentStationCode.trim().toUpperCase();
  const apiPositionIndex = journeyState !== "RUNNING" || normalizedCurrentCode === "—" ? -1 : route.findIndex((stop) =>
    displayValue(pickValue(stop, ["stationCode", "code"])).trim().toUpperCase() === normalizedCurrentCode,
  );
  const statusPositionIndex = journeyState === "RUNNING" && apiPositionIndex < 0 ? route.findIndex((stop) => {
    const stopStatus = statusText(pickValue(stop, ["status", "stationStatus", "eventStatus"]));
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
          const rawStatus = pickValue(stop, ["status", "stationStatus", "eventStatus"]);
          const statusRecord = asRecord(rawStatus);
          const displayStationStatus = hasReportedValue(rawStatus)
            ? displayValue(statusRecord ? pickValue(statusRecord, ["label", "formatted", "status", "code", "value"]) : rawStatus)
            : "Status not reported";
          const stationName = displayValue(pickValue(stop, ["stationName", "name"]));
          const stationCode = displayValue(pickValue(stop, ["stationCode", "code"]));
          const isFinal = index === route.length - 1;
          const hasStopEvent = canShowObservedEvents && hasConfirmedStationEvent(stop);
          const isCurrent = journeyState === "RUNNING" && index === currentIndex;
          const isPassed = journeyState !== "NOT_STARTED" && hasStopEvent;
          const scheduledArrival = pickValue(stop, ["scheduledArrival", "scheduledArrivalTime", "arrivalTimeScheduled"]);
          const reportedActualArrival = pickValue(stop, ["actualArrival", "arrivalTimeActual", "actual_arrival"]);
          const actualArrival = canShowObservedEvents && journeyState !== "NOT_STARTED" && hasVerifiedActualTime(stop, reportedActualArrival) ? reportedActualArrival : undefined;
          const scheduledDeparture = pickValue(stop, ["scheduledDeparture", "scheduledDepartureTime", "departureTimeScheduled"]);
          const reportedActualDeparture = pickValue(stop, ["actualDeparture", "departureTimeActual", "actual_departure"]);
          const actualDeparture = canShowObservedEvents && journeyState !== "NOT_STARTED" && hasVerifiedActualTime(stop, reportedActualDeparture) ? reportedActualDeparture : undefined;
          const arrivalDelayValue = pickValue(stop, ["delayArrival", "arrivalDelayMinutes", "arrivalDelay"]);
          const departureDelayValue = pickValue(stop, ["delayDeparture", "departureDelayMinutes", "departureDelay"]);
          const arrivalDelay = getDelayPresentation(arrivalDelayValue);
          const departureDelay = getDelayPresentation(departureDelayValue);
          const showArrivalDelay = hasStopEvent && (typeof arrivalDelayValue === "string" || typeof arrivalDelayValue === "number") && hasReportedValue(arrivalDelayValue) && Number.isFinite(Number(arrivalDelayValue));
          const showDepartureDelay = hasStopEvent && (typeof departureDelayValue === "string" || typeof departureDelayValue === "number") && hasReportedValue(departureDelayValue) && Number.isFinite(Number(departureDelayValue));
          const stationTimestamp = pickValue(stop, ["scheduledArrival", "actualArrival", "predictedArrival", "estimatedArrival", "scheduledDeparture", "actualDeparture", "predictedDeparture", "estimatedDeparture"]);

          return <li key={`${stationCode}-${displayValue(pickValue(stop, ["sequence"]))}-${index}`} className={`grid grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)] gap-x-2 gap-y-3 px-3 py-3 transition-colors md:grid-cols-[minmax(100px,0.8fr)_28px_minmax(150px,1.5fr)_minmax(100px,0.8fr)] md:items-center md:gap-3 md:px-5 md:py-3.5 ${isCurrent ? "bg-blue-50/80" : "bg-white hover:bg-slate-50/70"}`}>
            <div className="col-start-1 row-start-2 space-y-1.5 pt-0.5 text-[10px] md:col-start-1 md:row-start-1 md:text-xs">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Scheduled</p>
              <p className="font-bold tabular-nums text-slate-600">{scheduledArrival === undefined ? "—" : formatLiveTime(scheduledArrival)}</p>
              {actualArrival !== undefined && <p className="font-semibold tabular-nums text-emerald-700"><span className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">Actual</span> {formatLiveTime(actualArrival)}</p>}
              {pickValue(stop, ["predictedArrival"]) !== undefined && <p className="font-semibold tabular-nums text-blue-700"><span className="text-[9px] font-bold uppercase tracking-wide text-blue-600">Predicted</span> {formatLiveTime(pickValue(stop, ["predictedArrival"]))}</p>}
              {pickValue(stop, ["estimatedArrival"]) !== undefined && <p className="font-semibold tabular-nums text-blue-700"><span className="text-[9px] font-bold uppercase tracking-wide text-blue-600">Estimated</span> {formatLiveTime(pickValue(stop, ["estimatedArrival"]))}</p>}
              {showArrivalDelay && <p className={`inline-flex w-fit rounded-md px-1.5 py-0.5 font-bold ${arrivalDelay.classes}`}>{arrivalDelay.label}</p>}
            </div>
            <div className="relative col-start-2 row-span-2 row-start-1 flex self-stretch items-center justify-center md:col-start-2 md:row-span-1 md:row-start-1">
              {journeyState === "COMPLETED" ? (
                <>
                  {index > 0 && <span aria-hidden="true" className={`absolute left-1/2 top-0 z-0 block -translate-x-1/2 border-l-2 ${hasStopEvent ? "border-emerald-500" : "border-slate-300"}`} style={{ bottom: "50%" }} />}
                  {index < route.length - 1 && <span aria-hidden="true" className={`absolute bottom-0 left-1/2 top-1/2 z-0 block -translate-x-1/2 border-l-2 ${hasConfirmedStationEvent(route[index + 1]) ? "border-emerald-500" : "border-slate-300"}`} />}
                </>
              ) : currentIndex < 0 ? (
                <span aria-hidden="true" className="absolute left-1/2 z-0 block min-h-[24px] -translate-x-1/2 border-l-2 border-slate-300" style={{ top: index === 0 ? "50%" : 0, bottom: index === route.length - 1 ? "50%" : 0 }} />
              ) : index < currentIndex ? (
                <span aria-hidden="true" className={`absolute left-1/2 z-0 block min-h-[24px] -translate-x-1/2 border-l-2 ${hasStopEvent ? "border-emerald-500" : "border-slate-300"}`} style={{ top: index === 0 ? "50%" : 0, bottom: 0 }} />
              ) : index === currentIndex ? (
                <>
                  {index > 0 && <span aria-hidden="true" className="absolute left-1/2 top-0 z-0 block -translate-x-1/2 border-l-2 border-emerald-500" style={{ bottom: "50%" }} />}
                  {index < route.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-1/2 top-1/2 z-0 block -translate-x-1/2 border-l-2 border-slate-300" />}
                </>
              ) : (
                <span aria-hidden="true" className="absolute bottom-0 left-1/2 top-0 z-0 block -translate-x-1/2 border-l-2 border-slate-300" style={{ bottom: index === route.length - 1 ? "50%" : 0 }} />
              )}
              {journeyState === "COMPLETED" && isFinal ? <span aria-label="Final destination reached" className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-600"><CheckCircle2 aria-hidden="true" className="h-7 w-7 fill-emerald-100" /></span> : isCurrent ? <span aria-label="Train's latest reported station" className="relative z-10 flex h-8 w-8 items-center justify-center"><span aria-hidden="true" className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300 opacity-35 motion-safe:animate-ping" /><TrainPositionIcon /></span> : <span aria-hidden="true" className={`relative z-10 h-2.5 w-2.5 rounded-full shadow-sm ${isPassed ? "border border-emerald-600 bg-emerald-500" : "border-2 border-slate-300 bg-white"}`} />}
            </div>
            <div className="col-start-3 row-start-1 min-w-0 md:col-start-3 md:row-start-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h5 className={`text-sm font-extrabold leading-tight sm:text-base ${isCurrent ? "text-blue-950" : "text-[#0b2240]"}`}>{stationName}</h5>
                {stationCode !== "—" && <span className="text-[10px] font-semibold tracking-wide text-slate-500">{stationCode}</span>}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${journeyState === "COMPLETED" && isFinal ? "bg-emerald-100 text-emerald-800" : isCurrent ? "bg-blue-100 text-blue-800" : isPassed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{journeyState === "NOT_STARTED" ? "Upcoming" : journeyState === "COMPLETED" && isFinal ? "Journey Completed" : isCurrent ? "Train location" : hasReportedValue(rawStatus) ? displayStationStatus : isPassed ? "Event confirmed" : "Status not reported"}</span>
                {journeyState === "NOT_STARTED" && <span className="text-[10px] font-semibold text-slate-500">{index === 0 ? "Origin · scheduled departure" : isFinal ? "Final destination" : "Upcoming stop"}</span>}
                <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{hasReportedValue(pickValue(stop, ["platform", "platformNumber"])) ? `Platform ${displayValue(pickValue(stop, ["platform", "platformNumber"]))}` : "Platform not available"}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-500">
                {stationTimestamp !== undefined && <span>{formatLiveDateTime(stationTimestamp).split(",")[0]}</span>}
                {pickValue(stop, ["sequence"]) !== undefined && <span>Stop {displayValue(pickValue(stop, ["sequence"]))}</span>}
                {pickValue(stop, ["distanceFromOriginKm", "distanceKm", "distance"]) !== undefined && <span>{displayValue(pickValue(stop, ["distanceFromOriginKm", "distanceKm", "distance"]))} km from origin</span>}
                {pickValue(stop, ["speedToNextStationKmph"]) !== undefined && <span>{displayValue(pickValue(stop, ["speedToNextStationKmph"]))} km/h to next</span>}
                {pickValue(stop, ["provenance"]) !== undefined && <span className="capitalize">{displayValue(pickValue(stop, ["provenance"]))} timing</span>}
                {typeof pickValue(stop, ["isHalt"]) === "boolean" && <span>{pickValue(stop, ["isHalt"]) === true ? "Scheduled halt" : "No scheduled halt"}</span>}
                {hasReportedValue(pickValue(stop, ["arrivalDay"])) && <span>Arrival day {displayValue(pickValue(stop, ["arrivalDay"]))}</span>}
                {hasReportedValue(pickValue(stop, ["departureDay"])) && <span>Departure day {displayValue(pickValue(stop, ["departureDay"]))}</span>}
                {hasReportedValue(pickValue(stop, ["coachPosition"])) && <span>Coach position {formatApiValue(pickValue(stop, ["coachPosition"]))}</span>}
                {hasReportedValue(pickValue(stop, ["lat", "latitude"])) && hasReportedValue(pickValue(stop, ["lng", "lon", "longitude"])) && <span>Coordinates {displayValue(pickValue(stop, ["lat", "latitude"]))}, {displayValue(pickValue(stop, ["lng", "lon", "longitude"]))}</span>}
              </div>
            </div>
            <div className="col-start-3 row-start-2 space-y-1.5 border-l border-slate-100 pl-3 pt-0.5 text-[10px] md:col-start-4 md:row-start-1 md:border-0 md:pl-0 md:text-right md:text-xs">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Scheduled</p>
              <p className="font-bold tabular-nums text-slate-600">{scheduledDeparture === undefined ? "—" : formatLiveTime(scheduledDeparture)}</p>
              {actualDeparture !== undefined && <p className="font-semibold tabular-nums text-emerald-700"><span className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">Actual</span> {formatLiveTime(actualDeparture)}</p>}
              {pickValue(stop, ["predictedDeparture"]) !== undefined && <p className="font-semibold tabular-nums text-blue-700"><span className="text-[9px] font-bold uppercase tracking-wide text-blue-600">Predicted</span> {formatLiveTime(pickValue(stop, ["predictedDeparture"]))}</p>}
              {pickValue(stop, ["estimatedDeparture"]) !== undefined && <p className="font-semibold tabular-nums text-blue-700"><span className="text-[9px] font-bold uppercase tracking-wide text-blue-600">Estimated</span> {formatLiveTime(pickValue(stop, ["estimatedDeparture"]))}</p>}
              {showDepartureDelay && <p className={`ml-auto inline-flex w-fit rounded-md px-1.5 py-0.5 font-bold ${departureDelay.classes}`}>{departureDelay.label}</p>}
            </div>
          </li>;
        })}
      </ol>
    </section>
  );
}

function LiveTrainStatusResult({ trainNumber, journeyDate }: { trainNumber: string; journeyDate: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveResult, setLiveResult] = useState<unknown>(null);
  const [dismissed, setDismissed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const checkStatus = useCallback(async (forceRefresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    setDismissed(false);
    setLiveResult(null);
    try {
      const response = await fetch(`/api/trains/${encodeURIComponent(trainNumber)}/live?date=${encodeURIComponent(journeyDate)}${forceRefresh ? "&refresh=1" : ""}`, { cache: "no-store", signal: controller.signal });
      const body = await response.json();
      if (!response.ok || body.success !== true || !body.data) {
        throw new Error(typeof body.error === "string" ? body.error : "Could not retrieve live train status.");
      }
      if (!controller.signal.aborted) setLiveResult(body.data);
    } catch (lookupError) {
      if (!controller.signal.aborted) setError(lookupError instanceof Error ? lookupError.message : "Live train status lookup failed. Please try again.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [trainNumber, journeyDate]);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void checkStatus(); }, 0);
    return () => {
      window.clearTimeout(timeout);
      abortRef.current?.abort();
    };
  }, [checkStatus]);

  const outer = asRecord(liveResult);
  const record = outer ? asRecord(outer.data) ?? asRecord(outer.result) ?? outer : null;
  const routeValue = record ? pickValue(record, ["route", "stations", "routeStations"]) : undefined;
  const routeStops: DataRecord[] = Array.isArray(routeValue) ? routeValue.map((item) => asRecord(item) ?? {}) : [];
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
  const currentLatitude = currentLocation && pickValue(currentLocation, ["latitude", "lat"]);
  const currentLongitude = currentLocation && pickValue(currentLocation, ["longitude", "lng", "lon"]);
  const currentLocationDisplay = currentStationName !== "—"
    ? currentStationName
    : hasReportedValue(currentLatitude) && hasReportedValue(currentLongitude)
      ? `${displayValue(currentLatitude)}, ${displayValue(currentLongitude)}`
      : "Not reported";
  const currentSpeed = displayValue((currentLocation && pickValue(currentLocation, ["speedKmh", "speed"])) ?? (record && pickValue(record, ["speedKmh", "currentSpeedKmh"])));
  const delayMinutes = displayValue((currentLocation && pickValue(currentLocation, ["delayMinutes"])) ?? (record && pickValue(record, ["delayMinutes", "delay"])));
  const lastUpdated = displayValue(record && pickValue(record, ["lastUpdatedAt", "updatedAt", "generatedAt"]));
  const journeyState = record ? getJourneyState(record, routeStops, journeyDate) : "UNKNOWN";
  const isLive = journeyState === "RUNNING";
  const trainName = displayValue((trainInfo && pickValue(trainInfo, ["name", "trainName"])) ?? (record && pickValue(record, ["trainName", "name"])));
  const currentRouteIndex = currentStationCode === "—" ? -1 : routeStops.findIndex((stop) => displayValue(pickValue(stop, ["stationCode", "code"])) === currentStationCode);
  const nextStation = currentRouteIndex >= 0
    ? routeStops[currentRouteIndex + 1]
    : routeStops.find((stop) => displayValue(pickValue(stop, ["status"])).toLowerCase() === "upcoming");
  const nextStationName = displayValue(nextStation && pickValue(nextStation, ["stationName", "name"]));
  const delayPresentation = getDelayPresentation(delayMinutes === "—" ? undefined : delayMinutes);
  const finalStop = routeStops[routeStops.length - 1];
  const finalArrivalScheduled = finalStop && pickValue(finalStop, ["scheduledArrival", "scheduledArrivalTime", "arrivalTimeScheduled"]);
  const finalArrivalReported = finalStop && pickValue(finalStop, ["actualArrival", "arrivalTimeActual", "actual_arrival"]);
  const finalArrivalActual = finalStop && hasVerifiedActualTime(finalStop, finalArrivalReported) ? finalArrivalReported : undefined;
  const providerFinalDelay = finalStop && hasConfirmedStationEvent(finalStop) ? pickValue(finalStop, ["delayArrival", "arrivalDelayMinutes", "arrivalDelay"]) : undefined;
  const scheduledFinalTimestamp = parseAbsoluteTime(finalArrivalScheduled);
  const actualFinalTimestamp = parseAbsoluteTime(finalArrivalActual);
  const calculatedFinalDelay = scheduledFinalTimestamp !== null && actualFinalTimestamp !== null
    ? Math.round((actualFinalTimestamp - scheduledFinalTimestamp) / 60000)
    : undefined;
  const providerFinalDelayNumber = hasReportedValue(providerFinalDelay) && (typeof providerFinalDelay === "string" || typeof providerFinalDelay === "number")
    ? Number(providerFinalDelay)
    : Number.NaN;
  const finalDelay = Number.isFinite(providerFinalDelayNumber)
    ? providerFinalDelayNumber
    : calculatedFinalDelay;
  const finalDelayLabel = Number.isFinite(providerFinalDelayNumber)
    ? "Reported arrival delay"
    : calculatedFinalDelay !== undefined
      ? "Arrival delay (calculated)"
      : "Arrival delay";
  const finalDelayPresentation = getDelayPresentation(finalDelay);
  const finalDelayTextTone = hasReportedValue(finalDelay) && Number(finalDelay) > 0
    ? "text-amber-900"
    : hasReportedValue(finalDelay) && Number(finalDelay) < 0
      ? "text-sky-800"
      : hasReportedValue(finalDelay)
        ? "text-emerald-800"
        : "text-slate-700";
  const originStop = routeStops[0];
  const originDisplay = sourceName !== "—" ? sourceName : displayValue(originStop && pickValue(originStop, ["stationName", "name"]));
  const originCodeDisplay = sourceCode !== "—" ? sourceCode : displayValue(originStop && pickValue(originStop, ["stationCode", "code"]));
  const destinationDisplay = destinationName !== "—" ? destinationName : displayValue(finalStop && pickValue(finalStop, ["stationName", "name"]));
  const destinationCodeDisplay = destinationCode !== "—" ? destinationCode : displayValue(finalStop && pickValue(finalStop, ["stationCode", "code"]));
  const scheduledOriginDeparture = (originStop && pickValue(originStop, ["scheduledDeparture", "scheduledDepartureTime", "departureTimeScheduled"]))
    ?? (trainInfo && pickValue(trainInfo, ["scheduledDeparture", "scheduledDepartureTime", "originScheduledDeparture"]))
    ?? (record && pickValue(record, ["originScheduledDeparture", "scheduledOriginDeparture"]));
  const expectedOriginDeparture = (originStop && pickValue(originStop, ["expectedDeparture", "revisedDeparture", "predictedDeparture", "estimatedDeparture"]))
    ?? (trainInfo && pickValue(trainInfo, ["expectedDeparture", "revisedDeparture", "predictedDeparture", "estimatedDeparture"]))
    ?? (record && pickValue(record, ["originExpectedDeparture", "revisedOriginDeparture", "expectedOriginDeparture"]));
  const originDepartureDelay = (originStop && pickValue(originStop, ["delayDeparture", "departureDelayMinutes", "departureDelay"]))
    ?? (trainInfo && pickValue(trainInfo, ["departureDelayMinutes", "departureDelay"]));
  const confirmedDepartureDelay = (typeof originDepartureDelay === "string" || typeof originDepartureDelay === "number") && hasReportedValue(originDepartureDelay) && Number.isFinite(Number(originDepartureDelay))
    ? Number(originDepartureDelay)
    : null;
  const providerStatus = record ? statusText(pickValue(record, ["journeyStatus", "runningStatus", "trainStatus", "operationalStatus", "journey_state", "status"])) : "";
  const providerReportsDepartureDelay = /\b(departure delayed|delayed departure|delayed before departure)\b/.test(providerStatus);
  const departureDelayed = providerReportsDepartureDelay || (confirmedDepartureDelay !== null && confirmedDepartureDelay > 0 && (!originStop || !hasPredictedProvenance(originStop)));
  const scheduledForTomorrow = journeyState === "NOT_STARTED" && isTomorrowInIndia(journeyDate);
  const departureTimePassed = journeyState === "NOT_STARTED" && scheduledDepartureHasPassed(scheduledOriginDeparture, journeyDate);
  const preDepartureLabel = departureDelayed ? "Departure Delayed" : scheduledForTomorrow ? "Scheduled for Tomorrow" : "Not Started";
  const preDepartureTitle = departureDelayed ? "Departure Delayed" : scheduledForTomorrow ? "Scheduled for Tomorrow" : departureTimePassed ? "Departure Not Yet Confirmed" : "Train Not Started Yet";
  const preDepartureMessage = departureDelayed
    ? "The railway provider reports a delayed departure. Running updates will appear after departure is confirmed."
    : departureTimePassed
      ? "Departure has not been confirmed by the railway provider. Refresh to check for an update."
      : "This train has not departed from its originating station. Running updates will appear after departure is reported.";
  const journeyStateLabel: Record<JourneyState, string> = {
    NOT_STARTED: "Not Started",
    RUNNING: "Currently Running",
    COMPLETED: "Journey Completed",
    CANCELLED: "Cancelled",
    UNKNOWN: "Status Unavailable",
  };
  const apiJourneyDate = record && pickValue(record, ["startDate", "journeyDate", "date"]);
  const journeyDateDisplay = hasReportedValue(apiJourneyDate) ? formatLiveDate(apiJourneyDate) : journeyDate;
  const supplementalTrainFields = ([
    ["Train type", trainInfo && pickValue(trainInfo, ["type", "trainType"])],
    ["Category", trainInfo && pickValue(trainInfo, ["category"])],
    ["Distance", trainInfo && pickValue(trainInfo, ["distance"])],
    ["Duration", trainInfo && pickValue(trainInfo, ["duration"])],
    ["Average speed", trainInfo && pickValue(trainInfo, ["avgSpeed", "averageSpeed"])],
    ["Maximum speed", trainInfo && pickValue(trainInfo, ["maxSpeed"])],
    ["Total halts", trainInfo && pickValue(trainInfo, ["totalHalts"])],
    ["Operating days", trainInfo && pickValue(trainInfo, ["runDays", "runningDays"])],
    ["Coach composition", trainInfo && pickValue(trainInfo, ["coachPosition", "coachComposition"])],
    ["Provider tracking mode", record && pickValue(record, ["trackingMode"])],
    ["Provider feed live", record && pickValue(record, ["isLive"])],
    ["Previous halt", record && pickValue(record, ["previousHalt"])],
  ] as Array<[string, unknown]>).filter(([, value]) => hasReportedValue(value));

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(11,34,64,0.09)]">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-700"><TrainFront aria-hidden="true" className="h-5 w-5" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h4 className="text-base font-extrabold text-[#0b2240] sm:text-lg">{trainName !== "—" ? trainName : "Live train status"}</h4><span className="rounded-md bg-[#0b2240] px-2 py-0.5 text-[11px] font-bold text-white">{displayValue(record && pickValue(record, ["trainNumber"])) !== "—" ? displayValue(pickValue(record!, ["trainNumber"])) : trainNumber}</span></div><p className="mt-1 text-xs text-slate-600">Journey date · {journeyDateDisplay}</p></div></div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {Boolean(liveResult) && <span className={`inline-flex cursor-default items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${journeyState === "COMPLETED" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : journeyState === "CANCELLED" ? "border-rose-200 bg-rose-50 text-rose-800" : journeyState === "RUNNING" ? "border-blue-200 bg-blue-50 text-blue-800" : journeyState === "NOT_STARTED" ? "border-orange-200 bg-orange-50 text-orange-800" : "border-slate-200 bg-slate-100 text-slate-700"}`}>{journeyState === "COMPLETED" && <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />}{journeyState === "NOT_STARTED" ? preDepartureLabel : journeyStateLabel[journeyState]}</span>}
          <button type="button" onClick={() => { void checkStatus(true); }} disabled={loading || trainNumber === "—" || journeyDate === "—"} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-60 sm:text-sm">
            <TrainFront aria-hidden="true" className={`h-4 w-4 ${loading ? "motion-safe:animate-pulse" : ""}`} />
            {loading ? "Finding train…" : liveResult ? "Refresh status" : "Check live status"}
          </button>
          {Boolean(liveResult) && <button type="button" onClick={() => { setDismissed(true); setLiveResult(null); }} aria-label="Close live train status" title="Close live train status" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
            <X aria-hidden="true" className="h-4 w-4" />
          </button>}
        </div>
      </div>
      {Boolean(liveResult) && journeyState === "COMPLETED" && <section aria-label="Journey completion details" className="border-t border-emerald-100 bg-emerald-50/60 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 aria-hidden="true" className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h5 className="font-extrabold text-emerald-900">Journey Completed</h5><p className="mt-0.5 text-xs text-emerald-800">The provider reports that this train has reached its final destination.</p><p className="mt-2 break-words text-sm font-bold text-[#0b2240]">{originDisplay}{originCodeDisplay !== "—" ? ` (${originCodeDisplay})` : ""}<ArrowRight aria-hidden="true" className="mx-2 inline h-4 w-4 text-emerald-700" />{destinationDisplay}{destinationCodeDisplay !== "—" ? ` (${destinationCodeDisplay})` : ""}</p>
          <dl className="mt-3 grid gap-x-5 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-slate-500">Scheduled arrival</dt><dd className="mt-0.5 font-bold text-slate-900">{hasValidTimeValue(finalArrivalScheduled) ? formatLiveTime(finalArrivalScheduled) : "Unavailable"}</dd></div><div><dt className="text-slate-500">Actual arrival</dt><dd className="mt-0.5 font-bold text-slate-900">{hasValidTimeValue(finalArrivalActual) ? formatLiveTime(finalArrivalActual) : "Actual arrival not reported"}</dd></div><div><dt className="text-slate-500">{finalDelayLabel}</dt><dd className={`mt-0.5 font-bold ${finalDelayTextTone}`}>{hasReportedValue(finalDelay) ? finalDelayPresentation.label : "Delay not reported"}</dd></div><div><dt className="text-slate-500">Last updated</dt><dd className="mt-0.5 font-bold text-slate-900">{hasReportedValue(lastUpdated) ? formatLiveDateTime(lastUpdated) : "Unavailable"}</dd></div></dl>
        </div></div>
      </section>}
      {Boolean(liveResult) && journeyState === "NOT_STARTED" && <section aria-label="Pre-departure journey details" className="border-t border-orange-100 bg-orange-50/50 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700"><Clock3 aria-hidden="true" className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <h5 className="font-extrabold text-orange-950">{preDepartureTitle}</h5>
            <p className="mt-0.5 text-xs leading-5 text-orange-900">{preDepartureMessage}</p>
            <dl className="mt-3 grid gap-x-5 gap-y-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-slate-500">Origin</dt><dd className="mt-0.5 font-bold text-slate-900">{originDisplay}{originCodeDisplay !== "—" ? ` (${originCodeDisplay})` : ""}</dd></div>
              <div><dt className="text-slate-500">Destination</dt><dd className="mt-0.5 font-bold text-slate-900">{destinationDisplay}{destinationCodeDisplay !== "—" ? ` (${destinationCodeDisplay})` : ""}</dd></div>
              <div><dt className="text-slate-500">Scheduled departure</dt><dd className="mt-0.5 font-bold text-slate-900">{hasValidTimeValue(scheduledOriginDeparture) ? formatLiveTime(scheduledOriginDeparture) : "Not provided"}</dd></div>
              {hasValidTimeValue(expectedOriginDeparture) && <div><dt className="text-slate-500">Expected departure</dt><dd className="mt-0.5 font-bold text-slate-900">{formatLiveTime(expectedOriginDeparture)}</dd></div>}
              <div><dt className="text-slate-500">Actual departure</dt><dd className="mt-0.5 font-bold text-slate-900">Not departed yet</dd></div>
              {confirmedDepartureDelay !== null && confirmedDepartureDelay !== 0 && (providerReportsDepartureDelay || (originStop && !hasPredictedProvenance(originStop))) && <div><dt className="text-slate-500">Reported departure delay</dt><dd className="mt-0.5 font-bold text-slate-900">{getDelayPresentation(confirmedDepartureDelay).label}</dd></div>}
              {hasReportedValue(lastUpdated) && <div><dt className="text-slate-500">Last updated</dt><dd className="mt-0.5 font-bold text-slate-900">{formatLiveDateTime(lastUpdated)}</dd></div>}
            </dl>
          </div>
        </div>
      </section>}
      {Boolean(liveResult) && journeyState === "CANCELLED" && <section aria-label="Cancelled journey" className="border-t border-rose-100 bg-rose-50/60 px-4 py-4 sm:px-5"><h5 className="font-extrabold text-rose-900">Journey Cancelled</h5><p className="mt-1 text-xs leading-5 text-rose-800">The railway provider reports this journey as cancelled for the selected date. Scheduled route details remain below when available.</p></section>}
      {Boolean(liveResult) && journeyState === "UNKNOWN" && <section aria-label="Journey status unavailable" className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-5"><h5 className="font-extrabold text-slate-900">Status Unavailable</h5><p className="mt-1 text-xs leading-5 text-slate-600">The railway provider has not supplied enough confirmed information to determine whether this journey has started. Refresh to check for an update.</p></section>}
      {loading && <div role="status" className="border-t border-slate-100 px-4 py-4 sm:px-5"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="h-2 w-2 rounded-full bg-orange-500 motion-safe:animate-pulse" />Fetching the latest train position…</div><div className="h-2 motion-safe:animate-pulse rounded-full bg-slate-100"><div className="h-2 w-1/3 rounded-full bg-orange-200" /></div></div>}
      {error && <p role="alert" className="mx-4 my-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-800 sm:mx-5">{error}</p>}
      {!loading && !error && !liveResult && !dismissed && <div className="border-t border-slate-100 px-4 py-4 sm:px-5"><p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600">Check live status to see this train’s reported location, next stop, delay, and station-by-station timings.</p></div>}
      {Boolean(liveResult) && <div aria-live="polite" className="border-t border-slate-100 p-3 sm:p-5">
        {journeyState !== "NOT_STARTED" && (sourceName !== "—" || destinationName !== "—") && <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#0b2240] px-3 py-3 text-white sm:px-4"><div className="min-w-0 flex-1"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-200">From</p><p className="mt-0.5 truncate text-sm font-extrabold">{sourceName}</p>{sourceCode !== "—" && <p className="text-[10px] font-semibold text-blue-200">{sourceCode}</p>}</div><ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-orange-400" /><div className="min-w-0 flex-1 text-right"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-200">To</p><p className="mt-0.5 truncate text-sm font-extrabold">{destinationName}</p>{destinationCode !== "—" && <p className="text-[10px] font-semibold text-blue-200">{destinationCode}</p>}</div></div>}
        {journeyState !== "NOT_STARTED" && <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Journey date</p><p className="mt-1 text-sm font-extrabold text-[#0b2240]">{journeyDateDisplay}</p></div>
          {(journeyState === "RUNNING" || journeyState === "COMPLETED") && <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3"><div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-800"><MapPin aria-hidden="true" className="h-3.5 w-3.5" />{journeyState === "COMPLETED" ? "Last reported location" : "Current reported location"}</div><p className="mt-1 text-sm font-extrabold text-[#0b2240]">{currentLocationDisplay}</p>{currentStationCode !== "—" && <p className="mt-0.5 text-xs text-slate-500">{currentStationCode}</p>}{journeyState === "RUNNING" && currentSpeed !== "—" && <p className="mt-1 text-[11px] font-bold text-blue-800">{currentSpeed} km/h</p>}</div>}
          {journeyState === "RUNNING" && <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Next station</p><p className="mt-1 text-sm font-extrabold text-[#0b2240]">{nextStationName}</p>{nextStation && displayValue(pickValue(nextStation, ["stationCode", "code"])) !== "—" && <p className="mt-0.5 text-xs text-slate-500">{displayValue(pickValue(nextStation, ["stationCode", "code"]))}</p>}</div>}
          <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Train status & delay</p><div className="mt-1 flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${journeyState === "COMPLETED" || isLive ? "bg-emerald-100 text-emerald-800" : journeyState === "CANCELLED" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"}`}>{(journeyState === "COMPLETED" || isLive) && <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />}{journeyStateLabel[journeyState]}</span>{journeyState === "RUNNING" && hasReportedValue(delayMinutes) && <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${delayPresentation.classes}`}>{delayPresentation.label}</span>}</div>{hasReportedValue(lastUpdated) && <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-slate-500"><Clock3 aria-hidden="true" className="h-3 w-3" />Updated {formatLiveDateTime(lastUpdated)}</p>}</div>
        </div>}
        {routeStops.length > 0 ? <div className="mt-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-extrabold text-[#0b2240]">{journeyState === "NOT_STARTED" ? "Upcoming route" : "Journey timeline"}</h4>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500">
              {journeyState === "NOT_STARTED" ? <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full border border-slate-300 bg-white" />All stations upcoming</span> : journeyState === "COMPLETED" ? <><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" />Stop event confirmed</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full border border-slate-300 bg-white" />Event unavailable</span></> : journeyState === "RUNNING" ? <><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" />Departed</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-blue-600" />Train location</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-slate-300" />Upcoming / unknown</span></> : <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full border border-slate-300 bg-white" />Station status unconfirmed</span>}
            </div>
          </div>
          <LiveRouteTimeline route={routeStops} currentStationCode={currentStationCode} journeyState={journeyState} journeyDate={journeyDate} />
        </div> : <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">Live status was returned, but station-wise route details are not available for this train and date.</p>}
        {supplementalTrainFields.length > 0 && <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2"><summary className="cursor-pointer text-xs font-bold text-slate-700">More train information</summary><dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">{supplementalTrainFields.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-0.5 break-words text-xs font-semibold text-slate-800">{formatApiValue(value)}</dd></div>)}</dl></details>}
      </div>}
    </div>
  );
}

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
  const [trainNumber, setTrainNumber] = useState(queryTrain);
  const [journeyDate, setJourneyDate] = useState(queryDate);
  const [lookup, setLookup] = useState<LiveLookup | null>(() => (
    queryTrain && queryDate && !validateLookup(queryTrain, queryDate)
      ? { trainNumber: queryTrain, journeyDate: queryDate }
      : null
  ));
  const [lookupVersion, setLookupVersion] = useState(0);
  const [validationError, setValidationError] = useState(() => (
    queryTrain || queryDate ? validateLookup(queryTrain, queryDate) : ""
  ));

  function submitLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTrain = trainNumber.trim();
    const message = validateLookup(normalizedTrain, journeyDate);
    if (message) {
      setValidationError(message);
      setLookup(null);
      return;
    }

    const params = new URLSearchParams({ train: normalizedTrain, date: journeyDate });
    if (normalizedTrain === queryTrain && journeyDate === queryDate) {
      setValidationError("");
      setLookup({ trainNumber: normalizedTrain, journeyDate });
      setLookupVersion((version) => version + 1);
    } else {
      router.push(`/live-train-status?${params.toString()}`, { scroll: false });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900">
      <Header />
      <header className="border-b border-orange-100 bg-white">
        <div className="mx-auto flex w-full max-w-[1100px] items-center gap-3 px-4 pt-8 pb-6 sm:pt-10 sm:pb-8 lg:pt-11 lg:pb-8">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><TrainFront aria-hidden="true" className="h-5 w-5" /></span>
          <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-700">RailAgents tool</p><h1 className="text-xl font-extrabold tracking-tight text-[#0b2240] sm:text-2xl">Live Train Status</h1></div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-5 sm:py-7">
        <section aria-labelledby="live-train-search-title" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4"><h2 id="live-train-search-title" className="text-base font-extrabold text-[#0b2240]">Check a train’s running status</h2><p className="mt-1 text-xs text-slate-600">Enter the train number and the date the journey starts.</p></div>
          <form onSubmit={submitLookup} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(190px,0.8fr)_auto] sm:items-end">
            <label className="block text-xs font-semibold text-slate-700">Train number
              <input inputMode="numeric" autoComplete="off" value={trainNumber} onChange={(event) => setTrainNumber(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="e.g. 12712" className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold tracking-wide text-[#0b2240] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">Journey date
              <input type="date" value={journeyDate} onChange={(event) => setJourneyDate(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-[#0b2240] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
            </label>
            <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"><Search aria-hidden="true" className="h-4 w-4" />Check live status</button>
          </form>
          <p className="mt-2 text-[11px] text-slate-500">Journey times are shown in Indian Standard Time when provided by the railway status provider.</p>
          {validationError && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">{validationError}</p>}
        </section>
        {lookup && <LiveTrainStatusResult key={`${lookup.trainNumber}-${lookup.journeyDate}-${lookupVersion}`} trainNumber={lookup.trainNumber} journeyDate={lookup.journeyDate} />}
      </main>
      <Footer />
    </div>
  );
}


