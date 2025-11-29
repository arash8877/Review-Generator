"use client";

import { useState } from "react";
import { Review, StatusFilter, ProductModelFilter, Filters } from "@/app/lib/types";

interface ReviewSelectorProps {
  reviews: Review[];
  selectedReviewId: string | null;
  onSelectReview: (reviewId: string) => void;
  onReorderReviews?: (reviews: Review[]) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

interface FiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

interface ReviewItemProps {
  review: Review;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragStart?: (e: React.DragEvent, reviewId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
  isDragging?: boolean;
}

function FiltersPanel({ filters, onFiltersChange, searchTerm, onSearchChange }: FiltersProps) {
  const resetFilters = () => {
    onFiltersChange({
      status: "all",
      productModel: "all",
    });
    onSearchChange("");
  };

  return (
    <div className="glass rounded-xl p-3 border border-cyan-400/20 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">Filters</p>
        <button
          type="button"
          onClick={resetFilters}
          className="text-[11px] text-cyan-200 hover:text-cyan-50 underline underline-offset-2"
        >
          Reset
        </button>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="status-filter"
          className="text-[10px] font-medium text-cyan-200/80 uppercase tracking-wide block"
        >
          Status & Sentiment
        </label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as StatusFilter })}
          className="w-full px-3 py-2 text-sm border border-cyan-400/30 rounded-md bg-white/5 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
        >
          <option value="all">All Reviews</option>
          <option value="answered">Answered</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="product-filter"
          className="text-[10px] font-medium text-cyan-200/80 uppercase tracking-wide block"
        >
          Product Model
        </label>
        <select
          id="product-filter"
          value={filters.productModel}
          onChange={(e) =>
            onFiltersChange({ ...filters, productModel: e.target.value as ProductModelFilter })
          }
          className="w-full px-3 py-2 text-sm border border-cyan-400/30 rounded-md bg-white/5 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
        >
          <option value="all">All Models</option>
          <option value="model-1">TV-Model 1</option>
          <option value="model-2">TV-Model 2</option>
          <option value="model-3">TV-Model 3</option>
          <option value="model-4">TV-Model 4</option>
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="search-reviews"
          className="text-[10px] font-medium text-cyan-200/80 uppercase tracking-wide block"
        >
          Search
        </label>
        <input
          id="search-reviews"
          type="search"
          value={searchTerm}
          placeholder="Find by customer, product,..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-cyan-400/30 rounded-md bg-white/5 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm placeholder:text-cyan-100/60"
        />
      </div>
    </div>
  );
}

function ReviewItem({
  review,
  isSelected,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: ReviewItemProps) {
  const getRatingStars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, review.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, review.id)}
      className={`group relative rounded-xl border p-4 text-left transition-all duration-300 ${
        isDragging
          ? "opacity-50 scale-95"
          : isSelected
          ? "glass-strong border-cyan-400/50 neon-glow-cyan-strong"
          : "glass border-white/10 hover:border-cyan-400/30 hover:neon-glow-cyan"
      }`}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex flex-col gap-1 p-1 rounded hover:bg-white/10 transition-colors">
          <div className="w-3 h-0.5 bg-cyan-400/60 rounded-full"></div>
          <div className="w-3 h-0.5 bg-cyan-400/60 rounded-full"></div>
          <div className="w-3 h-0.5 bg-cyan-400/60 rounded-full"></div>
        </div>
      </div>

      <button type="button" onClick={() => onSelect(review.id)} className="w-full text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-cyan-100">{review.customerName}</span>
          <span className="text-yellow-400 text-xs">{getRatingStars(review.rating)}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {review.answered && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded border bg-cyan-500/20 text-cyan-300 border-cyan-400/30 neon-border-cyan">
                Replied
              </span>
            )}
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded border bg-purple-500/20 text-purple-300 border-purple-400/30 neon-border-magenta">
            {review.productModel}
          </span>
        </div>
        <p className="text-sm text-cyan-100/80 line-clamp-2">{review.text}</p>
      </button>

      {/* Drop indicator */}
      <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-cyan-400 opacity-0 transition-opacity duration-200 pointer-events-none drop-indicator"></div>
    </div>
  );
}

export function ReviewSelector({
  reviews,
  selectedReviewId,
  onSelectReview,
  onReorderReviews,
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange,
}: ReviewSelectorProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, reviewId: string) => {
    setDraggedId(reviewId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", reviewId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (reviewId: string) => {
    setDragOverId(reviewId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedReviewId = e.dataTransfer.getData("text/plain");

    if (draggedReviewId && draggedReviewId !== targetId && onReorderReviews) {
      const draggedIndex = reviews.findIndex((r) => r.id === draggedReviewId);
      const targetIndex = reviews.findIndex((r) => r.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newReviews = [...reviews];
        const [draggedReview] = newReviews.splice(draggedIndex, 1);
        newReviews.splice(targetIndex, 0, draggedReview);
        onReorderReviews(newReviews);
      }
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-cyan-200">Reviews</h2>
        <p className="text-xs text-cyan-300/70 uppercase tracking-wide">{reviews.length} items</p>
      </div>

      {onReorderReviews && (
        <div className="glass rounded-lg p-3 border border-cyan-400/20">
          <p className="text-xs text-cyan-100/80 flex items-center gap-2">
            <span className="text-cyan-400">💡</span>
            Drag reviews to reorder by priority
          </p>
        </div>
      )}

      <FiltersPanel
        filters={filters}
        onFiltersChange={onFiltersChange}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 custom-scroll stagger-children">
        {reviews.length === 0 && (
          <div className="glass rounded-xl border border-dashed border-cyan-400/30 p-4 text-center text-cyan-100/70 animate-fade-in-up">
            No reviews match the current filters. Try resetting or searching differently.
          </div>
        )}

        {reviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            isSelected={selectedReviewId === review.id}
            onSelect={onSelectReview}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={draggedId === review.id}
          />
        ))}
      </div>
    </div>
  );
}
