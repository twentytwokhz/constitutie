import path from "node:path";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

/**
 * Font registration for PDF export with full Romanian diacritics support.
 *
 * Uses Noto Sans — a Google-designed sans-serif with complete Latin + Latin-ext
 * coverage in a SINGLE TTF file. This eliminates the need for dual-font splitting
 * (InterLatin + InterExt) which was required by the old approach and suffered from
 * glyph mapping corruption in @react-pdf's fontkit WOFF/OTF parsing.
 *
 * A single font family means:
 * - No character-by-character font routing (the old RoText splitting)
 * - No glyph mapping bugs between font boundaries
 * - Correct rendering of all Romanian diacritics: ă, â, î, ș, ț (and uppercase)
 * - Correct rendering of typographic punctuation: „ " — – etc.
 */
const fontsDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "NotoSans",
  fonts: [
    { src: path.join(fontsDir, "NotoSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontsDir, "NotoSans-Bold.ttf"), fontWeight: 700 },
  ],
});

// Allow word-level line breaking but prevent mid-word hyphenation.
Font.registerHyphenationCallback((word) => [word]);

/**
 * Diff article data passed to the PDF renderer.
 * Matches the DiffArticle interface from the compare page.
 */
export interface PdfDiffArticle {
  articleNumber: number;
  status: "added" | "removed" | "modified" | "unchanged";
  a: { title: string | null; content: string } | null;
  b: { title: string | null; content: string } | null;
}

export interface DiffPdfProps {
  yearA: number;
  yearB: number;
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
  articles: PdfDiffArticle[];
  locale?: string;
}

// Print-friendly color palette (lighter backgrounds, strong text)
const colors = {
  primary: "#4F46E5", // indigo-600
  primaryLight: "#EEF2FF", // indigo-50
  added: "#065F46", // emerald-800 text
  addedBg: "#ECFDF5", // emerald-50
  addedBorder: "#6EE7B7", // emerald-300
  removed: "#9F1239", // rose-800 text
  removedBg: "#FFF1F2", // rose-50
  removedBorder: "#FDA4AF", // rose-300
  modified: "#92400E", // amber-800 text
  modifiedBg: "#FFFBEB", // amber-50
  modifiedBorder: "#FCD34D", // amber-300
  textPrimary: "#1C1917", // stone-900
  textSecondary: "#57534E", // stone-600
  textMuted: "#A8A29E", // stone-400
  border: "#D6D3D1", // stone-300
  bgPage: "#FFFFFF",
  bgSection: "#FAFAF9", // stone-50
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 72,
    fontFamily: "NotoSans",
    fontSize: 10,
    color: colors.textPrimary,
    backgroundColor: colors.bgPage,
  },
  // Header
  header: {
    marginBottom: 24,
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 6,
  },
  // Summary section
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    padding: 12,
    backgroundColor: colors.bgSection,
    borderRadius: 4,
    border: `1px solid ${colors.border}`,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    borderRadius: 4,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Article cards
  articleCard: {
    marginBottom: 10,
    borderRadius: 4,
    overflow: "hidden",
  },
  articleHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
  articleNumber: {
    fontSize: 11,
    fontWeight: 700,
  },
  articleTitle: {
    fontSize: 10,
    color: colors.textSecondary,
    flex: 1,
  },
  statusBadge: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  // Content comparison
  contentRow: {
    flexDirection: "row",
    gap: 0,
  },
  contentColumn: {
    flex: 1,
    padding: 8,
    minHeight: 30,
  },
  contentColumnLabel: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.textMuted,
    marginBottom: 4,
  },
  contentText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
  },
  // Single-side content (added/removed)
  singleContent: {
    padding: 8,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },
  pageNumber: {
    fontSize: 8,
    color: colors.textMuted,
  },
});

/**
 * Locale-aware labels for PDF content.
 *
 * Since @react-pdf components cannot use React hooks (useTranslations),
 * we keep a simple map here and select the right set based on the
 * `locale` prop passed to DiffPdfDocument.
 */
const pdfLabels = {
  ro: {
    statusAdded: "Ad\u0103ugat",
    statusRemoved: "Eliminat",
    statusModified: "Modificat",
    statusUnchanged: "Neschimbat",
    summaryAdded: "Ad\u0103ugate",
    summaryRemoved: "Eliminate",
    summaryModified: "Modificate",
    summaryUnchanged: "Neschimbate",
    articlePrefix: "Articolul",
    comparisonTitle: "Compara\u021bie Constitu\u021bie",
    constitutionOf: "Constitu\u021bia din",
    generatedAt: "Generat la",
    footerLabel: "Constitu\u021bia Rom\u00e2niei \u2014 Compara\u021bie",
    pageLabel: "Pagina",
    pageOf: "/",
    noChanges: "Nu exist\u0103 diferen\u021be \u00eentre cele dou\u0103 versiuni.",
    docTitle: (yearA: number, yearB: number) =>
      `Compara\u021bie Constitu\u021bia ${yearA} vs ${yearB}`,
    docAuthor: "Constitu\u021bia Rom\u00e2niei",
    docSubject: (yearA: number, yearB: number) =>
      `Diferen\u021be \u00eentre versiunile ${yearA} \u0219i ${yearB} ale Constitu\u021biei Rom\u00e2niei`,
  },
  en: {
    statusAdded: "Added",
    statusRemoved: "Removed",
    statusModified: "Modified",
    statusUnchanged: "Unchanged",
    summaryAdded: "Added",
    summaryRemoved: "Removed",
    summaryModified: "Modified",
    summaryUnchanged: "Unchanged",
    articlePrefix: "Article",
    comparisonTitle: "Constitution Comparison",
    constitutionOf: "Constitution of",
    generatedAt: "Generated at",
    footerLabel: "Romanian Constitution \u2014 Comparison",
    pageLabel: "Page",
    pageOf: "/",
    noChanges: "No differences between the two versions.",
    docTitle: (yearA: number, yearB: number) => `Constitution Comparison ${yearA} vs ${yearB}`,
    docAuthor: "Romanian Constitution",
    docSubject: (yearA: number, yearB: number) =>
      `Differences between the ${yearA} and ${yearB} versions of the Romanian Constitution`,
  },
};

interface PdfLabels {
  statusAdded: string;
  statusRemoved: string;
  statusModified: string;
  statusUnchanged: string;
  summaryAdded: string;
  summaryRemoved: string;
  summaryModified: string;
  summaryUnchanged: string;
  articlePrefix: string;
  comparisonTitle: string;
  constitutionOf: string;
  generatedAt: string;
  footerLabel: string;
  pageLabel: string;
  pageOf: string;
  noChanges: string;
  docTitle: (yearA: number, yearB: number) => string;
  docAuthor: string;
  docSubject: (yearA: number, yearB: number) => string;
}

function getLabels(locale: string): PdfLabels {
  return locale === "en" ? pdfLabels.en : pdfLabels.ro;
}

/** Get styling for an article card based on status */
function getStatusStyles(status: PdfDiffArticle["status"], labels: PdfLabels) {
  switch (status) {
    case "added":
      return {
        bg: colors.addedBg,
        border: colors.addedBorder,
        text: colors.added,
        label: labels.statusAdded,
      };
    case "removed":
      return {
        bg: colors.removedBg,
        border: colors.removedBorder,
        text: colors.removed,
        label: labels.statusRemoved,
      };
    case "modified":
      return {
        bg: colors.modifiedBg,
        border: colors.modifiedBorder,
        text: colors.modified,
        label: labels.statusModified,
      };
    default:
      return {
        bg: colors.bgSection,
        border: colors.border,
        text: colors.textMuted,
        label: labels.statusUnchanged,
      };
  }
}

/** Summary stat box */
function SummaryStat({
  count,
  label,
  color,
  bgColor,
}: {
  count: number;
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <View style={[styles.summaryItem, { backgroundColor: bgColor }]}>
      <Text style={[styles.summaryNumber, { color }]}>{count}</Text>
      <Text style={[styles.summaryLabel, { color }]}>{label}</Text>
    </View>
  );
}

/** Article diff card for a single article */
function ArticleCard({
  article,
  yearA,
  yearB,
  labels,
}: {
  article: PdfDiffArticle;
  yearA: number;
  yearB: number;
  labels: PdfLabels;
}) {
  const status = getStatusStyles(article.status, labels);
  const title = article.a?.title || article.b?.title;

  return (
    <View
      style={[
        styles.articleCard,
        { border: `1px solid ${status.border}`, backgroundColor: status.bg },
      ]}
    >
      {/* Article header */}
      <View style={[styles.articleHeader, { borderBottom: `1px solid ${status.border}` }]}>
        <Text style={[styles.articleNumber, { color: status.text, fontWeight: 700 }]}>
          {`${labels.articlePrefix} ${article.articleNumber}`}
        </Text>
        {title && <Text style={styles.articleTitle}>{title}</Text>}
        <Text
          style={[
            styles.statusBadge,
            { color: status.text, backgroundColor: `${status.border}40`, fontWeight: 700 },
          ]}
        >
          {status.label}
        </Text>
      </View>

      {/* Content */}
      {article.status === "modified" && article.a && article.b && (
        <View style={styles.contentRow}>
          <View style={[styles.contentColumn, { backgroundColor: `${colors.removedBg}` }]}>
            <Text style={styles.contentColumnLabel}>{yearA}</Text>
            <Text style={styles.contentText}>{article.a.content}</Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.contentColumn, { backgroundColor: `${colors.addedBg}` }]}>
            <Text style={styles.contentColumnLabel}>{yearB}</Text>
            <Text style={styles.contentText}>{article.b.content}</Text>
          </View>
        </View>
      )}

      {article.status === "added" && article.b && (
        <View style={styles.singleContent}>
          <Text style={[styles.contentColumnLabel, { fontWeight: 700 }]}>
            {`${yearB} (${labels.statusAdded})`}
          </Text>
          <Text style={styles.contentText}>{article.b.content}</Text>
        </View>
      )}

      {article.status === "removed" && article.a && (
        <View style={styles.singleContent}>
          <Text style={[styles.contentColumnLabel, { fontWeight: 700 }]}>
            {`${yearA} (${labels.statusRemoved})`}
          </Text>
          <Text style={styles.contentText}>{article.a.content}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * PDF Document component for Diff Export.
 *
 * Renders a styled comparison between two constitutional versions
 * with color-coded article status (added, removed, modified).
 * Only changed articles are included to keep the PDF focused.
 *
 * Uses Noto Sans (full TTF) as the single font family. Unlike the old
 * dual-font Inter approach (InterLatin + InterExt subsets), Noto Sans
 * covers ALL Latin + Latin-ext characters in one file, so no character-
 * level font splitting is needed and Romanian diacritics render correctly.
 */
export function DiffPdfDocument({ yearA, yearB, summary, articles, locale = "ro" }: DiffPdfProps) {
  const labels = getLabels(locale);
  const changedArticles = articles.filter((a) => a.status !== "unchanged");
  const now = new Date();
  // Use Intl.DateTimeFormat directly (equivalent to next-intl's format.dateTime)
  // since @react-pdf/renderer components cannot use React hooks
  const dateStr = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return (
    <Document
      title={labels.docTitle(yearA, yearB)}
      author={labels.docAuthor}
      subject={labels.docSubject(yearA, yearB)}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{labels.comparisonTitle}</Text>
          <Text style={styles.subtitle}>
            {`${labels.constitutionOf} ${yearA} vs ${labels.constitutionOf} ${yearB}`}
          </Text>
          <Text style={styles.dateText}>{`${labels.generatedAt} ${dateStr}`}</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <SummaryStat
            count={summary.added}
            label={labels.summaryAdded}
            color={colors.added}
            bgColor={colors.addedBg}
          />
          <SummaryStat
            count={summary.removed}
            label={labels.summaryRemoved}
            color={colors.removed}
            bgColor={colors.removedBg}
          />
          <SummaryStat
            count={summary.modified}
            label={labels.summaryModified}
            color={colors.modified}
            bgColor={colors.modifiedBg}
          />
          <SummaryStat
            count={summary.unchanged}
            label={labels.summaryUnchanged}
            color={colors.textMuted}
            bgColor={colors.bgSection}
          />
        </View>

        {/* Changed articles */}
        {changedArticles.map((article) => (
          <ArticleCard
            key={article.articleNumber}
            article={article}
            yearA={yearA}
            yearB={yearB}
            labels={labels}
          />
        ))}

        {/* Empty state */}
        {changedArticles.length === 0 && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{labels.noChanges}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{`${labels.footerLabel} ${yearA} vs ${yearB}`}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `${labels.pageLabel} ${pageNumber} ${labels.pageOf} ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
