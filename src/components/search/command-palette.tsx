"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Clock, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";

const RECENT_SEARCHES_KEY = "constitution-recent-searches";
const MAX_RECENT_SEARCHES = 5;

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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
      setOpen(false);
      setQuery("");
      setResults([]);
      router.push(`/${result.versionYear}/articolul-${result.number}`);
    },
    [router, query],
  );

  /** When user clicks a recent search term, fill the query to re-execute */
  const handleRecentClick = useCallback((term: string) => {
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
   * Returns an array of ReactNode fragments with <mark> around matches.
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
        if (regex.test(part)) {
          nodes.push(
            <mark key={i} className="bg-primary/20 text-primary font-medium rounded-sm px-0.5">
              {part}
            </mark>,
          );
        } else {
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
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Caută articole... (ex: Art. 15, drepturi, proprietate)"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="py-6 text-center text-sm text-muted-foreground">Se caută...</div>
        )}
        {!loading && query.length >= 2 && results.length === 0 && (
          <CommandEmpty>
            Niciun rezultat pentru „{query}". Încearcă alt termen de căutare.
          </CommandEmpty>
        )}
        {!loading && query.length < 2 && recentSearches.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Scrie cel puțin 2 caractere pentru a căuta
          </div>
        )}
        {!loading && query.length < 2 && recentSearches.length > 0 && (
          <CommandGroup heading="Căutări recente">
            {recentSearches.map((term) => (
              <CommandItem
                key={`recent-${term}`}
                value={`recent-${term}`}
                onSelect={() => handleRecentClick(term)}
              >
                <Clock className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm">{term}</span>
                <button
                  type="button"
                  className="ml-auto p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => handleRemoveRecent(term, e)}
                  aria-label={`Șterge „${term}" din căutări recente`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {Object.entries(grouped)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([year, items]) => (
            <CommandGroup key={year} heading={`Constituția ${year}`}>
              {items.map((result) => (
                <CommandItem
                  key={`${result.versionYear}-${result.id}`}
                  value={`${result.versionYear}-art-${result.number}-${result.title || ""}`}
                  onSelect={() => handleSelect(result)}
                >
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium text-sm">
                      Art. {result.number}
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
