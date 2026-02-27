"use client";

import { MessageSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Comment {
  id: number;
  articleId: number;
  content: string;
  selectedText: string | null;
  status: string;
  createdAt: string;
}

/**
 * CommentsSection
 *
 * Displays approved comments under an article, sorted by date (newest first).
 * Fetches from GET /api/articles/[id]/comments which returns only approved comments.
 */
export function CommentsSection({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comentarii
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
        )}
      </h3>

      {comments.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Niciun comentariu încă. Fii primul care comentează!
        </p>
      ) : (
        <div className="mt-3 space-y-3">
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
