import { db } from "@/lib/db";
import { articles, constitutionVersions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json(article);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
