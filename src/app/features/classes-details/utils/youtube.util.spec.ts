import { describe, expect, it } from 'vitest';
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  getYouTubeVideoId,
} from './youtube.util';

describe('YouTube Utility', () => {
  const shortUrl = 'https://youtu.be/5jDEulwWs04';
  const shortUrlWithParams = 'https://youtu.be/ncpMkhXAykg?si=a_b3ot2rsThtz4DE';
  const watchUrl = 'https://www.youtube.com/watch?v=5jDEulwWs04';
  const embedUrl = 'https://www.youtube.com/embed/5jDEulwWs04';

  describe('getYouTubeVideoId', () => {
    it('should extract ID from short youtu.be URL', () => {
      expect(getYouTubeVideoId(shortUrl)).toBe('5jDEulwWs04');
    });

    it('should extract ID from short youtu.be URL with query params', () => {
      expect(getYouTubeVideoId(shortUrlWithParams)).toBe('ncpMkhXAykg');
    });

    it('should extract ID from standard watch URL', () => {
      expect(getYouTubeVideoId(watchUrl)).toBe('5jDEulwWs04');
    });

    it('should extract ID from embed URL', () => {
      expect(getYouTubeVideoId(embedUrl)).toBe('5jDEulwWs04');
    });

    it('should return null for invalid or empty URL', () => {
      expect(getYouTubeVideoId(null)).toBeNull();
      expect(getYouTubeVideoId(undefined)).toBeNull();
      expect(getYouTubeVideoId('')).toBeNull();
      expect(getYouTubeVideoId('https://example.com/video')).toBeNull();
    });
  });

  describe('getYouTubeThumbnail', () => {
    it('should return YouTube hqdefault thumbnail URL when valid video ID present', () => {
      expect(getYouTubeThumbnail(shortUrl)).toBe(
        'https://img.youtube.com/vi/5jDEulwWs04/hqdefault.jpg',
      );
    });

    it('should return fallback image when URL is null or invalid', () => {
      expect(getYouTubeThumbnail(null)).toBe('/images/workouts-1.webp');
      expect(getYouTubeThumbnail('invalid', '/custom/fallback.png')).toBe('/custom/fallback.png');
    });
  });

  describe('getYouTubeEmbedUrl', () => {
    it('should return embed URL with autoplay enabled', () => {
      expect(getYouTubeEmbedUrl(shortUrl)).toBe(
        'https://www.youtube.com/embed/5jDEulwWs04?autoplay=1',
      );
    });

    it('should return null for invalid or null URL', () => {
      expect(getYouTubeEmbedUrl(null)).toBeNull();
      expect(getYouTubeEmbedUrl('')).toBeNull();
    });
  });
});
