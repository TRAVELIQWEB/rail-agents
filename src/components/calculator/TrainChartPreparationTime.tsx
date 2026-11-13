"use client";

import { getWhatsAppUrl } from "@/lib/whatsapp";

import { useWhatsAppSettings } from "@/components/WhatsAppSettingsProvider";

import {
  Fragment,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";
import {
  Search,
  TrainFront,
  MapPin,
  Clock,
  CalendarDays,
  Copy,
  Check,
  Share2,
  ChevronDown,
  AlertCircle,
  ArrowRight,
  Radio,
  X,
} from "lucide-react";
import { addCalendarDays } from "@/lib/railway-calculator-logic";
import type { TrainChartingResponse, TrainChartStation } from "@/lib/trains";
import { describeChartingStation } from "@/lib/charting-station";
import { createTrainSlug, parseTrainSlug, todayInIndia } from "@/lib/train-slug";

interface TrainSuggestion {
  trainNumber: string;
  trainName: string;
}

const chartingStyles = {
  self: { panel: "border-blue-100 bg-blue-50/60", badge: "border-blue-100 bg-white text-blue-900" },
  remote: { panel: "border-amber-200 bg-amber-50/70", badge: "border-amber-200 bg-amber-100/60 text-amber-900" },
  unknown: { panel: "border-slate-200 bg-slate-50", badge: "border-slate-200 bg-white text-slate-600" },
};

function RouteStationCard({ station, code, journeyDate, destination = false }: {
  station: TrainChartStation | undefined;
  code: string;
  journeyDate: string;
  destination?: boolean;
}) {
  const date = station?.day != null ? addCalendarDays(journeyDate, station.day - 1) : null;
  const dateLabel = date ? new Date(`${date}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric",
  }) : "Not available";
  return (
    <div className="min-w-0 rounded-lg border border-orange-100 bg-white p-3 sm:p-3.5">
      <p className="type-body  font-bold uppercase tracking-wide text-slate-500">{destination ? "Destination Station" : "Origin Station"}</p>
      <p className="type-body-small mt-2 break-words font-extrabold leading-snug text-[#102B46]">{station?.stationName || code || "Not available"}</p>
      {code && <p className="type-body-small mt-1 break-words font-mono text-slate-600">({code})</p>}
      <div className="type-caption mt-3 space-y-1 border-t border-orange-100 pt-3 text-slate-600">
        <p className="type-body">{dateLabel}</p>
        <p className="type-body">{destination ? "Arrival" : "Departure"}: <strong className="text-[#102B46]">{(destination ? station?.arrivalTime : station?.departureTime) || "Not available"}</strong></p>
      </div>
    </div>
  );
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
    month: "long",
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

function getScheduleStatus(iso: string | null | undefined): {
  state: "pending" | "elapsed" | "unknown";
  label: string;
} {
  if (!iso) return { state: "unknown", label: "" };

  const targetMs = new Date(iso).getTime();
  if (Number.isNaN(targetMs)) {
    return { state: "unknown", label: "" };
  }

  return targetMs > Date.now()
    ? { state: "pending", label: "Scheduled" }
    : { state: "elapsed", label: "Scheduled time passed" };
}

function ChartScheduleStatus({
  status,
  mounted,
}: {
  status: ReturnType<typeof getScheduleStatus>;
  mounted: boolean;
}) {
  if (status.state === "unknown") return null;

  if (!mounted) {
    return <span className="type-caption mt-1.5 font-bold text-[#525252]">Checking status…</span>;
  }

  if (status.state === "pending") {
    return <span className="type-caption mt-1.5 font-extrabold text-[#F36B21]">Scheduled</span>;
  }

  return (
    <span className="type-caption mt-1.5 font-bold text-[#525252]">
      {status.label}
    </span>
  );
}

export function TrainChartPreparationTime({
  initialTrain,
  initialDate,
  initialBoardingCode,
  basePath = "/chart-times",
}: {
  initialTrain?: string;
  initialDate?: string;
  initialBoardingCode?: string;
  basePath?: string;
} = {}) {
  const whatsappSettings = useWhatsAppSettings();
  // Hydration-safe mount flag
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const initialParsed = useMemo(() => parseTrainSlug(initialTrain), [initialTrain]);

  // Search form states
  const [trainQuery, setTrainQuery] = useState<string>(() => {
    if (initialParsed.trainNumber) {
      return initialParsed.trainName
        ? `${initialParsed.trainNumber} - ${initialParsed.trainName}`
        : initialParsed.trainNumber;
    }
    return "";
  });
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>(
    initialParsed.trainNumber || ""
  );
  const [journeyDate, setJourneyDate] = useState<string>(
    initialDate || todayInIndia()
  );
  const [dateInputFocused, setDateInputFocused] = useState(false);
  const [selectedBoardingCode, setSelectedBoardingCode] = useState<string>(
    initialBoardingCode || ""
  );

  // Train autocomplete dropdown states
  const [trainSuggestions, setTrainSuggestions] = useState<TrainSuggestion[]>([]);
  const [trainDropdownOpen, setTrainDropdownOpen] = useState<boolean>(false);
  const [trainSearchLoading, setTrainSearchLoading] = useState<boolean>(false);
  const [trainSearchError, setTrainSearchError] = useState<string | null>(null);
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

  // UI feedback states
  const [copied, setCopied] = useState<boolean>(false);
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
        const res = await fetch(`/api/trains?q=${encodeURIComponent(cleanQ)}&limit=10`, { cache: "no-store" });
        if (!res.ok) throw new Error("Train search failed");
        const data = await res.json();
        if (data.success !== true || !Array.isArray(data.trains)) throw new Error("Invalid train search response");
        if (!isCancelled) {
          setTrainSuggestions(data.trains);
          setTrainSearchError(null);
        }
      } catch (err) {
        console.error("Train search error:", err);
        if (!isCancelled) {
          setTrainSuggestions([]);
          setTrainSearchError("Train search is temporarily unavailable. You can enter the train number manually.");
        }
      } finally {
        if (!isCancelled) setTrainSearchLoading(false);
      }
    }, 180);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [trainQuery, trainDropdownOpen]);

  const chartRequestId = useRef(0);

  const updateUrl = useCallback(
    (trainNo: string, trainName: string, date: string) => {
      if (typeof window === "undefined") return;
      const slug = createTrainSlug(trainNo, trainName, "chart-times");
      const targetUrl = `${basePath}/${slug}?date=${encodeURIComponent(date)}`;
      if (window.location.pathname + window.location.search !== targetUrl) {
        window.history.replaceState(null, "", targetUrl);
      }
    },
    [basePath]
  );

  // Fetch Charting Data for a given trainNumber and date
  const fetchChartingSchedule = useCallback(
    async (trainNo: string, dateIso: string, preferredStationCode?: string) => {
      const cleanMatch = trainNo.trim().match(/\b(\d{3,6})\b/);
      const resolvedTrainNo = cleanMatch ? cleanMatch[1] : trainNo.trim();

      if (!resolvedTrainNo || !dateIso) return;

      const requestId = ++chartRequestId.current;
      setChartingLoading(true);
      setChartingError(null);
      setChartingData(null);
      setSelectedBoardingCode("");

      try {
        const res = await fetch(
          `/api/charting?trainNumber=${encodeURIComponent(resolvedTrainNo)}&date=${encodeURIComponent(dateIso)}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (requestId !== chartRequestId.current) return;

        if (!res.ok || !json.success || !json.data) {
          throw new Error(
            json.error || `Unable to retrieve chart preparation timings for Train ${resolvedTrainNo}.`
          );
        }

        const data: TrainChartingResponse = json.data;
        setChartingData(data);
        setSelectedTrainNumber(data.trainNumber);
        setTrainQuery(`${data.trainNumber} - ${data.trainName}`);
        updateUrl(data.trainNumber, data.trainName, dateIso);

        // Keep boarding selection explicit; never silently choose the origin.
        const availableBoardingStations = data.stations.slice(0, -1);
        if (availableBoardingStations.length > 0) {
          const targetCode = preferredStationCode !== undefined ? preferredStationCode : selectedBoardingCode;
          const exists = availableBoardingStations.some((s) => s.stationCode === targetCode);
          if (exists && targetCode) {
            setSelectedBoardingCode(targetCode);
          } else {
            setSelectedBoardingCode("");
          }
        } else {
          setSelectedBoardingCode("");
        }
      } catch (err: unknown) {
        if (requestId !== chartRequestId.current) return;
        console.error("Charting fetch error:", err);
        setChartingError(
          err instanceof Error
            ? err.message
            : "Could not load train chart timings. Please verify the train number and date."
        );
      } finally {
        if (requestId === chartRequestId.current) setChartingLoading(false);
      }
    },
    [selectedBoardingCode, updateUrl]
  );

  const initialFetchRef = useRef(false);
  useEffect(() => {
    if (initialParsed.trainNumber && !initialFetchRef.current) {
      initialFetchRef.current = true;
      const d = initialDate || todayInIndia();
      void fetchChartingSchedule(initialParsed.trainNumber, d, initialBoardingCode);
    }
  }, [initialParsed.trainNumber, initialDate, initialBoardingCode, fetchChartingSchedule]);

  // The final route stop is a destination, not a boarding station.
  const boardingStations = useMemo(
    () => chartingData?.stations.slice(0, -1) ?? [],
    [chartingData]
  );

  // Currently selected boarding station object & stop index
  const selectedStationInfo = useMemo<{
    station: TrainChartStation;
    stopIndex: number;
  } | null>(() => {
    if (boardingStations.length === 0 || !selectedBoardingCode) return null;
    const idx = boardingStations.findIndex(
      (s) => s.stationCode === selectedBoardingCode
    );
    if (idx >= 0) {
      return { station: boardingStations[idx], stopIndex: idx + 1 };
    }
    return null;
  }, [boardingStations, selectedBoardingCode]);

  const canShowResults = Boolean(
    selectedTrainNumber && /^\d{4}-\d{2}-\d{2}$/.test(journeyDate)
    && chartingData && selectedStationInfo && !chartingLoading,
  );

  // Filtered stations for Boarding Station dropdown
  const filteredBoardingDropdownStations = useMemo(() => {
    const q = boardingFilterQuery.trim().toLowerCase();
    if (!q) return boardingStations;
    return boardingStations.filter(
      (s) =>
        s.stationCode.toLowerCase().includes(q) ||
        s.stationName.toLowerCase().includes(q)
    );
  }, [boardingStations, boardingFilterQuery]);

  // Search is optional; by default every station returned by the API is shown.
  const filteredTableStations = useMemo(() => {
    if (!chartingData) return [];
    const q = tableStationSearch.trim().toLowerCase();
    return chartingData.stations.filter((s) =>
      !q || s.stationCode.toLowerCase().includes(q) || s.stationName.toLowerCase().includes(q)
    );
  }, [chartingData, tableStationSearch]);

  const handleSelectTrainSuggestion = (trn: TrainSuggestion) => {
    setSelectedTrainNumber(trn.trainNumber);
    setTrainQuery(`${trn.trainNumber} - ${trn.trainName}`);
    setSelectedBoardingCode("");
    setChartingData(null);
    setChartingError(null);
    setTrainDropdownOpen(false);
    // Load the route so the passenger can manually choose a boarding stop.
    // The response must not auto-select New Delhi or any other station.
    if (/^\d{4}-\d{2}-\d{2}$/.test(journeyDate)) {
      void fetchChartingSchedule(trn.trainNumber, journeyDate, "");
    }
  };

  const handleDateChange = (newDate: string) => {
    setJourneyDate(newDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      chartRequestId.current += 1;
      setChartingData(null);
      setChartingLoading(false);
      return;
    }
    if (selectedTrainNumber && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      const selectedDay = selectedStationInfo?.station.day;
      if (selectedStationInfo && selectedDay === null) {
        chartRequestId.current += 1;
        setChartingData(null);
        setChartingLoading(false);
        setChartingError("Journey day is not available for this station. Select your train again to reload the route for the new date.");
        return;
      }
      const originDate = typeof selectedDay === "number" ? addCalendarDays(newDate, 1 - selectedDay) : newDate;
      void fetchChartingSchedule(selectedTrainNumber, originDate, selectedBoardingCode);
      if (chartingData) {
        updateUrl(chartingData.trainNumber, chartingData.trainName, newDate);
      }
    }
  };

  const handleBoardingStationSelect = (station: TrainChartStation) => {
    setSelectedBoardingCode(station.stationCode);
    setBoardingDropdownOpen(false);
    setBoardingFilterQuery("");
    if (station.day === null) return;
    if (selectedTrainNumber) {
      const originDate = addCalendarDays(journeyDate, 1 - station.day);
      void fetchChartingSchedule(selectedTrainNumber, originDate, station.stationCode);
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
      `Boarding Station: ${stn.stationName} (${stn.stationCode}) • Day ${stn.day ?? "Not available"}`,
      `Scheduled Departure: ${stn.departureTime || stn.arrivalTime || "—"} HRS`,
      `Chart preparation station: ${describeChartingStation(stn, chartingData.stations).display}`,
      ...(describeChartingStation(stn, chartingData.stations).label ? [describeChartingStation(stn, chartingData.stations).label] : []),
      `1st Reservation Chart: ${firstIso?.fullLabel || "Not available"}`,
      `2nd (Final) Chart: ${secondIso?.fullLabel || "Not available"}`,
      `Checked via RailAgents.in`,
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!whatsappSettings.enabled) return;
    if (!chartingData || !selectedStationInfo) return;
    const stn = selectedStationInfo.station;
    const firstIso = formatIsoDateTimeIST(stn.firstChartDateTime);
    const secondIso = formatIsoDateTimeIST(stn.secondChartDateTime);

    const text = (
      `🚂 *IRCTC Train Chart Preparation Timing*\n` +
        `• *Train:* ${chartingData.trainNumber} - ${chartingData.trainName}\n` +
        `• *Boarding Station:* ${stn.stationName} (${stn.stationCode})\n` +
        `• *Scheduled Dep:* ${stn.departureTime || stn.arrivalTime || "—"} (Day ${stn.day ?? "Not available"})\n` +
        `• *Chart preparation station:* ${describeChartingStation(stn, chartingData.stations).display}\n` +
        (describeChartingStation(stn, chartingData.stations).label ? `• *${describeChartingStation(stn, chartingData.stations).label}*\n` : "") +
        `• *1st Chart Time:* *${firstIso?.fullLabel || "Not available"}*\n` +
        `• *2nd (Final) Chart:* *${secondIso?.fullLabel || "Not available"}*\n` +
        `Checked on RailAgents.in`
    );
    window.open(getWhatsAppUrl(text), "_blank");
  };

  return (
    <div className="site-tool-container space-y-3">
      {/* ══════════════════════════════════════════════════════════════════════
          1. SEARCH BAR: TRAIN NUMBER/NAME + JOURNEY DATE + BOARDING STATION
         ══════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="chart-search-heading">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#E5EAF0]">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF5EF] text-[#A34C22]">
                <Search className="h-3.5 w-3.5" />
              </span>
              <h2
                id="chart-search-heading"
                className="type-section-compact  text-[#0F172A]"
              >
                Check Train Chart Timing
              </h2>
            </div>
            <span className="type-caption inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 font-semibold text-[#0F172A]">
              <Radio className={`h-3 w-3 text-[#F36B21] ${chartingLoading ? "animate-pulse" : ""}`} />
              <span>{chartingLoading ? "Updating schedule…" : "Scheduled timings"}</span>
            </span>
          </div>

          <form
            onSubmit={(event) => event.preventDefault()}
            className="grid grid-cols-1 items-start gap-3 md:grid-cols-3 md:gap-3.5"
          >
            {/* 1. TRAIN NUMBER OR NAME */}
            <div className="relative order-1" ref={trainDropdownRef}>
              <label
                htmlFor="train-search-input"
                className="type-label mb-1 flex h-5 items-center font-bold text-[#0F172A]"
              >
                1. Train number or name
              </label>
              <div className="relative">
                <TrainFront className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A34C22]" />
                <input
                  id="train-search-input"
                  type="text"
                  autoComplete="off"
                  value={trainQuery}
                  onFocus={() => setTrainDropdownOpen(true)}
                  onChange={(e) => {
                    chartRequestId.current += 1;
                    setChartingLoading(false);
                    setTrainQuery(e.target.value);
                    setTrainSuggestions([]);
                    setTrainSearchError(null);
                    setSelectedTrainNumber("");
                    setChartingData(null);
                    setSelectedBoardingCode("");
                    setChartingError(null);
                    setTrainDropdownOpen(true);
                  }}
                  placeholder="Enter train number or name"
                  className="type-input h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-9 pr-14 font-medium text-[#0F172A] transition-colors placeholder:text-[#64748B] hover:border-[#F36B21] focus:border-[#F36B21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F36B21]/20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {trainQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        chartRequestId.current += 1;
                        setChartingLoading(false);
                        setTrainQuery("");
                        setTrainSuggestions([]);
                        setTrainSearchError(null);
                        setSelectedTrainNumber("");
                        setChartingData(null);
                        setSelectedBoardingCode("");
                        setChartingError(null);
                        setTrainDropdownOpen(true);
                      }}
                      className="type-button flex h-7 w-7 items-center justify-center text-[#64748B] hover:text-[#26374A] rounded-md cursor-pointer"
                      aria-label="Clear train search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setTrainDropdownOpen((prev) => !prev)}
                    className="type-button flex h-7 w-7 items-center justify-center text-[#64748B] hover:text-[#26374A] rounded-md cursor-pointer"
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
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full max-h-64 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white p-1.5 shadow-md">
                  <div className="type-caption px-2.5 py-1.5 font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5EAF0] mb-1 flex items-center justify-between">
                    <span>
                      {trainQuery.trim() ? "Matching trains" : "Search for a train"}
                    </span>
                    {trainSearchLoading && (
                      <span className="type-caption  text-[#A34C22] font-bold animate-pulse">
                        Searching...
                      </span>
                    )}
                  </div>

                  {trainSuggestions.length === 0 ? (
                    <div className="type-caption px-3 py-5 text-center text-[#64748B]">
                      {trainSearchLoading
                        ? "Searching trains…"
                        : trainSearchError
                          ? trainSearchError
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
                          className={`type-button w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#FFF5EF] text-[#A34C22] font-bold"
                              : "hover:bg-[#FFF5EF]/70 group"
                          }`}
                        >
                          <div className="min-w-0 pr-2 flex items-center gap-2.5">
                            <span className="type-caption shrink-0 font-mono font-black px-2 py-0.5 rounded-md bg-[#102B46] text-white group-hover:bg-[#A34C22] transition-colors">
                              {trn.trainNumber}
                            </span>
                            <span className="font-bold text-[#26374A] truncate group-hover:text-[#A34C22]">
                              {trn.trainName}
                            </span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#64748B] group-hover:text-[#A34C22]" />
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* 3. BOARDING STATION SELECTOR (FROM TRAIN ROUTE) */}
            <div className="relative order-3" ref={boardingDropdownRef}>
              <div className="mb-1 flex h-5 items-center justify-between gap-2">
                <label
                  htmlFor="boarding-station-btn"
                  className="type-label block font-bold text-[#0F172A]"
                >
                  3. Boarding station
                </label>
                {chartingData && (
                  <span className="type-caption shrink-0 font-semibold text-[#A34C22]">
                    {boardingStations.length} Boarding Stops
                  </span>
                )}
              </div>

              <button
                id="boarding-station-btn"
                type="button"
                disabled={boardingStations.length === 0}
                onClick={() => setBoardingDropdownOpen((prev) => !prev)}
                className="type-button flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-2 text-left font-medium text-[#0F172A] transition-colors hover:border-[#F36B21] focus:border-[#F36B21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F36B21]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-4 w-4 shrink-0 text-[#A34C22]" />
                  {selectedStationInfo ? (
                    <span className="min-w-0 break-words">
                      {selectedStationInfo.station.stationName} (
                      {selectedStationInfo.station.stationCode})
                    </span>
                  ) : (
                    <span className="text-[#64748B]">Select boarding station</span>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#64748B] transition-transform ${
                    boardingDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {boardingStations.length === 0 && (
                <p className="type-body-small mt-1 leading-tight text-[#64748B]" aria-live="polite">
                  {chartingLoading
                    ? "Loading boarding stations…"
                    : !selectedTrainNumber
                      ? "Select a train first."
                      : !journeyDate
                        ? "Choose a journey date to load this train’s stations."
                        : "No boarding stations are available for this train and date."}
                </p>
              )}

              {boardingDropdownOpen && chartingData && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-72 w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-md flex flex-col sm:right-0 sm:left-auto sm:w-80">
                  <div className="p-2 border-b border-[#E5EAF0] bg-[#F5F7FA]/70">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]" />
                      <input
                        type="text"
                        value={boardingFilterQuery}
                        onChange={(e) => setBoardingFilterQuery(e.target.value)}
                        placeholder="Filter route stations..."
                        className="type-input w-full h-8 rounded-lg border border-[#E5EAF0] bg-white pl-8 pr-2.5 font-semibold text-[#26374A] focus:border-[#E87535] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto p-1.5 max-h-56 divide-y divide-[#E5EAF0]">
                    {filteredBoardingDropdownStations.length === 0 ? (
                      <div className="type-caption px-3 py-4 text-center text-[#64748B]">
                        No route station matches &ldquo;{boardingFilterQuery}&rdquo;
                      </div>
                    ) : (
                      filteredBoardingDropdownStations.map((stn, idx) => {
                        const isSelected = stn.stationCode === selectedBoardingCode;
                        return (
                          <button
                            key={stn.stationCode}
                            type="button"
                            onClick={() => handleBoardingStationSelect(stn)}
                            className={`type-button w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#FFF5EF] text-[#A34C22] font-bold"
                                : "hover:bg-[#FFF5EF]/60"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#26374A] truncate">
                                  {stn.stationName}
                                </span>
                                {idx === 0 && !boardingFilterQuery && (
                                  <span className="type-caption rounded bg-[#E7F4F2] px-1.5 py-0.2 font-extrabold text-[#087F70]">
                                    ORIGIN
                                  </span>
                                )}
                              </div>
                              <span className="type-caption  text-[#64748B] block">
                                Boarding stop · Day {stn.day ?? "Not available"}
                              </span>
                            </div>
                            <span className="type-caption shrink-0 font-mono font-extrabold px-2 py-0.5 rounded bg-[#F5F7FA] text-[#26374A]">
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

            {/* 2. JOURNEY DATE PICKER */}
            <div className="order-2">
              <div className="mb-1 flex h-5 items-center">
                <label
                  htmlFor="chart-journey-date"
                  className="type-label block whitespace-nowrap font-bold text-[#0F172A]"
                >
                  2. Journey date
                </label>
              </div>
              <div className="relative">
                <input
                  id="chart-journey-date"
                  type="date"
                  value={journeyDate}
                  placeholder="Select journey date"
                  title="Date you plan to board the train"
                  onFocus={() => setDateInputFocused(true)}
                  onBlur={() => setDateInputFocused(false)}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`type-input h-11 w-full cursor-pointer rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 font-medium transition-colors hover:border-[#F36B21] focus:border-[#F36B21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F36B21]/20 ${journeyDate || dateInputFocused ? "text-[#0F172A]" : "text-transparent"}`}
                />
                {!journeyDate && !dateInputFocused && <span aria-hidden="true" className="type-helper pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-[#64748B]">Select journey date</span>}
              </div>
            </div>
          </form>
          <p className="type-body-small mt-2.5 leading-snug text-[#64748B]">Select your train, boarding station and journey date to check scheduled chart preparation time.</p>
        </div>
      </section>

      {/* ERROR STATE */}
      {chartingError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 sm:p-5 text-rose-900 flex items-start gap-3 shadow-xs"
        >
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="type-caption  ">
            <p className="type-body font-extrabold text-rose-950">
              Unable to Fetch Chart Preparation Timing
            </p>
            <p className="type-body mt-1 text-rose-800 leading-relaxed">{chartingError}</p>
          </div>
        </div>
      )}

      {!canShowResults && !chartingError && (
        <section
          aria-live="polite"
          className="rounded-2xl border border-[#E5EAF0] bg-white px-4 py-5 text-center shadow-sm"
        >
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF5EF] text-[#A34C22]">
            {chartingLoading ? <Clock className="h-5 w-5 animate-pulse" /> : <TrainFront className="h-5 w-5" />}
          </span>
          <h3 className="type-h3 mt-3 text-[#102B46]">
            {chartingLoading
              ? "Loading chart schedule"
              : chartingData && !selectedStationInfo
                ? "Select your boarding station"
              : selectedTrainNumber && !journeyDate
                ? "Choose your journey date"
                : "Search for a train to get started"}
          </h3>
          <p className="type-body-small mx-auto mt-1 max-w-md leading-relaxed text-[#64748B]">
            {chartingLoading
              ? "We’re retrieving the chart timings and route stations."
              : chartingData && !selectedStationInfo
                ? "Step 3 of 3: Choose your boarding station in the form above. Your chart timings and route details will appear here once all three fields are complete."
              : selectedTrainNumber && !journeyDate
                ? "The train is selected. Choose a date above to load its route, then select your boarding station."
                : "Enter a train number or name, choose a journey date, then select your boarding station."}
          </p>
          {chartingLoading && <div aria-hidden="true" className="mt-5 grid animate-pulse gap-3 text-left sm:grid-cols-2">{[0, 1].map((item) => <div key={item} className="rounded-xl border border-[#E5EAF0] bg-[#F5F7FA] p-4"><div className="h-3 w-24 rounded bg-[#EDF2F7]" /><div className="mt-3 h-8 w-40 rounded bg-[#EDF2F7]" /><div className="mt-3 h-3 w-32 rounded bg-[#EDF2F7]" /></div>)}</div>}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          2. JOURNEY TIMELINE AND SELECTED STATION CHART TIMINGS
         ══════════════════════════════════════════════════════════════════════ */}
      {canShowResults && chartingData && selectedStationInfo && (() => {
        const station = selectedStationInfo.station;
        const originStation = chartingData.stations.find((item) => item.stationCode === chartingData.originStation);
        const destinationStation = chartingData.stations.find((item) => item.stationCode === chartingData.destinationStation);
        const boardingDate = station.day === null ? null : addCalendarDays(chartingData.journeyDate, station.day - 1);
        const compactDate = (iso: string) => new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "2-digit", month: "short", year: "numeric" });
        const chartStation = describeChartingStation(station, chartingData.stations);
        const chartCards = [
          { heading: "01 · First Chart", iso: station.firstChartDateTime },
          { heading: "02 · Final Chart", iso: station.secondChartDateTime },
        ];
        return (
          <section
            aria-labelledby="boarding-station-spotlight-heading"
            className="w-full overflow-hidden rounded-lg border-[1.5px] border-[#FED7AA] bg-[#FFFFFF]"
          >
            <header className="flex min-w-0 items-center justify-between gap-3 border-b border-[#FED7AA] bg-[#FFFFFF] px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2">
                <TrainFront aria-hidden="true" strokeWidth={2.25} className="h-4 w-4 shrink-0 text-[#F36B21]" />
                <h2
                  id="boarding-station-spotlight-heading"
                  className="type-section-compact min-w-0 break-words text-[#171717] "
                >
                  {chartingData.trainNumber} · {chartingData.trainName}
                </h2>
              </div>
              <span className="type-caption hidden shrink-0 items-center gap-1.5 rounded-sm border-[1.5px] border-[#FED7AA] bg-[#FFFFFF] px-2.5 py-1 font-bold text-[#171717] sm:inline-flex">
                <CalendarDays aria-hidden="true" strokeWidth={2.25} className="h-3.5 w-3.5 text-[#F36B21]" />
                Chart timing at boarding station
              </span>
            </header>

            <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)]">
              <RouteStationCard station={originStation} code={chartingData.originStation} journeyDate={chartingData.journeyDate} />

              <div className="grid min-w-0 gap-3 rounded-lg border border-orange-100 bg-orange-50/30 p-3">
                <div className="min-w-0 w-full">
                  <p className="type-body  font-black uppercase tracking-[0.08em] text-[#F36B21]">
                    YOUR BOARDING STATION
                  </p>
                  <h3 className="type-h3 mt-1 w-full break-words text-[#171717] ">
                    {station.stationName}{" "}
                    <span className="type-body-small font-mono font-bold text-[#525252] ">
                      ({station.stationCode})
                    </span>
                  </h3>
                  <div className="type-helper mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-semibold leading-snug text-[#525252]">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays
                        aria-hidden="true"
                        strokeWidth={2.25}
                        className="h-3.5 w-3.5 shrink-0 text-[#F36B21]"
                      />
                      <span>
                        {boardingDate ? compactDate(boardingDate) : "Not available"}
                        {typeof station.day === "number" && (
                          <span className="font-bold text-[#171717]"> · Day {station.day}</span>
                        )}
                      </span>
                    </span>
                    <span className="inline-flex flex-wrap items-center gap-x-2">
                      <Clock
                        aria-hidden="true"
                        strokeWidth={2.25}
                        className="h-3.5 w-3.5 shrink-0 text-[#F36B21]"
                      />
                      <span>
                        Arrival:{" "}
                        <strong className="font-extrabold tabular-nums text-[#171717]">
                          {station.arrivalTime || "—"}
                        </strong>
                      </span>
                      <span className="font-bold text-[#525252]">·</span>
                      <span>
                        Departure:{" "}
                        <strong className="font-extrabold tabular-nums text-[#171717]">
                          {station.departureTime || "—"}
                        </strong>
                      </span>
                    </span>
                  </div>
                  <div data-charting-kind={chartStation.kind} className={`mt-3 rounded-lg border p-3 ${chartingStyles[chartStation.kind].panel}`}>
                    <p className="type-body  font-bold uppercase tracking-wide text-slate-600">Chart preparation station</p>
                    <p className="type-body mt-1 break-words font-extrabold leading-snug text-[#102B46]">{chartStation.display}</p>
                    {chartStation.label && <span className={`type-caption mt-2 inline-flex rounded-md border px-2 py-1 font-bold ${chartingStyles[chartStation.kind].badge}`}>{chartStation.label}</span>}
                  </div>
                </div>


                <div className="grid min-w-0 grid-cols-2 items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-2.5">
                  {chartCards.map(({ heading, iso }, index) => {
                    const timing = formatIsoDateTimeIST(iso);
                    const scheduleStatus = getScheduleStatus(iso);
                    return (
                      <Fragment key={heading}>
                        <div className="flex min-w-0 flex-col justify-between rounded-md border-[1.5px] border-[#FED7AA] bg-[#FFFFFF] px-3 py-3 sm:px-3.5">
                          <div>
                            <h4 className="type-h4  uppercase tracking-[0.06em] text-[#F36B21] ">
                              {heading}
                            </h4>
                            <p
                              className={`type-body-large mt-1.5 break-words font-black leading-tight tabular-nums tracking-tight ${
                                timing && !chartingLoading
                                  ? "text-[#171717]"
                                  : "text-[#525252]"
                              }`}
                            >
                              {chartingLoading
                                ? "Loading…"
                                : timing?.time12 || "Not available"}
                            </p>
                            <p className="type-body-small mt-1 break-words font-bold leading-snug text-[#525252]">
                              {chartingLoading
                                ? "Updating chart date…"
                                : timing
                                  ? `${timing.dateLabel} · IST`
                                  : "Date not available"}
                            </p>
                          </div>
                          {!chartingLoading &&
                            timing &&
                            scheduleStatus.state !== "unknown" && (
                              <ChartScheduleStatus
                                status={scheduleStatus}
                                mounted={mounted}
                              />
                            )}
                        </div>
                        {index === 0 && (
                          <div
                            aria-hidden="true"
                            className="hidden items-center justify-center py-0.5 sm:flex sm:px-0.5 sm:py-0"
                          >
                            <ArrowRight strokeWidth={2.5} className="h-5 w-5 shrink-0 rotate-90 text-[#F36B21] sm:rotate-0" />
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>

              <RouteStationCard station={destinationStation} code={chartingData.destinationStation} journeyDate={chartingData.journeyDate} destination />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#FED7AA] bg-[#FFFFFF] px-3 py-2.5 sm:px-4">
              <p className="type-body  font-semibold leading-tight text-[#525252]">
                Scheduled times; actual chart preparation isn’t confirmed.
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleCopySchedule}
                  className="type-button inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-sm border-[1.5px] border-[#FED7AA] bg-[#FFFFFF] px-2.5 font-bold text-[#171717] transition-colors hover:border-[#F36B21] hover:text-[#F36B21]"
                >
                  {copied ? (
                    <Check strokeWidth={2.25} className="h-3.5 w-3.5 text-[#F36B21]" />
                  ) : (
                    <Copy strokeWidth={2.25} className="h-3.5 w-3.5 text-[#F36B21]" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                {whatsappSettings.enabled && (<button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="type-button inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-sm border-[1.5px] border-[#FED7AA] bg-[#FFFFFF] px-2.5 font-bold text-[#171717] transition-colors hover:border-[#F36B21] hover:text-[#F36B21]"
                >
                  <Share2 strokeWidth={2.25} className="h-3.5 w-3.5 text-[#F36B21]" />
                  Share
                </button>)}
              </div>
            </div>
          </section>
        );
      })()}


      {canShowResults && chartingData && chartingData.stations.length > 0 && (
        <>
          <section aria-labelledby="route-stations-heading" className="overflow-hidden rounded-xl border border-[#E5EAF0] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5EAF0] px-3 py-2.5 sm:px-4">
              <div>
                <h2 id="route-stations-heading" className="type-section-compact  text-[#102B46]">Route stations</h2>
                <p className="type-body-small mt-0.5 text-[#64748B]">Arrival, departure and both chart timings for each station.</p>
              </div>
              <label className="type-label relative block w-full sm:w-56">
                <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
                <span className="sr-only">Filter route stations</span>
                <input type="search" value={tableStationSearch} onChange={(event) => setTableStationSearch(event.target.value)} placeholder="Find a station" className="type-input h-9 w-full rounded-lg border border-[#E5EAF0] bg-white pl-8 pr-3 text-[#26374A] outline-none focus:border-[#087F70] focus:ring-2 focus:ring-[#087F70]/15" />
              </label>
            </div>
            <div className="overflow-x-auto" role="region" aria-label="Station and chart timings" tabIndex={0}>
              <table className="type-table w-full min-w-[780px] table-fixed text-left" aria-label="Train route and chart preparation times">
                <colgroup>
                  <col className="w-[30%]" /><col className="w-[10%]" /><col className="w-[10%]" />
                  <col className="w-[6%]" /><col className="w-[22%]" /><col className="w-[22%]" />
                </colgroup>
                <thead className="type-caption bg-slate-100 font-extrabold uppercase tracking-wide text-slate-700">
                  <tr>
                    <th scope="col" className="type-table border-r border-slate-200 px-4 py-3 text-[#102B46]">Station</th>
                    <th scope="col" className="type-table px-2 py-3 text-center">Arrival</th>
                    <th scope="col" className="type-table px-2 py-2.5 text-center">Departure</th>
                    <th scope="col" className="type-table px-2 py-2.5 text-center">Day</th>
                    <th scope="col" className="type-table border-l-2 border-orange-200 bg-orange-100/70 px-3 py-3 text-orange-900">First Chart</th>
                    <th scope="col" className="type-table border-l-2 border-teal-200 bg-teal-100/60 px-3 py-3 text-teal-900">Second Chart</th>
                  </tr>
                </thead>
                <tbody className="type-body-small divide-y divide-slate-200 ">
                  {filteredTableStations.length === 0 ? (
                    <tr><td colSpan={6} className="type-table px-3 py-6 text-center text-[#64748B]">No stations match your search.</td></tr>
                  ) : filteredTableStations.map((stationRow) => {
                    const index = chartingData.stations.indexOf(stationRow);
                    const isLastStation = index === chartingData.stations.length - 1;
                    const selected = stationRow.stationCode === selectedBoardingCode;
                    const chartStation = describeChartingStation(stationRow, chartingData.stations);
                    return (
                      <tr key={stationRow.stationCode + "-" + index} className={selected ? "bg-orange-50/40" : "bg-white hover:bg-[#FFFCFA]"}>
                        <th scope="row" className="type-table border-r border-slate-200 px-4 py-3 text-left">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="type-caption rounded bg-slate-100 px-1.5 py-0.5 font-mono font-bold text-slate-600">{stationRow.stationCode}</span>
                            <span className="font-bold text-[#171717]">{stationRow.stationName}</span>
                            {index === 0 && <span className="type-caption  font-medium text-slate-600">Origin</span>}
                            {index === chartingData.stations.length - 1 && <span className="type-caption  text-[#64748B]">Destination</span>}
                            {selected && <span className="type-caption rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 font-bold text-orange-900">Your boarding</span>}
                          </div>
                          <div className="type-caption mt-2 break-words font-medium leading-relaxed text-slate-600">
                            <span className="block">Chart preparation: <strong className="font-bold text-[#102B46]">{chartStation.display}</strong></span>
                            {chartStation.label && <span className={`type-caption mt-1 inline-flex rounded border px-1.5 py-0.5 font-semibold ${chartingStyles[chartStation.kind].badge}`}>{chartStation.label}</span>}
                          </div>
                        </th>
                        <td className="type-table bg-slate-50/50 px-2 py-3 text-center font-semibold tabular-nums text-[#171717]">{stationRow.arrivalTime || "—"}</td>
                        <td className="type-table px-2 py-2.5 text-center font-semibold tabular-nums text-[#171717]">{stationRow.departureTime || "—"}</td>
                        <td className="type-table px-2 py-2.5 text-center font-semibold text-slate-700">{stationRow.day ?? "Not available"}</td>
                        {[stationRow.firstChartDateTime, stationRow.secondChartDateTime].map((iso, chartIndex) => {
                          const timing = isLastStation ? null : formatIsoDateTimeIST(iso);
                          return (
                            <td key={chartIndex} className={`type-table ${"border-l-2 px-3 py-3 align-top " + (chartIndex === 0 ? "border-orange-200 bg-orange-50/40" : "border-teal-200 bg-teal-50/40")}`}>
                              <p className={`type-body ${" font-extrabold tabular-nums " + (chartIndex === 0 ? "text-orange-950" : "text-teal-950")}`}>{isLastStation ? "—" : timing?.time12 || "Not available"}</p>
                              {timing && <p className="type-body-small mt-1 font-medium leading-5 text-slate-600">{timing.dateLabel} · IST</p>}
                              {timing && <ChartScheduleStatus status={getScheduleStatus(iso)} mounted={mounted} />}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="type-body-small border-t border-[#E5EAF0] px-4 py-2 text-[#64748B]">Scheduled chart timings from the provider; actual preparation is not confirmed. Swipe horizontally on small screens to view all columns.</p>

          </section>
        </>
      )}
    </div>
  );
}
