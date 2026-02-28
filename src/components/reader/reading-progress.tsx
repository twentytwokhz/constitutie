"use client";

import { useEffect, useState } from "react";

/**
 * Reading progress indicator — shows a thin progress bar at the top of the
 * viewport (just below the header) that fills as the user scrolls through content.
 *
 * Props:
 * - currentArticle: the 1-based index of the current article
 * - totalArticles: total articles in this constitution version
 */
export function ReadingProgress({
  currentArticle,
  totalArticles,
}: {
  currentArticle: number;
  totalArticles: number;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        setScrollProgress(100);
        return;
      }
      const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      setScrollProgress(progress);
    }

    handleScroll(); // Initial calculation
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const articlePercent = totalArticles > 0 ? Math.round((currentArticle / totalArticles) * 100) : 0;

  return (
    <div className="sticky top-[67px] z-30 w-full">
      {/* Scroll progress bar */}
      <div className="h-1 w-full bg-muted/50">
        <div
          className="h-full bg-primary transition-[width] duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      {/* Article position badge */}
      <div className="absolute right-4 top-2 flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-sm border border-border px-3 py-1 text-xs text-muted-foreground shadow-sm">
        <span className="tabular-nums font-medium">
          {currentArticle} / {totalArticles}
        </span>
        <span className="text-muted-foreground/70">({articlePercent}%)</span>
      </div>
    </div>
  );
}
