import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ProductSearch, type Product } from "@shared/schema";

interface SearchResults {
  products: Product[];
  total: number;
  brands: string[];
  priceRange: { min: number; max: number };
}

export function useProductSearch(initialFilters: Partial<ProductSearch> = {}) {
  const [filters, setFilters] = useState<Partial<ProductSearch>>({
    page: 1,
    limit: 20,
    ...initialFilters,
  });

  const searchQuery = useQuery<SearchResults>({
    queryKey: ['/api/search', filters],
  });

  // Update filters - merge with existing ones
  const updateFilters = (newFilters: Partial<ProductSearch>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1, // Reset to page 1 when filters change, unless page is explicitly set
    }));
  };

  // Reset all filters except query
  const resetFilters = (keepQuery = true) => {
    setFilters({
      query: keepQuery ? filters.query : undefined,
      page: 1,
      limit: filters.limit,
    });
  };

  // Set page number
  const setPage = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  // Go to next page
  const nextPage = () => {
    setFilters(prev => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  };

  // Go to previous page
  const prevPage = () => {
    setFilters(prev => ({
      ...prev,
      page: Math.max(1, (prev.page || 1) - 1),
    }));
  };

  // Calculate total pages
  const totalPages = Math.ceil(
    (searchQuery.data?.total || 0) / (filters.limit || 20)
  );

  // Check if there are more pages
  const hasNextPage = (filters.page || 1) < totalPages;
  const hasPreviousPage = (filters.page || 1) > 1;

  return {
    filters,
    updateFilters,
    resetFilters,
    setPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPreviousPage,
    totalPages,
    ...searchQuery,
  };
}
