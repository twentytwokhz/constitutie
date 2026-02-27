import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const versionA = searchParams.get("a");
  const versionB = searchParams.get("b");
  // TODO: Compute diff between two constitution versions
  return NextResponse.json({ a: versionA, b: versionB, diff: [] });
}
