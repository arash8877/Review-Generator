"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ReviewSelector } from "./components/ReviewSelector";
import { ToneSelector } from "./components/ToneSelector";
import { ResponseViewer } from "./components/ResponseViewer";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { reviews } from "./lib/reviews";
import { Tone, Response } from "./lib/types";

async function generateResponse(reviewId: string, tone: Tone): Promise<Response> {
  const response = await fetch("/api/generate-response", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reviewId, tone }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate response");
  }

  return response.json();
}

export default function Home() {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<Response | null>(
    null
  );

  const mutation = useMutation({
    mutationFn: ({ reviewId, tone }: { reviewId: string; tone: Tone }) =>
      generateResponse(reviewId, tone),
    onSuccess: (data) => {
      setGeneratedResponse(data);
    },
    onError: (error) => {
      console.error("Error generating response:", error);
      alert("Failed to generate response. Please try again.");
    },
  });

  const handleGenerate = () => {
    if (!selectedReviewId || !selectedTone) {
      alert("Please select a review and tone first.");
      return;
    }

    mutation.mutate({ reviewId: selectedReviewId, tone: selectedTone });
  };

  const handleRegenerate = () => {
    if (!selectedReviewId || !selectedTone) {
      return;
    }
    mutation.mutate({ reviewId: selectedReviewId, tone: selectedTone });
  };

  const handleAccept = () => {
    alert("Response accepted! (In a real app, this would save the response.)");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Review Response Generator
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered responses to customer reviews
          </p>
        </div>

        <div className="space-y-8">
          {/* Review Selection */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <ReviewSelector
              reviews={reviews}
              selectedReviewId={selectedReviewId}
              onSelectReview={setSelectedReviewId}
            />
          </section>

          {/* Tone Selection and Generate Button */}
          {selectedReviewId && (
            <section className="bg-white rounded-lg shadow-md p-6">
              <div className="max-w-md space-y-4">
                <ToneSelector
                  selectedTone={selectedTone}
                  onSelectTone={setSelectedTone}
                  disabled={!selectedReviewId}
                />
                <button
                  onClick={handleGenerate}
                  disabled={!selectedTone || mutation.isPending}
                  className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                    !selectedTone || mutation.isPending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {mutation.isPending ? "Generating..." : "Generate AI Response"}
                </button>
              </div>
            </section>
          )}

          {/* Loading State */}
          {mutation.isPending && (
            <section className="bg-white rounded-lg shadow-md p-6">
              <LoadingSpinner />
            </section>
          )}

          {/* Generated Response */}
          {mutation.isSuccess && generatedResponse && !mutation.isPending && (
            <section className="bg-white rounded-lg shadow-md p-6">
              <ResponseViewer
                response={generatedResponse}
                onRegenerate={handleRegenerate}
                onAccept={handleAccept}
                isGenerating={mutation.isPending}
              />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

