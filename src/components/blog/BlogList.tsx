"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import { extractYouTubeId } from "@/lib/youtube-parser";
import {
  Calendar,
  Clock,
  Search,
  ArrowRight,
  BookOpen,
  Sparkles,
  Play,
  Video,
  X,
  User,
} from "lucide-react";

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Determine dynamic categories from published posts
  const availableCategories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];

  const filtered = posts.filter((post) => {
    const matchCat = activeCategory === "All" || post.category === activeCategory;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q)) ||
      post.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // Most prominent post for "Worth Your Attention"
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const isSpotlightVisible =
    !!featuredPost && !search && activeCategory === "All";
  const articlesToShow = isSpotlightVisible
    ? filtered.filter((post) => post.id !== featuredPost.id)
    : filtered;

  return (
    <div className="space-y-10 sm:space-y-16">
      {/* ── 3. FEATURED ARTICLES ("Worth Your Attention") ── */}
      {isSpotlightVisible && featuredPost && (
        <section aria-labelledby="featured-journal-heading" className="space-y-6">
          <div className="border-b border-[#f0e4d7] pb-4">
            <div className="flex items-center gap-2 text-xs font-[800] uppercase tracking-wider text-[var(--primary-dark)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Editorial Spotlight</span>
            </div>
            <h2
              id="featured-journal-heading"
              className="mt-1 text-2xl sm:text-3xl font-[850] tracking-[-0.03em] text-[var(--navy)]"
            >
              Worth Your Attention
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              A selection of articles covering important developments, common questions, and useful lessons from the railway-ticketing landscape.
            </p>
          </div>

          <article className="group rounded-3xl border border-[#ede1d3] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,39,71,0.04)] transition-all duration-300 hover:border-orange-200 hover:shadow-[0_8px_32px_rgba(15,39,71,0.08)]">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              {/* Media Thumbnail */}
              <div className="lg:col-span-5 overflow-hidden rounded-2xl bg-slate-900 aspect-[16/9] relative">
                {featuredPost.featuredVideoUrl ? (
                  <div className="relative h-full w-full">
                    {(() => {
                      const videoId = extractYouTubeId(featuredPost.featuredVideoUrl);
                      const youtubeThumb = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

                      return youtubeThumb ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={youtubeThumb}
                            alt={featuredPost.title}
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-center justify-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition-transform duration-300 group-hover:scale-110">
                              <Play size={22} className="ml-1 fill-white" />
                            </div>
                          </div>
                          <div className="absolute bottom-3 right-3 rounded-md bg-black/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xs flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span>Featured YouTube Video</span>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                ) : featuredPost.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredPost.featuredImage}
                    alt={featuredPost.featuredImageAlt || featuredPost.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#fff7ed] to-[#fef3c7] p-6 text-center">
                    <BookOpen className="h-10 w-10 text-[var(--primary)] mb-2" />
                    <span className="text-xs font-bold text-orange-900/80">RailAgents Journal</span>
                  </div>
                )}
              </div>

              {/* Text & Content */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-[800] uppercase tracking-wider text-[var(--primary-dark)]">
                      {featuredPost.category}
                    </span>
                    {featuredPost.publishedAt && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(featuredPost.publishedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-[850] leading-snug tracking-[-0.02em] text-[var(--navy)] group-hover:text-[var(--primary-dark)] transition-colors">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h3>

                  <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <User className="h-3.5 w-3.5 text-orange-500" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="single-line-btn inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-[800] text-[var(--primary-dark)] hover:text-[var(--primary-hover)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                  >
                    <span>Read full article</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* ── 4. TOPIC NAVIGATION ("Stories, Updates & Perspectives") ── */}
      <section id="topics-section" aria-labelledby="topics-heading" className="space-y-5">
        <div className="border-b border-[#f0e4d7] pb-4">
          <div className="flex items-center gap-2 text-xs font-[800] uppercase tracking-wider text-[var(--primary-dark)]">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Category Index</span>
          </div>
          <h2
            id="topics-heading"
            className="mt-1 text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)] sm:text-3xl"
          >
            Stories, Updates &amp; Perspectives
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Explore the subjects that matter to railway agents and travellers, from booking developments to customer concerns and industry practices.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-1">
          <div className="sm:hidden">
            <label htmlFor="blog-category" className="sr-only">
              Filter articles by category
            </label>
            <select
              id="blog-category"
              value={activeCategory}
              onChange={(event) => {
                const selected = availableCategories.find(
                  (category) => category === event.target.value,
                );
                if (selected) setActiveCategory(selected);
              }}
              className="min-h-11 w-full rounded-full border border-[#eadbce] bg-white px-4 text-sm font-semibold text-[var(--navy)] shadow-xs outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-orange-100"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Category Pills */}
          <div className="hidden flex-wrap items-center gap-2 pb-1 sm:flex">
            {availableCategories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex min-h-10 items-center rounded-full border px-3 py-2 text-[11px] font-[750] whitespace-nowrap transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer sm:px-4 sm:text-xs ${
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs"
                      : "border-[#eadbce] bg-white text-[var(--navy)] hover:border-orange-300 hover:bg-orange-50/70"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <label htmlFor="blog-search" className="sr-only">
              Search articles
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              id="blog-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="h-10 w-full rounded-full border border-[#eadbce] bg-white pl-10 pr-9 text-xs font-medium text-[var(--navy)] shadow-xs outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-orange-100 placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search query"
                className="icon-action absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. ALL ARTICLES ("The Latest from RailAgents") ── */}
      <section id="articles-section" aria-labelledby="latest-articles-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-[#f0e4d7] pb-4">
          <div>
            <h2
              id="latest-articles-heading"
              className="text-xl sm:text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)]"
            >
              The Latest from RailAgents
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Browse our latest published articles, explanations, and observations about railway ticketing and related travel topics.
            </p>
          </div>

          <span className="text-xs text-slate-500 font-medium shrink-0">
            Showing <strong className="font-semibold text-slate-900">{articlesToShow.length}</strong> of{" "}
            <strong className="font-semibold text-slate-900">{posts.length}</strong> {posts.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {articlesToShow.length === 0 && filtered.length > 0 ? (
          <p className="rounded-2xl border border-dashed border-[#eadbce] bg-white p-8 text-center text-sm text-slate-600">
            The featured article is shown above.
          </p>
        ) : articlesToShow.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#eadbce] bg-white p-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 text-base font-[800] text-[var(--navy)]">No matching articles found</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search terms or select &quot;All&quot; categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="mt-4 inline-flex min-h-9 items-center justify-center rounded-full bg-[var(--primary)] px-4 py-1.5 text-xs font-[750] text-white hover:bg-[var(--primary-hover)] transition-colors"
            >
              Show all articles
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articlesToShow.map((post) => (
              <ArticleEditorialCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ArticleEditorialCard({ post }: { post: BlogPost }) {
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const readingTime = Math.max(
    1,
    Math.round(post.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200),
  );

  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl border border-[#ede1d3] bg-white overflow-hidden shadow-xs transition-all duration-200 hover:border-orange-200 hover:shadow-md">
      <div>
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
          {(() => {
            if (post.featuredVideoUrl) {
              const videoId = extractYouTubeId(post.featuredVideoUrl);

              if (videoId) {
                // High-resolution YouTube thumbnail with fallback
                const youtubeThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                return (
                  <div className="relative h-full w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={youtubeThumb}
                      alt={post.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Cinema / YouTube video player overlay badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-center justify-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <Play size={18} className="ml-0.5 fill-white" />
                      </div>
                    </div>
                    {/* YouTube Video Badge */}
                    <div className="absolute bottom-2.5 right-2.5 rounded-md bg-black/80 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-white backdrop-blur-xs flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>YouTube Video</span>
                    </div>
                  </div>
                );
              }
            }

            if (post.featuredImage) {
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              );
            }

            return (
              <div className="flex h-full w-full flex-col items-center justify-center bg-[#fff8f2] p-5 text-center">
                <BookOpen className="h-8 w-8 text-orange-400 mb-1" />
                <span className="text-[11px] font-bold text-orange-800/80">RailAgents Journal</span>
              </div>
            );
          })()}

          {/* Category Tag Pill */}
          <div className="absolute left-3 top-3">
            <span className="inline-flex max-w-full items-center whitespace-nowrap rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-[800] uppercase tracking-wider text-[var(--primary-dark)] shadow-xs">
              {post.category}
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="p-5">
          <h3 className="text-base font-[800] leading-snug text-[var(--navy)] group-hover:text-[var(--primary-dark)] transition-colors line-clamp-2">
            <Link href={`/blog/${post.slug}`} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
              {post.title}
            </Link>
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="border-t border-[#f2e9e1] px-5 py-3 flex items-center justify-between text-[11px] text-slate-400 mt-auto">
        <div className="flex items-center gap-1.5">
          {publishDate && <span>{publishDate}</span>}
          {publishDate && <span>•</span>}
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="h-3 w-3" />
            {readingTime}m
          </span>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 font-[750] text-[var(--primary-dark)] hover:text-[var(--primary-hover)] transition-colors"
        >
          <span>Read article</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
