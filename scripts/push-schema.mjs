/**
 * Push schema changes to the Neon database.
 * Adds _en translation columns to constitution_versions, structural_units, and articles.
 *
 * Usage: node scripts/push-schema.mjs
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  const value = trimmed.slice(eqIdx + 1);
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

// Use non-pooler connection for DDL
const connUrl = DATABASE_URL.replace("-pooler.", ".");

const { neon } = await import("@neondatabase/serverless");
const sql = neon(connUrl);

console.log("Adding translation columns to database...\n");

// Add columns one by one (IF NOT EXISTS for idempotency)
const alterStatements = [
  // constitution_versions
  `ALTER TABLE constitution_versions ADD COLUMN IF NOT EXISTS name_en TEXT`,
  `ALTER TABLE constitution_versions ADD COLUMN IF NOT EXISTS description_en TEXT`,
  // structural_units
  `ALTER TABLE structural_units ADD COLUMN IF NOT EXISTS name_en TEXT`,
  // articles
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS title_en TEXT`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_en TEXT`,
  `ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_tiptap_en JSONB`,
];

for (const stmt of alterStatements) {
  try {
    await sql(stmt);
    console.log(`  ✓ ${stmt.split("ADD COLUMN")[1]?.trim()}`);
  } catch (err) {
    console.error(`  ✗ Failed: ${stmt}`);
    console.error(`    ${err.message}`);
  }
}

console.log("\nSchema migration complete!");

// Verify columns exist
const result = await sql`
  SELECT column_name, table_name
  FROM information_schema.columns
  WHERE table_name IN ('constitution_versions', 'structural_units', 'articles')
    AND column_name LIKE '%_en'
  ORDER BY table_name, column_name
`;

console.log("\nVerification - English columns found:");
for (const row of result) {
  console.log(`  ${row.table_name}.${row.column_name}`);
}
