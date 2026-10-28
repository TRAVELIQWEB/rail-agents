// Public /blog/[slug] — individual blog post page
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { sanitizeHtml } from "@/lib/sanitize";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";
import { extractYouTubeId } from "@/lib/youtube-parser";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock, Tag } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") return {};

  const canonicalUrl = post.canonicalUrl ?? `${siteConfig.url}/blog/${slug}`;

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
          url: post.featuredImage ?? siteConfig.socialImage,
          alt: post.featuredImageAlt || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.featuredImage ?? siteConfig.socialImage],
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
  const relatedPosts = post.relatedPostIds?.length
    ? (await getPublishedPosts()).filter((item) => item.id !== post.id && post.relatedPostIds?.includes(item.id))
    : [];

  const readingTime = Math.max(1, Math.round(post.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200));

  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // Article structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.featuredImage ?? undefined,
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

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfb]">
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
      <main className="flex-1 pb-20">
        {/* Hero */}
        <div className="border-b border-orange-100/70 bg-gradient-to-b from-[#fff7ed]/50 via-[#fffdfa] to-white pt-8 pb-12 sm:pt-12 sm:pb-14">
          <div className="site-container max-w-4xl">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-orange-600 transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-slate-700 line-clamp-1">{post.title}</span>
            </nav>

            {/* Category badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3.5 py-1 text-xs font-bold text-orange-700 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="page-hero-title">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 sm:text-sm">
              <span className="flex items-center gap-1.5">
                <User size={15} className="text-orange-500" />
                <strong className="text-slate-700">{post.author}</strong>
              </span>
              {publishDate && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={15} />
                    {publishDate}
                  </span>
                </>
              )}
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 font-semibold text-orange-600">
                <Clock size={15} />
                {readingTime} min read
              </span>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Tag size={13} className="text-orange-400" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-orange-100 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Featured Media: YouTube Full-View Video Template or Cover Image */}
        {post.featuredVideoUrl ? (
          <div className="site-container max-w-5xl mt-8">
            {(() => {
              const videoId = extractYouTubeId(post.featuredVideoUrl);

              if (videoId) {
                return (
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-2.5 sm:p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
                    {/* YouTube Video Header Strip */}
                    <div className="mb-2.5 flex items-center justify-between px-2 pt-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[10px]">
                          ▶
                        </span>
                        <span className="font-bold text-slate-900">Featured Video Guide</span>
                        <span className="hidden sm:inline text-slate-400">• High Definition (16:9)</span>
                      </div>
                      <a
                        href={`https://www.youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                      >
                        <span>Watch on YouTube</span>
                        <span>↗</span>
                      </a>
                    </div>

                    {/* Standard Full-View 16:9 Video Player (Cinema / Widescreen View) */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black shadow-inner">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
                        title={post.title}
                        className="absolute inset-0 h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ) : post.featuredImage ? (
          <div className="site-container max-w-4xl mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="aspect-[16/8] w-full rounded-3xl object-cover shadow-[0_8px_30px_rgba(249,115,22,0.08)] ring-1 ring-orange-100"
            />
          </div>
        ) : null}

        {/* Article Body */}
        <div className="site-container mt-10 pb-16">
          <div className="mx-auto max-w-3xl">
            <div
              className="blog-content prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />

            {relatedPosts.length > 0 && (
              <section className="mt-12 border-t border-slate-100 pt-8" aria-labelledby="related-posts-heading">
                <h2 id="related-posts-heading" className="mb-4 text-xl font-bold text-slate-900">Related articles</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedPosts.map((related) => (
                    <Link key={related.id} href={`/blog/${related.slug}`} className="rounded-xl border border-slate-200 p-4 transition hover:border-orange-300 hover:bg-orange-50/40">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-orange-700">{related.category}</span>
                      <span className="mt-1 block font-semibold text-slate-900">{related.title}</span>
                      <span className="mt-1 block line-clamp-2 text-sm text-slate-600">{related.excerpt}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Back to blog */}
            <div className="mt-12 border-t border-slate-100 pt-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 transition hover:text-orange-700"
              >
                <ArrowLeft size={16} />
                Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
