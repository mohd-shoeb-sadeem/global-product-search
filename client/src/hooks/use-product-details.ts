import { useQuery } from "@tanstack/react-query";
import { 
  type Product, 
  type ProductRetailer, 
  type Review, 
  type VideoReview 
} from "@shared/schema";

export function useProductDetails(productId: number | null) {
  const productQuery = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });

  const retailersQuery = useQuery<ProductRetailer[]>({
    queryKey: ['/api/products/retailers', productId],
    enabled: !!productId,
  });

  const reviewsQuery = useQuery<Review[]>({
    queryKey: ['/api/products/reviews', productId],
    enabled: !!productId,
  });

  const videoReviewQuery = useQuery<VideoReview>({
    queryKey: ['/api/products/video-review', productId],
    enabled: !!productId,
  });

  const similarProductsQuery = useQuery<Product[]>({
    queryKey: ['/api/products/similar', productId],
    enabled: !!productId,
  });

  return {
    product: productQuery.data,
    retailers: retailersQuery.data,
    reviews: reviewsQuery.data,
    videoReview: videoReviewQuery.data,
    similarProducts: similarProductsQuery.data,
    isLoading: productQuery.isLoading,
    isError: productQuery.isError,
    error: productQuery.error,
    retailersLoading: retailersQuery.isLoading,
    reviewsLoading: reviewsQuery.isLoading,
    videoReviewLoading: videoReviewQuery.isLoading,
    similarProductsLoading: similarProductsQuery.isLoading,
  };
}
