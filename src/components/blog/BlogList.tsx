"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import { parseSocialVideoUrl } from "@/lib/youtube-parser";
import {
  Calendar,
  Clock,
  Search,
  ArrowRight,
  BookOpen,
  Sparkles,
  Play,
  X,
  User,
} from "lucide-react";

interface BlogListProps {
  posts: BlogPost[];
  initialSearch?: string;
}

function getBlogCategoryBadgeClass(category: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes("refund") || normalized.includes("cancel")) {
    return "bg-[#FFF1F2] text-[#BE123C] border border-rose-200/80";
  }
  if (normalized.includes("pnr") || normalized.includes("confirm") || normalized.includes("guide")) {
    return "bg-[#ECFDF5] text-[#15803D] border border-emerald-200/80";
  }
  if (normalized.includes("fare") || normalized.includes("charge") || normalized.includes("agent")) {
    return "bg-[#F5F3FF] text-[#7C3AED] border border-violet-200/80";
  }
  if (normalized.includes("chart") || normalized.includes("travel") || normalized.includes("train")) {
    return "bg-[#EFF6FF] text-[#2563EB] border border-blue-200/80";
  }
  if (normalized.includes("tatkal") || normalized.includes("booking")) {
    return "bg-[#FFF7ED] text-[#F36B21] border border-orange-200/80";
  }
  return "bg-[#F0FDFA] text-[#0D9488] border border-teal-200/80";
}

function PostMediaThumbnail({
  post,
  size = "large",
}: {
  post: BlogPost;
  size?: "large" | "compact";
}) {
  const socialVideo = parseSocialVideoUrl(post.featuredVideoUrl);

  const badgeDotColor =
    socialVideo?.platform === "instagram"
      ? "bg-pink-500"
      : socialVideo?.platform === "facebook"
      ? "bg-blue-500"
      : "bg-red-500";

  const playBtnColor =
    socialVideo?.platform === "instagram"
      ? "bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600"
      : socialVideo?.platform === "facebook"
      ? "bg-blue-600"
      : "bg-red-600";

  // Priority #1: Custom 16:9 Cover Image (if uploaded) — works for both regular posts AND video posts (eliminates vertical Shorts/Reels bars)
  if (post.featuredImage) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.featuredImage}
          alt={post.featuredImageAlt || post.title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {socialVideo && (
          <>
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-black/15 to-transparent flex items-center justify-center">
              <div
                className={`flex ${
                  size === "large" ? "h-14 w-14" : "h-11 w-11"
                } items-center justify-center rounded-full ${playBtnColor} text-white shadow-xl transition-transform duration-300 group-hover:scale-110`}
              >
                <Play
                  size={size === "large" ? 22 : 18}
                  className="ml-0.5 fill-white"
                />
              </div>
            </div>
            <div
              className={`type-caption absolute ${
                size === "large"
                  ? "bottom-3 right-3 px-2.5 py-1 "
                  : "bottom-2.5 right-2.5 px-2 py-0.5 "
              } z-30 rounded-md bg-black/85 font-black uppercase tracking-wider text-white backdrop-blur-xs flex items-center gap-1.5`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${badgeDotColor} animate-pulse`}
              />
              <span>{socialVideo.label}</span>
            </div>
          </>
        )}
      </div>
    );
  }

  // Priority #2: Social Video with auto-thumbnail (YouTube)
  if (socialVideo && socialVideo.thumbnailUrl) {
    const youtubeThumb = socialVideo.thumbnailUrl;
    const fallbackThumb = socialVideo.fallbackThumbnailUrl || "";
    return (
      <div className="relative h-full w-full overflow-hidden bg-slate-950">
        {/* Blurred Ambient Backdrop (Eliminates YouTube Shorts black bars) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={youtubeThumb}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover scale-125 blur-xl opacity-60 filter"
        />
        {/* Main Center Video Frame */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={youtubeThumb}
          onError={(e) => {
            if (fallbackThumb && e.currentTarget.src !== fallbackThumb) {
              e.currentTarget.src = fallbackThumb;
            }
          }}
          alt={post.title}
          className="relative z-10 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-center justify-center">
          <div
            className={`flex ${
              size === "large" ? "h-14 w-14" : "h-11 w-11"
            } items-center justify-center rounded-full ${playBtnColor} text-white shadow-xl transition-transform duration-300 group-hover:scale-110`}
          >
            <Play
              size={size === "large" ? 22 : 18}
              className="ml-0.5 fill-white"
            />
          </div>
        </div>
        <div
          className={`type-caption absolute ${
            size === "large"
              ? "bottom-3 right-3 px-2.5 py-1 "
              : "bottom-2.5 right-2.5 px-2 py-0.5 "
          } z-30 rounded-md bg-black/85 font-black uppercase tracking-wider text-white backdrop-blur-xs flex items-center gap-1.5`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${badgeDotColor} animate-pulse`}
          />
          <span>{socialVideo.label}</span>
        </div>
      </div>
    );
  }

  // Priority #3: Instagram or Facebook Video without custom cover image
  if (socialVideo) {
    const gradientBg =
      socialVideo.platform === "instagram"
        ? "bg-gradient-to-br from-purple-900 via-pink-700 to-orange-500"
        : "bg-gradient-to-br from-slate-900 via-blue-900 to-blue-600";

    return (
      <div
        className={`relative h-full w-full overflow-hidden ${gradientBg} flex flex-col items-center justify-center p-6 text-center text-white`}
      >
        <div
          className={`flex ${
            size === "large" ? "h-14 w-14" : "h-11 w-11"
          } items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white shadow-xl ring-1 ring-white/40 transition-transform duration-300 group-hover:scale-110`}
        >
          <Play
            size={size === "large" ? 22 : 18}
            className="ml-0.5 fill-white"
          />
        </div>
        <span className="type-caption mt-2.5 font-extrabold tracking-wide text-white/95 line-clamp-1 max-w-[85%]">
          {post.title}
        </span>
        <div
          className={`type-caption absolute ${
            size === "large"
              ? "bottom-3 right-3 px-2.5 py-1 "
              : "bottom-2.5 right-2.5 px-2 py-0.5 "
          } z-30 rounded-md bg-black/75 font-black uppercase tracking-wider text-white backdrop-blur-xs flex items-center gap-1.5`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${badgeDotColor} animate-pulse`}
          />
          <span>{socialVideo.label}</span>
        </div>
      </div>
    );
  }

  // Priority #4: Default fallback journal graphic
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#fff7ed] to-[#fef3c7] p-6 text-center">
      <BookOpen
        className={`${
          size === "large" ? "h-10 w-10 mb-2" : "h-8 w-8 mb-1"
        } text-[var(--primary)]`}
      />
      <span
        className={`type-caption ${
          size === "large" ? "" : ""
        } font-bold text-orange-900/80`}
      >
        RailAgents Journal
      </span>
    </div>
  );
}

export function BlogList({ posts, initialSearch = "" }: BlogListProps) {
  const [search, setSearch] = useState(initialSearch);
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
    <div className="w-full">
      <section
        id="topics-section"
        aria-labelledby="topics-heading"
        className="relative border-b border-[#f0e4d7] bg-gradient-to-b from-[#fffcf8] via-[#faf6f0] to-[#f6efe6] py-5 sm:py-6"
      >
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="type-caption mb-1 inline-flex items-center gap-2 rounded-full border border-[#edd7c4] bg-white/80 px-3 py-0.5 font-extrabold uppercase tracking-[0.14em] text-[var(--primary-dark)] shadow-2xs backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
              RailAgents Journal
            </div>
            <h1 id="topics-heading" className="type-page-title page-hero-title">
              Insights from the <span className="hero-accent">World of Railway Travel</span>
            </h1>
            <p className="type-hero-description page-hero-description mx-auto mt-1 max-w-2xl">
              Railway ticketing updates, practical guides, and travel insights.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-[#eadbce]/80 pt-4 xl:flex-row xl:items-center xl:justify-between">
            <nav aria-label="Article categories" className="hidden min-w-0 flex-wrap items-center gap-2 pb-1 sm:flex xl:flex-1 xl:flex-nowrap xl:overflow-x-auto">
              {availableCategories.map((cat) => {
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setActiveCategory(cat)}
                    className={`type-button inline-flex min-h-10 shrink-0 items-center rounded-full border px-3 py-2 font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer sm:px-3.5 ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs"
                        : "border-[#eadbce] bg-white text-[var(--navy)] hover:border-orange-300 hover:bg-orange-50/70"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </nav>

            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end xl:w-auto xl:shrink-0">
              <div className="sm:hidden">
                <label htmlFor="blog-category" className="type-label sr-only">
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
                  className="type-input min-h-11 w-full rounded-full border border-[#eadbce] bg-white px-4 font-semibold text-[var(--navy)] shadow-xs outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-orange-100"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <label htmlFor="blog-search" className="type-label sr-only">
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
                  className="type-input h-10 w-full rounded-full border border-[#eadbce] bg-white pl-10 pr-9 font-medium text-[var(--navy)] shadow-xs outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-orange-100 placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search query"
                    className="type-button icon-action absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-8 lg:px-8">
        {/* ── 4. FEATURED ARTICLES ("Worth Your Attention" / Editorial Spotlight) ── */}
      {isSpotlightVisible && featuredPost && (
        <section aria-labelledby="featured-journal-heading" className="space-y-4 sm:space-y-5">
          <div className="border-b border-[#f0e4d7] pb-3 sm:pb-3.5">
            <div className="type-caption flex items-center gap-2 font-extrabold uppercase tracking-wider text-[var(--primary-dark)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Editorial Spotlight</span>
            </div>
            <h2
              id="featured-journal-heading"
              className="type-h2 mt-1 tracking-[-0.03em] text-[var(--navy)]"
            >
              Worth Your Attention
            </h2>
            <p className="type-body-small mt-1.5 text-slate-600 max-w-2xl leading-relaxed">
              A selection of articles covering important developments, common questions, and useful lessons from the railway-ticketing landscape.
            </p>
          </div>

          <article className="group rounded-3xl border border-[#ede1d3] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,39,71,0.04)] transition-all duration-300 hover:border-orange-200 hover:shadow-[0_8px_32px_rgba(15,39,71,0.08)]">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              {/* Media Thumbnail */}
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="lg:col-span-5 block overflow-hidden rounded-2xl bg-slate-900 aspect-[16/9] relative"
              >
                <PostMediaThumbnail post={featuredPost} size="large" />
              </Link>

              {/* Text & Content */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`type-caption inline-flex rounded-full px-3 py-1 font-extrabold uppercase tracking-wider ${getBlogCategoryBadgeClass(featuredPost.category)}`}>
                      {featuredPost.category}
                    </span>
                    {featuredPost.publishedAt && (
                      <span className="type-caption inline-flex items-center gap-1 text-slate-500 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(featuredPost.publishedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  <h3 className="type-article-title  tracking-[-0.02em] text-[var(--navy)] group-hover:text-[var(--primary-dark)] transition-colors">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h3>

                  <p className="type-body  leading-relaxed text-slate-600 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="type-caption flex items-center gap-2 font-semibold text-slate-600">
                    <User className="h-3.5 w-3.5 text-orange-500" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="type-button single-line-btn inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#EFF6FF] px-3.5 py-1.5 font-extrabold text-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#1D4ED8] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
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
      {/* ── 5. ALL ARTICLES ("The Latest from RailAgents") ── */}
      <section id="articles-section" aria-labelledby="latest-articles-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-[#f0e4d7] pb-4">
          <div>
            <h2
              id="latest-articles-heading"
              className="type-h2  tracking-[-0.03em] text-[var(--navy)]"
            >
              The Latest from RailAgents
            </h2>
            <p className="type-body-small mt-1 text-slate-600 leading-relaxed">
              Browse our latest published articles, explanations, and observations about railway ticketing and related travel topics.
            </p>
          </div>

          <span className="type-caption  text-slate-500 font-medium shrink-0">
            Showing <strong className="font-semibold text-slate-900">{articlesToShow.length}</strong> of{" "}
            <strong className="font-semibold text-slate-900">{posts.length}</strong> {posts.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {articlesToShow.length === 0 && filtered.length > 0 ? (
          <p className="type-body-small rounded-2xl border border-dashed border-[#eadbce] bg-white p-8 text-center text-slate-600">
            The featured article is shown above.
          </p>
        ) : articlesToShow.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#eadbce] bg-white p-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="type-article-title mt-3 text-[var(--navy)]">No matching articles found</h3>
            <p className="type-body-small mt-1 text-slate-500">
              Try adjusting your search terms or select &quot;All&quot; categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="type-button mt-4 inline-flex min-h-9 items-center justify-center rounded-full bg-[var(--primary)] px-4 py-1.5 font-semibold text-white hover:bg-[var(--primary-hover)] transition-colors"
            >
              Show all articles
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${articlesToShow.length === 1 ? "grid-cols-1" : articlesToShow.length === 2 ? "sm:grid-cols-2 lg:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            {articlesToShow.map((post) => (
              <ArticleEditorialCard key={post.id} post={post} isWide={articlesToShow.length === 1} />
            ))}
          </div>
        )}
        </section>
      </div>
    </div>
  );
}

function ArticleEditorialCard({ post, isWide = false }: { post: BlogPost; isWide?: boolean }) {
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

  if (isWide) {
    return (
      <article className="group rounded-3xl border border-[#ede1d3] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(15,39,71,0.04)] transition-all duration-300 hover:border-orange-200 hover:shadow-[0_8px_32px_rgba(15,39,71,0.08)]">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          <Link
            href={`/blog/${post.slug}`}
            className="lg:col-span-5 block relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-900"
          >
            <PostMediaThumbnail post={post} size="large" />
          </Link>

          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`type-caption inline-flex rounded-full px-3 py-1 font-extrabold uppercase tracking-wider ${getBlogCategoryBadgeClass(post.category)}`}>
                  {post.category}
                </span>
                {publishDate && (
                  <span className="type-caption inline-flex items-center gap-1 text-slate-500 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {publishDate}
                  </span>
                )}
                <span className="type-caption inline-flex items-center gap-1 text-slate-500 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {readingTime}m read
                </span>
              </div>

              <h3 className="type-article-title  tracking-[-0.02em] text-[var(--navy)] group-hover:text-[var(--primary-dark)] transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>

              <p className="type-body  leading-relaxed text-slate-600 line-clamp-3">
                {post.excerpt}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="type-caption flex items-center gap-2 font-semibold text-slate-600">
                <User className="h-3.5 w-3.5 text-orange-500" />
                <span>{post.author}</span>
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="type-button single-line-btn inline-flex items-center gap-1.5 whitespace-nowrap font-extrabold text-[var(--primary-dark)] hover:text-[var(--primary-hover)] transition-colors"
              >
                <span>Read full article</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl border border-[#ede1d3] bg-white overflow-hidden shadow-xs transition-all duration-200 hover:border-orange-200 hover:shadow-md">
      <div>
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
          <Link href={`/blog/${post.slug}`} className="block h-full w-full">
            <PostMediaThumbnail post={post} size="compact" />
          </Link>

          {/* Category Tag Pill */}
          <div className="absolute left-3 top-3 z-30 pointer-events-none">
            <span className={`type-caption inline-flex max-w-full items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-extrabold uppercase tracking-wider shadow-xs backdrop-blur-xs ${getBlogCategoryBadgeClass(post.category)}`}>
              {post.category}
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="p-5">
          <h3 className="type-article-title  text-[var(--navy)] group-hover:text-[var(--primary-dark)] transition-colors line-clamp-2">
            <Link href={`/blog/${post.slug}`} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
              {post.title}
            </Link>
          </h3>

          <p className="type-body-small mt-2 leading-relaxed text-slate-600 line-clamp-3">
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="type-caption border-t border-[#f2e9e1] px-5 py-3 flex items-center justify-between text-slate-400 mt-auto">
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
          className="type-button inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          <span>Read article</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
