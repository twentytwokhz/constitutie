/**
 * Constitution Markdown Parser
 *
 * Parses Romanian constitution markdown files into structured data.
 * Handles different structural formats across versions:
 *
 * - 1952: Capitol introductiv + Capitole numerotate (## level), Articole fără titlu (### level)
 * - 1986: Titluri numerotate (## level), Articole fără titlu (### level)
 * - 1991: Titluri (##) + Capitole (###) + Secțiuni (####), Articole cu titlu (##### level)
 * - 2003: Titluri (##) + Capitole (###) + Secțiuni (####), Articole cu titlu (##### level)
 *
 * Markdown format conventions:
 * - Titluri: ## Titlul N. Nume
 * - Capitole: ### Capitolul N. Nume (or ## Capitolul N. for 1952)
 * - Secțiuni: #### Secțiunea N. Nume (or #### Secţiunea N. Nume)
 * - Articole: ##### Articolul N. Titlu (1991/2003) or ### Articolul N. (1952/1986)
 * - Alineate: numbered lists (1. 2. 3.)
 */

export interface ParsedVersion {
  year: number;
  name: string;
  description: string;
  units: ParsedStructuralUnit[];
  articles: ParsedArticle[];
}

export interface ParsedStructuralUnit {
  type: "titlu" | "capitol" | "sectiune";
  number: number;
  name: string;
  parentIndex?: number;
  orderIndex: number;
  slug: string;
}

export interface ParsedArticle {
  number: number;
  title: string | null;
  content: string;
  parentUnitIndex: number;
  orderIndex: number;
  slug: string;
  references: string[];
}

// ---------- Heading regex patterns ----------

// 1952: ## Capitol introductiv (special case, no number)
const RE_CAPITOL_INTRODUCTIV = /^##\s+Capitol\s+introductiv\s*$/i;

// 1952: ## Capitolul N. Name
const RE_CAPITOL_H2 = /^##\s+Capitolul\s+(\d+)\.\s*(.+)$/;

// 1986/1991/2003: ## Titlul N. Name
const RE_TITLU = /^##\s+Titlul\s+(\d+)\.\s*(.+)$/;

// 1991/2003: ### Capitolul N. Name
const RE_CAPITOL_H3 = /^###\s+Capitolul\s+(\d+)\.\s*(.+)$/;

// 1991/2003: #### Secțiunea N. Name (handles both ț variants: U+021B and U+0163)
const RE_SECTIUNE = /^####\s+Sec[țţ]iunea\s+(?:a\s+)?(\d+)[\-.]\s*(.*)$/;

// 1991/2003: ##### Articolul N. Title
const RE_ARTICLE_H5 = /^#####\s+Articolul\s+(\d+)\.\s*(.*)$/;

// 1952/1986: ### Articolul N. (no title)
const RE_ARTICLE_H3 = /^###\s+Articolul\s+(\d+)\.\s*(.*)$/;

// Reference pattern: matches "art. N", "Art. N", "articolul N", "Articolul N", etc.
const RE_REF = /\b[Aa]rt(?:icolul(?:ui)?|icolele|icolelor)?\.?\s*(\d+)/g;

// ---------- Slug generation ----------

function generateSlug(prefix: string, num: number | string): string {
  const text = `${prefix}-${num}`;
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------- TipTap JSON generation ----------

interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
}

function textNode(text: string): TipTapNode {
  return { type: "text", text };
}

function paragraphNode(text: string): TipTapNode {
  return {
    type: "paragraph",
    content: text ? [textNode(text)] : undefined,
  };
}

function listItemNode(text: string): TipTapNode {
  return {
    type: "listItem",
    content: [paragraphNode(text)],
  };
}

export function contentToTipTap(content: string): TipTapNode {
  const lines = content.split("\n");
  const docContent: TipTapNode[] = [];
  let currentListItems: TipTapNode[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      // Flush any pending list
      if (inList && currentListItems.length > 0) {
        docContent.push({
          type: "orderedList",
          content: currentListItems,
        });
        currentListItems = [];
        inList = false;
      }
      continue;
    }

    // Check for numbered list item: "1. text"
    const listMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (listMatch) {
      inList = true;
      currentListItems.push(listItemNode(listMatch[2]));
      continue;
    }

    // Check for lettered list items: "- a) text" or "a) text"
    const letterMatch = trimmed.match(/^(?:-\s+)?([a-z]\))\s+(.+)$/);
    if (letterMatch) {
      inList = true;
      currentListItems.push(listItemNode(`${letterMatch[1]} ${letterMatch[2]}`));
      continue;
    }

    // Regular paragraph — flush any pending list first
    if (inList && currentListItems.length > 0) {
      docContent.push({
        type: "orderedList",
        content: currentListItems,
      });
      currentListItems = [];
      inList = false;
    }

    docContent.push(paragraphNode(trimmed));
  }

  // Flush remaining list items
  if (currentListItems.length > 0) {
    docContent.push({
      type: "orderedList",
      content: currentListItems,
    });
  }

  return {
    type: "doc",
    content: docContent.length > 0 ? docContent : [paragraphNode("")],
  };
}

// ---------- Reference extraction ----------

export function extractReferences(content: string): string[] {
  const refs: string[] = [];
  const refRegex = new RegExp(RE_REF.source, RE_REF.flags);
  let match: RegExpExecArray | null = refRegex.exec(content);

  while (match !== null) {
    const num = match[1];
    if (num) {
      const refText = match[0].trim();
      if (!refs.includes(refText)) {
        refs.push(refText);
      }
    }
    match = refRegex.exec(content);
  }

  return refs;
}

// ---------- Version metadata ----------

interface VersionMeta {
  name: string;
  description: string;
}

const VERSION_META: Record<number, VersionMeta> = {
  1952: {
    name: "Constituția din 1952",
    description:
      "Constituția Republicii Populare Române din 1952, adoptată la 24 septembrie 1952. Inspirată de modelul sovietic, a consacrat rolul conducător al Partidului Comunist Român.",
  },
  1986: {
    name: "Constituția din 1986",
    description:
      "Constituția Republicii Socialiste România din 1986, adoptată la 21 august 1965 și republicată în 1986. A servit regimul Ceaușescu până la Revoluția din 1989.",
  },
  1991: {
    name: "Constituția din 1991",
    description:
      "Constituția României din 1991, adoptată prin referendum la 8 decembrie 1991. Prima constituție democratică post-revoluționară, a stabilit România ca stat de drept.",
  },
  2003: {
    name: "Constituția din 2003",
    description:
      "Constituția României din 2003, revizuită prin referendum la 18-19 octombrie 2003. A adus modificări pentru integrarea euroatlantică și consolidarea drepturilor cetățenilor.",
  },
};

// ---------- Heading type detection ----------

interface DetectedHeading {
  type: "titlu" | "capitol" | "sectiune" | "article";
  number: number;
  name: string;
  articleTitle?: string | null;
}

function detectHeading(line: string, year: number): DetectedHeading | null {
  // Check for Capitol introductiv (1952 only)
  if (year === 1952 && RE_CAPITOL_INTRODUCTIV.test(line)) {
    return { type: "capitol", number: 0, name: "Capitol introductiv" };
  }

  // Check for articles first (more specific patterns)
  if (year === 1991 || year === 2003) {
    const artH5 = line.match(RE_ARTICLE_H5);
    if (artH5) {
      const title = artH5[2]?.trim() || null;
      return {
        type: "article",
        number: Number.parseInt(artH5[1], 10),
        name: title || "",
        articleTitle: title || null,
      };
    }
  }

  if (year === 1952 || year === 1986) {
    const artH3 = line.match(RE_ARTICLE_H3);
    if (artH3) {
      return {
        type: "article",
        number: Number.parseInt(artH3[1], 10),
        name: "",
        articleTitle: null,
      };
    }
  }

  // Check structural units (order matters: most specific first)

  // Section (#### level) - only in 1991/2003
  if (year === 1991 || year === 2003) {
    const secMatch = line.match(RE_SECTIUNE);
    if (secMatch) {
      return {
        type: "sectiune",
        number: Number.parseInt(secMatch[1], 10),
        name: secMatch[2]?.trim() || "",
      };
    }
  }

  // Chapter at ### level (1991/2003)
  if (year === 1991 || year === 2003) {
    const capH3 = line.match(RE_CAPITOL_H3);
    if (capH3) {
      return {
        type: "capitol",
        number: Number.parseInt(capH3[1], 10),
        name: capH3[2].trim(),
      };
    }
  }

  // Chapter at ## level (1952 only)
  if (year === 1952) {
    const capH2 = line.match(RE_CAPITOL_H2);
    if (capH2) {
      return {
        type: "capitol",
        number: Number.parseInt(capH2[1], 10),
        name: capH2[2].trim(),
      };
    }
  }

  // Title at ## level (1986/1991/2003)
  if (year !== 1952) {
    const titluMatch = line.match(RE_TITLU);
    if (titluMatch) {
      return {
        type: "titlu",
        number: Number.parseInt(titluMatch[1], 10),
        name: titluMatch[2].trim(),
      };
    }
  }

  return null;
}

// ---------- Main parser ----------

export function parseConstitution(markdown: string, year: number): ParsedVersion {
  const meta = VERSION_META[year];
  if (!meta) {
    throw new Error(`Unknown constitution year: ${year}`);
  }

  const lines = markdown.split("\n");
  const units: ParsedStructuralUnit[] = [];
  const articles: ParsedArticle[] = [];

  // Track current hierarchy context
  let currentTitluIndex: number | undefined;
  let currentCapitolIndex: number | undefined;
  let currentSectiuneIndex: number | undefined;

  let unitOrderCounter = 0;
  let articleOrderCounter = 0;

  // Accumulator for current article content
  let currentArticle: {
    number: number;
    title: string | null;
    parentUnitIndex: number;
    orderIndex: number;
    slug: string;
    contentLines: string[];
  } | null = null;

  function flushArticle() {
    if (!currentArticle) return;

    const content = currentArticle.contentLines.join("\n").trim();

    const references = extractReferences(content);

    articles.push({
      number: currentArticle.number,
      title: currentArticle.title,
      content,
      parentUnitIndex: currentArticle.parentUnitIndex,
      orderIndex: currentArticle.orderIndex,
      slug: currentArticle.slug,
      references,
    });

    currentArticle = null;
  }

  /**
   * Determine which structural unit an article belongs to.
   * Priority: sectiune > capitol > titlu
   */
  function getCurrentParentUnitIndex(): number {
    if (currentSectiuneIndex !== undefined) return currentSectiuneIndex;
    if (currentCapitolIndex !== undefined) return currentCapitolIndex;
    if (currentTitluIndex !== undefined) return currentTitluIndex;
    // Fallback: should not happen if markdown is well-formed
    return units.length > 0 ? units.length - 1 : 0;
  }

  for (const line of lines) {
    const heading = detectHeading(line, year);

    if (!heading) {
      // Accumulate content for current article
      if (currentArticle) {
        currentArticle.contentLines.push(line);
      }
      continue;
    }

    if (heading.type === "article") {
      // Flush previous article
      flushArticle();

      const parentUnitIndex = getCurrentParentUnitIndex();
      const slug = `articolul-${heading.number}`;

      currentArticle = {
        number: heading.number,
        title: heading.articleTitle ?? null,
        parentUnitIndex,
        orderIndex: articleOrderCounter++,
        slug,
        contentLines: [],
      };
      continue;
    }

    // It's a structural unit — flush any current article first
    flushArticle();

    if (heading.type === "titlu") {
      const slug = generateSlug("titlul", heading.number);
      units.push({
        type: "titlu",
        number: heading.number,
        name: heading.name,
        orderIndex: unitOrderCounter++,
        slug,
      });
      currentTitluIndex = units.length - 1;
      currentCapitolIndex = undefined;
      currentSectiuneIndex = undefined;
    } else if (heading.type === "capitol") {
      const slug =
        heading.number === 0 ? "capitol-introductiv" : generateSlug("capitolul", heading.number);

      const parentIndex = currentTitluIndex;

      units.push({
        type: "capitol",
        number: heading.number,
        name: heading.name,
        parentIndex,
        orderIndex: unitOrderCounter++,
        slug,
      });
      currentCapitolIndex = units.length - 1;
      currentSectiuneIndex = undefined;
    } else if (heading.type === "sectiune") {
      const slug = generateSlug("sectiunea", heading.number);
      const parentIndex = currentCapitolIndex ?? currentTitluIndex;

      units.push({
        type: "sectiune",
        number: heading.number,
        name: heading.name,
        parentIndex,
        orderIndex: unitOrderCounter++,
        slug,
      });
      currentSectiuneIndex = units.length - 1;
    }
  }

  // Flush last article
  flushArticle();

  return {
    year,
    name: meta.name,
    description: meta.description,
    units,
    articles,
  };
}

/**
 * Parse all 4 constitution versions from their markdown content.
 */
export function parseAllConstitutions(files: Record<number, string>): ParsedVersion[] {
  const years = [1952, 1986, 1991, 2003];
  return years.map((year) => {
    const content = files[year];
    if (!content) {
      throw new Error(`Missing markdown content for year ${year}`);
    }
    return parseConstitution(content, year);
  });
}
