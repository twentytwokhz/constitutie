import { db } from "@/lib/db";
import { articles, comments } from "@/lib/db/schema";
import { moderateComment } from "@/lib/moderation";
import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number.parseInt(id, 10);

  if (Number.isNaN(articleId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  try {
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.articleId, articleId))
      .orderBy(desc(comments.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number.parseInt(id, 10);

  if (Number.isNaN(articleId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { content, selectedText, fingerprintHash } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    if (!fingerprintHash || typeof fingerprintHash !== "string") {
      return NextResponse.json({ error: "Fingerprint hash is required" }, { status: 400 });
    }

    // Verify the article exists
    const article = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);

    if (article.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // AI moderation via OpenRouter
    const moderation = await moderateComment(content.trim());

    const status = moderation.approved ? "approved" : "rejected";

    const [newComment] = await db
      .insert(comments)
      .values({
        articleId,
        content: content.trim(),
        selectedText: selectedText || null,
        status,
        rejectionReason: moderation.reason,
        fingerprintHash,
        ipHash: request.headers.get("x-forwarded-for") || "unknown",
      })
      .returning();

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
