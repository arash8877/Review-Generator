"use client";

import { useState, useEffect } from "react";
import { Response } from "@/app/lib/types";

interface ResponseViewerProps {
  response: Response | null;
  onRegenerate: () => void;
  onAccept: () => void;
  isGenerating: boolean;
}

export function ResponseViewer({
  response,
  onRegenerate,
  onAccept,
  isGenerating,
}: ResponseViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [savedText, setSavedText] = useState<string | null>(null);

  // Reset saved text when response changes (new generation)
  useEffect(() => {
    if (response) {
      setSavedText(null);
      setIsEditing(false);
    }
  }, [response?.text]);

  if (!response && !isGenerating) {
    return null;
  }

  if (isGenerating) {
    return null; // Loading is handled by parent
  }

  if (!response) {
    return null;
  }

  // Use saved text if available, otherwise use original response text
  const displayText = isEditing ? editedText : (savedText || response.text);

  const handleEdit = () => {
    setEditedText(savedText || response.text);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setSavedText(editedText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(savedText || response.text);
    setIsEditing(false);
  };

  const handleRegenerateClick = () => {
    setSavedText(null); // Reset saved text when regenerating
    onRegenerate();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-cyan-200">Generated Response</h2>

      {response.keyConcerns && response.keyConcerns.length > 0 && (
        <div className="glass-card border border-cyan-400/30 rounded-xl p-4 neon-glow-cyan">
          <h3 className="text-sm font-semibold text-cyan-300 mb-2">
            Key Concerns Addressed:
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {response.keyConcerns.map((concern, index) => (
              <li key={index} className="text-sm text-cyan-100">
                {concern}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="glass border border-cyan-400/20 rounded-xl p-4">
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full min-h-[200px] px-4 py-2 border border-cyan-400/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 resize-y transition-all bg-white/5 text-cyan-100 backdrop-blur-sm"
            placeholder="Edit the response..."
          />
        ) : (
          <div className="whitespace-pre-wrap text-cyan-50 min-h-[100px]">
            {displayText}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 neon-glow-cyan"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleRegenerateClick}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 neon-glow-cyan hover-neon-glow"
            >
              Regenerate
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-400 hover:to-purple-400 transition-all duration-300 neon-glow-magenta"
            >
              Edit Manually
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 neon-glow-blue"
            >
              Accept
            </button>
          </>
        )}
      </div>
    </div>
  );
}

