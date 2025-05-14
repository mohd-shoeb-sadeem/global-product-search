import React, { useState } from "react";
import ReviewCard from "@/components/reviews/ReviewCard";
import { CardHover } from "@/components/ui/card-hover";
import { type Review } from "@shared/schema";

interface WrittenReviewsProps {
  reviews: Review[];
  limit?: number;
  onSeeAllReviews?: () => void;
  onReadMore?: (url: string) => void;
}

const WrittenReviews: React.FC<WrittenReviewsProps> = ({ 
  reviews, 
  limit = 3, 
  onSeeAllReviews,
  onReadMore 
}) => {
  const displayedReviews = reviews.slice(0, limit);
  const hasMoreReviews = reviews.length > limit;

  return (
    <CardHover>
      <h3 className="text-lg font-semibold p-4 border-b border-gray-light">Expert Reviews</h3>
      
      <div className="divide-y divide-gray-light">
        {displayedReviews.length > 0 ? (
          displayedReviews.map((review, index) => (
            <ReviewCard key={index} review={review} onReadMore={onReadMore} />
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No expert reviews available yet</p>
          </div>
        )}
      </div>
      
      {hasMoreReviews && (
        <div className="p-4 bg-gray-50 border-t border-gray-light">
          <button 
            className="w-full text-primary hover:text-primary/80 font-medium"
            onClick={onSeeAllReviews}
          >
            View All {reviews.length} Expert Reviews
          </button>
        </div>
      )}
    </CardHover>
  );
};

export default WrittenReviews;
