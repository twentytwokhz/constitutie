import { db } from "@/lib/db";
import {
  articleReferences,
  articles,
  constitutionVersions,
  structuralUnits,
} from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ year: string }> }) {
  try {
    const { year } = await params;
    const yearNum = Number.parseInt(year, 10);
    const locale = request.nextUrl.searchParams.get("locale") || "ro";
    const useEn = locale === "en";

    if (Number.isNaN(yearNum)) {
      return NextResponse.json({ error: "Invalid year parameter" }, { status: 400 });
    }

    const [version] = await db
      .select({ id: constitutionVersions.id })
      .from(constitutionVersions)
      .where(eq(constitutionVersions.year, yearNum))
      .limit(1);

    if (!version) {
      return NextResponse.json({ error: `Version ${year} not found` }, { status: 404 });
    }

    // Fetch structural units as nodes
    const units = await db
      .select()
      .from(structuralUnits)
      .where(eq(structuralUnits.versionId, version.id))
      .orderBy(asc(structuralUnits.orderIndex));

    // Fetch articles as nodes
    const versionArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.versionId, version.id))
      .orderBy(asc(articles.orderIndex));

    // Build nodes from structural units and articles (locale-aware labels)
    const typeLabels = useEn
      ? { titlu: "Title", capitol: "Chapter", sectiune: "Section" }
      : { titlu: "Titlul", capitol: "Capitolul", sectiune: "Secțiunea" };

    const nodes = [
      ...units.map((unit) => ({
        id: `unit-${unit.id}`,
        type: unit.type,
        label: `${typeLabels[unit.type as keyof typeof typeLabels] || unit.type} ${unit.number}. ${(useEn && unit.nameEn) || unit.name}`,
        parentId: unit.parentId ? `unit-${unit.parentId}` : null,
      })),
      ...versionArticles.map((article) => {
        const title = (useEn && article.titleEn) || article.title;
        const content = (useEn && article.contentEn) || article.content;
        return {
          id: `article-${article.id}`,
          type: "articol" as const,
          label: `Art. ${article.number}${title ? `. ${title}` : ""}`,
          parentId: `unit-${article.structuralUnitId}`,
          articleNumber: article.number,
          contentSnippet: content ? content.slice(0, 200) : null,
        };
      }),
    ];

    // Build hierarchical edges (parent to child)
    const edges: Array<{ source: string; target: string; type: string }> = [];

    for (const unit of units) {
      if (unit.parentId) {
        edges.push({
          source: `unit-${unit.parentId}`,
          target: `unit-${unit.id}`,
          type: "hierarchy",
        });
      }
    }

    for (const article of versionArticles) {
      edges.push({
        source: `unit-${article.structuralUnitId}`,
        target: `article-${article.id}`,
        type: "hierarchy",
      });
    }

    // Fetch inter-article references for this version
    const articleIds = versionArticles.map((a) => a.id);
    if (articleIds.length > 0) {
      const references = await db.select().from(articleReferences);

      for (const ref of references) {
        if (articleIds.includes(ref.sourceArticleId) && articleIds.includes(ref.targetArticleId)) {
          edges.push({
            source: `article-${ref.sourceArticleId}`,
            target: `article-${ref.targetArticleId}`,
            type: "reference",
          });
        }
      }
    }

    return NextResponse.json({ year: yearNum, nodes, edges });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch graph data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
