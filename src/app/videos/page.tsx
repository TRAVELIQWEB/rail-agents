import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { VideoGuidesList } from "@/components/videos/VideoGuidesList";
import { getLatestVideos, getYouTubeChannelVideosUrl } from "@/lib/youtube";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Railway & IRCTC Agent Video Guides",
  description:
    "Watch practical railway and IRCTC agent video guides from RailAgents, with clear walkthroughs of booking rules, registration, and common questions.",
  alternates: { canonical: `${siteConfig.url}/videos` },
  openGraph: {
    title: "Railway & IRCTC Agent Video Guides | RailAgents",
    description:
      "Watch practical railway and IRCTC agent video guides from RailAgents, with clear walkthroughs of booking rules, registration, and common questions.",
    url: `${siteConfig.url}/videos`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.socialImage,
        alt: "RailAgents railway and IRCTC agent video guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Railway & IRCTC Agent Video Guides | RailAgents",
    description:
      "Watch practical railway and IRCTC agent video guides from RailAgents, with clear walkthroughs of booking rules, registration, and common questions.",
    images: [siteConfig.socialImage],
  },
};

export default async function VideoGuidesPage() {
  const videos = await getLatestVideos(50);
  const channelVideosUrl = getYouTubeChannelVideosUrl();

  return (
    <div className="flex min-h-screen flex-col bg-[#fff9f5]">
      <Header />
      <main className="relative flex-1 overflow-hidden bg-[#fff9f5] py-7 sm:py-9 lg:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-orange-100/50 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-orange-200/30 blur-[100px]"
      />

      <div className="site-container relative">
        <div className="mb-6 sm:mb-8">
          <div className="mx-auto mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#f5dfcf] bg-white/70 px-3.5 py-1 text-xs font-[800] uppercase tracking-[0.12em] text-[#e96713] shadow-sm backdrop-blur-md min-[520px]:mx-0">
            <PlayCircle aria-hidden="true" className="h-3.5 w-3.5" />
            Video Learning
          </div>
          <div className="mb-4 flex flex-col items-center justify-between gap-3 text-center min-[520px]:flex-row min-[520px]:items-end min-[520px]:text-left sm:mb-6">
            <h1 className="page-hero-title min-w-0 text-center min-[520px]:text-left">
              Video <span className="hero-accent">Guides &amp; Tutorials</span>
            </h1>
            {channelVideosUrl ? (
              <a
                href={channelVideosUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-sm text-xs font-semibold text-[var(--primary-dark)] transition-colors duration-200 hover:text-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)] sm:text-sm"
              >
                Visit YouTube Channel
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            ) : null}
          </div>
          <p className="page-hero-description mx-auto mt-2 max-w-2xl text-center min-[520px]:mx-0 min-[520px]:text-left">
            Watch simple, practical video guides for railway and travel agents.
            Looking for comprehensive step-by-step reading? Explore our{" "}
            <Link href="/guides" className="font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700">
              Railway Agent Guides
            </Link>{" "}
            or check out the latest updates in our{" "}
            <Link href="/blog" className="font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700">
              Blog & Articles
            </Link>.
          </p>
        </div>

        {videos.length > 0 ? <VideoGuidesList videos={videos} /> : (
          <div className="rounded-3xl border border-[#f1e4d9] bg-white/80 px-6 py-12 text-center shadow-[0_10px_30px_rgba(15,39,71,0.05)] backdrop-blur-md">
            <PlayCircle
              aria-hidden="true"
              className="mx-auto h-10 w-10 text-[#f97316]"
            />
            <h2 className="mt-4 text-xl font-[800] text-[var(--navy)]">
              Video guides are coming soon
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
              We&apos;re preparing helpful railway and IRCTC guides. Please check
              back soon for the latest videos.
            </p>
            {channelVideosUrl ? (
              <a
                href={channelVideosUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--primary)] px-6 py-2.5 text-sm font-[700] text-white shadow-sm transition-colors hover:bg-[#e85d04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                Browse our YouTube channel
              </a>
            ) : null}
          </div>
        )}
      </div>
      </main>
      <Footer />
    </div>
  );
}
