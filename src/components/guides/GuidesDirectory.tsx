"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { guideCategories, guides, type GuideCategory } from "@/data/guides";

const GUIDES_PER_PAGE = 6;

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

  return (
    <>
      <div className="mb-5">
        <label htmlFor="guide-search" className="sr-only">
          Search guides, topics or questions
        </label>
        <div className="relative mx-auto max-w-2xl md:mx-0">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="guide-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(GUIDES_PER_PAGE);
            }}
            placeholder="Search guides, topics or questions..."
            className="min-h-12 w-full rounded-xl border border-[#eadbce] bg-white pl-12 pr-4 text-base text-[var(--navy)] shadow-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-orange-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div
        aria-label="Filter guides by category"
        className="mb-7 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]"
      >
        {guideCategories.map((item) => {
          const selected = category === item;
          return (
            <button
              key={item}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setCategory(item);
                setVisibleCount(GUIDES_PER_PAGE);
              }}
              className={`min-h-11 shrink-0 rounded-full border px-3.5 py-2 text-xs font-[700] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:text-sm ${
                selected
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[#eadbce] bg-white text-[var(--navy)] hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <p className="mb-4 text-sm text-slate-600" aria-live="polite">
        {filteredGuides.length > 0
          ? `Showing ${visibleGuides.length} of ${filteredGuides.length} ${filteredGuides.length === 1 ? "guide" : "guides"}`
          : ""}
      </p>

      {visibleGuides.length > 0 ? (
        <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3 xl:gap-6">
          {visibleGuides.map((guide) => (
            <article
              key={guide.slug}
              className="flex h-full flex-col items-center rounded-2xl border border-[#f0e1d5] bg-white p-5 text-center shadow-[0_5px_18px_rgba(15,39,71,0.045)] transition-shadow hover:shadow-[0_10px_28px_rgba(15,39,71,0.09)] sm:items-start sm:text-left sm:p-6"
            >
              <span className="mb-3 inline-flex w-fit rounded-full bg-[#fff1e7] px-3 py-1 text-[0.7rem] font-[800] uppercase tracking-[0.07em] text-[#d95e0d]">
                {guide.category}
              </span>
              <h2 className="text-lg font-[800] leading-snug text-[var(--navy)]">
                {guide.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                {guide.summary}
              </p>
              <div className="mt-5 flex w-full flex-col items-center gap-2 border-t border-[#f2e9e1] pt-4 sm:flex-row sm:justify-between sm:gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <BookOpen aria-hidden="true" className="h-4 w-4" />
                  {guide.readTime} min read
                </span>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="group inline-flex items-center gap-1 text-sm font-[700] text-[var(--primary-dark)] hover:text-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  Read Guide <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#f0e1d5] bg-white px-6 py-12 text-center">
          <BookOpen aria-hidden="true" className="mx-auto h-9 w-9 text-[var(--primary)]" />
          <h2 className="mt-3 text-lg font-[800] text-[var(--navy)]">
            No guides found for your search.
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Try another topic or choose a different category.
          </p>
        </div>
      )}

      {filteredGuides.length > visibleGuides.length ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((current) =>
                Math.min(current + GUIDES_PER_PAGE, filteredGuides.length),
              )
            }
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--primary)] px-6 py-2.5 text-sm font-[700] text-white shadow-[0_8px_20px_rgba(249,115,22,0.18)] transition-colors hover:bg-[#e85d04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Load More Guides
          </button>
        </div>
      ) : null}
    </>
  );
}
