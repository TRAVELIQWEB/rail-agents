/**
 * Extracts a YouTube 11-character video ID from any valid YouTube URL or raw ID:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - Raw 11-char ID
 */
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
  if (raw.length === 11 && !raw.includes("/") && !raw.includes("?")) {
    return raw;
  }

  return null;
}
