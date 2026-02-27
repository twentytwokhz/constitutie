import { CommentsSection } from "@/components/feedback/comments-section";
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

  // Parse content into paragraphs (alineate)
  const paragraphs = article.content.split("\n").filter((p) => p.trim().length > 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Acasă
        </Link>
        <span>/</span>
        <Link href={`/${year}`} className="hover:text-foreground transition-colors">
          {year}
        </Link>
        {structUnit && (
          <>
            <span>/</span>
            <span className="capitalize">{structUnit.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-foreground font-medium">Articolul {article.number}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Articolul {article.number}
          {article.title && (
            <span className="text-muted-foreground font-normal"> — {article.title}</span>
          )}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Constituția din {year}</p>
      </header>

      {/* Article Content */}
      <article className="prose prose-stone dark:prose-invert max-w-none">
        <div className="space-y-3">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.substring(0, 50)} className="text-base leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

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
