/**
 * Verify translations were stored correctly in the database.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL.replace("-pooler.", "."));

// Sample versions
const versions = await sql`SELECT year, name, name_en, LEFT(description_en, 100) as desc_en FROM constitution_versions ORDER BY year`;
console.log("=== VERSIONS ===");
for (const r of versions) {
  console.log(`  ${r.year}: ${r.name} → ${r.name_en}`);
  console.log(`    Desc EN: ${r.desc_en}`);
}

// Sample structural units
const units = await sql`SELECT type, name, name_en FROM structural_units WHERE name_en IS NOT NULL ORDER BY id LIMIT 6`;
console.log("\n=== STRUCTURAL UNITS (sample) ===");
for (const r of units) {
  console.log(`  ${r.type}: "${r.name}" → "${r.name_en}"`);
}

// Sample articles from 2003 (with titles)
const articles2003 = await sql`
  SELECT a.number, a.title, a.title_en, LEFT(a.content_en, 150) as content_en
  FROM articles a JOIN constitution_versions cv ON a.version_id = cv.id
  WHERE cv.year = 2003 AND a.title IS NOT NULL
  ORDER BY a.number LIMIT 3
`;
console.log("\n=== 2003 ARTICLES (sample) ===");
for (const r of articles2003) {
  console.log(`  Art. ${r.number}: "${r.title}" → "${r.title_en}"`);
  console.log(`    EN: ${r.content_en}...`);
}

// Sample article from 1952 (no titles)
const articles1952 = await sql`
  SELECT a.number, LEFT(a.content, 80) as content_ro, LEFT(a.content_en, 80) as content_en
  FROM articles a JOIN constitution_versions cv ON a.version_id = cv.id
  WHERE cv.year = 1952
  ORDER BY a.number LIMIT 2
`;
console.log("\n=== 1952 ARTICLES (sample) ===");
for (const r of articles1952) {
  console.log(`  Art. ${r.number}:`);
  console.log(`    RO: ${r.content_ro}`);
  console.log(`    EN: ${r.content_en}`);
}

// Check TipTap JSON
const tiptap = await sql`SELECT id, number, content_tiptap_en IS NOT NULL as has_tiptap_en FROM articles ORDER BY id LIMIT 5`;
console.log("\n=== TIPTAP EN JSON ===");
for (const r of tiptap) {
  console.log(`  Art. ${r.number}: has content_tiptap_en = ${r.has_tiptap_en}`);
}

// NULL counts
const nulls = await sql`
  SELECT
    (SELECT COUNT(*) FROM articles WHERE content_en IS NULL) as null_content,
    (SELECT COUNT(*) FROM articles WHERE content_tiptap_en IS NULL) as null_tiptap,
    (SELECT COUNT(*) FROM structural_units WHERE name_en IS NULL) as null_units,
    (SELECT COUNT(*) FROM constitution_versions WHERE name_en IS NULL) as null_versions
`;
const n = nulls[0];
console.log("\n=== NULL CHECK (should all be 0) ===");
console.log(`  Articles content_en NULL: ${n.null_content}`);
console.log(`  Articles content_tiptap_en NULL: ${n.null_tiptap}`);
console.log(`  Structural units name_en NULL: ${n.null_units}`);
console.log(`  Versions name_en NULL: ${n.null_versions}`);

const allGood = n.null_content === "0" && n.null_tiptap === "0" && n.null_units === "0" && n.null_versions === "0";
console.log(`\n${allGood ? "✅ ALL TRANSLATIONS VERIFIED" : "⚠️ SOME TRANSLATIONS MISSING"}`);
