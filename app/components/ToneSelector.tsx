"use client";

import { Tone } from "@/app/lib/types";
import { toneOptions } from "@/app/lib/constants";

interface ToneSelectorProps {
  selectedTone: Tone | null;
  onSelectTone: (tone: Tone) => void;
  disabled?: boolean;
}

export function ToneSelector({
  selectedTone,
  onSelectTone,
  disabled = false,
}: ToneSelectorProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="tone-select"
        className="block text-sm font-medium text-cyan-200">
        Select Response Tone
      </label>
      <p className="text-xs text-cyan-100/70">
        Align the AI draft to the customer sentiment before generating.
      </p>
      <select
        id="tone-select"
        value={selectedTone || ""}
        onChange={(e) => onSelectTone(e.target.value as Tone)}
        disabled={disabled}
        className={`w-full px-4 py-2 border border-cyan-400/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all backdrop-blur-sm ${
          disabled
            ? "bg-gray-600/30 cursor-not-allowed text-gray-400"
            : "bg-white/5 text-cyan-100 hover:border-cyan-400/50"
        }`}
      >
        <option value="">Choose a tone...</option>
        {toneOptions.map((tone) => (
          <option key={tone} value={tone}>
            {tone}
          </option>
        ))}
      </select>
    </div>
  );
}
