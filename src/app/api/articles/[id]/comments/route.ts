import { and, desc, eq, gt } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles, comments } from "@/lib/db/schema";
import { moderateComment } from "@/lib/moderation";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number.parseInt(id, 10);

  if (Number.isNaN(articleId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  try {
    // Only return approved comments to the public (filter out pending/rejected)
    const result = await db
      .select()
      .from(comments)
      .where(and(eq(comments.articleId, articleId), eq(comments.status, "approved")))
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

    // Max length validation — prevent abuse via excessively long payloads
    const MAX_COMMENT_LENGTH = 10000;
    if (content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        {
          error: `Comentariul este prea lung. Limita este de ${MAX_COMMENT_LENGTH} caractere.`,
          maxLength: MAX_COMMENT_LENGTH,
          actualLength: content.length,
        },
        { status: 400 },
      );
    }

    // Sanitize HTML/script tags — strip all HTML to prevent stored XSS
    const sanitizedContent = content.replace(/<[^>]*>/g, "").trim();
    if (sanitizedContent.length === 0) {
      return NextResponse.json(
        { error: "Comentariul nu poate conține doar etichete HTML." },
        { status: 400 },
      );
    }

    if (!fingerprintHash || typeof fingerprintHash !== "string") {
      return NextResponse.json({ error: "Fingerprint hash is required" }, { status: 400 });
    }

    // Rate limiting: combine IP + fingerprint for unique identifier
    const ip =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `comments:${ip}:${fingerprintHash}`;
    const rateCheck = checkRateLimit(rateLimitKey, RATE_LIMITS.comments);

    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Prea multe comentarii într-un timp scurt. Vă rugăm să așteptați.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(rateCheck.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rateCheck.resetAt / 1000)),
          },
        },
      );
    }

    // Verify the article exists
    const article = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);

    if (article.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Deduplication: prevent duplicate comments from back-button resubmit
    // Check if the same fingerprint already posted the same content on this article
    // within the last 5 minutes — return the existing comment instead of duplicating.
    const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
    const dedupCutoff = new Date(Date.now() - DEDUP_WINDOW_MS);

    const existingDuplicate = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.articleId, articleId),
          eq(comments.fingerprintHash, fingerprintHash),
          eq(comments.content, sanitizedContent),
          gt(comments.createdAt, dedupCutoff),
        ),
      )
      .limit(1);

    if (existingDuplicate.length > 0) {
      // Idempotent: return the existing comment as if it was just created
      return NextResponse.json(existingDuplicate[0], { status: 200 });
    }

    // AI moderation via OpenRouter (uses sanitized content)
    const moderation = await moderateComment(sanitizedContent);

    const status = moderation.approved ? "approved" : "rejected";

    const [newComment] = await db
      .insert(comments)
      .values({
        articleId,
        content: sanitizedContent,
        selectedText: selectedText || null,
        status,
        rejectionReason: moderation.reason,
        fingerprintHash,
        ipHash: request.headers.get("x-forwarded-for") || "unknown",
      })
      .returning();

    return NextResponse.json(newComment, {
      status: 201,
      headers: {
        "X-RateLimit-Limit": String(rateCheck.limit),
        "X-RateLimit-Remaining": String(rateCheck.remaining),
        "X-RateLimit-Reset": String(Math.ceil(rateCheck.resetAt / 1000)),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
