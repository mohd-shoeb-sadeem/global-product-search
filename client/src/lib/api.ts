import { apiRequest } from "@/lib/queryClient";
import { 
  type Product,
  type ProductRetailer, 
  type Review, 
  type VideoReview,
  type ProductSearch 
} from "@shared/schema";

export async function searchProducts(params: Partial<ProductSearch>) {
  const queryParams = new URLSearchParams();
  
  if (params.query) queryParams.set("query", params.query);
  if (params.category) queryParams.set("category", params.category);
  if (params.minPrice !== undefined) queryParams.set("minPrice", params.minPrice.toString());
  if (params.maxPrice !== undefined) queryParams.set("maxPrice", params.maxPrice.toString());
  if (params.rating !== undefined) queryParams.set("rating", params.rating.toString());
  if (params.brand) queryParams.set("brand", params.brand);
  if (params.inStock !== undefined) queryParams.set("inStock", params.inStock.toString());
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());
  
  const response = await apiRequest("GET", `/api/search?${queryParams.toString()}`);
  return response.json();
}

export async function getProduct(id: number): Promise<Product> {
  const response = await apiRequest("GET", `/api/products/${id}`);
  return response.json();
}

export async function getProductRetailers(productId: number): Promise<ProductRetailer[]> {
  const response = await apiRequest("GET", `/api/products/${productId}/retailers`);
  return response.json();
}

export async function getProductReviews(productId: number): Promise<Review[]> {
  const response = await apiRequest("GET", `/api/products/${productId}/reviews`);
  return response.json();
}

export async function getProductVideoReview(productId: number): Promise<VideoReview | null> {
  const response = await apiRequest("GET", `/api/products/${productId}/video-review`);
  return response.json();
}

export async function getSimilarProducts(productId: number): Promise<Product[]> {
  const response = await apiRequest("GET", `/api/products/${productId}/similar`);
  return response.json();
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const response = await apiRequest("GET", `/api/products/featured`);
  return response.json();
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  const response = await apiRequest("GET", `/api/search/suggestions?q=${encodeURIComponent(query)}`);
  return response.json();
}
