import { ArrowRight, CirclePlay, ExternalLink, Play } from "lucide-react";
import Image from "next/image";
import { getLatestVideos } from "@/lib/youtube";
import { getSocialLinks } from "@/lib/social-settings";

export async function VideoGuidesSection() {
  const videos = await getLatestVideos(3).catch(() => []);
  const channelUrl = (await getSocialLinks()).youtube;

  return (
    <section
      aria-labelledby="video-guides-heading"
      className="border-b border-[#E5EAF0] bg-[#F4F5F7]/80 py-12 sm:py-16 lg:py-20"
    >
      <div className="site-container">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-[#E5EAF0] pb-6 sm:flex-row sm:items-end sm:pb-8">
          <div className="max-w-2xl">
            <span className="type-caption inline-flex items-center gap-1.5 rounded-md bg-[#FFF1E7] px-2.5 py-1 font-bold uppercase tracking-wider text-[#F36B21] border border-[#F36B21]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F36B21]" />
              Video Tutorials
            </span>
            <h2
              id="video-guides-heading"
              className="type-h2 mt-2 tracking-tight text-[#142B45] "
            >
              Latest Video Guides
            </h2>
            <p className="type-body-small mt-2 leading-relaxed text-[#667085] ">
              Visual walkthroughs explaining IRCTC updates, Tatkal timings, and common passenger ticketing scenarios.
            </p>
          </div>

          {channelUrl && (
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="type-button group inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#F36B21] px-4 py-2.5 font-bold text-white shadow-xs hover:bg-[#F36B21] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F36B21]"
            >
              <span>Subscribe on YouTube</span>
              <ExternalLink
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </a>
          )}
        </div>

        {/* Video Cards Grid */}
        {videos.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6">
            {videos.map((video) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5EAF0] bg-white shadow-2xs transition-all duration-200 motion-reduce:transition-none hover:-translate-y-1 hover:border-[#F36B21]/50 hover:shadow-[0_14px_30px_-6px_rgba(20,43,69,0.08),0_4px_12px_-2px_rgba(243,107,33,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F36B21]"
              >
                <div>
                  {/* 16:9 Video Thumbnail with Play Button */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#142B45]">
                    {video.thumbnail && (
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    )}
                    {/* Play Badge with restrained glowing ring */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#F36B21] shadow-xl ring-4 ring-white/40 transition-all duration-200 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(243,107,33,0.55)] group-hover:ring-[#F36B21]/40">
                        <Play aria-hidden="true" className="h-5 w-5 fill-current ml-0.5" />
                      </span>
                    </div>

                    <span className="type-caption absolute bottom-2.5 right-2.5 rounded bg-black/80 px-2 py-0.5 font-bold text-white backdrop-blur-xs">
                      Video Walkthrough
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="type-card-title  text-[#142B45] group-hover:text-[#F36B21] transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    {video.publishedAt && (
                      <p className="type-body-small mt-2 font-medium text-[#667085]">
                        {video.publishedAt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="type-caption border-t border-[#E5EAF0] bg-[#F4F5F7]/30 px-5 py-3.5 flex items-center justify-between font-bold text-[#F36B21]">
                  <span>Watch on YouTube</span>
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#E5EAF0] bg-white p-8 text-center sm:p-12 shadow-2xs">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1E7] text-[#F36B21] border border-[#F36B21]/20">
              <CirclePlay aria-hidden="true" className="h-7 w-7" />
            </span>
            <h3 className="type-card-title mt-4 text-[#142B45]">
              Explore RailAgents on YouTube
            </h3>
            <p className="type-body-small mx-auto mt-2 max-w-md text-[#667085]">
              Subscribe to our YouTube channel for weekly video tutorials on IRCTC updates, Tatkal strategies, and agent operations.
            </p>
            {channelUrl && (
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="type-button mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F36B21] px-5 py-2.5 font-bold text-white shadow-sm hover:bg-[#F36B21] transition-colors"
              >
                <span>Visit YouTube Channel</span>
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
