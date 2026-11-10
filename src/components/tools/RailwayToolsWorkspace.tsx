"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Calendar,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Ticket,
  TrainFront,
  Users,
  Zap,
} from "lucide-react";
import {
  findRailTool,
  railTools,
  resolveRailTool,
  type RailTool,
  type RailToolId,
} from "@/config/tools";
import { LiveTrainStatusTool } from "@/components/LiveTrainStatusTool";
import { PnrStatusTool } from "@/app/pnr-status/page";
import { FareCalculator } from "@/components/calculator/FareCalculator";
import { IRCTCCancellationRefundCalculator } from "@/components/calculator/IRCTCCancellationRefundCalculator";
import { TicketDateCalculator } from "@/components/calculator/TicketDateCalculator";
import { TrainChartPreparationTime } from "@/components/calculator/TrainChartPreparationTime";
import { InternalLink } from "@/components/ui/InternalLink";

/**
 * Custom Tool Icons matching the reference design (including ₹ inside circular arrow for Refund
 * and bar-chart + clock badge for Chart Preparation).
 */
function ToolIcon({
  toolId,
  className = "h-4 w-4",
}: {
  toolId: RailToolId;
  className?: string;
}) {
  switch (toolId) {
    case "live-train":
      return <TrainFront aria-hidden="true" className={className} />;
    case "pnr":
      return <Ticket aria-hidden="true" className={className} />;
    case "fare":
      return <Calculator aria-hidden="true" className={className} />;
    case "refund":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className={className}
        >
          <path
            d="M4.5 10.5A8 8 0 1 1 6.2 16.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M4 6v4.8h4.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 8.5h5M9.5 11h5M12 8.5c1.2 0 2 .8 2 1.9 0 1.2-.9 2-2.2 2H9.8l3.5 3.6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "ticket-date":
      return <Calendar aria-hidden="true" className={className} />;
    case "chart":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className={className}
        >
          <rect x="3" y="10" width="3.2" height="9" rx="1" fill="currentColor" />
          <rect x="8" y="5" width="3.2" height="14" rx="1" fill="currentColor" />
          <rect x="13" y="8" width="3.2" height="11" rx="1" fill="currentColor" />
          <circle
            cx="17.5"
            cy="16.5"
            r="4.2"
            fill="white"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M17.5 14.6v2l1.3 1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

/**
 * Custom bottom-right watermark vectors matching each card in the reference image.
 */
function ToolWatermark({
  toolId,
  className = "h-16 w-16",
}: {
  toolId: RailToolId;
  className?: string;
}) {
  switch (toolId) {
    case "live-train":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 96 64"
          fill="none"
          className="h-14 w-24"
        >
          <path
            d="M8 50h82M16 55h68"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M14 44c6-16 18-26 36-26h40v26H14Z"
            fill="currentColor"
            fillOpacity="0.45"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M32 25h14v8H26l6-8ZM54 25h12v8H54v-8ZM72 25h12v8H72v-8Z"
            fill="white"
          />
        </svg>
      );
    case "pnr":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 64 64"
          fill="none"
          className={className}
        >
          <g transform="rotate(-32 32 32)">
            <path
              d="M10 20a4 4 0 0 1 4-4h36a4 4 0 0 1 4 4v6a5 5 0 0 0 0 10v6a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4v-6a5 5 0 0 0 0-10v-6Z"
              fill="currentColor"
              fillOpacity="0.3"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="M26 22v20"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );
    case "fare":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 64 64"
          fill="none"
          className={className}
        >
          <rect
            x="14"
            y="8"
            width="36"
            height="48"
            rx="6"
            fill="currentColor"
            fillOpacity="0.28"
            stroke="currentColor"
            strokeWidth="3"
          />
          <rect x="20" y="14" width="24" height="10" rx="2" fill="white" />
          <rect x="20" y="30" width="6" height="6" rx="1.5" fill="white" />
          <rect x="29" y="30" width="6" height="6" rx="1.5" fill="white" />
          <rect x="38" y="30" width="6" height="6" rx="1.5" fill="white" />
          <rect x="20" y="40" width="6" height="6" rx="1.5" fill="white" />
          <rect x="29" y="40" width="6" height="6" rx="1.5" fill="white" />
          <rect x="38" y="40" width="6" height="10" rx="1.5" fill="white" />
        </svg>
      );
    case "refund":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 64 64"
          fill="none"
          className={className}
        >
          <path
            d="M14 28a20 20 0 1 1 4 15"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M12 17v12h12"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25 23h14M25 29h14M31 23c3.2 0 5.5 2 5.5 4.8 0 3-2.4 5.2-5.8 5.2H26l9.5 9.5"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "ticket-date":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 64 64"
          fill="none"
          className={className}
        >
          <rect
            x="10"
            y="14"
            width="44"
            height="40"
            rx="6"
            fill="currentColor"
            fillOpacity="0.28"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path d="M10 25h44" stroke="currentColor" strokeWidth="3" />
          <path
            d="M22 9v9M42 9v9"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <rect x="18" y="31" width="6" height="5" rx="1" fill="white" />
          <rect x="29" y="31" width="6" height="5" rx="1" fill="white" />
          <rect x="40" y="31" width="6" height="5" rx="1" fill="white" />
          <rect x="18" y="41" width="6" height="5" rx="1" fill="white" />
          <rect x="29" y="41" width="6" height="5" rx="1" fill="white" />
          <rect x="40" y="41" width="6" height="5" rx="1" fill="white" />
        </svg>
      );
    case "chart":
      return (
        <svg
          aria-hidden="true"
          viewBox="0 0 64 64"
          fill="none"
          className={className}
        >
          <circle
            cx="32"
            cy="32"
            r="21"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            d="M32 20v13l9 5"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

type ToolColorTheme = {
  iconColor: string;
  sidebarIconBg: string;
  badgeBg: string;
  pillText: string;
  pillDot: string;
  pillLabel: string;
  cardDescription: string;
  activeItem: string;
  focusRing: string;
  cardTopBorder: string;
  cardHoverBorder: string;
  solidButtonBg: string;
  watermarkColor: string;
};

const toolColorThemes: Record<RailToolId, ToolColorTheme> = {
  "live-train": {
    iconColor: "text-[#0B57D0]",
    sidebarIconBg: "bg-[#E8F0FF] text-[#0B57D0]",
    badgeBg: "bg-[#EAF2FF] border-[#C7DCFF]",
    pillText: "text-[#1E40AF]",
    pillDot: "bg-[#15803D]",
    pillLabel: "LIVE STATUS",
    cardDescription:
      "Check a train’s current running status, location, and station-wise timings.",
    activeItem:
      "border-[#93C5FD] bg-[#E8F0FF] shadow-[0_2px_7px_rgba(30,64,175,0.10)]",
    focusRing: "focus-visible:outline-[#0B57D0]",
    cardTopBorder: "border-t-[#BFDBFE]",
    cardHoverBorder: "hover:border-[#93C5FD]",
    solidButtonBg: "border border-[#C7DCFF] bg-[#EAF2FF] text-[#1E40AF] group-hover:bg-[#DBEAFE]",
    watermarkColor: "text-[#BFDBFE]",
  },
  pnr: {
    iconColor: "text-[#15803D]",
    sidebarIconBg: "bg-[#E6F7ED] text-[#15803D]",
    badgeBg: "bg-[#E9F9EF] border-[#B6ECCB]",
    pillText: "text-[#166534]",
    pillDot: "bg-[#15803D]",
    pillLabel: "PNR STATUS",
    cardDescription:
      "Check booking details, passenger status, and chart information.",
    activeItem:
      "border-[#86EFAC] bg-[#E6F7ED] shadow-[0_2px_7px_rgba(22,101,52,0.10)]",
    focusRing: "focus-visible:outline-[#15803D]",
    cardTopBorder: "border-t-[#BBF7D0]",
    cardHoverBorder: "hover:border-[#86EFAC]",
    solidButtonBg: "border border-[#B6ECCB] bg-[#E9F9EF] text-[#166534] group-hover:bg-[#DCFCE7]",
    watermarkColor: "text-[#A7F3D0]",
  },
  fare: {
    iconColor: "text-[#6D28D9]",
    sidebarIconBg: "bg-[#EFEAFF] text-[#6D28D9]",
    badgeBg: "bg-[#F2ECFF] border-[#D9CEFF]",
    pillText: "text-[#5B21B6]",
    pillDot: "bg-[#6D28D9]",
    pillLabel: "FARE ESTIMATE",
    cardDescription:
      "Estimate train fares with an IRCTC and agent service fee breakdown.",
    activeItem:
      "border-[#C4B5FD] bg-[#EFEAFF] shadow-[0_2px_7px_rgba(109,40,217,0.10)]",
    focusRing: "focus-visible:outline-[#6D28D9]",
    cardTopBorder: "border-t-[#DDD6FE]",
    cardHoverBorder: "hover:border-[#C4B5FD]",
    solidButtonBg: "border border-[#D9CEFF] bg-[#F2ECFF] text-[#5B21B6] group-hover:bg-[#EDE9FE]",
    watermarkColor: "text-[#DDD6FE]",
  },
  refund: {
    iconColor: "text-[#9F1239]",
    sidebarIconBg: "bg-[#FCE8ED] text-[#9F1239]",
    badgeBg: "bg-[#FDECEF] border-[#F8C6D0]",
    pillText: "text-[#9F1239]",
    pillDot: "bg-[#BE123C]",
    pillLabel: "REFUND & CANCELLATION",
    cardDescription:
      "Review IRCTC-based cancellation charges and estimated refunds.",
    activeItem:
      "border-[#FDA4AF] bg-[#FCE8ED] shadow-[0_2px_7px_rgba(159,18,57,0.10)]",
    focusRing: "focus-visible:outline-[#9F1239]",
    cardTopBorder: "border-t-[#FECDD3]",
    cardHoverBorder: "hover:border-[#FDA4AF]",
    solidButtonBg: "border border-[#F8C6D0] bg-[#FDECEF] text-[#9F1239] group-hover:bg-[#FFE4E6]",
    watermarkColor: "text-[#FECDD3]",
  },
  "ticket-date": {
    iconColor: "text-[#A1410A]",
    sidebarIconBg: "bg-[#FCEBDD] text-[#C2410C]",
    badgeBg: "bg-[#FDF0E4] border-[#F7D0AE]",
    pillText: "text-[#9A3412]",
    pillDot: "bg-[#C2410C]",
    pillLabel: "BOOKING DATES",
    cardDescription:
      "Find 60-day reservation and Tatkal booking opening dates.",
    activeItem:
      "border-[#FDBA74] bg-[#FCEBDD] shadow-[0_2px_7px_rgba(154,52,18,0.10)]",
    focusRing: "focus-visible:outline-[#C2410C]",
    cardTopBorder: "border-t-[#FED7AA]",
    cardHoverBorder: "hover:border-[#FDBA74]",
    solidButtonBg: "border border-[#F7D0AE] bg-[#FFF2E8] text-[#9A3412] group-hover:bg-[#FFEDD5]",
    watermarkColor: "text-[#FED7AA]",
  },
  chart: {
    iconColor: "text-[#0D5C56]",
    sidebarIconBg: "bg-[#DFF3EF] text-[#0F766E]",
    badgeBg: "bg-[#E6F7F4] border-[#B3E6DC]",
    pillText: "text-[#115E59]",
    pillDot: "bg-[#0F766E]",
    pillLabel: "CHART TIMING",
    cardDescription:
      "Check train’s chart preparation time and second reservation chart timings.",
    activeItem:
      "border-[#5EEAD4] bg-[#DFF3EF] shadow-[0_2px_7px_rgba(17,94,89,0.10)]",
    focusRing: "focus-visible:outline-[#0F766E]",
    cardTopBorder: "border-t-[#99F6E4]",
    cardHoverBorder: "hover:border-[#5EEAD4]",
    solidButtonBg: "border border-[#B3E6DC] bg-[#E6F7F4] text-[#115E59] group-hover:bg-[#CCFBF1]",
    watermarkColor: "text-[#99F6E4]",
  },
};

export function RailwayToolsWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toolParam = searchParams.get("tool");
  const hasPnrLookupParams =
    !toolParam && (searchParams.has("pnr") || searchParams.has("lookup"));
  const selectedTool: RailTool | null = hasPnrLookupParams
    ? resolveRailTool("pnr")
    : findRailTool(toolParam);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement | null>(null);
  const workspacePanelRef = useRef<HTMLElement | null>(null);

  // Reset right workspace scroll to top when switching tools or returning to overview
  useEffect(() => {
    workspacePanelRef.current?.scrollTo({ top: 0 });
  }, [selectedTool?.id]);

  // Close mobile dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleSelectTool(toolId: RailToolId) {
    setMobileMenuOpen(false);
    if (selectedTool?.id === toolId && toolParam === toolId) {
      return;
    }

    const basePath = pathname || "/tools";
    const nextHref = `${basePath}?tool=${encodeURIComponent(toolId)}`;
    router.push(nextHref, { scroll: false });
  }

  function handleShowAllTools() {
    setMobileMenuOpen(false);
    if (!selectedTool && !toolParam) {
      return;
    }
    const basePath = pathname || "/tools";
    router.push(basePath, { scroll: false });
  }

  function handleCardClick(
    event: ReactMouseEvent<HTMLAnchorElement>,
    toolId: RailToolId,
  ) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    handleSelectTool(toolId);
  }

  function handleBackToOverviewClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    handleShowAllTools();
  }

  return (
    <div className="tools-layout">
      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE TOOL SELECTOR (<768px)
         ══════════════════════════════════════════════════════════════════════ */}
      <div ref={mobileDropdownRef} className="relative md:hidden">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <p
            id="mobile-tool-select-label"
            className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500"
          >
            Select Railway Tool
          </p>
          <button
            type="button"
            aria-labelledby="mobile-tool-select-label"
            aria-haspopup="listbox"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-tool-select-menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left transition duration-150 hover:-translate-y-px hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${selectedTool
              ? `${toolColorThemes[selectedTool.id].badgeBg} ${toolColorThemes[selectedTool.id].focusRing}`
              : "border-[#F6C8A0] bg-[#FDE8D7] focus-visible:outline-[#C2410C]"
              } motion-reduce:transform-none motion-reduce:transition-none`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-white shadow-2xs ${selectedTool
                  ? `${toolColorThemes[selectedTool.id].badgeBg} ${toolColorThemes[selectedTool.id].iconColor}`
                  : "border-[#F6C8A0] bg-[#FFF4EB] text-[#C2410C]"
                  }`}
              >
                {selectedTool ? (
                  <ToolIcon toolId={selectedTool.id} className="h-4 w-4" />
                ) : (
                  <LayoutGrid aria-hidden="true" className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-[#0b2240]">
                  {selectedTool ? selectedTool.shortTitle : "All Tools"}
                </span>
                <span className="block truncate text-[11px] text-slate-500">
                  {selectedTool ? selectedTool.badge : "Quick access to all railway tools"}
                </span>
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 transition-transform duration-150 ${selectedTool ? toolColorThemes[selectedTool.id].iconColor : "text-[#C2410C]"
                } ${mobileMenuOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-tool-select-menu"
            role="listbox"
            aria-labelledby="mobile-tool-select-label"
            className="absolute left-0 right-0 top-full z-30 mt-1.5 space-y-1 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            <button
              type="button"
              role="option"
              aria-selected={!selectedTool}
              onClick={handleShowAllTools}
              className={`group flex w-full items-center justify-between gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#C2410C] ${!selectedTool
                ? "border-[#F5C299] bg-[#FDE6D2] font-bold text-[#9A3412]"
                : "border-slate-200/80 bg-[#F8FAFC] font-medium text-[#0b2240]"
                }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FFF4EB] text-[#C2410C]">
                  <LayoutGrid aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="truncate">All Tools</span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 ${!selectedTool ? "text-[#C2410C]" : "text-slate-400"}`}
              />
            </button>

            {railTools.map((tool) => {
              const isSelected = selectedTool?.id === tool.id;
              const theme = toolColorThemes[tool.id];
              return (
                <button
                  key={tool.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectTool(tool.id)}
                  className={`group flex w-full items-center justify-between gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 ${theme.focusRing} ${isSelected
                    ? `${theme.activeItem} font-semibold text-[#0b2240]`
                    : "border-slate-200/80 bg-[#F8FAFC] font-medium text-[#0b2240]"
                    }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${theme.sidebarIconBg}`}
                    >
                      <ToolIcon toolId={tool.id} className="h-4 w-4" />
                    </span>
                    <span className="truncate">{tool.shortTitle}</span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 ${isSelected ? theme.iconColor : "text-slate-400"}`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR — MATCHES REFERENCE EXACTLY (NO TRUNCATED LABELS)
         ══════════════════════════════════════════════════════════════════════ */}
      <aside
        aria-label="Railway Tools Sidebar"
        className="tools-sidebar tools-sidebar-column hidden md:flex md:flex-col rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs"
      >
        {/* 1. Sidebar Top: Header + Tool Navigation List */}
        <div>
          <div className="flex items-center gap-2 px-1 pt-0.5 pb-2.5">
            {/* 3D Stacked Orange Layers Icon matching reference */}
            <svg
              aria-hidden="true"
              viewBox="0 0 32 32"
              fill="none"
              className="h-6 w-6 shrink-0"
            >
              <path
                d="M16 4L28 10.5L16 17L4 10.5L16 4Z"
                fill="#F97316"
              />
              <path
                d="M4 15.5L16 22L28 15.5"
                stroke="#EA580C"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 20.5L16 27L28 20.5"
                stroke="#C2410C"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="min-w-0">
              <h2 className="text-[13.5px] font-extrabold leading-tight tracking-tight text-[#0F2747]">
                Railway Tools
              </h2>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                Quick access to all railway tools
              </p>
            </div>
          </div>

          <nav aria-label="Select a railway tool" className="mt-1">
            {/* All Tools Tab */}
            <button
              type="button"
              aria-current={!selectedTool ? "page" : undefined}
              onClick={handleShowAllTools}
              className={`group flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border min-h-11 px-2.5 py-2 text-left text-[13px] leading-snug transition-all duration-175 hover:-translate-y-0.5 hover:shadow-xs motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C] ${!selectedTool
                ? "border-[#FED7AA] bg-[#FFF2E8] font-bold text-[#9A3412] shadow-[0_2px_6px_rgba(194,65,12,0.08)]"
                : "border-[#EAEFF5] bg-[#F8FAFC] font-bold text-[#0F2747] hover:border-[#F5C299] hover:bg-[#FFF4EB]"
                }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-transform duration-175 group-hover:scale-105 ${!selectedTool
                    ? "bg-[#FAD5B5] text-[#C2410C]"
                    : "bg-[#FFF3E8] text-[#EA580C]"
                    }`}
                >
                  <LayoutGrid aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 break-words">All Tools</span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${!selectedTool ? "text-[#C2410C]" : "text-slate-400"
                  }`}
              />
            </button>

            {/* 6 Individual Tool Tabs */}
            {railTools.map((tool) => {
              const isSelected = selectedTool?.id === tool.id;
              const theme = toolColorThemes[tool.id];
              return (
                <button
                  key={tool.id}
                  type="button"
                  aria-current={isSelected ? "page" : undefined}
                  onClick={() => handleSelectTool(tool.id)}
                  className={`group flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border min-h-11 px-2.5 py-2 text-left text-[13px] leading-snug transition-all duration-175 hover:-translate-y-0.5 hover:shadow-xs motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.focusRing} ${isSelected
                    ? `${theme.activeItem} font-bold text-[#0F2747]`
                    : "border-[#EAEFF5] bg-[#F8FAFC] font-bold text-[#0F2747] hover:border-[#DCE6F2] hover:bg-[#F1F5F9]"
                    }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-transform duration-175 group-hover:scale-105 ${theme.sidebarIconBg}`}
                    >
                      <ToolIcon toolId={tool.id} className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 break-words">{tool.shortTitle}</span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${isSelected ? theme.iconColor : "text-slate-400"
                      }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* 2. Sidebar Bottom Card: Railway Tools Hub Panel */}
        <div className="tools-sidebar-bottom pt-4">
          <div className="relative overflow-hidden rounded-xl border border-[#FED7AA]/70 bg-[#FFF7ED] p-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#FFEDD5] text-[#C2410C] shadow-2xs">
                <TrainFront aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-xs font-extrabold tracking-tight text-[#0F2747]">
                Railway Tools Hub
              </h3>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">
              Check train status, PNR, fares, refunds and booking dates — all in one place.
            </p>

            {/* Decorative Express Train Illustration Footer */}
            <div aria-hidden="true" className="mt-2">
              <svg
                viewBox="0 0 220 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-full"
              >
                <path
                  d="M0 38C65 38 125 26 220 13V44H0V38Z"
                  fill="#F4C295"
                  fillOpacity="0.6"
                />
                <path
                  d="M8 40C75 35 140 22 216 7"
                  stroke="#E86C1F"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Streamlined White Express Bullet Train */}
                <g transform="translate(72, 4)">
                  <path
                    d="M4 26L86 11C106 8 124 13 136 22L4 31V26Z"
                    fill="#FFFFFF"
                    stroke="#1E293B"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M94 12C108 10 121 14 131 21L96 22L94 12Z"
                    fill="#0F172A"
                  />
                  <path
                    d="M22 21L38 18V23L22 26V21ZM44 17.5L60 14.5V19.5L44 22.5V17.5ZM66 14L82 11.5V16.5L66 19V14Z"
                    fill="#1E293B"
                  />
                  <path
                    d="M4 28L134 21"
                    stroke="#EA580C"
                    strokeWidth="2.2"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT WORKSPACE — DEFAULT ALL RAILWAY TOOLS DESIGN OR ACTIVE TOOL
         ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={workspacePanelRef}
        aria-labelledby="active-workspace-tool-title"
        className="min-w-0 flex-1"
      >
        {selectedTool ? (
          <div className="tools-workspace-panel rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_12px_rgba(15,39,71,0.04)] sm:p-5 lg:p-6">
            {/* Top Return / Breadcrumb Link to All Tools */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <nav aria-label="Workspace breadcrumb" className="flex items-center gap-1.5 text-xs">
                <Link
                  href="/tools"
                  onClick={handleBackToOverviewClick}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50/80 px-2.5 py-1 font-semibold text-[#102B4E] transition-colors hover:border-blue-200 hover:bg-[#EFF6FF] hover:text-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                >
                  <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Back to All Tools</span>
                </Link>
                <span aria-hidden="true" className="text-slate-300">
                  /
                </span>
                <span className="truncate font-semibold text-slate-600">
                  {selectedTool.shortTitle}
                </span>
              </nav>
            </div>

            {/* Active Tool Header Bar */}
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-3.5 sm:mb-5">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toolColorThemes[selectedTool.id].badgeBg} ${toolColorThemes[selectedTool.id].iconColor}`}
                >
                  <ToolIcon toolId={selectedTool.id} className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1
                      id="active-workspace-tool-title"
                      className="text-lg font-extrabold tracking-tight text-[#102B4E] sm:text-xl"
                    >
                      {selectedTool.title}
                    </h1>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${toolColorThemes[selectedTool.id].badgeBg} ${toolColorThemes[selectedTool.id].iconColor}`}
                    >
                      {selectedTool.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                    {selectedTool.description}
                  </p>
                </div>
              </div>

              <InternalLink
                href={selectedTool.href}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-semibold text-[#102B4E] transition hover:border-blue-200 hover:bg-[#EFF6FF] hover:text-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
              >
                <span>Open standalone page</span>
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </InternalLink>
            </div>

            {/* Active Tool Full Interface */}
            <div className="min-w-0">
              {selectedTool.id === "live-train" && <LiveTrainStatusTool embedded />}
              {selectedTool.id === "pnr" && <PnrStatusTool embedded />}
              {selectedTool.id === "fare" && <FareCalculator />}
              {selectedTool.id === "refund" && <IRCTCCancellationRefundCalculator />}
              {selectedTool.id === "ticket-date" && <TicketDateCalculator />}
              {selectedTool.id === "chart" && <TrainChartPreparationTime />}
            </div>
          </div>
        ) : (
          /* ════════════════════════════════════════════════════════════════════
             DEFAULT /tools OVERVIEW STATE — MATCHES REFERENCE DESIGN EXACTLY
             ════════════════════════════════════════════════════════════════════ */
          <div className="tools-workspace flex flex-col gap-4">
            {/* 1. TOP BANNER CARD WITH LEFT ORANGE BAR, 3 BADGES & SUNSET WAP-7 TRAIN */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Content Column */}
                <div className="relative z-10 flex flex-col justify-between p-4 sm:px-6 sm:py-4.5 lg:col-span-7">
                  <div className="flex items-stretch gap-3">
                    <span
                      aria-hidden="true"
                      className="w-1 shrink-0 rounded-full bg-[#EA580C]"
                    />
                    <div>
                      <h1
                        id="active-workspace-tool-title"
                        className="text-2xl font-black tracking-tight text-[#0F2747] leading-tight"
                      >
                        All Railway <span className="text-[#EA580C]">Tools</span>
                      </h1>
                      <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                        Explore our essential railway tools to check train status, PNR, ticket
                        fares, refunds, booking dates and chart preparation.
                      </p>
                    </div>
                  </div>

                  {/* 3 Feature Pills Row */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-y-1.5 border-t border-slate-100 pt-2.5 text-xs font-bold text-[#0F2747]">
                    <div className="flex items-center gap-1.5 pr-4 sm:pr-6">
                      <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[#EA580C]" />
                      <span>Free to Use</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l border-slate-200 px-4 sm:px-6">
                      {/* Circular Refresh-Check Badge Icon */}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-4 w-4 shrink-0 text-[#EA580C]"
                      >
                        <path
                          d="M3.5 10a6.5 6.5 0 0 1 11.2-4.5M16.5 10a6.5 6.5 0 0 1-11.2 4.5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12.5 5.5h2.6V2.9M7.5 14.5H4.9v2.6"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.6 10.2l1.6 1.6 3.3-3.4"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Reliable &amp; Updated</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4 sm:pr-6">
                      <Smartphone aria-hidden="true" className="h-4 w-4 shrink-0 text-[#EA580C]" />
                      <span>Mobile Friendly</span>
                    </div>
                  </div>
                </div>

                {/* Right Curved Sunset WAP-7 Locomotive Banner */}
                <div className="relative hidden min-h-[140px] overflow-hidden lg:col-span-5 lg:block">
                  <Image
                    src="/images/tools-hero-train-sunset.jpg"
                    alt="Indian Railways WAP-7 Electric Locomotive at Sunset"
                    fill
                    sizes="(max-width: 1024px) 0vw, 420px"
                    className="-scale-x-100 object-cover object-center"
                    priority
                  />
                  {/* Diagonal Sweeping White + Peach + Orange Wave Overlay matching reference */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 160 200"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute inset-y-0 left-0 h-full w-32"
                  >
                    {/* Soft Peach Outer Wave */}
                    <path
                      d="M0 0H132C82 52 46 125 22 200H0V0Z"
                      fill="#FDE5CE"
                    />
                    {/* Vibrant Orange Ribbon Wave */}
                    <path
                      d="M116 0H146C96 50 64 122 50 200H26C48 124 76 54 116 0Z"
                      fill="#EA580C"
                    />
                    {/* Solid White Inner Fill blending seamlessly with left text panel */}
                    <path
                      d="M0 0H116C72 54 38 124 12 200H0V0Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. SIX TOOL CARDS GRID (3x2 on Desktop, 2x3 on Tablet, 1x6 on Mobile) */}
            <div className="tools-overview-cards grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
              {railTools.map((tool) => {
                const theme = toolColorThemes[tool.id];
                return (
                  <a
                    key={tool.id}
                    href={tool.href}
                    onClick={(event) => handleCardClick(event, tool.id)}
                    className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#E8EEF5] border-t-2 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.cardTopBorder} ${theme.cardHoverBorder} ${theme.focusRing}`}
                  >
                    <div className="relative z-10 flex flex-1 flex-col">
                      {/* Top Row: Pastel Icon Box + Pill Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${theme.badgeBg} ${theme.iconColor}`}
                        >
                          <ToolIcon toolId={tool.id} className="h-4.5 w-4.5" />
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider shadow-2xs ${theme.badgeBg} ${theme.pillText}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${theme.pillDot}`}
                          />
                          <span>{theme.pillLabel}</span>
                        </span>
                      </div>

                      {/* Tool Title & Description */}
                      <h2 className="mt-3 text-base font-extrabold tracking-tight text-[#0F2747]">
                        {tool.shortTitle}
                      </h2>

                      <p className="mt-1 pr-6 text-xs leading-relaxed text-slate-600 min-h-[34px]">
                        {theme.cardDescription}
                      </p>
                    </div>

                    {/* Bottom Row: Solid Colored Pill CTA Button */}
                    <div className="relative z-10 mt-3 pt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-2xs transition-all duration-150 ${theme.solidButtonBg}`}
                      >
                        <span>Open Tool</span>
                        <ArrowRight
                          aria-hidden="true"
                          className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>

                    {/* Subtle Bottom-Right Watermark Illustration */}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute right-3 bottom-2 transition-transform duration-200 group-hover:scale-105 ${theme.watermarkColor}`}
                    >
                      <ToolWatermark toolId={tool.id} className="h-12 w-12" />
                    </div>
                  </a>
                );
              })}
            </div>

            {/* 3. BOTTOM 4-COLUMN TRUST & FEATURE BAR */}
            <div className="rounded-2xl border border-slate-200/90 bg-white px-4 py-3 sm:py-3.5 shadow-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                <div className="flex items-center gap-2.5 lg:pr-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#0F2747]">
                    <ShieldCheck aria-hidden="true" className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#0F2747]">
                      Accurate Information
                    </p>
                    <p className="text-[10.5px] text-slate-500">
                      Based on official railway data
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 lg:border-l lg:border-slate-200/90 lg:px-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF4EB] text-[#EA580C]">
                    <Zap aria-hidden="true" className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#0F2747]">
                      Fast &amp; Easy
                    </p>
                    <p className="text-[10.5px] text-slate-500">
                      Get results in seconds
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 lg:border-l lg:border-slate-200/90 lg:px-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#0F2747]">
                    <MonitorSmartphone aria-hidden="true" className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#0F2747]">
                      Works on All Devices
                    </p>
                    <p className="text-[10.5px] text-slate-500">
                      Desktop, tablet and mobile
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 lg:border-l lg:border-slate-200/90 lg:pl-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#0F2747]">
                    <Users aria-hidden="true" className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#0F2747]">
                      Trusted by Travellers
                    </p>
                    <p className="text-[10.5px] text-slate-500">
                      Used by thousands of railway passengers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
