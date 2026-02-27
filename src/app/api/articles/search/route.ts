import { db } from "@/lib/db";
import { articles, constitutionVersions } from "@/lib/db/schema";
import { asc, eq, ilike, or, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ query: "", results: [] });
  }

  try {
    const searchTerm = `%${query.trim()}%`;

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
      .where(
        or(
          ilike(articles.content, searchTerm),
          ilike(articles.title, searchTerm),
          sql`CAST(${articles.number} AS TEXT) = ${query.trim()}`,
        ),
      )
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
