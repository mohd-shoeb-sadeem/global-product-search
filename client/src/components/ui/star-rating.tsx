import React from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  className,
}: StarRatingProps) {
  const normalizedRating = Math.min(Math.max(0, rating), maxRating);
  const roundedRating = Math.round(normalizedRating * 2) / 2; // Round to nearest 0.5
  
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn("flex items-center text-amber-500", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const value = index + 1;
        
        if (value <= roundedRating) {
          // Full star
          return <i key={index} className={`ri-star-fill ${sizeClasses[size]}`}></i>;
        } else if (value - 0.5 === roundedRating) {
          // Half star
          return <i key={index} className={`ri-star-half-fill ${sizeClasses[size]}`}></i>;
        } else {
          // Empty star
          return <i key={index} className={`ri-star-line ${sizeClasses[size]}`}></i>;
        }
      })}
      
      {showValue && (
        <span className={`ml-1 text-gray-mid ${sizeClasses[size]}`}>
          {normalizedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
