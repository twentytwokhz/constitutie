import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Check actual database connection
  return NextResponse.json({
    status: "ok",
    database: "pending",
    timestamp: new Date().toISOString(),
  });
}
