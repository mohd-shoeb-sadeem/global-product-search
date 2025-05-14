import { db } from '../db';
import { 
  videoReviews, 
  type VideoReview, 
  type InsertVideoReview 
} from '../../shared/schema';
import { eq, desc, and, or, gte } from 'drizzle-orm';

/**
 * Video Service
 * 
 * Handles fetching and sorting video content
 * based on engagement metrics, quality, and platform reach
 */
export class VideoService {
  // Video platform reach scores (in millions of monthly active users)
  private platformReachScores: Record<string, number> = {
    'youtube': 2300,      // ~2.3 billion active users
    'tiktok': 1000,       // ~1 billion active users
    'instagram': 1200,    // ~1.2 billion active users (reels)
    'facebook': 2900,     // ~2.9 billion active users
    'vimeo': 260,         // ~260 million active users
    'twitch': 140,        // ~140 million active users
    'dailymotion': 300,   // ~300 million active users
  };

  /**
   * Calculate video impact score
   * This combines engagement, quality, and platform reach
   */
  private calculateVideoImpactScore(video: VideoReview): number {
    // Base engagement metrics
    const viewWeight = 1;
    const likeWeight = 10;
    const commentWeight = 30;
    const shareWeight = 50;
    const subscriberWeight = 0.01; // For channel subscribers
    
    // Get view count or default to 0
    const viewCount = video.viewCount ?? 0;
    
    // Calculate base engagement score
    // We estimate likes/comments if not provided based on typical ratios
    const likes = video.likeCount ?? Math.floor(viewCount * 0.03); // ~3% like ratio default
    const comments = video.commentCount ?? Math.floor(viewCount * 0.002); // ~0.2% comment ratio default
    const shares = video.shareCount ?? Math.floor(viewCount * 0.005); // ~0.5% share ratio default
    const subscribers = video.channelSubscriberCount ?? 0;
    
    let score = 
      viewCount * viewWeight +
      likes * likeWeight +
      comments * commentWeight +
      shares * shareWeight +
      subscribers * subscriberWeight;
    
    // Apply duration quality factor
    // Videos between 5-15 minutes get highest score, shorter/longer slightly less
    const duration = video.duration ?? 0;
    if (duration > 0) {
      const durationInMinutes = duration / 60; // Convert seconds to minutes
      let durationFactor = 1;
      
      if (durationInMinutes < 3) {
        durationFactor = 0.8 + (durationInMinutes / 15); // 0.8 to 1.0 for 0-3 minutes
      } else if (durationInMinutes > 15) {
        durationFactor = 1 - Math.min(0.3, (durationInMinutes - 15) / 60); // Gradually decrease to 0.7 for very long videos
      }
      
      score *= durationFactor;
    }
    
    // Apply platform reach multiplier
    const platformMultiplier = this.getPlatformReachMultiplier(video.platform);
    score *= platformMultiplier;
    
    // Apply content quality factor (if available)
    const videoQuality = video.videoQuality ?? 0;
    if (videoQuality > 0) {
      // Scale from 0.7 (low quality) to 1.3 (high quality)
      const qualityFactor = 0.7 + (videoQuality / 5) * 0.6; 
      score *= qualityFactor;
    }
    
    // Apply recency factor
    if (video.publishedAt) {
      const now = new Date();
      const publishDate = new Date(video.publishedAt);
      const ageInDays = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Recency factor - videos get 100% score if published in last 7 days,
      // gradually decreasing to 60% after 90 days
      const recencyFactor = Math.max(0.6, 1 - (ageInDays / 90) * 0.4);
      score *= recencyFactor;
    }
    
    return score;
  }
  
  /**
   * Get platform reach multiplier based on audience size
   */
  private getPlatformReachMultiplier(platform: string): number {
    // Get the reach score for the given platform (default to 100 if not found)
    const reachScore = this.platformReachScores[platform.toLowerCase()] || 100;
    
    // Normalize to a multiplier between 0.7 and 1.3
    // This ensures that even smaller platforms can have impactful content
    // while still giving a boost to platforms with larger reach
    const minReach = 100;  // Minimum reach score (for normalization)
    const maxReach = 3000; // Maximum reach score (for normalization)
    
    // Calculate multiplier (0.7 to 1.3 range)
    const multiplier = 0.7 + (Math.min(reachScore, maxReach) - minReach) / (maxReach - minReach) * 0.6;
    
    return multiplier;
  }

  /**
   * Get video reviews for a product, sorted by impact score
   */
  public async getProductVideoReviews(productId: number, limit = 5): Promise<{
    videos: VideoReview[];
    totalViews: number;
    topPlatforms: { platform: string; count: number }[];
  }> {
    // Get all video reviews for the product
    const videos = await db
      .select()
      .from(videoReviews)
      .where(eq(videoReviews.productId, productId));
    
    // Calculate impact score for each video
    const videosWithScore = videos.map(video => ({
      video,
      impactScore: this.calculateVideoImpactScore(video)
    }));
    
    // Sort videos by impact score (highest first)
    videosWithScore.sort((a, b) => b.impactScore - a.impactScore);
    
    // Get top videos based on limit
    const topVideos = videosWithScore.slice(0, limit).map(v => v.video);
    
    // Calculate total views and top platforms
    const platformCounts: Record<string, number> = {};
    let totalViews = 0;
    
    videos.forEach(video => {
      // Count occurrences of each platform
      platformCounts[video.platform] = (platformCounts[video.platform] || 0) + 1;
      
      // Sum up views
      totalViews += video.viewCount || 0;
    });
    
    // Sort platforms by count
    const topPlatforms = Object.entries(platformCounts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);
    
    return {
      videos: topVideos,
      totalViews,
      topPlatforms: topPlatforms.slice(0, 3) // Top 3 platforms
    };
  }
  
  /**
   * Get the most impactful single video review for a product
   */
  public async getMostImpactfulVideoReview(productId: number): Promise<VideoReview | undefined> {
    // Get all video reviews for the product
    const videos = await db
      .select()
      .from(videoReviews)
      .where(eq(videoReviews.productId, productId));
    
    if (videos.length === 0) {
      return undefined;
    }
    
    // Calculate impact score for each video
    const videosWithScore = videos.map(video => ({
      video,
      impactScore: this.calculateVideoImpactScore(video)
    }));
    
    // Sort videos by impact score (highest first)
    videosWithScore.sort((a, b) => b.impactScore - a.impactScore);
    
    // Return the most impactful video
    return videosWithScore[0].video;
  }
  
  /**
   * Add a new video review
   */
  public async addVideoReview(video: InsertVideoReview): Promise<VideoReview> {
    const [newVideo] = await db
      .insert(videoReviews)
      .values(video)
      .returning();
    
    return newVideo;
  }
  
  /**
   * Update video engagement metrics
   */
  public async updateVideoEngagement(videoId: number, engagement: {
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    shareCount?: number;
    channelSubscriberCount?: number;
    videoQuality?: number;
  }): Promise<VideoReview | undefined> {
    const [video] = await db
      .select()
      .from(videoReviews)
      .where(eq(videoReviews.id, videoId));
    
    if (!video) {
      return undefined;
    }
    
    // Create updates object with only the properties that need to be updated
    const updates: any = { updatedAt: new Date() };
    
    if (engagement.viewCount !== undefined) {
      updates.viewCount = engagement.viewCount;
    }
    
    if (engagement.likeCount !== undefined) {
      updates.likeCount = engagement.likeCount;
    }
    
    if (engagement.commentCount !== undefined) {
      updates.commentCount = engagement.commentCount;
    }
    
    if (engagement.shareCount !== undefined) {
      updates.shareCount = engagement.shareCount;
    }
    
    if (engagement.channelSubscriberCount !== undefined) {
      updates.channelSubscriberCount = engagement.channelSubscriberCount;
    }
    
    if (engagement.videoQuality !== undefined) {
      updates.videoQuality = engagement.videoQuality;
    }
    
    // Update engagement metrics
    const [updatedVideo] = await db
      .update(videoReviews)
      .set(updates)
      .where(eq(videoReviews.id, videoId))
      .returning();
    
    return updatedVideo;
  }
  
  /**
   * Get trending video reviews across all products
   */
  public async getTrendingVideoReviews(limit = 10): Promise<VideoReview[]> {
    // Get all videos - we'll filter in memory
    const videos = await db
      .select()
      .from(videoReviews);
    
    // Filter for videos with at least 1000 views from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentVideos = videos.filter(video => {
      // Check for minimum views
      const viewCount = video.viewCount ?? 0;
      if (viewCount < 1000) return false;
      
      // Check for recency
      if (!video.publishedAt) return true; // Include videos with no publish date
      
      const publishDate = new Date(video.publishedAt);
      return publishDate >= thirtyDaysAgo;
    });
    
    // Calculate impact score for each video
    const videosWithScore = recentVideos.map(video => ({
      video,
      impactScore: this.calculateVideoImpactScore(video)
    }));
    
    // Sort videos by impact score (highest first)
    videosWithScore.sort((a, b) => b.impactScore - a.impactScore);
    
    // Get top trending videos
    return videosWithScore.slice(0, limit).map(v => v.video);
  }
}