"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  Search,
  TrainFront,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Share2,
  RotateCcw,
  ChevronDown,
  AlertCircle,
  Info,
  ArrowRight,
  Radio,
  ShieldCheck,
  HelpCircle,
  X,
} from "lucide-react";
import { getTodayIST, addCalendarDays } from "@/lib/railway-calculator-logic";
import type { TrainChartingResponse, TrainChartStation } from "@/lib/trains";

interface TrainSuggestion {
  trainNumber: string;
  trainName: string;
}

const CHARTING_FAQS = [
  {
    q: "When is the first reservation chart prepared in Indian Railways?",
    a: "According to IRCTC and Indian Railways PRS rules, the First Reservation Chart is typically prepared 8 to 10 hours before the scheduled departure of the train from its originating or remote charting station. For morning trains departing between 05:00 AM and 02:00 PM, the first chart is usually prepared the previous night between 08:00 PM and 09:00 PM.",
  },
  {
    q: "What is the Second (Final) Reservation Chart and when is it prepared?",
    a: "The Second (Final) Chart is prepared approximately 30 minutes (ranging from 15 to 30 minutes) before the scheduled departure of the train. It accounts for Current Booking tickets, last-minute cancellations, and final upgrades for RAC or waitlisted passengers.",
  },
  {
    q: "What does 'Remote Charting Station' mean for intermediate boarding stations?",
    a: "Large trains divide their route into multiple remote charting zones (quotas). If your boarding station is a smaller halt (for example, Borivali on train 12952), its reservation chart is prepared along with its parent Remote Charting Station (Surat). Therefore, the chart for Borivali is finalized at the exact same time as Surat's chart.",
  },
  {
    q: "When does IRCTC Current Booking open for vacant seats?",
    a: "Current Booking opens immediately after the First Reservation Chart is prepared and remains open up to 5–10 minutes before the Second (Final) Chart is prepared (typically 30 minutes before train departure).",
  },
  {
    q: "What happens to Waitlisted (WL) e-tickets after chart preparation?",
    a: "If all passengers on an IRCTC e-ticket remain fully waitlisted (GNWL/RLWL/PQWL/TQWL) after the chart is prepared for their boarding station, the ticket is automatically cancelled by IRCTC and the refund (minus clerkage) is credited back to the booking account.",
  },
];

/**
 * Converts 24-hour "HH:mm" string to readable "hh:mm AM/PM"
 */
function formatTime12Hour(time24: string | null | undefined): string {
  if (!time24 || !time24.includes(":")) return "—";
  const [hStr, mStr] = time24.trim().split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time24;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Formats an ISO date-time string like "2026-11-03T08:55:00.000+05:30" into a readable IST string
 */
function formatIsoDateTimeIST(iso: string | null | undefined): {
  dateLabel: string;
  time12: string;
  fullLabel: string;
} | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const dateLabel = d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  });
  const time12 = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return {
    dateLabel,
    time12: time12.toUpperCase(),
    fullLabel: `${dateLabel} • ${time12.toUpperCase()} IST`,
  };
}

/**
 * Formats day offset (-1, 0, +1, etc.) relative to journey origin date
 */
function getDayOffsetBadge(offset: number | null): {
  label: string;
  className: string;
} {
  if (offset === null || offset === undefined) {
    return {
      label: "Before Departure",
      className: "bg-stone-100 text-stone-600 border-stone-200",
    };
  }
  if (offset < 0) {
    return {
      label: offset === -1 ? "Prev Night (-1 Day)" : `${offset} Days (Prior)`,
      className: "bg-purple-50 text-purple-800 border-purple-200",
    };
  }
  if (offset === 0) {
    return {
      label: "Origin Day (Day 1)",
      className: "bg-blue-50 text-blue-800 border-blue-200",
    };
  }
  return {
    label: `Day +${offset} (Day ${offset + 1})`,
    className: "bg-amber-50 text-amber-800 border-amber-200",
  };
}

/**
 * Calculates live status and countdown from current time to chart ISO timestamp
 */
function getChartLiveStatus(iso: string | null | undefined): {
  isPrepared: boolean;
  label: string;
  countdownText: string | null;
} {
  if (!iso) {
    return {
      isPrepared: false,
      label: "~30m Before Dep",
      countdownText: null,
    };
  }
  const targetMs = new Date(iso).getTime();
  if (Number.isNaN(targetMs)) {
    return {
      isPrepared: false,
      label: "Scheduled",
      countdownText: null,
    };
  }

  const diffMs = targetMs - Date.now();
  if (diffMs <= 0) {
    return {
      isPrepared: true,
      label: "Chart Prepared",
      countdownText: null,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let countdownText = "";
  if (days > 0) {
    countdownText = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    countdownText = `${hours}h ${minutes}m ${seconds}s`;
  } else {
    countdownText = `${minutes}m ${seconds}s`;
  }

  return {
    isPrepared: false,
    label: "Upcoming",
    countdownText,
  };
}

function getScheduleStatus(iso: string | null | undefined): {
  state: "pending" | "elapsed" | "unknown";
  label: string;
  countdownText: string | null;
} {
  if (!iso) return { state: "unknown", label: "", countdownText: null };

  const targetMs = new Date(iso).getTime();
  if (Number.isNaN(targetMs)) {
    return { state: "unknown", label: "", countdownText: null };
  }

  return targetMs > Date.now()
    ? {
        state: "pending",
        label: "Pending",
        countdownText: getChartLiveStatus(iso).countdownText,
      }
    : { state: "elapsed", label: "Prepared", countdownText: null };
}

function formatCompactCountdown(value: string | null): string | null {
  if (!value) return null;
  const days = Number(value.match(/(\d+)d/)?.[1] ?? 0);
  const hours = Number(value.match(/(\d+)h/)?.[1] ?? 0);
  const minutes = Number(value.match(/(\d+)m/)?.[1] ?? 0);
  const totalHours = days * 24 + hours;
  return `${totalHours}h ${minutes}m`;
}

function ChartScheduleStatus({
  status,
  mounted,
}: {
  status: ReturnType<typeof getScheduleStatus>;
  mounted: boolean;
}) {
  const compactCountdown = formatCompactCountdown(status.countdownText);
  const badgeClass = "inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[10px] font-bold leading-none";

  if (status.state === "unknown") return null;

  if (!mounted) {
    return (
      <span className={`${badgeClass} mt-1 border-stone-200 bg-stone-50 text-stone-500`}>
        Checking status…
      </span>
    );
  }

  if (status.state === "pending") {
    return (
      <span className="mt-1 inline-flex items-center gap-[6px]">
        <span className={`${badgeClass} border-amber-200 bg-amber-50 text-amber-800`}>
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          {status.label}
        </span>
        <span className="inline-flex h-5 items-center whitespace-nowrap rounded-md border border-amber-200 bg-amber-50 px-1.5 text-[10px] font-bold tabular-nums text-amber-800">
          {compactCountdown ? `In ${compactCountdown}` : "—"}
        </span>
      </span>
    );
  }

  return (
    <span className={`${badgeClass} mt-1 border-emerald-200 bg-emerald-50 text-emerald-800`}>
      <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-700" aria-hidden="true" />
      {status.label}
    </span>
  );
}

export function TrainChartPreparationTime() {
  // Hydration-safe mount flag
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Search form states
  const [trainQuery, setTrainQuery] = useState<string>("");
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>("");
  const [journeyDate, setJourneyDate] = useState<string>(() => getTodayIST());
  const [selectedBoardingCode, setSelectedBoardingCode] = useState<string>("");

  // Train autocomplete dropdown states
  const [trainSuggestions, setTrainSuggestions] = useState<TrainSuggestion[]>([]);
  const [trainDropdownOpen, setTrainDropdownOpen] = useState<boolean>(false);
  const [trainSearchLoading, setTrainSearchLoading] = useState<boolean>(false);
  const trainDropdownRef = useRef<HTMLDivElement>(null);

  // Boarding station dropdown states
  const [boardingDropdownOpen, setBoardingDropdownOpen] = useState<boolean>(false);
  const [boardingFilterQuery, setBoardingFilterQuery] = useState<string>("");
  const boardingDropdownRef = useRef<HTMLDivElement>(null);

  // Charting API result states
  const [chartingData, setChartingData] = useState<TrainChartingResponse | null>(null);
  const [chartingLoading, setChartingLoading] = useState<boolean>(false);
  const [chartingError, setChartingError] = useState<string | null>(null);

  // Route table filter states
  const [tableStationSearch, setTableStationSearch] = useState<string>("");
  const [remoteClusterFilter, setRemoteClusterFilter] = useState<string>("ALL");

  // UI feedback states
  const [copied, setCopied] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [, setTick] = useState<number>(0);

  // 1-second live tick for countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        trainDropdownRef.current &&
        !trainDropdownRef.current.contains(event.target as Node)
      ) {
        setTrainDropdownOpen(false);
      }
      if (
        boardingDropdownRef.current &&
        !boardingDropdownRef.current.contains(event.target as Node)
      ) {
        setBoardingDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Train Autocomplete Search from /api/trains
  useEffect(() => {
    if (!trainDropdownOpen) return;
    let isCancelled = false;

    const cleanQ = trainQuery
      .replace(/^\d{4,5}\s*[-–]\s*.+$/, (full) => {
        const m = full.match(/^(\d{4,5})/);
        return m ? m[1] : full;
      })
      .trim();

    const timer = setTimeout(async () => {
      setTrainSearchLoading(true);
      try {
        const res = await fetch(`/api/trains?q=${encodeURIComponent(cleanQ)}&limit=10`);
        if (!res.ok) throw new Error("Train search failed");
        const data = await res.json();
        if (!isCancelled && Array.isArray(data.trains)) {
          setTrainSuggestions(data.trains);
        }
      } catch (err) {
        console.error("Train search error:", err);
      } finally {
        if (!isCancelled) setTrainSearchLoading(false);
      }
    }, 180);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [trainQuery, trainDropdownOpen]);

  // Fetch Charting Data for a given trainNumber and date
  const fetchChartingSchedule = useCallback(
    async (trainNo: string, dateIso: string, preferredStationCode?: string) => {
      const cleanMatch = trainNo.trim().match(/\b(\d{3,6})\b/);
      const resolvedTrainNo = cleanMatch ? cleanMatch[1] : trainNo.trim();

      if (!resolvedTrainNo || !dateIso) return;

      setChartingLoading(true);
      setChartingError(null);
      setChartingData(null);
      setSelectedBoardingCode("");

      try {
        const res = await fetch(
          `/api/charting?trainNumber=${encodeURIComponent(resolvedTrainNo)}&date=${encodeURIComponent(dateIso)}`
        );
        const json = await res.json();

        if (!res.ok || !json.success || !json.data) {
          throw new Error(
            json.error || `Unable to retrieve chart preparation timings for Train ${resolvedTrainNo}.`
          );
        }

        const data: TrainChartingResponse = json.data;
        setChartingData(data);
        setSelectedTrainNumber(data.trainNumber);
        setTrainQuery(`${data.trainNumber} - ${data.trainName}`);
        setRemoteClusterFilter("ALL");

        // Determine active boarding station
        if (data.stations.length > 0) {
          const targetCode = preferredStationCode || selectedBoardingCode;
          const exists = data.stations.some((s) => s.stationCode === targetCode);
          if (exists && targetCode) {
            setSelectedBoardingCode(targetCode);
          } else {
            setSelectedBoardingCode(data.stations[0].stationCode);
          }
        }
      } catch (err: unknown) {
        console.error("Charting fetch error:", err);
        setChartingError(
          err instanceof Error
            ? err.message
            : "Could not load train chart timings. Please verify the train number and date."
        );
      } finally {
        setChartingLoading(false);
      }
    },
    [selectedBoardingCode]
  );

  // Currently selected boarding station object & stop index
  const selectedStationInfo = useMemo<{
    station: TrainChartStation;
    stopIndex: number;
  } | null>(() => {
    if (!chartingData || chartingData.stations.length === 0) return null;
    const idx = chartingData.stations.findIndex(
      (s) => s.stationCode === selectedBoardingCode
    );
    if (idx >= 0) {
      return { station: chartingData.stations[idx], stopIndex: idx + 1 };
    }
    return { station: chartingData.stations[0], stopIndex: 1 };
  }, [chartingData, selectedBoardingCode]);

  // Find remote charting station full name if available in the route
  const getRemoteStationDisplay = useCallback(
    (remoteCode: string | null): string => {
      if (!remoteCode) return "Origin Station";
      if (!chartingData) return remoteCode;
      const found = chartingData.stations.find((s) => s.stationCode === remoteCode);
      return found ? `${found.stationName} (${found.stationCode})` : remoteCode;
    },
    [chartingData]
  );

  // Distinct Remote Charting Stations on this train route
  const remoteClusters = useMemo(() => {
    if (!chartingData) return [];
    const counts = new Map<string, number>();
    for (const stn of chartingData.stations) {
      const code = stn.chartRemoteStation || "OTHER";
      counts.set(code, (counts.get(code) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([code, count]) => ({ code, count }));
  }, [chartingData]);

  // Filtered stations for Boarding Station dropdown
  const filteredBoardingDropdownStations = useMemo(() => {
    if (!chartingData) return [];
    const q = boardingFilterQuery.trim().toLowerCase();
    if (!q) return chartingData.stations;
    return chartingData.stations.filter(
      (s) =>
        s.stationCode.toLowerCase().includes(q) ||
        s.stationName.toLowerCase().includes(q)
    );
  }, [chartingData, boardingFilterQuery]);

  // Filtered stations for the full station-wise table
  const filteredTableStations = useMemo(() => {
    if (!chartingData) return [];
    const q = tableStationSearch.trim().toLowerCase();
    return chartingData.stations.filter((s) => {
      const matchesCluster =
        remoteClusterFilter === "ALL" ||
        (s.chartRemoteStation || "OTHER") === remoteClusterFilter;
      const matchesSearch =
        !q ||
        s.stationCode.toLowerCase().includes(q) ||
        s.stationName.toLowerCase().includes(q) ||
        (s.chartRemoteStation && s.chartRemoteStation.toLowerCase().includes(q));
      return matchesCluster && matchesSearch;
    });
  }, [chartingData, tableStationSearch, remoteClusterFilter]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const match = trainQuery.trim().match(/\b(\d{3,6})\b/);
    const numToFetch = match ? match[1] : selectedTrainNumber || trainQuery.trim();
    if (numToFetch) {
      setTrainDropdownOpen(false);
      void fetchChartingSchedule(numToFetch, journeyDate);
    }
  };

  const handleSelectTrainSuggestion = (trn: TrainSuggestion) => {
    setSelectedTrainNumber(trn.trainNumber);
    setTrainQuery(`${trn.trainNumber} - ${trn.trainName}`);
    setTrainDropdownOpen(false);
    void fetchChartingSchedule(trn.trainNumber, journeyDate);
  };

  const handleDateChange = (newDate: string) => {
    setJourneyDate(newDate);
    if (selectedTrainNumber && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      void fetchChartingSchedule(selectedTrainNumber, newDate, selectedBoardingCode);
    }
  };

  const handleCopySchedule = async () => {
    if (!chartingData || !selectedStationInfo) return;
    const stn = selectedStationInfo.station;
    const firstIso = formatIsoDateTimeIST(stn.firstChartDateTime);
    const secondIso = formatIsoDateTimeIST(stn.secondChartDateTime);

    const text = [
      `🚂 IRCTC Train Chart Preparation Schedule`,
      `Train: ${chartingData.trainNumber} - ${chartingData.trainName} (${chartingData.originStation} ➔ ${chartingData.destinationStation})`,
      `Boarding Station: ${stn.stationName} (${stn.stationCode}) • Day ${stn.day}`,
      `Scheduled Departure: ${stn.departureTime || stn.arrivalTime || "—"} HRS`,
      `Charting Quota Station: ${getRemoteStationDisplay(stn.chartRemoteStation)}`,
      `1st Reservation Chart: ${firstIso ? firstIso.fullLabel : formatTime12Hour(stn.chartTimeLocal)}`,
      `2nd (Final) Chart: ${secondIso ? secondIso.fullLabel : stn.chartTwoTimeLocal ? formatTime12Hour(stn.chartTwoTimeLocal) : "~30 mins before departure"}`,
      `Checked via RailAgents.in`,
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!chartingData || !selectedStationInfo) return;
    const stn = selectedStationInfo.station;
    const firstIso = formatIsoDateTimeIST(stn.firstChartDateTime);
    const secondIso = formatIsoDateTimeIST(stn.secondChartDateTime);

    const text = encodeURIComponent(
      `🚂 *IRCTC Train Chart Preparation Timing*\n` +
        `• *Train:* ${chartingData.trainNumber} - ${chartingData.trainName}\n` +
        `• *Boarding Station:* ${stn.stationName} (${stn.stationCode})\n` +
        `• *Scheduled Dep:* ${stn.departureTime || stn.arrivalTime || "—"} (Day ${stn.day})\n` +
        `• *Remote Charting Station:* ${getRemoteStationDisplay(stn.chartRemoteStation)}\n` +
        `• *1st Chart Time:* *${firstIso ? firstIso.fullLabel : formatTime12Hour(stn.chartTimeLocal)}*\n` +
        `• *2nd (Final) Chart:* *${secondIso ? secondIso.fullLabel : stn.chartTwoTimeLocal ? formatTime12Hour(stn.chartTwoTimeLocal) : "~30 mins before departure"}*\n` +
        `Checked on RailAgents.in`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const todayIso = getTodayIST();
  const tomorrowIso = addCalendarDays(todayIso, 1);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* ══════════════════════════════════════════════════════════════════════
          1. SEARCH BAR: TRAIN NUMBER/NAME + JOURNEY DATE + BOARDING STATION
         ══════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="chart-search-heading">
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,39,71,0.06)] border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <Search className="h-4 w-4" />
              </span>
              <h2
                id="chart-search-heading"
                className="text-base sm:text-lg font-bold text-[#0b2240]"
              >
                Find your chart preparation time
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Radio className={`h-3 w-3 text-emerald-600 ${chartingLoading ? "animate-pulse" : ""}`} />
              <span>{chartingLoading ? "Updating schedule…" : "Live schedule"}</span>
            </span>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start"
          >
            {/* 1. TRAIN NUMBER OR NAME */}
            <div className="md:col-span-5 relative" ref={trainDropdownRef}>
              <label
                htmlFor="train-search-input"
                className="mb-1.5 flex h-5 items-center text-xs font-bold text-stone-800"
              >
                1. Train number or name
              </label>
              <div className="relative">
                <TrainFront className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600" />
                <input
                  id="train-search-input"
                  type="text"
                  autoComplete="off"
                  value={trainQuery}
                  onFocus={() => setTrainDropdownOpen(true)}
                  onChange={(e) => {
                    setTrainQuery(e.target.value);
                    setSelectedTrainNumber("");
                    setChartingData(null);
                    setSelectedBoardingCode("");
                    setChartingError(null);
                    setTrainDropdownOpen(true);
                  }}
                  placeholder="Select train number or name"
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-14 text-base font-medium text-stone-900 transition-colors hover:border-orange-300 focus:border-orange-500 focus:bg-white focus:outline-none"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {trainQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setTrainQuery("");
                        setSelectedTrainNumber("");
                        setChartingData(null);
                        setSelectedBoardingCode("");
                        setChartingError(null);
                        setTrainDropdownOpen(true);
                      }}
                      className="p-1 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
                      aria-label="Clear train search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setTrainDropdownOpen((prev) => !prev)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
                    aria-label="Toggle train suggestions"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        trainDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Train Suggestions Dropdown */}
              {trainDropdownOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full max-h-64 overflow-y-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-2xl">
                  <div className="px-2.5 py-1.5 text-[10px] font-extrabold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1 flex items-center justify-between">
                    <span>
                      {trainQuery.trim() ? "Matching trains" : "Search for a train"}
                    </span>
                    {trainSearchLoading && (
                      <span className="text-[10px] text-orange-600 font-bold animate-pulse">
                        Searching...
                      </span>
                    )}
                  </div>

                  {trainSuggestions.length === 0 ? (
                    <div className="px-3 py-5 text-center text-xs text-stone-500">
                      {trainSearchLoading
                        ? "Searching trains…"
                        : trainQuery.trim()
                          ? "No matching train found. Check the number or name and try again."
                          : "Start typing a train number or name to search."}
                    </div>
                  ) : (
                    trainSuggestions.map((trn) => {
                      const isSelected = trn.trainNumber === selectedTrainNumber;
                      return (
                        <button
                          key={trn.trainNumber}
                          type="button"
                          onClick={() => handleSelectTrainSuggestion(trn)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-orange-50 text-orange-950 font-bold"
                              : "hover:bg-orange-50/70 group"
                          }`}
                        >
                          <div className="min-w-0 pr-2 flex items-center gap-2.5">
                            <span className="shrink-0 font-mono text-[11px] font-black px-2 py-0.5 rounded-md bg-[#0b2240] text-white group-hover:bg-orange-600 transition-colors">
                              {trn.trainNumber}
                            </span>
                            <span className="font-bold text-stone-900 truncate group-hover:text-orange-700">
                              {trn.trainName}
                            </span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-stone-300 group-hover:text-orange-600" />
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* 2. BOARDING STATION SELECTOR (FROM TRAIN ROUTE) */}
            <div className="md:col-span-4 relative" ref={boardingDropdownRef}>
              <div className="mb-1.5 flex h-5 items-center justify-between">
                <label
                  htmlFor="boarding-station-btn"
                  className="block text-xs font-bold text-stone-800"
                >
                  2. Boarding station
                </label>
                {chartingData && (
                  <span className="text-[10px] font-bold text-orange-700">
                    {chartingData.stations.length} Route Stops
                  </span>
                )}
              </div>

              <button
                id="boarding-station-btn"
                type="button"
                disabled={!chartingData || chartingData.stations.length === 0}
                onClick={() => setBoardingDropdownOpen((prev) => !prev)}
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-left text-base font-medium text-stone-900 transition-colors hover:border-orange-300 focus:border-orange-500 focus:bg-white focus:outline-none flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-4 w-4 shrink-0 text-orange-600" />
                  {selectedStationInfo ? (
                    <span className="truncate">
                      {selectedStationInfo.station.stationName} (
                      {selectedStationInfo.station.stationCode})
                    </span>
                  ) : (
                    <span className="text-stone-400">Select boarding station</span>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${
                    boardingDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {boardingDropdownOpen && chartingData && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full sm:w-80 max-h-72 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl flex flex-col">
                  <div className="p-2 border-b border-stone-100 bg-stone-50/70">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                      <input
                        type="text"
                        value={boardingFilterQuery}
                        onChange={(e) => setBoardingFilterQuery(e.target.value)}
                        placeholder="Filter route stations..."
                        className="w-full h-8 rounded-lg border border-stone-200 bg-white pl-8 pr-2.5 text-xs font-semibold text-stone-800 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto p-1.5 max-h-56 divide-y divide-stone-50">
                    {filteredBoardingDropdownStations.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-stone-500">
                        No route station matches &ldquo;{boardingFilterQuery}&rdquo;
                      </div>
                    ) : (
                      filteredBoardingDropdownStations.map((stn, idx) => {
                        const isSelected = stn.stationCode === selectedBoardingCode;
                        return (
                          <button
                            key={stn.stationCode}
                            type="button"
                            onClick={() => {
                              setSelectedBoardingCode(stn.stationCode);
                              setBoardingDropdownOpen(false);
                              setBoardingFilterQuery("");
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-orange-50 text-orange-950 font-bold"
                                : "hover:bg-orange-50/60"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-stone-900 truncate">
                                  {stn.stationName}
                                </span>
                                {idx === 0 && !boardingFilterQuery && (
                                  <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-800">
                                    ORIGIN
                                  </span>
                                )}
                              </div>
                              <span className="text-[10.5px] text-stone-500 block">
                                Day {stn.day} •{" "}
                                {stn.departureTime
                                  ? `Dep ${stn.departureTime}`
                                  : `Arr ${stn.arrivalTime}`}{" "}
                                • 1st Chart: {formatTime12Hour(stn.chartTimeLocal)}
                              </span>
                            </div>
                            <span className="shrink-0 font-mono text-[10.5px] font-extrabold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                              {stn.stationCode}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. JOURNEY DATE PICKER */}
            <div className="md:col-span-3">
              <div className="mb-1.5 flex h-5 items-center justify-between gap-2">
                <label
                  htmlFor="chart-journey-date"
                  className="block text-xs font-bold text-stone-800"
                >
                  3. Journey date
                </label>
                <div className="inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleDateChange(todayIso)}
                    aria-pressed={journeyDate === todayIso}
                    className={`inline-flex h-5 items-center rounded-md px-2 text-[10px] leading-none font-semibold cursor-pointer transition-colors ${
                      journeyDate === todayIso
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-orange-700"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDateChange(tomorrowIso)}
                    aria-pressed={journeyDate === tomorrowIso}
                    className={`inline-flex h-5 items-center rounded-md px-2 text-[10px] leading-none font-semibold cursor-pointer transition-colors ${
                      journeyDate === tomorrowIso
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-orange-700"
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <input
                id="chart-journey-date"
                type="date"
                value={journeyDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-base font-medium text-stone-900 transition-colors hover:border-orange-300 focus:border-orange-500 focus:bg-white focus:outline-none cursor-pointer"
              />
            </div>
          </form>

        </div>
      </section>

      {/* ERROR STATE */}
      {chartingError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 sm:p-5 text-rose-900 flex items-start gap-3 shadow-xs"
        >
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-extrabold text-rose-950">
              Unable to Fetch Chart Preparation Timing
            </p>
            <p className="mt-1 text-rose-800 leading-relaxed">{chartingError}</p>
          </div>
        </div>
      )}

      {!chartingData && !chartingError && (
        <section
          aria-live="polite"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center shadow-sm sm:py-10"
        >
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            {chartingLoading ? <Clock className="h-5 w-5 animate-pulse" /> : <TrainFront className="h-5 w-5" />}
          </span>
          <h3 className="mt-3 text-base font-bold text-[#0b2240]">
            {chartingLoading ? "Loading chart schedule" : "Search for a train to get started"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-600">
            {chartingLoading
              ? "We’re retrieving the chart timings and route stations."
              : "Enter a train number or name above, then choose your boarding station and journey date."}
          </p>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          2. SELECTED BOARDING STATION SPOTLIGHT (LASTBERTH-STYLE SUMMARY CARD)
         ══════════════════════════════════════════════════════════════════════ */}
      {chartingData && selectedStationInfo && (
        <section aria-labelledby="boarding-station-spotlight-heading">
          <div className="rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,39,71,0.06)] border border-slate-200 overflow-hidden">
            {/* Top Navy Executive Train Banner */}
            <div className="bg-[#0b2240] px-5 py-5 sm:px-6 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-2.5 py-1 font-mono text-xs sm:text-sm font-bold text-white">
                      #{chartingData.trainNumber}
                    </span>
                    <h3
                      id="boarding-station-spotlight-heading"
                      className="text-xl sm:text-2xl font-bold tracking-tight text-white"
                    >
                      {chartingData.trainName}
                    </h3>
                    <span className="text-xs font-medium text-slate-300">
                      {chartingData.originStation} ➔ {chartingData.destinationStation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                      Origin Date: <strong className="text-white">{chartingData.journeyDate}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Route stops:{" "}
                      <strong className="text-white">{chartingData.stations.length}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Charting zones:{" "}
                      <strong className="text-white">
                        {remoteClusters.length}
                      </strong>
                    </span>
                  </p>
                </div>

                {/* Selected Boarding Station Pill on Banner */}
                <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-[#0b2240]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-500">
                      Boarding station · Stop {selectedStationInfo.stopIndex} of{" "}
                      {chartingData.stations.length})
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#0b2240]">
                      {selectedStationInfo.station.stationName} (
                      {selectedStationInfo.station.stationCode})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Boarding Station Timing & Chart Cards Body */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* Station Quick KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl bg-slate-50/70 border border-slate-200 p-4">
                  <span className="text-xs font-semibold text-slate-500 block">
                    Arrival and departure
                  </span>
                  <div className="mt-1.5 text-base font-bold text-[#0b2240]">
                    {selectedStationInfo.station.arrivalTime
                      ? `Arr ${selectedStationInfo.station.arrivalTime}`
                      : "Originates"}{" "}
                    {selectedStationInfo.station.departureTime
                      ? `• Dep ${selectedStationInfo.station.departureTime}`
                      : "• Terminates"}
                  </div>
                  <span className="text-[11px] font-semibold text-stone-500">
                    Railway time · IST
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50/70 border border-slate-200 p-4">
                  <span className="text-xs font-semibold text-slate-500 block">
                    Journey position
                  </span>
                  <div className="mt-1.5 text-base font-bold text-[#0b2240]">
                    Day {selectedStationInfo.station.day} •{" "}
                    {Number(selectedStationInfo.station.distance).toFixed(0)} km
                  </div>
                  <span className="text-[11px] font-semibold text-stone-500">
                    From {chartingData.originStation}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50/70 border border-slate-200 p-4">
                  <span className="text-xs font-semibold text-slate-500 block">
                    Charting station
                  </span>
                  <div className="mt-1.5 text-base font-bold text-orange-700 truncate">
                    {getRemoteStationDisplay(selectedStationInfo.station.chartRemoteStation)}
                  </div>
                  <span className="text-[11px] font-semibold text-stone-500">
                    {selectedStationInfo.station.chartRemoteStation ===
                    selectedStationInfo.station.stationCode
                      ? "Self-Charting Quota Station"
                      : `Charted remotely at ${selectedStationInfo.station.chartRemoteStation}`}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50/70 border border-slate-200 p-4">
                  <span className="text-xs font-semibold text-slate-500 block">
                    Current booking
                  </span>
                  <div className="mt-1.5 text-base font-bold text-emerald-800">
                    {selectedStationInfo.station.chartTimeLocal
                      ? `Opens ${formatTime12Hour(selectedStationInfo.station.chartTimeLocal)}`
                      : "After 1st Chart"}
                  </div>
                  <span className="text-[11px] font-semibold text-stone-500">
                    Until 30m before departure
                  </span>
                </div>
              </div>

              {/* TWO MAIN CHART PREPARATION CARDS (FIRST CHART + SECOND/FINAL CHART) */}
              {(() => {
                const stn = selectedStationInfo.station;
                const firstIsoInfo = formatIsoDateTimeIST(stn.firstChartDateTime);
                const secondIsoInfo = formatIsoDateTimeIST(stn.secondChartDateTime);
                const firstOffsetBadge = getDayOffsetBadge(stn.chartOneDayOffset);
                const secondOffsetBadge = getDayOffsetBadge(stn.chartTwoDayOffset);
                const firstLive = getChartLiveStatus(stn.firstChartDateTime);
                const secondLive = getChartLiveStatus(stn.secondChartDateTime);

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* 1ST RESERVATION CHART CARD */}
                    <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-5 sm:p-6 flex flex-col justify-between gap-5">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-orange-100">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white shadow-2xs">
                              <Clock className="h-4 w-4" />
                            </span>
                            <div>
                              <span className="text-xs font-semibold text-orange-700 block">
                                Main confirmation update
                              </span>
                              <h4 className="text-base font-bold text-[#0b2240]">
                                First chart
                              </h4>
                            </div>
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-extrabold ${firstOffsetBadge.className}`}
                          >
                            {firstOffsetBadge.label}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                          <div>
                            <span className="text-xs font-medium text-stone-500 block">
                              Expected preparation time
                            </span>
                            <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#0b2240]">
                              {formatTime12Hour(stn.chartTimeLocal)}
                              {stn.chartTimeLocal && (
                                <span className="ml-2 text-xs font-mono font-bold text-stone-500">
                                  ({stn.chartTimeLocal} HRS)
                                </span>
                              )}
                            </div>
                            {firstIsoInfo && (
                              <p className="mt-1 text-xs font-bold text-orange-800">
                                📅 {firstIsoInfo.dateLabel}
                              </p>
                            )}
                          </div>

                          {/* Live Status / Countdown Box */}
                          {mounted && (
                            <div className="shrink-0">
                              {firstLive.isPrepared ? (
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-black text-emerald-800">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span>Chart Prepared</span>
                                </span>
                              ) : firstLive.countdownText ? (
                                <div className="rounded-xl bg-[#0b2240] px-3.5 py-2 text-white text-left sm:text-right">
                                  <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-orange-300">
                                    Prepares In
                                  </span>
                                  <span className="font-mono text-sm font-black text-white">
                                    {firstLive.countdownText}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-orange-100/90 flex items-center justify-between text-[11px] text-stone-600">
                        <span>
                          Charting Location:{" "}
                          <strong className="text-stone-900">
                            {getRemoteStationDisplay(stn.chartRemoteStation)}
                          </strong>
                        </span>
                        <span className="font-bold text-orange-700">1st Chart</span>
                      </div>
                    </div>

                    {/* 2ND / FINAL RESERVATION CHART CARD */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 flex flex-col justify-between gap-5">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200/80">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b2240] text-white shadow-2xs">
                              <ShieldCheck className="h-4 w-4 text-cyan-300" />
                            </span>
                            <div>
                              <span className="text-xs font-semibold text-slate-500 block">
                                Final passenger list
                              </span>
                              <h4 className="text-base font-bold text-[#0b2240]">
                                Final chart
                              </h4>
                            </div>
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-extrabold ${secondOffsetBadge.className}`}
                          >
                            {secondOffsetBadge.label}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                          <div>
                            <span className="text-xs font-medium text-stone-500 block">
                              Expected finalization time
                            </span>
                            <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#0b2240]">
                              {stn.chartTwoTimeLocal ? (
                                <>
                                  {formatTime12Hour(stn.chartTwoTimeLocal)}
                                  <span className="ml-2 text-xs font-mono font-bold text-stone-500">
                                    ({stn.chartTwoTimeLocal} HRS)
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg sm:text-xl text-stone-700">
                                  ~30 Mins Before Departure
                                </span>
                              )}
                            </div>
                            {secondIsoInfo ? (
                              <p className="mt-1 text-xs font-bold text-slate-700">
                                📅 {secondIsoInfo.dateLabel}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-stone-500">
                                Finalized 15–30 minutes before train departure from{" "}
                                {stn.chartRemoteStation || stn.stationCode}
                              </p>
                            )}
                          </div>

                          {/* Live Status / Countdown Box */}
                          {mounted && stn.secondChartDateTime && (
                            <div className="shrink-0">
                              {secondLive.isPrepared ? (
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-black text-emerald-800">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span>Finalized</span>
                                </span>
                              ) : secondLive.countdownText ? (
                                <div className="rounded-xl bg-slate-800 px-3.5 py-2 text-white text-left sm:text-right">
                                  <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-cyan-300">
                                    Finalizes In
                                  </span>
                                  <span className="font-mono text-sm font-black text-white">
                                    {secondLive.countdownText}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-600">
                        <span>
                          Locks onboard TTE Hand-Held Terminal (HHT) chart
                        </span>
                        <span className="font-bold text-[#0b2240]">2nd Chart</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Remote Charting Explanation Note + Copy/WhatsApp Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
                <div className="flex items-start sm:items-center gap-2 text-xs text-stone-600">
                  <Info className="h-4 w-4 text-orange-600 shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    {selectedStationInfo.station.chartRemoteStation &&
                    selectedStationInfo.station.chartRemoteStation !==
                      selectedStationInfo.station.stationCode ? (
                      <>
                        Tickets boarding at{" "}
                        <strong className="text-stone-900">
                          {selectedStationInfo.station.stationName} (
                          {selectedStationInfo.station.stationCode})
                        </strong>{" "}
                        fall under the{" "}
                        <strong className="text-orange-700">
                          {getRemoteStationDisplay(
                            selectedStationInfo.station.chartRemoteStation
                          )}
                        </strong>{" "}
                        remote charting zone.
                      </>
                    ) : (
                      <>
                        <strong className="text-stone-900">
                          {selectedStationInfo.station.stationName} (
                          {selectedStationInfo.station.stationCode})
                        </strong>{" "}
                        is a primary remote charting station for this train.
                      </>
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopySchedule}
                    className="h-8 px-3 rounded-lg border border-stone-200 bg-white text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-stone-500" />
                    )}
                    <span>{copied ? "Copied!" : "Copy Timing"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="h-8 px-3 rounded-lg border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Share on WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (chartingData.stations.length > 0) {
                        setSelectedBoardingCode(chartingData.stations[0].stationCode);
                      }
                      setTableStationSearch("");
                      setRemoteClusterFilter("ALL");
                    }}
                    className="h-8 px-2.5 rounded-lg border border-stone-200 bg-white text-xs font-bold text-stone-600 hover:bg-stone-50 flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Reset station selection to Origin"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-stone-500" />
                    <span>Origin</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          3. COMPLETE STATION-BY-STATION CHART PREPARATION SCHEDULE TABLE
         ══════════════════════════════════════════════════════════════════════ */}
      {chartingData && chartingData.stations.length > 0 && (
        <section aria-labelledby="station-wise-chart-heading">
          <div className="rounded-2xl bg-white shadow-[0_4px_24px_rgba(15,39,71,0.06)] border border-[#ede5db] overflow-hidden">
            {/* Table Header & Filter Controls */}
            <div className="p-4 sm:p-5 border-b border-stone-100 bg-[#faf8f5]/60 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    <h3
                      id="station-wise-chart-heading"
                      className="text-sm sm:text-base font-extrabold text-[#0b2240]"
                    >
                      Station-Wise Chart Preparation Schedule ({chartingData.trainNumber}{" "}
                      {chartingData.trainName})
                    </h3>
                  </div>
                  <p className="mt-0.5 text-xs text-stone-500">
                    Click any station row below to inspect its exact boarding chart timing and remote quota details.
                  </p>
                  <p className="mt-1 text-[10.5px] text-stone-400">
                    Status reflects scheduled time; available data does not confirm actual chart preparation.
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-stone-400">
                    Day badges are counted from the train’s origin; Origin Day means Day 1.
                  </p>
                </div>

                {/* Station filter input */}
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={tableStationSearch}
                    onChange={(e) => setTableStationSearch(e.target.value)}
                    placeholder="Filter station name or code..."
                    className="w-full h-9 rounded-xl border border-stone-200 bg-white pl-8 pr-7 text-xs font-semibold text-stone-800 focus:border-orange-500 focus:outline-none"
                  />
                  {tableStationSearch && (
                    <button
                      type="button"
                      onClick={() => setTableStationSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                      aria-label="Clear station filter"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Remote Charting Cluster Filter Pills */}
              {remoteClusters.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-stone-500 mr-1">
                    Charting Quota Zones:
                  </span>
                  <button
                    type="button"
                    onClick={() => setRemoteClusterFilter("ALL")}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                      remoteClusterFilter === "ALL"
                        ? "bg-[#0b2240] text-white"
                        : "bg-white border border-stone-200 text-stone-600 hover:border-orange-300"
                    }`}
                  >
                    All Stations ({chartingData.stations.length})
                  </button>
                  {remoteClusters.map((cluster) => (
                    <button
                      key={cluster.code}
                      type="button"
                      onClick={() => setRemoteClusterFilter(cluster.code)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                        remoteClusterFilter === cluster.code
                          ? "bg-orange-500 text-white"
                          : "bg-white border border-stone-200 text-stone-700 hover:border-orange-300"
                      }`}
                    >
                      {cluster.code} Zone ({cluster.count})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Responsive Table */}
            <div className="hidden overflow-x-auto md:block">
              <table
                className="w-full text-left border-collapse"
                aria-label="Station-wise train chart preparation timings"
              >
                <thead>
                  <tr className="border-b border-stone-200 bg-[#f8f5f0] text-[11px] font-extrabold uppercase tracking-wider text-stone-600">
                    <th scope="col" className="py-3 pl-4 pr-2 w-12">
                      #
                    </th>
                    <th scope="col" className="py-3 px-3">
                      Boarding Station
                    </th>
                    <th scope="col" className="py-3 px-3">
                      Arr / Dep &amp; Day
                    </th>
                    <th scope="col" className="py-3 px-3">
                      Charting Station
                    </th>
                    <th scope="col" className="py-3 px-3">
                      1st Chart Preparation
                    </th>
                    <th scope="col" className="py-3 px-3">
                      2nd (Final) Chart
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {filteredTableStations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500">
                        No stations match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTableStations.map((stn) => {
                      const stopNumber =
                        chartingData.stations.findIndex(
                          (s) => s.stationCode === stn.stationCode
                        ) + 1;
                      const isOrigin = stopNumber === 1;
                      const isDestination = stopNumber === chartingData.stations.length;
                      const isSelected = stn.stationCode === selectedBoardingCode;
                      const isRemoteDifferent =
                        stn.chartRemoteStation &&
                        stn.chartRemoteStation !== stn.stationCode;

                      const firstIso = formatIsoDateTimeIST(stn.firstChartDateTime);
                      const secondIso = formatIsoDateTimeIST(stn.secondChartDateTime);
                      const firstOffset = getDayOffsetBadge(stn.chartOneDayOffset);
                      const firstStatus = getScheduleStatus(stn.firstChartDateTime);
                      const secondStatus = getScheduleStatus(stn.secondChartDateTime);

                      return (
                        <tr
                          key={stn.stationCode}
                          onClick={() => setSelectedBoardingCode(stn.stationCode)}
                          className={`transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-orange-50/90 hover:bg-orange-100/70"
                              : "hover:bg-stone-50/90"
                          }`}
                        >
                          {/* Stop # */}
                          <td className="py-3.5 pl-4 pr-2 font-mono font-bold text-stone-400">
                            {String(stopNumber).padStart(2, "0")}
                          </td>

                          {/* Station Name & Code */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-[#0b2240] text-white shrink-0">
                                {stn.stationCode}
                              </span>
                              <div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-extrabold text-stone-900 text-xs sm:text-[13px]">
                                    {stn.stationName}
                                  </span>
                                  {isSelected && (
                                    <span className="rounded bg-orange-500 px-1.5 py-0.2 text-[9px] font-black uppercase text-white">
                                      Selected
                                    </span>
                                  )}
                                  {isOrigin && (
                                    <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-emerald-800">
                                      Origin
                                    </span>
                                  )}
                                  {isDestination && (
                                    <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-slate-800">
                                      Dest
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10.5px] text-stone-500 block">
                                  Distance: {Number(stn.distance).toFixed(0)} km
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Arrival / Departure & Day */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="font-bold text-stone-800">
                              {stn.arrivalTime ? `Arr ${stn.arrivalTime}` : "Starts"}
                              {stn.departureTime ? ` • Dep ${stn.departureTime}` : " • Ends"}
                            </div>
                            <span className="inline-block mt-0.5 rounded bg-stone-100 px-1.5 py-0.2 text-[10px] font-bold text-stone-600">
                              Day {stn.day}
                            </span>
                          </td>

                          {/* Remote Charting Station */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {isRemoteDifferent && (
                                <>
                                  <span className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                                    {stn.stationCode}
                                  </span>
                                  <ArrowRight className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                                </>
                              )}
                              <span className={`rounded border px-2 py-0.5 font-mono text-[11px] font-bold ${
                                isRemoteDifferent
                                  ? "bg-amber-50 text-amber-900 border-amber-200"
                                  : "bg-emerald-50 text-emerald-900 border-emerald-200"
                              }`}>
                                {stn.chartRemoteStation || stn.stationCode}
                              </span>
                              {!isRemoteDifferent && (
                                <span className="text-[11px] font-medium text-stone-600">
                                  Self charting
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 1st Chart Preparation Time */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="flex min-w-max items-center gap-2">
                              <span className="font-black tabular-nums text-[#0b2240] text-xs sm:text-sm">
                                {formatTime12Hour(stn.chartTimeLocal)}
                              </span>
                              {(stn.chartOneDayOffset !== 0 || isOrigin) && <span
                                className={`rounded border px-1.5 py-0.2 text-[9.5px] font-bold ${firstOffset.className}`}
                              >
                                {firstOffset.label}
                              </span>}
                            </div>
                            {firstIso && (
                              <span className="text-[10.5px] text-stone-500 block mt-0.5">
                                {firstIso.dateLabel}
                              </span>
                            )}
                            <ChartScheduleStatus status={firstStatus} mounted={mounted} />
                          </td>

                          {/* 2nd (Final) Chart Time */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {stn.chartTwoTimeLocal ? (
                              <>
                                <div className="font-bold tabular-nums text-stone-800 text-xs sm:text-sm">
                                  {formatTime12Hour(stn.chartTwoTimeLocal)}
                                </div>
                                {secondIso && (
                                  <span className="text-[10.5px] text-stone-500 block mt-0.5">
                                    {secondIso.dateLabel}
                                  </span>
                                )}
                                <ChartScheduleStatus status={secondStatus} mounted={mounted} />
                              </>
                            ) : (
                              <>
                                <span className="block text-[11px] font-semibold text-stone-500">
                                  ~30m before dep
                                </span>
                                <ChartScheduleStatus status={secondStatus} mounted={mounted} />
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Compact station cards for phones */}
            <div className="divide-y divide-stone-100 md:hidden">
              {filteredTableStations.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-stone-500">
                  No stations match your filter criteria.
                </p>
              ) : (
                filteredTableStations.map((stn) => {
                  const stopNumber =
                    chartingData.stations.findIndex((s) => s.stationCode === stn.stationCode) + 1;
                  const isOrigin = stopNumber === 1;
                  const isDestination = stopNumber === chartingData.stations.length;
                  const isSelected = stn.stationCode === selectedBoardingCode;
                  const remoteStation = stn.chartRemoteStation || stn.stationCode;
                  const isRemoteDifferent = remoteStation !== stn.stationCode;
                  const firstIso = formatIsoDateTimeIST(stn.firstChartDateTime);
                  const secondIso = formatIsoDateTimeIST(stn.secondChartDateTime);
                  const firstOffset = getDayOffsetBadge(stn.chartOneDayOffset);
                  const firstStatus = getScheduleStatus(stn.firstChartDateTime);
                  const secondStatus = getScheduleStatus(stn.secondChartDateTime);

                  return (
                    <article
                      key={stn.stationCode}
                      onClick={() => setSelectedBoardingCode(stn.stationCode)}
                      className={`cursor-pointer px-4 py-3.5 transition-colors ${
                        isSelected ? "bg-orange-50" : "bg-white active:bg-stone-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <span className="mt-0.5 w-6 shrink-0 font-mono text-[11px] font-bold text-stone-400">
                            {String(stopNumber).padStart(2, "0")}
                          </span>
                          <span className="shrink-0 rounded bg-[#0b2240] px-2 py-1 font-mono text-[10px] font-black text-white">
                            {stn.stationCode}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[13px] font-extrabold leading-tight text-stone-900">
                                {stn.stationName}
                              </span>
                              {isSelected && <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">Selected</span>}
                              {isOrigin && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-800">Origin</span>}
                              {isDestination && <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-slate-800">Dest</span>}
                            </div>
                            <p className="mt-0.5 text-[10px] text-stone-500">Distance: {Number(stn.distance).toFixed(0)} km</p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded bg-stone-100 px-1.5 py-1 text-[10px] font-bold text-stone-600">
                          Day {stn.day}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-stone-100 pt-3">
                        <div className="col-span-2 flex items-center gap-1.5 text-[11px] font-semibold text-stone-700">
                          <span>{stn.arrivalTime ? `Arr ${stn.arrivalTime}` : "Starts"}</span>
                          <span className="text-stone-300">·</span>
                          <span>{stn.departureTime ? `Dep ${stn.departureTime}` : "Ends"}</span>
                        </div>
                        <div className="col-span-2 flex min-w-0 items-center gap-1.5 text-[10px] text-stone-600">
                          {isRemoteDifferent ? (
                            <>
                              <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono font-bold text-slate-700">{stn.stationCode}</span>
                              <ArrowRight className="h-3 w-3 shrink-0 text-orange-500" aria-hidden="true" />
                            </>
                          ) : null}
                          <span className={`rounded border px-1.5 py-0.5 font-mono font-bold ${isRemoteDifferent ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
                            {remoteStation}
                          </span>
                          {!isRemoteDifferent && (
                            <span className="text-[10px] font-medium text-stone-600">Self charting</span>
                          )}
                        </div>

                        <div className="min-w-0 rounded-lg bg-stone-50 p-2.5">
                          <p className="text-[9px] font-extrabold uppercase tracking-wide text-stone-500">1st Chart</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[13px] font-black tabular-nums text-[#0b2240]">{formatTime12Hour(stn.chartTimeLocal)}</span>
                            {(stn.chartOneDayOffset !== 0 || isOrigin) && <span className={`rounded border px-1 py-0.5 text-[8px] font-bold ${firstOffset.className}`}>{firstOffset.label}</span>}
                          </div>
                          {firstIso && <p className="mt-0.5 text-[10px] text-stone-500">{firstIso.dateLabel}</p>}
                          <ChartScheduleStatus status={firstStatus} mounted={mounted} />
                        </div>
                        <div className="min-w-0 rounded-lg bg-stone-50 p-2.5">
                          <p className="text-[9px] font-extrabold uppercase tracking-wide text-stone-500">2nd (Final) Chart</p>
                          <p className="mt-1 text-[13px] font-black tabular-nums text-[#0b2240]">
                            {stn.chartTwoTimeLocal ? formatTime12Hour(stn.chartTwoTimeLocal) : "~30m before dep"}
                          </p>
                          {secondIso && <p className="mt-0.5 text-[10px] text-stone-500">{secondIso.dateLabel}</p>}
                          <ChartScheduleStatus status={secondStatus} mounted={mounted} />
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          4. IRCTC CHART PREPARATION RULES & AGENT REFERENCE GUIDE
         ══════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="chart-rules-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Official IRCTC Charting Rules Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-white p-5 shadow-[0_4px_24px_rgba(15,39,71,0.05)] border border-[#ede5db] h-full flex flex-col gap-4">
            <div className="flex flex-1 flex-col gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-orange-800">
                <Sparkles className="h-3 w-3 text-orange-600" />
                <span>IRCTC PRS Charting Rules</span>
              </div>
              <h3
                id="chart-rules-heading"
                className="text-base sm:text-lg font-extrabold text-[#0b2240]"
              >
                How Indian Railways Reservation Charting Works
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Indian Railways prepares reservation charts in two stages for every train and remote location quota station:
              </p>

              <div className="flex flex-1 flex-col justify-evenly gap-2.5 pt-1">
                <div className="flex-1 rounded-xl bg-[#faf8f5] border border-stone-200/80 p-3">
                  <p className="text-xs font-extrabold text-[#0b2240]">
                    1. Morning Trains (05:00 AM – 02:00 PM)
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-stone-600 leading-relaxed">
                    First chart is prepared the <strong>previous night between 8:00 PM and 9:00 PM IST</strong> so waitlisted passengers know their confirmation status before going to sleep.
                  </p>
                </div>

                <div className="flex-1 rounded-xl bg-[#faf8f5] border border-stone-200/80 p-3">
                  <p className="text-xs font-extrabold text-[#0b2240]">
                    2. Afternoon &amp; Night Trains (02:00 PM – 05:00 AM)
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-stone-600 leading-relaxed">
                    First chart is typically prepared <strong>8 to 10 hours before</strong> the scheduled departure from the originating or remote charting station.
                  </p>
                </div>

                <div className="flex-1 rounded-xl bg-[#faf8f5] border border-stone-200/80 p-3">
                  <p className="text-xs font-extrabold text-[#0b2240]">
                    3. Second Chart &amp; Current Booking
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-stone-600 leading-relaxed">
                    Current booking opens right after the First Chart and closes when the <strong>Second (Final) Chart</strong> is prepared (~30 minutes prior to departure).
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#0b2240] p-3.5 text-white text-xs">
              <p className="font-bold text-orange-300">Agent Tip: Remote Location Quotas (RLWL)</p>
              <p className="mt-1 text-[11px] text-slate-200 leading-relaxed">
                Always check the <strong>Charting Station</strong> column above. Even if a train departs late at night from an intermediate halt, its chart may be locked hours earlier at the parent Remote Charting Station.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Interactive FAQ Accordion */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-white p-5 shadow-[0_4px_24px_rgba(15,39,71,0.05)] border border-[#ede5db] h-full">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-stone-100">
              <HelpCircle className="h-4 w-4 text-orange-600" />
              <h3 className="text-sm sm:text-base font-extrabold text-[#0b2240]">
                Frequently Asked Questions (Chart Preparation Timing)
              </h3>
            </div>

            <div className="divide-y divide-stone-100">
              {CHARTING_FAQS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={item.q} className="py-3 first:pt-1 last:pb-1">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full text-left flex items-start justify-between gap-3 cursor-pointer group"
                    >
                      <span className="text-xs sm:text-sm font-extrabold text-[#0b2240] group-hover:text-orange-600 transition-colors">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-stone-400 mt-0.5 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-orange-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-stone-600 leading-relaxed pr-4">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
