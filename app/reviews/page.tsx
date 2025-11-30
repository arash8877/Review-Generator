"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ReviewSelector } from "../components/ReviewSelector";
import { ToneSelector } from "../components/ToneSelector";
import { ResponseViewer } from "../components/ResponseViewer";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SummaryViewer } from "../components/SummaryViewer";
import { StatsOverview } from "../components/StatsOverview";
import { ResponseChecklist } from "../components/ResponseChecklist";
import { reviews } from "../lib/reviews";
import { Tone, Response, Filters, SummaryResponse, ProductModelFilter, Review } from "../lib/types";
import { toast } from "sonner";

async function generateResponse(
  reviewId: string,
  tone: Tone,
  options?: { requestId?: string; previousResponse?: string }
): Promise<Response> {
  const response = await fetch("/api/generate-response", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reviewId,
      tone,
      requestId: options?.requestId,
      previousResponse: options?.previousResponse,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate response");
  }

  return response.json();
}

async function generateSummary(productModel?: string): Promise<SummaryResponse> {
  const response = await fetch("/api/generate-summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productModel }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate summary");
  }

  return response.json();
}

export default function ReviewsPage() {
  const [reviewsState, setReviewsState] = useState(reviews);
  const [filters, setFilters] = useState<Filters>({ status: "all", productModel: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<Response | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const responseSectionRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<"response" | "summary">("response");
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [selectedSummaryProduct, setSelectedSummaryProduct] = useState<ProductModelFilter>("all");
  const [generatedForProduct, setGeneratedForProduct] = useState<ProductModelFilter | null>(null);
  const handleSummaryProductChange = (product: ProductModelFilter) => {
    setSelectedSummaryProduct(product);
    setSummaryData(null);
    setGeneratedForProduct(null);
  };

  const handleReorderReviews = (reorderedReviews: Review[]) => {
    setReviewsState(reorderedReviews);
    toast.success("Reviews reordered", {
      description: "Priority order has been updated",
      duration: 2000,
    });
  };

  const responseMutation = useMutation({
    mutationFn: ({
      reviewId,
      tone,
      requestId,
      previousResponse,
    }: {
      reviewId: string;
      tone: Tone;
      requestId?: string;
      previousResponse?: string;
    }) => generateResponse(reviewId, tone, { requestId, previousResponse }),
    onSuccess: (data) => {
      setGeneratedResponse(data);
    },
    onError: (error) => {
      console.error("Error generating response:", error);
      toast.error("Failed to generate response", {
        description: "Please check your connection and try again",
        action: {
          label: "Retry",
          onClick: () =>
            responseMutation.mutate({
              reviewId: selectedReviewId!,
              tone: selectedTone!,
              requestId: crypto.randomUUID(),
              previousResponse: undefined,
            }),
        },
        duration: 6000,
      });
    },
  });

  const summaryMutation = useMutation({
    mutationFn: (productModel?: string) => generateSummary(productModel),
    onSuccess: (data) => {
      setSummaryData(data);
      setGeneratedForProduct(selectedSummaryProduct);
    },
    onError: (error) => {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary. Please try again.");
    },
  });

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setSelectedTone(null);
    setGeneratedResponse(null);
    responseMutation.reset();
    setActiveTab("response");
  };

  const handleGenerate = () => {
    if (!selectedReviewId || !selectedTone) {
      toast.error("Select a review and tone", {
        description: !selectedReviewId
          ? "Choose a customer review from the list to get started"
          : "Pick a response tone (Friendly, Apologetic, etc.)",
        duration: 4000,
      });
      return;
    }

    responseMutation.mutate({
      reviewId: selectedReviewId,
      tone: selectedTone,
      requestId: crypto.randomUUID(),
      previousResponse: undefined,
    });
  };

  const handleRegenerate = () => {
    if (!selectedReviewId || !selectedTone) {
      return;
    }
    responseMutation.mutate({
      reviewId: selectedReviewId,
      tone: selectedTone,
      requestId: crypto.randomUUID(),
      previousResponse: generatedResponse?.text,
    });
  };

  const scrollMainToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToResponse = () => {
    if (responseSectionRef.current) {
      responseSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  const handleAccept = () => {
    if (selectedReviewId) {
      setReviewsState((prev) =>
        prev.map((review) =>
          review.id === selectedReviewId ? { ...review, answered: true } : review
        )
      );
      setSelectedReviewId(null);
      setSelectedTone(null);
      setGeneratedResponse(null);
      scrollMainToTop();
      toast.success("Response accepted and saved!", {
        description: "Marked as answered and ready to send",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (selectedReviewId) {
      setSelectedTone("Friendly");
    } else {
      setSelectedTone(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReviewId]);

  useEffect(() => {
    if (generatedResponse && !responseMutation.isPending) {
      scrollToResponse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedResponse, responseMutation.isPending]);

  const { totalReviews, answeredCount, pendingCount, negativeCount, answerRate } = useMemo(() => {
    const total = reviewsState.length;
    const answered = reviewsState.filter((review) => review.answered).length;
    const pending = total - answered;
    const negatives = reviewsState.filter((review) => review.rating <= 3).length;
    const rate = total === 0 ? 0 : Math.round((answered / total) * 100);
    return {
      totalReviews: total,
      answeredCount: answered,
      pendingCount: pending,
      negativeCount: negatives,
      answerRate: rate,
    };
  }, [reviewsState]);

  const recommendedTone = useMemo(() => {
    if (!selectedReviewId) return null;
    const review = reviewsState.find((r) => r.id === selectedReviewId);
    if (!review) return null;

    if (review.rating <= 3) {
      return { tone: "Apologetic" as Tone, reason: "Low rating calls for an apologetic tone" };
    }
    if (review.rating === 5) {
      return { tone: "Friendly" as Tone, reason: "Positive review deserves warmth" };
    }
    return { tone: "Neutral/Professional" as Tone, reason: "Balanced response fits best" };
  }, [reviewsState, selectedReviewId]);

  const filteredReviews = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return reviewsState.filter((review) => {
      const statusMatch =
        filters.status === "all" ||
        (filters.status === "answered" && review.answered) ||
        (filters.status === "positive" && review.rating >= 4) ||
        (filters.status === "negative" && review.rating <= 3) ||
        (filters.status === "neutral" && review.rating === 3);
      const productMatch =
        filters.productModel === "all" ||
        (filters.productModel === "model-1" && review.productModel === "TV-Model 1") ||
        (filters.productModel === "model-2" && review.productModel === "TV-Model 2") ||
        (filters.productModel === "model-3" && review.productModel === "TV-Model 3") ||
        (filters.productModel === "model-4" && review.productModel === "TV-Model 4");
      const searchMatch =
        normalizedSearch.length === 0 ||
        review.customerName.toLowerCase().includes(normalizedSearch) ||
        review.productModel.toLowerCase().includes(normalizedSearch) ||
        review.text.toLowerCase().includes(normalizedSearch);
      return statusMatch && productMatch && searchMatch;
    });
  }, [filters.productModel, filters.status, reviewsState, searchTerm]);

  return (
    <main ref={mainRef} className="min-h-screen bg-dark-gradient py-8 px-4 sm:px-5 lg:px-6">
      <div className="max-w-8xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="neon-text-cyan">Review Response</span>{" "}
            <span className="neon-text-magenta">Assistant</span>
          </h1>
          <p className="text-lg text-cyan-100/80">Generate empathetic, on-brand replies to customer reviews</p>
        </div>

        <StatsOverview
          totalReviews={totalReviews}
          answeredCount={answeredCount}
          pendingCount={pendingCount}
          negativeCount={negativeCount}
          answerRate={answerRate}
        />

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <section className="glass-card rounded-2xl p-4 lg:p-6 h-fit animate-fade-in-glass">
            <ReviewSelector
              reviews={filteredReviews}
              selectedReviewId={selectedReviewId}
              onSelectReview={handleSelectReview}
              filters={filters}
              onFiltersChange={setFilters}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onReorder={handleReorderReviews}
            />
          </section>

          <section className="glass-card rounded-2xl overflow-hidden min-h-[620px] animate-fade-in-glass">
            <div className="flex border-b border-white/10 bg-white/5">
              <button
                onClick={() => setActiveTab("response")}
                className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-all duration-300 ${
                  activeTab === "response"
                    ? "border-cyan-400 text-cyan-300 neon-glow-cyan"
                    : "border-transparent text-cyan-100/60 hover:text-cyan-300 hover:border-cyan-400/50"
                }`}
              >
                Response
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-all duration-300 ${
                  activeTab === "summary"
                    ? "border-pink-400 text-pink-300 neon-glow-magenta"
                    : "border-transparent text-cyan-100/60 hover:text-pink-300 hover:border-pink-400/50"
                }`}
              >
                Summary & Insights
              </button>
            </div>

            <div className="p-6">
              {activeTab === "response" && (
                <ResponseChecklist
                  hasSelectedReview={!!selectedReviewId}
                  hasTone={!!selectedTone}
                  hasGeneratedResponse={!!generatedResponse}
                />
              )}

              {activeTab === "response" ? (
                <div className="space-y-6">
                  {!selectedReviewId && (
                    <div className="flex flex-col items-center justify-center text-center text-cyan-100/60 min-h-[300px] space-y-3">
                      <p className="text-xl font-semibold text-cyan-200">
                        Select a review to get started
                      </p>
                      <p className="max-w-md text-cyan-100/70">
                        Choose any customer review from the left to view details, select tone, and
                        let AI craft a tailored response.
                      </p>
                    </div>
                  )}

                  {selectedReviewId && (
                    <>
                      <div className="grid gap-4 md:grid-cols-[1fr,auto] items-end">
                        <ToneSelector
                          selectedTone={selectedTone}
                          onSelectTone={setSelectedTone}
                          disabled={!selectedReviewId}
                          recommendedTone={recommendedTone?.tone || null}
                          recommendationReason={recommendedTone?.reason}
                        />
                        <button
                          onClick={handleGenerate}
                          disabled={!selectedTone || responseMutation.isPending}
                          className={`w-full md:w-auto btn-primary focus-neon-glow ${
                            !selectedTone || responseMutation.isPending
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {responseMutation.isPending ? "Generating..." : "Generate Response"}
                        </button>
                      </div>

                      {responseMutation.isPending && (
                        <div className="border border-gray-200 rounded-lg">
                          <LoadingSpinner />
                        </div>
                      )}

                      {generatedResponse && !responseMutation.isPending && (
                        <div ref={responseSectionRef}>
                          <ResponseViewer
                            response={generatedResponse}
                            review={reviewsState.find((r) => r.id === selectedReviewId)}
                            onRegenerate={handleRegenerate}
                            onAccept={handleAccept}
                            isGenerating={responseMutation.isPending}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <SummaryViewer
                  data={summaryData}
                  isLoading={summaryMutation.isPending}
                  selectedProduct={selectedSummaryProduct}
                  onProductChange={handleSummaryProductChange}
                  generatedForProduct={generatedForProduct}
                  onGenerate={() => {
                    let productModel: string | undefined;
                    if (selectedSummaryProduct === "model-1") productModel = "TV-Model 1";
                    else if (selectedSummaryProduct === "model-2") productModel = "TV-Model 2";
                    else if (selectedSummaryProduct === "model-3") productModel = "TV-Model 3";
                    else if (selectedSummaryProduct === "model-4") productModel = "TV-Model 4";
                    summaryMutation.mutate(productModel);
                  }}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
