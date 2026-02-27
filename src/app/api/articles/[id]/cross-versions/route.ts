import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // TODO: Find same article across all constitution versions
  return NextResponse.json({ articleId: id, versions: [] });
}
