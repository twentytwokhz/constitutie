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

/** Escape SQL LIKE special characters (%, _) so they're treated as literals */
function escapeLikePattern(value: string): string {
  return value.replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/** Maximum allowed search query length */
const MAX_QUERY_LENGTH = 200;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ query: "", results: [] });
  }

  // Truncate overly long queries to prevent abuse
  const sanitizedQuery = query.trim().slice(0, MAX_QUERY_LENGTH);

  try {
    const searchTerm = `%${escapeLikePattern(sanitizedQuery)}%`;
    const articleNumber = extractArticleNumber(sanitizedQuery);

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

    // Create search result snippets centered on the search term
    const queryLower = sanitizedQuery.toLowerCase();
    const enrichedResults = results.map((result) => {
      // Try to find the search term in content and extract context around it
      const contentLower = result.content.toLowerCase();
      const matchIndex = contentLower.indexOf(queryLower);

      let snippet: string;
      if (matchIndex >= 0) {
        // Extract ~80 chars before and ~120 chars after the match for context
        const snippetStart = Math.max(0, matchIndex - 80);
        const snippetEnd = Math.min(result.content.length, matchIndex + queryLower.length + 120);
        const raw = result.content.substring(snippetStart, snippetEnd).replace(/\n/g, " ");
        const prefix = snippetStart > 0 ? "..." : "";
        const suffix = snippetEnd < result.content.length ? "..." : "";
        snippet = `${prefix}${raw.trim()}${suffix}`;
      } else {
        // Fallback: first 200 chars (match was in title or article number)
        snippet =
          result.content.length > 200
            ? `${result.content.substring(0, 200).replace(/\n/g, " ")}...`
            : result.content.replace(/\n/g, " ");
      }

      return {
        id: result.id,
        number: result.number,
        title: result.title,
        snippet,
        versionYear: result.versionYear,
        versionName: result.versionName,
        slug: result.slug,
      };
    });

    return NextResponse.json({ query: sanitizedQuery, results: enrichedResults });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
