"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  UserCheck,
  Zap,
  RotateCcw,
  HelpCircle,
  Briefcase,
  X,
} from "lucide-react";
import { guideCategories, guides, type GuideCategory } from "@/data/guides";

const GUIDES_PER_PAGE = 6;

// Category icons mapping for visual topic navigation
const categoryIcons: Record<string, React.ElementType> = {
  All: Sparkles,
  "Getting Started": CheckCircle2,
  "IRCTC Agent": UserCheck,
  "Booking": FileText,
  "Tatkal": Zap,
  "Cancellation & Refund": RotateCcw,
  "Troubleshooting": HelpCircle,
  "Business Tips": Briefcase,
};

export function GuidesDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GuideCategory>("All");
  const [visibleCount, setVisibleCount] = useState(GUIDES_PER_PAGE);

  const filteredGuides = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return guides.filter((guide) => {
      const matchesCategory = category === "All" || guide.category === category;
      const searchableText = [
        guide.title,
        guide.summary,
        guide.category,
        ...guide.keywords,
      ]
        .join(" ")
        .toLocaleLowerCase();
      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [category, query]);

  const visibleGuides = filteredGuides.slice(0, visibleCount);

  // Check if search/filter matches the featured compliance guide
  const featuredMatches = useMemo(() => {
    if (category !== "All" && category !== "IRCTC Agent") return false;
    if (!query.trim()) return true;
    const q = query.trim().toLocaleLowerCase();
    const searchable = "irctc agent rules & regulations complete operational compliance guide dos and donts tatkal refund otp charges penal section 143 railways act"
      .toLocaleLowerCase();
    return searchable.includes(q);
  }, [category, query]);

  return (
    <div className="space-y-8">
      {/* ── Search & Filter Controls ── */}
      <div className="space-y-4">
        {/* Search Field */}
        <div className="relative mx-auto max-w-2xl">
          <label htmlFor="guide-search" className="sr-only">
            Search railway agent guides, topics, or rules
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            id="guide-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(GUIDES_PER_PAGE);
            }}
            placeholder="Search guides or topics..."
            className="min-h-12 w-full rounded-2xl border border-[#eadbce] bg-white pl-12 pr-10 text-sm text-[var(--navy)] shadow-xs outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-orange-100 placeholder:text-slate-400"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setVisibleCount(GUIDES_PER_PAGE);
              }}
              aria-label="Clear search query"
              className="icon-action absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Topic / Category Navigation */}
        <nav aria-label="Filter guides by topic" className="w-full">
          <label className="sr-only" htmlFor="guide-category">
            Filter guides by topic
          </label>
          <select
            id="guide-category"
            value={category}
            onChange={(event) => {
              const selected = guideCategories.find(
                (item) => item === event.target.value,
              );
              if (!selected) return;
              setCategory(selected);
              setVisibleCount(GUIDES_PER_PAGE);
            }}
            className="min-h-11 w-full rounded-full border border-[#eadbce] bg-white px-4 text-sm font-semibold text-[var(--navy)] shadow-xs outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-orange-100 sm:hidden"
          >
            {guideCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="hidden flex-wrap items-center justify-center gap-2 pb-2 pt-1 sm:flex">
            {guideCategories.map((item) => {
              const selected = category === item;
              const Icon = categoryIcons[item] || Sparkles;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setCategory(item);
                    setVisibleCount(GUIDES_PER_PAGE);
                  }}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-[750] whitespace-nowrap transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer sm:gap-2 sm:px-4 sm:text-sm ${
                    selected
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs"
                      : "border-[#eadbce] bg-white text-[var(--navy)] hover:border-orange-300 hover:bg-orange-50/70"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${selected ? "text-white" : "text-[var(--primary)]"}`} aria-hidden="true" />
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ── Featured Guide Highlight: IRCTC Agent Rules & Regulations ── */}
      {featuredMatches ? (
        <section
          aria-labelledby="featured-guide-heading"
          className="group relative overflow-hidden rounded-3xl border-2 border-orange-200/90 bg-gradient-to-br from-white via-[#fffdfa] to-orange-50/40 p-6 sm:p-8 shadow-[0_4px_24px_rgba(249,115,22,0.08)] transition-all duration-300 hover:border-orange-300 hover:shadow-[0_8px_32px_rgba(249,115,22,0.12)]"
        >
          <div className="flex flex-col items-start gap-2.5 border-b border-orange-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full bg-orange-100/90 px-2.5 py-1 text-[10px] font-[800] uppercase tracking-wide text-[var(--primary-dark)] sm:px-3.5 sm:text-xs sm:tracking-wider">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Primary Compliance Guide
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              11-Point Regulatory Manual
            </span>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <h2
                id="featured-guide-heading"
                className="text-xl sm:text-2xl lg:text-3xl font-[850] tracking-[-0.03em] text-[var(--navy)] leading-tight"
              >
                IRCTC Agent Rules &amp; Regulations: Complete Guide
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600 max-w-3xl">
                The authoritative educational compliance handbook for railway booking agents. Covers approved Do&apos;s &amp; Don&apos;ts,
                strict commercial Tatkal lockout windows, legal service charge caps (₹20/₹40), customer consent mandates,
                cancellation OTP disbursement, and penalty avoidance under Section 143 of the Railways Act.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  Audited against Official IRCTC Master Policy
                </span>
                <span className="text-slate-400">•</span>
                <span>Includes Interactive Daily Compliance Checklist</span>
              </div>
            </div>

            <div className="pt-2 lg:pt-0">
              <Link
                href="/irctc-agent-registration"
                className="single-line-btn inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-3 text-[12px] font-[800] text-white shadow-[0_6px_20px_rgba(249,115,22,0.22)] transition-all duration-200 hover:bg-[var(--primary-hover)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:w-auto sm:gap-2 sm:px-6 sm:text-sm"
              >
                <span>Read Full Compliance Guide</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Results Counter ── */}
      <div className="flex flex-col items-start justify-between gap-2 border-b border-[#f0e1d5] pb-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:text-sm" aria-live="polite">
        <span>
          Showing <strong className="font-semibold text-slate-900">{visibleGuides.length}</strong> of{" "}
          <strong className="font-semibold text-slate-900">{filteredGuides.length}</strong> {filteredGuides.length === 1 ? "guide" : "guides"}
          {category !== "All" ? ` in "${category}"` : ""}
          {query ? ` matching "${query}"` : ""}
        </span>
        {query || category !== "All" ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
              setVisibleCount(GUIDES_PER_PAGE);
            }}
            className="font-semibold text-[var(--primary-dark)] hover:underline"
          >
            Reset Filters
          </button>
        ) : null}
      </div>

      {/* ── Guides Grid ── */}
      {visibleGuides.length > 0 ? (
        <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleGuides.map((guide) => (
            <article
              key={guide.slug}
              className="group flex h-full flex-col justify-between rounded-2xl border border-[#f0e1d5] bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-orange-300 hover:shadow-md"
            >
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-[#fff1e7] px-2 py-1 text-[0.625rem] font-[800] uppercase tracking-[0.04em] text-[#d95e0d] sm:px-3 sm:text-[0.7rem] sm:tracking-[0.07em]">
                    {guide.category}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-medium text-slate-400">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {guide.readTime}m read
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-[800] leading-snug text-[var(--navy)] group-hover:text-[var(--primary-dark)] transition-colors">
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] rounded-xs"
                  >
                    {guide.title}
                  </Link>
                </h3>

                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 line-clamp-3">
                  {guide.summary}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#f2e9e1] pt-3.5">
                <span className="text-[11px] text-slate-400">
                  Updated {new Date(`${guide.updatedAt}T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" })}
                </span>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-[750] text-[var(--primary-dark)] hover:text-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  Read Guide <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#eadbce] bg-white px-6 py-12 text-center">
          <BookOpen aria-hidden="true" className="mx-auto h-10 w-10 text-[var(--primary)]" />
          <h2 className="mt-3 text-lg font-[800] text-[var(--navy)]">
            No guides match your search.
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
            We couldn&apos;t find any guides matching your criteria. Try adjusting your query or reset the filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
              setVisibleCount(GUIDES_PER_PAGE);
            }}
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--primary)] px-5 py-2 text-xs font-[750] text-white hover:bg-[var(--primary-hover)] transition-colors"
          >
            Clear Search &amp; Show All
          </button>
        </div>
      )}

      {/* ── Accessible Load More ── */}
      {filteredGuides.length > visibleGuides.length ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((current) =>
                Math.min(current + GUIDES_PER_PAGE, filteredGuides.length),
              )
            }
            className="single-line-btn inline-flex min-h-11 items-center justify-center rounded-full border border-[#eadbce] bg-white px-7 py-2.5 text-sm font-[750] text-[var(--navy)] shadow-xs transition-all hover:border-orange-300 hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Load More Guides
          </button>
        </div>
      ) : null}
    </div>
  );
}
