import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles, constitutionVersions, structuralUnits } from "@/lib/db/schema";

/**
 * Build the structural breadcrumb chain for an article.
 * Walks up the parentId chain to collect: secțiune → capitol → titlu.
 */
async function getStructuralContext(structuralUnitId: number) {
  const breadcrumb: Array<{ type: string; number: number; name: string; slug: string }> = [];

  let currentId: number | null = structuralUnitId;
  while (currentId !== null) {
    const [unit] = await db
      .select()
      .from(structuralUnits)
      .where(eq(structuralUnits.id, currentId))
      .limit(1);

    if (!unit) break;

    breadcrumb.unshift({
      type: unit.type,
      number: unit.number,
      name: unit.name,
      slug: unit.slug,
    });

    currentId = unit.parentId;
  }

  return breadcrumb;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ year: string; number: string }> },
) {
  try {
    const { year, number } = await params;
    const yearNum = Number.parseInt(year, 10);
    const articleNum = Number.parseInt(number, 10);

    if (Number.isNaN(yearNum) || Number.isNaN(articleNum)) {
      return NextResponse.json({ error: "Invalid year or article number" }, { status: 400 });
    }

    const [version] = await db
      .select({ id: constitutionVersions.id })
      .from(constitutionVersions)
      .where(eq(constitutionVersions.year, yearNum))
      .limit(1);

    if (!version) {
      return NextResponse.json({ error: `Version ${year} not found` }, { status: 404 });
    }

    const [article] = await db
      .select()
      .from(articles)
      .where(and(eq(articles.versionId, version.id), eq(articles.number, articleNum)))
      .limit(1);

    if (!article) {
      return NextResponse.json(
        { error: `Article ${number} not found in version ${year}` },
        { status: 404 },
      );
    }

    // Build structural context (title/chapter/section breadcrumb)
    const structuralContext = await getStructuralContext(article.structuralUnitId);

    return NextResponse.json({
      ...article,
      structuralContext,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
