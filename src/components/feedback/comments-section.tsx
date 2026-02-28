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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  /** Format a timestamp to a human-readable Romanian date string */
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    if (!newComment.trim() || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const fingerprint = generateFingerprint();
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
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
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Scrie un comentariu constructiv despre acest articol..."
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[80px]"
          rows={3}
          disabled={submitting}
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Comentariul va fi verificat automat de AI înainte de publicare.
          </p>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="mt-2 block text-xs text-muted-foreground"
              >
                {formatDate(comment.createdAt)}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
