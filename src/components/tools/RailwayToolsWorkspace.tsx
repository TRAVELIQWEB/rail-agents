"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowUpRight,
  Calculator,
  Calendar,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Ticket,
  TrainFront,
} from "lucide-react";
import {
  findRailTool,
  railTools,
  resolveRailTool,
  type RailTool,
  type RailToolId,
} from "@/config/tools";
import { InternalLink } from "@/components/ui/InternalLink";
import { ToolsDirectory } from "./ToolsDirectory";

function ToolLoadingState() {
  return <p role="status" className="py-8 text-center text-sm text-slate-600">Loading railway tool…</p>;
}

// Keep calculator and API-tool bundles out of the directory's initial client bundle.
const LiveTrainStatusTool = dynamic(() => import("@/components/LiveTrainStatusTool").then((module) => module.LiveTrainStatusTool), { loading: ToolLoadingState });
const PnrStatusTool = dynamic(() => import("@/app/pnr-status/page").then((module) => module.PnrStatusTool), { loading: ToolLoadingState });
const FareCalculator = dynamic(() => import("@/components/calculator/FareCalculator").then((module) => module.FareCalculator), { loading: ToolLoadingState });
const IRCTCCancellationRefundCalculator = dynamic(() => import("@/components/calculator/IRCTCCancellationRefundCalculator").then((module) => module.IRCTCCancellationRefundCalculator), { loading: ToolLoadingState });
const TicketDateCalculator = dynamic(() => import("@/components/calculator/TicketDateCalculator").then((module) => module.TicketDateCalculator), { loading: ToolLoadingState });
const TrainChartPreparationTime = dynamic(() => import("@/components/calculator/TrainChartPreparationTime").then((module) => module.TrainChartPreparationTime), { loading: ToolLoadingState });

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
    sidebarIconBg: "bg-[#FCEBDD] text-[#F36B21]",
    badgeBg: "bg-[#FDF0E4] border-[#F7D0AE]",
    pillText: "text-[#9A3412]",
    pillDot: "bg-[#F36B21]",
    pillLabel: "BOOKING DATES",
    cardDescription:
      "Find 60-day reservation and Tatkal booking opening dates.",
    activeItem:
      "border-[#FDBA74] bg-[#FCEBDD] shadow-[0_2px_7px_rgba(154,52,18,0.10)]",
    focusRing: "focus-visible:outline-[#F36B21]",
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
              : "border-[#F6C8A0] bg-[#FDE8D7] focus-visible:outline-[#F36B21]"
              } motion-reduce:transform-none motion-reduce:transition-none`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-white shadow-2xs ${selectedTool
                  ? `${toolColorThemes[selectedTool.id].badgeBg} ${toolColorThemes[selectedTool.id].iconColor}`
                  : "border-[#F6C8A0] bg-[#FFF4EB] text-[#F36B21]"
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
              className={`h-4 w-4 shrink-0 transition-transform duration-150 ${selectedTool ? toolColorThemes[selectedTool.id].iconColor : "text-[#F36B21]"
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
              className={`group flex w-full items-center justify-between gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#F36B21] ${!selectedTool
                ? "border-[#F5C299] bg-[#FDE6D2] font-bold text-[#9A3412]"
                : "border-slate-200/80 bg-[#F8FAFC] font-medium text-[#0b2240]"
                }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FFF4EB] text-[#F36B21]">
                  <LayoutGrid aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="truncate">All Tools</span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 ${!selectedTool ? "text-[#F36B21]" : "text-slate-400"}`}
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
                fill="#F36B21"
              />
              <path
                d="M4 15.5L16 22L28 15.5"
                stroke="#F36B21"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 20.5L16 27L28 20.5"
                stroke="#F36B21"
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
              className={`group flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border min-h-11 px-2.5 py-2 text-left text-[13px] leading-snug transition-all duration-175 hover:-translate-y-0.5 hover:shadow-xs motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F36B21] ${!selectedTool
                ? "border-[#FED7AA] bg-[#FFF2E8] font-bold text-[#9A3412] shadow-[0_2px_6px_rgba(194,65,12,0.08)]"
                : "border-[#EAEFF5] bg-[#F8FAFC] font-bold text-[#0F2747] hover:border-[#F5C299] hover:bg-[#FFF4EB]"
                }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-transform duration-175 group-hover:scale-105 ${!selectedTool
                    ? "bg-[#FAD5B5] text-[#F36B21]"
                    : "bg-[#FFF3E8] text-[#F36B21]"
                    }`}
                >
                  <LayoutGrid aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 break-words">All Tools</span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${!selectedTool ? "text-[#F36B21]" : "text-slate-400"
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
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#FFEDD5] text-[#F36B21] shadow-2xs">
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
                    stroke="#F36B21"
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
        tabIndex={0}
        aria-labelledby={selectedTool ? "active-workspace-tool-title" : "railway-tools-title"}
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
          <ToolsDirectory embedded />
        )}
      </section>
    </div>
  );
}
