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
 *
 * Note: Uses non-pooled Neon connection for consistent writes.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { contentToTipTap, type ParsedVersion, parseConstitution } from "../parser/index.js";
import * as schema from "./schema.js";

// Load environment
let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  console.error("See .env.example for setup instructions.");
  process.exit(1);
}

// For seeding, use non-pooled connection to ensure write consistency.
// Neon pooled connections (with -pooler in hostname) can route writes
// to different connections causing FK visibility issues.
DATABASE_URL = DATABASE_URL.replace("-pooler.", ".");

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
  // Use TRUNCATE CASCADE with RESTART IDENTITY to reset serial sequences
  await db.execute(
    sql`TRUNCATE TABLE article_references, comments, votes, articles, structural_units, constitution_versions RESTART IDENTITY CASCADE`,
  );
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

  // 2. Insert structural units in two passes:
  //    Pass 1: Insert all units WITHOUT parent_id to get their DB IDs
  //    Pass 2: UPDATE parent_ids using the ID map
  const unitIdMap: Map<number, number> = new Map();

  // Pass 1: Insert without parents
  for (let i = 0; i < parsed.units.length; i++) {
    const unit = parsed.units[i];

    const [inserted] = await db
      .insert(schema.structuralUnits)
      .values({
        versionId,
        type: unit.type,
        number: unit.number,
        name: unit.name,
        parentId: null,
        orderIndex: unit.orderIndex,
        slug: unit.slug,
      })
      .returning();

    unitIdMap.set(i, inserted.id);
  }

  // Pass 2: Update parent_ids
  for (let i = 0; i < parsed.units.length; i++) {
    const unit = parsed.units[i];
    if (unit.parentIndex === undefined) continue;

    const dbId = unitIdMap.get(i);
    const parentDbId = unitIdMap.get(unit.parentIndex);
    if (dbId === undefined || parentDbId === undefined) continue;

    await db.execute(sql`UPDATE structural_units SET parent_id = ${parentDbId} WHERE id = ${dbId}`);
  }

  console.log(`  Inserted ${unitIdMap.size} structural units`);

  // 3. Insert articles in batches
  const articleDbIds: Map<number, number[]> = new Map();

  // Prepare all article rows
  const articleRows = parsed.articles
    .map((article) => {
      const structuralUnitId = unitIdMap.get(article.parentUnitIndex);
      if (structuralUnitId === undefined) {
        console.warn(
          `  WARNING: Article ${article.number} has no valid parent unit (index ${article.parentUnitIndex})`,
        );
        return null;
      }

      const tiptapContent = contentToTipTap(article.content);

      return {
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
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  // Insert in batches and collect IDs
  const articleBatchSize = 30;
  let articleIdx = 0;
  for (let i = 0; i < articleRows.length; i += articleBatchSize) {
    const batch = articleRows.slice(i, i + articleBatchSize);
    const inserted = await db.insert(schema.articles).values(batch).returning();

    for (const row of inserted) {
      const articleNum = parsed.articles[articleIdx]?.number;
      if (articleNum !== undefined) {
        const existing = articleDbIds.get(articleNum) || [];
        existing.push(row.id);
        articleDbIds.set(articleNum, existing);
      }
      articleIdx++;
    }
  }

  console.log(`  Inserted ${articleIdx} articles (${articleDbIds.size} unique numbers)`);

  // 4. Insert inter-article references in batches
  const refRows: Array<{
    sourceArticleId: number;
    targetArticleId: number;
    referenceText: string;
  }> = [];

  for (const article of parsed.articles) {
    if (article.references.length === 0) continue;

    const sourceIds = articleDbIds.get(article.number);
    if (!sourceIds || sourceIds.length === 0) continue;
    const sourceArticleId = sourceIds[0];

    for (const refText of article.references) {
      const numMatch = refText.match(/(\d+)/);
      if (!numMatch) continue;
      const targetNum = Number.parseInt(numMatch[1], 10);

      // Skip self-references
      if (targetNum === article.number) continue;

      const targetIds = articleDbIds.get(targetNum);
      if (!targetIds || targetIds.length === 0) continue;
      const targetArticleId = targetIds[0];

      refRows.push({ sourceArticleId, targetArticleId, referenceText: refText });
    }
  }

  if (refRows.length > 0) {
    await db.insert(schema.articleReferences).values(refRows);
  }

  console.log(`  Inserted ${refRows.length} article references`);

  return {
    versionId,
    articleCount: parsed.articles.length,
    unitCount: parsed.units.length,
    refCount: refRows.length,
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
  let _allValid = true;
  for (const parsed of parsedVersions) {
    const valid = verifyParsedData(parsed, expectedCounts[parsed.year]);
    if (!valid) _allValid = false;
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
