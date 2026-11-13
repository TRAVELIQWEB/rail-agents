import { WhatsAppLink } from "@/components/WhatsAppSettingsProvider";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getGuideBySlug, guides } from "@/data/guides";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  BookOpen,
  Clock,
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    notFound();
  }
  const canonicalUrl = `${siteConfig.url}/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: guide.title,
      description: guide.summary,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: "en_IN",
      type: "article",
      images: [
        {
          url: siteConfig.socialImage,
          alt: `${guide.title} | RailAgents`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.summary,
      images: [siteConfig.socialImage],
    },
  };
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const formattedDate = new Date(`${guide.updatedAt}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });


  // Other related guides in the same category or overall
  const relatedGuides = guides
    .filter((g) => g.slug !== guide.slug)
    .sort((a, b) => Number(b.category === guide.category) - Number(a.category === guide.category))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${siteConfig.url}/guides/${guide.slug}#article`,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        mainEntityOfPage: `${siteConfig.url}/guides/${guide.slug}`,
        headline: guide.title,
        description: guide.summary,
        dateModified: `${guide.updatedAt}T00:00:00.000Z`,
        url: `${siteConfig.url}/guides/${guide.slug}`,
        inLanguage: "en-IN",
        articleSection: guide.category,
        image: siteConfig.socialImage,
        author: {
          "@type": "Organization",
          "@id": `${siteConfig.url}/#organization`,
          name: siteConfig.name,
          url: `${siteConfig.url}/about`,
        },
        publisher: {
          "@id": `${siteConfig.url}/#organization`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteConfig.url}/guides/${guide.slug}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guides",
            item: `${siteConfig.url}/guides`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.title,
            item: `${siteConfig.url}/guides/${guide.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#faf6f0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />

      <main id="main-content" tabIndex={-1} className="relative flex-1 overflow-x-clip pb-16 sm:pb-24">
        {/* Ambient Top Background Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-200/40 to-amber-100/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-amber-200/30 to-orange-100/20 blur-3xl"
        />

        {/* ══ HERO BANNER ══ */}
        <section className="relative border-b border-[#ebdccd] bg-gradient-to-b from-[#fffcf8] via-[#fffaf5] to-[#faf6f0] pt-6 pb-10 sm:pt-9 sm:pb-14">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-5 sm:mb-6">
              <ol className="type-caption flex flex-wrap items-center gap-1.5 text-stone-500 font-medium">
                <li>
                  <Link
                    href="/"
                    className="type-button hover:text-orange-600 transition-colors inline-flex items-center gap-1"
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-stone-300">
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li>
                  <Link
                    href="/guides"
                    className="hover:text-orange-600 transition-colors"
                  >
                    Guides
                  </Link>
                </li>
                <li aria-hidden="true" className="text-stone-300">
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li className="text-stone-800 font-semibold truncate max-w-[200px] sm:max-w-none" aria-current="page">
                  {guide.title}
                </li>
              </ol>
            </nav>

            <div className="max-w-3xl">
              {/* Category & Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                <span className="type-caption inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50/80 px-3 py-1 font-bold text-orange-700 shadow-xs">
                  <BookOpen className="h-3.5 w-3.5 text-orange-600" />
                  {guide.category}
                </span>
                <span className="type-caption inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white/80 px-2.5 py-1 font-semibold text-stone-600">
                  <Clock className="h-3 w-3 text-stone-400" />
                  {guide.readTime} min read
                </span>
                <span className="type-caption inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white/80 px-2.5 py-1 font-semibold text-stone-600">
                  <Calendar className="h-3 w-3 text-stone-400" />
                  Updated {formattedDate}
                </span>
              </div>

              {/* Title */}
              <h1 className="type-page-title  tracking-tight text-[#0f2747] ">
                {guide.title}
              </h1>

              {/* Summary Description */}
              <p className="type-introduction mt-3.5 sm:mt-4 leading-relaxed text-stone-600">
                {guide.summary}
              </p>

              {/* Author byline */}
              <div className="mt-5 flex items-center gap-3 pt-4 border-t border-[#f0e3d5]">
                <div className="type-caption h-9 w-9 rounded-full bg-gradient-to-tr from-[#F36B21] to-[#9a3412] flex items-center justify-center text-white font-bold shadow-xs">
                  NS
                </div>
                <div className="type-caption ">
                  <div className="font-bold text-[#0f2747]">
                    By <Link href="/about" className="hover:text-orange-600 transition-colors underline-offset-2 hover:underline">Nihal Singh</Link>
                  </div>
                  <div className="text-stone-500">20+ Years Railway Ticketing Guidance</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ MAIN TWO-COLUMN CONTENT AREA ══ */}
        <section className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 mt-7 sm:mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* LEFT / CENTER COLUMN: ARTICLE CONTENT */}
            <article className="type-guide-article lg:col-span-8 space-y-7">
              {/* Quick Answer Callout */}
              {guide.quickAnswer && (
                <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200/80 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/50 p-5 sm:p-7 shadow-[0_4px_20px_rgba(249,115,22,0.06)]">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="type-caption inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-orange-950">
                        Quick Takeaway
                      </div>
                      <h2 className="type-h2  text-stone-900 mt-0.5">
                        Key Guidance
                      </h2>
                      <p className="type-body-small mt-2 leading-relaxed text-stone-700">
                        {guide.quickAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Table of Contents Box (Inline for Mobile / Tablet) */}
              <div className="rounded-2xl border border-[#ede1d3] bg-[#fffdfa] p-5 sm:p-6 shadow-xs lg:hidden">
                <div className="type-caption flex items-center gap-2 font-extrabold uppercase tracking-wider text-stone-700">
                  <BookOpen className="h-4 w-4 text-orange-600" />
                  In This Guide
                </div>
                <ol className="mt-3.5 space-y-2">
                  {guide.sections.map((section, idx) => (
                    <li key={section.heading}>
                      <a
                        href={`#section-${idx + 1}`}
                        className="type-body-small flex items-center gap-2 font-semibold text-stone-700 hover:text-orange-600 transition-colors"
                      >
                        <span className="type-caption flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100/70 font-bold text-orange-800">
                          {idx + 1}
                        </span>
                        <span className="truncate">{section.heading}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Guide Content Sections */}
              <div className="space-y-6 sm:space-y-8">
                {guide.sections.map((section, index) => {
                  const sectionNum = index + 1;
                  return (
                    <section
                      key={section.heading}
                      id={`section-${sectionNum}`}
                      className="scroll-mt-24 rounded-3xl border border-[#ece0d2] bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,39,71,0.03)] transition-all duration-200 hover:border-orange-200"
                    >
                      {/* Section Header */}
                      <div className="flex items-start gap-3.5 pb-4 border-b border-[#f4eae0]">
                        <span className="type-body-small flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 font-extrabold text-orange-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_4px_rgba(249,115,22,0.1)]">
                          {sectionNum}
                        </span>
                        <div>
                          <div className="type-caption  font-bold uppercase tracking-wider text-stone-600">
                            Section {sectionNum}
                          </div>
                          <h2 className="type-h2  text-[#0f2747] tracking-tight mt-0.5">
                            {section.heading}
                          </h2>
                        </div>
                      </div>

                      {/* Section Body */}
                      <div className="type-body pt-4 space-y-3.5 text-stone-700 leading-relaxed ">
                        {section.paragraphs.map((paragraph, pIdx) => (
                          <p key={pIdx} className="type-body">{paragraph}</p>
                        ))}

                        {/* Bullets if present */}
                        {section.bullets && section.bullets.length > 0 && (
                          <div className="mt-4 rounded-2xl border border-orange-100 bg-[#fffdfa] p-4 sm:p-5">
                            <ul className="space-y-2.5">
                              {section.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="type-body-small flex items-start gap-2.5 text-stone-700">
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Bottom Support Banner */}
              <div className="rounded-3xl border border-[#ebdccd] bg-gradient-to-br from-[#fffaf4] via-white to-[#fff6ec] p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div>
                    <span className="type-caption inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-2.5 py-0.5 font-bold text-orange-800 uppercase tracking-wide">
                      <HelpCircle className="h-3.5 w-3.5 text-orange-600" />
                      Have Questions?
                    </span>
                    <h3 className="type-h3 mt-2 text-[#0f2747]">
                      Need Clarification on This Guide?
                    </h3>
                    <p className="type-body-small mt-1 text-stone-600 max-w-md">
                      Reach out directly to Nihal Singh or join our community for clear, verified answers on IRCTC rules and registrations.
                    </p>
                    <p className="type-body-small mt-1.5 text-stone-400">
                      Nihal Singh is a fictional digital character representing RailAgents.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5 shrink-0">
                    <WhatsAppLink contextMessage={guide.title}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="type-button inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 font-bold text-white shadow-sm hover:bg-[#20ba59] transition-all hover:scale-[1.02]"
                    >
                      <FaWhatsapp className="h-4 w-4" />
                      Chat on WhatsApp
                    </WhatsAppLink>
                    <Link
                      href="/ask-nihal"
                      className="type-button inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 font-bold text-stone-800 hover:bg-stone-50 transition-colors"
                    >
                      Ask Nihal Singh
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            {/* RIGHT SIDEBAR: STICKY TOC & HELPFUL RESOURCES */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              
              {/* Desktop Sticky Table of Contents */}
              <div className="hidden lg:block rounded-3xl border border-[#ebdccd] bg-white p-6 shadow-[0_4px_20px_rgba(15,39,71,0.04)]">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#f2e7db]">
                  <div className="type-caption flex items-center gap-2 font-extrabold uppercase tracking-wider text-stone-800">
                    <BookOpen className="h-4 w-4 text-orange-600" />
                    Table of Contents
                  </div>
                  <span className="type-caption  font-semibold text-stone-400">
                    {guide.sections.length} parts
                  </span>
                </div>

                <nav aria-label="Table of contents" className="mt-4">
                  <ol className="space-y-1.5">
                    {guide.sections.map((section, idx) => (
                      <li key={section.heading}>
                        <a
                          href={`#section-${idx + 1}`}
                          className="type-caption group flex items-start gap-2.5 rounded-xl px-2.5 py-2 font-semibold text-stone-600 hover:bg-orange-50/70 hover:text-orange-700 transition-all"
                        >
                          <span className="type-caption flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 font-bold text-stone-600 group-hover:bg-orange-200 group-hover:text-orange-800 transition-colors">
                            {idx + 1}
                          </span>
                          <span className="leading-snug pt-0.5">{section.heading}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>

              {/* Quick Actions Card */}
              <div className="rounded-3xl border border-[#ebdccd] bg-gradient-to-br from-[#fffcf8] to-[#faf4eb] p-6 shadow-xs">
                <div className="type-caption flex items-center gap-2 font-extrabold uppercase tracking-wider text-orange-800 mb-2">
                  <ShieldCheck className="h-4 w-4 text-orange-600" />
                  Recommended Resources
                </div>
                <h3 className="type-h3  text-[#0f2747]">
                  Master Ticketing Rules
                </h3>
                <p className="type-body-small mt-1 text-stone-600 leading-relaxed">
                  Avoid penalty risks and keep customer ticketing completely compliant.
                </p>

                <div className="mt-4 space-y-2">
                  <Link
                    href="/irctc-principal-service-providers-updated-29-03-2025"
                    className="type-caption flex items-center justify-between gap-2 rounded-xl border border-orange-200 bg-orange-50/60 p-3 font-bold text-orange-950 hover:border-orange-300 hover:bg-orange-100/70 hover:text-orange-700 hover:shadow-xs transition-all"
                  >
                    <span>IRCTC PSP Directory (Updated)</span>
                    <ArrowRight className="h-3.5 w-3.5 text-orange-600" />
                  </Link>
                  <Link
                    href="/train-ticket-agent-fare-calculator"
                    className="type-caption flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white p-3 font-bold text-stone-800 hover:border-orange-300 hover:text-orange-600 hover:shadow-xs transition-all"
                  >
                    <span>Fare &amp; Fee Calculator</span>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                  </Link>
                  <Link
                    href="/irctc-agent-rules-regulations"
                    className="type-caption flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white p-3 font-bold text-stone-800 hover:border-orange-300 hover:text-orange-600 hover:shadow-xs transition-all"
                  >
                    <span>Rules &amp; Regulations Guide</span>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                  </Link>
                  <Link
                    href="/videos"
                    className="type-caption flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white p-3 font-bold text-stone-800 hover:border-orange-300 hover:text-orange-600 hover:shadow-xs transition-all"
                  >
                    <span>Watch Video Tutorials</span>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                  </Link>
                </div>
              </div>

              {/* Related Guides Card */}
              {relatedGuides.length > 0 && (
                <div className="rounded-3xl border border-[#ebdccd] bg-white p-6 shadow-xs">
                  <div className="type-caption  font-extrabold uppercase tracking-wider text-stone-700 pb-3 border-b border-[#f2e7db]">
                    More Guides
                  </div>
                  <div className="mt-3.5 space-y-3">
                    {relatedGuides.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/guides/${item.slug}`}
                        className="group block rounded-xl p-2 hover:bg-[#faf6f0] transition-colors"
                      >
                        <div className="type-caption  font-bold text-stone-800 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {item.title}
                        </div>
                        <div className="type-caption mt-1 flex items-center gap-2 text-stone-500">
                          <span>{item.category}</span>
                          <span>·</span>
                          <span>{item.readTime} min</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
