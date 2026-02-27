import { db } from "@/lib/db";
import { constitutionVersions, structuralUnits } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ year: string }> },
) {
  try {
    const { year } = await params;
    const yearNum = Number.parseInt(year, 10);

    if (Number.isNaN(yearNum)) {
      return NextResponse.json({ error: "Invalid year parameter" }, { status: 400 });
    }

    const [version] = await db
      .select({ id: constitutionVersions.id })
      .from(constitutionVersions)
      .where(eq(constitutionVersions.year, yearNum))
      .limit(1);

    if (!version) {
      return NextResponse.json({ error: `Version ${year} not found` }, { status: 404 });
    }

    const units = await db
      .select()
      .from(structuralUnits)
      .where(eq(structuralUnits.versionId, version.id))
      .orderBy(asc(structuralUnits.orderIndex));

    return NextResponse.json({ year: yearNum, structure: units });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch structure";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
