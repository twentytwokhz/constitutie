"use client";

import { Clock, FileText, Lightbulb, Loader2, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { usePathname, useRouter } from "@/i18n/navigation";

const RECENT_SEARCHES_KEY = "constitution-recent-searches";
const MAX_RECENT_SEARCHES = 5;

/**
 * Build suggestion objects from translation keys.
 * Search terms stay in Romanian (they search Romanian content).
 * Labels are translated for the current locale.
 */
function useSuggestedSearches() {
  const t = useTranslations("search");
  return [
    { term: "drepturi fundamentale", label: t("sugFundamentalRights") },
    { term: "proprietate", label: t("sugProperty") },
    { term: "Art. 1", label: t("sugArticle1") },
    { term: "cetățeni", label: t("sugCitizens") },
    { term: "libertate", label: t("sugFreedom") },
    { term: "president", label: t("sugPresident") },
    { term: "parlament", label: t("sugParliament") },
    { term: "justiție", label: t("sugJustice") },
  ];
}

interface SearchResult {
  id: number;
  number: number;
  title: string | null;
  versionYear: number;
  snippet: string;
  slug: string;
}

/** Load recent search terms from localStorage */
function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
}

/** Save a search term to the recent searches list */
function saveRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed || trimmed.length < 2) return loadRecentSearches();
  const current = loadRecentSearches();
  // Remove duplicate (case-insensitive) and prepend
  const filtered = current.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
  const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable
  }
  return updated;
}

/** Remove a single term from recent searches */
function removeRecentSearch(term: string): string[] {
  const current = loadRecentSearches();
  const updated = current.filter((s) => s.toLowerCase() !== term.toLowerCase());
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

/**
 * Command Palette (⌘K / Ctrl+K)
 *
 * Opens as a modal dialog for instant search across all constitution versions.
 * Uses the /api/articles/search endpoint for full-text search.
 */
export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const suggestedSearches = useSuggestedSearches();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  /** Guard to prevent circular updates between URL → query → URL */
  const isUpdatingFromUrl = useRef(false);
  /** Track whether we've handled the initial URL param */
  const initialUrlHandled = useRef(false);

  // Register Ctrl+K / ⌘K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for custom "open-command-palette" event from the header search button
  useEffect(() => {
    const handleOpenEvent = () => setOpen(true);
    document.addEventListener("open-command-palette", handleOpenEvent);
    return () => document.removeEventListener("open-command-palette", handleOpenEvent);
  }, []);

  // On mount or when searchParams change: check for ?q= and auto-open palette
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q.trim().length >= 2 && !initialUrlHandled.current) {
      isUpdatingFromUrl.current = true;
      setQuery(q.trim());
      setOpen(true);
      initialUrlHandled.current = true;
      // Reset the flag after React processes the state update
      requestAnimationFrame(() => {
        isUpdatingFromUrl.current = false;
      });
    }
  }, [searchParams]);

  // When query changes from user input (not from URL), update URL with ?q=
  useEffect(() => {
    if (isUpdatingFromUrl.current || !open) return;
    const currentQ = searchParams.get("q") ?? "";
    const targetQ = query.length >= 2 ? query : "";
    // Skip if URL already matches to prevent infinite loops
    if (currentQ === targetQ) return;
    const current = new URLSearchParams(searchParams.toString());
    if (targetQ) {
      current.set("q", targetQ);
    } else {
      current.delete("q");
    }
    const qs = current.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [query, open, pathname, searchParams, router]);

  // When palette is closed, remove ?q= from URL
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        // Reset search state so palette opens fresh next time
        setQuery("");
        setResults([]);
        // Clear URL search param when closing
        const current = new URLSearchParams(searchParams.toString());
        if (current.has("q")) {
          current.delete("q");
          const qs = current.toString();
          const newUrl = qs ? `${pathname}?${qs}` : pathname;
          router.replace(newUrl, { scroll: false });
        }
        // Reset so next URL-triggered open works
        initialUrlHandled.current = false;
      }
    },
    [searchParams, pathname, router],
  );

  // Load recent searches from localStorage when palette opens
  useEffect(() => {
    if (open) {
      setRecentSearches(loadRecentSearches());
    }
  }, [open]);

  // Debounced search when query changes
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.results || [];
          setResults(items.slice(0, 20));
        }
      } catch {
        // Ignore abort errors
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      // Save current query to recent searches before closing
      if (query.trim().length >= 2) {
        const updated = saveRecentSearch(query.trim());
        setRecentSearches(updated);
      }
      handleOpenChange(false);
      setQuery("");
      setResults([]);
      router.push(`/${result.versionYear}/articolul-${result.number}`);
    },
    [router, query, handleOpenChange],
  );

  /** When user clicks a recent or suggested search term, fill the query to re-execute */
  const handleTermClick = useCallback((term: string) => {
    setQuery(term);
  }, []);

  /** Remove a single recent search entry */
  const handleRemoveRecent = useCallback((term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeRecentSearch(term);
    setRecentSearches(updated);
  }, []);

  /**
   * Highlight all occurrences of the search query in text.
   * Uses split with a capturing group — odd-indexed parts are always matches.
   * This avoids the regex.test() global flag lastIndex bug.
   */
  const highlightText = useCallback(
    (text: string): ReactNode[] => {
      if (!query || query.length < 2) return [text];
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      const parts = text.split(regex);
      const nodes: ReactNode[] = [];
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        // When splitting with a capturing group, odd indices are the captured matches
        if (i % 2 === 1) {
          nodes.push(
            <mark key={i} className="bg-primary/20 text-primary font-medium rounded-sm px-0.5">
              {part}
            </mark>,
          );
        } else if (part) {
          nodes.push(part);
        }
      }
      return nodes;
    },
    [query],
  );

  // Group results by version year
  const grouped = results.reduce<Record<number, SearchResult[]>>((acc, r) => {
    if (!acc[r.versionYear]) acc[r.versionYear] = [];
    acc[r.versionYear].push(r);
    return acc;
  }, {});

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput placeholder={t("search.placeholder")} value={query} onValueChange={setQuery} />
      <CommandList>
        {loading && (
          <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>{t("search.searching")}</span>
          </div>
        )}
        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="py-4 px-3">
            <div className="text-center text-sm text-muted-foreground mb-4">
              <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/70" />
              {t("search.noResults")} &ldquo;{query}&rdquo;.
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground px-2 mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5" />
                {t("search.noResultsSuggestion")}
              </p>
              <div className="flex flex-wrap gap-1.5 px-2">
                {suggestedSearches.slice(0, 6).map((s) => (
                  <button
                    key={s.term}
                    type="button"
                    onClick={() => handleTermClick(s.term)}
                    className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {!loading && query.length < 2 && recentSearches.length === 0 && (
          <div className="py-4">
            <div className="text-center text-sm text-muted-foreground mb-3">
              {t("search.minChars")}
            </div>
            <CommandGroup heading={t("search.popularSuggestions")}>
              {suggestedSearches.map((s) => (
                <CommandItem
                  key={`suggestion-${s.term}`}
                  value={`suggestion-${s.term}`}
                  onSelect={() => handleTermClick(s.term)}
                >
                  <Lightbulb className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{s.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        )}
        {!loading && query.length < 2 && recentSearches.length > 0 && (
          <>
            <CommandGroup heading={t("search.recentSearches")}>
              {recentSearches.map((term) => (
                <CommandItem
                  key={`recent-${term}`}
                  value={`recent-${term}`}
                  onSelect={() => handleTermClick(term)}
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm">{term}</span>
                  <button
                    type="button"
                    className="ml-auto p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => handleRemoveRecent(term, e)}
                    aria-label={`${t("search.removeRecent")} "${term}"`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={t("search.popularSuggestions")}>
              {suggestedSearches.slice(0, 5).map((s) => (
                <CommandItem
                  key={`suggestion-${s.term}`}
                  value={`suggestion-${s.term}`}
                  onSelect={() => handleTermClick(s.term)}
                >
                  <Lightbulb className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{s.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {Object.entries(grouped)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([year, items]) => (
            <CommandGroup key={year} heading={`${t("common.constitutionOf")} ${year}`}>
              {items.map((result) => (
                <CommandItem
                  key={`${result.versionYear}-${result.id}`}
                  value={`${result.versionYear}-art-${result.number}-${result.title || ""}`}
                  onSelect={() => handleSelect(result)}
                >
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium text-sm">
                      {t("common.art")} {result.number}
                      {result.title && (
                        <span className="text-muted-foreground font-normal"> — {result.title}</span>
                      )}
                    </span>
                    {result.snippet && (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {highlightText(result.snippet)}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
      </CommandList>
    </CommandDialog>
  );
}
