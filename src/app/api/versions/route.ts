import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { constitutionVersions } from "@/lib/db/schema";

export async function GET() {
  try {
    const versions = await db
      .select()
      .from(constitutionVersions)
      .orderBy(asc(constitutionVersions.year));

    return NextResponse.json(versions);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch versions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
