import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ProductCard from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type Product, type ProductSearch } from "@shared/schema";

const SearchResults: React.FC = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || undefined;
  
  const [filters, setFilters] = useState<Partial<ProductSearch>>({
    query,
    category: categoryParam,
    minPrice: undefined,
    maxPrice: undefined,
    rating: undefined,
    brand: undefined,
    inStock: undefined,
    page: 1,
    limit: 20,
  });

  // Update filters when URL params change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      query,
      category: categoryParam,
      page: 1, // Reset to first page on new search
    }));
  }, [query, categoryParam]);

  const { data, isLoading, error } = useQuery<{
    products: Product[],
    total: number,
    brands: string[],
    priceRange: { min: number, max: number }
  }>({
    queryKey: ['/api/search', filters],
  });

  const products = data?.products || [];
  const totalProducts = data?.total || 0;
  const brands = data?.brands || [];
  const priceRange = data?.priceRange || { min: 0, max: 1000 };
  
  const [priceValues, setPriceValues] = useState<[number, number]>([
    filters.minPrice || priceRange.min,
    filters.maxPrice || priceRange.max
  ]);

  // Update price values when price range is loaded
  useEffect(() => {
    setPriceValues([
      filters.minPrice || priceRange.min,
      filters.maxPrice || priceRange.max
    ]);
  }, [priceRange, filters.minPrice, filters.maxPrice]);

  const handlePriceChange = (values: number[]) => {
    setPriceValues(values as [number, number]);
  };

  const applyPriceFilter = () => {
    setFilters(prev => ({
      ...prev,
      minPrice: priceValues[0],
      maxPrice: priceValues[1],
      page: 1, // Reset to first page on filter change
    }));
  };

  const handleFilterChange = <K extends keyof ProductSearch>(
    key: K, 
    value: ProductSearch[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Category</h3>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="home_kitchen">Home & Kitchen</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="toys">Toys & Games</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Price Range</h3>
                <div className="space-y-4">
                  <Slider
                    min={priceRange.min}
                    max={priceRange.max}
                    step={10}
                    value={priceValues}
                    onValueChange={handlePriceChange}
                    onValueCommit={applyPriceFilter}
                  />
                  <div className="flex justify-between">
                    <span>${priceValues[0]}</span>
                    <span>${priceValues[1]}</span>
                  </div>
                </div>
              </div>
              
              {/* Brand Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Brand</h3>
                <Select 
                  value={filters.brand} 
                  onValueChange={(value) => handleFilterChange('brand', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Brands</SelectItem>
                    {brands.map((brand, index) => (
                      <SelectItem key={index} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Minimum Rating</h3>
                <Select 
                  value={filters.rating?.toString()} 
                  onValueChange={(value) => handleFilterChange('rating', value ? Number(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Rating</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Availability Filter */}
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="in-stock" 
                    checked={filters.inStock === true}
                    onCheckedChange={(checked) => 
                      handleFilterChange('inStock', checked === true ? true : undefined)
                    }
                  />
                  <Label htmlFor="in-stock">In Stock Only</Label>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                className="w-full mt-4 border border-primary text-primary hover:bg-primary/5 py-2 rounded-lg"
                onClick={() => setFilters({ query, page: 1, limit: 20 })}
              >
                Clear All Filters
              </button>
            </CardContent>
          </Card>
        </div>
        
        {/* Search Results */}
        <div className="lg:w-3/4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {query ? `Search results for "${query}"` : "All Products"}
            </h1>
            {!isLoading && (
              <p className="text-gray-mid">
                {totalProducts} {totalProducts === 1 ? "product" : "products"} found
              </p>
            )}
          </div>
          
          {/* Sort and Pagination Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <span className="mr-2">Sort by:</span>
              <Select 
                defaultValue="relevance"
                onValueChange={(value) => {
                  // Would implement sorting functionality
                  console.log(`Sort by: ${value}`);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <button
                className="p-2 rounded-full border border-gray-light hover:bg-gray-50 disabled:opacity-50"
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
              >
                <i className="ri-arrow-left-s-line text-xl"></i>
              </button>
              <span className="mx-2">
                Page {filters.page} of {Math.ceil(totalProducts / (filters.limit || 20))}
              </span>
              <button
                className="p-2 rounded-full border border-gray-light hover:bg-gray-50 disabled:opacity-50"
                disabled={(filters.page || 1) >= Math.ceil(totalProducts / (filters.limit || 20))}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
              >
                <i className="ri-arrow-right-s-line text-xl"></i>
              </button>
            </div>
          </div>
          
          {/* Results Grid */}
          <div className="flex flex-wrap -mx-4">
            {isLoading && (
              Array(8).fill(0).map((_, index) => (
                <div key={index} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-4 mb-8">
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
                  Error loading search results. Please try again later.
                </div>
              </div>
            )}

            {!isLoading && products.length === 0 && (
              <div className="w-full px-4">
                <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center">
                  <div className="text-5xl mb-4">🔍</div>
                  <h2 className="text-xl font-semibold mb-2">No products found</h2>
                  <p>Try adjusting your search or filter criteria to find what you're looking for.</p>
                </div>
              </div>
            )}

            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {/* Pagination (Bottom) */}
          {totalProducts > 0 && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center">
                <button
                  className="p-2 rounded-full border border-gray-light hover:bg-gray-50 disabled:opacity-50"
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                >
                  <i className="ri-arrow-left-s-line text-xl"></i>
                </button>
                <span className="mx-2">
                  Page {filters.page} of {Math.ceil(totalProducts / (filters.limit || 20))}
                </span>
                <button
                  className="p-2 rounded-full border border-gray-light hover:bg-gray-50 disabled:opacity-50"
                  disabled={(filters.page || 1) >= Math.ceil(totalProducts / (filters.limit || 20))}
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                >
                  <i className="ri-arrow-right-s-line text-xl"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
