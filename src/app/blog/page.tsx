
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
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

type BlogPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialSearch =
    typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const posts = await getPublishedPosts();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteConfig.url}/blog#webpage`,
        url: `${siteConfig.url}/blog`,
        name: "Railway Travel Insights & Industry Updates | RailAgents",
        description:
          "Read railway-ticketing insights, industry updates, booking explanations, and practical perspectives for railway agents and travellers on RailAgents.",
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        breadcrumb: { "@id": `${siteConfig.url}/blog#breadcrumb` },
        inLanguage: "en-IN",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: posts.length,
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: post.canonicalUrl ?? `${siteConfig.url}/blog/${post.slug}`,
            name: post.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteConfig.url}/blog#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Header />

      <main id="main-content" tabIndex={-1} className="relative flex-1 overflow-hidden">
        {/* Subtle Ambient Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-28 top-8 h-72 w-72 rounded-full bg-orange-100/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 top-28 h-80 w-80 rounded-full bg-amber-100/30 blur-3xl"
        />

        <section aria-label="Journal articles and topics" className="pb-8 sm:pb-10 lg:pb-12">
          <Suspense fallback={<div className="mx-auto mt-6 min-h-[320px] max-w-[1280px] animate-pulse rounded-3xl bg-white/60" />}>
              <BlogList key={initialSearch} posts={posts} initialSearch={initialSearch} />
          </Suspense>

          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
            {/* Empty State fallback */}
            {posts.length === 0 && (
              <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-orange-200 bg-white/80 p-12 text-center shadow-xs">
                <p className="type-body font-semibold text-slate-700">No journal articles published yet.</p>
                <p className="type-body-small mt-1 text-slate-500">
                  New analysis and observations are published regularly. Check back soon.
                </p>
              </div>
            )}

            {/* ══ 6. CLOSING SECTION: SUGGEST A TOPIC ══ */}
            <div className="mt-16 sm:mt-24 rounded-3xl border border-[#ede1d3] bg-gradient-to-br from-white via-[#fffaf5] to-orange-50/40 p-6 sm:p-10 shadow-xs">
              <div className="mx-auto max-w-2xl text-center space-y-3">
                <div className="type-caption inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1 font-extrabold uppercase tracking-wider text-[var(--primary-dark)]">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  Reader Suggestions
                </div>
                <h2 className="type-h2  tracking-[-0.03em] text-[var(--navy)]">
                  Have a Topic Worth Exploring?
                </h2>
                <p className="type-body-small  leading-relaxed text-slate-600">
                  Have a question about railway-agent work or a topic you&apos;d like us to explain? Get in touch with RailAgents.
                </p>
                <div className="pt-3">
                  <Link
                    href="/contact"
                    className="type-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-6 py-2.5 font-extrabold text-white shadow-xs transition-all hover:bg-slate-800 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)]"
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
