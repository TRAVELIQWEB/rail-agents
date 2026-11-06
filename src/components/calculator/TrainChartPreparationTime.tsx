"use client";

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
  Sparkles,
  Copy,
  Check,
  Share2,
  ChevronDown,
  AlertCircle,
  ArrowRight,
  Radio,
  HelpCircle,
  X,
} from "lucide-react";
import { addCalendarDays } from "@/lib/railway-calculator-logic";
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
    return <span className="mt-1.5 text-[11.5px] font-bold text-[#525252]">Checking status…</span>;
  }

  if (status.state === "pending") {
    return <span className="mt-1.5 text-[11.5px] font-extrabold text-[#EA580C]">Scheduled</span>;
  }

  return (
    <span className="mt-1.5 text-[11.5px] font-bold text-[#525252]">
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
  const [journeyDate, setJourneyDate] = useState<string>("");
  const [dateInputFocused, setDateInputFocused] = useState(false);
  const [selectedBoardingCode, setSelectedBoardingCode] = useState<string>("");

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
  const [expandedStationCode, setExpandedStationCode] = useState<string | null>(null);

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
    [selectedBoardingCode]
  );

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
    setExpandedStationCode(null);
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
      const selectedDay = selectedStationInfo?.station.day ?? 1;
      const originDate = addCalendarDays(newDate, 1 - selectedDay);
      void fetchChartingSchedule(selectedTrainNumber, originDate, selectedBoardingCode);
    }
  };

  const handleBoardingStationSelect = (station: TrainChartStation) => {
    setSelectedBoardingCode(station.stationCode);
    setBoardingDropdownOpen(false);
    setBoardingFilterQuery("");
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
      `Boarding Station: ${stn.stationName} (${stn.stationCode}) • Day ${stn.day}`,
      `Scheduled Departure: ${stn.departureTime || stn.arrivalTime || "—"} HRS`,
      `Charting Quota Station: ${getRemoteStationDisplay(stn.chartRemoteStation)}`,
      `1st Reservation Chart: ${firstIso?.fullLabel || "Not available"}`,
      `2nd (Final) Chart: ${secondIso?.fullLabel || "Not available"}`,
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
        `• *1st Chart Time:* *${firstIso?.fullLabel || "Not available"}*\n` +
        `• *2nd (Final) Chart:* *${secondIso?.fullLabel || "Not available"}*\n` +
        `Checked on RailAgents.in`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="site-tool-container space-y-4 sm:space-y-5">
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
                className="text-base font-bold text-[#0F172A] sm:text-lg"
              >
                Check Train Chart Timing
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#0F172A]">
              <Radio className={`h-3 w-3 text-[#F97316] ${chartingLoading ? "animate-pulse" : ""}`} />
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
                className="mb-1 flex h-5 items-center text-[11px] font-bold text-[#0F172A]"
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
                  className="h-11 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-9 pr-14 text-[13px] font-medium text-[#0F172A] transition-colors placeholder:text-[#64748B] hover:border-[#F97316] focus:border-[#F97316] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
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
                      className="p-1 text-[#64748B] hover:text-[#26374A] rounded-md cursor-pointer"
                      aria-label="Clear train search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setTrainDropdownOpen((prev) => !prev)}
                    className="p-1 text-[#64748B] hover:text-[#26374A] rounded-md cursor-pointer"
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
                  <div className="px-2.5 py-1.5 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider border-b border-[#E5EAF0] mb-1 flex items-center justify-between">
                    <span>
                      {trainQuery.trim() ? "Matching trains" : "Search for a train"}
                    </span>
                    {trainSearchLoading && (
                      <span className="text-[10px] text-[#A34C22] font-bold animate-pulse">
                        Searching...
                      </span>
                    )}
                  </div>

                  {trainSuggestions.length === 0 ? (
                    <div className="px-3 py-5 text-center text-xs text-[#64748B]">
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
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#FFF5EF] text-[#A34C22] font-bold"
                              : "hover:bg-[#FFF5EF]/70 group"
                          }`}
                        >
                          <div className="min-w-0 pr-2 flex items-center gap-2.5">
                            <span className="shrink-0 font-mono text-[11px] font-black px-2 py-0.5 rounded-md bg-[#102B46] text-white group-hover:bg-[#A34C22] transition-colors">
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
                  className="block text-[11px] font-bold text-[#0F172A]"
                >
                  3. Boarding station
                </label>
                {chartingData && (
                  <span className="shrink-0 text-[10px] font-semibold text-[#A34C22]">
                    {boardingStations.length} Boarding Stops
                  </span>
                )}
              </div>

              <button
                id="boarding-station-btn"
                type="button"
                disabled={boardingStations.length === 0}
                onClick={() => setBoardingDropdownOpen((prev) => !prev)}
                className="flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-left text-[13px] font-medium text-[#0F172A] transition-colors hover:border-[#F97316] focus:border-[#F97316] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-4 w-4 shrink-0 text-[#A34C22]" />
                  {selectedStationInfo ? (
                    <span className="truncate">
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
                <p className="mt-1 text-[10px] leading-tight text-[#64748B]" aria-live="polite">
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
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full sm:w-80 max-h-72 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-md flex flex-col">
                  <div className="p-2 border-b border-[#E5EAF0] bg-[#F5F7FA]/70">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]" />
                      <input
                        type="text"
                        value={boardingFilterQuery}
                        onChange={(e) => setBoardingFilterQuery(e.target.value)}
                        placeholder="Filter route stations..."
                        className="w-full h-8 rounded-lg border border-[#E5EAF0] bg-white pl-8 pr-2.5 text-xs font-semibold text-[#26374A] focus:border-[#E87535] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto p-1.5 max-h-56 divide-y divide-[#E5EAF0]">
                    {filteredBoardingDropdownStations.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-[#64748B]">
                        No route station matches &ldquo;{boardingFilterQuery}&rdquo;
                      </div>
                    ) : (
                      filteredBoardingDropdownStations.map((stn, idx) => {
                        const isSelected = stn.stationCode === selectedBoardingCode;
                        const firstChart = formatIsoDateTimeIST(stn.firstChartDateTime);
                        return (
                          <button
                            key={stn.stationCode}
                            type="button"
                            onClick={() => handleBoardingStationSelect(stn)}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
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
                                  <span className="rounded bg-[#E7F4F2] px-1.5 py-0.2 text-[9px] font-extrabold text-[#087F70]">
                                    ORIGIN
                                  </span>
                                )}
                              </div>
                              <span className="text-[10.5px] text-[#64748B] block">
                                Day {stn.day} •{" "}
                                {stn.departureTime
                                  ? `Dep ${stn.departureTime}`
                                  : `Arr ${stn.arrivalTime}`}{" "}
                                • 1st Chart: {firstChart?.time12 || "Not available"}
                              </span>
                            </div>
                            <span className="shrink-0 font-mono text-[10.5px] font-extrabold px-2 py-0.5 rounded bg-[#F5F7FA] text-[#26374A]">
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
                  className="block whitespace-nowrap text-[11px] font-bold text-[#0F172A]"
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
                  className={`h-11 w-full cursor-pointer rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-[13px] font-medium transition-colors hover:border-[#F97316] focus:border-[#F97316] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 ${journeyDate || dateInputFocused ? "text-[#0F172A]" : "text-transparent"}`}
                />
                {!journeyDate && !dateInputFocused && <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-[13px] text-[#64748B]">Select journey date</span>}
              </div>
            </div>
          </form>
          <p className="mt-2.5 text-[11px] leading-snug text-[#64748B]">Select your train, boarding station and journey date to check scheduled chart preparation time.</p>
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
          className="rounded-2xl border border-[#E5EAF0] bg-white px-5 py-8 text-center shadow-sm sm:py-10"
        >
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF5EF] text-[#A34C22]">
            {chartingLoading ? <Clock className="h-5 w-5 animate-pulse" /> : <TrainFront className="h-5 w-5" />}
          </span>
          <h3 className="mt-3 text-base font-bold text-[#102B46]">
            {chartingLoading
              ? "Loading chart schedule"
              : selectedTrainNumber && !journeyDate
                ? "Choose your journey date"
                : "Search for a train to get started"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-[#64748B]">
            {chartingLoading
              ? "We’re retrieving the chart timings and route stations."
              : selectedTrainNumber && !journeyDate
                ? "The train is selected. Choose a date above to load its route, then select your boarding station."
                : "Enter a train number or name, choose a journey date, then select your boarding station."}
          </p>
          {chartingLoading && <div aria-hidden="true" className="mt-5 grid animate-pulse gap-3 text-left sm:grid-cols-2">{[0, 1].map((item) => <div key={item} className="rounded-xl border border-[#E5EAF0] bg-[#F5F7FA] p-4"><div className="h-3 w-24 rounded bg-[#EDF2F7]" /><div className="mt-3 h-8 w-40 rounded bg-[#EDF2F7]" /><div className="mt-3 h-3 w-32 rounded bg-[#EDF2F7]" /></div>)}</div>}
        </section>
      )}

      {chartingData && !selectedStationInfo && !chartingLoading && (
        <p role="status" className="rounded-lg border border-[#E5EAF0] bg-white px-3 py-2 text-xs text-[#64748B]">
          Train route loaded. Choose your boarding station above and set the journey date to view its chart timings.
        </p>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          2. JOURNEY TIMELINE AND SELECTED STATION CHART TIMINGS
         ══════════════════════════════════════════════════════════════════════ */}
      {chartingData && selectedStationInfo && (() => {
        const station = selectedStationInfo.station;
        const originStation = chartingData.stations[0];
        const destinationStation = chartingData.stations[chartingData.stations.length - 1];
        const boardingDate = addCalendarDays(chartingData.journeyDate, Math.max(0, station.day - 1));
        const compactDate = (iso: string) => new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "2-digit", month: "short", year: "numeric" });
        const stationJourneyDate = (day: number) => {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(chartingData.journeyDate) || !Number.isFinite(day)) return null;
          return compactDate(addCalendarDays(chartingData.journeyDate, Math.max(0, day - 1)));
        };
        const renderRouteCard = (
          routeStation: TrainChartStation | undefined,
          label: string,
          timeLabel: "Departure" | "Arrival"
        ) => {
          const stationTime =
            timeLabel === "Departure"
              ? routeStation?.departureTime
              : routeStation?.arrivalTime;

          return (
            <div className="flex min-w-0 flex-col justify-start rounded-lg border-[1.5px] border-[#FED7AA] bg-[#FFFFFF] p-3.5 sm:p-4">
              <p className="text-[11.5px] font-extrabold uppercase tracking-[0.08em] text-[#525252]">
                {label}
              </p>
              <p className="mt-1.5 w-full break-words text-base font-extrabold leading-snug text-[#171717]">
                {routeStation ? (
                  <>
                    {routeStation.stationName}{" "}
                    <span className="font-mono text-[13px] font-bold text-[#525252]">
                      ({routeStation.stationCode})
                    </span>
                  </>
                ) : (
                  "Station unavailable"
                )}
              </p>
              <div className="my-2.5 border-t border-[#FED7AA]" />
              <p className="flex items-start gap-2 text-[12.5px] font-semibold leading-snug text-[#525252]">
                <CalendarDays
                  aria-hidden="true"
                  strokeWidth={2.25}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#EA580C]"
                />
                <span>
                  {routeStation
                    ? stationJourneyDate(routeStation.day) || "Date unavailable"
                    : "Date unavailable"}
                  {routeStation && typeof routeStation.day === "number" && (
                    <span className="font-bold text-[#171717]"> · Day {routeStation.day}</span>
                  )}
                </span>
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-[12.5px] font-semibold leading-snug text-[#525252]">
                <Clock
                  aria-hidden="true"
                  strokeWidth={2.25}
                  className="h-3.5 w-3.5 shrink-0 text-[#EA580C]"
                />
                <span>
                  {timeLabel}:{" "}
                  <strong className="font-extrabold tabular-nums text-[#171717]">
                    {stationTime || "Time unavailable"}
                  </strong>
                </span>
              </p>
            </div>
          );
        };
        const routeStationDisplay = (code: string) => {
          const routeStation = chartingData.stations.find((item) => item.stationCode === code);
          return routeStation ? `${routeStation.stationName} (${routeStation.stationCode})` : code;
        };
        const chartStationCode = station.chartRemoteStation || chartingData.originStation;
        const chartStationDisplay = routeStationDisplay(chartStationCode);
        const chartStationIsBoardingStation = chartStationCode === station.stationCode;
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
                <TrainFront aria-hidden="true" strokeWidth={2.25} className="h-4 w-4 shrink-0 text-[#EA580C]" />
                <h2
                  id="boarding-station-spotlight-heading"
                  className="min-w-0 truncate text-lg font-extrabold leading-tight text-[#171717] sm:text-[19px]"
                >
                  {chartingData.trainNumber} · {chartingData.trainName}
                </h2>
              </div>
              <span className="hidden shrink-0 items-center gap-1.5 rounded-sm border-[1.5px] border-[#FED7AA] bg-[#FFFFFF] px-2.5 py-1 text-[11.5px] font-bold text-[#171717] sm:inline-flex">
                <CalendarDays aria-hidden="true" strokeWidth={2.25} className="h-3.5 w-3.5 text-[#EA580C]" />
                Chart timing at boarding station
              </span>
            </header>

            <div className="grid grid-cols-1 gap-3 p-3 sm:gap-3.5 sm:p-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,2.8fr)_minmax(0,1.1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)] md:items-stretch">
              {renderRouteCard(originStation, "Origin Station", "Departure")}

              <div className="flex min-w-0 flex-col justify-between rounded-lg border-2 border-[#EA580C] bg-[#FFFFFF] p-3.5 sm:p-4">
                <div className="min-w-0 w-full">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[#EA580C]">
                    YOUR BOARDING STATION
                  </p>
                  <h3 className="mt-1 w-full break-words text-lg font-extrabold leading-snug text-[#171717] sm:text-xl">
                    {station.stationName}{" "}
                    <span className="font-mono text-sm font-bold text-[#525252] sm:text-[15px]">
                      ({station.stationCode})
                    </span>
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] font-semibold leading-snug text-[#525252]">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays
                        aria-hidden="true"
                        strokeWidth={2.25}
                        className="h-3.5 w-3.5 shrink-0 text-[#EA580C]"
                      />
                      <span>
                        {compactDate(boardingDate)}
                        {typeof station.day === "number" && (
                          <span className="font-bold text-[#171717]"> · Day {station.day}</span>
                        )}
                      </span>
                    </span>
                    <span className="inline-flex flex-wrap items-center gap-x-2">
                      <Clock
                        aria-hidden="true"
                        strokeWidth={2.25}
                        className="h-3.5 w-3.5 shrink-0 text-[#EA580C]"
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
                  {!chartStationIsBoardingStation && (
                    <p className="mt-1.5 break-words text-xs font-semibold leading-snug text-[#525252]">
                      Chart preparation station:{" "}
                      <strong className="font-extrabold text-[#171717]">
                        {chartStationDisplay}
                      </strong>
                    </p>
                  )}
                </div>

                <div className="my-3 border-t border-[#FED7AA]" />

                <div className="grid min-w-0 grid-cols-1 items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-2.5">
                  {chartCards.map(({ heading, iso }, index) => {
                    const timing = formatIsoDateTimeIST(iso);
                    const scheduleStatus = getScheduleStatus(iso);
                    return (
                      <Fragment key={heading}>
                        <div className="flex min-w-0 flex-col justify-between rounded-md border-[1.5px] border-[#FED7AA] bg-[#FFFFFF] px-3 py-3 sm:px-3.5">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-[0.06em] text-[#EA580C] sm:text-[13px]">
                              {heading}
                            </h4>
                            <p
                              className={`mt-1.5 break-words text-2xl font-black leading-tight tabular-nums tracking-tight sm:text-[26px] ${
                                timing && !chartingLoading
                                  ? "text-[#171717]"
                                  : "text-[#525252]"
                              }`}
                            >
                              {chartingLoading
                                ? "Loading…"
                                : timing?.time12 || "Not available"}
                            </p>
                            <p className="mt-1 break-words text-xs font-bold leading-snug text-[#525252]">
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
                            className="flex items-center justify-center py-0.5 sm:px-0.5 sm:py-0"
                          >
                            <ArrowRight strokeWidth={2.5} className="h-5 w-5 shrink-0 rotate-90 text-[#EA580C] sm:rotate-0" />
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>

              {renderRouteCard(destinationStation, "Destination Station", "Arrival")}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#FED7AA] bg-[#FFFFFF] px-3 py-2.5 sm:px-4">
              <p className="text-[11.5px] font-semibold leading-tight text-[#525252]">
                Scheduled times; actual chart preparation isn’t confirmed.
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleCopySchedule}
                  className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-sm border-[1.5px] border-[#FED7AA] bg-[#FFFFFF] px-2.5 text-xs font-bold text-[#171717] transition-colors hover:border-[#EA580C] hover:text-[#EA580C]"
                >
                  {copied ? (
                    <Check strokeWidth={2.25} className="h-3.5 w-3.5 text-[#EA580C]" />
                  ) : (
                    <Copy strokeWidth={2.25} className="h-3.5 w-3.5 text-[#EA580C]" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-sm border-[1.5px] border-[#FED7AA] bg-[#FFFFFF] px-2.5 text-xs font-bold text-[#171717] transition-colors hover:border-[#EA580C] hover:text-[#EA580C]"
                >
                  <Share2 strokeWidth={2.25} className="h-3.5 w-3.5 text-[#EA580C]" />
                  Share
                </button>
              </div>
            </div>
          </section>
        );
      })()}


      {chartingData && chartingData.stations.length > 0 && (
        <>
          <section aria-labelledby="route-stations-heading" className="overflow-hidden rounded-xl border border-[#E5EAF0] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5EAF0] px-3 py-2.5 sm:px-4">
              <div>
                <h2 id="route-stations-heading" className="text-sm font-bold text-[#102B46]">Route stations</h2>
                <p className="mt-0.5 text-xs text-[#64748B]">Select a station to see its chart timings above.</p>
              </div>
              <label className="relative block w-full sm:w-56">
                <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
                <span className="sr-only">Filter route stations</span>
                <input type="search" value={tableStationSearch} onChange={(event) => setTableStationSearch(event.target.value)} placeholder="Find a station" className="h-9 w-full rounded-lg border border-[#E5EAF0] bg-white pl-8 pr-3 text-xs text-[#26374A] outline-none focus:border-[#087F70] focus:ring-2 focus:ring-[#087F70]/15" />
              </label>
            </div>
            <table className="w-full table-fixed text-left" aria-label="Train route station arrival and departure times">
              <colgroup><col className="w-[52%] sm:w-[58%]" /><col className="w-[17%] sm:w-[15%]" /><col className="w-[17%] sm:w-[15%]" /><col className="w-[14%] sm:w-[12%]" /></colgroup>
              <thead className="bg-[#F5F7FA] text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                <tr><th scope="col" className="px-2 py-2.5 sm:px-4">Station</th><th scope="col" className="px-1 py-2.5 text-center sm:px-2">Arrival</th><th scope="col" className="px-1 py-2.5 text-center sm:px-2">Departure</th><th scope="col" className="px-1 py-2.5 text-center sm:px-2">Day</th></tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF0] text-xs">
                {filteredTableStations.length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-[#64748B]">No stations match your search.</td></tr>
                ) : filteredTableStations.map((stationRow) => {
                  const originalIndex = chartingData.stations.indexOf(stationRow);
                  const isOrigin = originalIndex === 0;
                  const isDestination = originalIndex === chartingData.stations.length - 1;
                  const isExpanded = stationRow.stationCode === expandedStationCode;
                  const remoteStation = stationRow.chartRemoteStation;
                  const remoteStationDisplay = getRemoteStationDisplay(remoteStation);
                  const firstChart = formatIsoDateTimeIST(stationRow.firstChartDateTime);
                  const secondChart = formatIsoDateTimeIST(stationRow.secondChartDateTime);
                  const rowBoardingDateLabel =
                    /^\d{4}-\d{2}-\d{2}$/.test(chartingData.journeyDate) &&
                    Number.isFinite(stationRow.day)
                      ? new Date(
                          `${addCalendarDays(chartingData.journeyDate, Math.max(0, stationRow.day - 1))}T00:00:00+05:30`
                        ).toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : null;
                  const rowChartCards = [
                    {
                      heading: "01 · First Chart",
                      iso: stationRow.firstChartDateTime,
                      timing: firstChart,
                    },
                    {
                      heading: "02 · Final Chart",
                      iso: stationRow.secondChartDateTime,
                      timing: secondChart,
                    },
                  ];
                  const toggleExpanded = () => setExpandedStationCode((current) =>
                    current === stationRow.stationCode ? null : stationRow.stationCode
                  );
                  return (
                    <Fragment key={`${stationRow.stationCode}-${originalIndex}`}>
                    <tr onClick={toggleExpanded} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleExpanded(); } }} tabIndex={0} aria-expanded={isExpanded} className={`cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#EA580C] ${isExpanded ? "bg-[#FFFFFF]" : "bg-white hover:bg-[#FFFCFA]"}`}>
                      <td className={`border-l-[3px] px-2 py-2 sm:px-4 sm:py-2.5 ${isExpanded ? "border-l-[#EA580C]" : "border-l-transparent"}`}>
                        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2"><span className="shrink-0 font-mono text-[9px] font-bold text-[#525252] sm:text-[10px]">{stationRow.stationCode}</span><span className="min-w-0 truncate font-bold text-[#171717]">{stationRow.stationName}</span>{isExpanded && <span className="hidden shrink-0 rounded bg-[#EA580C] px-1.5 py-0.5 text-[8.5px] font-bold text-white sm:inline">Details open</span>}{isOrigin && <span className="hidden shrink-0 text-[9px] font-semibold text-[#525252] sm:inline">Origin</span>}{isDestination && <span className="hidden shrink-0 text-[9px] font-semibold text-[#525252] sm:inline">Destination</span>}</div>
                      </td>
                      <td className="px-1 py-2 text-center font-semibold tabular-nums text-[#171717] sm:px-2 sm:py-2.5">{stationRow.arrivalTime || "—"}</td>
                      <td className="px-1 py-2 text-center font-semibold tabular-nums text-[#171717] sm:px-2 sm:py-2.5">{stationRow.departureTime || "—"}</td>
                      <td className="px-1 py-2 text-center font-semibold tabular-nums text-[#525252] sm:px-2 sm:py-2.5">{stationRow.day}</td>
                    </tr>
                    <tr aria-hidden={!isExpanded}>
                      <td colSpan={4} className="p-0">
                        <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                          <div className="min-h-0 overflow-hidden">
                            <div className="border-l-[3px] border-t border-l-[#EA580C] border-t-[#FED7AA] bg-[#FFFFFF] p-3 sm:p-4">
                              <div className="flex min-w-0 flex-col justify-between rounded-lg border-2 border-[#EA580C] bg-[#FFFFFF] p-3.5 sm:p-4">
                                <div className="min-w-0 w-full">
                                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[#EA580C]">
                                    YOUR BOARDING STATION
                                  </p>
                                  <h3 className="mt-1 w-full break-words text-lg font-extrabold leading-snug text-[#171717] sm:text-xl">
                                    {stationRow.stationName}{" "}
                                    <span className="font-mono text-sm font-bold text-[#525252] sm:text-[15px]">
                                      ({stationRow.stationCode})
                                    </span>
                                  </h3>
                                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] font-semibold leading-snug text-[#525252]">
                                    <span className="inline-flex items-center gap-1.5">
                                      <CalendarDays
                                        aria-hidden="true"
                                        strokeWidth={2.25}
                                        className="h-3.5 w-3.5 shrink-0 text-[#EA580C]"
                                      />
                                      <span>
                                        {rowBoardingDateLabel || "Date unavailable"}
                                        {typeof stationRow.day === "number" && (
                                          <span className="font-bold text-[#171717]">
                                            {" "}
                                            · Day {stationRow.day}
                                          </span>
                                        )}
                                      </span>
                                    </span>
                                    <span className="inline-flex flex-wrap items-center gap-x-2">
                                      <Clock
                                        aria-hidden="true"
                                        strokeWidth={2.25}
                                        className="h-3.5 w-3.5 shrink-0 text-[#EA580C]"
                                      />
                                      <span>
                                        Arrival:{" "}
                                        <strong className="font-extrabold tabular-nums text-[#171717]">
                                          {stationRow.arrivalTime || "—"}
                                        </strong>
                                      </span>
                                      <span className="font-bold text-[#525252]">·</span>
                                      <span>
                                        Departure:{" "}
                                        <strong className="font-extrabold tabular-nums text-[#171717]">
                                          {stationRow.departureTime || "—"}
                                        </strong>
                                      </span>
                                    </span>
                                  </div>
                                  <p className="mt-1.5 break-words text-xs font-semibold leading-snug text-[#525252]">
                                    Chart preparation station:{" "}
                                    <strong className="font-extrabold text-[#171717]">
                                      {remoteStationDisplay}
                                    </strong>
                                  </p>
                                </div>

                                <div className="my-3 border-t border-[#FED7AA]" />

                                <div className="grid min-w-0 grid-cols-1 items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-2.5">
                                  {rowChartCards.map(({ heading, iso, timing }, index) => {
                                    const scheduleStatus = getScheduleStatus(iso);
                                    return (
                                      <Fragment key={heading}>
                                        <div className="flex min-w-0 flex-col justify-between rounded-md border-[1.5px] border-[#FED7AA] bg-[#FFFFFF] px-3 py-3 sm:px-3.5">
                                          <div>
                                            <h4 className="text-xs font-black uppercase tracking-[0.06em] text-[#EA580C] sm:text-[13px]">
                                              {heading}
                                            </h4>
                                            <p
                                              className={`mt-1.5 break-words text-2xl font-black leading-tight tabular-nums tracking-tight sm:text-[26px] ${
                                                timing ? "text-[#171717]" : "text-[#525252]"
                                              }`}
                                            >
                                              {timing?.time12 || "Not available"}
                                            </p>
                                            <p className="mt-1 break-words text-xs font-bold leading-snug text-[#525252]">
                                              {timing
                                                ? `${timing.dateLabel} · IST`
                                                : "Date not available"}
                                            </p>
                                          </div>
                                          {timing && scheduleStatus.state !== "unknown" && (
                                            <ChartScheduleStatus
                                              status={scheduleStatus}
                                              mounted={mounted}
                                            />
                                          )}
                                        </div>
                                        {index === 0 && (
                                          <div
                                            aria-hidden="true"
                                            className="flex items-center justify-center py-0.5 sm:px-0.5 sm:py-0"
                                          >
                                            <ArrowRight
                                              strokeWidth={2.5}
                                              className="h-5 w-5 shrink-0 rotate-90 text-[#EA580C] sm:rotate-0"
                                            />
                                          </div>
                                        )}
                                      </Fragment>
                                    );
                                  })}
                                </div>
                              </div>
                              <p className="mt-2.5 text-[11.5px] font-semibold leading-tight text-[#525252]">
                                Scheduled times; actual chart preparation isn’t confirmed.
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </section>
        </>
      )}
      {/* ══════════════════════════════════════════════════════════════════════
          4. IRCTC CHART PREPARATION RULES & AGENT REFERENCE GUIDE
         ══════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="chart-rules-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Official IRCTC Charting Rules Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-white p-5 border border-[#E5EAF0] h-full flex flex-col gap-4">
            <div className="flex flex-1 flex-col gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5EF] border border-[#E87535]/25 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-[#A34C22]">
                <Sparkles className="h-3 w-3 text-[#A34C22]" />
                <span>IRCTC PRS Charting Rules</span>
              </div>
              <h3
                id="chart-rules-heading"
                className="text-base sm:text-lg font-extrabold text-[#102B46]"
              >
                How Indian Railways Reservation Charting Works
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Indian Railways prepares reservation charts in two stages for every train and remote location quota station:
              </p>

              <div className="flex flex-1 flex-col justify-evenly gap-2.5 pt-1">
                <div className="flex-1 rounded-xl bg-[#F5F7FA] border border-[#E5EAF0]/80 p-3">
                  <p className="text-xs font-extrabold text-[#102B46]">
                    1. Morning Trains (05:00 AM – 02:00 PM)
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-[#64748B] leading-relaxed">
                    First chart is prepared the <strong>previous night between 8:00 PM and 9:00 PM IST</strong> so waitlisted passengers know their confirmation status before going to sleep.
                  </p>
                </div>

                <div className="flex-1 rounded-xl bg-[#F5F7FA] border border-[#E5EAF0]/80 p-3">
                  <p className="text-xs font-extrabold text-[#102B46]">
                    2. Afternoon &amp; Night Trains (02:00 PM – 05:00 AM)
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-[#64748B] leading-relaxed">
                    First chart is typically prepared <strong>8 to 10 hours before</strong> the scheduled departure from the originating or remote charting station.
                  </p>
                </div>

                <div className="flex-1 rounded-xl bg-[#F5F7FA] border border-[#E5EAF0]/80 p-3">
                  <p className="text-xs font-extrabold text-[#102B46]">
                    3. Second Chart &amp; Current Booking
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-[#64748B] leading-relaxed">
                    Current booking opens right after the First Chart and closes when the <strong>Second (Final) Chart</strong> is prepared (~30 minutes prior to departure).
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5EAF0] bg-[#F5F7FA] p-3.5 text-xs text-[#26374A]">
              <p className="font-bold text-[#A34C22]">Agent Tip: Remote Location Quotas (RLWL)</p>
              <p className="mt-1 text-[11px] text-[#64748B] leading-relaxed">
                Always check the <strong>Charting Station</strong> column above. Even if a train departs late at night from an intermediate halt, its chart may be locked hours earlier at the parent Remote Charting Station.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Interactive FAQ Accordion */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-white p-5 border border-[#E5EAF0] h-full">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#E5EAF0]">
              <HelpCircle className="h-4 w-4 text-[#A34C22]" />
              <h3 className="text-sm sm:text-base font-extrabold text-[#102B46]">
                Frequently Asked Questions (Chart Preparation Timing)
              </h3>
            </div>

            <div className="divide-y divide-[#E5EAF0]">
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
                      <span className="text-xs sm:text-sm font-extrabold text-[#102B46] group-hover:text-[#A34C22] transition-colors">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#64748B] mt-0.5 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#A34C22]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-[#64748B] leading-relaxed pr-4">
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
