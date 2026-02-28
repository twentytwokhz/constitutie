import { db } from "@/lib/db";
import { articles, constitutionVersions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const versionA = searchParams.get("a");
  const versionB = searchParams.get("b");
  const articleNum = searchParams.get("article");

  if (!versionA || !versionB || !articleNum) {
    return NextResponse.json(
      { error: "Parameters 'a', 'b', and 'article' are required" },
      { status: 400 },
    );
  }

  const yearA = Number.parseInt(versionA, 10);
  const yearB = Number.parseInt(versionB, 10);
  const artNum = Number.parseInt(articleNum, 10);

  if (Number.isNaN(yearA) || Number.isNaN(yearB) || Number.isNaN(artNum)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    // Fetch version IDs
    const [verA] = await db
      .select({ id: constitutionVersions.id })
      .from(constitutionVersions)
      .where(eq(constitutionVersions.year, yearA))
      .limit(1);

    const [verB] = await db
      .select({ id: constitutionVersions.id })
      .from(constitutionVersions)
      .where(eq(constitutionVersions.year, yearB))
      .limit(1);

    if (!verA || !verB) {
      return NextResponse.json({ error: "One or both versions not found" }, { status: 404 });
    }

    // Fetch the specific article from each version
    const [artA] = await db
      .select()
      .from(articles)
      .where(and(eq(articles.versionId, verA.id), eq(articles.number, artNum)))
      .limit(1);

    const [artB] = await db
      .select()
      .from(articles)
      .where(and(eq(articles.versionId, verB.id), eq(articles.number, artNum)))
      .limit(1);

    return NextResponse.json({
      a: yearA,
      b: yearB,
      articleNumber: artNum,
      articleA: artA ? { title: artA.title, content: artA.content } : null,
      articleB: artB ? { title: artB.title, content: artB.content } : null,
      exists: { inA: !!artA, inB: !!artB },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to compute article diff";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
