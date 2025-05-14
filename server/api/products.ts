import { storage } from "../storage";

/**
 * Get a product by ID
 */
export async function getProduct(id: number) {
  try {
    const product = await storage.getProduct(id);
    
    if (!product) {
      return null;
    }
    
    return product;
  } catch (error) {
    console.error(`Error getting product ${id}:`, error);
    throw new Error("Failed to get product");
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit = 8) {
  try {
    const featuredProducts = await storage.getFeaturedProducts(limit);
    return featuredProducts;
  } catch (error) {
    console.error("Error getting featured products:", error);
    throw new Error("Failed to get featured products");
  }
}

/**
 * Get similar products for a given product ID
 */
export async function getSimilarProducts(productId: number, limit = 5) {
  try {
    const similarProducts = await storage.getSimilarProducts(productId, limit);
    return similarProducts;
  } catch (error) {
    console.error(`Error getting similar products for ${productId}:`, error);
    throw new Error("Failed to get similar products");
  }
}

/**
 * Get product retailers for a given product ID
 */
export async function getProductRetailers(productId: number) {
  try {
    const retailers = await storage.getProductRetailers(productId);
    return retailers;
  } catch (error) {
    console.error(`Error getting retailers for product ${productId}:`, error);
    throw new Error("Failed to get product retailers");
  }
}

/**
 * Get product reviews for a given product ID
 */
export async function getProductReviews(productId: number) {
  try {
    const reviews = await storage.getProductReviews(productId);
    return reviews;
  } catch (error) {
    console.error(`Error getting reviews for product ${productId}:`, error);
    throw new Error("Failed to get product reviews");
  }
}

/**
 * Get a video review for a given product ID
 */
export async function getProductVideoReview(productId: number) {
  try {
    const videoReview = await storage.getProductVideoReview(productId);
    return videoReview || null;
  } catch (error) {
    console.error(`Error getting video review for product ${productId}:`, error);
    throw new Error("Failed to get product video review");
  }
}
