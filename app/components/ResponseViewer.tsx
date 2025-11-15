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
      <h2 className="text-2xl font-bold text-gray-800">Generated Response</h2>

      {response.keyConcerns && response.keyConcerns.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Key Concerns Addressed:
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {response.keyConcerns.map((concern, index) => (
              <li key={index} className="text-sm text-blue-800">
                {concern}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full min-h-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            placeholder="Edit the response..."
          />
        ) : (
          <div className="whitespace-pre-wrap text-gray-700 min-h-[100px]">
            {displayText}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Regenerate
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Edit Manually
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Accept
            </button>
          </>
        )}
      </div>
    </div>
  );
}

