import { db } from "@/lib/db";
import { articles, constitutionVersions, structuralUnits } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

interface StructureNode {
  id: number;
  type: string;
  number: number;
  name: string;
  slug: string;
  orderIndex: number;
  children: StructureNode[];
  articles: {
    id: number;
    number: number;
    title: string | null;
    slug: string;
    orderIndex: number;
  }[];
}

function buildTree(
  flatUnits: {
    id: number;
    type: string;
    number: number;
    name: string;
    slug: string;
    orderIndex: number;
    parentId: number | null;
  }[],
  articlesByUnit: Map<
    number,
    { id: number; number: number; title: string | null; slug: string; orderIndex: number }[]
  >,
): StructureNode[] {
  const nodeMap = new Map<number, StructureNode>();
  const roots: StructureNode[] = [];

  // Create nodes
  for (const unit of flatUnits) {
    nodeMap.set(unit.id, {
      id: unit.id,
      type: unit.type,
      number: unit.number,
      name: unit.name,
      slug: unit.slug,
      orderIndex: unit.orderIndex,
      children: [],
      articles: articlesByUnit.get(unit.id) ?? [],
    });
  }

  // Build hierarchy
  for (const unit of flatUnits) {
    const node = nodeMap.get(unit.id);
    if (!node) continue;

    if (unit.parentId !== null) {
      const parent = nodeMap.get(unit.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ year: string }> },
) {
  try {
    const { year } = await params;
    const yearNum = Number.parseInt(year, 10);

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

    // Fetch structural units and articles in parallel
    const [units, versionArticles] = await Promise.all([
      db
        .select()
        .from(structuralUnits)
        .where(eq(structuralUnits.versionId, version.id))
        .orderBy(asc(structuralUnits.orderIndex)),
      db
        .select({
          id: articles.id,
          number: articles.number,
          title: articles.title,
          slug: articles.slug,
          orderIndex: articles.orderIndex,
          structuralUnitId: articles.structuralUnitId,
        })
        .from(articles)
        .where(eq(articles.versionId, version.id))
        .orderBy(asc(articles.orderIndex)),
    ]);

    // Group articles by structural unit
    const articlesByUnit = new Map<
      number,
      { id: number; number: number; title: string | null; slug: string; orderIndex: number }[]
    >();
    for (const article of versionArticles) {
      const list = articlesByUnit.get(article.structuralUnitId) ?? [];
      list.push({
        id: article.id,
        number: article.number,
        title: article.title,
        slug: article.slug,
        orderIndex: article.orderIndex,
      });
      articlesByUnit.set(article.structuralUnitId, list);
    }

    const tree = buildTree(units, articlesByUnit);

    return NextResponse.json({ year: yearNum, structure: tree });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch structure";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
