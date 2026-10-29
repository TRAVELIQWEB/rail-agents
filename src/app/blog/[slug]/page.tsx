// Public /blog/[slug] — individual blog post page
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { sanitizeHtml } from "@/lib/sanitize";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";
import { parseSocialVideoUrl } from "@/lib/youtube-parser";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  User,
  Clock,
  Tag,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa6";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") return {};

  const canonicalUrl = post.canonicalUrl ?? `${siteConfig.url}/blog/${slug}`;
  const socialVideo = parseSocialVideoUrl(post.featuredVideoUrl);
  const ogImage =
    post.featuredImage || socialVideo?.thumbnailUrl || siteConfig.socialImage;

  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      url: canonicalUrl,
      publishedTime: post.publishedAt ?? undefined,
      authors: [post.author],
      images: [
        {
          url: ogImage,
          alt: post.featuredImageAlt || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [ogImage],
    },
    robots: { index: post.allowIndexing !== false, follow: true },
  };
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export const revalidate = 60;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // 404 for unpublished posts — never expose drafts
  if (!post || post.status !== "published") {
    notFound();
  }

  const canonicalUrl = post.canonicalUrl ?? `${siteConfig.url}/blog/${slug}`;
  const safeContent = sanitizeHtml(post.content)
    .replace(/<h1(\b[^>]*)>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>");

  const allPublished = await getPublishedPosts();
  const explicitRelated = post.relatedPostIds?.length
    ? allPublished.filter(
      (item) => item.id !== post.id && post.relatedPostIds?.includes(item.id)
    )
    : [];

  // Fallback to latest articles from the same category or journal so the bottom section always looks complete
  const fallbackRelated = allPublished
    .filter(
      (item) =>
        item.id !== post.id &&
        !explicitRelated.some((rel) => rel.id === item.id)
    )
    .sort((a, b) => {
      const aSameCat = a.category === post.category ? 1 : 0;
      const bSameCat = b.category === post.category ? 1 : 0;
      return bSameCat - aSameCat;
    });

  const relatedPosts = [...explicitRelated, ...fallbackRelated].slice(0, 3);

  const wordCount = post.content
    .replace(/<[^>]*>/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : null;

  const socialVideo = parseSocialVideoUrl(post.featuredVideoUrl);

  // Article structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.featuredImage || socialVideo?.thumbnailUrl || undefined,
    url: canonicalUrl,
    publisher: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: "RailAgents",
      url: siteConfig.url,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteConfig.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  const hasImage = Boolean(post.featuredImage);
  const hasVideo = Boolean(socialVideo);
  const hasMedia = hasImage || hasVideo;

  const platformBadgeBg =
    socialVideo?.platform === "instagram"
      ? "bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600"
      : socialVideo?.platform === "facebook"
        ? "bg-blue-600"
        : "bg-red-600";

  const platformLinkColor =
    socialVideo?.platform === "instagram"
      ? "text-pink-600 hover:text-pink-700"
      : socialVideo?.platform === "facebook"
        ? "text-blue-600 hover:text-blue-700"
        : "text-red-600 hover:text-red-700";

  const platformName =
    socialVideo?.platform === "instagram"
      ? "Instagram"
      : socialVideo?.platform === "facebook"
        ? "Facebook"
        : "YouTube";

  const authorInitials = (post.author || "RailAgents")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen flex-col bg-[#faf7f2]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />

      <main className="relative flex-1 pb-20 overflow-hidden">
        {/* Ambient Decorative Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-amber-100/40 blur-3xl"
        />

        {/* ══ 1. EDITORIAL HERO HEADER ══ */}
        <section className="relative border-b border-[#ece0d1] bg-gradient-to-b from-[#fffaf3] via-[#fffdfa] to-[#faf7f2] pt-7 pb-8 sm:pt-9 sm:pb-10">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
            {/* Top Bar: Breadcrumb + Back Link */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <nav
                aria-label="Breadcrumb"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#eadbce] bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-500 shadow-2xs"
              >
                <Link
                  href="/"
                  className="hover:text-orange-600 transition-colors"
                >
                  Home
                </Link>
                <ChevronRight size={13} className="text-slate-300" />
                <Link
                  href="/blog"
                  className="hover:text-orange-600 transition-colors"
                >
                  Journal
                </Link>
                <ChevronRight size={13} className="text-slate-300" />
                <span className="text-slate-800 font-bold line-clamp-1 max-w-[200px] sm:max-w-[360px]">
                  {post.title}
                </span>
              </nav>

              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#eadbce] bg-white px-3.5 py-1.5 text-xs font-bold text-[#0f2747] shadow-2xs transition hover:border-orange-300 hover:bg-orange-50/60 hover:text-orange-700"
              >
                <ArrowLeft size={13} />
                <span>All Journal Articles</span>
              </Link>
            </div>

            {/* Category & Verified Guide Pill Row */}
            <div className="mb-4 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1 text-[11px] font-bold text-emerald-800">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Verified RailAgents Guide
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eadbce] bg-white/80 px-3 py-1 text-[11px] font-bold text-slate-600">
                <Clock size={12} className="text-orange-500" />
                {readingTime} min read
              </span>
            </div>

            {/* Article Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-[850] tracking-[-0.025em] text-[#0f2747] leading-[1.18] max-w-5xl">
              {post.title}
            </h1>

            {/* Subtitle / Lead Excerpt in Hero */}
            {post.excerpt && (
              <p className="mt-3.5 max-w-4xl text-sm sm:text-base lg:text-[17px] font-normal leading-relaxed text-slate-600">
                {post.excerpt}
              </p>
            )}

            {/* Structured Author, Date & Tags Bar */}
            <div className="mt-6 flex flex-col gap-4 border-t border-[#ede1d3]/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
              {/* Author & Date */}
              <div className="flex flex-wrap items-center gap-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0f2747] to-[#1e3a5f] text-xs font-extrabold text-white shadow-xs ring-2 ring-orange-100">
                    {authorInitials || <User size={16} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#0f2747]">
                      <span>{post.author}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                      <span>Editorial Desk</span>
                      {publishDate && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <Calendar size={11} className="text-orange-500" />
                            Published {publishDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Tag size={12} className="text-orange-500" />
                    Topics:
                  </span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#e6d7c7] bg-white px-2.5 py-1 text-[11px] font-bold text-[#0f2747] shadow-2xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══ 2. MAIN EDITORIAL ARTICLE SHEET ══ */}
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 mt-7 sm:mt-9">
          <article className="rounded-3xl border border-[#e9dccd] bg-white p-5 sm:p-8 lg:p-11 shadow-[0_12px_40px_rgba(15,39,71,0.05)]">
            <div className="clearfix">
              {hasMedia && (
                /* Left Media Column (~44% width on desktop, floats left so long article content wraps cleanly underneath to 100% width with zero empty space) */
                <div className="mb-7 w-full lg:float-left lg:mr-9 xl:mr-11 lg:mb-6 lg:w-[44%] space-y-4">
                  {hasVideo && socialVideo ? (
                    <div className="overflow-hidden rounded-2xl border border-[#e6d7c7] bg-[#fffdfa] p-3 sm:p-3.5 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
                      {/* Video Header Bar */}
                      <div className="mb-2.5 flex items-center justify-between px-1 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${platformBadgeBg} text-white font-bold text-[10px] shadow-2xs`}
                          >
                            ▶
                          </span>
                          <span className="font-extrabold text-[#0f2747]">
                            {socialVideo.label}
                          </span>
                        </div>
                        <a
                          href={socialVideo.watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs font-extrabold ${platformLinkColor} hover:underline flex items-center gap-1`}
                        >
                          <span>Watch on {platformName}</span>
                          <span>↗</span>
                        </a>
                      </div>

                      {/* Responsive Video / Reel / Short Frame */}
                      <div
                        className={`relative w-full ${socialVideo.platform === "instagram"
                            ? "aspect-[4/5] min-h-[440px] bg-white"
                            : socialVideo.isVertical
                              ? "aspect-[4/4.4] sm:aspect-[4/3.6] bg-slate-950"
                              : "aspect-[16/9] bg-slate-950"
                          } overflow-hidden rounded-xl shadow-inner ring-1 ring-slate-900/10`}
                      >
                        {(post.featuredImage ||
                          socialVideo.fallbackThumbnailUrl) &&
                          socialVideo.platform !== "instagram" && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={
                                post.featuredImage ||
                                socialVideo.fallbackThumbnailUrl ||
                                ""
                              }
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-55 filter pointer-events-none"
                            />
                          )}
                        <iframe
                          src={socialVideo.embedUrl}
                          title={post.title}
                          className="relative z-10 h-full w-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>

                      {/* If custom 16:9 cover image was also uploaded alongside a vertical video, show a crisp caption bar */}
                      <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] font-medium text-slate-500">
                        <span>Official RailAgents Video Briefing</span>
                        <span className="font-semibold text-orange-600">
                          HD Embed
                        </span>
                      </div>
                    </div>
                  ) : (
                    <figure className="overflow-hidden rounded-2xl border border-[#e6d7c7] bg-[#fffdfa] p-2.5 sm:p-3 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-900/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.featuredImage || ""}
                          alt={post.featuredImageAlt || post.title}
                          className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
                        />
                      </div>
                      <figcaption className="mt-2.5 flex items-center justify-between px-1 text-[11px] font-medium text-slate-500">
                        <span className="line-clamp-1">
                          {post.featuredImageAlt || post.title}
                        </span>
                        <span className="shrink-0 font-bold text-orange-600 ml-2">
                          {post.category}
                        </span>
                      </figcaption>
                    </figure>
                  )}

                  {/* Quick Summary / Key Takeaway Card under Media */}
                  {post.excerpt && (
                    <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-[#fff8f1] via-[#fffcf8] to-orange-50/50 p-4 sm:p-5 shadow-2xs">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600">
                          <Sparkles size={13} />
                        </span>
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-orange-800">
                          Key Article Takeaway
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13.5px] font-medium leading-relaxed text-slate-700">
                        {post.excerpt}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Article Body Content — Flows beside media on top and wraps cleanly to 100% width underneath */}
              <div
                className="blog-content max-w-none text-slate-800"
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />
            </div>

            {/* ── Bottom of Article Sheet: Social Links + Editorial Trust Banner ── */}
            <div className="clear-both pt-8 mt-8 border-t border-[#efe4d8] space-y-6">
              {/* Social Media Video & Post Links Banner (when added in Admin Box 8) */}
              {(post.socialLinks?.instagram ||
                post.socialLinks?.facebook ||
                post.socialLinks?.youtube) && (
                  <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-r from-[#fff8f1] via-white to-[#fff8f1] p-5 sm:p-6 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600">
                          Watch &amp; Connect on Social Media
                        </p>
                        <h2 className="mt-0.5 text-base sm:text-lg font-extrabold text-[#0f2747]">
                          Follow this topic on our official social channels
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {post.socialLinks?.instagram && (
                          <a
                            href={post.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Watch on Instagram"
                            title="Watch on Instagram"
                            className="group flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-[0_6px_16px_rgba(238,42,123,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                          >
                            <FaInstagram className="h-5 w-5 transition-transform group-hover:scale-110" />
                          </a>
                        )}
                        {post.socialLinks?.facebook && (
                          <a
                            href={post.socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Watch on Facebook"
                            title="Watch on Facebook"
                            className="group flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#3b82f6] via-[#1d4ed8] to-[#1e40af] text-white shadow-[0_6px_16px_rgba(29,78,216,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                          >
                            <FaFacebookF className="h-5 w-5 transition-transform group-hover:scale-110" />
                          </a>
                        )}
                        {post.socialLinks?.youtube && (
                          <a
                            href={post.socialLinks.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Watch on YouTube"
                            title="Watch on YouTube"
                            className="group flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff4d4d] via-[#ff0000] to-[#cc0000] text-white shadow-[0_6px_16px_rgba(255,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105"
                          >
                            <FaYoutube className="h-5 w-5 transition-transform group-hover:scale-110" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Author & IRCTC Assistance Callout Bar */}
              <div className="rounded-2xl border border-[#e6d7c7] bg-gradient-to-br from-[#faf6f0] via-white to-[#fff8f1] p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3.5 max-w-2xl">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0f2747] text-white shadow-xs">
                      <ShieldCheck size={22} className="text-orange-400" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-[#0f2747]">
                          Published by {post.author}
                        </span>
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-800">
                          RailAgents Editorial
                        </span>
                      </div>
                      <p className="mt-1 text-xs sm:text-[13px] leading-relaxed text-slate-600">
                        Have questions about IRCTC authorized agent rules, ID onboarding, or compliant railway ticket booking operations? Our team helps travel businesses stay updated and compliant.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Link
                      href="/contact"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-orange-600 px-5 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-orange-700"
                    >
                      <span>Ask Our Team</span>
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      href="/blog"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#dccab8] bg-white px-4 py-2 text-xs font-extrabold text-[#0f2747] transition hover:border-orange-300 hover:bg-orange-50/50"
                    >
                      <BookOpen size={14} className="text-orange-600" />
                      <span>More Guides</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* ══ 3. RELATED / MORE JOURNAL ARTICLES ══ */}
          {relatedPosts.length > 0 && (
            <section
              className="mt-12 sm:mt-14"
              aria-labelledby="related-posts-heading"
            >
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[#eadbce] pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600">
                    Continue Reading
                  </span>
                  <h2
                    id="related-posts-heading"
                    className="mt-0.5 text-xl sm:text-2xl font-[850] tracking-tight text-[#0f2747]"
                  >
                    More Insights from RailAgents Journal
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-600 hover:text-orange-700"
                >
                  <span>View all articles</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => {
                  const relVideo = parseSocialVideoUrl(related.featuredVideoUrl);
                  const relThumb =
                    related.featuredImage || relVideo?.thumbnailUrl || "";
                  return (
                    <Link
                      key={related.id}
                      href={`/blog/${related.slug}`}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e8dacb] bg-white shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
                    >
                      <div>
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                          {relThumb ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={relThumb}
                              alt={related.featuredImageAlt || related.title}
                              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#fff7ed] to-[#fef3c7] p-4">
                              <BookOpen className="h-8 w-8 text-orange-500" />
                            </div>
                          )}
                          <div className="absolute left-3 top-3">
                            <span className="inline-flex rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-700 shadow-2xs">
                              {related.category}
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="text-base font-extrabold leading-snug text-[#0f2747] group-hover:text-orange-600 transition-colors line-clamp-2">
                            {related.title}
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
                            {related.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-[#f3eae0] px-5 py-3 flex items-center justify-between text-[11px] font-bold text-orange-600">
                        <span className="text-slate-500 font-medium">
                          {related.author}
                        </span>
                        <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Read Guide <ArrowRight size={12} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
