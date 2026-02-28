import { db } from "@/lib/db";
import { articles, constitutionVersions } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number.parseInt(id, 10);

  if (Number.isNaN(articleId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  try {
    // First get the article to find its number
    const [sourceArticle] = await db
      .select({ number: articles.number })
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (!sourceArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Find the same article number in all versions
    const crossVersionArticles = await db
      .select({
        id: articles.id,
        number: articles.number,
        title: articles.title,
        content: articles.content,
        versionId: articles.versionId,
        versionYear: constitutionVersions.year,
        versionName: constitutionVersions.name,
      })
      .from(articles)
      .innerJoin(constitutionVersions, eq(articles.versionId, constitutionVersions.id))
      .where(eq(articles.number, sourceArticle.number))
      .orderBy(asc(constitutionVersions.year));

    return NextResponse.json({
      articleNumber: sourceArticle.number,
      versions: crossVersionArticles,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch cross-version data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
