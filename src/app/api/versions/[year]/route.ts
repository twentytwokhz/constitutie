import { asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { constitutionVersions, structuralUnits } from "@/lib/db/schema";

interface StructureNode {
  id: number;
  type: string;
  number: number;
  name: string;
  slug: string;
  children: StructureNode[];
}

function buildHierarchy(
  flatUnits: {
    id: number;
    type: string;
    number: number;
    name: string;
    slug: string;
    orderIndex: number;
    parentId: number | null;
  }[],
): StructureNode[] {
  const nodeMap = new Map<number, StructureNode>();
  const roots: StructureNode[] = [];

  for (const unit of flatUnits) {
    nodeMap.set(unit.id, {
      id: unit.id,
      type: unit.type,
      number: unit.number,
      name: unit.name,
      slug: unit.slug,
      children: [],
    });
  }

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
      .select()
      .from(constitutionVersions)
      .where(eq(constitutionVersions.year, yearNum))
      .limit(1);

    if (!version) {
      return NextResponse.json({ error: `Version ${year} not found` }, { status: 404 });
    }

    // Fetch structural units for hierarchical structure
    const units = await db
      .select()
      .from(structuralUnits)
      .where(eq(structuralUnits.versionId, version.id))
      .orderBy(asc(structuralUnits.orderIndex));

    const structure = buildHierarchy(units);

    return NextResponse.json({
      ...version,
      structure,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch version";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
