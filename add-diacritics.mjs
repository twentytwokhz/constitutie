import { readFileSync, writeFileSync } from 'fs';

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = readFileSync('.env.local', 'utf-8')
  .match(/OPENROUTER_API_KEY=(.+)/)?.[1]?.trim();

if (!API_KEY) {
  console.error("No OpenRouter API key found in .env.local");
  process.exit(1);
}

const SYSTEM_PROMPT = `Ești un expert lingvist în limba română. Sarcina ta este să adaugi diacriticele corecte românești într-un text care nu are diacritice sau are diacritice greșite.

REGULI STRICTE:
1. Adaugă DOAR diacriticele corecte: ă, â, î, ș, ț (și variantele majuscule Ă, Â, Î, Ș, Ț)
2. Folosește DOAR variantele cu virgulă dedesubt (ș U+0219, ț U+021B), NU cu sedilă
3. NU modifica structura textului (markdown headings, liste numerotate, paragrafe)
4. NU modifica cuvintele — doar adaugă diacritice unde lipsesc
5. NU adăuga sau elimina spații, linii noi, sau formatare
6. NU traduce sau reformula nimic
7. Păstrează EXACT aceleași cuvinte, doar cu diacritice corecte
8. Returnează DOAR textul corectat, fără explicații sau comentarii

Exemple de corecții:
- "nastere" → "naștere"
- "taranimea" → "țărănimea"
- "orase" → "orașe"
- "invatamint" → "învățămînt" (ortografia anilor 1952/1986 folosea "î" în interior)
- "Rominia" → "România"
- "Romania" → "România"
- "stiinta" → "știință"
- "hotarire" → "hotărîre" (pentru texte din 1952/1986)

IMPORTANT: Pentru textele din 1952 și 1986, respectă ortografia epocii:
- Se folosea "î" din "i" în interiorul cuvintelor (nu "â"): "sînt", "cînd", "rînd", "pămînt" etc.
- Se folosea "â" doar la începutul și sfârșitul cuvintelor: "România", "român"
- "sunt" → "sînt", "cand" → "cînd", "pamant" → "pămînt"`;

async function diacritize(text, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://constitutia-romaniei.vercel.app",
          "X-Title": "Constitutia Romaniei - Diacritization",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Adaugă diacriticele corecte în următorul text:\n\n${text}` },
          ],
          temperature: 0.0,
          max_tokens: 8192,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`  API error (attempt ${attempt + 1}): ${response.status} - ${errText.substring(0, 200)}`);
        if (attempt < retries - 1) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        return null;
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        console.error(`  Empty response (attempt ${attempt + 1})`);
        if (attempt < retries - 1) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        return null;
      }

      return result.trim();
    } catch (err) {
      console.error(`  Error (attempt ${attempt + 1}):`, err.message);
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }
  return null;
}

function splitIntoChunks(text, maxChunkSize = 2500) {
  const lines = text.split('\n');
  const chunks = [];
  let current = [];
  let currentSize = 0;

  for (const line of lines) {
    // Start new chunk at article boundaries if current chunk is large enough
    if (line.match(/^#{2,5}\s/) && currentSize > 500) {
      chunks.push(current.join('\n'));
      current = [line];
      currentSize = line.length;
    } else {
      current.push(line);
      currentSize += line.length + 1;
    }

    if (currentSize >= maxChunkSize) {
      chunks.push(current.join('\n'));
      current = [];
      currentSize = 0;
    }
  }

  if (current.length > 0) {
    chunks.push(current.join('\n'));
  }

  return chunks;
}

async function processFile(filePath) {
  console.log(`\nProcessing ${filePath}...`);
  const text = readFileSync(filePath, 'utf-8');

  // Check if file already has good diacritics
  const hasDiacritics = (text.match(/[ăâîșț]/g) || []).length;
  const totalChars = text.length;
  console.log(`  Current diacritics count: ${hasDiacritics} in ${totalChars} chars`);

  const chunks = splitIntoChunks(text);
  console.log(`  Split into ${chunks.length} chunks`);

  const results = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Skip chunks that are only whitespace or markdown headers
    if (chunk.trim().length < 10) {
      results.push(chunk);
      continue;
    }

    console.log(`  Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)...`);
    const fixed = await diacritize(chunk);

    if (fixed) {
      results.push(fixed);
      // Brief stats
      const origDia = (chunk.match(/[ăâîșț]/gi) || []).length;
      const fixedDia = (fixed.match(/[ăâîșț]/gi) || []).length;
      console.log(`    Diacritics: ${origDia} → ${fixedDia} (+${fixedDia - origDia})`);
    } else {
      console.error(`    FAILED - keeping original chunk`);
      results.push(chunk);
    }

    // Rate limit: wait 500ms between requests
    if (i < chunks.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const finalText = results.join('\n');

  // Final validation: ensure no cedilla chars crept in
  const finalCleaned = finalText
    .replaceAll('\u015f', '\u0219')
    .replaceAll('\u015e', '\u0218')
    .replaceAll('\u0163', '\u021b')
    .replaceAll('\u0162', '\u021a');

  writeFileSync(filePath, finalCleaned);

  const newDiacritics = (finalCleaned.match(/[ăâîșț]/gi) || []).length;
  console.log(`  Done! Diacritics: ${hasDiacritics} → ${newDiacritics}`);
  console.log(`  File saved: ${filePath}`);
}

// Process 1952 and 1986 files
async function main() {
  console.log("Romanian Diacritization Script");
  console.log("==============================");

  await processFile('public/1952.md');
  await processFile('public/1986.md');

  console.log("\n\nVerification:");
  for (const f of ['public/1952.md', 'public/1986.md', 'public/1991.md', 'public/2003.md']) {
    const text = readFileSync(f, 'utf-8');
    const cedillaS = (text.match(/\u015f/g) || []).length;
    const cedillaT = (text.match(/\u0163/g) || []).length;
    const commaS = (text.match(/\u0219/g) || []).length;
    const commaT = (text.match(/\u021b/g) || []).length;
    const aBrv = (text.match(/\u0103/g) || []).length;
    const aCirc = (text.match(/\u00e2/g) || []).length;
    const iCirc = (text.match(/\u00ee/g) || []).length;
    console.log(`${f}: s_cedilla=${cedillaS} t_cedilla=${cedillaT} ș=${commaS} ț=${commaT} ă=${aBrv} â=${aCirc} î=${iCirc}`);
  }
}

main().catch(console.error);
