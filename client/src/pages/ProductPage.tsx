import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import DetailsTabs from "@/components/product/DetailsTabs";
import ReviewSection from "@/components/reviews/ReviewSection";
import SimilarProductCard from "@/components/product/SimilarProductCard";
import { 
  type Product, 
  type ProductRetailer, 
  type Review, 
  type VideoReview 
} from "@shared/schema";

const ProductPage: React.FC = () => {
  const [, params] = useRoute('/product/:id');
  const productId = params?.id ? parseInt(params.id, 10) : null;
  
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });

  const { data: retailers } = useQuery<ProductRetailer[]>({
    queryKey: ['/api/products/retailers', productId],
    enabled: !!productId,
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ['/api/products/reviews', productId],
    enabled: !!productId,
  });

  const { data: videoReview } = useQuery<VideoReview>({
    queryKey: ['/api/products/video-review', productId],
    enabled: !!productId,
  });

  const { data: similarProducts } = useQuery<Product[]>({
    queryKey: ['/api/products/similar', productId],
    enabled: !!productId,
  });

  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (videoReview) {
      const url = 
        videoReview.platform.toLowerCase() === 'youtube' 
          ? `https://www.youtube.com/watch?v=${videoReview.videoId}`
          : videoReview.url;
      setVideoUrl(url);
    }
  }, [videoReview]);

  const handleCompare = (productId: number) => {
    // Would implement comparison functionality
    console.log(`Compare with product: ${productId}`);
  };

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row -mx-4">
              <div className="md:w-1/2 px-4 mb-6 md:mb-0">
                <Skeleton className="w-full h-96 rounded-lg" />
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="w-full h-16" />
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 px-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-10 w-1/3 mb-6" />
                <Skeleton className="h-6 w-24 mb-2" />
                <div className="flex space-x-2 mb-6">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="w-8 h-8 rounded-full" />
                  ))}
                </div>
                <Skeleton className="h-6 w-24 mb-2" />
                <div className="flex flex-wrap gap-2 mb-6">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-20" />
                  ))}
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p>We couldn't find the product you're looking for.</p>
        </div>
      </div>
    );
  }

  const productImages = product.images.map((src, index) => ({
    src,
    alt: `${product.name} image ${index + 1}`
  }));

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Product Details */}
      <section className="mb-12">
        <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row -mx-4">
              <ProductGallery images={productImages} />
              <ProductInfo product={product} retailers={retailers} />
            </div>
          </div>
          
          <DetailsTabs product={product} videoUrl={videoUrl} />
        </Card>
      </section>

      {/* Reviews Section */}
      {reviews && (
        <ReviewSection 
          reviews={reviews} 
          videoReview={videoReview}
          onSeeAllReviews={() => {
            // Would implement "see all reviews" functionality
            console.log("See all reviews");
          }}
          onReadMoreReview={(url) => {
            window.open(url, "_blank");
          }}
          onWatchFullReview={(url) => {
            window.open(url, "_blank");
          }}
        />
      )}

      {/* Similar Products Section */}
      {similarProducts && similarProducts.length > 0 && (
        <section>
          <div className="flex flex-wrap -mx-4">
            <div className="w-full px-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Similar Products</h2>
                  <p className="text-gray-mid">You might also be interested in these alternatives</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="p-2 rounded-full border border-gray-light hover:bg-gray-50"
                    id="prev-similar"
                    onClick={() => {
                      // Would implement scroll functionality
                      const container = document.getElementById('similar-products-container');
                      if (container) {
                        container.scrollBy({ left: -280, behavior: 'smooth' });
                      }
                    }}
                  >
                    <i className="ri-arrow-left-s-line text-xl"></i>
                  </button>
                  <button 
                    className="p-2 rounded-full border border-gray-light hover:bg-gray-50"
                    id="next-similar"
                    onClick={() => {
                      // Would implement scroll functionality
                      const container = document.getElementById('similar-products-container');
                      if (container) {
                        container.scrollBy({ left: 280, behavior: 'smooth' });
                      }
                    }}
                  >
                    <i className="ri-arrow-right-s-line text-xl"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div 
              className="flex overflow-x-auto pb-4 hide-scrollbar" 
              id="similar-products-container"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {similarProducts.map((product) => (
                <SimilarProductCard 
                  key={product.id} 
                  product={product} 
                  onCompare={handleCompare}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
