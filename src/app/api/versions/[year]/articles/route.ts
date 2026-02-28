import { asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles, constitutionVersions } from "@/lib/db/schema";

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

    const versionArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.versionId, version.id))
      .orderBy(asc(articles.orderIndex));

    return NextResponse.json(versionArticles);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch articles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
