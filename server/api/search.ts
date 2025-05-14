import { storage } from "../storage";
import { type ProductSearch } from "@shared/schema";

/**
 * Search for products based on the given parameters
 */
export async function searchProducts(params: ProductSearch) {
  try {
    const results = await storage.searchProducts(params);
    return results;
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error("Failed to search products");
  }
}

/**
 * Get search suggestions based on a query string
 */
export async function getSearchSuggestions(query: string) {
  try {
    // Return empty array for very short queries
    if (!query || query.length < 2) {
      return [];
    }
    
    const suggestions = await storage.getSearchSuggestions(query);
    return suggestions;
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return [];
  }
}
