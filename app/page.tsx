"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ReviewSelector } from "./components/ReviewSelector";
import { ToneSelector } from "./components/ToneSelector";
import { ResponseViewer } from "./components/ResponseViewer";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { SummaryViewer } from "./components/SummaryViewer";
import { reviews } from "./lib/reviews";
import { Tone, Response, Filters, SummaryResponse, ProductModelFilter } from "./lib/types";
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

export default function Home() {
  const [reviewsState, setReviewsState] = useState(reviews);
  const [filters, setFilters] = useState<Filters>({ status: "all", productModel: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<Response | null>(null);
  
  // New state for tabs and summary
  const [activeTab, setActiveTab] = useState<"response" | "summary">("response");
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [selectedSummaryProduct, setSelectedSummaryProduct] = useState<ProductModelFilter>("all");
  const [generatedForProduct, setGeneratedForProduct] = useState<ProductModelFilter | null>(null);

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
      toast.error("Failed to generate response. Please try again.");
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
      toast.error("Pick a review and tone first.");
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
      toast.success("Response Generated Successfully", {
        duration: 3000,
      });
    }
  };

  const selectedReview = reviewsState.find((review) => review.id === selectedReviewId);

  const totalReviews = reviewsState.length;
  const answeredCount = reviewsState.filter((review) => review.answered).length;
  const pendingCount = totalReviews - answeredCount;
  const negativeCount = reviewsState.filter((review) => review.sentiment === "negative").length;
  const answerRate = totalReviews === 0 ? 0 : Math.round((answeredCount / totalReviews) * 100);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredReviews = reviewsState.filter((review) => {
    // Apply status/sentiment filter
    let statusMatch = true;
    if (filters.status === "answered") statusMatch = review.answered === true;
    else if (filters.status === "positive") statusMatch = review.sentiment === "positive";
    else if (filters.status === "negative") statusMatch = review.sentiment === "negative";
    else if (filters.status === "neutral") statusMatch = review.sentiment === "neutral";
    
    // Apply product model filter
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

        {/* Quick health overview */}
        <div className="grid gap-6 mb-6 lg:grid-cols-[320px,1fr] items-stretch">
          <div className="glass-card rounded-2xl p-4 border border-cyan-400/30 h-full">
            <p className="text-xs uppercase text-cyan-100/70 font-semibold">Pending responses</p>
            <p className="text-3xl font-bold text-cyan-200 mt-2">{pendingCount}</p>
            <p className="text-[11px] text-cyan-100/60">Reviews that still need action</p>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="glass-card rounded-2xl p-4 border border-emerald-400/30">
              <p className="text-xs uppercase text-emerald-100/70 font-semibold">Answer rate</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-3xl font-bold text-emerald-200">{answerRate}%</p>
                <span className="text-sm text-emerald-100/80">{answeredCount} answered</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${answerRate}%` }} />
              </div>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-pink-400/30">
              <p className="text-xs uppercase text-pink-100/70 font-semibold">Priority negatives</p>
              <p className="text-3xl font-bold text-pink-200 mt-2">{negativeCount}</p>
              <p className="text-[11px] text-pink-100/70">Flagged for quick follow-up</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-blue-400/30">
              <p className="text-xs uppercase text-blue-100/70 font-semibold">Total reviews</p>
              <p className="text-3xl font-bold text-blue-200 mt-2">{totalReviews}</p>
              <p className="text-[11px] text-blue-100/70">Across all products</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          {/* Review Selection Panel */}
          <section className="glass-card rounded-2xl p-4 lg:p-6 h-fit animate-fade-in-glass">
            <ReviewSelector
              reviews={filteredReviews}
              selectedReviewId={selectedReviewId}
              onSelectReview={handleSelectReview}
              filters={filters}
              onFiltersChange={setFilters}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </section>

          {/* Workspace Panel */}
          <section className="glass-card rounded-2xl overflow-hidden min-h-[600px] animate-fade-in-glass">
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-white/5">
              <button
                onClick={() => setActiveTab("response")}
                className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-all duration-300 ${
                  activeTab === "response"
                    ? "border-cyan-400 text-cyan-300 neon-glow-cyan"
                    : "border-transparent text-cyan-100/60 hover:text-cyan-300 hover:border-cyan-400/50"
                }`}
              >
                Review Response
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
                <div className="grid gap-3 sm:grid-cols-3 mb-6">
                  {[
                    {
                      title: "1. Select review",
                      description: "Pick a customer review to work on",
                      active: !!selectedReview,
                    },
                    {
                      title: "2. Choose tone",
                      description: "Match the tone to the situation",
                      active: !!selectedTone,
                    },
                    {
                      title: "3. Generate",
                      description: "Create, edit, and accept the reply",
                      active: !!generatedResponse,
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className={`rounded-xl border p-3 text-sm glass transition-all ${
                        item.active ? "border-cyan-400/50 neon-glow-cyan-strong" : "border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-cyan-200 text-xs font-bold">
                          {index + 1}
                        </span>
                        <p className="font-semibold text-cyan-50">{item.title}</p>
                      </div>
                      <p className="text-cyan-100/70 mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
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
                        <div className="glass rounded-xl border p-6 space-y-2">
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
                                  Answered
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-cyan-50 leading-relaxed text-base">{selectedReview.text}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr,auto] items-end">
                        <ToneSelector
                          selectedTone={selectedTone}
                          onSelectTone={setSelectedTone}
                          disabled={!selectedReview}
                        />
                        <button
                          onClick={handleGenerate}
                          disabled={!selectedTone || responseMutation.isPending}
                          className={`w-full md:w-auto btn-primary focus-neon-glow ${
                            !selectedTone || responseMutation.isPending ? "opacity-70 cursor-not-allowed" : ""
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
                        <ResponseViewer
                          response={generatedResponse}
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
                  onProductChange={setSelectedSummaryProduct}
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
