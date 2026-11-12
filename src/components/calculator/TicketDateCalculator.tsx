"use client";

import { useState, useRef, useEffect, useMemo, useSyncExternalStore, type FormEvent } from "react";
import styles from "./TicketDateCalculator.module.css";
import { RailwayInformationAccordion } from "./RailwayInformationAccordion";
import {
  Calendar as CalendarIcon,
  Copy,
  Check,
  Share2,
  RotateCcw,
  CheckCircle2,
  Zap,
  ArrowRightLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Download,
} from "lucide-react";
import {
  getTodayIST,
  formatReadableDate,
  subtractCalendarDays,
  parseCalendarDate,
  diffCalendarDays,
  createISTDateTime,
  getGeneralBookingStatus,
  getCountdown,
  STANDARD_ARP_DAYS,
  MONTH_NAMES,
  type BookingStatusInfo,
  type CountdownState,
} from "@/lib/railway-calculator-logic";

export interface RailwayStation {
  code: string;
  name: string;
  city: string;
  state: string;
}

export function TicketDateCalculator() {
  const [fromInput, setFromInput] = useState<string>("");
  const [toInput, setToInput] = useState<string>("");
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [journeyDate, setJourneyDate] = useState<string>("");
  const bookingColumnsRef = useRef<HTMLDivElement>(null);
  const calendarSectionRef = useRef<HTMLElement>(null);
  const scheduleBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calendar = calendarSectionRef.current;
    if (!calendar) return;
    const observer = new ResizeObserver(() => {
      bookingColumnsRef.current?.style.setProperty("--booking-card-height", `${calendar.getBoundingClientRect().height}px`);
    });
    observer.observe(calendar);
    return () => observer.disconnect();
  }, []);

  // Station search states (connected to MongoDB)
  const [fromSuggestions, setFromSuggestions] = useState<RailwayStation[]>([]);
  const [toSuggestions, setToSuggestions] = useState<RailwayStation[]>([]);
  const [fromLoading, setFromLoading] = useState<boolean>(false);
  const [toLoading, setToLoading] = useState<boolean>(false);
  const [fromStationError, setFromStationError] = useState<string | null>(null);
  const [toStationError, setToStationError] = useState<string | null>(null);

  // Station dropdown states
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Calendar month view state
  const [calendarViewDate, setCalendarViewDate] = useState<{ year: number; month: number }>(() => {
    const today = parseCalendarDate(getTodayIST()) || { year: 2026, month: 11, day: 2 };
    return { year: today.year, month: today.month };
  });

  // UI feedback states
  const [copied, setCopied] = useState<boolean>(false);
  const mounted = useSyncExternalStore(() => () => { }, () => true, () => false);

  // 1-second live tick
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dropdown dismiss on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setFromOpen(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setToOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for FROM station from MongoDB
  useEffect(() => {
    if (!fromOpen) return;
    let isCancelled = false;
    const cleanQ = fromInput.replace(/\s*\([A-Z0-9]+\)\s*$/, "").trim();

    const timer = setTimeout(async () => {
      setFromLoading(true);
      try {
        const res = await fetch(`/api/stations?q=${encodeURIComponent(cleanQ)}&limit=10`, { cache: "no-store" });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        if (data.success !== true || !Array.isArray(data.stations)) throw new Error("Invalid station search response");
        if (!isCancelled) {
          setFromSuggestions(
            data.stations.map((s: { stationCode: string; stationName: string }) => ({
              code: s.stationCode,
              name: s.stationName,
              city: "",
              state: "",
            }))
          );
          setFromStationError(null);
        }
      } catch (err) {
        console.error("From station search error:", err);
        if (!isCancelled) {
          setFromSuggestions([]);
          setFromStationError("Search is temporarily unavailable. You can still enter station manually.");
        }
      } finally {
        if (!isCancelled) setFromLoading(false);
      }
    }, 180);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [fromInput, fromOpen]);

  // Debounced search for TO station from MongoDB
  useEffect(() => {
    if (!toOpen) return;
    let isCancelled = false;
    const cleanQ = toInput.replace(/\s*\([A-Z0-9]+\)\s*$/, "").trim();

    const timer = setTimeout(async () => {
      setToLoading(true);
      try {
        const res = await fetch(`/api/stations?q=${encodeURIComponent(cleanQ)}&limit=10`, { cache: "no-store" });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        if (data.success !== true || !Array.isArray(data.stations)) throw new Error("Invalid station search response");
        if (!isCancelled) {
          setToSuggestions(
            data.stations.map((s: { stationCode: string; stationName: string }) => ({
              code: s.stationCode,
              name: s.stationName,
              city: "",
              state: "",
            }))
          );
          setToStationError(null);
        }
      } catch (err) {
        console.error("To station search error:", err);
        if (!isCancelled) {
          setToSuggestions([]);
          setToStationError("Search is temporarily unavailable. You can still enter station manually.");
        }
      } finally {
        if (!isCancelled) setToLoading(false);
      }
    }, 180);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [toInput, toOpen]);

  const extractCode = (str: string): string => {
    const match = str.match(/\(([A-Z0-9]+)\)/);
    if (match) return match[1];
    return str.trim().toUpperCase();
  };


  const handleSwapStations = () => {
    const temp = fromInput;
    setFromInput(toInput);
    setToInput(temp);
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const handleJourneyDateChange = (dateIso: string) => {
    const parsedDate = parseCalendarDate(dateIso);

    setJourneyDate(dateIso);
    if (parsedDate) {
      setCalendarViewDate({ year: parsedDate.year, month: parsedDate.month });
    }
  };

  const handleReset = () => {
    setFromInput("");
    setToInput("");
    setFromCode("");
    setToCode("");
    setFromSuggestions([]);
    setToSuggestions([]);
    setFromOpen(false);
    setToOpen(false);
    setFromStationError(null);
    setToStationError(null);
    setJourneyDate("");
    const today = parseCalendarDate(getTodayIST());
    if (today) {
      setCalendarViewDate({ year: today.year, month: today.month });
    }
  };

  // ── Calculated Booking Data ──
  const hasJourneyDate = Boolean(journeyDate && journeyDate.trim().length === 10);
  const hasValidJourneyDate = Boolean(parseCalendarDate(journeyDate));
  const hasFromStation = Boolean(fromInput.trim());
  const hasToStation = Boolean(toInput.trim() && (toCode || extractCode(toInput)) !== (fromCode || extractCode(fromInput)));
  const canShowSchedule = hasFromStation && hasToStation && hasValidJourneyDate;

  useEffect(() => {
    scheduleBodyRef.current?.scrollTo({ top: 0 });
  }, [canShowSchedule, journeyDate]);

  const normalBookingDateIso = useMemo(() => {
    if (!hasJourneyDate) return "";
    return subtractCalendarDays(journeyDate, STANDARD_ARP_DAYS);
  }, [journeyDate, hasJourneyDate]);

  const tatkalBookingDateIso = useMemo(() => {
    if (!hasJourneyDate) return "";
    return subtractCalendarDays(journeyDate, 1);
  }, [journeyDate, hasJourneyDate]);

  const bookingStatus: BookingStatusInfo | null = useMemo(() => {
    if (!hasJourneyDate) return null;
    return getGeneralBookingStatus(journeyDate, STANDARD_ARP_DAYS);
  }, [journeyDate, hasJourneyDate]);

  // General Booking Countdown (to 8:00 AM IST on opening date)
  const generalCountdown: CountdownState = useMemo(() => {
    if (!normalBookingDateIso) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isZero: false, formatted: "-- : -- : --" };
    }
    const target = createISTDateTime(normalBookingDateIso, 8, 0);
    return getCountdown(target);
  }, [normalBookingDateIso]);

  // AC Tatkal Countdown (to 10:00 AM IST on Tatkal date)
  const acTatkalCountdown: CountdownState = useMemo(() => {
    if (!tatkalBookingDateIso) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isZero: false, formatted: "-- : -- : --" };
    }
    const target = createISTDateTime(tatkalBookingDateIso, 10, 0);
    return getCountdown(target);
  }, [tatkalBookingDateIso]);

  // Non-AC Tatkal Countdown (to 11:00 AM IST on Tatkal date)
  const nonAcTatkalCountdown: CountdownState = useMemo(() => {
    if (!tatkalBookingDateIso) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isZero: false, formatted: "-- : -- : --" };
    }
    const target = createISTDateTime(tatkalBookingDateIso, 11, 0);
    return getCountdown(target);
  }, [tatkalBookingDateIso]);

  // ── Monthly Calendar Matrix ──
  const calendarDays = useMemo(() => {
    const { year, month } = calendarViewDate;
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month, 0).getDate();
    const todayIso = getTodayIST();

    const days: Array<{
      dateIso: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      status: "OPEN" | "OPENS_SOON" | "TATKAL" | "FUTURE" | "PAST";
      isSelected: boolean;
      openingIso: string;
      openingFormatted: string;
    }> = [];

    // Empty offset days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dateIso: "",
        dayNumber: 0,
        isCurrentMonth: false,
        status: "PAST",
        isSelected: false,
        openingIso: "",
        openingFormatted: "",
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = String(d).padStart(2, "0");
      const mStr = String(month).padStart(2, "0");
      const iso = `${year}-${mStr}-${dStr}`;

      const daysUntilJourney = diffCalendarDays(todayIso, iso);
      const openingIso = subtractCalendarDays(iso, STANDARD_ARP_DAYS);
      const daysUntilOpening = diffCalendarDays(todayIso, openingIso);
      const openingFormatted = formatReadableDate(openingIso);

      let status: "OPEN" | "OPENS_SOON" | "TATKAL" | "FUTURE" | "PAST" = "FUTURE";
      if (daysUntilJourney < 0) {
        status = "PAST";
      } else if (daysUntilJourney <= 1) {
        status = "TATKAL";
      } else if (daysUntilOpening <= 0) {
        status = "OPEN";
      } else if (daysUntilOpening <= 2) {
        status = "OPENS_SOON";
      } else {
        status = "FUTURE";
      }

      days.push({
        dateIso: iso,
        dayNumber: d,
        isCurrentMonth: true,
        status,
        isSelected: iso === journeyDate,
        openingIso,
        openingFormatted,
      });
    }

    return days;
  }, [calendarViewDate, journeyDate]);

  const handlePrevMonth = () => {
    setCalendarViewDate((prev) => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCalendarViewDate((prev) => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Download .ics reminder file
  const handleDownloadIcs = () => {
    if (!hasJourneyDate || !normalBookingDateIso) return;
    const openingDateTime = createISTDateTime(normalBookingDateIso, 8, 0);
    const fromLabel = fromInput.trim() || "Origin";
    const toLabel = toInput.trim() || "Destination";
    const title = `IRCTC Booking Opens: ${fromLabel} to ${toLabel}`;
    const desc = `IRCTC Normal General Booking opens at 8:00 AM IST for your journey on ${formatReadableDate(journeyDate)}. Prepared by RailAgents.in`;
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//RailAgents//Railway Booking Date Reminder//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:railagents-${Date.now()}@railagents.in`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${openingDateTime.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTEND:${new Date(openingDateTime.getTime() + 30 * 60000).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc.replace(/\n/g, "\\n")}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder: IRCTC Ticket Booking Window Opens in 15 Minutes",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `IRCTC_Booking_Reminder_${normalBookingDateIso}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    if (!hasJourneyDate || !bookingStatus) return;
    const fromLabel = fromInput.trim() || "Origin";
    const toLabel = toInput.trim() || "Destination";
    const text = encodeURIComponent(
      `🚂 *IRCTC Ticket Booking Date Schedule*\n` +
      `• Route: ${fromLabel} ➔ ${toLabel}\n` +
      `• Journey Date: ${formatReadableDate(journeyDate)}\n` +
      `• Normal Booking (60 Days): *${formatReadableDate(normalBookingDateIso)} at 8:00 AM IST*\n` +
      `• Tatkal Booking: *${formatReadableDate(tatkalBookingDateIso)}* (AC: 10:00 AM | Non-AC: 11:00 AM)\n` +
      `• Status: ${bookingStatus.title}\n` +
      `Calculated on RailAgents.in`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className={`${styles.calculator} site-tool-container space-y-4`}>

      {/* ══════════════════════════════════════════════════════════════════════
          2. RAILWAY JOURNEY DETAILS FORM
         ══════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="journey-details-heading">
        <div className="rounded-2xl bg-white p-3.5 sm:p-4 shadow-[0_4px_24px_rgba(15,39,71,0.07)]">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
              <h2
                id="journey-details-heading"
                className="type-section-compact  tracking-wide text-[#0b2240]"
              >
                Railway Journey Details
              </h2>
            </div>
            <span className="type-caption  font-semibold text-stone-500">
              60-day advance reservation
            </span>
          </div>

          <form
            onSubmit={(e: FormEvent) => e.preventDefault()}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            {/* FROM FIELD */}
            <div className="sm:col-span-1 md:col-span-4 relative" ref={fromRef}>
              <label htmlFor="journey-from" className="type-label block font-bold text-stone-800 mb-1">
                From Station
              </label>
              <div className="relative">
                <input
                  id="journey-from"
                  type="text"
                  autoComplete="off"
                  value={fromInput}
                  onFocus={() => {
                    setFromOpen(true);
                    setToOpen(false);
                  }}
                  onChange={(e) => {
                    setFromInput(e.target.value);
                    setFromCode("");
                    setFromSuggestions([]);
                    setFromStationError(null);
                    setFromOpen(true);
                  }}
                  placeholder="Enter origin station"
                  className="type-input w-full min-w-0 h-11 rounded-xl border border-stone-200 bg-[#faf8f5] px-3 pr-8 font-medium text-stone-900 transition-colors hover:border-orange-300 focus:border-orange-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setFromOpen((prev) => !prev)}
                  className="type-button absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-stone-600 hover:text-stone-800"
                  aria-label="Toggle from station list"
                >
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${fromOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {fromOpen && (
                <div className="absolute left-0 top-[102%] z-50 w-full sm:w-72 max-h-56 overflow-y-auto rounded-lg border border-stone-200 bg-white p-1.5 shadow-xl">
                  <div className="type-caption px-2 py-1 font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1 flex items-center justify-between">
                    <span>{fromInput.trim() ? "Search Results" : "Top Railway Stations"}</span>
                    {fromLoading && <span className="type-caption  text-orange-600 font-semibold animate-pulse">Searching...</span>}
                  </div>
                  {fromLoading && fromSuggestions.length === 0 ? (
                    <div className="type-caption px-3 py-4 text-center text-stone-500">
                      Searching stations...
                    </div>
                  ) : fromStationError && fromSuggestions.length === 0 ? (
                    <div className="type-caption px-3 py-3 text-center text-rose-600">
                      {fromStationError}
                    </div>
                  ) : fromSuggestions.length === 0 ? (
                    <div className="type-caption px-3 py-4 text-center text-stone-500">
                      No matching stations found.
                    </div>
                  ) : (
                    fromSuggestions.map((stn) => {
                      const isSameAsTo = extractCode(toInput) === stn.code;
                      return (
                        <button
                          key={stn.code}
                          type="button"
                          disabled={isSameAsTo}
                          onClick={() => {
                            if (isSameAsTo) return;
                            setFromInput(`${stn.name} (${stn.code})`);
                            setFromCode(stn.code);
                            setFromOpen(false);
                          }}
                          className={`type-button w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${isSameAsTo
                            ? "opacity-40 cursor-not-allowed bg-stone-50"
                            : "hover:bg-orange-50 group cursor-pointer"
                            }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className={`font-bold block truncate ${isSameAsTo ? "text-stone-400" : "text-stone-900 group-hover:text-orange-700"}`}>
                              {stn.name}
                            </span>
                            <span className="type-caption  text-stone-500">
                              {isSameAsTo ? "Already selected as To" : "Indian Railways"}
                            </span>
                          </div>
                          <span className="type-caption shrink-0 font-mono font-extrabold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 group-hover:bg-orange-200 group-hover:text-orange-900">
                            {stn.code}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* SWAP BUTTON */}
            <div className="flex md:col-span-1 justify-center items-center py-0.5 sm:py-0 md:pb-1">
              <button
                type="button"
                onClick={handleSwapStations}
                title="Swap Stations"
                className="type-button h-11 w-11 rounded-full border border-stone-200 text-stone-500 hover:text-orange-600 hover:border-orange-300 flex items-center justify-center transition-colors cursor-pointer bg-white shadow-2xs rotate-90 md:rotate-0"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* TO FIELD */}
            <div className="sm:col-span-1 md:col-span-4 relative" ref={toRef}>
              <label htmlFor="journey-to" className="type-label block font-bold text-stone-800 mb-1">
                To Station
              </label>
              <div className="relative">
                <input
                  id="journey-to"
                  type="text"
                  autoComplete="off"
                  value={toInput}
                  onFocus={() => {
                    setToOpen(true);
                    setFromOpen(false);
                  }}
                  onChange={(e) => {
                    setToInput(e.target.value);
                    setToCode("");
                    setToSuggestions([]);
                    setToStationError(null);
                    setToOpen(true);
                  }}
                  placeholder="Enter destination station"
                  className="type-input w-full min-w-0 h-11 rounded-xl border border-stone-200 bg-[#faf8f5] px-3 pr-8 font-medium text-stone-900 transition-colors hover:border-orange-300 focus:border-orange-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setToOpen((prev) => !prev)}
                  className="type-button absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-stone-600 hover:text-stone-800"
                  aria-label="Toggle to station list"
                >
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${toOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {toOpen && (
                <div className="absolute right-0 top-[102%] z-50 w-full sm:w-72 max-h-56 overflow-y-auto rounded-lg border border-stone-200 bg-white p-1.5 shadow-xl">
                  <div className="type-caption px-2 py-1 font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1 flex items-center justify-between">
                    <span>{toInput.trim() ? "Search Results" : "Top Railway Stations"}</span>
                    {toLoading && <span className="type-caption  text-orange-600 font-semibold animate-pulse">Searching...</span>}
                  </div>
                  {toLoading && toSuggestions.length === 0 ? (
                    <div className="type-caption px-3 py-4 text-center text-stone-500">
                      Searching stations...
                    </div>
                  ) : toStationError && toSuggestions.length === 0 ? (
                    <div className="type-caption px-3 py-3 text-center text-rose-600">
                      {toStationError}
                    </div>
                  ) : toSuggestions.length === 0 ? (
                    <div className="type-caption px-3 py-4 text-center text-stone-500">
                      No matching stations found.
                    </div>
                  ) : (
                    toSuggestions.map((stn) => {
                      const isSameAsFrom = extractCode(fromInput) === stn.code;
                      return (
                        <button
                          key={stn.code}
                          type="button"
                          disabled={isSameAsFrom}
                          onClick={() => {
                            if (isSameAsFrom) return;
                            setToInput(`${stn.name} (${stn.code})`);
                            setToCode(stn.code);
                            setToOpen(false);
                          }}
                          className={`type-button w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${isSameAsFrom
                            ? "opacity-40 cursor-not-allowed bg-stone-50"
                            : "hover:bg-orange-50 group cursor-pointer"
                            }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className={`font-bold block truncate ${isSameAsFrom ? "text-stone-400" : "text-stone-900 group-hover:text-orange-700"}`}>
                              {stn.name}
                            </span>
                            <span className="type-caption  text-stone-500">
                              {isSameAsFrom ? "Already selected as From" : "Indian Railways"}
                            </span>
                          </div>
                          <span className="type-caption shrink-0 font-mono font-extrabold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 group-hover:bg-orange-200 group-hover:text-orange-900">
                            {stn.code}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* JOURNEY DATE */}
            <div className="sm:col-span-1 md:col-span-3">
              <label htmlFor="journey-date" className="type-label block font-bold text-stone-800 mb-1">
                Journey Date
              </label>
              <input
                id="journey-date"
                type="date"
                value={journeyDate}
                onChange={(e) => handleJourneyDateChange(e.target.value)}
                className="type-input w-full min-w-0 h-11 rounded-xl border border-stone-200 bg-[#faf8f5] px-3 font-medium text-stone-900 transition-colors hover:border-orange-300 focus:border-orange-500 focus:bg-white focus:outline-none cursor-pointer"
              />
            </div>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3 & 4. TWO-COLUMN INTERACTIVE ROW: CALENDAR (LEFT) + SCHEDULE (RIGHT)
         ══════════════════════════════════════════════════════════════════════ */}
      <div ref={bookingColumnsRef} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: BOOKING CALENDAR */}
        <div className="lg:col-span-5 flex flex-col">
          {/* ══════════════════════════════════════════════════════════════════════
          4. BOOKING CALENDAR
         ══════════════════════════════════════════════════════════════════════ */}
          <section ref={calendarSectionRef} aria-labelledby="booking-calendar-heading" className="flex flex-col">
            <div className="rounded-2xl bg-white p-3.5 sm:p-4 shadow-[0_4px_24px_rgba(15,39,71,0.07)] flex-1 flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-orange-600" />
                  <h3
                    id="booking-calendar-heading"
                    className="type-h3  tracking-wide text-[#0b2240]"
                  >
                    Booking Calendar
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="type-button p-2 rounded-lg hover:bg-stone-100 text-stone-600 cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="type-caption  font-extrabold text-stone-900 min-w-[110px] text-center">
                    {MONTH_NAMES[calendarViewDate.month - 1]} {calendarViewDate.year}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="type-button p-2 rounded-lg hover:bg-stone-100 text-stone-600 cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Day Names Header */}
              <div className="type-caption grid grid-cols-7 gap-1.5 text-center font-bold text-stone-400 py-1 border-b border-stone-100">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Calendar Grid Matrix */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
                {calendarDays.map((item, idx) => {
                  if (!item.isCurrentMonth) {
                    return <div key={`empty-${idx}`} className="h-11 lg:h-10" />;
                  }

                  let colorClasses = "hover:bg-stone-100 text-stone-800";
                  if (item.status === "OPEN") {
                    colorClasses = "bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/80 font-bold";
                  } else if (item.status === "OPENS_SOON") {
                    colorClasses = "bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200/80 font-bold";
                  } else if (item.status === "TATKAL") {
                    colorClasses = "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 font-bold";
                  } else if (item.status === "PAST") {
                    colorClasses = "text-stone-300 cursor-not-allowed";
                  }

                  if (item.isSelected) {
                    colorClasses = "bg-orange-500 text-white font-bold shadow-sm ring-2 ring-orange-300";
                  }

                  return (
                    <div key={item.dateIso} className="relative group/day h-11 lg:h-10">
                      <button
                        type="button"
                        disabled={item.status === "PAST"}
                        onClick={() => {
                          handleJourneyDateChange(item.dateIso);
                        }}
                        aria-label={`${item.dayNumber} ${MONTH_NAMES[calendarViewDate.month - 1]} ${calendarViewDate.year}`}
                        aria-pressed={item.isSelected}
                        className={`type-button w-full h-full rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${colorClasses}`}
                      >
                        <span>{item.dayNumber}</span>
                      </button>

                      {/* Tooltip on Hover */}
                      {item.status !== "PAST" && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/day:flex flex-col items-center z-50 w-44">
                          <div className="rounded-xl bg-[#0b2240] px-3 py-2 text-white shadow-xl border border-[#1e3a5f] text-center w-full">
                            <span className="type-caption  text-stone-300 block font-medium leading-none">
                              Booking opens on:
                            </span>
                            <strong className="type-caption  font-bold block text-white mt-1 leading-snug">
                              {item.openingFormatted.includes("(")
                                ? `${item.openingFormatted.split("(")[1].replace(")", "")}, ${item.openingFormatted.split(" (")[0]}`
                                : item.openingFormatted}
                            </strong>
                            <div className="type-body-small  mt-1">🗓️</div>
                          </div>
                          <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#0b2240]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Calendar Legend (Single Appearance) */}
              <div className="type-caption mt-1 pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-stone-600">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>General Open</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Opens Today/Tomorrow</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Tatkal Active</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-stone-300" />
                  <span>Past Date</span>
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: YOUR BOOKING SCHEDULE */}
        <div className="lg:col-span-7 flex flex-col">
          {/* ══════════════════════════════════════════════════════════════════════
          3. YOUR BOOKING SCHEDULE (MERGED ALL RESULTS IN ONE PLACE)
         ══════════════════════════════════════════════════════════════════════ */}
          <section aria-labelledby="booking-schedule-heading" className="flex flex-col">
            <div className={`${styles.scheduleCard} rounded-2xl bg-white p-3.5 sm:p-4 shadow-[0_4px_24px_rgba(15,39,71,0.07)] flex flex-col gap-3`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-stone-100 gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  <h2
                    id="booking-schedule-heading"
                    className="type-section-compact  tracking-wide text-[#0b2240]"
                  >
                    Your Booking Schedule
                  </h2>
                </div>
                {canShowSchedule && bookingStatus && (
                  <span className={`type-caption px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-white ${bookingStatus.badgeColor}`}>
                    {bookingStatus.title}
                  </span>
                )}
              </div>

              <div ref={scheduleBodyRef} className={styles.scheduleBody} tabIndex={0} role="region" aria-label="Booking schedule details">
              {canShowSchedule && bookingStatus ? (
                <div className="flex-1 flex flex-col justify-between gap-2.5">
                  {/* NORMAL BOOKING RESULT CARD */}
                  <div className="rounded-xl bg-gradient-to-br from-[#0b2240] to-[#163c60] p-4 text-white shadow-sm border border-[#1e3a5f]">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                          <span className="type-caption  font-semibold tracking-wide text-sky-200">
                            Normal Advance Reservation (60-Day ARP)
                          </span>
                          <span className="type-caption  font-semibold bg-white/10 px-2 py-0.5 rounded text-stone-300">
                            8:00 AM IST
                          </span>
                        </div>

                        <div className="type-result mt-3 font-bold tracking-tight text-white">
                          {formatReadableDate(normalBookingDateIso)}
                        </div>

                        <p className="type-body-small mt-0.5 text-stone-300">
                          Calculated as Journey Date minus 60 calendar days (journey date excluded).
                        </p>
                      </div>

                      {/* Single General Countdown (Only shown when opening is in future) */}
                      <div className="shrink-0 text-left md:text-right">
                        {generalCountdown.isZero ? (
                          <span className="type-caption inline-block px-3 py-1 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold tracking-wide">
                            ALREADY OPEN
                          </span>
                        ) : (
                          <div className="p-2 rounded-lg bg-white/10 border border-white/10">
                            <span className="type-caption block uppercase font-bold text-cyan-300 tracking-wider">
                              Opening Countdown:
                            </span>
                            <span className="type-body  font-mono font-bold text-cyan-200 block mt-0.5">
                              {mounted ? generalCountdown.formatted : "-- : -- : --"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TATKAL RESULTS: SIDE-BY-SIDE (AC & NON-AC) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {/* AC TATKAL */}
                    <div className="rounded-xl bg-slate-50/80 p-4 border border-stone-200 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="type-caption  font-extrabold uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-amber-600" />
                            AC Tatkal
                          </span>
                          <span className="type-caption  font-bold text-stone-500">10:00 AM IST</span>
                        </div>

                        <div className="type-body-small  font-bold text-stone-900">
                          {formatReadableDate(tatkalBookingDateIso)}
                        </div>

                        <div className="type-caption  text-stone-600">
                          Applicable classes: <strong>1A, 2A, 3A, 3E, CC, EC</strong>
                        </div>
                      </div>

                      <div className="type-caption pt-1.5 mt-1.5 border-t border-stone-200/80 flex items-center justify-between ">
                        <span className="text-stone-500 font-medium">Status:</span>
                        {acTatkalCountdown.isZero ? (
                          <span className="font-bold text-stone-600">Opening Time Passed</span>
                        ) : acTatkalCountdown.days === 0 ? (
                          <span className="font-mono font-bold text-amber-700">Opens Today at 10 AM</span>
                        ) : (
                          <span className="font-semibold text-stone-600">Opens 1 Day Prior</span>
                        )}
                      </div>
                    </div>

                    {/* NON-AC TATKAL */}
                    <div className="rounded-xl bg-slate-50/80 p-4 border border-stone-200 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="type-caption  font-extrabold uppercase tracking-wide text-orange-900 flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-orange-600" />
                            Non-AC Tatkal
                          </span>
                          <span className="type-caption  font-bold text-stone-500">11:00 AM IST</span>
                        </div>

                        <div className="type-body-small  font-bold text-stone-900">
                          {formatReadableDate(tatkalBookingDateIso)}
                        </div>

                        <div className="type-caption  text-stone-600">
                          Applicable classes: <strong>SL, 2S</strong>
                        </div>
                      </div>

                      <div className="type-caption pt-1.5 mt-1.5 border-t border-stone-200/80 flex items-center justify-between ">
                        <span className="text-stone-500 font-medium">Status:</span>
                        {nonAcTatkalCountdown.isZero ? (
                          <span className="font-bold text-stone-600">Opening Time Passed</span>
                        ) : nonAcTatkalCountdown.days === 0 ? (
                          <span className="font-mono font-bold text-orange-700">Opens Today at 11 AM</span>
                        ) : (
                          <span className="font-semibold text-stone-600">Opens 1 Day Prior</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CURRENT BOOKING NOTICE (ONLY FOR SAME-DAY OR NEAR-DATE JOURNEYS) */}
                  {(bookingStatus.isSameDay || bookingStatus.isNearDate) && (
                    <div className="type-caption rounded-lg bg-amber-50/70 border border-amber-200/80 p-2.5 text-stone-800">
                      <div className="flex items-start gap-2">
                        <span className="type-caption p-0.5 rounded bg-amber-200/80 text-amber-900 font-bold ">
                          Current Booking
                        </span>
                        <p className="type-body  text-stone-700 leading-relaxed">
                          After chart preparation (typically 4 hours before departure), IRCTC opens Current Booking for vacant confirmed accommodation at normal ticket fare without Tatkal charges, subject to train availability.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* COMPACT AUTHORISED AGENT RESTRICTIONS STRIP */}
                  <div className="type-caption rounded-lg bg-[#faf8f5] border border-stone-200 px-3 py-2 text-stone-700 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-stone-900">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>Authorised Agent Restrictions:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-stone-600">
                      <span>General: <strong>8:00–8:10 AM</strong></span>
                      <span>•</span>
                      <span>AC Tatkal: <strong>10:00–10:30 AM</strong></span>
                      <span>•</span>
                      <span>Non-AC Tatkal: <strong>11:00–11:30 AM</strong></span>
                    </div>
                  </div>

                  {/* SINGLE COMPACT ACTION ROW */}
                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          const text = `🚂 IRCTC Ticket Booking Schedule\nJourney Date: ${formatReadableDate(journeyDate)}\nNormal Booking (60 Days): ${formatReadableDate(normalBookingDateIso)} at 8:00 AM IST\nTatkal: ${formatReadableDate(tatkalBookingDateIso)} (AC: 10 AM | Non-AC: 11 AM)\nVia RailAgents.in`;
                          await navigator.clipboard.writeText(text);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="type-button h-11 px-2.5 rounded-lg border border-stone-200 bg-white font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-stone-500" />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleWhatsAppShare}
                        className="type-button h-11 px-2.5 rounded-lg border border-emerald-300 bg-emerald-50 font-bold text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Share2 className="h-3 w-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadIcs}
                        className="type-button h-11 px-2.5 rounded-lg border border-stone-200 bg-white font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Download .ics Calendar Event"
                      >
                        <Download className="h-3 w-3 text-stone-500" />
                        <span>Add to Calendar</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="type-button h-11 px-2.5 rounded-lg border border-stone-200 bg-white font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <RotateCcw className="h-3 w-3 text-stone-500" />
                        <span>Reset</span>
                      </button>

                      <a
                        href="https://www.irctc.co.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="type-caption h-11 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 font-bold text-white transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>Book on IRCTC</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div aria-label="How to check your booking date" className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/70 to-white p-4">
                  <h3 className="type-h3  text-[#0b2240]">Check your booking date in 3 steps</h3>
                  <p className="type-body-small mt-1 leading-5 text-stone-600">Complete all three details above. Your booking schedule will appear here automatically.</p>
                  <ol className="mt-3 space-y-2">
                    {[
                      { title: "Select your From station", detail: "Choose your origin from the suggestions or enter it manually.", done: hasFromStation },
                      { title: "Select your To station", detail: "Choose or enter a different destination station.", done: hasToStation },
                      { title: "Choose your journey date", detail: "Enter the date above or pick a date in the calendar.", done: hasValidJourneyDate },
                    ].map((step, index) => (
                      <li key={step.title} className={`flex items-start gap-3 rounded-lg border p-2.5 ${step.done ? "border-emerald-100 bg-emerald-50/60" : "border-slate-200 bg-white"}`}>
                        <span className={`type-caption flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold ${step.done ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800"}`}>
                          {step.done ? <Check aria-label="Completed" className="h-3.5 w-3.5" /> : index + 1}
                        </span>
                        <div><p className="type-body  font-bold text-[#0b2240]">{step.title}</p><p className="type-body-small mt-0.5 leading-4 text-stone-600">{step.detail}</p></div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          5. IMPORTANT BOOKING RULES & 6. FREQUENTLY ASKED QUESTIONS
         ══════════════════════════════════════════════════════════════════════ */}
      <RailwayInformationAccordion />
    </div>
  );
}
