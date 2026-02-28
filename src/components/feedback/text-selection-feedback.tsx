"use client";

import { Loader2, MessageSquarePlus, Send, Share2, X } from "lucide-react";
import { useTranslations } from "next-intl";
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
  /** Article number for share text formatting (e.g. 15) */
  articleNumber?: number;
  /** Constitution year for share text formatting (e.g. 2003) */
  year?: number;
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
 * 2. A floating "Comment on selection" button appears near the selection
 * 3. Clicking it opens an inline comment form with the selected text quoted
 * 4. Submitting sends the comment with `selectedText` to the API
 */
export function TextSelectionFeedback({
  articleId,
  articleNumber,
  year,
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
  const t = useTranslations();

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

  const [showShareMenu, setShowShareMenu] = useState(false);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setSelectedText("");
    setButtonPos(null);
    setSubmitResult(null);
    setCommentText("");
    setShowShareMenu(false);
    // Clear the browser selection
    window.getSelection()?.removeAllRanges();
  }, []);

  /** Close the floating button when clicking outside */
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (showForm && formRef.current && !formRef.current.contains(e.target as Node)) {
        closeForm();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [showForm, closeForm]);

  /** Share quote to a specific platform */
  const handleShareToPlatform = useCallback(
    (platform: "whatsapp" | "linkedin" | "x") => {
      const url = typeof window !== "undefined" ? window.location.href : "";
      const artLabel =
        articleNumber != null ? `${t("common.art")} ${articleNumber}` : t("common.articlePrefix");
      const yearSuffix = year ? ` (${year})` : "";
      const shareText = `\u201E${selectedText}\u201D \u2014 ${artLabel}, ${t("common.appName")}${yearSuffix}\n${url}`;

      let shareUrl: string;
      switch (platform) {
        case "whatsapp":
          shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
          break;
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case "x":
          shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText.replace(`\n${url}`, ""))}&url=${encodeURIComponent(url)}`;
          break;
      }
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    },
    [selectedText, articleNumber, year, t],
  );

  function openForm() {
    setShowForm(true);
    setButtonPos(null);
    setSubmitResult(null);
    setCommentText("");
    setShowShareMenu(false);
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
        setSubmitResult({ type: "error", message: data.error || t("feedback.submitError") });
        return;
      }

      if (data.status === "rejected") {
        setSubmitResult({
          type: "rejected",
          message: data.rejectionReason || t("feedback.platformRules"),
        });
      } else {
        setSubmitResult({ type: "success", message: t("feedback.approved") });
        onCommentSubmitted?.();
        // Auto-close after success
        setTimeout(() => closeForm(), 2000);
      }
    } catch {
      setSubmitResult({ type: "error", message: t("feedback.networkRetry") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {children}

      {/* Floating feedback buttons — appears near selection */}
      {buttonPos && selectedText && !showForm && (
        <div
          className="absolute z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            top: `${buttonPos.top}px`,
            left: `${buttonPos.left}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex items-center gap-1 rounded-full bg-primary shadow-lg">
            <button
              type="button"
              onClick={openForm}
              className="inline-flex items-center gap-1.5 rounded-l-full pl-3 pr-2 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors whitespace-nowrap"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              {t("feedback.commentOnSelection")}
            </button>
            <div className="w-px h-4 bg-primary-foreground/30" />
            {!showShareMenu ? (
              <button
                type="button"
                onClick={() => setShowShareMenu(true)}
                className="inline-flex items-center gap-1.5 rounded-r-full pl-2 pr-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors whitespace-nowrap"
                title={t("common.shareQuote")}
                aria-label={t("common.shareQuote")}
              >
                <Share2 className="h-3.5 w-3.5" />
                {t("common.share")}
              </button>
            ) : (
              <div className="flex items-center gap-0.5 pr-1.5">
                <button
                  type="button"
                  onClick={() => handleShareToPlatform("whatsapp")}
                  className="rounded-md px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/80 transition-colors whitespace-nowrap"
                  title="WhatsApp"
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleShareToPlatform("x")}
                  className="rounded-md px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/80 transition-colors whitespace-nowrap"
                  title="X (Twitter)"
                >
                  X
                </button>
                <button
                  type="button"
                  onClick={() => handleShareToPlatform("linkedin")}
                  className="rounded-r-full px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/80 transition-colors whitespace-nowrap"
                  title="LinkedIn"
                >
                  LinkedIn
                </button>
              </div>
            )}
          </div>
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
              {t("feedback.commentOnSelectedText")}
            </h4>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full p-1 hover:bg-muted transition-colors"
              aria-label={t("common.close")}
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
              aria-label={t("feedback.selectedTextLabel")}
              placeholder={t("feedback.selectedTextPlaceholder")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[60px]"
              rows={2}
              disabled={submitting}
              /* biome-ignore lint/a11y/noAutofocus: intentional UX — focus textarea when inline form opens */
              autoFocus
            />

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{t("feedback.aiCheck")}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  aria-label={t("common.cancel")}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  aria-label={t("feedback.submitSelectionComment")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t("feedback.moderating")}
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      {t("feedback.submit")}
                    </>
                  )}
                </button>
              </div>
            </div>

            {submitResult && (
              <div
                className={`mt-2 rounded-md px-3 py-2 text-xs ${
                  submitResult.type === "success"
                    ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"
                    : submitResult.type === "rejected"
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "bg-destructive/10 text-destructive"
                }`}
              >
                {submitResult.type === "rejected" && <strong>{t("feedback.rejectedLabel")}</strong>}
                {submitResult.message}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
