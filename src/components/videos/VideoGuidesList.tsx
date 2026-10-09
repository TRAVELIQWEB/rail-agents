"use client";

import { useState } from "react";
import { VideoCard } from "@/components/ui/VideoCard";
import type { Video } from "@/types";

const VIDEOS_PER_PAGE = 6;

export function VideoGuidesList({ videos }: { videos: Video[] }) {
  const [visibleCount, setVisibleCount] = useState(VIDEOS_PER_PAGE);
  const visibleVideos = videos.slice(0, visibleCount);

  return (
    <>
      <p className="mb-4 text-center text-sm text-slate-600 sm:text-left" aria-live="polite">
        Showing {visibleVideos.length} of {videos.length} videos
      </p>
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3 xl:gap-6">
        {visibleVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      {visibleCount < videos.length || visibleCount > VIDEOS_PER_PAGE ? (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {visibleCount > VIDEOS_PER_PAGE ? (
            <button
              type="button"
              onClick={() =>
                setVisibleCount((current) =>
                  Math.max(VIDEOS_PER_PAGE, current - VIDEOS_PER_PAGE),
                )
              }
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#eadbce] bg-white px-6 py-2.5 text-sm font-[700] text-[var(--navy)] shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              Show Fewer Videos
            </button>
          ) : null}
          {visibleCount < videos.length ? (
          <button
            type="button"
            onClick={() =>
              setVisibleCount((current) =>
                Math.min(current + VIDEOS_PER_PAGE, videos.length),
              )
            }
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--primary)] px-6 py-2.5 text-sm font-[700] text-white shadow-[0_8px_20px_rgba(249,115,22,0.18)] transition-colors hover:bg-[#e85d04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Load More Videos
          </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
