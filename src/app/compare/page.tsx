"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { diffWords } from "diff";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

/** Constitution version metadata from the API */
interface Version {
  id: number;
  year: number;
  name: string;
  totalArticles: number;
}

/** Diff result for a single article */
interface DiffArticle {
  articleNumber: number;
  status: "added" | "removed" | "modified" | "unchanged";
  a: { title: string | null; content: string } | null;
  b: { title: string | null; content: string } | null;
}

/** Full diff API response */
interface DiffResponse {
  a: number;
  b: number;
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
  diff: DiffArticle[];
}

/**
 * Version Comparison (Diff) Page
 *
 * Route: /compare
 *
 * Features:
 * - Version A (left) and Version B (right) selectors
 * - Summary bar with change statistics
 * - Article-level diff display with color-coded changes
 * - Collapsible unchanged sections
 */
export default function ComparePage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionA, setVersionA] = useState<string>("");
  const [versionB, setVersionB] = useState<string>("");
  const [diffData, setDiffData] = useState<DiffResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnchanged, setShowUnchanged] = useState(false);

  // Fetch available versions on mount
  useEffect(() => {
    async function fetchVersions() {
      try {
        const res = await fetch("/api/versions");
        if (!res.ok) throw new Error("Failed to fetch versions");
        const data: Version[] = await res.json();
        setVersions(data);

        // Default selection: first two versions
        if (data.length >= 2) {
          setVersionA(String(data[0].year));
          setVersionB(String(data[data.length - 1].year));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load versions");
      } finally {
        setVersionsLoading(false);
      }
    }
    fetchVersions();
  }, []);

  // Fetch diff when both versions are selected
  const fetchDiff = useCallback(async (a: string, b: string) => {
    if (!a || !b || a === b) {
      setDiffData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/diff?a=${a}&b=${b}`);
      if (!res.ok) throw new Error("Failed to compute diff");
      const data: DiffResponse = await res.json();
      setDiffData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load diff");
      setDiffData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch diff when selections change
  useEffect(() => {
    if (versionA && versionB && versionA !== versionB) {
      fetchDiff(versionA, versionB);
    }
  }, [versionA, versionB, fetchDiff]);

  /** Swap the two version selections */
  const handleSwap = () => {
    const tmpA = versionA;
    setVersionA(versionB);
    setVersionB(tmpA);
  };

  /** Get status color classes */
  const statusColor = (status: DiffArticle["status"]) => {
    switch (status) {
      case "added":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400";
      case "removed":
        return "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400";
      case "modified":
        return "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400";
      default:
        return "bg-muted/50 border-border text-muted-foreground";
    }
  };

  /** Get status label in Romanian */
  const statusLabel = (status: DiffArticle["status"]) => {
    switch (status) {
      case "added":
        return "Adăugat";
      case "removed":
        return "Eliminat";
      case "modified":
        return "Modificat";
      default:
        return "Neschimbat";
    }
  };

  const changedArticles = diffData?.diff.filter((d) => d.status !== "unchanged") ?? [];
  const unchangedArticles = diffData?.diff.filter((d) => d.status === "unchanged") ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Compară Versiuni</h1>
        <p className="mt-2 text-muted-foreground">
          Selectează două versiuni ale Constituției pentru a vedea diferențele articol cu articol.
        </p>
      </div>

      {/* Version Selectors Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        {/* Version A (left) */}
        <div className="flex-1">
          <label
            htmlFor="version-a"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            Versiunea A (stânga)
          </label>
          <Select value={versionA} onValueChange={setVersionA} disabled={versionsLoading}>
            <SelectTrigger id="version-a" className="w-full">
              <SelectValue placeholder="Alege versiunea A" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v.year} value={String(v.year)}>
                  {v.name} ({v.totalArticles} articole)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Swap button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleSwap}
          className="shrink-0 self-end"
          aria-label="Inversează versiunile"
          title="Inversează versiunile"
          disabled={!versionA || !versionB}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        {/* Version B (right) */}
        <div className="flex-1">
          <label
            htmlFor="version-b"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            Versiunea B (dreapta)
          </label>
          <Select value={versionB} onValueChange={setVersionB} disabled={versionsLoading}>
            <SelectTrigger id="version-b" className="w-full">
              <SelectValue placeholder="Alege versiunea B" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v.year} value={String(v.year)}>
                  {v.name} ({v.totalArticles} articole)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Same version warning */}
      {versionA && versionB && versionA === versionB && (
        <div className="mb-6 rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
          Selectează două versiuni diferite pentru a vedea diferențele.
        </div>
      )}

      {/* Summary Bar */}
      {diffData && (
        <div className="mb-6 flex flex-wrap gap-3">
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400">
            <Plus className="mr-1 h-3 w-3" />
            {diffData.summary.added} adăugate
          </Badge>
          <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-400">
            <Minus className="mr-1 h-3 w-3" />
            {diffData.summary.removed} eliminate
          </Badge>
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400">
            <FileText className="mr-1 h-3 w-3" />
            {diffData.summary.modified} modificate
          </Badge>
          <Badge variant="secondary">{diffData.summary.unchanged} neschimbate</Badge>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Se calculează diferențele...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Diff Results */}
      {diffData && !loading && (
        <div className="space-y-3">
          {/* Changed articles */}
          {changedArticles.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">
                Articole modificate ({changedArticles.length})
              </h2>
              {changedArticles.map((article) => (
                <DiffArticleCard
                  key={article.articleNumber}
                  article={article}
                  statusColor={statusColor}
                  statusLabel={statusLabel}
                  yearA={versionA}
                  yearB={versionB}
                />
              ))}
            </div>
          )}

          {/* Unchanged articles toggle */}
          {unchangedArticles.length > 0 && (
            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowUnchanged(!showUnchanged)}
                className="text-muted-foreground"
              >
                {showUnchanged ? (
                  <ChevronUp className="mr-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="mr-2 h-4 w-4" />
                )}
                {showUnchanged ? "Ascunde" : "Arată"} {unchangedArticles.length} articole
                neschimbate
              </Button>
              {showUnchanged && (
                <div className="mt-3 space-y-2">
                  {unchangedArticles.map((article) => (
                    <div
                      key={article.articleNumber}
                      className="rounded-md border border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground"
                    >
                      Articolul {article.articleNumber}
                      {article.a?.title && ` — ${article.a.title}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No changes state */}
          {changedArticles.length === 0 && unchangedArticles.length > 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Nu există diferențe între cele două versiuni selectate.
            </div>
          )}
        </div>
      )}

      {/* Empty state - no selections */}
      {!diffData && !loading && !error && !versionA && !versionB && (
        <div className="py-20 text-center text-muted-foreground">
          <FileText className="mx-auto mb-4 h-12 w-12 opacity-30" />
          <p className="text-lg">Selectează două versiuni pentru a începe comparația.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Compute inline diff between two strings and return React nodes for each side.
 * Left side highlights removed words in red; right side highlights added words in green.
 */
function useInlineDiff(
  textA: string | undefined,
  textB: string | undefined,
): { left: ReactNode; right: ReactNode } {
  return useMemo(() => {
    if (!textA && !textB) return { left: null, right: null };
    if (!textA)
      return {
        left: null,
        right: <span className="bg-emerald-500/20 rounded px-0.5">{textB}</span>,
      };
    if (!textB)
      return {
        left: <span className="bg-rose-500/20 rounded px-0.5">{textA}</span>,
        right: null,
      };

    const changes = diffWords(textA, textB);
    const leftParts: ReactNode[] = [];
    const rightParts: ReactNode[] = [];

    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const key = i;
      if (change.added) {
        rightParts.push(
          <span
            key={key}
            className="bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 rounded px-0.5"
          >
            {change.value}
          </span>,
        );
      } else if (change.removed) {
        leftParts.push(
          <span
            key={key}
            className="bg-rose-500/20 text-rose-900 dark:text-rose-300 rounded px-0.5 line-through decoration-rose-400/50"
          >
            {change.value}
          </span>,
        );
      } else {
        leftParts.push(<span key={key}>{change.value}</span>);
        rightParts.push(<span key={key}>{change.value}</span>);
      }
    }

    return { left: <>{leftParts}</>, right: <>{rightParts}</> };
  }, [textA, textB]);
}

/** Individual diff article card with side-by-side content and inline diff */
function DiffArticleCard({
  article,
  statusColor,
  statusLabel,
  yearA,
  yearB,
}: {
  article: DiffArticle;
  statusColor: (status: DiffArticle["status"]) => string;
  statusLabel: (status: DiffArticle["status"]) => string;
  yearA: string;
  yearB: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { left: diffLeft, right: diffRight } = useInlineDiff(
    article.a?.content,
    article.b?.content,
  );

  /** Status-specific icon */
  const statusIcon = (status: DiffArticle["status"]) => {
    switch (status) {
      case "added":
        return <Plus className="h-3.5 w-3.5" />;
      case "removed":
        return <Minus className="h-3.5 w-3.5" />;
      default:
        return <FileText className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className={`rounded-lg border ${statusColor(article.status)} overflow-hidden`}>
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold">
            {statusIcon(article.status)}
            Articolul {article.articleNumber}
          </span>
          {(article.a?.title || article.b?.title) && (
            <span className="text-sm opacity-80">{article.a?.title || article.b?.title}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider opacity-70">
            {statusLabel(article.status)}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 opacity-50" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )}
        </div>
      </button>

      {/* Expanded content - side by side with inline diff */}
      {expanded && (
        <div className="border-t border-inherit">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-inherit">
            {/* Version A content (left) */}
            <div className="p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-60">
                {yearA}
              </div>
              {article.a ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {article.status === "modified" ? diffLeft : article.a.content}
                </div>
              ) : (
                <div className="flex items-center gap-2 italic text-sm opacity-50 py-4">
                  <Plus className="h-4 w-4" />
                  Nu există în această versiune
                </div>
              )}
            </div>

            {/* Version B content (right) */}
            <div className="p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-60">
                {yearB}
              </div>
              {article.b ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {article.status === "modified" ? diffRight : article.b.content}
                </div>
              ) : (
                <div className="flex items-center gap-2 italic text-sm opacity-50 py-4">
                  <Minus className="h-4 w-4" />
                  Eliminat din această versiune
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
