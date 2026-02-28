/**
 * Translate all constitution content to English using OpenRouter API.
 *
 * This script:
 * 1. Fetches all articles, structural units, and versions from the DB
 * 2. Translates Romanian content to English via OpenRouter
 * 3. Generates TipTap JSON for translated article content
 * 4. Updates the database with English translations
 *
 * Usage: node scripts/translate-content.mjs
 *
 * Resumes from where it left off — only translates rows with NULL _en columns.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ---------- Load environment ----------

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

const DATABASE_URL = process.env.DATABASE_URL?.replace("-pooler.", ".");
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}
if (!OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY not found");
  process.exit(1);
}

const { neon } = await import("@neondatabase/serverless");
const sql = neon(DATABASE_URL);

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash-001";

// ---------- TipTap generator (JS port of contentToTipTap) ----------

function textNode(text) {
  return { type: "text", text };
}

function paragraphNode(text) {
  return {
    type: "paragraph",
    content: text ? [textNode(text)] : [],
  };
}

function listItemNode(text) {
  return {
    type: "listItem",
    content: [paragraphNode(text)],
  };
}

function contentToTipTap(content) {
  const lines = content.split("\n");
  const docContent = [];
  let currentListItems = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList && currentListItems.length > 0) {
        docContent.push({ type: "orderedList", content: currentListItems });
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
      docContent.push({ type: "orderedList", content: currentListItems });
      currentListItems = [];
      inList = false;
    }

    docContent.push(paragraphNode(trimmed));
  }

  if (currentListItems.length > 0) {
    docContent.push({ type: "orderedList", content: currentListItems });
  }

  return {
    type: "doc",
    content: docContent.length > 0 ? docContent : [paragraphNode("")],
  };
}

// ---------- OpenRouter translation ----------

async function translateBatch(items, systemPrompt, retries = 3) {
  const userContent = JSON.stringify(items, null, 2);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://constitutia-romaniei.vercel.app",
          "X-Title": "Constitutia Romaniei - Translation",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.2,
          max_tokens: 16000,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const messageContent = data.choices?.[0]?.message?.content;
      if (!messageContent) throw new Error("Empty API response");

      // Extract JSON from response (may be wrapped in markdown code block)
      const jsonStr = messageContent
        .replace(/```json?\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      return JSON.parse(jsonStr);
    } catch (err) {
      console.warn(`  Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        await sleep(2000 * attempt);
      } else {
        throw err;
      }
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------- Translate constitution versions ----------

async function translateVersions() {
  console.log("\n=== Translating constitution versions ===\n");

  const versions = await sql`
    SELECT id, year, name, description
    FROM constitution_versions
    WHERE name_en IS NULL
    ORDER BY year
  `;

  if (versions.length === 0) {
    console.log("  All versions already translated.");
    return;
  }

  const prompt = `You are a professional Romanian-to-English translator specializing in legal and constitutional texts.

Translate the following Romanian constitution version names and descriptions to English.
Keep the translation formal and accurate. Preserve year references exactly.

Return a JSON array with the same structure, but with "name" and "description" fields translated to English.
Return ONLY valid JSON, no other text.`;

  const items = versions.map((v) => ({
    id: v.id,
    name: v.name,
    description: v.description,
  }));

  const translated = await translateBatch(items, prompt);

  for (const t of translated) {
    await sql`
      UPDATE constitution_versions
      SET name_en = ${t.name}, description_en = ${t.description}
      WHERE id = ${t.id}
    `;
    console.log(`  ✓ ${t.name}`);
  }
}

// ---------- Translate structural units ----------

async function translateStructuralUnits() {
  console.log("\n=== Translating structural units ===\n");

  const units = await sql`
    SELECT id, type, number, name
    FROM structural_units
    WHERE name_en IS NULL
    ORDER BY id
  `;

  if (units.length === 0) {
    console.log("  All structural units already translated.");
    return;
  }

  console.log(`  ${units.length} units to translate`);

  const BATCH_SIZE = 30;
  let translated = 0;

  for (let i = 0; i < units.length; i += BATCH_SIZE) {
    const batch = units.slice(i, i + BATCH_SIZE);

    const prompt = `You are a professional Romanian-to-English translator specializing in legal and constitutional texts.

Translate the "name" field of each structural unit from Romanian to English.
These are section names from the Romanian Constitution (Titles, Chapters, Sections).

Common patterns:
- "Principii generale" → "General Principles"
- "Drepturile, libertățile și îndatoririle fundamentale" → "Fundamental Rights, Freedoms and Duties"
- "Autoritățile publice" → "Public Authorities"
- "Parlamentul" → "Parliament"
- "Președintele României" → "President of Romania"

Return a JSON array with objects containing "id" and "name" (the English translation).
Return ONLY valid JSON, no other text.`;

    const items = batch.map((u) => ({
      id: u.id,
      name: u.name,
      type: u.type,
    }));

    try {
      const result = await translateBatch(items, prompt);

      for (const t of result) {
        await sql`
          UPDATE structural_units SET name_en = ${t.name} WHERE id = ${t.id}
        `;
      }

      translated += result.length;
      console.log(`  ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} units translated (${translated}/${units.length})`);
    } catch (err) {
      console.error(`  ✗ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${err.message}`);
    }

    // Rate limit delay
    if (i + BATCH_SIZE < units.length) {
      await sleep(1000);
    }
  }
}

// ---------- Translate articles ----------

async function translateArticles() {
  console.log("\n=== Translating articles ===\n");

  const articles = await sql`
    SELECT a.id, a.number, a.title, a.content, cv.year
    FROM articles a
    JOIN constitution_versions cv ON a.version_id = cv.id
    WHERE a.content_en IS NULL
    ORDER BY cv.year, a.order_index
  `;

  if (articles.length === 0) {
    console.log("  All articles already translated.");
    return;
  }

  console.log(`  ${articles.length} articles to translate`);

  // Batch articles by character count (~4000 chars per batch for good throughput)
  const MAX_BATCH_CHARS = 4000;
  const batches = [];
  let currentBatch = [];
  let currentChars = 0;

  for (const article of articles) {
    const articleChars = (article.content || "").length + (article.title || "").length;

    if (currentBatch.length > 0 && (currentChars + articleChars > MAX_BATCH_CHARS || currentBatch.length >= 8)) {
      batches.push(currentBatch);
      currentBatch = [];
      currentChars = 0;
    }

    currentBatch.push(article);
    currentChars += articleChars;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  console.log(`  Organized into ${batches.length} batches\n`);

  let translated = 0;
  let failed = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];

    const prompt = `You are a professional Romanian-to-English translator specializing in legal and constitutional texts.

Translate the following articles from the Romanian Constitution to English.
These are official legal texts — maintain formal legal language, accuracy, and preserve the exact structure.

Rules:
- Translate "title" (if present) and "content" fields to English
- Keep numbered paragraphs (1. 2. 3.) in the same format
- Keep lettered items (a) b) c)) in the same format
- Preserve line breaks between paragraphs
- Do NOT translate "Articolul" references within text — keep article numbers as-is
- Use standard English legal terminology

Return a JSON array with objects containing: "id", "title" (translated or null), "content" (translated).
Return ONLY valid JSON, no other text.`;

    const items = batch.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
    }));

    try {
      const result = await translateBatch(items, prompt);

      for (const t of result) {
        const tiptapEn = contentToTipTap(t.content);

        await sql`
          UPDATE articles
          SET title_en = ${t.title || null},
              content_en = ${t.content},
              content_tiptap_en = ${JSON.stringify(tiptapEn)}
          WHERE id = ${t.id}
        `;
      }

      translated += result.length;
      const year = batch[0]?.year;
      const pct = ((translated / articles.length) * 100).toFixed(1);
      console.log(`  ✓ Batch ${batchIdx + 1}/${batches.length} (${year}): ${result.length} articles (${translated}/${articles.length} = ${pct}%)`);
    } catch (err) {
      failed += batch.length;
      console.error(`  ✗ Batch ${batchIdx + 1}/${batches.length} FAILED: ${err.message}`);
      // Log failed article IDs for retry
      console.error(`    Failed IDs: ${batch.map((a) => a.id).join(", ")}`);
    }

    // Rate limit: 500ms between batches
    if (batchIdx < batches.length - 1) {
      await sleep(500);
    }
  }

  console.log(`\n  Translation complete: ${translated} translated, ${failed} failed`);
}

// ---------- Main ----------

async function main() {
  console.log("=== Constitution Content Translation Script ===");
  console.log(`Model: ${MODEL}`);
  console.log(`Database: ${DATABASE_URL.replace(/:[^:@]+@/, ":***@")}`);

  await translateVersions();
  await translateStructuralUnits();
  await translateArticles();

  // Final verification
  console.log("\n=== Verification ===\n");

  const stats = await sql`
    SELECT
      (SELECT COUNT(*) FROM constitution_versions WHERE name_en IS NOT NULL) as versions_en,
      (SELECT COUNT(*) FROM constitution_versions) as versions_total,
      (SELECT COUNT(*) FROM structural_units WHERE name_en IS NOT NULL) as units_en,
      (SELECT COUNT(*) FROM structural_units) as units_total,
      (SELECT COUNT(*) FROM articles WHERE content_en IS NOT NULL) as articles_en,
      (SELECT COUNT(*) FROM articles) as articles_total
  `;

  const s = stats[0];
  console.log(`  Versions: ${s.versions_en}/${s.versions_total} translated`);
  console.log(`  Structural units: ${s.units_en}/${s.units_total} translated`);
  console.log(`  Articles: ${s.articles_en}/${s.articles_total} translated`);

  const allDone =
    Number(s.versions_en) === Number(s.versions_total) &&
    Number(s.units_en) === Number(s.units_total) &&
    Number(s.articles_en) === Number(s.articles_total);

  if (allDone) {
    console.log("\n  ✅ All content translated successfully!");
  } else {
    console.log("\n  ⚠️  Some content not yet translated. Re-run the script to retry.");
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
