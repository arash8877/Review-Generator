"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ReviewSelector } from "./components/ReviewSelector";
import { ToneSelector } from "./components/ToneSelector";
import { ResponseViewer } from "./components/ResponseViewer";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { reviews } from "./lib/reviews";
import { Tone, Response, FilterType } from "./lib/types";
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

export default function Home() {
  const [reviewsState, setReviewsState] = useState(reviews);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<Response | null>(null);

  const mutation = useMutation({
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

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setSelectedTone(null);
    setGeneratedResponse(null);
    mutation.reset();
  };

  const handleGenerate = () => {
    if (!selectedReviewId || !selectedTone) {
      alert("Please select a review and tone first.");
      return;
    }

    mutation.mutate({
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
    mutation.mutate({
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
      toast.success("Response accepted successfully!");
    }
  };

  const selectedReview = reviewsState.find((review) => review.id === selectedReviewId);

  const filteredReviews = reviewsState.filter((review) => {
    if (filter === "all") return true;
    if (filter === "answered") return review.answered;
    if (filter === "positive") return review.sentiment === "positive";
    if (filter === "negative") return review.sentiment === "negative";
    if (filter === "neutral") return review.sentiment === "neutral";
    return true;
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
              filter={filter}
              onFilterChange={setFilter}
            />
          </section>

          {/* Workspace Panel */}
          <section className="bg-white rounded-lg shadow-md p-6 space-y-6">
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
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">
                          {selectedReview.customerName}
                        </span>
                        <span className="text-yellow-500 text-sm">
                          {"★".repeat(selectedReview.rating) +
                            "☆".repeat(5 - selectedReview.rating)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedReview.answered && (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 border border-blue-200">
                            Answered
                          </span>
                        )}
                        <span
                          className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                            selectedReview.sentiment === "positive"
                              ? "bg-green-100 text-green-700"
                              : selectedReview.sentiment === "negative"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {selectedReview.sentiment}
                        </span>
                        <span className="text-xs text-gray-500">#{selectedReview.id}</span>
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
                    disabled={!selectedTone || mutation.isPending}
                    className={`w-full md:w-48 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                      !selectedTone || mutation.isPending
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {mutation.isPending ? "Generating..." : "Generate Response"}
                  </button>
                </div>

                {mutation.isPending && (
                  <div className="border border-gray-200 rounded-lg">
                    <LoadingSpinner />
                  </div>
                )}

                {generatedResponse && !mutation.isPending && (
                  <ResponseViewer
                    response={generatedResponse}
                    onRegenerate={handleRegenerate}
                    onAccept={handleAccept}
                    isGenerating={mutation.isPending}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
