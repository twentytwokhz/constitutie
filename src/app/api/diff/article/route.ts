import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const versionA = searchParams.get("a");
  const versionB = searchParams.get("b");
  const article = searchParams.get("article");
  // TODO: Compute diff for a specific article between two versions
  return NextResponse.json({ a: versionA, b: versionB, article, diff: null });
}
