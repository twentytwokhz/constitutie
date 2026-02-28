"use client";

import { Loader2, MessageSquarePlus, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Generate a simple browser fingerprint hash for abuse prevention */
function generateFingerprint(): string {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join("|");
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fp-${Math.abs(hash).toString(36)}`;
}

interface TextSelectionFeedbackProps {
  articleId: number;
  /** Ref to the container whose text selection should be monitored */
  children: React.ReactNode;
  /** Callback when an inline comment is successfully submitted */
  onCommentSubmitted?: () => void;
}

/**
 * Wraps article content and shows a floating feedback button when text is selected.
 *
 * Flow:
 * 1. User selects text inside the children container
 * 2. A floating "Comentează selecția" button appears near the selection
 * 3. Clicking it opens an inline comment form with the selected text quoted
 * 4. Submitting sends the comment with `selectedText` to the API
 */
export function TextSelectionFeedback({
  articleId,
  children,
  onCommentSubmitted,
}: TextSelectionFeedbackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [buttonPos, setButtonPos] = useState<{ top: number; left: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: "success" | "rejected" | "error";
    message: string;
  } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  /** Check if the current selection is within our container */
  const isSelectionInContainer = useCallback((): boolean => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    return containerRef.current?.contains(range.commonAncestorContainer) ?? false;
  }, []);

  /** Handle text selection changes */
  const handleSelectionChange = useCallback(() => {
    // Don't update if the form is currently open
    if (showForm) return;

    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";

    if (text.length >= 3 && isSelectionInContainer()) {
      // Get the bounding rect of the selection to position the button
      const range = selection?.getRangeAt(0);
      if (!range || !containerRef.current) return;
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      setSelectedText(text);
      setButtonPos({
        top: rect.top - containerRect.top - 44, // Position above selection
        left: rect.left - containerRect.left + rect.width / 2,
      });
    } else {
      setSelectedText("");
      setButtonPos(null);
    }
  }, [showForm, isSelectionInContainer]);

  useEffect(() => {
    // Use mouseup event for more reliable selection detection
    const handleMouseUp = () => {
      // Small delay to let the selection API update
      requestAnimationFrame(() => {
        handleSelectionChange();
      });
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleSelectionChange]);

  /** Close the floating button when clicking outside */
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (showForm && formRef.current && !formRef.current.contains(e.target as Node)) {
        closeForm();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [showForm]);

  function openForm() {
    setShowForm(true);
    setButtonPos(null);
    setSubmitResult(null);
    setCommentText("");
  }

  function closeForm() {
    setShowForm(false);
    setSelectedText("");
    setButtonPos(null);
    setSubmitResult(null);
    setCommentText("");
    // Clear the browser selection
    window.getSelection()?.removeAllRanges();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const fingerprint = generateFingerprint();
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText.trim(),
          selectedText: selectedText,
          fingerprintHash: fingerprint,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitResult({ type: "error", message: data.error || "Eroare la trimitere" });
        return;
      }

      if (data.status === "rejected") {
        setSubmitResult({
          type: "rejected",
          message: data.rejectionReason || "Comentariul nu respectă regulile platformei.",
        });
      } else {
        setSubmitResult({ type: "success", message: "Comentariul a fost adăugat cu succes!" });
        onCommentSubmitted?.();
        // Auto-close after success
        setTimeout(() => closeForm(), 2000);
      }
    } catch {
      setSubmitResult({ type: "error", message: "Eroare de rețea. Încercați din nou." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {children}

      {/* Floating feedback button — appears near selection */}
      {buttonPos && selectedText && !showForm && (
        <div
          className="absolute z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            top: `${buttonPos.top}px`,
            left: `${buttonPos.left}px`,
            transform: "translateX(-50%)",
          }}
        >
          <button
            type="button"
            onClick={openForm}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Comentează selecția
          </button>
        </div>
      )}

      {/* Inline feedback form — appears below article content when activated */}
      {showForm && selectedText && (
        <div
          ref={formRef}
          className="mt-4 rounded-lg border-2 border-primary/30 bg-card p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              Comentariu pe text selectat
            </h4>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full p-1 hover:bg-muted transition-colors"
              aria-label="Închide"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Quoted selected text */}
          <blockquote className="mb-3 border-l-2 border-primary/50 pl-3 text-sm italic text-muted-foreground line-clamp-3">
            &ldquo;{selectedText}&rdquo;
          </blockquote>

          {/* Comment form */}
          <form onSubmit={handleSubmit}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Scrie un comentariu despre acest text..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[60px]"
              rows={2}
              disabled={submitting}
              /* biome-ignore lint/a11y/noAutofocus: intentional UX — focus textarea when inline form opens */
              autoFocus
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Verificat automat de AI.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Se verifică...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Trimite
                    </>
                  )}
                </button>
              </div>
            </div>

            {submitResult && (
              <div
                className={`mt-2 rounded-md px-3 py-2 text-xs ${
                  submitResult.type === "success"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : submitResult.type === "rejected"
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "bg-destructive/10 text-destructive"
                }`}
              >
                {submitResult.type === "rejected" && <strong>Respins: </strong>}
                {submitResult.message}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
