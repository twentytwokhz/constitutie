"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  MessageSquare,
  Send,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Comment {
  id: number;
  articleId: number;
  content: string;
  selectedText: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
}

/**
 * CommentsSection
 *
 * Displays approved comments under an article, sorted by date (newest first).
 * Fetches from GET /api/articles/[id]/comments which returns only approved comments.
 */
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
    hash |= 0; // Convert to 32bit integer
  }
  return `fp-${Math.abs(hash).toString(36)}`;
}

/**
 * Track recently submitted comment content in sessionStorage to prevent
 * duplicate submissions after browser back/forward navigation.
 * Returns true if the content was already submitted recently.
 */
function isDuplicateSubmission(articleId: number, content: string): boolean {
  const key = `submitted_comments_${articleId}`;
  try {
    const stored = sessionStorage.getItem(key);
    const submissions: { content: string; timestamp: number }[] = stored ? JSON.parse(stored) : [];
    // Clean up entries older than 5 minutes
    const cutoff = Date.now() - 5 * 60 * 1000;
    const recent = submissions.filter((s) => s.timestamp > cutoff);
    return recent.some((s) => s.content === content);
  } catch {
    return false;
  }
}

/** Record a successful submission in sessionStorage for dedup tracking. */
function recordSubmission(articleId: number, content: string): void {
  const key = `submitted_comments_${articleId}`;
  try {
    const stored = sessionStorage.getItem(key);
    const submissions: { content: string; timestamp: number }[] = stored ? JSON.parse(stored) : [];
    const cutoff = Date.now() - 5 * 60 * 1000;
    const recent = submissions.filter((s) => s.timestamp > cutoff);
    recent.push({ content, timestamp: Date.now() });
    sessionStorage.setItem(key, JSON.stringify(recent));
  } catch {
    // sessionStorage unavailable — server-side dedup is the fallback
  }
}

export function CommentsSection({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false); // Synchronous guard against rapid double-clicks
  const [submitResult, setSubmitResult] = useState<{
    type: "success" | "rejected" | "error";
    message: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_COMMENT_LENGTH = 5000;

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/articles/${articleId}/comments`);
      if (!res.ok) {
        throw new Error(`Failed to fetch comments: ${res.status}`);
      }
      const data = await res.json();
      setComments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la încărcarea comentariilor");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /**
   * Format a timestamp to a human-readable Romanian date string.
   * Uses relative time for recent comments (< 7 days) and
   * absolute date for older comments (≥ 7 days).
   */
  function formatDate(dateStr: string): { relative: string; absolute: string } {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Full absolute date in Romanian locale (always available as tooltip)
    const absolute = date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Relative time for recent comments
    let relative: string;
    if (diffSec < 60) {
      relative = "acum câteva secunde";
    } else if (diffMin < 60) {
      relative = diffMin === 1 ? "acum 1 minut" : `acum ${diffMin} minute`;
    } else if (diffHours < 24) {
      relative = diffHours === 1 ? "acum 1 oră" : `acum ${diffHours} ore`;
    } else if (diffDays === 1) {
      relative = "ieri";
    } else if (diffDays < 7) {
      relative = `acum ${diffDays} zile`;
    } else {
      // Older than 7 days — use absolute date (without time for cleanliness)
      relative = date.toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    return { relative, absolute };
  }

  if (loading) {
    return (
      <div className="mt-8 space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentarii
        </h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentarii
        </h3>
        <p className="mt-2 text-sm text-destructive">{error}</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Synchronous ref check prevents race condition from rapid double-clicks
    // (React state updates are async, so submitting may not reflect yet)
    if (isSubmittingRef.current) return;
    const trimmedContent = newComment.trim();
    if (!trimmedContent) {
      setValidationError("Comentariul nu poate fi gol.");
      textareaRef.current?.focus();
      return;
    }
    if (trimmedContent.length > MAX_COMMENT_LENGTH) {
      setValidationError(
        `Comentariul depășește limita maximă de ${MAX_COMMENT_LENGTH.toLocaleString("ro-RO")} caractere.`,
      );
      textareaRef.current?.focus();
      return;
    }
    setValidationError(null);

    // Client-side dedup: prevent resubmission of same content after back/forward nav
    if (isDuplicateSubmission(articleId, trimmedContent)) {
      setSubmitResult({
        type: "success",
        message: "Acest comentariu a fost deja trimis.",
      });
      setNewComment("");
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const fingerprint = generateFingerprint();
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmedContent,
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
        // Track the submitted content to prevent back-button resubmission
        recordSubmission(articleId, trimmedContent);
        setSubmitResult({ type: "success", message: "Comentariul a fost adăugat cu succes!" });
        setNewComment("");
        // Refresh comments list to show the new comment
        fetchComments();
      }
    } catch {
      setSubmitResult({ type: "error", message: "Eroare de rețea. Încercați din nou." });
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comentarii
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
        )}
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          ref={textareaRef}
          value={newComment}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= MAX_COMMENT_LENGTH) {
              setNewComment(value);
            }
            if (validationError && value.trim()) {
              setValidationError(null);
            }
          }}
          maxLength={MAX_COMMENT_LENGTH}
          aria-label="Comentariu despre articol"
          placeholder="Scrie un comentariu constructiv despre acest articol..."
          className={`w-full rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 resize-y min-h-[80px] ${
            validationError || newComment.length >= MAX_COMMENT_LENGTH
              ? "border-destructive focus:ring-destructive"
              : newComment.length >= MAX_COMMENT_LENGTH * 0.9
                ? "border-amber-500 focus:ring-amber-500"
                : "border-border focus:ring-ring"
          }`}
          rows={3}
          disabled={submitting}
        />
        {validationError && (
          <p className="mt-1 text-sm text-destructive flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            {validationError}
          </p>
        )}
        {newComment.length >= MAX_COMMENT_LENGTH && (
          <p className="mt-1 text-sm text-destructive flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            Limita maximă de {MAX_COMMENT_LENGTH.toLocaleString("ro-RO")} caractere a fost atinsă.
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              Comentariul va fi verificat automat de AI înainte de publicare.
            </p>
            <span
              className={`text-xs tabular-nums ${
                newComment.length >= MAX_COMMENT_LENGTH
                  ? "text-destructive font-medium"
                  : newComment.length >= MAX_COMMENT_LENGTH * 0.9
                    ? "text-amber-600 dark:text-amber-400 font-medium"
                    : "text-muted-foreground"
              }`}
            >
              {newComment.length.toLocaleString("ro-RO")}/
              {MAX_COMMENT_LENGTH.toLocaleString("ro-RO")}
            </span>
          </div>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            aria-label="Trimite comentariul"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Se verifică...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Trimite
              </>
            )}
          </button>
        </div>
        {submitResult && (
          <div
            className={`mt-3 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
              submitResult.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : submitResult.type === "rejected"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {submitResult.type === "success" && (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            {submitResult.type === "rejected" && (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            {submitResult.type === "error" && <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <div>
              {submitResult.type === "rejected" && (
                <p className="font-semibold mb-1">Comentariul nu poate fi adăugat</p>
              )}
              <p>{submitResult.message}</p>
            </div>
          </div>
        )}
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 px-4 text-center">
          <MessageCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Niciun comentariu încă</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Fii primul care își exprimă opinia despre acest articol!
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/30"
            >
              {comment.selectedText && (
                <blockquote className="mb-2 border-l-2 border-primary/50 pl-3 text-sm italic text-muted-foreground">
                  &ldquo;{comment.selectedText}&rdquo;
                </blockquote>
              )}
              <p className="text-sm leading-relaxed">{comment.content}</p>
              <time
                dateTime={comment.createdAt}
                title={formatDate(comment.createdAt).absolute}
                className="mt-2 block text-xs text-muted-foreground"
              >
                {formatDate(comment.createdAt).relative}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
