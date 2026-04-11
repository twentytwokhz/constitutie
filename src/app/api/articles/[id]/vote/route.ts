import { and, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles, votes } from "@/lib/db/schema";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number.parseInt(id, 10);

  if (Number.isNaN(articleId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { voteType, fingerprintHash } = body;

    if (!voteType || (voteType !== "agree" && voteType !== "disagree")) {
      return NextResponse.json(
        { error: "voteType must be 'agree' or 'disagree'" },
        { status: 400 },
      );
    }

    if (!fingerprintHash || typeof fingerprintHash !== "string") {
      return NextResponse.json({ error: "Fingerprint hash is required" }, { status: 400 });
    }

    // Rate limiting: combine IP + fingerprint for unique identifier
    const ip =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `votes:${ip}:${fingerprintHash}`;
    const rateCheck = checkRateLimit(rateLimitKey, RATE_LIMITS.votes);

    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Prea multe voturi într-un timp scurt. Vă rugăm să așteptați.",
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
    const [article] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Check for existing vote by this fingerprint on this article
    const [existingVote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.articleId, articleId), eq(votes.fingerprintHash, fingerprintHash)))
      .limit(1);

    if (existingVote) {
      return NextResponse.json(
        { error: "Already voted on this article", existingVote: existingVote.voteType },
        { status: 409 },
      );
    }

    // Insert the vote
    const [newVote] = await db
      .insert(votes)
      .values({
        articleId,
        voteType,
        fingerprintHash,
      })
      .returning();

    // Update the article's vote count
    if (voteType === "agree") {
      await db
        .update(articles)
        .set({ agreeCount: sql`${articles.agreeCount} + 1` })
        .where(eq(articles.id, articleId));
    } else {
      await db
        .update(articles)
        .set({ disagreeCount: sql`${articles.disagreeCount} + 1` })
        .where(eq(articles.id, articleId));
    }

    return NextResponse.json(newVote, {
      status: 201,
      headers: {
        "X-RateLimit-Limit": String(rateCheck.limit),
        "X-RateLimit-Remaining": String(rateCheck.remaining),
        "X-RateLimit-Reset": String(Math.ceil(rateCheck.resetAt / 1000)),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to record vote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
