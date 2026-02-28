/**
 * Export all English translations from the database to JSON files.
 *
 * Creates public/translations/ directory with one JSON file per table:
 * - versions-en.json: { year -> { nameEn, descriptionEn } }
 * - units-en.json: { "versionYear:type:number:slug" -> nameEn }
 * - articles-en.json: { "versionYear:number" -> { titleEn, contentEn, contentTiptapEn } }
 *
 * These files are used by the seed script to populate English content
 * after a DB reset without requiring re-translation via OpenRouter API.
 *
 * Usage: node scripts/export-translations.mjs
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Load environment
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  const value = trimmed.slice(eqIdx + 1);
  if (!process.env[key]) process.env[key] = value;
}

const DATABASE_URL = process.env.DATABASE_URL?.replace("-pooler.", ".");
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const { neon } = await import("@neondatabase/serverless");
const sql = neon(DATABASE_URL);

const outDir = resolve(process.cwd(), "public", "translations");
mkdirSync(outDir, { recursive: true });

// Export version translations
console.log("Exporting version translations...");
const versions = await sql`
  SELECT year, name_en, description_en
  FROM constitution_versions
  WHERE name_en IS NOT NULL
  ORDER BY year
`;
const versionsMap = {};
for (const v of versions) {
  versionsMap[v.year] = { nameEn: v.name_en, descriptionEn: v.description_en };
}
writeFileSync(resolve(outDir, "versions-en.json"), JSON.stringify(versionsMap, null, 2));
console.log(`  ✓ ${versions.length} versions exported`);

// Export structural unit translations
console.log("Exporting structural unit translations...");
const units = await sql`
  SELECT su.type, su.number, su.slug, su.name_en, cv.year
  FROM structural_units su
  JOIN constitution_versions cv ON su.version_id = cv.id
  WHERE su.name_en IS NOT NULL
  ORDER BY cv.year, su.order_index
`;
const unitsMap = {};
for (const u of units) {
  const key = `${u.year}:${u.type}:${u.number}:${u.slug}`;
  unitsMap[key] = u.name_en;
}
writeFileSync(resolve(outDir, "units-en.json"), JSON.stringify(unitsMap, null, 2));
console.log(`  ✓ ${units.length} structural units exported`);

// Export article translations
console.log("Exporting article translations...");
const articles = await sql`
  SELECT a.number, a.title_en, a.content_en, a.content_tiptap_en, cv.year
  FROM articles a
  JOIN constitution_versions cv ON a.version_id = cv.id
  WHERE a.content_en IS NOT NULL
  ORDER BY cv.year, a.order_index
`;
const articlesMap = {};
for (const a of articles) {
  const key = `${a.year}:${a.number}`;
  articlesMap[key] = {
    titleEn: a.title_en,
    contentEn: a.content_en,
    contentTiptapEn: a.content_tiptap_en,
  };
}
writeFileSync(resolve(outDir, "articles-en.json"), JSON.stringify(articlesMap, null, 2));
console.log(`  ✓ ${articles.length} articles exported`);

console.log(`\n✅ All translations exported to ${outDir}/`);
