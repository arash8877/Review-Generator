"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CallSelector } from "../components/CallSelector";
import { CallStatsOverview } from "../components/CallStatsOverview";
import { CallResponseChecklist } from "../components/CallResponseChecklist";
import { CallSummaryViewer } from "../components/CallSummaryViewer";
import { ToneSelector } from "../components/ToneSelector";
import { ResponseViewer } from "../components/ResponseViewer";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { buildRecentCalls } from "../lib/calls";
import {
  CallFilters,
  CallRecap,
  PhoneCall,
  Response,
  Tone,
} from "../lib/types";
import { toast } from "sonner";

async function generateCallFollowUp(callId: string, tone: Tone): Promise<Response> {
  const res = await fetch("/api/generate-call-followup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callId, tone }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate call follow-up");
  }

  return res.json();
}

function buildRecapFromCall(call: PhoneCall): CallRecap {
  const risks = call.riskFlags.length ? [...call.riskFlags] : ["No major risks surfaced during the call."];
  const opportunities = [
    `Strengthen trust by proactive follow-up via ${call.followUpChannel.toUpperCase()}`,
    ...call.highlightMoments.slice(0, 2),
  ];

  return {
    summary: call.summary,
    actions: [...call.nextActions],
    risks,
    opportunities,
    sentiment: call.sentiment,
    channel: "Phone",
    followUpChannel: call.followUpChannel,
  };
}

export default function PhoneCallsPage() {
  // Start empty to avoid SSR/client time mismatch; hydrate with rolling 48h data on mount.
  const [callsState, setCallsState] = useState<PhoneCall[] | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filters, setFilters] = useState<CallFilters>({ status: "all", productModel: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState<Response | null>(null);
  const [recapData, setRecapData] = useState<CallRecap | null>(null);
  const [activeTab, setActiveTab] = useState<"assist" | "recap">("assist");
  const [isRecapLoading, setIsRecapLoading] = useState(false);
  const mainSectionRef = useRef<HTMLDivElement | null>(null);
  const responseSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCallsState(buildRecentCalls(70));
    setIsHydrated(true);
  }, []);

  const calls = callsState ?? [];

  const selectedCall = useMemo(
    () => calls.find((call) => call.id === selectedCallId) || null,
    [calls, selectedCallId]
  );

  const filteredCalls = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return calls.filter((call) => {
      const statusMatch =
        filters.status === "all"
          ? true
          : filters.status === "high-urgency"
            ? call.urgency === "high"
            : call.status === filters.status;

      const productMatch =
        filters.productModel === "all" ||
        (filters.productModel === "model-1" && call.productModel === "TV-Model 1") ||
        (filters.productModel === "model-2" && call.productModel === "TV-Model 2") ||
        (filters.productModel === "model-3" && call.productModel === "TV-Model 3") ||
        (filters.productModel === "model-4" && call.productModel === "TV-Model 4");

      const searchMatch =
        normalized.length === 0 ||
        call.callerName.toLowerCase().includes(normalized) ||
        call.intent.toLowerCase().includes(normalized) ||
        call.summary.toLowerCase().includes(normalized);

      return statusMatch && productMatch && searchMatch;
    });
  }, [calls, filters.productModel, filters.status, searchTerm]);

  const followUpMutation = useMutation({
    mutationFn: ({ callId, tone }: { callId: string; tone: Tone }) => generateCallFollowUp(callId, tone),
    onSuccess: (data) => {
      setGeneratedResponse(data);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Could not create the follow-up. Try again.");
    },
  });

  const handleSelectCall = (callId: string) => {
    if (!calls.length) return;

    setSelectedCallId(callId);
    const call = calls.find((c) => c.id === callId);
    setSelectedTone(call?.recommendedTone ?? null);
    setGeneratedResponse(null);
    setRecapData(null);
    setIsRecapLoading(false);
    followUpMutation.reset();
    setActiveTab("assist");
  };

  const handleGenerateFollowUp = () => {
    if (!selectedCallId || !selectedTone) {
      toast.error("Select a call and tone first.");
      return;
    }
    followUpMutation.mutate({ callId: selectedCallId, tone: selectedTone });
  };

  const handleAcceptFollowUp = () => {
    if (!selectedCallId || !callsState) return;

    setCallsState((prev) =>
      (prev ?? []).map((call) =>
        call.id === selectedCallId ? { ...call, status: "resolved" } : call
      )
    );
    toast.success("Follow-up saved and call closed", {
      description: "Marked as resolved with AI recap.",
    });
    setActiveTab("recap");
    // Smoothly return the user to the top of the main content
    requestAnimationFrame(() => {
      if (mainSectionRef.current) {
        mainSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const handleGenerateRecap = () => {
    const currentCall = selectedCall ?? calls.find((c) => c.id === selectedCallId) ?? null;
    if (!currentCall) {
      toast.error("Select a call to generate a recap.");
      return;
    }
    setRecapData(null);
    setIsRecapLoading(true);
    // Allow the loading state to render before rebuilding the recap
    setTimeout(() => {
      setRecapData(buildRecapFromCall(currentCall));
      setIsRecapLoading(false);
    }, 150);
  };

  const recommendedTone = selectedCall?.recommendedTone ?? null;

  // Auto-apply recommended tone for calls
  useEffect(() => {
    if (selectedCall) {
      setSelectedTone(recommendedTone ?? null);
    } else {
      setSelectedTone(null);
    }
  }, [selectedCall?.id, recommendedTone]);

  // Scroll to the generated response when it becomes available
  useEffect(() => {
    if (generatedResponse && responseSectionRef.current) {
      responseSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [generatedResponse]);

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-dark-gradient py-8 px-4 sm:px-5 lg:px-6">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-2">
              <span className="neon-text-cyan">Phone Call</span>{" "}
              <span className="neon-text-magenta">Assistant</span>
            </h1>
            <p className="text-lg text-cyan-100/80">AI live assist, recaps, and follow-ups for customer calls</p>
          </div>
          <div className="glass-card rounded-2xl p-6 border border-white/10 text-cyan-100/70 text-center">
            Loading calls...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark-gradient py-6 px-3 sm:px-4 lg:px-6">
      <div className="max-w-9xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold">
            <span className="neon-text-cyan">Phone Call</span>{" "}
            <span className="neon-text-magenta">Assistant</span>
          </h1>
          <p className="text-base sm:text-lg text-cyan-100/80 max-w-2xl mx-auto">
            AI-powered live assist, intelligent recaps, and automated follow-ups for customer calls
          </p>
        </div>

        {/* Stats Overview */}
        <CallStatsOverview calls={calls} />

        {/* Main Content Layout */}
        <div className="grid gap-6 xl:grid-cols-[380px,1fr] lg:grid-cols-[340px,1fr] grid-cols-1">
          {/* Call Selector Sidebar */}
          <section className="order-2 xl:order-1 glass-card rounded-2xl p-4 sm:p-6 animate-fade-in-glass h-fit lg:sticky lg:top-6 lg:self-start">
            <CallSelector
              calls={filteredCalls}
              selectedCallId={selectedCallId}
              onSelectCall={handleSelectCall}
              filters={filters}
              onFiltersChange={setFilters}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </section>

          {/* Main Content Area */}
          <section
            ref={mainSectionRef}
            className="order-1 xl:order-2 glass-card rounded-2xl overflow-hidden min-h-[700px] animate-fade-in-glass"
          >
            <div className="flex border-b border-white/10 bg-white/5">
              <button
                onClick={() => setActiveTab("assist")}
                className={`flex-1 py-5 px-4 text-sm font-semibold text-center border-b-3 transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "assist"
                    ? "border-cyan-400 text-cyan-300 bg-cyan-500/10 neon-glow-cyan"
                    : "border-transparent text-cyan-100/70 hover:text-cyan-300 hover:bg-cyan-500/5"
                }`}
              >
                <span className="text-lg">🎯</span>
                <span className="hidden sm:inline">Live Assist</span>
                <span className="sm:hidden">Assist</span>
              </button>
              <button
                onClick={() => setActiveTab("recap")}
                className={`flex-1 py-5 px-4 text-sm font-semibold text-center border-b-3 transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "recap"
                    ? "border-pink-400 text-pink-300 bg-pink-500/10 neon-glow-magenta"
                    : "border-transparent text-cyan-100/70 hover:text-pink-300 hover:bg-pink-500/5"
                }`}
              >
                <span className="text-lg">📋</span>
                <span className="hidden sm:inline">Recap & Tasks</span>
                <span className="sm:hidden">Recap</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {activeTab === "assist" && (
                <CallResponseChecklist
                  hasSelectedCall={!!selectedCall}
                  hasTone={!!selectedTone}
                  hasGeneratedResponse={!!generatedResponse}
                />
              )}

              {activeTab === "assist" ? (
                <div className="space-y-6">
                  {!selectedCall && (
                    <div className="flex flex-col items-center justify-center text-center min-h-[400px] space-y-6">
                      <div className="space-y-4">
                        <div className="text-6xl">📞</div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-cyan-200">Ready for AI Assistance</h3>
                          <p className="text-cyan-100/70 max-w-md mx-auto">
                            Select a call from the sidebar to get AI-powered insights, automated follow-ups, and intelligent recaps.
                          </p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 max-w-2xl w-full">
                        <div className="glass rounded-lg p-4 border border-cyan-400/20">
                          <div className="text-cyan-400 text-2xl mb-2">🎯</div>
                          <h4 className="font-semibold text-cyan-200 mb-1">Live Assist</h4>
                          <p className="text-xs text-cyan-100/70">Get real-time AI guidance during calls</p>
                        </div>
                        <div className="glass rounded-lg p-4 border border-pink-400/20">
                          <div className="text-pink-400 text-2xl mb-2">📋</div>
                          <h4 className="font-semibold text-pink-200 mb-1">Smart Recaps</h4>
                          <p className="text-xs text-cyan-100/70">AI-generated summaries and next steps</p>
                        </div>
                        <div className="glass rounded-lg p-4 border border-emerald-400/20">
                          <div className="text-emerald-400 text-2xl mb-2">✨</div>
                          <h4 className="font-semibold text-emerald-200 mb-1">Auto Responses</h4>
                          <p className="text-xs text-cyan-100/70">Generate personalized follow-up messages</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCall && (
                    <>
                      {/* Call Header Card */}
                      <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900/70 via-slate-900/60 to-cyan-900/50 border border-cyan-400/20 shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-bold text-cyan-100 tracking-tight">{selectedCall.callerName}</h3>
                              <div className="flex gap-2">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${
                                  selectedCall.status === "live"
                                    ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/40"
                                    : selectedCall.status === "open"
                                      ? "bg-amber-500/15 text-amber-100 border-amber-400/40"
                                      : "bg-cyan-500/15 text-cyan-100 border-cyan-400/40"
                                }`}>
                                  {selectedCall.status === "live" ? "🔴 Live" : selectedCall.status === "resolved" ? "✅ Done" : "🟡 Open"}
                                </span>
                                <span className={`px-3 py-1 text-xs rounded-full border shadow-sm ${
                                  selectedCall.urgency === "high"
                                    ? "bg-red-500/10 text-red-100 border-red-400/40"
                                    : selectedCall.urgency === "medium"
                                      ? "bg-amber-500/10 text-amber-100 border-amber-400/40"
                                      : "bg-emerald-500/10 text-emerald-100 border-emerald-400/40"
                                }`}>
                                  {selectedCall.urgency === "high" ? "🚨" : selectedCall.urgency === "medium" ? "⚠️" : "ℹ️"} {selectedCall.urgency}
                                </span>
                              </div>
                            </div>
                            <p className="text-lg text-cyan-50 font-semibold flex items-center gap-2">
                              <span className="text-cyan-300">🎯</span>
                              {selectedCall.intent}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-cyan-100/70">
                              <span className="flex items-center gap-1">
                                <span className="text-cyan-300">🗓</span>
                                {selectedCall.createdAt}
                              </span>
                              <span className="text-cyan-100/50">•</span>
                              <span className="flex items-center gap-1">
                                <span className="text-cyan-300">⏱</span>
                                {selectedCall.durationMinutes} min
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="px-3 py-1 text-sm rounded-lg bg-purple-500/15 border border-purple-400/30 text-purple-100 font-semibold shadow-sm">
                              {selectedCall.productModel}
                            </span>
                            <span className="px-3 py-1 text-xs rounded-md bg-white/5 text-cyan-100/70 border border-white/10">
                              Follow-up via {selectedCall.followUpChannel.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-4 sm:grid-cols-2">
                          <div className="glass rounded-lg border border-white/10 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-cyan-100/60 font-semibold">Call mood</p>
                            <p className="text-base text-cyan-100 font-semibold flex items-center gap-2 mt-1">
                              <span>🧭</span>
                              {selectedCall.sentiment}
                            </p>
                          </div>
                          <div className="glass rounded-lg border border-white/10 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-cyan-100/60 font-semibold">Recommended tone</p>
                            <p className="text-base text-cyan-100 font-semibold flex items-center gap-2 mt-1">
                              <span>🎙</span>
                              {recommendedTone ? recommendedTone : "—"}
                            </p>
                          </div>
                          <div className="glass rounded-lg border border-white/10 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-cyan-100/60 font-semibold">Highlights</p>
                            <p className="text-base text-cyan-100 font-semibold flex items-center gap-2 mt-1">
                              <span>⭐️</span>
                              {selectedCall.highlightMoments.length} key points
                            </p>
                          </div>
                          <div className="glass rounded-lg border border-white/10 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-cyan-100/60 font-semibold">Status</p>
                            <p className="text-base text-cyan-100 font-semibold flex items-center gap-2 mt-1">
                              <span>📌</span>
                              {selectedCall.status === "live" ? "In progress" : selectedCall.status === "open" ? "Needs follow-up" : "Closed"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-cyan-50 leading-relaxed text-base">{selectedCall.summary}</p>

                          {selectedCall.riskFlags.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-red-200 flex items-center gap-2">
                                <span className="text-red-300">⚠️</span>
                                Risk Flags
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedCall.riskFlags.map((flag) => (
                                  <span
                                    key={flag}
                                    className="px-3 py-1 text-sm rounded-lg bg-red-500/10 border border-red-400/30 text-red-100"
                                  >
                                    {flag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Transcript and Insights Section */}
                      <div className="grid lg:grid-cols-[1.4fr,0.6fr] gap-6">
                        {/* Transcript Section */}
                        <div className="space-y-4">
                          <div className="glass rounded-xl border border-cyan-400/20 p-5 space-y-4 shadow-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-cyan-300 text-xl">📝</span>
                                <div>
                                  <h4 className="text-lg font-semibold text-cyan-100">Call Transcript</h4>
                                  <p className="text-xs text-cyan-100/60">Key conversation moments</p>
                                </div>
                              </div>
                              <span className="text-sm text-cyan-100/70 bg-white/5 px-2 py-1 rounded border border-white/10">
                                {selectedCall.durationMinutes} min
                              </span>
                            </div>
                            <div className="bg-black/40 border border-white/10 rounded-lg p-4 max-h-64 overflow-auto custom-scroll shadow-inner">
                              <pre className="text-sm text-cyan-50 whitespace-pre-wrap leading-relaxed">
                                {selectedCall.transcript}
                              </pre>
                            </div>
                          </div>

                          {/* Action Section */}
                          <div className="glass rounded-xl border border-cyan-400/30 p-6 space-y-6 shadow-xl bg-gradient-to-r from-cyan-900/40 to-blue-900/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-cyan-300 text-xl">✨</span>
                                <div>
                                  <h4 className="text-lg font-semibold text-cyan-100">Generate AI Response</h4>
                                  <p className="text-xs text-cyan-100/70">Draft a ready-to-send follow-up</p>
                                </div>
                              </div>
                              <span className="text-xs text-cyan-100/60 px-2 py-1 rounded bg-white/5 border border-white/10">
                                Tone matched to sentiment
                              </span>
                            </div>

                            <div className="grid md:grid-cols-[1fr,auto] gap-6 items-end">
                              <ToneSelector
                                selectedTone={selectedTone}
                                onSelectTone={setSelectedTone}
                                disabled={!selectedCall}
                                recommendedTone={recommendedTone}
                              />

                              <div className="space-y-3">
                                <button
                                  onClick={handleGenerateFollowUp}
                                  disabled={!selectedTone || followUpMutation.isPending}
                                  className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                                    !selectedTone || followUpMutation.isPending
                                      ? "bg-gray-600 cursor-not-allowed opacity-50"
                                      : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-lg hover:shadow-xl transform hover:scale-105"
                                  }`}
                                >
                                  {followUpMutation.isPending ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                      Drafting...
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span>🚀</span>
                                      Generate Response
                                    </div>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* AI Insights Sidebar */}
                        <div className="space-y-4">
                          <div className="glass rounded-xl border border-cyan-400/20 p-5 space-y-4 shadow-lg bg-white/5">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold text-cyan-200 flex items-center gap-2">
                                <span className="text-cyan-400">🧠</span>
                                AI Insights
                              </h4>
                              <span className="text-xs text-cyan-100/70 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-400/20">
                                Highlights
                              </span>
                            </div>
                            <div className="space-y-3">
                              {selectedCall.highlightMoments.map((moment, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 text-sm text-cyan-50 p-3 bg-cyan-500/5 rounded-lg border border-cyan-400/10"
                                >
                                  <span className="mt-0.5 w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                                  <span className="leading-relaxed">{moment}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="glass rounded-xl border border-emerald-400/20 p-5 space-y-4 shadow-lg bg-white/5">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold text-emerald-200 flex items-center gap-2">
                                <span className="text-emerald-400">🎯</span>
                                Next Actions
                              </h4>
                              <span className="text-xs text-emerald-100/70 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-400/20">
                                Commitments
                              </span>
                            </div>
                            <div className="space-y-3">
                              {selectedCall.nextActions.map((action, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 text-sm text-cyan-50 p-3 bg-emerald-500/5 rounded-lg border border-emerald-400/10"
                                >
                                  <span className="mt-0.5 text-emerald-300 flex-shrink-0">✓</span>
                                  <span className="leading-relaxed">{action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {followUpMutation.isPending && (
                        <div className="border border-gray-200 rounded-lg">
                          <LoadingSpinner />
                        </div>
                      )}

                      {generatedResponse && !followUpMutation.isPending && (
                        <div ref={responseSectionRef}>
                          <ResponseViewer
                            response={generatedResponse}
                            onRegenerate={handleGenerateFollowUp}
                            onAccept={handleAcceptFollowUp}
                            isGenerating={followUpMutation.isPending}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <CallSummaryViewer
                  call={selectedCall}
                  recap={recapData}
                  isLoading={isRecapLoading}
                  onGenerate={handleGenerateRecap}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
