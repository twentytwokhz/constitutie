"use client";

import { MonacoDiffViewer } from "@/components/diff/monaco-diff-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Columns2,
  Download,
  FileText,
  Filter,
  Loader2,
  Minus,
  Plus,
  Rows2,
  Share2,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

/** Constitution version metadata from the API */
interface Version {
  id: number;
  year: number;
  name: string;
  nameEn: string | null;
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

/** Single article diff API response from /api/diff/article */
interface SingleArticleDiffResponse {
  a: number;
  b: number;
  articleNumber: number;
  articleA: { title: string | null; content: string } | null;
  articleB: { title: string | null; content: string } | null;
  exists: { inA: boolean; inB: boolean };
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
 * - Side-by-side / unified diff toggle
 */
export function ComparePageClient() {
  const t = useTranslations();
  const locale = useLocale();
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionA, setVersionA] = useState<string>("");
  const [versionB, setVersionB] = useState<string>("");
  const [diffData, setDiffData] = useState<DiffResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnchanged, setShowUnchanged] = useState(false);
  const [sideBySide, setSideBySide] = useState(true);
  const [currentChangeIdx, setCurrentChangeIdx] = useState(-1);
  /** Force-expand a card from parent when jumping to it */
  const [forceExpandArticle, setForceExpandArticle] = useState<number | null>(null);
  /** Selected article number for single-article diff mode */
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  /** Single-article diff data */
  const [singleDiffData, setSingleDiffData] = useState<SingleArticleDiffResponse | null>(null);
  /** Loading state for single-article diff */
  const [singleDiffLoading, setSingleDiffLoading] = useState(false);
  /** PDF export loading state */
  const [exportingPdf, setExportingPdf] = useState(false);
  /** Guard ref for preventing double export clicks */
  const isExportingRef = useRef(false);

  // Fetch available versions on mount
  useEffect(() => {
    async function fetchVersions() {
      try {
        const res = await fetch("/api/versions");
        if (!res.ok) throw new Error("Failed to fetch versions");
        const data: Version[] = await res.json();
        setVersions(data);

        // Default selection: oldest version (A) vs. last-browsed version (B).
        // The header VersionSelector persists the active year in localStorage
        // so the compare page can pick it up as a sensible default.
        if (data.length >= 2) {
          const sortedYears = data.map((v) => v.year).sort((a, b) => a - b);
          setVersionA(String(sortedYears[0]));

          // Try to use the last-viewed year from the reader as version B
          let defaultB: string | null = null;
          try {
            defaultB = localStorage.getItem("lastViewedYear");
          } catch {
            // localStorage unavailable
          }

          // Use last-viewed year if it exists, is a valid version, and
          // differs from version A; otherwise fall back to the newest version.
          const fallbackB = String(sortedYears[sortedYears.length - 1]);
          if (
            defaultB !== null &&
            sortedYears.includes(Number(defaultB)) &&
            defaultB !== String(sortedYears[0])
          ) {
            setVersionB(defaultB);
          } else {
            setVersionB(fallbackB);
          }
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
  const fetchDiff = useCallback(
    async (a: string, b: string) => {
      if (!a || !b || a === b) {
        setDiffData(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/diff?a=${a}&b=${b}&locale=${locale}`);
        if (!res.ok) throw new Error("Failed to compute diff");
        const data: DiffResponse = await res.json();
        setDiffData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load diff");
        setDiffData(null);
      } finally {
        setLoading(false);
      }
    },
    [locale],
  );

  // Re-fetch diff when selections change — reset ALL comparison state
  useEffect(() => {
    if (versionA && versionB && versionA !== versionB) {
      // Clear stale data immediately before fetching new comparison
      setDiffData(null);
      setSelectedArticle(null);
      setSingleDiffData(null);
      setCurrentChangeIdx(-1);
      setShowUnchanged(false);
      setForceExpandArticle(null);
      fetchDiff(versionA, versionB);
    }
  }, [versionA, versionB, fetchDiff]);

  /** Fetch diff for a specific article via /api/diff/article */
  const fetchSingleArticleDiff = useCallback(
    async (articleNum: number) => {
      if (!versionA || !versionB || versionA === versionB) return;
      setSingleDiffLoading(true);
      try {
        const res = await fetch(
          `/api/diff/article?a=${versionA}&b=${versionB}&article=${articleNum}&locale=${locale}`,
        );
        if (!res.ok) throw new Error("Failed to fetch article diff");
        const data: SingleArticleDiffResponse = await res.json();
        setSingleDiffData(data);
      } catch {
        setSingleDiffData(null);
      } finally {
        setSingleDiffLoading(false);
      }
    },
    [versionA, versionB, locale],
  );

  // Fetch single article diff when selection changes
  useEffect(() => {
    if (selectedArticle !== null) {
      fetchSingleArticleDiff(selectedArticle);
    } else {
      setSingleDiffData(null);
    }
  }, [selectedArticle, fetchSingleArticleDiff]);

  /** Handle selecting an article for individual diff */
  const handleArticleSelect = (articleNum: string) => {
    if (articleNum === "all") {
      setSelectedArticle(null);
    } else {
      setSelectedArticle(Number(articleNum));
    }
  };

  /** Clear article selection */
  const clearArticleSelection = () => {
    setSelectedArticle(null);
    setSingleDiffData(null);
  };

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
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300";
      case "removed":
        return "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300";
      case "modified":
        return "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300";
      default:
        return "bg-muted/50 border-border text-muted-foreground";
    }
  };

  /** Get status label via translations */
  const statusLabel = (status: DiffArticle["status"]) => {
    switch (status) {
      case "added":
        return t("compare.statusAdded");
      case "removed":
        return t("compare.statusRemoved");
      case "modified":
        return t("compare.statusModified");
      default:
        return t("compare.statusUnchanged");
    }
  };

  const changedArticles = diffData?.diff.filter((d) => d.status !== "unchanged") ?? [];
  const unchangedArticles = diffData?.diff.filter((d) => d.status === "unchanged") ?? [];

  /** Scroll to a changed article by index and auto-expand it */
  const jumpToChange = useCallback(
    (idx: number) => {
      if (changedArticles.length === 0) return;
      const clampedIdx = Math.max(0, Math.min(idx, changedArticles.length - 1));
      setCurrentChangeIdx(clampedIdx);
      const articleNum = changedArticles[clampedIdx].articleNumber;
      setForceExpandArticle(articleNum);
      // Scroll after a tick to let expansion render
      requestAnimationFrame(() => {
        const el = document.getElementById(`diff-change-${articleNum}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    },
    [changedArticles],
  );

  const jumpToNextChange = useCallback(() => {
    const next = currentChangeIdx < changedArticles.length - 1 ? currentChangeIdx + 1 : 0;
    jumpToChange(next);
  }, [currentChangeIdx, changedArticles.length, jumpToChange]);

  const jumpToPrevChange = useCallback(() => {
    const prev = currentChangeIdx > 0 ? currentChangeIdx - 1 : changedArticles.length - 1;
    jumpToChange(prev);
  }, [currentChangeIdx, changedArticles.length, jumpToChange]);

  /** Export diff as PDF via /api/diff/export-pdf */
  const handleExportPdf = useCallback(async () => {
    if (isExportingRef.current || !diffData) return;
    isExportingRef.current = true;
    setExportingPdf(true);
    try {
      const res = await fetch("/api/diff/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yearA: Number(versionA),
          yearB: Number(versionB),
          summary: diffData.summary,
          articles: diffData.diff,
          locale,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || "PDF export error");
      }
      // Create blob and trigger download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        locale === "en"
          ? `constitution-comparison-${versionA}-vs-${versionB}.pdf`
          : `constitutia-comparatie-${versionA}-vs-${versionB}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[PDF Export]", err);
      setError(err instanceof Error ? err.message : "PDF export error");
    } finally {
      setExportingPdf(false);
      isExportingRef.current = false;
    }
  }, [diffData, versionA, versionB, locale]);

  /** Share the comparison URL */
  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareTitle = `${t("compare.title")}: ${versionA} vs ${versionB}`;
    const shareText = `${shareTitle}\n${url}`;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
        return;
      } catch {
        // User cancelled — fall through
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Silent fallback
    }
  }, [versionA, versionB, t]);

  /** Ref for the scrollable content area — used by jumpToChange */
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /** Keyboard shortcuts: Alt+↓ next change, Alt+↑ previous change */
  useEffect(() => {
    if (changedArticles.length === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowDown") {
        e.preventDefault();
        jumpToNextChange();
      } else if (e.altKey && e.key === "ArrowUp") {
        e.preventDefault();
        jumpToPrevChange();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [changedArticles.length, jumpToNextChange, jumpToPrevChange]);

  return (
    <div className="flex flex-col h-[calc(100vh-67px)] overflow-hidden">
      {/* ── Sticky controls panel (does NOT scroll) ── */}
      <div className="shrink-0 border-b border-border/40 bg-background px-3 pt-4 pb-3 sm:px-4">
        <div className="container mx-auto max-w-full">
          {/* Page Title */}
          <div className="mb-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("compare.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {t("compare.subtitle")}
            </p>
          </div>

          {/* Version Selectors Toolbar */}
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            {/* Version A (left) */}
            <div className="flex-1">
              <label
                htmlFor="version-a"
                className="mb-1.5 block text-sm font-medium text-muted-foreground"
              >
                {t("compare.selectVersionA")}
              </label>
              <Select value={versionA} onValueChange={setVersionA} disabled={versionsLoading}>
                <SelectTrigger id="version-a" className="w-full">
                  <SelectValue placeholder={t("compare.placeholderA")} />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.year} value={String(v.year)}>
                      {locale === "en" && v.nameEn ? v.nameEn : v.name} ({v.totalArticles}{" "}
                      {t("common.articles")})
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
              aria-label={t("compare.swapVersions")}
              title={t("compare.swapVersions")}
              disabled={!versionA || !versionB}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            {/* Version B (right) */}
            <div className="flex-1">
              <label
                htmlFor="version-b"
                className="mb-1.5 block text-sm font-medium text-muted-foreground"
              >
                {t("compare.selectVersionB")}
              </label>
              <Select value={versionB} onValueChange={setVersionB} disabled={versionsLoading}>
                <SelectTrigger id="version-b" className="w-full">
                  <SelectValue placeholder={t("compare.placeholderB")} />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.year} value={String(v.year)}>
                      {locale === "en" && v.nameEn ? v.nameEn : v.name} ({v.totalArticles}{" "}
                      {t("common.articles")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Same version warning */}
          {versionA && versionB && versionA === versionB && (
            <div className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
              {t("compare.selectDifferent")}
            </div>
          )}

          {/* View Mode Toggle + Summary */}
          {diffData && !loading && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-800 border-emerald-500/30 dark:text-emerald-300">
                    <Plus className="mr-1 h-3 w-3" />
                    {diffData.summary.added} {t("compare.added")}
                  </Badge>
                  <Badge className="bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300">
                    <Minus className="mr-1 h-3 w-3" />
                    {diffData.summary.removed} {t("compare.removed")}
                  </Badge>
                  <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300">
                    <FileText className="mr-1 h-3 w-3" />
                    {diffData.summary.modified} {t("compare.modified")}
                  </Badge>
                  <Badge variant="secondary">
                    {diffData.summary.unchanged} {t("compare.unchanged")}
                  </Badge>
                </div>
                {/* Jump to change navigation */}
                {changedArticles.length > 0 && !selectedArticle && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={jumpToPrevChange}
                      className="h-7 gap-1 px-2.5 text-xs"
                      title={`${t("compare.prevChange")} (Alt+\u2191)`}
                      aria-label={t("compare.prevChange")}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t("common.previous")}</span>
                    </Button>
                    <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-muted-foreground">
                      {currentChangeIdx >= 0
                        ? `${currentChangeIdx + 1} / ${changedArticles.length}`
                        : `${changedArticles.length} ${t("compare.changes")}`}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={jumpToNextChange}
                      className="h-7 gap-1 px-2.5 text-xs"
                      title={`${t("compare.nextChange")} (Alt+\u2193)`}
                      aria-label={t("compare.nextChange")}
                    >
                      <span className="hidden sm:inline">{t("common.next")}</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
                    <Button
                      variant={sideBySide ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSideBySide(true)}
                      className="h-7 gap-1.5 px-2.5 text-xs"
                    >
                      <Columns2 className="h-3.5 w-3.5" />
                      {t("compare.sideBySide")}
                    </Button>
                    <Button
                      variant={!sideBySide ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSideBySide(false)}
                      className="h-7 gap-1.5 px-2.5 text-xs"
                    >
                      <Rows2 className="h-3.5 w-3.5" />
                      {t("compare.inline")}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPdf}
                    disabled={exportingPdf || !diffData}
                    className="h-7 gap-1.5 px-3 text-xs"
                    title={t("compare.exportPdf")}
                  >
                    {exportingPdf ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {exportingPdf ? t("compare.exporting") : t("compare.exportPdf")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="h-7 gap-1.5 px-3 text-xs"
                    title={t("compare.shareComparison")}
                    aria-label={t("compare.shareComparison")}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {t("common.share")}
                  </Button>
                </div>
              </div>

              {/* Article-level navigation: filter to a specific article */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t("compare.specificArticle")}
                </span>
                <Select
                  value={selectedArticle !== null ? String(selectedArticle) : "all"}
                  onValueChange={handleArticleSelect}
                >
                  <SelectTrigger className="h-8 w-[240px] text-sm">
                    <SelectValue placeholder={t("compare.allArticles")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">{t("compare.allArticles")}</SelectItem>
                    {diffData.diff.map((article) => (
                      <SelectItem key={article.articleNumber} value={String(article.articleNumber)}>
                        {t("common.art")} {article.articleNumber}
                        {article.a?.title || article.b?.title
                          ? ` — ${article.a?.title || article.b?.title}`
                          : ""}
                        {article.status !== "unchanged" ? ` (${statusLabel(article.status)})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedArticle !== null && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearArticleSelection}
                    className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title={t("compare.showAllArticles")}
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("common.reset")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable content area (only this part scrolls) ── */}
      {/* min-h-0 overrides flexbox default min-height:auto so overflow-y-auto activates */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-4 sm:px-4">
        <div className="container mx-auto max-w-full">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">{t("compare.computing")}</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Single article diff loading */}
          {singleDiffLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">{t("compare.loadingArticleDiff")}</span>
            </div>
          )}

          {/* Single article diff mode */}
          {selectedArticle !== null && singleDiffData && !singleDiffLoading && diffData && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">
                {t("common.articlePrefix")} {singleDiffData.articleNumber}
                {(singleDiffData.articleA?.title || singleDiffData.articleB?.title) && (
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    {singleDiffData.articleA?.title || singleDiffData.articleB?.title}
                  </span>
                )}
              </h2>

              {/* Show presence info */}
              <div className="flex gap-2 text-sm">
                <Badge
                  variant={singleDiffData.exists.inA ? "default" : "secondary"}
                  className={singleDiffData.exists.inA ? "" : "opacity-50"}
                >
                  {versionA}:{" "}
                  {singleDiffData.exists.inA ? t("common.exists") : t("common.doesNotExist")}
                </Badge>
                <Badge
                  variant={singleDiffData.exists.inB ? "default" : "secondary"}
                  className={singleDiffData.exists.inB ? "" : "opacity-50"}
                >
                  {versionB}:{" "}
                  {singleDiffData.exists.inB ? t("common.exists") : t("common.doesNotExist")}
                </Badge>
              </div>

              {/* Diff content */}
              {singleDiffData.exists.inA && singleDiffData.exists.inB ? (
                <div className="rounded-lg border overflow-hidden">
                  {sideBySide && (
                    <div className="grid grid-cols-2 border-b text-xs font-semibold uppercase tracking-wider opacity-60">
                      <div className="px-4 py-1.5 border-r">{versionA}</div>
                      <div className="px-4 py-1.5">{versionB}</div>
                    </div>
                  )}
                  {!sideBySide && (
                    <div className="border-b text-xs font-semibold uppercase tracking-wider opacity-60 px-4 py-1.5">
                      {versionA} → {versionB}
                    </div>
                  )}
                  <MonacoDiffViewer
                    original={singleDiffData.articleA?.content || ""}
                    modified={singleDiffData.articleB?.content || ""}
                    sideBySide={sideBySide}
                  />
                </div>
              ) : (
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-60">
                    {singleDiffData.exists.inA
                      ? `${versionA} (${t("compare.removedIn")} ${versionB})`
                      : `${versionB} (${t("compare.addedIn")})`}
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-background/50 rounded p-3 border">
                    {singleDiffData.exists.inA
                      ? singleDiffData.articleA?.content
                      : singleDiffData.articleB?.content}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full diff results (all articles) - shown when no single article selected */}
          {diffData && !loading && selectedArticle === null && (
            <div className="space-y-3">
              {/* Changed articles */}
              {changedArticles.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">
                    {t("compare.changedArticles")} ({changedArticles.length})
                  </h2>
                  {changedArticles.map((article, idx) => (
                    <DiffArticleCard
                      key={article.articleNumber}
                      article={article}
                      statusColor={statusColor}
                      statusLabel={statusLabel}
                      yearA={versionA}
                      yearB={versionB}
                      sideBySide={sideBySide}
                      forceExpand={forceExpandArticle === article.articleNumber}
                      onForceExpandHandled={() => setForceExpandArticle(null)}
                      isActive={currentChangeIdx === idx}
                    />
                  ))}
                </div>
              )}

              {/* Unchanged articles - collapsed by default */}
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
                    {showUnchanged ? t("common.hide") : t("common.showAll")}{" "}
                    {unchangedArticles.length} {t("common.unchangedArticles")}
                  </Button>
                  {showUnchanged && (
                    <div className="mt-3 space-y-2">
                      {unchangedArticles.map((article) => (
                        <UnchangedArticleCard key={article.articleNumber} article={article} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No changes state */}
              {changedArticles.length === 0 && unchangedArticles.length > 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {t("compare.noChanges")}
                </div>
              )}
            </div>
          )}

          {/* Empty state - no selections */}
          {!diffData && !loading && !error && !versionA && !versionB && (
            <div className="py-20 text-center text-muted-foreground">
              <FileText className="mx-auto mb-4 h-12 w-12 opacity-30" />
              <p className="text-lg">{t("compare.selectVersions")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Individual diff article card with Monaco DiffEditor */
function DiffArticleCard({
  article,
  statusColor,
  statusLabel,
  yearA,
  yearB,
  sideBySide,
  forceExpand,
  onForceExpandHandled,
  isActive,
}: {
  article: DiffArticle;
  statusColor: (status: DiffArticle["status"]) => string;
  statusLabel: (status: DiffArticle["status"]) => string;
  yearA: string;
  yearB: string;
  sideBySide: boolean;
  forceExpand?: boolean;
  onForceExpandHandled?: () => void;
  isActive?: boolean;
}) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);

  /** Auto-expand when parent triggers a jump-to-change */
  useEffect(() => {
    if (forceExpand) {
      setExpanded(true);
      onForceExpandHandled?.();
    }
  }, [forceExpand, onForceExpandHandled]);

  const originalText = article.a?.content || "";
  const modifiedText = article.b?.content || "";
  const isOnlyOneSide = article.status === "added" || article.status === "removed";

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
    <div
      id={`diff-change-${article.articleNumber}`}
      className={`rounded-lg border ${statusColor(article.status)} overflow-hidden transition-shadow ${isActive ? "ring-2 ring-primary/50 shadow-lg" : ""}`}
    >
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            {statusIcon(article.status)}
            <span className="font-semibold">
              {t("common.articlePrefix")} {article.articleNumber}
            </span>
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

      {/* Expanded content - Monaco DiffEditor */}
      {expanded && (
        <div className="border-t border-inherit">
          {isOnlyOneSide ? (
            <div className="p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-60">
                {article.status === "added"
                  ? `${yearB} (${t("compare.addedIn")})`
                  : `${yearA} (${t("compare.statusRemoved")})`}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-background/50 rounded p-3 border border-inherit">
                {article.status === "added" ? modifiedText : originalText}
              </div>
            </div>
          ) : (
            <div>
              {sideBySide && (
                <div className="grid grid-cols-2 border-b border-inherit text-xs font-semibold uppercase tracking-wider opacity-60">
                  <div className="px-4 py-1.5 border-r border-inherit">{yearA}</div>
                  <div className="px-4 py-1.5">{yearB}</div>
                </div>
              )}
              {!sideBySide && (
                <div className="border-b border-inherit text-xs font-semibold uppercase tracking-wider opacity-60 px-4 py-1.5">
                  {yearA} → {yearB}
                </div>
              )}
              <MonacoDiffViewer
                original={originalText}
                modified={modifiedText}
                sideBySide={sideBySide}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Expandable card for an unchanged article - shows full content when expanded */
function UnchangedArticleCard({ article }: { article: DiffArticle }) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const content = article.a?.content || article.b?.content || "";

  return (
    <div className="rounded-md border border-border bg-muted/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-muted-foreground hover:bg-accent/20 transition-colors"
      >
        <span>
          <span className="font-medium">
            {t("common.articlePrefix")} {article.articleNumber}
          </span>
          {article.a?.title && <span className="ml-1 opacity-70">— {article.a.title}</span>}
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 opacity-50" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        )}
      </button>
      {expanded && content && (
        <div className="border-t border-border px-4 py-3">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
