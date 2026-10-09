import type { Metadata } from "next";
import { PlayCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideoGuidesList } from "@/components/videos/VideoGuidesList";
import { getLatestVideos, getYouTubeChannelVideosUrl } from "@/lib/youtube";

export const metadata: Metadata = {
  title: "Video Guides",
  description:
    "Watch RailAgents video guides for practical railway and IRCTC agent information.",
};

export default async function VideoGuidesPage() {
  const videos = await getLatestVideos(50);
  const channelVideosUrl = getYouTubeChannelVideosUrl();

  return (
    <div className="flex min-h-screen flex-col bg-[#fff9f5]">
      <Header />
      <main className="relative flex-1 overflow-hidden bg-[#fff9f5] py-10 sm:py-14 lg:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-orange-100/50 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-orange-200/30 blur-[100px]"
      />

      <div className="site-container relative">
        <div className="mb-8">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-[#f5dfcf] bg-white/70 px-3.5 py-2 text-xs font-[800] uppercase tracking-[0.12em] text-[#e96713] shadow-sm backdrop-blur-md min-[520px]:mx-0">
            <PlayCircle aria-hidden="true" className="h-4 w-4" />
            Video Learning
          </div>
          <SectionHeading
            title="Video Guides"
            href={channelVideosUrl ?? undefined}
            external
            linkText={channelVideosUrl ? "Visit YouTube Channel" : undefined}
          />
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-slate-600 min-[520px]:mx-0 min-[520px]:text-left sm:text-base">
            Watch simple, practical video guides for railway and travel agents.
            Learn about IRCTC agent services, booking workflows, and common
            customer questions with clear, step-by-step explanations. Pick a
            video below and learn at your own pace.
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
