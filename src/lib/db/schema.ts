import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// Enums
export const structuralUnitTypeEnum = pgEnum("structural_unit_type", [
  "titlu",
  "capitol",
  "sectiune",
]);

export const commentStatusEnum = pgEnum("comment_status", ["pending", "approved", "rejected"]);

export const voteTypeEnum = pgEnum("vote_type", ["agree", "disagree"]);

// Tables
export const constitutionVersions = pgTable("constitution_versions", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  sourceFile: text("source_file"),
  totalArticles: integer("total_articles").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const structuralUnits = pgTable("structural_units", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id")
    .notNull()
    .references(() => constitutionVersions.id),
  type: structuralUnitTypeEnum("type").notNull(),
  number: integer("number").notNull(),
  name: text("name").notNull(),
  // biome-ignore lint/suspicious/noExplicitAny: Drizzle ORM requires this for self-referencing FK
  parentId: integer("parent_id").references((): any => structuralUnits.id),
  orderIndex: integer("order_index").notNull(),
  slug: text("slug").notNull(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id")
    .notNull()
    .references(() => constitutionVersions.id),
  structuralUnitId: integer("structural_unit_id")
    .notNull()
    .references(() => structuralUnits.id),
  number: integer("number").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  contentTiptap: jsonb("content_tiptap"),
  orderIndex: integer("order_index").notNull(),
  slug: text("slug").notNull(),
  agreeCount: integer("agree_count").default(0),
  disagreeCount: integer("disagree_count").default(0),
});

export const articleReferences = pgTable("article_references", {
  id: serial("id").primaryKey(),
  sourceArticleId: integer("source_article_id")
    .notNull()
    .references(() => articles.id),
  targetArticleId: integer("target_article_id")
    .notNull()
    .references(() => articles.id),
  referenceText: text("reference_text"),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id")
    .notNull()
    .references(() => articles.id),
  content: text("content").notNull(),
  selectedText: text("selected_text"),
  status: commentStatusEnum("status").default("pending"),
  rejectionReason: text("rejection_reason"),
  fingerprintHash: text("fingerprint_hash").notNull(),
  ipHash: text("ip_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id),
    voteType: voteTypeEnum("vote_type").notNull(),
    fingerprintHash: text("fingerprint_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [unique("votes_article_fingerprint").on(table.articleId, table.fingerprintHash)],
);
