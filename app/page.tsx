"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ReviewSelector } from "./components/ReviewSelector";
import { ToneSelector } from "./components/ToneSelector";
import { ResponseViewer } from "./components/ResponseViewer";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { SummaryViewer } from "./components/SummaryViewer";
import { StatsOverview } from "./components/StatsOverview";
import { ResponseChecklist } from "./components/ResponseChecklist";
import { reviews } from "./lib/reviews";
import { Tone, Response, Filters, SummaryResponse, ProductModelFilter } from "./lib/types";
import { toast } from "sonner";
import { Review } from "./lib/types";

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

export default function Home() {
  const [reviewsState, setReviewsState] = useState(reviews);
  const [filters, setFilters] = useState<Filters>({ status: "all", productModel: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<Response | null>(null);
  
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
          onClick: () => responseMutation.mutate({
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
      // Track which product this summary was generated for
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
    // Switch to response tab when a review is selected
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
      toast.success("Response accepted and saved!", {
        description: "The review has been marked as responded",
        action: {
          label: "View Summary",
          onClick: () => setActiveTab("summary"),
        },
        duration: 5000,
      });
    }
  };

  const selectedReview = useMemo(
    () => reviewsState.find((review) => review.id === selectedReviewId) || null,
    [reviewsState, selectedReviewId]
  );
  const recommendedTone = useMemo(() => {
    if (!selectedReview) return null;

    if (selectedReview.sentiment === "negative") {
      return { tone: "Apologetic" as Tone, reason: "Customer sentiment is negative" };
    }
    if (selectedReview.rating >= 4) {
      return { tone: "Friendly" as Tone, reason: "High rating suggests a warm thank you" };
    }
    return { tone: "Neutral/Professional" as Tone, reason: "Balanced or mixed feedback" };
  }, [selectedReview]);

  const { totalReviews, answeredCount, pendingCount, negativeCount, answerRate } = useMemo(() => {
    const total = reviewsState.length;
    const answered = reviewsState.filter((review) => review.answered).length;
    const pending = total - answered;
    const negatives = reviewsState.filter((review) => review.sentiment === "negative").length;
    const rate = total === 0 ? 0 : Math.round((answered / total) * 100);
    return {
      totalReviews: total,
      answeredCount: answered,
      pendingCount: pending,
      negativeCount: negatives,
      answerRate: rate,
    };
  }, [reviewsState]);

  useEffect(() => {
    if (selectedReview) {
      setSelectedTone(recommendedTone?.tone ?? null);
    } else {
      setSelectedTone(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReview?.id, recommendedTone?.tone]);

  const filteredReviews = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return reviewsState.filter((review) => {
      let statusMatch = true;
      if (filters.status === "answered") statusMatch = review.answered === true;
      else if (filters.status === "positive") statusMatch = review.sentiment === "positive";
      else if (filters.status === "negative") statusMatch = review.sentiment === "negative";
      else if (filters.status === "neutral") statusMatch = review.sentiment === "neutral";
      
      let productMatch = true;
      if (filters.productModel === "model-1") productMatch = review.productModel === "TV-Model 1";
      else if (filters.productModel === "model-2") productMatch = review.productModel === "TV-Model 2";
      else if (filters.productModel === "model-3") productMatch = review.productModel === "TV-Model 3";
      else if (filters.productModel === "model-4") productMatch = review.productModel === "TV-Model 4";
      
      const searchMatch =
        normalizedSearch.length === 0 ||
        review.customerName.toLowerCase().includes(normalizedSearch) ||
        review.productModel.toLowerCase().includes(normalizedSearch) ||
        review.text.toLowerCase().includes(normalizedSearch);
      
      return statusMatch && productMatch && searchMatch;
    });
  }, [filters.productModel, filters.status, reviewsState, searchTerm]);

  return (
    <main className="min-h-screen bg-dark-gradient py-8 px-4 sm:px-5 lg:px-6">
      <div className="max-w-8xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="neon-text-cyan">Review Response</span>{" "}
            <span className="neon-text-magenta">Generator</span>
          </h1>
          <p className="text-lg text-cyan-100/80">AI-powered responses to customer reviews</p>
        </div>

        <StatsOverview
          totalReviews={totalReviews}
          pendingCount={pendingCount}
          answeredCount={answeredCount}
          negativeCount={negativeCount}
          answerRate={answerRate}
        />

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          {/* Review Selection Panel */}
          <section className="glass-card rounded-2xl p-4 lg:p-6 h-fit animate-fade-in-glass">
            <ReviewSelector
              reviews={filteredReviews}
              selectedReviewId={selectedReviewId}
              onSelectReview={handleSelectReview}
              onReorderReviews={handleReorderReviews}
              filters={filters}
              onFiltersChange={setFilters}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </section>

          {/* Workspace Panel */}
          <section className="glass-card rounded-2xl overflow-hidden min-h-[600px] animate-fade-in-glass">
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-white/5 animate-slide-in-right">
              <button
                onClick={() => setActiveTab("response")}
                className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-all duration-500 ease-out transform hover:scale-105 ${
                  activeTab === "response"
                    ? "border-cyan-400 text-cyan-300 neon-glow-cyan shadow-lg"
                    : "border-transparent text-cyan-100/60 hover:text-cyan-300 hover:border-cyan-400/50 hover:shadow-md"
                }`}
              >
                Review Response
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-all duration-500 ease-out transform hover:scale-105 ${
                  activeTab === "summary"
                    ? "border-pink-400 text-pink-300 neon-glow-magenta shadow-lg"
                    : "border-transparent text-cyan-100/60 hover:text-pink-300 hover:border-pink-400/50 hover:shadow-md"
                }`}
              >
                Summary & Insights
              </button>
            </div>

            <div className="p-6">
              {activeTab === "response" && (
                <ResponseChecklist
                  hasSelectedReview={!!selectedReview}
                  hasTone={!!selectedTone}
                  hasGeneratedResponse={!!generatedResponse}
                />
              )}

              {activeTab === "response" ? (
                <div className="space-y-6">
                  {!selectedReview && (
                    <div className="flex flex-col items-center justify-center text-center text-cyan-100/60 min-h-[300px] space-y-3">
                      <p className="text-xl font-semibold text-cyan-200">Pick a review to get started</p>
                      <p className="max-w-md text-cyan-100/70">
                        Choose any review from the list to view its details, select a tone, and generate
                        an AI-assisted draft response.
                      </p>
                    </div>
                  )}

                  {selectedReview && (
                    <>
                      <div className="space-y-3">
                        <p className="text-base font-bold text-cyan-300 uppercase tracking-wide">
                          Selected review
                        </p>
                        <div className="glass rounded-xl border p-6 space-y-2 hover:shadow-xl transition-all duration-300 hover:border-cyan-400/50">
                          <div className="space-y-2 mb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-cyan-100">
                                  {selectedReview.customerName}
                                </span>
                                <span className="text-yellow-400 text-sm">
                                  {"★".repeat(selectedReview.rating) + "☆".repeat(5 - selectedReview.rating)}
                                </span>
                              </div>
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border">
                                {selectedReview.productModel}
                              </span>
                            </div>
                            <div>
                              {selectedReview.answered && (
                                <span className="px-2 py-1 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border">
                                  Replied
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-cyan-50 leading-relaxed text-base">
                            {selectedReview.text}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr,auto] items-end">
                        <ToneSelector
                          selectedTone={selectedTone}
                          onSelectTone={setSelectedTone}
                          disabled={!selectedReview}
                          recommendedTone={recommendedTone?.tone || null}
                          recommendationReason={recommendedTone?.reason}
                        />
                        <button
                          onClick={handleGenerate}
                          disabled={!selectedTone || responseMutation.isPending}
                          className={`w-full md:w-auto btn-primary focus-neon-glow transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                            !selectedTone || responseMutation.isPending ? "opacity-70 cursor-not-allowed hover:scale-100" : "hover:shadow-2xl"
                          }`}
                        >
                          {responseMutation.isPending ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Generating...
                            </span>
                          ) : (
                            "Generate Response"
                          )}
                        </button>
                      </div>

                      {responseMutation.isPending && (
                        <LoadingSpinner />
                      )}

                      {generatedResponse && !responseMutation.isPending && (
                        <ResponseViewer
                          response={generatedResponse}
                          review={selectedReview}
                          onRegenerate={handleRegenerate}
                          onAccept={handleAccept}
                          isGenerating={responseMutation.isPending}
                        />
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
                    // Determine product model based on selected product in Summary tab
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
