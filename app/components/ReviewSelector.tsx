"use client";

import { Review } from "@/app/lib/types";

interface ReviewSelectorProps {
  reviews: Review[];
  selectedReviewId: string | null;
  onSelectReview: (reviewId: string) => void;
}

export function ReviewSelector({
  reviews,
  selectedReviewId,
  onSelectReview,
}: ReviewSelectorProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-300";
      case "negative":
        return "bg-red-100 text-red-800 border-red-300";
      case "neutral":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRatingStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Select a Review
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review) => {
          const isSelected = selectedReviewId === review.id;
          return (
            <button
              key={review.id}
              onClick={() => onSelectReview(review.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded border ${getSentimentColor(
                    review.sentiment
                  )}`}
                >
                  {review.sentiment}
                </span>
                <span className="text-yellow-500 text-sm">
                  {getRatingStars(review.rating)}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">
                {review.text}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

