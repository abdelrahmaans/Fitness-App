/**
 * Extracts the 11-character YouTube video ID from various YouTube URL formats.
 * Supports:
 * - https://youtu.be/5jDEulwWs04
 * - https://youtu.be/ncpMkhXAykg?si=...
 * - https://www.youtube.com/watch?v=5jDEulwWs04
 * - https://www.youtube.com/embed/5jDEulwWs04
 */
export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

/**
 * Returns a high-quality thumbnail URL for a YouTube video, or a fallback image path.
 */
export function getYouTubeThumbnail(
  url: string | null | undefined,
  fallback = '/images/workouts-1.webp',
): string {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : fallback;
}

/**
 * Returns an embeddable YouTube URL with autoplay enabled.
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
}
