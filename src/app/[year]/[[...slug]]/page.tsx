import { CommentsSection } from "@/components/feedback/comments-section";
import { VoteButtons } from "@/components/feedback/vote-buttons";
import { TipTapReader } from "@/components/reader/tiptap-reader";
import { db } from "@/lib/db";
import { articles, constitutionVersions, structuralUnits } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

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

  if (Number.isNaN(yearNum)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-destructive">An invalid: {year}</h1>
      </div>
    );
  }

  // Get the version
  const [version] = await db
    .select()
    .from(constitutionVersions)
    .where(eq(constitutionVersions.year, yearNum))
    .limit(1);

  if (!version) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-destructive">
          Versiunea din {year} nu a fost găsită
        </h1>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
          &larr; Înapoi la pagina principală
        </Link>
      </div>
    );
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

  // Fetch all articles for this version (ordered)
  const allArticles = await db
    .select({
      id: articles.id,
      number: articles.number,
      title: articles.title,
      slug: articles.slug,
    })
    .from(articles)
    .where(eq(articles.versionId, version.id))
    .orderBy(asc(articles.orderIndex));

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
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Constituția din {year}</h1>
        <p className="mt-4 text-muted-foreground">
          {slug ? `Pagina „${slug.join("/")}‟ nu a fost găsită.` : "Niciun articol disponibil."}
        </p>
        <Link href={`/${year}`} className="mt-4 inline-block text-primary hover:underline">
          &larr; Vezi toate articolele
        </Link>
      </div>
    );
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          <span className="text-lg font-bold tabular-nums text-primary">Art. {article.number}</span>
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

      {/* Article Navigation (Prev/Next) */}
      <nav className="mt-10 flex items-center justify-between border-t border-border pt-6">
        {prevArticle ? (
          <Link
            href={`/${year}/${prevArticle.slug}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Art. {prevArticle.number}
            {prevArticle.title && <span className="hidden sm:inline"> — {prevArticle.title}</span>}
          </Link>
        ) : (
          <div />
        )}
        {nextArticle ? (
          <Link
            href={`/${year}/${nextArticle.slug}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Art. {nextArticle.number}
            {nextArticle.title && <span className="hidden sm:inline"> — {nextArticle.title}</span>}
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
  );
}
