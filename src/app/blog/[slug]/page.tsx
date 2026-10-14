// Public /blog/[slug] — individual blog post page
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { sanitizeHtml } from "@/lib/sanitize";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock, Tag } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") return {};

  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: { canonical: post.canonicalUrl ?? `${siteConfig.url}/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      url: `${siteConfig.url}/blog/${slug}`,
      publishedTime: post.publishedAt ?? undefined,
      authors: [post.author],
      images: post.featuredImage ? [{ url: post.featuredImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    // Drafts are filtered above; published posts can opt out of indexing.
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

  const safeContent = sanitizeHtml(post.content);
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
    url: `${siteConfig.url}/blog/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "RailAgents",
      url: siteConfig.url,
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfb]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-b from-[#fff9f5] to-white pt-10 pb-0 sm:pt-14">
          <div className="site-container">
            {/* Breadcrumbs */}
            <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-orange-600">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-orange-600">Blog</Link>
              <span>/</span>
              <span className="text-slate-800 line-clamp-1">{post.title}</span>
            </nav>

            {/* Category badge */}
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="max-w-3xl text-[clamp(1.75rem,5vw,3rem)] font-[850] leading-[1.12] tracking-[-0.03em] text-[var(--navy)]">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {post.author}
              </span>
              {publishDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {publishDate}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {readingTime} min read
              </span>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Tag size={13} className="text-slate-400" />
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="site-container mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="aspect-[16/7] w-full rounded-2xl object-cover shadow-sm"
            />
          </div>
        )}

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

