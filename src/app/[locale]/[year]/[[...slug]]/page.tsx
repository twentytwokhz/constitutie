import { and, asc, eq } from "drizzle-orm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CommentsSection } from "@/components/feedback/comments-section";
import { TextSelectionFeedback } from "@/components/feedback/text-selection-feedback";
import { VoteButtons } from "@/components/feedback/vote-buttons";
import { CoatOfArms, TricolorStripe } from "@/components/national-symbols";
import { ReadingProgress } from "@/components/reader/reading-progress";
import { ShareButton } from "@/components/reader/share-button";
import { TipTapReader } from "@/components/reader/tiptap-reader";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { articles, constitutionVersions, structuralUnits } from "@/lib/db/schema";

/**
 * Generate per-article Open Graph and Twitter metadata for SEO and social sharing.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { year, slug } = await params;
  const yearNum = Number.parseInt(year, 10);

  if (Number.isNaN(yearNum) || !/^\d+$/.test(year)) {
    return {};
  }

  const [version] = await db
    .select()
    .from(constitutionVersions)
    .where(eq(constitutionVersions.year, yearNum))
    .limit(1);

  if (!version) {
    return {};
  }

  // Extract article number from slug
  let articleNumber: number | null = null;
  if (slug && slug.length > 0) {
    const lastSegment = slug[slug.length - 1];
    const match = lastSegment.match(/^articolul-(\d+)$/);
    if (match) {
      articleNumber = Number.parseInt(match[1], 10);
    }
  }

  // If no article specified, resolve to the first article of the version
  if (articleNumber === null) {
    const [firstArticle] = await db
      .select({ number: articles.number })
      .from(articles)
      .where(eq(articles.versionId, version.id))
      .orderBy(asc(articles.orderIndex))
      .limit(1);
    if (firstArticle) {
      articleNumber = firstArticle.number;
    }
  }

  const tCommon = await getTranslations("common");

  if (articleNumber === null) {
    return {
      title: `${tCommon("appName")} (${year})`,
    };
  }

  const metaLocale = await getLocale();
  const metaUseEn = metaLocale === "en";

  const [article] = await db
    .select({
      number: articles.number,
      title: articles.title,
      titleEn: articles.titleEn,
      content: articles.content,
      contentEn: articles.contentEn,
    })
    .from(articles)
    .where(and(eq(articles.versionId, version.id), eq(articles.number, articleNumber)))
    .limit(1);

  if (!article) {
    return {};
  }

  const metaTitle = (metaUseEn && article.titleEn) || article.title;
  const metaContent = (metaUseEn && article.contentEn) || article.content;

  const titleParts = [`${tCommon("art")} ${article.number}`];
  if (metaTitle) {
    titleParts.push(`\u2014 ${metaTitle}`);
  }
  const ogTitle = `${titleParts.join(" ")} | ${tCommon("appName")} (${year})`;
  const ogDescription = metaContent.substring(0, 200).trim();

  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description: ogDescription,
    },
  };
}

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
  const locale = await getLocale();
  const useEn = locale === "en";

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
  const allArticlesRaw = await db
    .select({
      id: articles.id,
      number: articles.number,
      title: articles.title,
      titleEn: articles.titleEn,
      slug: articles.slug,
      structuralUnitId: articles.structuralUnitId,
    })
    .from(articles)
    .where(eq(articles.versionId, version.id))
    .orderBy(asc(articles.orderIndex));

  // Apply locale: pick English title when in English mode
  const allArticles = allArticlesRaw.map((a) => ({
    ...a,
    title: (useEn && a.titleEn) || a.title,
  }));

  // Fetch all structural units for this version (single query for efficiency)
  const allUnits = await db
    .select()
    .from(structuralUnits)
    .where(eq(structuralUnits.versionId, version.id));

  const unitMap = new Map(allUnits.map((u) => [u.id, u]));
  const unitBySlug = new Map(allUnits.map((u) => [u.slug, u]));

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

  /** Collect all descendant unit IDs for a structural unit (including itself) */
  function getDescendantUnitIds(unitId: number): Set<number> {
    const ids = new Set<number>([unitId]);
    for (const u of allUnits) {
      if (u.parentId && ids.has(u.parentId)) {
        ids.add(u.id);
      }
    }
    // Multi-level: repeat until stable (handles deep nesting)
    let changed = true;
    while (changed) {
      changed = false;
      for (const u of allUnits) {
        if (u.parentId && ids.has(u.parentId) && !ids.has(u.id)) {
          ids.add(u.id);
          changed = true;
        }
      }
    }
    return ids;
  }

  // If slug points to a structural unit (not an article), find first article within it
  if (articleNumber === null && slug && slug.length > 0) {
    const targetSlug = slug[slug.length - 1];
    const targetUnit = unitBySlug.get(targetSlug);
    if (targetUnit) {
      const descendantIds = getDescendantUnitIds(targetUnit.id);
      const firstInUnit = allArticles.find((a) => descendantIds.has(a.structuralUnitId));
      if (firstInUnit) {
        articleNumber = firstInUnit.number;
      }
    }
  }

  // If slug was provided but couldn't resolve to an article or structural unit, show 404
  // (e.g. /2003/titlul-999 where titlul-999 doesn't exist)
  if (articleNumber === null && slug && slug.length > 0) {
    notFound();
  }

  // If no specific article requested (bare version URL like /2003), show the first article
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
        name: (useEn && currentUnit.nameEn) || currentUnit.name,
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

  // Load translations for reader namespace
  const t = await getTranslations("reader");
  const tCommon = await getTranslations("common");
  const tFeedback = await getTranslations("feedback");

  // Get the structural unit heading label (Titlu/Capitol/Secțiune)
  const getTypeLabel = (type: string): string => {
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
  };

  // Use locale-aware content: prefer English when in English locale
  const articleTitle = (useEn && article.titleEn) || article.title;
  const articleContent = (useEn && article.contentEn) || article.content;
  const tiptapContent = useEn
    ? ((article.contentTiptapEn as Record<string, unknown> | null) ??
      (article.contentTiptap as Record<string, unknown> | null))
    : (article.contentTiptap as Record<string, unknown> | null);

  // Build the current article's canonical path for structured data
  const currentArticleForPath = allArticles[currentIndex];
  const articleCanonicalPath = currentArticleForPath
    ? buildArticlePath(currentArticleForPath)
    : `/${year}/articolul-${article.number}`;

  // Build breadcrumb JSON-LD items
  const breadcrumbJsonLdItems = [
    { name: tCommon("home"), url: `/${locale}` },
    { name: `${t("constitutionFrom")} ${year}`, url: `/${locale}/${year}` },
    ...breadcrumbParts.map((part, idx) => ({
      name: `${getTypeLabel(part.type)} ${part.name}`,
      url: `/${locale}/${year}/${breadcrumbParts
        .slice(0, idx + 1)
        .map((p) => p.slug)
        .join("/")}`,
    })),
    {
      name: `${t("article")} ${article.number}${articleTitle ? ` — ${articleTitle}` : ""}`,
      url: `/${locale}${articleCanonicalPath}`,
    },
  ];

  return (
    <>
      {/* Structured data for search engines */}
      <ArticleJsonLd
        locale={locale}
        year={yearNum}
        articleNumber={article.number}
        articleTitle={articleTitle}
        articleContent={articleContent}
        url={`/${locale}${articleCanonicalPath}`}
      />
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} />

      {/* Reading progress indicator */}
      <ReadingProgress currentArticle={currentIndex + 1} totalArticles={allArticles.length} />

      {/* Main content area — sidebar is in the year-level layout.tsx */}
      <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-8 max-w-4xl mx-auto w-full">
        {/* Version header with coat of arms */}
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 sm:px-4 sm:py-3 overflow-hidden">
          <CoatOfArms year={yearNum} size={36} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold tracking-tight whitespace-nowrap sm:text-base">
              {t("constitutionFrom")} {year}
            </h2>
            <p className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
              {allArticles.length} {tCommon("articles")}
            </p>
          </div>
          <TricolorStripe
            height="3px"
            className="w-16 rounded-full overflow-hidden hidden sm:flex shrink-0"
          />
        </div>

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">
            {tCommon("home")}
          </Link>
          <span className="text-muted-foreground/70">/</span>
          <Link href={`/${year}`} className="hover:text-foreground transition-colors">
            {year}
          </Link>
          {breadcrumbParts.map((part, idx) => {
            // Build cumulative path: /year/titlul-X or /year/titlul-X/capitolul-Y
            const cumulativePath = `/${year}/${breadcrumbParts
              .slice(0, idx + 1)
              .map((p) => p.slug)
              .join("/")}`;
            return (
              <span key={part.slug} className="flex items-center gap-2">
                <span className="text-muted-foreground/70">/</span>
                <Link href={cumulativePath} className="hover:text-foreground transition-colors">
                  {getTypeLabel(part.type)} {part.name}
                </Link>
              </span>
            );
          })}
          <span className="text-muted-foreground/70">/</span>
          <span className="text-foreground font-medium">
            {t("article")} {article.number}
          </span>
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
                      : "text-xs font-medium italic text-muted-foreground"
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
            {articleTitle && (
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{articleTitle}</h1>
            )}
          </div>
          {!articleTitle && (
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              {t("article")} {article.number}
            </h1>
          )}
          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {t("constitutionFrom")} {year} &middot; {allArticles.length} {tCommon("articles")}
            </p>
            <ShareButton
              articleNumber={article.number}
              articleTitle={articleTitle ?? undefined}
              year={yearNum}
            />
          </div>
        </header>

        {/* Article Content via TipTap — wrapped with inline feedback on text selection */}
        <TextSelectionFeedback articleId={article.id} articleNumber={article.number} year={yearNum}>
          <article className="max-w-none">
            {tiptapContent ? (
              <TipTapReader content={tiptapContent} />
            ) : (
              <div className="space-y-3">
                {articleContent
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
        </TextSelectionFeedback>

        {/* Article Navigation (Prev/Next) — full deep links */}
        <nav className="mt-8 flex items-center justify-between border-t border-border pt-6">
          {prevArticle ? (
            <Link
              href={buildArticlePath(prevArticle)}
              className="group flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ChevronLeft className="h-4 w-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-medium text-foreground">
                Art. {prevArticle.number}
                {prevArticle.title && (
                  <span className="hidden sm:inline text-muted-foreground font-normal">
                    {" "}
                    — {prevArticle.title}
                  </span>
                )}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextArticle ? (
            <Link
              href={buildArticlePath(nextArticle)}
              className="group flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="font-medium text-foreground">
                Art. {nextArticle.number}
                {nextArticle.title && (
                  <span className="hidden sm:inline text-muted-foreground font-normal">
                    {" "}
                    — {nextArticle.title}
                  </span>
                )}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <div />
          )}
        </nav>

        {/* Article Engagement: Vote & Share */}
        <div className="mt-6 border-t border-border pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {tFeedback("whatDoYouThink")}
              </h3>
              <VoteButtons
                articleId={article.id}
                initialAgreeCount={article.agreeCount ?? 0}
                initialDisagreeCount={article.disagreeCount ?? 0}
              />
            </div>
            <div className="sm:text-right">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {t("shareArticle")}
              </h3>
              <ShareButton
                articleNumber={article.number}
                articleTitle={article.title ?? undefined}
                year={yearNum}
                variant="footer"
              />
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <section className="mt-8 border-t border-border pt-6">
          <CommentsSection articleId={article.id} />
        </section>
      </div>
    </>
  );
}
