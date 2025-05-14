import { storage } from "../storage";

/**
 * Get all reviews for a product
 */
export async function getReviewsForProduct(productId: number) {
  try {
    const reviews = await storage.getProductReviews(productId);
    return reviews;
  } catch (error) {
    console.error(`Error getting reviews for product ${productId}:`, error);
    throw new Error("Failed to get product reviews");
  }
}

/**
 * Get all video reviews for a product 
 */
export async function getVideoReviewForProduct(productId: number) {
  try {
    const videoReview = await storage.getProductVideoReview(productId);
    return videoReview || null;
  } catch (error) {
    console.error(`Error getting video review for product ${productId}:`, error);
    throw new Error("Failed to get product video review");
  }
}
