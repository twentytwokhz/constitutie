import { asc, eq, ilike, or, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles, constitutionVersions } from "@/lib/db/schema";

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
  const locale = searchParams.get("locale") || "ro";
  const useEn = locale === "en";

  if (!query.trim()) {
    return NextResponse.json({ query: "", results: [] });
  }

  // Truncate overly long queries to prevent abuse
  const sanitizedQuery = query.trim().slice(0, MAX_QUERY_LENGTH);

  try {
    const searchTerm = `%${escapeLikePattern(sanitizedQuery)}%`;
    const articleNumber = extractArticleNumber(sanitizedQuery);

    // Build WHERE conditions: search both languages for broader results
    const conditions = [ilike(articles.content, searchTerm), ilike(articles.title, searchTerm)];

    // Also search English columns for cross-language results
    if (useEn) {
      conditions.push(ilike(articles.contentEn, searchTerm));
      conditions.push(ilike(articles.titleEn, searchTerm));
    }

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
        titleEn: articles.titleEn,
        content: articles.content,
        contentEn: articles.contentEn,
        slug: articles.slug,
        versionYear: constitutionVersions.year,
        versionName: constitutionVersions.name,
        versionNameEn: constitutionVersions.nameEn,
      })
      .from(articles)
      .innerJoin(constitutionVersions, eq(articles.versionId, constitutionVersions.id))
      .where(or(...conditions))
      .orderBy(asc(constitutionVersions.year), asc(articles.number))
      .limit(50);

    // Create search result snippets centered on the search term
    const queryLower = sanitizedQuery.toLowerCase();
    const enrichedResults = results.map((result) => {
      // Use locale-appropriate content for snippets
      const displayContent = (useEn && result.contentEn) || result.content;
      const displayTitle = (useEn && result.titleEn) || result.title;
      const displayVersionName = (useEn && result.versionNameEn) || result.versionName;

      // Try to find the search term in content and extract context around it
      const contentLower = displayContent.toLowerCase();
      const matchIndex = contentLower.indexOf(queryLower);

      let snippet: string;
      if (matchIndex >= 0) {
        // Extract ~80 chars before and ~120 chars after the match for context
        const snippetStart = Math.max(0, matchIndex - 80);
        const snippetEnd = Math.min(displayContent.length, matchIndex + queryLower.length + 120);
        const raw = displayContent.substring(snippetStart, snippetEnd).replace(/\n/g, " ");
        const prefix = snippetStart > 0 ? "..." : "";
        const suffix = snippetEnd < displayContent.length ? "..." : "";
        snippet = `${prefix}${raw.trim()}${suffix}`;
      } else {
        // Fallback: first 200 chars (match was in title or article number)
        snippet =
          displayContent.length > 200
            ? `${displayContent.substring(0, 200).replace(/\n/g, " ")}...`
            : displayContent.replace(/\n/g, " ");
      }

      return {
        id: result.id,
        number: result.number,
        title: displayTitle,
        snippet,
        versionYear: result.versionYear,
        versionName: displayVersionName,
        slug: result.slug,
      };
    });

    return NextResponse.json({ query: sanitizedQuery, results: enrichedResults });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
