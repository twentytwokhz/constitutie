import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // TODO: Return approved comments for article
  return NextResponse.json([]);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // TODO: Create comment with AI moderation via OpenRouter
  return NextResponse.json({ articleId: id, message: "Not implemented" }, { status: 501 });
}
