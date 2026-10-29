// Public /blog listing page — RailAgents Journal & Editorial Insights
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowDown, MessageSquare, ArrowRight } from "lucide-react";
import { getPublishedPosts } from "@/lib/posts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogList } from "@/components/blog/BlogList";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Railway Travel Insights & Industry Updates",
  description:
    "Read railway-ticketing insights, industry updates, booking explanations, and practical perspectives for railway agents and travellers on RailAgents.",
  alternates: { canonical: `${siteConfig.url}/blog` },
  openGraph: {
    title: "Railway Travel Insights & Industry Updates | RailAgents",
    description:
      "Read railway-ticketing insights, industry updates, booking explanations, and practical perspectives for railway agents and travellers on RailAgents.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "RailAgents Journal — Insights from the World of Railway Travel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Railway Travel Insights & Industry Updates | RailAgents",
    description:
      "Read railway-ticketing insights, industry updates, booking explanations, and practical perspectives for railway agents and travellers on RailAgents.",
    images: [siteConfig.socialImage],
  },
};

// Revalidate every 60 seconds so new posts appear promptly
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />

      <main className="relative flex-1 overflow-hidden">
        {/* Subtle Ambient Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-28 top-8 h-72 w-72 rounded-full bg-orange-100/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 top-28 h-80 w-80 rounded-full bg-amber-100/30 blur-3xl"
        />

        {/* ══ 1. UNIQUE EDITORIAL HERO SECTION ══ */}
        <section
          aria-label="Journal introduction"
          className="relative border-b border-[#f0e4d7] bg-gradient-to-b from-[#fffcf8] via-[#faf6f0] to-[#f6efe6] pt-8 pb-6 sm:pt-10 sm:pb-8 lg:pt-11 lg:pb-8"
        >
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Eyebrow */}
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#edd7c4] bg-white/80 px-3.5 py-1 text-xs font-[800] uppercase tracking-[0.14em] text-[var(--primary-dark)] shadow-2xs backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                RAILAGENTS JOURNAL
              </div>

              {/* H1: Two-Color Heading */}
              <h1 className="page-hero-title">
                Insights from the{" "}
                <span className="hero-accent">World of Railway Travel</span>
              </h1>

              {/* Description */}
              <p className="page-hero-description mx-auto mt-3 max-w-2xl">
                Explore the changes, questions, and everyday challenges shaping railway ticketing.
                Read practical perspectives on agent responsibilities, passenger concerns, booking developments,
                and the details worth understanding before taking action.
              </p>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <a
                  href="#articles-section"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2 text-xs sm:text-sm font-[800] text-white shadow-[0_4px_14px_rgba(249,115,22,0.22)] transition-all hover:bg-[var(--primary-hover)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  <span>Explore Latest Articles</span>
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a
                  href="#topics-section"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ded0c3] bg-white px-5 py-2 text-xs sm:text-sm font-[750] text-[var(--navy)] shadow-2xs transition-all hover:border-orange-300 hover:bg-orange-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  <span>Browse Topics</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 2. EDITORIAL ARTICLES & TOPIC LISTING ══ */}
        <section aria-label="Journal articles and topics" className="py-12 sm:py-16">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div className="min-h-[320px] animate-pulse rounded-3xl bg-white/60" />}>
              <BlogList posts={posts} />
            </Suspense>

            {/* Empty State fallback */}
            {posts.length === 0 && (
              <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-orange-200 bg-white/80 p-12 text-center shadow-xs">
                <p className="font-semibold text-slate-700">No journal articles published yet.</p>
                <p className="mt-1 text-xs text-slate-500">
                  New analysis and observations are published regularly. Check back soon.
                </p>
              </div>
            )}

            {/* ══ 6. CLOSING SECTION: SUGGEST A TOPIC ══ */}
            <div className="mt-16 sm:mt-24 rounded-3xl border border-[#ede1d3] bg-gradient-to-br from-white via-[#fffaf5] to-orange-50/40 p-6 sm:p-10 shadow-xs">
              <div className="mx-auto max-w-2xl text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1 text-xs font-[800] uppercase tracking-wider text-[var(--primary-dark)]">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  Reader Suggestions
                </div>
                <h2 className="text-xl sm:text-2xl font-[850] tracking-[-0.03em] text-[var(--navy)]">
                  Have a Topic Worth Exploring?
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                  Have a question about railway-agent work or a topic you&apos;d like us to explain? Get in touch with RailAgents.
                </p>
                <div className="pt-3">
                  <Link
                    href="/contact"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-6 py-2.5 text-xs sm:text-sm font-[800] text-white shadow-xs transition-all hover:bg-slate-800 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)]"
                  >
                    <span>Suggest a Topic</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
