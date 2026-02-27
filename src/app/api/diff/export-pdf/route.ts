import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // TODO: Generate PDF with styled diff using @react-pdf/renderer
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
