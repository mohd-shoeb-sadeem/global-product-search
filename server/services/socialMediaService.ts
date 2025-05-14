import { db } from '../db';
import { 
  socialMediaPosts, 
  type SocialMediaPost, 
  type InsertSocialMediaPost 
} from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';

/**
 * Social Media Service
 * 
 * Handles fetching and sorting social media content
 * based on engagement metrics and platform reach
 */
export class SocialMediaService {
  // Platform reach scores - represents estimated audience reach (in millions)
  private platformReachScores: Record<string, number> = {
    'instagram': 1200, // ~1.2 billion active users
    'tiktok': 1000,    // ~1 billion active users
    'youtube': 2300,   // ~2.3 billion active users
    'facebook': 2900,  // ~2.9 billion active users
    'twitter': 350,    // ~350 million active users
    'pinterest': 450,  // ~450 million active users
    'reddit': 430,     // ~430 million active users
    'linkedin': 850,   // ~850 million active users
  };

  /**
   * Calculate engagement score for a social media post
   * This is a weighted calculation based on different types of engagement
   */
  private calculateEngagementScore(post: SocialMediaPost): number {
    // Weight factors for different engagement types
    const likeWeight = 1;
    const commentWeight = 3;
    const shareWeight = 5;
    const viewWeight = 0.1;
    const saveWeight = 2;
    
    // Calculate base engagement score with safe defaults
    const likes = post.likes ?? 0;
    const comments = post.comments ?? 0;
    const shares = post.shares ?? 0;
    const views = post.views ?? 0;
    const saves = post.saves ?? 0;
    
    let score = 
      likes * likeWeight +
      comments * commentWeight +
      shares * shareWeight +
      views * viewWeight +
      saves * saveWeight;
    
    // Apply platform multiplier based on reach
    const platformMultiplier = this.getPlatformReachMultiplier(post.platform);
    score = score * platformMultiplier;
    
    // Apply recency factor (more recent posts get a boost)
    if (post.postedAt) {
      const now = new Date();
      const postDate = new Date(post.postedAt);
      const ageInDays = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Recency factor - posts get 100% score if posted today, gradually decreasing to 50% after 30 days
      const recencyFactor = Math.max(0.5, 1 - (ageInDays / 30) * 0.5);
      score = score * recencyFactor;
    }
    
    return score;
  }
  
  /**
   * Get platform reach multiplier based on audience size
   */
  private getPlatformReachMultiplier(platform: string): number {
    // Get the reach score for the given platform (default to 100 if not found)
    const reachScore = this.platformReachScores[platform.toLowerCase()] || 100;
    
    // Normalize to a multiplier between 0.5 and 1.5
    // This ensures that even smaller platforms can have impactful content
    // while still giving a boost to platforms with larger reach
    const minReach = 100;  // Minimum reach score (for normalization)
    const maxReach = 3000; // Maximum reach score (for normalization)
    
    // Calculate multiplier (0.5 to 1.5 range)
    const multiplier = 0.5 + (Math.min(reachScore, maxReach) - minReach) / (maxReach - minReach);
    
    return multiplier;
  }

  /**
   * Get social media posts for a product, sorted by engagement
   */
  public async getProductSocialMediaPosts(productId: number, limit = 10): Promise<{
    posts: SocialMediaPost[];
    totalReach: number;
    topPlatforms: { platform: string; count: number }[];
  }> {
    // Get all social media posts for the product
    const posts = await db
      .select()
      .from(socialMediaPosts)
      .where(eq(socialMediaPosts.productId, productId));
    
    // Calculate engagement score for each post
    const postsWithScore = posts.map(post => ({
      post,
      engagementScore: this.calculateEngagementScore(post)
    }));
    
    // Sort posts by engagement score (highest first)
    postsWithScore.sort((a, b) => b.engagementScore - a.engagementScore);
    
    // Get top posts based on limit
    const topPosts = postsWithScore.slice(0, limit).map(p => p.post);
    
    // Calculate total reach and top platforms
    const platformCounts: Record<string, number> = {};
    let totalReach = 0;
    
    posts.forEach(post => {
      // Count occurrences of each platform
      platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1;
      
      // Calculate reach based on views or other metrics with safe defaults
      const views = post.views ?? 0;
      const likes = post.likes ?? 0;
      const postReach = views || (likes * 5); // Estimate reach if views not available
      totalReach += postReach;
    });
    
    // Sort platforms by count
    const topPlatforms = Object.entries(platformCounts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);
    
    return {
      posts: topPosts,
      totalReach,
      topPlatforms: topPlatforms.slice(0, 5) // Top 5 platforms
    };
  }
  
  /**
   * Add a new social media post
   */
  public async addSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost> {
    const [newPost] = await db
      .insert(socialMediaPosts)
      .values(post)
      .returning();
    
    return newPost;
  }
  
  /**
   * Update social media post engagement metrics
   */
  public async updatePostEngagement(postId: number, engagement: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    saves?: number;
  }): Promise<SocialMediaPost | undefined> {
    const [post] = await db
      .select()
      .from(socialMediaPosts)
      .where(eq(socialMediaPosts.id, postId));
    
    if (!post) {
      return undefined;
    }
    
    // Create updates object with only the properties that need to be updated
    const updates: any = { updatedAt: new Date() };
    
    if (engagement.likes !== undefined) {
      updates.likes = engagement.likes;
    }
    
    if (engagement.comments !== undefined) {
      updates.comments = engagement.comments;
    }
    
    if (engagement.shares !== undefined) {
      updates.shares = engagement.shares;
    }
    
    if (engagement.views !== undefined) {
      updates.views = engagement.views;
    }
    
    if (engagement.saves !== undefined) {
      updates.saves = engagement.saves;
    }
    
    // Update engagement metrics
    const updatedPost = await db
      .update(socialMediaPosts)
      .set(updates)
      .where(eq(socialMediaPosts.id, postId))
      .returning();
    
    return updatedPost[0];
  }
  
  /**
   * Get trending social media posts across all products
   */
  public async getTrendingSocialMediaPosts(limit = 10): Promise<SocialMediaPost[]> {
    // Get all posts - filtering by date will be done in memory
    const posts = await db
      .select()
      .from(socialMediaPosts);
    
    // Filter for recent posts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPosts = posts.filter(post => {
      const postDate = new Date(post.postedAt);
      return postDate >= thirtyDaysAgo;
    });
    
    // Calculate engagement score for each post
    const postsWithScore = recentPosts.map(post => ({
      post,
      engagementScore: this.calculateEngagementScore(post)
    }));
    
    // Sort posts by engagement score (highest first)
    postsWithScore.sort((a, b) => b.engagementScore - a.engagementScore);
    
    // Get top trending posts
    return postsWithScore.slice(0, limit).map(p => p.post);
  }
}