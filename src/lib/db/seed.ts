/**
 * Database Seed Script
 *
 * Parses the constitution markdown files from public/ directory
 * and populates the database with all 4 versions (1952, 1986, 1991, 2003).
 *
 * Usage: npm run db:seed
 *
 * This script:
 * 1. Reads markdown files from public/
 * 2. Parses structural hierarchy (Titles, Chapters, Sections, Articles)
 * 3. Extracts article content and alineate (numbered paragraphs)
 * 4. Detects inter-article references
 * 5. Generates TipTap JSON for each article
 * 6. Inserts everything into the database
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { type ParsedVersion, contentToTipTap, parseConstitution } from "../parser/index.js";
import * as schema from "./schema.js";

// Load environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  console.error("See .env.example for setup instructions.");
  process.exit(1);
}

const sqlClient = neon(DATABASE_URL);
const db = drizzle(sqlClient, { schema });

// ---------- File reading ----------

const PUBLIC_DIR = resolve(process.cwd(), "public");

function readConstitutionFile(year: number): string {
  const filePath = resolve(PUBLIC_DIR, `${year}.md`);
  try {
    return readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err);
    process.exit(1);
  }
}

// ---------- Database operations ----------

async function clearDatabase() {
  console.log("Clearing existing data...");
  // Delete in reverse order of dependencies
  await db.delete(schema.articleReferences);
  await db.delete(schema.comments);
  await db.delete(schema.votes);
  await db.delete(schema.articles);
  await db.delete(schema.structuralUnits);
  await db.delete(schema.constitutionVersions);
  console.log("Database cleared.");
}

async function seedVersion(parsed: ParsedVersion) {
  console.log(`\nSeeding ${parsed.name} (${parsed.year})...`);
  console.log(`  Structural units: ${parsed.units.length}`);
  console.log(`  Articles: ${parsed.articles.length}`);

  // 1. Insert constitution version
  const [version] = await db
    .insert(schema.constitutionVersions)
    .values({
      year: parsed.year,
      name: parsed.name,
      description: parsed.description,
      sourceFile: `public/${parsed.year}.md`,
      totalArticles: parsed.articles.length,
    })
    .returning();

  const versionId = version.id;
  console.log(`  Version ID: ${versionId}`);

  // 2. Insert structural units (need to maintain order for parent references)
  // Map from parser index to database ID
  const unitIdMap: Map<number, number> = new Map();

  for (let i = 0; i < parsed.units.length; i++) {
    const unit = parsed.units[i];

    // Resolve parent ID from the map
    const parentId =
      unit.parentIndex !== undefined ? (unitIdMap.get(unit.parentIndex) ?? null) : null;

    const [inserted] = await db
      .insert(schema.structuralUnits)
      .values({
        versionId,
        type: unit.type,
        number: unit.number,
        name: unit.name,
        parentId,
        orderIndex: unit.orderIndex,
        slug: unit.slug,
      })
      .returning();

    unitIdMap.set(i, inserted.id);
  }

  console.log(`  Inserted ${unitIdMap.size} structural units`);

  // 3. Insert articles
  // Map from article number to database ID (for reference resolution)
  const articleDbIds: Map<number, number[]> = new Map();

  for (const article of parsed.articles) {
    const structuralUnitId = unitIdMap.get(article.parentUnitIndex);
    if (structuralUnitId === undefined) {
      console.warn(
        `  WARNING: Article ${article.number} has no valid parent unit (index ${article.parentUnitIndex})`,
      );
      continue;
    }

    const tiptapContent = contentToTipTap(article.content);

    const [inserted] = await db
      .insert(schema.articles)
      .values({
        versionId,
        structuralUnitId,
        number: article.number,
        title: article.title,
        content: article.content,
        contentTiptap: tiptapContent,
        orderIndex: article.orderIndex,
        slug: article.slug,
        agreeCount: 0,
        disagreeCount: 0,
      })
      .returning();

    // Track by article number (may have duplicates in case of data irregularities)
    const existing = articleDbIds.get(article.number) || [];
    existing.push(inserted.id);
    articleDbIds.set(article.number, existing);
  }

  console.log(`  Inserted ${articleDbIds.size} unique article numbers`);

  // 4. Insert inter-article references
  let refCount = 0;
  for (const article of parsed.articles) {
    if (article.references.length === 0) continue;

    const sourceIds = articleDbIds.get(article.number);
    if (!sourceIds || sourceIds.length === 0) continue;
    const sourceArticleId = sourceIds[0];

    for (const refText of article.references) {
      // Extract target article number from reference text
      const numMatch = refText.match(/(\d+)/);
      if (!numMatch) continue;
      const targetNum = Number.parseInt(numMatch[1], 10);

      // Skip self-references
      if (targetNum === article.number) continue;

      const targetIds = articleDbIds.get(targetNum);
      if (!targetIds || targetIds.length === 0) continue;
      const targetArticleId = targetIds[0];

      await db.insert(schema.articleReferences).values({
        sourceArticleId,
        targetArticleId,
        referenceText: refText,
      });
      refCount++;
    }
  }

  console.log(`  Inserted ${refCount} article references`);

  return {
    versionId,
    articleCount: parsed.articles.length,
    unitCount: parsed.units.length,
    refCount,
  };
}

// ---------- Verification ----------

function verifyParsedData(parsed: ParsedVersion, expectedArticles: number) {
  const actualArticles = parsed.articles.length;
  const match = actualArticles >= expectedArticles - 5 && actualArticles <= expectedArticles + 5;

  console.log(
    `  ${parsed.year}: ${actualArticles} articles (expected ~${expectedArticles}) ${match ? "✓" : "✗ MISMATCH"}`,
  );

  // Check hierarchy integrity
  const titluri = parsed.units.filter((u) => u.type === "titlu");
  const capitole = parsed.units.filter((u) => u.type === "capitol");
  const sectiuni = parsed.units.filter((u) => u.type === "sectiune");

  console.log(
    `    Titluri: ${titluri.length}, Capitole: ${capitole.length}, Secțiuni: ${sectiuni.length}`,
  );

  // Check articles have titles where expected
  if (parsed.year === 1991 || parsed.year === 2003) {
    const withTitle = parsed.articles.filter((a) => a.title !== null);
    console.log(`    Articles with titles: ${withTitle.length}/${actualArticles}`);
  }

  // Check references
  const totalRefs = parsed.articles.reduce((sum, a) => sum + a.references.length, 0);
  console.log(`    Total references found: ${totalRefs}`);

  return match;
}

// ---------- Main ----------

async function main() {
  console.log("=== Constitution Database Seed Script ===\n");

  // Read all markdown files
  const years = [1952, 1986, 1991, 2003] as const;
  const expectedCounts: Record<number, number> = {
    1952: 105,
    1986: 121,
    1991: 152,
    2003: 157,
  };

  const parsedVersions: ParsedVersion[] = [];

  console.log("Parsing markdown files...\n");

  for (const year of years) {
    const markdown = readConstitutionFile(year);
    const parsed = parseConstitution(markdown, year);
    parsedVersions.push(parsed);
  }

  // Verify parsed data
  console.log("\nVerification of parsed data:");
  let allValid = true;
  for (const parsed of parsedVersions) {
    const valid = verifyParsedData(parsed, expectedCounts[parsed.year]);
    if (!valid) allValid = false;
  }

  const totalArticles = parsedVersions.reduce((sum, p) => sum + p.articles.length, 0);
  console.log(`\nTotal articles across all versions: ${totalArticles}`);

  // Clear and seed database
  await clearDatabase();

  const results = [];
  for (const parsed of parsedVersions) {
    const result = await seedVersion(parsed);
    results.push(result);
  }

  // Final summary
  console.log("\n=== Seed Complete ===");
  console.log(`Total versions: ${results.length}`);
  console.log(`Total articles: ${results.reduce((s, r) => s + r.articleCount, 0)}`);
  console.log(`Total structural units: ${results.reduce((s, r) => s + r.unitCount, 0)}`);
  console.log(`Total references: ${results.reduce((s, r) => s + r.refCount, 0)}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
