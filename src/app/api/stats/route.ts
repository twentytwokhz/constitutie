import { db } from "@/lib/db";
import { articleReferences, articles, comments, constitutionVersions } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [versionsCount] = await db.select({ value: count() }).from(constitutionVersions);

    const [articlesCount] = await db.select({ value: count() }).from(articles);

    const [referencesCount] = await db.select({ value: count() }).from(articleReferences);

    const [commentsCount] = await db
      .select({ value: count() })
      .from(comments)
      .where(eq(comments.status, "approved"));

    return NextResponse.json({
      total_articles: articlesCount?.value ?? 0,
      total_versions: versionsCount?.value ?? 0,
      total_references: referencesCount?.value ?? 0,
      total_comments: commentsCount?.value ?? 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch statistics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
