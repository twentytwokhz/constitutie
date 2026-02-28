"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface TocArticle {
  id: number;
  number: number;
  title: string | null;
  slug: string;
  orderIndex: number;
}

interface TocNode {
  id: number;
  type: string;
  number: number;
  name: string;
  slug: string;
  orderIndex: number;
  children: TocNode[];
  articles: TocArticle[];
}

interface TocSidebarProps {
  year: number;
  /** @deprecated Derived from URL via usePathname(). Only pass for testing. */
  currentArticleNumber?: number | null;
}

function getTypeLabel(type: string, t: (key: string) => string): string {
  switch (type) {
    case "titlu":
      return t("title");
    case "capitol":
      return t("chapter");
    case "sectiune":
      return t("section");
    default:
      return type;
  }
}

function TocNodeItem({
  node,
  year,
  currentArticleNumber,
  depth,
  t,
}: {
  node: TocNode;
  year: number;
  currentArticleNumber: number | null;
  depth: number;
  t: (key: string) => string;
}) {
  // Auto-expand if this branch contains the current article
  const containsCurrentArticle = checkContainsCurrent(node, currentArticleNumber);
  const [expanded, setExpanded] = useState(containsCurrentArticle);

  // Update expansion when current article changes
  useEffect(() => {
    if (containsCurrentArticle) {
      setExpanded(true);
    }
  }, [containsCurrentArticle]);

  const hasChildren = node.children.length > 0 || node.articles.length > 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-1.5 w-full text-left py-1.5 px-2 rounded-md transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
          depth === 0
            ? "font-semibold text-sm text-foreground"
            : depth === 1
              ? "font-medium text-sm text-foreground/90"
              : "text-xs font-medium text-muted-foreground"
        }`}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className="truncate">
          {getTypeLabel(node.type, t)} {node.number}. {node.name}
        </span>
      </button>

      {expanded && hasChildren && (
        <ul className="ml-3 border-l border-border/70">
          {/* Nested structural units */}
          {node.children.map((child) => (
            <TocNodeItem
              key={child.id}
              node={child}
              year={year}
              currentArticleNumber={currentArticleNumber}
              depth={depth + 1}
              t={t}
            />
          ))}

          {/* Articles under this unit */}
          {node.articles.map((art) => {
            const isActive = currentArticleNumber === art.number;
            return (
              <li key={art.id}>
                <Link
                  href={`/${year}/${art.slug}`}
                  data-toc-article={art.number}
                  data-toc-active={isActive || undefined}
                  className={`flex items-center gap-1.5 py-1 px-2 ml-1 rounded-md text-xs transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    Art. {art.number}
                    {art.title ? ` — ${art.title}` : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

function checkContainsCurrent(node: TocNode, articleNumber: number | null): boolean {
  if (articleNumber === null) return false;
  if (node.articles.some((a) => a.number === articleNumber)) return true;
  return node.children.some((child) => checkContainsCurrent(child, articleNumber));
}

export function TocSidebar({
  year,
  currentArticleNumber: currentArticleNumberProp,
}: TocSidebarProps) {
  const t = useTranslations("reader");
  const locale = useLocale();
  const pathname = usePathname();
  const [tree, setTree] = useState<TocNode[]>([]);
  const [loading, setLoading] = useState(true);
  const navRef = useRef<HTMLElement>(null);

  // Derive current article number from the URL pathname (e.g. /2003/titlul-2/articolul-15)
  // Falls back to explicit prop if provided (for testing/mobile-toc)
  const currentArticleNumber = useMemo(() => {
    if (currentArticleNumberProp !== undefined) return currentArticleNumberProp;
    const segments = pathname.split("/").filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i--) {
      const match = segments[i].match(/^articolul-(\d+)$/);
      if (match) return Number.parseInt(match[1], 10);
    }
    return null;
  }, [pathname, currentArticleNumberProp]);

  useEffect(() => {
    // Show loading skeleton when year or locale changes (different content)
    setLoading(true);
    async function fetchStructure() {
      try {
        const resp = await fetch(`/api/versions/${year}/structure?locale=${locale}`);
        if (!resp.ok) return;
        const data = await resp.json();
        setTree(data.structure ?? []);
      } catch {
        // Silently fail — TOC is non-critical
      } finally {
        setLoading(false);
      }
    }
    fetchStructure();
  }, [year, locale]);

  /** Scroll the active TOC item into view when article changes or tree loads */
  const scrollActiveIntoView = useCallback(() => {
    if (!navRef.current || currentArticleNumber === null) return;
    const activeEl = navRef.current.querySelector("[data-toc-active]");
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentArticleNumber]);

  // Scroll active item into view when tree loads or article changes
  useEffect(() => {
    if (!loading && tree.length > 0) {
      // Small delay to let the DOM render expanded sections first
      const timer = setTimeout(scrollActiveIntoView, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, tree, scrollActiveIntoView]);

  if (loading) {
    return (
      <nav className="w-full space-y-2 p-3">
        {["skel-a", "skel-b", "skel-c", "skel-d", "skel-e", "skel-f"].map((id, i) => (
          <div
            key={id}
            className="h-5 bg-muted/50 rounded animate-pulse"
            style={{ width: `${70 + ((i * 17) % 30)}%` }}
          />
        ))}
      </nav>
    );
  }

  if (tree.length === 0) {
    return (
      <nav className="w-full p-3 text-sm text-muted-foreground">{t("structureUnavailable")}</nav>
    );
  }

  return (
    <nav ref={navRef} className="w-full overflow-y-auto overflow-x-hidden">
      <div className="px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          {t("tableOfContents")}
        </h2>
      </div>
      <ul className="px-1 pb-4 space-y-0.5">
        {tree.map((node) => (
          <TocNodeItem
            key={node.id}
            node={node}
            year={year}
            currentArticleNumber={currentArticleNumber}
            depth={0}
            t={t}
          />
        ))}
      </ul>
    </nav>
  );
}
