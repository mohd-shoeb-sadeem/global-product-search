import React from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { type Product } from "@shared/schema";

const Home: React.FC = () => {
  const { data: featuredProducts, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products/featured'],
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <section className="mb-12">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full px-4 mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="text-gray-mid">Trending items based on your interests</p>
          </div>

          {isLoading && (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4 mb-8">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-12" />
                    </div>
                    <Skeleton className="h-6 w-24 mt-2" />
                    <Skeleton className="h-4 w-full mt-3" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </div>
                </div>
              </div>
            ))
          )}

          {error && (
            <div className="w-full px-4">
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                Error loading featured products. Please try again later.
              </div>
            </div>
          )}

          {featuredProducts && featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}

          {featuredProducts && featuredProducts.length === 0 && (
            <div className="w-full px-4">
              <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center">
                <p>No featured products available at the moment.</p>
                <p className="mt-2">Try searching for specific products using the search bar above.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
