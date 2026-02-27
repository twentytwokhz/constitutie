import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // TODO: Implement voting with fingerprint deduplication
  return NextResponse.json({ articleId: id, message: "Not implemented" }, { status: 501 });
}
