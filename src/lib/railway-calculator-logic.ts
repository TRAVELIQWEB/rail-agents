/**
 * Indian Railways Advanced Ticket Booking Date Calculator Utility
 * Reference & Source of Truth: Official Indian Railways (IRCTC) Rules
 *
 * Rules:
 * - Standard Advance Reservation Period (ARP): 60 Days (effective Nov 1, 2024).
 * - Journey date is excluded from the ARP count: Normal Opening Date = Journey Date - 60 Days.
 * - Normal General Booking opens at 08:00 AM IST.
 * - Tatkal Booking Date = Journey Date - 1 Day.
 * - AC Tatkal opens at 10:00 AM IST.
 * - Non-AC Tatkal opens at 11:00 AM IST.
 *
 * Agent Restriction Rules:
 * - General Opening Day: Authorized agents restricted during first 10 mins (08:00 - 08:10 AM IST).
 * - AC Tatkal: Authorized agents restricted during first 30 mins (10:00 - 10:30 AM IST).
 * - Non-AC Tatkal: Authorized agents restricted during first 30 mins (11:00 - 11:30 AM IST).
 */

export interface CalendarDateParts {
  year: number;
  month: number;
  day: number;
}

export type BookingStatusType =
  | "OPEN_NOW"
  | "OPENS_TODAY"
  | "OPENS_TOMORROW"
  | "NOT_YET_OPEN"
  | "TATKAL_ONLY"
  | "JOURNEY_TODAY"
  | "JOURNEY_TOMORROW"
  | "PAST_JOURNEY";

export interface BookingStatusInfo {
  type: BookingStatusType;
  title: string;
  badgeColor: string;
  description: string;
  daysUntilJourney: number;
  daysUntilOpening: number;
  isSameDay?: boolean;
  isNearDate?: boolean;
  targetOpeningDateTime?: Date; // in IST
}

export interface AgentRestrictionInfo {
  generalRestricted: boolean;
  generalRestrictionNotice: string;
  acTatkalRestricted: boolean;
  acTatkalRestrictionNotice: string;
  nonAcTatkalRestricted: boolean;
  nonAcTatkalRestrictionNotice: string;
}

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isZero: boolean;
  formatted: string;
  isDaysAway?: boolean;
}

export interface UpcomingWindow {
  journeyDateIso: string;
  journeyDateFormatted: string;
  openingDateIso: string;
  openingDateFormatted: string;
  openingTimeText: string;
  statusText: string;
  daysUntilOpening: number;
  targetDateTime: Date;
}

export const STANDARD_ARP_DAYS = 60;

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Returns current Date object anchored to Asia/Kolkata (IST: UTC+5:30)
 */
export function getCurrentISTDateTime(): Date {
  const now = new Date();
  // Get time in UTC and shift by +5 hours 30 mins
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

/**
 * Parses and strictly validates YYYY-MM-DD
 */
export function parseCalendarDate(iso: string): CalendarDateParts | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso.trim())) return null;
  const [yStr, mStr, dStr] = iso.trim().split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1900 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const dt = new Date(year, month - 1, day);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() + 1 !== month ||
    dt.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

/**
 * Subtracts calendar days from YYYY-MM-DD
 */
export function subtractCalendarDays(iso: string, daysToSubtract: number): string {
  const parts = parseCalendarDate(iso);
  if (!parts) return iso;
  const dt = new Date(parts.year, parts.month - 1, parts.day - daysToSubtract);
  const y = String(dt.getFullYear()).padStart(4, "0");
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Adds calendar days to YYYY-MM-DD
 */
export function addCalendarDays(iso: string, daysToAdd: number): string {
  return subtractCalendarDays(iso, -daysToAdd);
}

/**
 * Formats YYYY-MM-DD into readable string: "25 December 2026 (Friday)"
 */
export function formatReadableDate(iso: string): string {
  const parts = parseCalendarDate(iso);
  if (!parts) return iso;
  const dt = new Date(parts.year, parts.month - 1, parts.day);
  const weekday = WEEKDAY_NAMES[dt.getDay()];
  const monthName = MONTH_NAMES[parts.month - 1];
  return `${parts.day} ${monthName} ${parts.year} (${weekday})`;
}

/**
 * Returns today's ISO date string in IST
 */
export function getTodayIST(): string {
  const ist = getCurrentISTDateTime();
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  const d = String(ist.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Calculates day difference (Date2 - Date1) in full calendar days
 */
export function diffCalendarDays(dateIso1: string, dateIso2: string): number {
  const p1 = parseCalendarDate(dateIso1);
  const p2 = parseCalendarDate(dateIso2);
  if (!p1 || !p2) return 0;
  const d1 = Date.UTC(p1.year, p1.month - 1, p1.day);
  const d2 = Date.UTC(p2.year, p2.month - 1, p2.day);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Gets exact Date object for a given ISO date at specified hour and minute in IST
 */
export function createISTDateTime(iso: string, hour24: number, minute: number): Date {
  const parts = parseCalendarDate(iso);
  if (!parts) return new Date();
  // Using Date.UTC to prevent host machine local timezone shifts
  // IST is UTC + 5:30 -> UTC hour = hour24 - 5.5
  const utcHours = hour24 - 5.5;
  const totalMinutes = Math.round(utcHours * 60) + minute;
  const dt = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 0, totalMinutes, 0, 0));
  return dt;
}

/**
 * Evaluates Live Booking Status by comparing journey date with current IST
 */
export function getGeneralBookingStatus(journeyDateIso: string, arpDays: number = STANDARD_ARP_DAYS): BookingStatusInfo {
  const todayIso = getTodayIST();
  const daysUntilJourney = diffCalendarDays(todayIso, journeyDateIso);
  const now = new Date(); // compared against UTC/IST millisecond instances

  // CASE 8: Journey date has passed
  if (daysUntilJourney < 0) {
    return {
      type: "PAST_JOURNEY",
      title: "JOURNEY DATE PASSED",
      badgeColor: "bg-stone-500",
      description: "The selected journey date has already passed. Advance & Tatkal reservations are closed.",
      daysUntilJourney,
      daysUntilOpening: 0,
      isSameDay: false,
      isNearDate: false,
    };
  }

  const openingDateIso = subtractCalendarDays(journeyDateIso, arpDays);
  const daysUntilOpening = diffCalendarDays(todayIso, openingDateIso);
  const openingDateTime = createISTDateTime(openingDateIso, 8, 0); // 8:00 AM IST
  const isPastOpeningInstant = now.getTime() >= openingDateTime.getTime();

  // Tatkal Dates & Opening Times (1 day before journey)
  const tatkalDateIso = subtractCalendarDays(journeyDateIso, 1);
  const acTatkalDateTime = createISTDateTime(tatkalDateIso, 10, 0); // 10:00 AM IST
  const nonAcTatkalDateTime = createISTDateTime(tatkalDateIso, 11, 0); // 11:00 AM IST
  const isPastAcTatkal = now.getTime() >= acTatkalDateTime.getTime();
  const isPastNonAcTatkal = now.getTime() >= nonAcTatkalDateTime.getTime();

  // CASE 1: Journey date is TODAY
  if (daysUntilJourney === 0) {
    return {
      type: "JOURNEY_TODAY",
      title: "JOURNEY STARTS TODAY",
      badgeColor: "bg-emerald-600",
      description: "Journey departs today. Advance & Tatkal booking windows closed. Current Booking may be available after chart preparation.",
      daysUntilJourney: 0,
      daysUntilOpening: 0,
      isSameDay: true,
      isNearDate: true,
      targetOpeningDateTime: openingDateTime,
    };
  }

  // CASE 2: Journey date is TOMORROW
  if (daysUntilJourney === 1) {
    const tatkalPassedText = isPastNonAcTatkal
      ? "Tatkal opening times passed. Check remaining quota or Current Booking after charting."
      : isPastAcTatkal
      ? "AC Tatkal opened at 10:00 AM. Non-AC Tatkal opens at 11:00 AM IST."
      : "Tatkal opens today: AC at 10:00 AM, Non-AC at 11:00 AM IST.";

    return {
      type: "JOURNEY_TOMORROW",
      title: "JOURNEY STARTS TOMORROW",
      badgeColor: "bg-amber-600",
      description: `Normal booking opened on ${formatReadableDate(openingDateIso)}. ${tatkalPassedText}`,
      daysUntilJourney: 1,
      daysUntilOpening: 0,
      isSameDay: false,
      isNearDate: true,
      targetOpeningDateTime: openingDateTime,
    };
  }

  // CASE 3: Journey is within normal booking window (opening date has passed)
  if (daysUntilOpening < 0 || (daysUntilOpening === 0 && isPastOpeningInstant)) {
    return {
      type: "OPEN_NOW",
      title: "NORMAL BOOKING: ALREADY OPEN",
      badgeColor: "bg-emerald-600",
      description: `Normal Advance Reservation opened on ${formatReadableDate(openingDateIso)} at 8:00 AM IST. Tatkal will open 1 day before journey (${formatReadableDate(tatkalDateIso)}).`,
      daysUntilJourney,
      daysUntilOpening: 0,
      isSameDay: false,
      isNearDate: daysUntilJourney <= 3,
      targetOpeningDateTime: openingDateTime,
    };
  }

  // CASE 4: Normal booking opening date is TODAY (before 8:00 AM IST)
  if (daysUntilOpening === 0 && !isPastOpeningInstant) {
    return {
      type: "OPENS_TODAY",
      title: "BOOKING OPENS TODAY",
      badgeColor: "bg-blue-600",
      description: `Normal booking opens today at 8:00 AM IST (${arpDays}-day ARP).`,
      daysUntilJourney,
      daysUntilOpening: 0,
      isSameDay: false,
      isNearDate: false,
      targetOpeningDateTime: openingDateTime,
    };
  }

  // CASE 5: Normal booking opening date is TOMORROW
  if (daysUntilOpening === 1) {
    return {
      type: "OPENS_TOMORROW",
      title: "BOOKING OPENS TOMORROW",
      badgeColor: "bg-amber-600",
      description: `Normal booking opens tomorrow (${formatReadableDate(openingDateIso)}) at 8:00 AM IST.`,
      daysUntilJourney,
      daysUntilOpening: 1,
      isSameDay: false,
      isNearDate: false,
      targetOpeningDateTime: openingDateTime,
    };
  }

  // Future window (> 1 day until opening)
  return {
    type: "NOT_YET_OPEN",
    title: "BOOKING NOT YET OPEN",
    badgeColor: "bg-stone-700",
    description: `Booking will open on ${formatReadableDate(openingDateIso)} at 8:00 AM IST (${daysUntilOpening} days remaining).`,
    daysUntilJourney,
    daysUntilOpening,
    isSameDay: false,
    isNearDate: false,
    targetOpeningDateTime: openingDateTime,
  };
}

/**
 * Calculates current Agent Booking Eligibility & Opening restrictions
 */
export function getAgentBookingEligibility(targetOpeningDateIso: string): AgentRestrictionInfo {
  const todayIso = getTodayIST();
  const isOpeningDay = todayIso === targetOpeningDateIso;
  const ist = getCurrentISTDateTime();
  const currentMinutes = ist.getHours() * 60 + ist.getMinutes();

  // General Booking: 08:00 - 08:10 restricted for agents on opening day
  const generalRestricted = isOpeningDay && currentMinutes >= 8 * 60 && currentMinutes < 8 * 60 + 10;
  const generalNotice = generalRestricted
    ? "Agents restricted (08:00 - 08:10 AM IST) on opening day. Passenger booking only."
    : isOpeningDay && currentMinutes < 8 * 60
    ? "Opens at 08:00 AM. Agents eligible after 08:10 AM IST."
    : "Authorized agents eligible.";

  // AC Tatkal: 10:00 - 10:30 restricted
  const acTatkalRestricted = isOpeningDay && currentMinutes >= 10 * 60 && currentMinutes < 10 * 60 + 30;
  const acNotice = acTatkalRestricted
    ? "Agents restricted during first 30 mins (10:00 - 10:30 AM IST). Individual passengers only."
    : "Opens 10:00 AM. Agents eligible from 10:30 AM IST.";

  // Non-AC Tatkal: 11:00 - 11:30 restricted
  const nonAcTatkalRestricted = isOpeningDay && currentMinutes >= 11 * 60 && currentMinutes < 11 * 60 + 30;
  const nonAcNotice = nonAcTatkalRestricted
    ? "Agents restricted during first 30 mins (11:00 - 11:30 AM IST). Individual passengers only."
    : "Opens 11:00 AM. Agents eligible from 11:30 AM IST.";

  return {
    generalRestricted,
    generalRestrictionNotice: generalNotice,
    acTatkalRestricted,
    acTatkalRestrictionNotice: acNotice,
    nonAcTatkalRestricted,
    nonAcTatkalRestrictionNotice: nonAcNotice,
  };
}

/**
 * Calculates Countdown (days, hours, minutes, seconds) to a target Date
 */
export function getCountdown(targetDate: Date): CountdownState {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isZero: true, formatted: "00 : 00 : 00", isDaysAway: false };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  let formatted = "";
  if (days > 0) {
    formatted = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  } else {
    formatted = `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    isZero: false,
    formatted,
    isDaysAway: days > 0,
  };
}

/**
 * Computes upcoming booking windows for the next several journey dates starting from current window edge
 */
export function getUpcomingBookingWindows(count: number = 5): UpcomingWindow[] {
  const todayIso = getTodayIST();
  const windows: UpcomingWindow[] = [];

  // Opening today / tomorrow correspond to journeys 60 days ahead
  for (let offset = 0; offset < count; offset++) {
    const openingDateIso = addCalendarDays(todayIso, offset);
    const journeyDateIso = addCalendarDays(openingDateIso, STANDARD_ARP_DAYS);
    const targetDateTime = createISTDateTime(openingDateIso, 8, 0);
    const daysUntilOpening = offset;

    let statusText = "Opens in " + offset + " days";
    if (offset === 0) statusText = "Opens Today (8:00 AM)";
    else if (offset === 1) statusText = "Opens Tomorrow (8:00 AM)";

    windows.push({
      journeyDateIso,
      journeyDateFormatted: formatReadableDate(journeyDateIso),
      openingDateIso,
      openingDateFormatted: formatReadableDate(openingDateIso),
      openingTimeText: "8:00 AM IST",
      statusText,
      daysUntilOpening,
      targetDateTime,
    });
  }

  return windows;
}

/**
 * Generates an .ics calendar file content for downloading to Apple / Google / Outlook calendar
 */
export function generateIcsCalendarContent(
  title: string,
  description: string,
  startDateTime: Date,
  durationMinutes: number = 30
): string {
  const formatDateToICS = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
  const uid = `railagents-${Date.now()}@railagents.in`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RailAgents//Railway Booking Date Reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatDateToICS(new Date())}`,
    `DTSTART:${formatDateToICS(startDateTime)}`,
    `DTEND:${formatDateToICS(endDateTime)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: IRCTC Ticket Booking Window Opens in 15 Minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

