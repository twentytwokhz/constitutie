/**
 * Fix specific diacritics issues in the database.
 *
 * Updates only the 2 affected articles without touching translations or other data.
 * Regenerates TipTap JSON for updated content.
 *
 * Fixes:
 * 1. Article 18, 1991: "Constitutie" → "Constituție"
 * 2. Article 150, 1991: "masura" → "măsura"
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  const val = trimmed.slice(eqIdx + 1);
  if (!process.env[key]) process.env[key] = val;
}

const { neon } = await import('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL.replace('-pooler.', '.'));

// TipTap JSON generation (must match parser's contentToTipTap)
function textNode(text) {
  return { type: 'text', text };
}

function paragraphNode(text) {
  return {
    type: 'paragraph',
    content: text ? [textNode(text)] : [],
  };
}

function listItemNode(text) {
  return {
    type: 'listItem',
    content: [paragraphNode(text)],
  };
}

function contentToTipTap(content) {
  const lines = content.split('\n');
  const docContent = [];
  let currentListItems = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList && currentListItems.length > 0) {
        docContent.push({ type: 'orderedList', content: currentListItems });
        currentListItems = [];
        inList = false;
      }
      continue;
    }

    const listMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (listMatch) {
      inList = true;
      currentListItems.push(listItemNode(listMatch[2]));
      continue;
    }

    const letterMatch = trimmed.match(/^(?:-\s+)?([a-z]\))\s+(.+)$/);
    if (letterMatch) {
      inList = true;
      currentListItems.push(listItemNode(`${letterMatch[1]} ${letterMatch[2]}`));
      continue;
    }

    if (inList && currentListItems.length > 0) {
      docContent.push({ type: 'orderedList', content: currentListItems });
      currentListItems = [];
      inList = false;
    }

    docContent.push(paragraphNode(trimmed));
  }

  if (currentListItems.length > 0) {
    docContent.push({ type: 'orderedList', content: currentListItems });
  }

  return {
    type: 'doc',
    content: docContent.length > 0 ? docContent : [paragraphNode('')],
  };
}

console.log('=== Fix DB Diacritics ===\n');

// Get the version ID for 1991
const versionResult = await sql`SELECT id FROM constitution_versions WHERE year = 1991`;
if (versionResult.length === 0) {
  console.error('ERROR: Version 1991 not found in DB');
  process.exit(1);
}
const versionId = versionResult[0].id;
console.log(`1991 version ID: ${versionId}`);

// Fix 1: Article 18 — "Constitutie" → "Constituție"
const art18 = await sql`
  SELECT id, content FROM articles
  WHERE version_id = ${versionId} AND number = 18
`;
if (art18.length > 0) {
  const oldContent = art18[0].content;
  if (oldContent.includes('Constitutie')) {
    const newContent = oldContent.replace(/Constitutie/g, 'Constituție');
    const newTiptap = contentToTipTap(newContent);

    await sql`
      UPDATE articles
      SET content = ${newContent}, content_tiptap = ${JSON.stringify(newTiptap)}
      WHERE id = ${art18[0].id}
    `;
    console.log(`✅ Article 18: Fixed "Constitutie" → "Constituție"`);
    console.log(`   Content preview: "${newContent.substring(0, 100)}..."`);
  } else {
    console.log(`ℹ️  Article 18: Already correct (no "Constitutie" found)`);
  }
} else {
  console.log('⚠️  Article 18 not found in 1991 version');
}

// Fix 2: Article 150 — "masura" → "măsura"
const art150 = await sql`
  SELECT id, content FROM articles
  WHERE version_id = ${versionId} AND number = 150
`;
if (art150.length > 0) {
  const oldContent = art150[0].content;
  if (oldContent.includes('masura')) {
    const newContent = oldContent.replace(/\bmasura\b/g, 'măsura');
    const newTiptap = contentToTipTap(newContent);

    await sql`
      UPDATE articles
      SET content = ${newContent}, content_tiptap = ${JSON.stringify(newTiptap)}
      WHERE id = ${art150[0].id}
    `;
    console.log(`✅ Article 150: Fixed "masura" → "măsura"`);
    console.log(`   Content preview: "${newContent.substring(0, 120)}..."`);
  } else {
    console.log(`ℹ️  Article 150: Already correct (no "masura" found)`);
  }
} else {
  console.log('⚠️  Article 150 not found in 1991 version');
}

// Verification: check no more cedilla/missing diacritics in the fixed articles
console.log('\n--- Verification ---');
const verify = await sql`
  SELECT a.number, a.content
  FROM articles a
  JOIN constitution_versions cv ON a.version_id = cv.id
  WHERE cv.year = 1991 AND a.number IN (18, 150)
  ORDER BY a.number
`;
for (const row of verify) {
  const hasCedillaS = (row.content.match(/\u015F/g) || []).length;
  const hasCedillaT = (row.content.match(/\u0163/g) || []).length;
  const hasConstitutie = row.content.includes('Constitutie');
  const hasMasura = /\bmasura\b/.test(row.content);

  console.log(`Art. ${row.number}:`);
  console.log(`  cedilla_s: ${hasCedillaS}, cedilla_t: ${hasCedillaT}`);
  console.log(`  "Constitutie": ${hasConstitutie}, "masura": ${hasMasura}`);

  if (hasCedillaS + hasCedillaT === 0 && !hasConstitutie && !hasMasura) {
    console.log(`  ✅ Clean`);
  } else {
    console.log(`  ⚠️  Issues remain`);
  }
}

// Also do a broader sweep: check ALL 1991 articles for any remaining wrong diacritics
console.log('\n--- Broad sweep: all 1991 articles ---');
const allArticles = await sql`
  SELECT a.number, a.content
  FROM articles a
  JOIN constitution_versions cv ON a.version_id = cv.id
  WHERE cv.year = 1991
  ORDER BY a.number
`;

let broadIssues = 0;
for (const row of allArticles) {
  const hasCedillaS = (row.content.match(/\u015F/g) || []).length;
  const hasCedillaT = (row.content.match(/\u0163/g) || []).length;
  if (hasCedillaS > 0 || hasCedillaT > 0) {
    console.log(`  ⚠️  Art. ${row.number}: cedilla_s=${hasCedillaS}, cedilla_t=${hasCedillaT}`);
    broadIssues++;
  }
}
if (broadIssues === 0) {
  console.log('  ✅ All 1991 articles clean — no cedilla characters');
}

console.log('\n=== Done ===');
