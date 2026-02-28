import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  articleReferences,
  articles,
  comments,
  constitutionVersions,
  votes,
} from "@/lib/db/schema";

// Ensure stats are always fresh — never cached
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [versionsCount] = await db.select({ value: count() }).from(constitutionVersions);

    const [articlesCount] = await db.select({ value: count() }).from(articles);

    const [referencesCount] = await db.select({ value: count() }).from(articleReferences);

    const [commentsCount] = await db
      .select({ value: count() })
      .from(comments)
      .where(eq(comments.status, "approved"));

    const [votesCount] = await db.select({ value: count() }).from(votes);

    return NextResponse.json({
      total_articles: articlesCount?.value ?? 0,
      total_versions: versionsCount?.value ?? 0,
      total_references: referencesCount?.value ?? 0,
      total_comments: commentsCount?.value ?? 0,
      total_votes: votesCount?.value ?? 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch statistics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
