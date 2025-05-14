import React from "react";
import VideoReview from "@/components/reviews/VideoReview";
import WrittenReviews from "@/components/reviews/WrittenReviews";
import { type Review, type VideoReview as VideoReviewType } from "@shared/schema";

interface ReviewSectionProps {
  reviews: Review[];
  videoReview?: VideoReviewType;
  onSeeAllReviews?: () => void;
  onReadMoreReview?: (url: string) => void;
  onWatchFullReview?: (url: string) => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ 
  reviews,
  videoReview,
  onSeeAllReviews,
  onReadMoreReview,
  onWatchFullReview
}) => {
  return (
    <section className="mb-12">
      <div className="flex flex-wrap -mx-4">
        <div className="w-full px-4 mb-6">
          <h2 className="text-2xl font-bold">Reviews from around the web</h2>
          <p className="text-gray-mid">Aggregated from various sources to help you make an informed decision</p>
        </div>

        <div className="w-full md:w-1/2 px-4 mb-6">
          {videoReview ? (
            <VideoReview 
              videoReview={videoReview} 
              onWatchFullReview={onWatchFullReview}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-gray-400 mb-3">
                  <i className="ri-video-line text-5xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">No Video Reviews Yet</h3>
                <p className="text-gray-mid">
                  We're searching for video reviews of this product. Check back soon!
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 px-4 mb-6">
          <WrittenReviews 
            reviews={reviews} 
            onSeeAllReviews={onSeeAllReviews}
            onReadMore={onReadMoreReview}
          />
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
