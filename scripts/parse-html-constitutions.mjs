/**
 * Parse HTML constitution files from cdep.ro into markdown format
 * compatible with the project's parser.
 *
 * Usage: node scripts/parse-html-constitutions.mjs
 *
 * Input: /var/folders/jv/w5f06pdj1g57_0rc6h90c0s80000gn/T/const{year}.html
 * Output: public/{year}.md
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const TMPDIR = "/var/folders/jv/w5f06pdj1g57_0rc6h90c0s80000gn/T";
const PUBLIC_DIR = resolve(process.cwd(), "public");

/**
 * Decode ISO-8859-2 (Latin-2) buffer to string.
 * cdep.ro uses ISO-8859-2 encoding for Romanian characters.
 */
function decodeISO88592(buffer) {
  // Use TextDecoder with ISO-8859-2
  const decoder = new TextDecoder("iso-8859-2");
  return decoder.decode(buffer);
}

/**
 * Strip HTML tags and decode HTML entities
 */
function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "\n\n")
    .replace(/<dd>/gi, "\n  ")
    .replace(/<\/dd>/gi, "")
    .replace(/<\/?b>/gi, "")
    .replace(/<\/?i>/gi, "")
    .replace(/<\/?font[^>]*>/gi, "")
    .replace(/<\/?div[^>]*>/gi, "")
    .replace(/<\/?span[^>]*>/gi, "")
    .replace(/<\/?a[^>]*>/gi, "")
    .replace(/<hr[^>]*>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<\/?table[^>]*>/gi, "")
    .replace(/<\/?tr[^>]*>/gi, "")
    .replace(/<\/?td[^>]*>/gi, "")
    .replace(/<\/?h\d[^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

/**
 * Extract the main content from the HTML page (between the table header and the footer)
 */
function extractContent(html) {
  // The content starts after the table/header section
  // and before the <hr> footer
  let content = html;

  // Remove everything before the first TITLUL or Art.
  const titleMatch = content.match(/(?:<p[^>]*>)\s*(?:TITLUL|CAPITOLUL|Art\.)\s/i);
  if (titleMatch) {
    content = content.substring(titleMatch.index);
  }

  // Remove footer
  const footerMatch = content.indexOf("<hr");
  if (footerMatch > 0) {
    content = content.substring(0, footerMatch);
  }

  return content;
}

/**
 * Parse the HTML content into structured markdown.
 *
 * Detects:
 * - TITLUL I/II/III... = ## heading
 * - CAPITOLUL I/II... = ### heading (under Titlul III for 1866, or standalone for 1948)
 * - SECTIUNEA I/II... = #### heading
 * - Art. N. = article heading
 *
 * For 1866, 1923, 1938: Uses Titlul structure (like 1986 format - ## Titlul N.)
 * For 1948: Uses Titlul + Capitolul structure
 * For 1965: Uses Titlul structure (like 1986 format)
 */
function parseToMarkdown(html, year) {
  const content = extractContent(html);
  const stripped = stripHtml(content);

  const lines = stripped.split("\n").map((l) => l.trim()).filter(Boolean);
  const mdLines = [];

  // Track current structural context
  let inArticle = false;
  let lastArticleNum = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect TITLUL
    const titluMatch = line.match(
      /^TITLUL\s+([IVXLCDM]+)\s*(?:[-.]?\s*)?$/i
    );
    if (titluMatch) {
      const romanNum = romanToArabic(titluMatch[1]);
      // Next line should be the title name
      let titleName = "";
      if (i + 1 < lines.length && !lines[i + 1].match(/^(?:TITLUL|CAPITOLUL|SECTIUNEA|Art\.)\s/i)) {
        titleName = lines[i + 1].replace(/^[-.\s]+/, "").trim();
        i++; // skip next line
      }
      mdLines.push("");
      mdLines.push(`## Titlul ${romanNum}. ${titleName}`);
      mdLines.push("");
      inArticle = false;
      continue;
    }

    // Detect TITLUL with name on same line
    const titluInlineMatch = line.match(
      /^TITLUL\s+([IVXLCDM]+)\s*[-.]?\s+(.+)$/i
    );
    if (titluInlineMatch) {
      const romanNum = romanToArabic(titluInlineMatch[1]);
      const titleName = titluInlineMatch[2].trim();
      mdLines.push("");
      mdLines.push(`## Titlul ${romanNum}. ${titleName}`);
      mdLines.push("");
      inArticle = false;
      continue;
    }

    // Detect CAPITOLUL (Roman or Arabic numerals)
    const capitolMatch = line.match(
      /^CAPITOLUL\s+([IVXLCDM]+|\d+)\s*(?:[-.]?\s*)?$/i
    );
    if (capitolMatch) {
      const romanNum = /^\d+$/.test(capitolMatch[1]) ? parseInt(capitolMatch[1], 10) : romanToArabic(capitolMatch[1]);
      let capName = "";
      if (i + 1 < lines.length && !lines[i + 1].match(/^(?:TITLUL|CAPITOLUL|SECTIUNEA|Art\.)\s/i)) {
        capName = lines[i + 1].replace(/^[-.\s]+/, "").trim();
        i++;
      }
      // For 1948 and 1965, use ## for chapters (they are top-level)
      // For 1866, 1923, 1938, chapters are under Titlul III, use ###
      const heading = (year === 1948) ? "##" : "###";
      mdLines.push("");
      mdLines.push(`${heading} Capitolul ${romanNum}. ${capName}`);
      mdLines.push("");
      inArticle = false;
      continue;
    }

    // Detect CAPITOLUL with name on same line (Roman or Arabic numerals)
    const capitolInlineMatch = line.match(
      /^CAPITOLUL\s+([IVXLCDM]+|\d+)\s*[-.]?\s+(.+)$/i
    );
    if (capitolInlineMatch) {
      const romanNum = /^\d+$/.test(capitolInlineMatch[1]) ? parseInt(capitolInlineMatch[1], 10) : romanToArabic(capitolInlineMatch[1]);
      const capName = capitolInlineMatch[2].trim();
      const heading = (year === 1948) ? "##" : "###";
      mdLines.push("");
      mdLines.push(`${heading} Capitolul ${romanNum}. ${capName}`);
      mdLines.push("");
      inArticle = false;
      continue;
    }

    // Detect Capitol introductiv (1948)
    const capitolIntroMatch = line.match(/^Capitol\s+introductiv\s*$/i);
    if (capitolIntroMatch) {
      mdLines.push("");
      mdLines.push("## Capitol introductiv");
      mdLines.push("");
      inArticle = false;
      continue;
    }

    // Detect SECTIUNEA
    const sectMatch = line.match(
      /^SEC[ȚŢT]IUNEA\s+([IVXLCDM]+)\s*(?:[-.]?\s*)?$/i
    );
    if (sectMatch) {
      const romanNum = romanToArabic(sectMatch[1]);
      let sectName = "";
      if (i + 1 < lines.length && !lines[i + 1].match(/^(?:TITLUL|CAPITOLUL|SECTIUNEA|Art\.)\s/i)) {
        sectName = lines[i + 1].replace(/^[-.\s]+/, "").trim();
        i++;
      }
      mdLines.push("");
      mdLines.push(`#### Secțiunea ${romanNum}. ${sectName}`);
      mdLines.push("");
      inArticle = false;
      continue;
    }

    // Detect SECTIUNEA with name on same line
    const sectInlineMatch = line.match(
      /^SEC[ȚŢT]IUNEA\s+([IVXLCDM]+)\s*[-.]?\s+(.+)$/i
    );
    if (sectInlineMatch) {
      const romanNum = romanToArabic(sectInlineMatch[1]);
      const sectName = sectInlineMatch[2].trim();
      mdLines.push("");
      mdLines.push(`#### Secțiunea ${romanNum}. ${sectName}`);
      mdLines.push("");
      inArticle = false;
      continue;
    }

    // Detect Article: "Art. N." or "Art. N. -" or "Articolul N."
    const artMatch = line.match(/^Art(?:icolul)?\.?\s*(\d+)\.?\s*[-–]?\s*(.*)/i);
    if (artMatch) {
      const artNum = parseInt(artMatch[1], 10);
      const artContent = artMatch[2].trim();

      mdLines.push("");
      mdLines.push(`### Articolul ${artNum}.`);
      mdLines.push("");

      if (artContent) {
        mdLines.push(artContent);
      }

      lastArticleNum = artNum;
      inArticle = true;
      continue;
    }

    // Regular content line - belongs to current article
    if (inArticle && line.trim()) {
      // Check if it's a lettered sub-item (a), b), c), etc.)
      const letterMatch = line.match(/^([a-z])\)\s+(.+)$/);
      if (letterMatch) {
        mdLines.push(`- ${letterMatch[1]}) ${letterMatch[2]}`);
      } else {
        // Check if it starts with a number (alineat)
        const alineatMatch = line.match(/^(\d+)\.\s+(.+)$/);
        if (alineatMatch) {
          mdLines.push(`${alineatMatch[1]}. ${alineatMatch[2]}`);
        } else {
          mdLines.push(line);
        }
      }
    }
  }

  // Clean up: remove multiple blank lines, trim
  let md = mdLines.join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return md + "\n";
}

/**
 * Convert Roman numeral to Arabic number
 */
function romanToArabic(roman) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let result = 0;
  const upper = roman.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const current = map[upper[i]] || 0;
    const next = map[upper[i + 1]] || 0;
    if (current < next) {
      result -= current;
    } else {
      result += current;
    }
  }
  return result;
}

// ---------- Main ----------

const years = [1866, 1923, 1938, 1948, 1965];

for (const year of years) {
  const htmlPath = resolve(TMPDIR, `const${year}.html`);
  console.log(`\nProcessing ${year}...`);

  try {
    const buffer = readFileSync(htmlPath);
    const html = decodeISO88592(buffer);

    const markdown = parseToMarkdown(html, year);

    // Count articles
    const artCount = (markdown.match(/### Articolul \d+\./g) || []).length;
    console.log(`  Articles found: ${artCount}`);

    // Write to public/ directory
    const outPath = resolve(PUBLIC_DIR, `${year}.md`);
    writeFileSync(outPath, markdown, "utf-8");
    console.log(`  Written to: ${outPath}`);
  } catch (err) {
    console.error(`  Error processing ${year}:`, err.message);
  }
}

console.log("\nDone!");
