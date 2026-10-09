import Image from "next/image";
import { Eye, Play } from "lucide-react";
import type { Video } from "@/types";
import { formatYouTubeDate, formatYouTubeViews } from "@/lib/youtube-format";

type VideoCardProps = {
  video: Video;
};

export function VideoCard({ video }: VideoCardProps) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--primary-border)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-slate-100">
        <Image
          src={video.thumbnail}
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/15">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[var(--primary)] opacity-100 shadow transition-opacity sm:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
            <Play aria-hidden="true" className="ml-0.5 h-4 w-4 fill-current" />
          </span>
        </span>
        <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs font-semibold text-white">
          {video.duration}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 text-left lg:p-5">
        <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-snug text-[var(--navy)] group-hover:text-[var(--primary-dark)] md:text-[17px] xl:text-lg">
          {video.title}
        </h3>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-3 text-sm text-slate-500">
          <span className="min-w-0">{formatYouTubeDate(video.publishedAt)}</span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Eye className="h-4 w-4" />
            {formatYouTubeViews(video.views)}
          </span>
        </div>
      </div>
    </a>
  );
}
