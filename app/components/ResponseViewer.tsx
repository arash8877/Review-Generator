"use client";

import { useState, useEffect } from "react";
import { Response } from "@/app/lib/types";

interface ResponseViewerProps {
  response: Response | null;
  onRegenerate: () => void;
  onAccept: () => void;
  isGenerating: boolean;
}

interface ResponseHeaderProps {
  isEditing: boolean;
  hasEditedText: boolean;
}

interface KeyConcernsProps {
  concerns?: string[];
}

interface ResponseContentProps {
  isEditing: boolean;
  displayText: string;
  editedText: string;
  onChange: (value: string) => void;
}

interface ActionButtonsProps {
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onRegenerate: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onAccept: () => void;
  copied: boolean;
}

function ResponseHeader({ isEditing, hasEditedText }: ResponseHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-2xl font-bold text-cyan-200">Generated Response</h2>
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-100">
          AI draft
        </span>
        {isEditing && (
          <span className="px-2 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-100">
            Editing
          </span>
        )}
        {hasEditedText && !isEditing && (
          <span className="px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-100">
            Edited version
          </span>
        )}
      </div>
    </div>
  );
}

function KeyConcernsList({ concerns }: KeyConcernsProps) {
  if (!concerns || concerns.length === 0) return null;

  return (
    <div className="glass-card border border-cyan-400/30 rounded-xl p-4 neon-glow-cyan">
      <h3 className="text-sm font-semibold text-cyan-300 mb-2">
        Key Concerns Addressed:
      </h3>
      <ul className="list-disc list-inside space-y-1">
        {concerns.map((concern, index) => (
          <li key={index} className="text-sm text-cyan-100">
            {concern}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResponseContent({
  isEditing,
  displayText,
  editedText,
  onChange,
}: ResponseContentProps) {
  return (
    <div className="glass border border-cyan-400/20 rounded-xl p-4">
      {isEditing ? (
        <textarea
          value={editedText}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[200px] px-4 py-2 border border-cyan-400/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 resize-y transition-all bg-white/5 text-cyan-100 backdrop-blur-sm"
          placeholder="Edit the response..."
        />
      ) : (
        <div className="whitespace-pre-wrap text-cyan-50 min-h-[100px]">
          {displayText}
        </div>
      )}
    </div>
  );
}

function ActionButtons({
  isEditing,
  onSave,
  onCancel,
  onRegenerate,
  onEdit,
  onCopy,
  onAccept,
  copied,
}: ActionButtonsProps) {
  if (isEditing) {
    return (
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 neon-glow-cyan"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onRegenerate}
        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 neon-glow-cyan hover-neon-glow"
      >
        Regenerate
      </button>
      <button
        onClick={onEdit}
        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-400 hover:to-purple-400 transition-all duration-300 neon-glow-magenta"
      >
        Edit Manually
      </button>
      <button
        onClick={onCopy}
        className="px-4 py-2 bg-white/10 text-cyan-100 rounded-lg border border-cyan-400/30 hover:border-cyan-300 transition-all"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        onClick={onAccept}
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 neon-glow-blue"
      >
        Accept
      </button>
    </div>
  );
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (response) {
      setSavedText(null);
      setIsEditing(false);
      setCopied(false);
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
    setSavedText(null);
    onRegenerate();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy response", error);
    }
  };

  return (
    <div className="space-y-4">
      <ResponseHeader isEditing={isEditing} hasEditedText={!!savedText} />

      <KeyConcernsList concerns={response.keyConcerns} />

      <ResponseContent
        isEditing={isEditing}
        displayText={displayText}
        editedText={editedText}
        onChange={setEditedText}
      />

      <ActionButtons
        isEditing={isEditing}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        onRegenerate={handleRegenerateClick}
        onEdit={handleEdit}
        onCopy={handleCopy}
        onAccept={onAccept}
        copied={copied}
      />
    </div>
  );
}
