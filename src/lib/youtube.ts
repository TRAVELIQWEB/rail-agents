import "server-only";
import type { Video } from "@/types";
import { formatYouTubeDuration } from "@/lib/youtube-format";

type YouTubeThumbnails = {
  default?: { url?: string };
  medium?: { url?: string };
  high?: { url?: string };
  standard?: { url?: string };
  maxres?: { url?: string };
};

type YouTubePlaylistResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      publishedAt?: string;
      thumbnails?: YouTubeThumbnails;
      resourceId?: {
        videoId?: string;
      };
    };
  }>;
};

type YouTubeVideosResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      publishedAt?: string;
      thumbnails?: YouTubeThumbnails;
    };
    statistics?: { viewCount?: string };
    contentDetails?: { duration?: string };
  }>;
};

type YouTubeChannelResponse = {
  items?: Array<{
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

export async function getLatestVideos(
  limit = 3,
): Promise<Video[]> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
      return [];
    }

    // 1. Get uploads playlist ID
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
      {
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!channelResponse.ok) {
      console.error(
        "YouTube channel API error:",
        channelResponse.status,
        await channelResponse.text(),
      );

      return [];
    }

    const channelData =
      (await channelResponse.json()) as YouTubeChannelResponse;

    const uploadsPlaylistId =
      channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      console.error("YouTube uploads playlist not found");

      return [];
    }

    // 2. Get latest videos
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${limit}&key=${apiKey}`,
      {
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!playlistResponse.ok) {
      console.error(
        "YouTube playlist API error:",
        playlistResponse.status,
        await playlistResponse.text(),
      );

      return [];
    }

    const playlistData =
      (await playlistResponse.json()) as YouTubePlaylistResponse;

    const videoIds =
      playlistData.items
        ?.map((item) => {
          return item.snippet?.resourceId?.videoId;
        })
        .filter((videoId): videoId is string => Boolean(videoId)) ?? [];

    if (videoIds.length === 0) return [];

    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`,
      { next: { revalidate: 3600 } },
    );

    if (!videosResponse.ok) {
      console.error(
        "YouTube videos API error:",
        videosResponse.status,
        await videosResponse.text(),
      );
      return [];
    }

    const videosData = (await videosResponse.json()) as YouTubeVideosResponse;
    const videos = (videosData.items ?? [])
      .flatMap((item): Video[] => {
        const snippet = item.snippet;
        const publishedAt = snippet?.publishedAt;
        const duration = item.contentDetails?.duration;
        if (!snippet?.title || !publishedAt || !duration) return [];

        const thumbnails = snippet.thumbnails;
        const thumbnail =
          thumbnails?.maxres?.url ??
          thumbnails?.standard?.url ??
          thumbnails?.high?.url ??
          thumbnails?.medium?.url ??
          thumbnails?.default?.url ??
          `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;

        return [{
          id: item.id,
          title: snippet.title,
          thumbnail,
          publishedAt,
          views: Number(item.statistics?.viewCount ?? 0),
          duration: formatYouTubeDuration(duration),
          url: `https://www.youtube.com/watch?v=${item.id}`,
        }];
      })
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
      .slice(0, limit);

    return videos;
  } catch (error) {
    console.error("YouTube API error:", error);

    return [];
  }
}

export function getYouTubeChannelVideosUrl() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!channelId) return null;

  return `https://www.youtube.com/channel/${channelId}/videos`;
}
