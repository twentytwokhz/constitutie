"use client";

import { List, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { TocSidebar } from "@/components/reader/toc-sidebar";

interface MobileTocProps {
  year: number;
}

/**
 * Mobile Table of Contents — bottom sheet overlay
 *
 * Renders a floating "TOC" button on mobile (below lg breakpoint)
 * that opens a bottom sheet containing the full TocSidebar.
 * The sheet slides up from the bottom with backdrop blur overlay.
 */
export function MobileToc({ year }: MobileTocProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("reader");

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    },
    [open],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Floating trigger button — only visible on mobile (< lg) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-3 text-sm font-medium hover:bg-primary/90 transition-colors active:scale-95"
        aria-label={t("openToc")}
      >
        <List className="h-4 w-4" />
        <span>{t("tableOfContents")}</span>
      </button>

      {/* Bottom sheet overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Close table of contents"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />

          {/* Bottom sheet panel */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] bg-background border-t border-border rounded-t-xl shadow-xl animate-slide-up flex flex-col">
            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {t("tableOfContents")}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                aria-label={t("closeToc")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drag indicator */}
            <div className="flex justify-center py-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* TOC content — scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <TocSidebar year={year} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
