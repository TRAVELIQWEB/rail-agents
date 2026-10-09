import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getGuideBySlug, guides } from "@/data/guides";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.summary,
    openGraph: { title: guide.title, description: guide.summary, type: "article" },
  };
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const whatsappMessage = encodeURIComponent(
    `Hi RailAgents, I have a question about: ${guide.title}. Please guide me.`,
  );
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${whatsappMessage}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#fff9f5]">
      <Header />
      <main className="flex-1 bg-[#fff9f5] py-9 sm:py-12">
      <div className="site-container">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-[var(--primary-dark)]">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/guides" className="hover:text-[var(--primary-dark)]">Guides</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-[var(--navy)]" aria-current="page">{guide.category}</li>
          </ol>
        </nav>

        <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#f0e1d5] bg-white shadow-[0_12px_36px_rgba(15,39,71,0.06)]">
          <header className="border-b border-[#f2e9e1] bg-gradient-to-br from-white to-[#fff8f2] px-5 py-7 text-center sm:px-9 sm:py-9 sm:text-left">
            <span className="inline-flex rounded-full bg-[#fff1e7] px-3 py-1 text-xs font-[800] uppercase tracking-[0.07em] text-[#d95e0d]">
              {guide.category}
            </span>
            <h1 className="mt-4 text-[clamp(1.8rem,5vw,2.75rem)] font-[850] leading-[1.12] tracking-[-0.04em] text-[var(--navy)]">
              {guide.title}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:mx-0">{guide.summary}</p>
            <p className="mt-4 text-xs font-medium text-slate-500">
              {guide.readTime} min read <span aria-hidden="true">·</span> Updated {new Date(`${guide.updatedAt}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
            </p>
          </header>

          <div className="px-5 py-7 sm:px-9 sm:py-9">
            <section aria-labelledby="quick-answer" className="rounded-2xl border border-orange-100 bg-[#fff8f2] p-5 sm:p-6">
              <h2 id="quick-answer" className="text-lg font-[800] text-[var(--navy)]">Quick Answer</h2>
              <p className="mt-2 text-sm leading-7 text-slate-700">{guide.quickAnswer}</p>
            </section>

            <nav aria-label="Table of contents" className="mt-7 rounded-2xl border border-[#eee5dc] bg-[#fffdfa] p-5">
              <h2 className="font-[800] text-[var(--navy)]">In this guide</h2>
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                {guide.sections.map((section, index) => (
                  <li key={section.heading}>
                    <a href={`#section-${index + 1}`} className="text-sm text-[var(--primary-dark)] underline-offset-4 hover:underline">
                      {index + 1}. {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-8 space-y-8">
              {guide.sections.map((section, index) => (
                <section key={section.heading} id={`section-${index + 1}`} className="scroll-mt-24">
                  <h2 className="text-xl font-[800] text-[var(--navy)]">{index + 1}. {section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="mt-3 text-[0.9375rem] leading-7 text-slate-700">{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.9375rem] leading-7 text-slate-700">
                      {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <aside className="mt-10 rounded-2xl border border-[#f0e1d5] bg-[#fff9f5] p-5 sm:p-6">
              <h2 className="text-lg font-[800] text-[var(--navy)]">Need help with your next step?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Ask a question or explore more practical learning resources.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                <Link href="/videos" className="inline-flex min-h-10 items-center rounded-full border border-[#e8d7c8] bg-white px-4 py-2 text-sm font-[700] text-[var(--navy)] hover:border-orange-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">Watch video guides</Link>
                <Link href="/ask-nihal" className="inline-flex min-h-10 items-center rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-[700] text-white hover:bg-[#e85d04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">Ask Nihal Singh</Link>
                <Link href="/contact" className="inline-flex min-h-10 items-center rounded-full border border-[#e8d7c8] bg-white px-4 py-2 text-sm font-[700] text-[var(--navy)] hover:border-orange-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">Contact RailAgents</Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-[#e8d7c8] bg-white px-4 py-2 text-sm font-[700] text-[var(--navy)] hover:border-orange-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">WhatsApp support</a>
              </div>
            </aside>
          </div>
        </article>
      </div>
      </main>
      <Footer />
    </div>
  );
}
