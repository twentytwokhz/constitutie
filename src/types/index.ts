/**
 * Shared TypeScript types for the Constituția României application
 */

// Constitution version metadata
export interface ConstitutionVersion {
  id: number;
  year: number;
  name: string;
  nameEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  sourceFile: string | null;
  totalArticles: number;
  createdAt: Date;
}

// Structural unit in the constitution hierarchy
export interface StructuralUnit {
  id: number;
  versionId: number;
  type: "titlu" | "capitol" | "sectiune";
  number: number;
  name: string;
  nameEn: string | null;
  parentId: number | null;
  orderIndex: number;
  slug: string;
  children?: StructuralUnit[];
  articles?: Article[];
}

// Individual article
export interface Article {
  id: number;
  versionId: number;
  structuralUnitId: number;
  number: number;
  title: string | null;
  titleEn: string | null;
  content: string;
  contentEn: string | null;
  contentTiptap: Record<string, unknown> | null;
  contentTiptapEn: Record<string, unknown> | null;
  orderIndex: number;
  slug: string;
  agreeCount: number;
  disagreeCount: number;
}

// Article reference (cross-reference between articles)
export interface ArticleReference {
  id: number;
  sourceArticleId: number;
  targetArticleId: number;
  referenceText: string | null;
}

// Comment on an article
export interface Comment {
  id: number;
  articleId: number;
  content: string;
  selectedText: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  fingerprintHash: string;
  ipHash: string | null;
  createdAt: Date;
}

// Vote on an article
export interface Vote {
  id: number;
  articleId: number;
  voteType: "agree" | "disagree";
  fingerprintHash: string;
  createdAt: Date;
}

// Graph visualization types
export interface GraphNode {
  id: string;
  type: "titlu" | "capitol" | "sectiune" | "articol";
  label: string;
  number: number;
  parentId?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "hierarchical" | "reference";
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Diff types
export interface DiffResult {
  articleNumber: number;
  status: "added" | "removed" | "modified" | "unchanged";
  contentA?: string;
  contentB?: string;
  titleA?: string;
  titleB?: string;
}

// Stats types
export interface AppStats {
  total_articles: number;
  total_versions: number;
  total_references: number;
  total_comments: number;
  total_votes: number;
}

// Search result
export interface SearchResult {
  articleId: number;
  versionYear: number;
  articleNumber: number;
  articleTitle: string | null;
  snippet: string;
  matchType: "number" | "title" | "content";
}
