"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface SearchResult {
  id: number;
  number: number;
  title: string | null;
  versionYear: number;
  snippet: string;
  slug: string;
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
      setOpen(false);
      setQuery("");
      setResults([]);
      router.push(`/${result.versionYear}/articolul-${result.number}`);
    },
    [router],
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
        {!loading && query.length < 2 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Scrie cel puțin 2 caractere pentru a căuta
          </div>
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
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {result.snippet}
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
