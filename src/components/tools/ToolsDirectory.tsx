"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  IndianRupee,
  Info,
  LayoutGrid,
  RotateCcw,
  Search,
  Ticket,
  TrainFront,
  X,
} from "lucide-react";
import { railTools, type RailToolId } from "@/config/tools";

const toolCardMeta: Record<
  RailToolId,
  {
    title: string;
    description: string;
    icon: React.ElementType;
    isCircle?: boolean;
  }
> = {
  "live-train": {
    title: "Live Train Status",
    description: "Check a train's reported running status, location, and station-wise timings.",
    icon: TrainFront,
    isCircle: false,
  },
  pnr: {
    title: "PNR Status Check",
    description: "Check booking details, passenger status, and chart information.",
    icon: Ticket,
    isCircle: false,
  },
  chart: {
    title: "Train Chart Preparation Time",
    description: "Check station-wise first and second reservation chart timings.",
    icon: CalendarClock,
    isCircle: false,
  },
  fare: {
    title: "Train Ticket Fare Calculator",
    description: "Estimate train fares with an IRCTC and agent service fee breakdown.",
    icon: IndianRupee,
    isCircle: true,
  },
  refund: {
    title: "IRCTC Cancellation & Refund Calculator",
    description: "Review PRS-based cancellation charges and estimated refunds.",
    icon: RotateCcw,
    isCircle: true,
  },
  "ticket-date": {
    title: "IRCTC Ticket Date Calculator",
    description: "Find 60-day advance reservation and Tatkal booking opening dates.",
    icon: CalendarCheck,
    isCircle: false,
  },
};

const categories: {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  toolIds: RailToolId[];
}[] = [
  {
    id: "all-tools",
    title: "All Railway Tools",
    description: "Choose a tool for train status, PNR, fares, refunds and booking dates.",
    icon: LayoutGrid,
    toolIds: railTools.map((tool) => tool.id),
  },
];

export function ToolsDirectory({ embedded = false }: { embedded?: boolean }) {
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("Search railway tools...");
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    function updatePlaceholder() {
      if (typeof window === "undefined") return;
      if (window.innerWidth >= 1280) {
        setPlaceholder('Search railway tools, e.g. "PNR", "Live Status", "Refund"...');
      } else if (window.innerWidth >= 640) {
        setPlaceholder('Search railway tools, e.g. "PNR", "Fare"...');
      } else {
        setPlaceholder("Search railway tools...");
      }
    }
    updatePlaceholder();
    window.addEventListener("resize", updatePlaceholder);
    return () => window.removeEventListener("resize", updatePlaceholder);
  }, []);

  const isToolMatching = (id: RailToolId) => {
    if (!normalizedQuery) return true;
    const meta = toolCardMeta[id];
    const tool = railTools.find((t) => t.id === id);
    const searchable = `${meta.title} ${meta.description} ${tool?.title ?? ""} ${tool?.shortTitle ?? ""}`.toLowerCase();
    return searchable.includes(normalizedQuery);
  };

  const hasAnyMatches = categories.some((category) =>
    category.toolIds.some((id) => isToolMatching(id)),
  );

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* ══ 1. REFINED HERO BANNER CARD (Compact, 60/40 Ratio, Aligned) ══ */}
      <section
        aria-label="Search and discover railway tools"
        className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xs"
      >
        {/* Subtle Ambient Radial Highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-gradient-to-br from-amber-200/25 to-orange-200/15 blur-3xl"
        />

        <div className="relative z-10 grid grid-cols-1 items-center gap-3 sm:gap-4 lg:grid-cols-[1fr_250px] xl:grid-cols-[1fr_360px]">
          {/* Left Content Column (Content + Full-Width Search) */}
          <div className="flex flex-col justify-center space-y-3 min-w-0">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0F2747]">
                Find the right railway tool
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Search by tool name or choose a common task.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="tool-directory-search flex w-full items-center justify-between gap-2 rounded-full border border-slate-200 bg-white p-1 pl-3.5 shadow-2xs transition-[border-color,box-shadow] hover:border-orange-300"
            >
              <Search className="h-4 w-4 shrink-0 text-[#F36B21]" aria-hidden="true" />
              <label htmlFor="railway-tool-search" className="sr-only">
                Search railway tools
              </label>
              <input
                id="railway-tool-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="tool-search-input w-full min-w-0 border-0 bg-transparent text-xs sm:text-[12px] xl:text-[13px] font-medium text-[#0F2747] outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search query"
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F36B21] to-[#EA580C] px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-[13px] font-bold text-white shadow-xs transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                <span>Search</span>
              </button>
            </form>
            <div className="flex flex-wrap items-center gap-2" aria-label="Popular searches">
              <span className="text-[11px] font-semibold text-slate-500">Popular:</span>
              {["Live train", "PNR status", "Fare calculator"].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className="rounded-full border border-orange-100 bg-orange-50/70 px-2.5 py-1 text-[11px] font-medium text-[#9A3412] transition-colors hover:border-orange-300 hover:bg-orange-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Right Train Illustration (Proportionate and Integrated) */}
          <div className="flex justify-center lg:justify-end min-w-0">
            <div className="relative aspect-[16/10] w-full max-h-[160px] max-w-[360px] overflow-hidden rounded-xl bg-[#fff8ed] shadow-2xs border border-orange-100/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/railway-tools-hero-train.jpg"
                alt="Modern yellow and white Indian express bullet train arriving at station with IRCTC signboard"
                className="absolute right-0 top-1/2 h-[180%] w-auto max-h-none max-w-none -translate-y-1/2 object-contain"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. CATEGORIES AND CARDS (Clean Titles, Consistent Cards) ══ */}
      {categories.map((category) => {
        const visibleTools = category.toolIds.filter((id) => isToolMatching(id));
        if (visibleTools.length === 0) return null;

        const CatIcon = category.icon;

        return (
          <section
            key={category.id}
            id={`tools-${category.id}`}
            aria-labelledby={`tools-${category.id}-title`}
            className="space-y-3 pt-1"
          >
            {/* Clean Section Heading with Small Orange Icon */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <CatIcon className="h-5 w-5 text-[#F36B21] shrink-0" strokeWidth={2.2} aria-hidden="true" />
              <h2
                id={`tools-${category.id}-title`}
                className="text-lg font-bold tracking-tight text-[#0F2747]"
              >
                {category.title}
              </h2>
              <p className="type-body-small basis-full pl-[1.875rem] text-slate-600 sm:basis-auto sm:pl-0">
                {category.description}
              </p>
            </div>

            {/* Equal-Height 3-Column Card Grid */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleTools.map((id) => {
                const meta = toolCardMeta[id];
                const tool = railTools.find((t) => t.id === id);
                if (!tool) return null;

                const CardIcon = meta.icon;
                const href = embedded ? `/tools?tool=${tool.id}` : tool.href;

                return (
                  <Link
                    key={tool.id}
                    href={href}
                    className="group relative flex flex-col justify-between h-full rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-4.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FDBA74] hover:shadow-[0_12px_26px_-14px_rgba(243,107,33,0.45)] focus-visible:-translate-y-0.5 focus-visible:border-[#FDBA74] focus-visible:shadow-[0_12px_26px_-14px_rgba(243,107,33,0.45)] min-h-[142px] cursor-pointer"
                    aria-label={`Open ${meta.title}`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Top-Left Aligned Icon Box */}
                      <div
                        className={`flex h-10 w-10 sm:h-10.5 sm:w-10.5 shrink-0 items-center justify-center border border-[#FED7AA] bg-[#FFF7F0] text-[#EA580C] transition-transform duration-200 group-hover:scale-105 ${
                          meta.isCircle ? "rounded-full" : "rounded-xl"
                        }`}
                      >
                        <CardIcon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                      </div>
                      {/* Title & Description with High Readability */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-[14.5px] font-bold text-[#0F2747] group-hover:text-[#F36B21] transition-colors leading-snug">
                          {meta.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed font-normal">
                          {meta.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Arrow at Bottom-Right */}
                    <div className="mt-3 flex justify-end">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#F36B21] bg-[#F36B21] text-white shadow-2xs transition-all duration-200 group-hover:bg-[#D95612] group-hover:border-[#D95612] group-hover:scale-110">
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-white"
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ══ 3. EMPTY SEARCH STATE ══ */}
      {!hasAnyMatches && (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-8 sm:p-10 text-center shadow-2xs">
          <Search className="mx-auto h-8 w-8 text-orange-400" />
          <h2 className="mt-2 text-base font-bold text-[#0F2747]">No matching tools found</h2>
          <p className="mt-1 text-xs text-slate-500">
            Try searching for &ldquo;PNR&rdquo;, &ldquo;Train Status&rdquo;, &ldquo;Fare&rdquo; or &ldquo;Refund&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#FFF4EB] px-4 py-1.5 text-xs font-bold text-[#EA580C] border border-[#FDBA74] hover:bg-[#FFE8D6] transition-colors cursor-pointer"
          >
            <span>Show all tools</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* ══ 4. BOTTOM DISCLAIMER STRIP ══ */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 flex items-center gap-2.5 text-xs text-slate-500 font-medium">
        <Info className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <span>Live data depends on provider availability; calculator results are estimates.</span>
      </div>
    </div>
  );
}
