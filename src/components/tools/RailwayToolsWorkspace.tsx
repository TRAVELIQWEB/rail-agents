"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  Radio,
  Ticket,
  TrainFront,
} from "lucide-react";
import { railTools, resolveRailTool, type RailTool, type RailToolId } from "@/config/tools";
import { LiveTrainStatusTool } from "@/components/LiveTrainStatusTool";
import { PnrStatusTool } from "@/app/pnr-status/page";
import { FareCalculator } from "@/components/calculator/FareCalculator";
import { IRCTCCancellationRefundCalculator } from "@/components/calculator/IRCTCCancellationRefundCalculator";
import { TicketDateCalculator } from "@/components/calculator/TicketDateCalculator";
import { TrainChartPreparationTime } from "@/components/calculator/TrainChartPreparationTime";
import { InternalLink } from "@/components/ui/InternalLink";

function ToolIcon({
  icon,
  className = "h-4 w-4",
}: {
  icon: RailTool["icon"];
  className?: string;
}) {
  switch (icon) {
    case "train":
      return <TrainFront aria-hidden="true" className={className} />;
    case "ticket":
      return <Ticket aria-hidden="true" className={className} />;
    case "calendar":
      return <Calendar aria-hidden="true" className={className} />;
    case "radio":
      return <Radio aria-hidden="true" className={className} />;
    default:
      return <Calculator aria-hidden="true" className={className} />;
  }
}

type ToolColorTheme = {
  iconColor: string;
  badgeBg: string;
  inactiveItem: string;
  activeItem: string;
  selectedBox: string;
  bulletDot: string;
  focusRing: string;
  sidebarSummary: string;
  sidebarBullets: [string, string, string];
};

const toolColorThemes: Record<RailToolId, ToolColorTheme> = {
  "live-train": {
    iconColor: "text-[#1E40AF]",
    badgeBg: "bg-[#E8F0FF] border-[#B7CCFF]",
    inactiveItem:
      "border-[#D4E0F7] border-l-transparent bg-[#EDF3FF] hover:bg-[#E2ECFF] hover:border-[#B7CCFF]",
    activeItem:
      "border-[#9DB9F5] border-l-[#1E40AF] bg-[#E7EFFF] shadow-[0_2px_7px_rgba(30,64,175,0.12)]",
    selectedBox: "border-[#B7CCFF] bg-[#EAF1FF]",
    bulletDot: "bg-[#1E40AF]",
    focusRing: "focus-visible:outline-[#1E40AF]",
    sidebarSummary: "Track live train running status and real-time station updates.",
    sidebarBullets: [
      "Live station arrival & departure",
      "Delay & platform information",
      "Complete route stop timeline",
    ],
  },
  pnr: {
    iconColor: "text-[#166534]",
    badgeBg: "bg-[#E5F5E9] border-[#A8D9B4]",
    inactiveItem:
      "border-[#D0E6D5] border-l-transparent bg-[#ECF7EF] hover:bg-[#E1F1E5] hover:border-[#A8D9B4]",
    activeItem:
      "border-[#9ACDA6] border-l-[#166534] bg-[#E5F3E9] shadow-[0_2px_7px_rgba(22,101,52,0.12)]",
    selectedBox: "border-[#A8D9B4] bg-[#EAF5ED]",
    bulletDot: "bg-[#166534]",
    focusRing: "focus-visible:outline-[#166534]",
    sidebarSummary: "Check 10-digit PNR booking status and passenger confirmation details.",
    sidebarBullets: [
      "Current seat & berth status",
      "Waitlist & RAC tracking",
      "Chart preparation status",
    ],
  },
  fare: {
    iconColor: "text-[#6D28D9]",
    badgeBg: "bg-[#EEE9FF] border-[#CBBEFF]",
    inactiveItem:
      "border-[#DDD5F5] border-l-transparent bg-[#F1EDFC] hover:bg-[#E8E1FA] hover:border-[#CBBEFF]",
    activeItem:
      "border-[#B9A7EF] border-l-[#6D28D9] bg-[#EDE8FA] shadow-[0_2px_7px_rgba(109,40,217,0.12)]",
    selectedBox: "border-[#CBBEFF] bg-[#F0ECFC]",
    bulletDot: "bg-[#6D28D9]",
    focusRing: "focus-visible:outline-[#6D28D9]",
    sidebarSummary: "Calculate itemized train ticket fares and authorized service charges.",
    sidebarBullets: [
      "Base fare & IRCTC fee breakdown",
      "Payment gateway & agent charges",
      "Printable passenger fare slip",
    ],
  },
  refund: {
    iconColor: "text-[#9F1239]",
    badgeBg: "bg-[#FCE8ED] border-[#F2B8C5]",
    inactiveItem:
      "border-[#F0D2D9] border-l-transparent bg-[#FBEFF1] hover:bg-[#F8E3E8] hover:border-[#F2B8C5]",
    activeItem:
      "border-[#E6A9B7] border-l-[#9F1239] bg-[#F9E8EC] shadow-[0_2px_7px_rgba(159,18,57,0.12)]",
    selectedBox: "border-[#F2B8C5] bg-[#F9ECEF]",
    bulletDot: "bg-[#9F1239]",
    focusRing: "focus-visible:outline-[#9F1239]",
    sidebarSummary: "Estimate railway cancellation deductions and net refundable amount.",
    sidebarBullets: [
      "Class-wise cancellation slabs",
      "Waitlist, RAC & Tatkal rules",
      "Detailed PRS refund breakdown",
    ],
  },
  "ticket-date": {
    iconColor: "text-[#9A3412]",
    badgeBg: "bg-[#FCEBDD] border-[#EFC39F]",
    inactiveItem:
      "border-[#EBD8C6] border-l-transparent bg-[#FAF0E7] hover:bg-[#F6E5D6] hover:border-[#EFC39F]",
    activeItem:
      "border-[#E7B485] border-l-[#9A3412] bg-[#F8EBDD] shadow-[0_2px_7px_rgba(154,52,18,0.12)]",
    selectedBox: "border-[#EFC39F] bg-[#F8EEE4]",
    bulletDot: "bg-[#9A3412]",
    focusRing: "focus-visible:outline-[#9A3412]",
    sidebarSummary: "Find the exact 60-day advance reservation and Tatkal booking dates.",
    sidebarBullets: [
      "60-day ARP opening date",
      "AC & Non-AC Tatkal timings",
      "Booking window status checks",
    ],
  },
  chart: {
    iconColor: "text-[#115E59]",
    badgeBg: "bg-[#DFF3EF] border-[#9BCFC5]",
    inactiveItem:
      "border-[#CDE4DF] border-l-transparent bg-[#E9F5F2] hover:bg-[#DBEFEA] hover:border-[#9BCFC5]",
    activeItem:
      "border-[#8DC6BB] border-l-[#115E59] bg-[#E1F1ED] shadow-[0_2px_7px_rgba(17,94,89,0.12)]",
    selectedBox: "border-[#9BCFC5] bg-[#E6F2EF]",
    bulletDot: "bg-[#115E59]",
    focusRing: "focus-visible:outline-[#115E59]",
    sidebarSummary: "Find useful information about railway chart preparation.",
    sidebarBullets: [
      "Chart preparation guidance",
      "Journey timing information",
      "Reservation status checks",
    ],
  },
};

export function RailwayToolsWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toolParam = searchParams.get("tool");
  const hasPnrLookupParams =
    !toolParam && (searchParams.has("pnr") || searchParams.has("lookup"));
  const activeTool = hasPnrLookupParams
    ? resolveRailTool("pnr")
    : resolveRailTool(toolParam);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement | null>(null);
  const workspacePanelRef = useRef<HTMLElement | null>(null);

  // Reset right workspace scroll to top when switching tools
  useEffect(() => {
    workspacePanelRef.current?.scrollTo({ top: 0 });
  }, [activeTool.id]);

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
    if (toolId === activeTool.id && (toolId !== "live-train" || !toolParam)) {
      return;
    }

    const basePath = pathname || "/tools";
    const nextHref =
      toolId === "live-train" ? basePath : `${basePath}?tool=${encodeURIComponent(toolId)}`;
    router.push(nextHref, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5 lg:gap-6">
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
            className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left transition duration-150 hover:-translate-y-px hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${toolColorThemes[activeTool.id].selectedBox} ${toolColorThemes[activeTool.id].focusRing} motion-reduce:transform-none motion-reduce:transition-none`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-white shadow-2xs ${toolColorThemes[activeTool.id].badgeBg} ${toolColorThemes[activeTool.id].iconColor}`}>
                <ToolIcon icon={activeTool.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-[#0b2240]">
                  {activeTool.shortTitle}
                </span>
                <span className="block truncate text-[11px] text-slate-500">
                  {activeTool.badge}
                </span>
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 transition-transform duration-150 ${toolColorThemes[activeTool.id].iconColor} ${
                mobileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-tool-select-menu"
            role="listbox"
            aria-labelledby="mobile-tool-select-label"
            className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            {railTools.map((tool) => {
              const isSelected = tool.id === activeTool.id;
              const theme = toolColorThemes[tool.id];
              return (
                <button
                  key={tool.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectTool(tool.id)}
                  className={`group flex w-full items-center justify-between gap-2.5 rounded-lg border-l-[3px] px-3 py-2.5 text-left text-sm transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 ${theme.focusRing} motion-reduce:transform-none motion-reduce:transition-none ${
                    isSelected
                      ? `${theme.activeItem} font-semibold text-[#0b2240]`
                      : `${theme.inactiveItem} font-medium text-[#0b2240] hover:-translate-y-px hover:shadow-sm`
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <ToolIcon
                      icon={tool.icon}
                      className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${theme.iconColor}`}
                    />
                    <span className="truncate">{tool.shortTitle}</span>
                  </span>
                  {isSelected && (
                    <Check aria-hidden="true" className={`h-4 w-4 shrink-0 ${theme.iconColor}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR — DESKTOP (240–250px) & TABLET (230px)
         ══════════════════════════════════════════════════════════════════════ */}
      <aside
        aria-label="Railway Tools Sidebar"
        className="hidden shrink-0 md:block md:w-[230px] md:sticky md:top-[84px] md:max-h-[calc(100dvh-100px)] md:self-start lg:w-[250px] 2xl:top-[90px] 2xl:max-h-[calc(100dvh-106px)]"
      >
        <div className="flex h-full flex-col justify-between gap-4 overflow-y-auto rounded-2xl border border-slate-200/90 border-r-slate-300/90 bg-white p-3.5 shadow-[0_2px_10px_rgba(15,39,71,0.03)]">
          {/* 1. Tool Navigation List */}
          <div>
            <div className="border-b border-slate-100 px-2.5 pt-0.5 pb-2.5">
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                RAILWAY TOOLS
              </h2>
            </div>

            <nav aria-label="Select a railway tool" className="mt-2.5 space-y-1.5">
              {railTools.map((tool) => {
                const isSelected = tool.id === activeTool.id;
                const theme = toolColorThemes[tool.id];
                return (
                  <button
                    key={tool.id}
                    type="button"
                    aria-current={isSelected ? "page" : undefined}
                    onClick={() => handleSelectTool(tool.id)}
                    className={`group flex w-full cursor-pointer items-center justify-between gap-2 rounded-r-xl rounded-l-[5px] border border-l-[3px] px-3 py-2.5 text-left text-[13px] lg:text-[13.5px] leading-snug transition-all duration-175 hover:-translate-y-0.5 hover:shadow-sm motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.focusRing} ${
                      isSelected
                        ? `${theme.activeItem} font-semibold text-[#0b2240]`
                        : `${theme.inactiveItem} font-medium text-slate-700 hover:text-[#0b2240]`
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <ToolIcon
                        icon={tool.icon}
                        className={`h-4 w-4 shrink-0 transition-transform duration-175 group-hover:scale-110 ${theme.iconColor}`}
                      />
                      <span className="truncate">{tool.shortTitle}</span>
                    </span>
                    {isSelected ? (
                      <CheckCircle2
                        aria-hidden="true"
                        className={`h-4 w-4 shrink-0 ${theme.iconColor}`}
                      />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 2. Currently Selected Tool Details Box */}
          {(() => {
            const activeTheme = toolColorThemes[activeTool.id];
            return (
              <div
                className={`rounded-xl border p-3.5 transition-colors duration-200 ${activeTheme.selectedBox}`}
              >
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                  CURRENTLY SELECTED
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border bg-white shadow-2xs ${activeTheme.badgeBg} ${activeTheme.iconColor}`}
                  >
                    <ToolIcon icon={activeTool.icon} className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="truncate text-xs font-extrabold text-[#0b2240] lg:text-[13px]">
                    {activeTool.shortTitle}
                  </h3>
                </div>

                <p className="mt-2 text-[11.5px] leading-relaxed text-slate-600">
                  {activeTheme.sidebarSummary}
                </p>

                <ul className="mt-2.5 space-y-1.5 border-t border-slate-200/60 pt-2.5">
                  {activeTheme.sidebarBullets.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[11px] font-medium leading-snug text-slate-700"
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${activeTheme.bulletDot}`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* 3. Bottom Railway Tools Hub Panel */}
          <div className="mt-auto">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-amber-600 shadow-2xs">
                  <Lightbulb aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-xs font-bold tracking-tight text-[#102B4E]">
                  Railway Tools Hub
                </h3>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-slate-600">
                Check train status, PNR, fares, refunds and booking dates — all in one place.
              </p>
              <p className="mt-2 border-t border-slate-200/70 pt-1.5 text-[10.5px] font-semibold text-slate-500">
                Simple • Useful • Easy to access
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT WORKSPACE — COMPLETE WORKING TOOL INTERFACE
         ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={workspacePanelRef}
        aria-labelledby="active-workspace-tool-title"
        className="tools-workspace-panel min-w-0 flex-1 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_12px_rgba(15,39,71,0.04)] sm:p-5 lg:p-6"
      >
        {/* Active Tool Header Bar */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-3.5 sm:mb-5">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toolColorThemes[activeTool.id].badgeBg}`}
            >
              <ToolIcon icon={activeTool.icon} className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="active-workspace-tool-title"
                  className="text-lg font-extrabold tracking-tight text-[#102B4E] sm:text-xl"
                >
                  {activeTool.title}
                </h2>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${toolColorThemes[activeTool.id].badgeBg}`}
                >
                  {activeTool.badge}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                {activeTool.description}
              </p>
            </div>
          </div>

          <InternalLink
            href={activeTool.href}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-semibold text-[#102B4E] transition hover:border-blue-200 hover:bg-[#EFF6FF] hover:text-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <span>Open standalone page</span>
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </InternalLink>
        </div>

        {/* Active Tool Full Interface */}
        <div className="min-w-0">
          {activeTool.id === "live-train" && <LiveTrainStatusTool embedded />}
          {activeTool.id === "pnr" && <PnrStatusTool embedded />}
          {activeTool.id === "fare" && <FareCalculator />}
          {activeTool.id === "refund" && <IRCTCCancellationRefundCalculator />}
          {activeTool.id === "ticket-date" && <TicketDateCalculator />}
          {activeTool.id === "chart" && <TrainChartPreparationTime />}
        </div>
      </section>
    </div>
  );
}
