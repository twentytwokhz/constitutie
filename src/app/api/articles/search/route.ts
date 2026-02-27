import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  // TODO: Implement full-text search across all versions
  return NextResponse.json({ query, results: [] });
}
