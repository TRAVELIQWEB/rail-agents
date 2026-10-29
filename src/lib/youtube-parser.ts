/**
 * Video & Social Media URL Parser for RailAgents Blog
 * Supports:
 * - YouTube (watch, youtu.be, shorts, embed, raw 11-char ID)
 * - Instagram (reel, reels, p, tv)
 * - Facebook (watch, reel, videos, share/v, share/r)
 */

export type SocialVideoPlatform = "youtube" | "instagram" | "facebook";

export interface ParsedSocialVideo {
  platform: SocialVideoPlatform;
  id: string;
  embedUrl: string;
  watchUrl: string;
  thumbnailUrl: string | null;
  fallbackThumbnailUrl: string | null;
  isVertical: boolean;
  label: string;
}

export function extractYouTubeId(urlOrId?: string | null): string | null {
  if (!urlOrId) return null;
  const raw = urlOrId.trim();
  if (!raw) return null;

  // 1. Matches /shorts/ID
  const shortsMatch = raw.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // 2. Standard watch, youtu.be, embed, v
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = raw.match(regExp);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  // 3. Raw 11-character alphanumeric string without slashes
  if (raw.length === 11 && !raw.includes("/") && !raw.includes("?") && !raw.includes(".")) {
    return raw;
  }

  return null;
}

export function parseSocialVideoUrl(urlOrId?: string | null): ParsedSocialVideo | null {
  if (!urlOrId) return null;
  const raw = urlOrId.trim();
  if (!raw) return null;

  // ── 1. YOUTUBE ──
  const ytId = extractYouTubeId(raw);
  if (ytId) {
    const isShort = raw.includes("/shorts/");
    return {
      platform: "youtube",
      id: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1`,
      watchUrl: isShort ? `https://www.youtube.com/shorts/${ytId}` : `https://www.youtube.com/watch?v=${ytId}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
      fallbackThumbnailUrl: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      isVertical: isShort,
      label: isShort ? "YouTube Short" : "YouTube Video",
    };
  }

  // ── 2. INSTAGRAM (Reels / Posts / TV) ──
  const igMatch = raw.match(/(?:instagram\.com|instagr\.am)\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    const shortcode = igMatch[1];
    const isReel = /\/(reel|reels)\//i.test(raw);
    return {
      platform: "instagram",
      id: shortcode,
      embedUrl: `https://www.instagram.com/${isReel ? "reel" : "p"}/${shortcode}/embed`,
      watchUrl: `https://www.instagram.com/${isReel ? "reel" : "p"}/${shortcode}/`,
      thumbnailUrl: null,
      fallbackThumbnailUrl: null,
      isVertical: true,
      label: isReel ? "Instagram Reel" : "Instagram Video",
    };
  }

  // ── 3. FACEBOOK (Reels / Watch / Videos) ──
  if (/facebook\.com|fb\.watch/i.test(raw)) {
    const cleanUrl = raw.split("&")[0];
    const isReel = /\/reel\/|\/share\/r\//i.test(raw);
    const fbIdMatch = raw.match(/(?:videos\/|reel\/|v=|fb\.watch\/|share\/[vr]\/)([A-Za-z0-9_-]+)/i);
    const id = fbIdMatch?.[1] || "fb-video";
    return {
      platform: "facebook",
      id,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&width=560`,
      watchUrl: cleanUrl,
      thumbnailUrl: null,
      fallbackThumbnailUrl: null,
      isVertical: isReel,
      label: isReel ? "Facebook Reel" : "Facebook Video",
    };
  }

  return null;
}
