"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { EmailSelector } from "../components/EmailSelector";
import { ToneSelector } from "../components/ToneSelector";
import { ResponseViewer } from "../components/ResponseViewer";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmailSummaryViewer } from "../components/EmailSummaryViewer";
import { EmailStatsOverview } from "../components/EmailStatsOverview";
import { EmailResponseChecklist } from "../components/EmailResponseChecklist";
import { customerEmails } from "../lib/emails";
import { Tone, Response, EmailFilters, SummaryResponse, ProductModelFilter } from "../lib/types";
import { toast } from "sonner";

async function generateEmailResponse(
  emailId: string,
  tone: Tone,
  options?: { requestId?: string; previousResponse?: string }
): Promise<Response> {
  const response = await fetch("/api/generate-email-response", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      emailId,
      tone,
      requestId: options?.requestId,
      previousResponse: options?.previousResponse,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate email response");
  }

  return response.json();
}

async function generateEmailSummary(productModel?: string): Promise<SummaryResponse> {
  const response = await fetch("/api/generate-email-summary", {
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

export default function EmailsPage() {
  const [emailsState, setEmailsState] = useState(customerEmails);
  const [filters, setFilters] = useState<EmailFilters>({ status: "all", productModel: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
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

  const responseMutation = useMutation({
    mutationFn: ({
      emailId,
      tone,
      requestId,
      previousResponse,
    }: {
      emailId: string;
      tone: Tone;
      requestId?: string;
      previousResponse?: string;
    }) => generateEmailResponse(emailId, tone, { requestId, previousResponse }),
    onSuccess: (data) => {
      setGeneratedResponse(data);
    },
    onError: (error) => {
      console.error("Error generating email response:", error);
      toast.error("Failed to generate response. Please try again.");
    },
  });

  const summaryMutation = useMutation({
    mutationFn: (productModel?: string) => generateEmailSummary(productModel),
    onSuccess: (data) => {
      setSummaryData(data);
      setGeneratedForProduct(selectedSummaryProduct);
    },
    onError: (error) => {
      console.error("Error generating email summary:", error);
      toast.error("Failed to generate summary. Please try again.");
    },
  });

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmailId(emailId);
    setSelectedTone(null);
    setGeneratedResponse(null);
    responseMutation.reset();
    setActiveTab("response");
  };

  const handleGenerate = () => {
    if (!selectedEmailId || !selectedTone) {
      toast.error("Pick an email and tone first.");
      return;
    }

    responseMutation.mutate({
      emailId: selectedEmailId,
      tone: selectedTone,
      requestId: crypto.randomUUID(),
      previousResponse: undefined,
    });
  };

  const handleRegenerate = () => {
    if (!selectedEmailId || !selectedTone) {
      return;
    }
    responseMutation.mutate({
      emailId: selectedEmailId,
      tone: selectedTone,
      requestId: crypto.randomUUID(),
      previousResponse: generatedResponse?.text,
    });
  };

  const handleAccept = () => {
    if (selectedEmailId) {
      setEmailsState((prev) =>
        prev.map((email) =>
          email.id === selectedEmailId ? { ...email, answered: true } : email
        )
      );
      setSelectedEmailId(null);
      setSelectedTone(null);
      setGeneratedResponse(null);
      toast.success("Email response generated successfully", {
        duration: 3000,
      });
    }
  };

  const selectedEmail = useMemo(
    () => emailsState.find((email) => email.id === selectedEmailId) || null,
    [emailsState, selectedEmailId]
  );
  const recommendedTone = useMemo(() => {
    if (!selectedEmail) return null;

    if (selectedEmail.sentiment === "negative") {
      return { tone: "Apologetic" as Tone, reason: "Customer reports an issue" };
    }
    if (selectedEmail.priority === "high") {
      return { tone: "Formal" as Tone, reason: "High-priority request needs authority" };
    }
    if (selectedEmail.sentiment === "positive") {
      return { tone: "Friendly" as Tone, reason: "Positive feedback deserves warmth" };
    }
    return { tone: "Neutral/Professional" as Tone, reason: "General inquiry" };
  }, [selectedEmail]);

  const { totalEmails, answeredCount, pendingCount, negativeCount, answerRate } = useMemo(() => {
    const total = emailsState.length;
    const answered = emailsState.filter((email) => email.answered).length;
    const pending = total - answered;
    const negatives = emailsState.filter((email) => email.sentiment === "negative").length;
    const rate = total === 0 ? 0 : Math.round((answered / total) * 100);
    return {
      totalEmails: total,
      answeredCount: answered,
      pendingCount: pending,
      negativeCount: negatives,
      answerRate: rate,
    };
  }, [emailsState]);

  const productFilterMap: Record<ProductModelFilter, string | undefined> = {
    all: undefined,
    "model-1": "TV-Model 1",
    "model-2": "TV-Model 2",
    "model-3": "TV-Model 3",
    "model-4": "TV-Model 4",
  };

  const filteredEmails = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const targetProduct = productFilterMap[filters.productModel];

    return emailsState.filter((email) => {
      const statusMatch =
        filters.status === "all" ||
        (filters.status === "answered" && email.answered === true) ||
        (filters.status === "priority-high" && email.priority === "high") ||
        (filters.status === "priority-medium" && email.priority === "medium") ||
        (filters.status === "priority-low" && email.priority === "low");

      const productMatch = !targetProduct || email.productModel === targetProduct;

      const searchMatch =
        normalizedSearch.length === 0 ||
        email.customerName.toLowerCase().includes(normalizedSearch) ||
        email.productModel.toLowerCase().includes(normalizedSearch) ||
        email.subject.toLowerCase().includes(normalizedSearch) ||
        email.body.toLowerCase().includes(normalizedSearch);

      return statusMatch && productMatch && searchMatch;
    });
  }, [emailsState, filters.productModel, filters.status, searchTerm]);

  return (
    <main className="min-h-screen bg-dark-gradient py-8 px-4 sm:px-5 lg:px-6">
      <div className="max-w-8xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="neon-text-cyan">Inbox Response</span>{" "}
            <span className="neon-text-magenta">Assistant</span>
          </h1>
          <p className="text-lg text-cyan-100/80">Generate replies, summaries, and insights for customer emails</p>
        </div>

        <EmailStatsOverview
          totalEmails={totalEmails}
          pendingCount={pendingCount}
          answeredCount={answeredCount}
          negativeCount={negativeCount}
          answerRate={answerRate}
        />

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <section className="glass-card rounded-2xl p-4 lg:p-6 h-fit animate-fade-in-glass">
            <EmailSelector
              emails={filteredEmails}
              selectedEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              filters={filters}
              onFiltersChange={setFilters}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
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
                Email Response
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
                <EmailResponseChecklist
                  hasSelectedEmail={!!selectedEmail}
                  hasTone={!!selectedTone}
                  hasGeneratedResponse={!!generatedResponse}
                />
              )}

              {activeTab === "response" ? (
                <div className="space-y-6">
                  {!selectedEmail && (
                    <div className="flex flex-col items-center justify-center text-center text-cyan-100/60 min-h-[300px] space-y-3">
                      <p className="text-xl font-semibold text-cyan-200">Pick an email to get started</p>
                      <p className="max-w-md text-cyan-100/70">
                        Select any customer message from the left to view details, choose tone, and let AI draft a thoughtful reply.
                      </p>
                    </div>
                  )}

                  {selectedEmail && (
                    <>
                      <div className="space-y-3">
                        <p className="text-base font-bold text-cyan-300 uppercase tracking-wide">
                          Selected email
                        </p>
                        <div className="glass rounded-xl border p-6 space-y-2">
                            <div className="space-y-2 mb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-cyan-100">
                                      {selectedEmail.customerName}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedEmail.answered ? (
                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border">
                                      Replied
                                    </span>
                                  ) : (
                                    <span className={`px-2 py-1 text-xs font-semibold rounded border ${selectedEmail.priority === "high" ? "bg-red-500/20 text-red-200 border-red-400/40" : selectedEmail.priority === "medium" ? "bg-amber-500/20 text-amber-200 border-amber-400/30" : "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"}`}>
                                      {selectedEmail.priority} priority
                                    </span>
                                  )}
                                  <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border">
                                    {selectedEmail.productModel}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-cyan-100 font-semibold">{selectedEmail.subject}</p>
                              </div>
                            </div>
                          <p className="text-cyan-50 leading-relaxed text-base whitespace-pre-wrap">{selectedEmail.body}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr,auto] items-end">
                        <ToneSelector
                          selectedTone={selectedTone}
                          onSelectTone={setSelectedTone}
                          disabled={!selectedEmail}
                          recommendedTone={recommendedTone?.tone || null}
                          recommendationReason={recommendedTone?.reason}
                          onUseRecommended={(tone) => setSelectedTone(tone)}
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
                          email={selectedEmail}
                          onRegenerate={handleRegenerate}
                          onAccept={handleAccept}
                          isGenerating={responseMutation.isPending}
                        />
                      )}
                    </>
                  )}
                </div>
              ) : (
                <EmailSummaryViewer
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
