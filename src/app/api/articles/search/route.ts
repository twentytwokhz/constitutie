import { db } from "@/lib/db";
import { articles, constitutionVersions } from "@/lib/db/schema";
import { asc, eq, ilike, or, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Extract article number from common search patterns:
 * "Art. 15", "art 15", "Art.15", "Articolul 15", "articolul 15", "art.15", or just "15"
 */
function extractArticleNumber(q: string): string | null {
  const trimmed = q.trim();
  // Direct number
  if (/^\d+$/.test(trimmed)) return trimmed;
  // Patterns: "Art. 15", "art 15", "Art.15", "Articolul 15"
  const match = trimmed.match(/^(?:art(?:icolul)?\.?\s*)(\d+)$/i);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ query: "", results: [] });
  }

  try {
    const searchTerm = `%${query.trim()}%`;
    const articleNumber = extractArticleNumber(query);

    // Build WHERE conditions: content search, title search, and article number match
    const conditions = [ilike(articles.content, searchTerm), ilike(articles.title, searchTerm)];

    // If the query is or contains an article number, also match by number
    if (articleNumber) {
      conditions.push(sql`CAST(${articles.number} AS TEXT) = ${articleNumber}`);
    }

    // Search by article number, title, or content
    const results = await db
      .select({
        id: articles.id,
        number: articles.number,
        title: articles.title,
        content: articles.content,
        slug: articles.slug,
        versionYear: constitutionVersions.year,
        versionName: constitutionVersions.name,
      })
      .from(articles)
      .innerJoin(constitutionVersions, eq(articles.versionId, constitutionVersions.id))
      .where(or(...conditions))
      .orderBy(asc(constitutionVersions.year), asc(articles.number))
      .limit(50);

    // Create search result snippets with highlights
    const enrichedResults = results.map((result) => {
      const contentPreview =
        result.content.length > 200 ? `${result.content.substring(0, 200)}...` : result.content;

      return {
        id: result.id,
        number: result.number,
        title: result.title,
        snippet: contentPreview,
        versionYear: result.versionYear,
        versionName: result.versionName,
        slug: result.slug,
      };
    });

    return NextResponse.json({ query, results: enrichedResults });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
