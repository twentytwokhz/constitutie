import { and, asc, eq, isNotNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles, constitutionVersions } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const versionA = searchParams.get("a");
  const versionB = searchParams.get("b");
  const locale = searchParams.get("locale") || "ro";
  let useEn = locale === "en";

  if (!versionA || !versionB) {
    return NextResponse.json(
      { error: "Both version parameters 'a' and 'b' are required" },
      { status: 400 },
    );
  }

  const yearA = Number.parseInt(versionA, 10);
  const yearB = Number.parseInt(versionB, 10);

  if (Number.isNaN(yearA) || Number.isNaN(yearB)) {
    return NextResponse.json({ error: "Invalid year parameters" }, { status: 400 });
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

    // When locale is EN, verify BOTH versions have English translations.
    // If either version lacks translations, fall back to Romanian for BOTH sides
    // to avoid comparing Romanian text against English text.
    if (useEn) {
      const [enCountA] = await db
        .select({ count: articles.id })
        .from(articles)
        .where(and(eq(articles.versionId, verA.id), isNotNull(articles.contentEn)))
        .limit(1);

      const [enCountB] = await db
        .select({ count: articles.id })
        .from(articles)
        .where(and(eq(articles.versionId, verB.id), isNotNull(articles.contentEn)))
        .limit(1);

      if (!enCountA?.count || !enCountB?.count) {
        useEn = false;
      }
    }

    // Fetch all articles for both versions
    const articlesA = await db
      .select()
      .from(articles)
      .where(eq(articles.versionId, verA.id))
      .orderBy(asc(articles.number));

    const articlesB = await db
      .select()
      .from(articles)
      .where(eq(articles.versionId, verB.id))
      .orderBy(asc(articles.number));

    // Create lookup maps by article number
    const mapA = new Map(articlesA.map((a) => [a.number, a]));
    const mapB = new Map(articlesB.map((a) => [a.number, a]));

    // Compute diff
    const allNumbers = new Set([...mapA.keys(), ...mapB.keys()]);
    const diff: Array<{
      articleNumber: number;
      status: "added" | "removed" | "modified" | "unchanged";
      a: { title: string | null; content: string } | null;
      b: { title: string | null; content: string } | null;
    }> = [];

    /** Pick locale-appropriate title and content from an article row */
    function localized(art: (typeof articlesA)[0]) {
      return {
        title: (useEn && art.titleEn) || art.title,
        content: (useEn && art.contentEn) || art.content,
      };
    }

    for (const num of [...allNumbers].sort((x, y) => x - y)) {
      const artA = mapA.get(num);
      const artB = mapB.get(num);

      if (artA && !artB) {
        diff.push({
          articleNumber: num,
          status: "removed",
          a: localized(artA),
          b: null,
        });
      } else if (!artA && artB) {
        diff.push({
          articleNumber: num,
          status: "added",
          a: null,
          b: localized(artB),
        });
      } else if (artA && artB) {
        const la = localized(artA);
        const lb = localized(artB);
        const isModified = la.content !== lb.content || la.title !== lb.title;
        diff.push({
          articleNumber: num,
          status: isModified ? "modified" : "unchanged",
          a: la,
          b: lb,
        });
      }
    }

    const summary = {
      added: diff.filter((d) => d.status === "added").length,
      removed: diff.filter((d) => d.status === "removed").length,
      modified: diff.filter((d) => d.status === "modified").length,
      unchanged: diff.filter((d) => d.status === "unchanged").length,
    };

    return NextResponse.json({ a: yearA, b: yearB, summary, diff });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to compute diff";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
