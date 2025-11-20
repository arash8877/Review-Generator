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
      alert("Failed to generate response. Please try again.");
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
      alert("Please select a review and tone first.");
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
    
    return statusMatch && productMatch;
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Review Response Generator</h1>
          <p className="text-lg text-gray-600">AI-powered responses to customer reviews</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          {/* Review Selection Panel */}
          <section className="bg-white rounded-lg shadow-md p-4 lg:p-6 h-fit">
            <ReviewSelector
              reviews={filteredReviews}
              selectedReviewId={selectedReviewId}
              onSelectReview={handleSelectReview}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </section>

          {/* Workspace Panel */}
          <section className="bg-white rounded-lg shadow-md overflow-hidden min-h-[600px]">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("response")}
                className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                  activeTab === "response"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Review Response
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                  activeTab === "summary"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Summary & Insights
              </button>
            </div>

            <div className="p-6">
              {activeTab === "response" ? (
                <div className="space-y-6">
                  {!selectedReview && (
                    <div className="flex flex-col items-center justify-center text-center text-gray-500 min-h-[300px] space-y-3">
                      <p className="text-xl font-semibold text-gray-700">Pick a review to get started</p>
                      <p className="max-w-md">
                        Choose any review from the list to view its details, select a tone, and generate
                        an AI-assisted draft response.
                      </p>
                    </div>
                  )}

                  {selectedReview && (
                    <>
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          Selected review
                        </p>
                        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50 space-y-2">
                          <div className="space-y-2 mb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-900">
                                  {selectedReview.customerName}
                                </span>
                                <span className="text-yellow-500 text-sm">
                                  {"★".repeat(selectedReview.rating) +
                                    "☆".repeat(5 - selectedReview.rating)}
                                </span>
                              </div>
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800 border border-purple-200">
                                {selectedReview.productModel}
                              </span>
                            </div>
                            <div>
                              {selectedReview.answered && (
                                <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 border border-blue-200">
                                  Answered
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{selectedReview.text}</p>
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
                          className={`w-full md:w-48 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                            !selectedTone || responseMutation.isPending
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
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
                  data={summaryData!}
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
