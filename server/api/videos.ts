import { storage } from "../storage";
import { type VideoReview } from "@shared/schema";

/**
 * Get a video review for a product
 */
export async function getVideoReview(productId: number) {
  try {
    const videoReview = await storage.getProductVideoReview(productId);
    return videoReview || null;
  } catch (error) {
    console.error(`Error getting video review for product ${productId}:`, error);
    throw new Error("Failed to get video review");
  }
}

/**
 * Get the embed URL for a video based on platform and video ID
 */
export function getVideoEmbedUrl(platform: string, videoId: string): string {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}`;
    case 'tiktok':
      return `https://www.tiktok.com/embed/v2/${videoId}`;
    default:
      return '';
  }
}

/**
 * Extract video ID from a URL
 */
export function extractVideoId(platform: string, url: string): string | null {
  try {
    if (!url) return null;
    
    switch (platform.toLowerCase()) {
      case 'youtube': {
        // Extract YouTube video ID from URL
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
      }
      case 'vimeo': {
        // Extract Vimeo video ID from URL
        const regExp = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?))/;
        const match = url.match(regExp);
        return match ? match[3] : null;
      }
      case 'tiktok': {
        // Extract TikTok video ID from URL
        const regExp = /\/@[\w.-]+\/video\/(\d+)/;
        const match = url.match(regExp);
        return match ? match[1] : null;
      }
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error extracting video ID from URL: ${url}`, error);
    return null;
  }
}
