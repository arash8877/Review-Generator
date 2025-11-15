"use client";

import { Tone } from "@/app/lib/types";

interface ToneSelectorProps {
  selectedTone: Tone | null;
  onSelectTone: (tone: Tone) => void;
  disabled?: boolean;
}

const tones: Tone[] = ["Friendly", "Formal", "Apologetic", "Neutral/Professional"];

export function ToneSelector({
  selectedTone,
  onSelectTone,
  disabled = false,
}: ToneSelectorProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="tone-select"
        className="block text-sm font-medium text-gray-700"
      >
        Select Response Tone
      </label>
      <select
        id="tone-select"
        value={selectedTone || ""}
        onChange={(e) => onSelectTone(e.target.value as Tone)}
        disabled={disabled}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-500"
            : "bg-white text-gray-900"
        }`}
      >
        <option value="">Choose a tone...</option>
        {tones.map((tone) => (
          <option key={tone} value={tone}>
            {tone}
          </option>
        ))}
      </select>
    </div>
  );
}

