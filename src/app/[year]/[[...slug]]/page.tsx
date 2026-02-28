import { CommentsSection } from "@/components/feedback/comments-section";
import { VoteButtons } from "@/components/feedback/vote-buttons";
import { TipTapReader } from "@/components/reader/tiptap-reader";
import { TocSidebar } from "@/components/reader/toc-sidebar";
import { db } from "@/lib/db";
import { articles, constitutionVersions, structuralUnits } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * Constitution Reader Page
 *
 * Dynamic route: /[year]/[[...slug]]
 * Examples:
 *   /2003                           - Version 2003 overview (shows first article)
 *   /2003/articolul-15              - Article 15 of 2003
 *   /2003/titlul-2/capitolul-1/articolul-15 - Article 15 (deep link)
 */
interface ReaderPageProps {
  params: Promise<{
    year: string;
    slug?: string[];
  }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const { year, slug } = await params;
  const yearNum = Number.parseInt(year, 10);

  // Only allow valid constitution years (digits only)
  if (Number.isNaN(yearNum) || !/^\d+$/.test(year)) {
    notFound();
  }

  // Get the version
  const [version] = await db
    .select()
    .from(constitutionVersions)
    .where(eq(constitutionVersions.year, yearNum))
    .limit(1);

  if (!version) {
    notFound();
  }

  // Extract article number from slug
  // Slug can be: undefined/[] (no slug), ["articolul-15"], or ["titlul-2", "capitolul-1", "articolul-15"]
  let articleNumber: number | null = null;
  if (slug && slug.length > 0) {
    const lastSegment = slug[slug.length - 1];
    const match = lastSegment.match(/^articolul-(\d+)$/);
    if (match) {
      articleNumber = Number.parseInt(match[1], 10);
    }
  }

  // Fetch all articles for this version (ordered), include structuralUnitId for path building
  const allArticles = await db
    .select({
      id: articles.id,
      number: articles.number,
      title: articles.title,
      slug: articles.slug,
      structuralUnitId: articles.structuralUnitId,
    })
    .from(articles)
    .where(eq(articles.versionId, version.id))
    .orderBy(asc(articles.orderIndex));

  // Fetch all structural units for this version (single query for efficiency)
  const allUnits = await db
    .select()
    .from(structuralUnits)
    .where(eq(structuralUnits.versionId, version.id));

  const unitMap = new Map(allUnits.map((u) => [u.id, u]));

  /** Build full hierarchical URL path for an article: /year/titlul-X/capitolul-Y/articolul-Z */
  function buildArticlePath(art: { slug: string; structuralUnitId: number }): string {
    const pathParts: string[] = [];
    let unitId: number | null = art.structuralUnitId;
    while (unitId) {
      const unit = unitMap.get(unitId);
      if (!unit) break;
      pathParts.unshift(unit.slug);
      unitId = unit.parentId;
    }
    pathParts.push(art.slug);
    return `/${year}/${pathParts.join("/")}`;
  }

  // If no specific article requested, show the first article
  if (articleNumber === null && allArticles.length > 0) {
    articleNumber = allArticles[0].number;
  }

  // Fetch the specific article
  const [article] = articleNumber
    ? await db
        .select()
        .from(articles)
        .where(and(eq(articles.versionId, version.id), eq(articles.number, articleNumber)))
        .limit(1)
    : [];

  if (!article) {
    notFound();
  }

  // Fetch the structural unit for breadcrumb
  const [structUnit] = await db
    .select()
    .from(structuralUnits)
    .where(eq(structuralUnits.id, article.structuralUnitId))
    .limit(1);

  // Find prev/next articles for navigation
  const currentIndex = allArticles.findIndex((a) => a.number === article.number);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  // Build full breadcrumb from structural context
  // Walk the parent chain for full hierarchy
  const breadcrumbParts: Array<{ type: string; name: string; slug: string }> = [];
  if (structUnit) {
    // Walk parent chain
    let currentUnit: typeof structUnit | undefined = structUnit;
    const chain: typeof breadcrumbParts = [];
    while (currentUnit) {
      chain.unshift({
        type: currentUnit.type,
        name: currentUnit.name,
        slug: currentUnit.slug,
      });
      if (currentUnit.parentId) {
        const [parent] = await db
          .select()
          .from(structuralUnits)
          .where(eq(structuralUnits.id, currentUnit.parentId))
          .limit(1);
        currentUnit = parent;
      } else {
        currentUnit = undefined;
      }
    }
    breadcrumbParts.push(...chain);
  }

  // Get the structural unit heading label (Titlu/Capitol/Secțiune)
  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "titlu":
        return "Titlul";
      case "capitol":
        return "Capitolul";
      case "sectiune":
        return "Secțiunea";
      default:
        return type;
    }
  };

  // Use TipTap JSON if available, otherwise fall back to raw content
  const tiptapContent = article.contentTiptap as Record<string, unknown> | null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* TOC Sidebar — desktop only */}
      <aside className="hidden lg:block w-[280px] shrink-0 border-r border-border sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <TocSidebar year={yearNum} currentArticleNumber={article.number} />
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-8 max-w-4xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">
            Acasă
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <Link href={`/${year}`} className="hover:text-foreground transition-colors">
            {year}
          </Link>
          {breadcrumbParts.map((part) => (
            <span key={part.slug} className="flex items-center gap-2">
              <span className="text-muted-foreground/50">/</span>
              <span>
                {getTypeLabel(part.type)} {part.name}
              </span>
            </span>
          ))}
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground font-medium">Articolul {article.number}</span>
        </nav>

        {/* Structural Unit Heading (Titlu/Capitol/Secțiune) */}
        {breadcrumbParts.length > 0 && (
          <div className="mb-4 space-y-1">
            {breadcrumbParts.map((part) => (
              <p
                key={part.slug}
                className={
                  part.type === "titlu"
                    ? "text-xs font-semibold uppercase tracking-widest text-primary"
                    : part.type === "capitol"
                      ? "text-xs font-medium uppercase tracking-wide text-muted-foreground"
                      : "text-xs font-medium italic text-muted-foreground/80"
                }
              >
                {getTypeLabel(part.type)} {part.name}
              </p>
            ))}
          </div>
        )}

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-bold tabular-nums text-primary">
              Art. {article.number}
            </span>
            {article.title && (
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{article.title}</h1>
            )}
          </div>
          {!article.title && (
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              Articolul {article.number}
            </h1>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Constituția din {year} &middot; {allArticles.length} articole
          </p>
        </header>

        {/* Article Content via TipTap */}
        <article className="max-w-none">
          {tiptapContent ? (
            <TipTapReader content={tiptapContent} />
          ) : (
            <div className="space-y-3">
              {article.content
                .split("\n")
                .filter((p) => p.trim().length > 0)
                .map((paragraph, idx) => (
                  <p
                    key={`p-${idx}-${paragraph.substring(0, 20)}`}
                    className="text-base leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
            </div>
          )}
        </article>

        {/* Vote Buttons */}
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Ce părere ai despre acest articol?
          </h3>
          <VoteButtons
            articleId={article.id}
            initialAgreeCount={article.agreeCount ?? 0}
            initialDisagreeCount={article.disagreeCount ?? 0}
          />
        </div>

        {/* Article Navigation (Prev/Next) — full deep links */}
        <nav className="mt-10 flex items-center justify-between border-t border-border pt-6">
          {prevArticle ? (
            <Link
              href={buildArticlePath(prevArticle)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Art. {prevArticle.number}
              {prevArticle.title && (
                <span className="hidden sm:inline"> — {prevArticle.title}</span>
              )}
            </Link>
          ) : (
            <div />
          )}
          {nextArticle ? (
            <Link
              href={buildArticlePath(nextArticle)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Art. {nextArticle.number}
              {nextArticle.title && (
                <span className="hidden sm:inline"> — {nextArticle.title}</span>
              )}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div />
          )}
        </nav>

        {/* Comments Section */}
        <section className="mt-8 border-t border-border pt-6">
          <CommentsSection articleId={article.id} />
        </section>
      </div>
    </div>
  );
}
