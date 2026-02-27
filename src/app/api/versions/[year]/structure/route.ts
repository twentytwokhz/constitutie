import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ year: string }> },
) {
  const { year } = await params;
  // TODO: Query database for hierarchical structure
  return NextResponse.json({ year, structure: [] });
}
