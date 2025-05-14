import React from "react";
import { StarRating } from "@/components/ui/star-rating";
import { type Review } from "@shared/schema";

interface ReviewCardProps {
  review: Review;
  onReadMore?: (url: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onReadMore }) => {
  return (
    <div className="p-4">
      <div className="flex items-center mb-3">
        {review.sourceLogo && (
          <img 
            src={review.sourceLogo} 
            alt={review.source} 
            className="w-8 h-8 mr-2"
          />
        )}
        <div>
          <h4 className="font-medium">{review.source}</h4>
          <div className="flex items-center">
            <StarRating rating={review.rating} maxRating={review.maxRating} size="sm" />
            <span className="ml-1 text-sm font-medium">{review.rating}/{review.maxRating}</span>
          </div>
        </div>
      </div>
      <p className="text-dark-light text-sm">
        {`"${review.content}"`}
      </p>
      {review.url && (
        <button 
          className="mt-2 text-primary text-sm hover:underline"
          onClick={() => onReadMore && onReadMore(review.url || '')}
        >
          Read Full Review
        </button>
      )}
    </div>
  );
};

export default ReviewCard;
