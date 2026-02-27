import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ year: string; number: string }> },
) {
  const { year, number } = await params;
  // TODO: Query database for specific article
  return NextResponse.json({ year, number, message: "Not implemented" }, { status: 501 });
}
