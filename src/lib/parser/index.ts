/**
 * Constitution Markdown Parser
 *
 * Parses Romanian constitution markdown files into structured data.
 * Handles different structural formats across versions:
 *
 * - 1952: Capitol introductiv + Capitole numerotate, Articole fără titlu
 * - 1986: Titluri numerotate, Articole fără titlu
 * - 1991: Titluri + Capitole + Secțiuni, Articole cu titlu
 * - 2003: Titluri + Capitole + Secțiuni, Articole cu titlu (revizia 2003)
 *
 * Markdown format conventions:
 * - Titluri: ## Titlul N. Nume
 * - Capitole: ### Capitolul N. Nume
 * - Secțiuni: ### Secțiunea N. Nume
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

// TODO: Implement parser functions
// These will be implemented by the coding agent when feature #6 is worked on.
