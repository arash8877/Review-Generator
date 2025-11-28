"use client";

import { useState, useEffect } from "react";
import { Response, Review, CustomerEmail } from "@/app/lib/types";
import { toast } from "sonner";

interface ResponseViewerProps {
  response: Response | null;
  review?: Review | null;
  email?: CustomerEmail | null;
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
  onPreview?: () => void;
  onAccept: () => void;
  copied: boolean;
}

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Review | CustomerEmail;
  response: Response;
  displayText: string;
  isEmail?: boolean;
}

function EmailPreviewModal({ isOpen, onClose, data, response, displayText, isEmail = false }: EmailPreviewModalProps) {
  if (!isOpen) return null;

  const getRatingStars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

  // Type guard to check if data is a Review
  const isReview = (data: Review | CustomerEmail): data is Review => {
    return 'rating' in data && 'text' in data;
  };

  const customerName = data.customerName;
  const productModel = data.productModel;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-400/30 neon-glow-cyan" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-cyan-400/20 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-200">Email Preview</h2>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Email Header */}
          <div className="border border-cyan-400/20 rounded-lg p-4 bg-black/20">
            <div className="space-y-2 text-sm">
              <div><span className="text-cyan-300 font-medium">From:</span> <span className="text-cyan-100">Customer Care &lt;care@dantv.customerservise.dk&gt;</span></div>
              <div><span className="text-cyan-300 font-medium">To:</span> <span className="text-cyan-100">{customerName}</span></div>
              <div><span className="text-cyan-300 font-medium">Subject:</span> <span className="text-cyan-100">
                {isEmail ? `Re: ${(data as CustomerEmail).subject}` : `Re: Your ${productModel} Review`}
              </span></div>
            </div>
          </div>

          {/* Original Context */}
          <div className="glass border border-amber-400/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-300 mb-3 uppercase tracking-wide">
              {isEmail ? 'Original Email' : 'Original Review'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-cyan-100">{customerName}</span>
                  {!isEmail && (
                    <span className="text-yellow-400 text-sm">{getRatingStars((data as Review).rating)}</span>
                  )}
                  {isEmail && (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-red-500/20 text-red-300 border">
                      Priority: {(data as CustomerEmail).priority}
                    </span>
                  )}
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-500/20 text-purple-300 border">
                  {productModel}
                </span>
              </div>
              <p className="text-cyan-100 text-sm leading-relaxed bg-black/20 p-3 rounded-lg border border-cyan-400/10">
                {isEmail ? (data as CustomerEmail).body : (data as Review).text}
              </p>
            </div>
          </div>

          {/* Email Content */}
          <div className="glass border border-cyan-400/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-cyan-300 mb-3 uppercase tracking-wide">Email Body</h3>
            <div className="bg-white/5 p-6 rounded-lg border border-cyan-400/10">
              <div className="text-white whitespace-pre-wrap leading-relaxed">
                {displayText}
              </div>
            </div>
          </div>

          {/* Key Concerns (if available) */}
          {response.keyConcerns && response.keyConcerns.length > 0 && (
            <div className="glass border border-cyan-400/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-cyan-300 mb-3 uppercase tracking-wide">Key Concerns Addressed</h3>
              <ul className="list-disc list-inside space-y-1">
                {response.keyConcerns.map((concern, index) => (
                  <li key={index} className="text-sm text-cyan-100">
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Email Footer */}
          <div className="border-t border-cyan-400/20 pt-4">
            <div className="text-xs text-cyan-100/70 space-y-1">
              <p>Best regards,</p>
              <p className="font-medium text-cyan-200">Customer Care Team</p>
              <p>DanTV</p>
              <p>support@dantv.customerservise.dk</p>
              <p className="text-cyan-100/50 mt-2">
                This email was generated with AI assistance and reviewed by our team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  onPreview,
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
      {onPreview && (
        <button
          onClick={onPreview}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all duration-300 neon-glow-magenta"
        >
          Preview Email
        </button>
      )}
      <button
        onClick={onAccept}
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 neon-glow-blue"
      >
        Send
      </button>
    </div>
  );
}

export function ResponseViewer({
  response,
  review,
  email,
  onRegenerate,
  onAccept,
  isGenerating,
}: ResponseViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [savedText, setSavedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (response) {
      setSavedText(null);
      setIsEditing(false);
      setCopied(false);
      setShowPreview(false);
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
      toast.success("Response copied to clipboard", {
        description: "Ready to paste into your email client",
        action: {
          label: "Open Email",
          onClick: () => window.open('mailto:?subject=Customer Review Response&body=' + encodeURIComponent(displayText), '_blank'),
        },
        duration: 4000,
      });
    } catch (error) {
      console.error("Failed to copy response", error);
      toast.error("Failed to copy response", {
        description: "Please try selecting and copying manually",
      });
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
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
        onPreview={email ? handlePreview : undefined}
        onAccept={onAccept}
        copied={copied}
      />

      {(review || email) && response && (
        <EmailPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          data={review || email!}
          response={response}
          displayText={displayText}
          isEmail={!!email}
        />
      )}
    </div>
  );
}
