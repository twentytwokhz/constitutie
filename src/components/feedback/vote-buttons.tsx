"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface VoteButtonsProps {
  articleId: number;
  initialAgreeCount: number;
  initialDisagreeCount: number;
}

/**
 * Generate a simple browser fingerprint for vote deduplication.
 * Not cryptographic — just prevents casual double-voting.
 */
function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ];
  // Simple hash
  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

export function VoteButtons({
  articleId,
  initialAgreeCount,
  initialDisagreeCount,
}: VoteButtonsProps) {
  const [agreeCount, setAgreeCount] = useState(initialAgreeCount);
  const [disagreeCount, setDisagreeCount] = useState(initialDisagreeCount);
  const [userVote, setUserVote] = useState<"agree" | "disagree" | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user already voted (stored in localStorage)
  useEffect(() => {
    const stored = localStorage.getItem(`vote_${articleId}`);
    if (stored === "agree" || stored === "disagree") {
      setUserVote(stored);
    }
  }, [articleId]);

  const handleVote = useCallback(
    async (voteType: "agree" | "disagree") => {
      if (userVote || isVoting) return;

      setIsVoting(true);
      setError(null);

      try {
        const fingerprint = generateFingerprint();
        const response = await fetch(`/api/articles/${articleId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voteType, fingerprintHash: fingerprint }),
        });

        if (response.ok) {
          setUserVote(voteType);
          localStorage.setItem(`vote_${articleId}`, voteType);
          if (voteType === "agree") {
            setAgreeCount((prev) => prev + 1);
          } else {
            setDisagreeCount((prev) => prev + 1);
          }
        } else if (response.status === 409) {
          // Already voted from this fingerprint
          setUserVote(voteType);
          localStorage.setItem(`vote_${articleId}`, voteType);
        } else {
          const data = await response.json();
          setError(data.error || "Eroare la votare");
        }
      } catch {
        setError("Eroare de rețea");
      } finally {
        setIsVoting(false);
      }
    },
    [articleId, userVote, isVoting],
  );

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => handleVote("agree")}
        disabled={userVote !== null || isVoting}
        className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
          userVote === "agree"
            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-700"
            : userVote !== null
              ? "border-border text-muted-foreground cursor-not-allowed opacity-50"
              : "border-border hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-400"
        }`}
        aria-label="De acord"
      >
        <ThumbsUp className="h-4 w-4" />
        <span>De acord</span>
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
          {agreeCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleVote("disagree")}
        disabled={userVote !== null || isVoting}
        className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
          userVote === "disagree"
            ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-700"
            : userVote !== null
              ? "border-border text-muted-foreground cursor-not-allowed opacity-50"
              : "border-border hover:border-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950 dark:hover:text-rose-400"
        }`}
        aria-label="Dezacord"
      >
        <ThumbsDown className="h-4 w-4" />
        <span>Dezacord</span>
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
          {disagreeCount}
        </span>
      </button>

      {isVoting && (
        <span className="text-xs text-muted-foreground animate-pulse">Se votează...</span>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
