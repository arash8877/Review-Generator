"use client";

import { useMemo, useState } from "react";
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
          Periority
        </label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as StatusFilter })}
          className="w-full px-3 py-2 text-sm border border-cyan-400/30 rounded-md bg-white/5 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
        >
          <option value="all">All Reviews</option>
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

function ReviewItem({ review, isSelected, onSelect }: ReviewItemProps) {
  const getRatingStars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <div
      className={`group relative rounded-xl border p-4 text-left transition-all duration-300 ${
        isSelected
          ? "glass-strong border-cyan-400/50 neon-glow-cyan-strong"
          : "glass border-white/10 hover:border-cyan-400/30 hover:neon-glow-cyan"
      }`}
    >
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
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange,
}: ReviewSelectorProps) {
  const [view, setView] = useState<"open" | "responded" | "all">("open");

  const respondedReviews = useMemo(
    () => reviews.filter((review) => review.answered),
    [reviews]
  );
  const openReviews = useMemo(
    () => reviews.filter((review) => !review.answered),
    [reviews]
  );

  const viewOptions: { key: "open" | "responded" | "all"; label: string }[] = [
    { key: "open", label: "Open" },
    { key: "responded", label: "Replied" },
    { key: "all", label: "All" },
  ];

  const activeList =
    view === "open" ? openReviews : view === "responded" ? respondedReviews : reviews;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-cyan-200">Reviews</h2>
      </div>

      <div className="glass rounded-xl p-3 border border-cyan-400/20 space-y-3">
        <p className="text-[10px] font-semibold text-cyan-300 uppercase tracking-wide px-1">
          View
        </p>
        <div className="grid grid-cols-3 gap-2">
          {viewOptions.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key as "open" | "responded" | "all")}
              className={`w-full rounded-lg px-3 py-2 border transition-all duration-200 flex items-center justify-center ${
                view === key
                  ? "glass-strong border-cyan-400/60 text-cyan-100 neon-glow-cyan-strong"
                  : "glass border-white/10 text-cyan-100/70 hover:border-cyan-400/40 hover:text-cyan-100"
              }`}
              aria-label={label}
            >
              <span className="text-sm font-semibold text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <FiltersPanel
        filters={filters}
        onFiltersChange={onFiltersChange}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      {view === "all" ? (
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1 custom-scroll stagger-children">
          <div className="space-y-3">
            {openReviews.length === 0 ? (
              <div className="glass rounded-xl border border-dashed border-cyan-400/30 p-4 text-center text-cyan-100/70 animate-fade-in-up">
                No open reviews match the current filters.
              </div>
            ) : (
              openReviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  isSelected={selectedReviewId === review.id}
                  onSelect={onSelectReview}
                />
              ))
            )}
          </div>

          <div className="space-y-3 pt-3 border-t border-white/10">
            {respondedReviews.length === 0 ? (
              <div className="glass rounded-xl border border-dashed border-cyan-400/20 p-4 text-center text-cyan-100/70 animate-fade-in-up">
                Replied reviews will move here automatically.
              </div>
            ) : (
              respondedReviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  isSelected={selectedReviewId === review.id}
                  onSelect={onSelectReview}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 custom-scroll stagger-children">
          {activeList.length === 0 ? (
            <div className="glass rounded-xl border border-dashed border-cyan-400/30 p-4 text-center text-cyan-100/70 animate-fade-in-up">
              {view === "responded"
                ? "No replied reviews match the current filters."
                : "No open reviews match the current filters."}
            </div>
          ) : (
            activeList.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                isSelected={selectedReviewId === review.id}
                onSelect={onSelectReview}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
