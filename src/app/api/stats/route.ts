import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Query database for aggregated statistics
  return NextResponse.json({
    total_articles: 0,
    total_versions: 4,
    total_references: 0,
    total_comments: 0,
  });
}
