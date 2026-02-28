import path from "node:path";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

/**
 * Font registration for PDF export with Romanian diacritics.
 *
 * We use TWO Inter subsets (both static WOFF — variable WOFF2 crashes
 * fontkit's subsetter in @react-pdf):
 *
 * • InterLatin  — Google Fonts "latin" subset. Covers U+0000-00FF
 *   (basic Latin, â/î), plus U+2000-206F (General Punctuation: „ " — –)
 *   and U+20AC (€). This is the DEFAULT font for all text.
 *
 * • InterExt — Google Fonts "latin-ext" subset. Covers U+0100-02AF
 *   (Extended Latin A/B) where Romanian ă/ș/ț live.
 *
 * The RoText component splits text into character runs, routing each
 * character to the subset font that contains it. Both are Inter so
 * metrics (ascenders, advance widths, x-height) match perfectly,
 * preventing layout glitches at font boundaries.
 *
 * Previous approach used Helvetica for basic Latin which caused:
 * 1. Black rectangles for chars like „ " — (U+2000-206F) routed to
 *    InterExt which doesn't cover that range
 * 2. Line-breaking issues from mismatched Helvetica/Inter metrics
 */
const fontsDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "InterLatin",
  fonts: [
    { src: path.join(fontsDir, "Inter-Latin-Regular.woff"), fontWeight: 400 },
    { src: path.join(fontsDir, "Inter-Latin-Bold.woff"), fontWeight: 700 },
  ],
});

Font.register({
  family: "InterExt",
  fonts: [
    { src: path.join(fontsDir, "Inter-Regular.woff"), fontWeight: 400 },
    { src: path.join(fontsDir, "Inter-Bold.woff"), fontWeight: 700 },
  ],
});

// Allow word-level line breaking but prevent mid-word hyphenation.
// @react-pdf always breaks at whitespace; this callback controls
// whether a single word can be split with a hyphen. Returning [word]
// keeps each word as one unbreakable unit (no hyphens inserted).
Font.registerHyphenationCallback((word) => [word]);

/**
 * Determine if a character needs the Latin-ext font (InterExt).
 *
 * Only the Extended Latin A/B range (U+0100-02FF) is routed to InterExt.
 * Everything else goes to InterLatin, which covers:
 * - U+0000-00FF (basic Latin + Latin-1 supplement: a-z, â, î, etc.)
 * - U+2000-206F (General Punctuation: „ " – — … etc.)
 * - U+20AC (€), and other scattered code points
 *
 * The old code used `charCode >= 0x100` which incorrectly sent
 * characters like „ (U+201E) and — (U+2014) to InterExt where they
 * don't exist, causing black rectangles in the PDF.
 */
function needsExtFont(charCode: number): boolean {
  return charCode >= 0x0100 && charCode <= 0x02ff;
}

/**
 * Split a string into runs of characters that use the same font.
 * Adjacent characters needing the same font are grouped into one run
 * to minimize the number of <Text> elements.
 */
function splitTextRuns(text: string): Array<{ text: string; isExt: boolean }> {
  if (!text) return [];

  const runs: Array<{ text: string; isExt: boolean }> = [];
  let currentRun = "";
  let currentIsExt = needsExtFont(text.charCodeAt(0));

  for (let i = 0; i < text.length; i++) {
    const charIsExt = needsExtFont(text.charCodeAt(i));
    if (charIsExt === currentIsExt) {
      currentRun += text[i];
    } else {
      runs.push({ text: currentRun, isExt: currentIsExt });
      currentRun = text[i];
      currentIsExt = charIsExt;
    }
  }

  if (currentRun) {
    runs.push({ text: currentRun, isExt: currentIsExt });
  }

  return runs;
}

/**
 * RoText: Renders Romanian text with proper diacritics in @react-pdf.
 *
 * Splits text into character runs and assigns each run to the correct
 * font family: InterLatin for most characters and InterExt for
 * Extended Latin characters like ă/ș/ț (U+0100-02FF).
 * Both fonts are Inter, so metrics match and line wrapping works correctly.
 */
function RoText({
  children,
  style,
  bold,
}: {
  children: string | number;
  style?: Style | Style[];
  bold?: boolean;
}) {
  const text = String(children);
  const runs = splitTextRuns(text);
  const fontWeight = bold ? 700 : 400;

  const baseStyles: Style[] = Array.isArray(style) ? style : style ? [style] : [];

  // Optimization: if all characters are in the same font, render directly
  if (runs.length <= 1) {
    const fontFamily = runs[0]?.isExt ? "InterExt" : "InterLatin";
    return <Text style={[...baseStyles, { fontFamily, fontWeight }]}>{text}</Text>;
  }

  return (
    <Text style={[...baseStyles, { fontWeight }]}>
      {runs.map((run, i) => (
        <Text
          key={`${i}-${run.isExt ? "ext" : "lat"}`}
          style={{ fontFamily: run.isExt ? "InterExt" : "InterLatin" }}
        >
          {run.text}
        </Text>
      ))}
    </Text>
  );
}

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
    fontFamily: "InterLatin",
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
    fontFamily: "InterLatin",
  },
});

/** Get styling for an article card based on status */
function getStatusStyles(status: PdfDiffArticle["status"]) {
  switch (status) {
    case "added":
      return {
        bg: colors.addedBg,
        border: colors.addedBorder,
        text: colors.added,
        label: "Adăugat",
      };
    case "removed":
      return {
        bg: colors.removedBg,
        border: colors.removedBorder,
        text: colors.removed,
        label: "Eliminat",
      };
    case "modified":
      return {
        bg: colors.modifiedBg,
        border: colors.modifiedBorder,
        text: colors.modified,
        label: "Modificat",
      };
    default:
      return {
        bg: colors.bgSection,
        border: colors.border,
        text: colors.textMuted,
        label: "Neschimbat",
      };
  }
}

/** Summary stat box */
function SummaryStat({
  count,
  label,
  color,
  bgColor,
}: { count: number; label: string; color: string; bgColor: string }) {
  return (
    <View style={[styles.summaryItem, { backgroundColor: bgColor }]}>
      <Text style={[styles.summaryNumber, { color, fontFamily: "InterLatin" }]}>{count}</Text>
      <RoText style={[styles.summaryLabel, { color }]}>{label}</RoText>
    </View>
  );
}

/** Article diff card for a single article */
function ArticleCard({
  article,
  yearA,
  yearB,
}: { article: PdfDiffArticle; yearA: number; yearB: number }) {
  const status = getStatusStyles(article.status);
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
        <RoText style={[styles.articleNumber, { color: status.text }]} bold>
          {`Articolul ${article.articleNumber}`}
        </RoText>
        {title && <RoText style={styles.articleTitle}>{title}</RoText>}
        <RoText
          style={[
            styles.statusBadge,
            { color: status.text, backgroundColor: `${status.border}40` },
          ]}
          bold
        >
          {status.label}
        </RoText>
      </View>

      {/* Content */}
      {article.status === "modified" && article.a && article.b && (
        <View style={styles.contentRow}>
          <View style={[styles.contentColumn, { backgroundColor: `${colors.removedBg}` }]}>
            <Text style={[styles.contentColumnLabel, { fontFamily: "InterLatin" }]}>{yearA}</Text>
            <RoText style={styles.contentText}>{article.a.content}</RoText>
          </View>
          <View style={styles.divider} />
          <View style={[styles.contentColumn, { backgroundColor: `${colors.addedBg}` }]}>
            <Text style={[styles.contentColumnLabel, { fontFamily: "InterLatin" }]}>{yearB}</Text>
            <RoText style={styles.contentText}>{article.b.content}</RoText>
          </View>
        </View>
      )}

      {article.status === "added" && article.b && (
        <View style={styles.singleContent}>
          <RoText style={styles.contentColumnLabel} bold>
            {`${yearB} (Adăugat)`}
          </RoText>
          <RoText style={styles.contentText}>{article.b.content}</RoText>
        </View>
      )}

      {article.status === "removed" && article.a && (
        <View style={styles.singleContent}>
          <RoText style={styles.contentColumnLabel} bold>
            {`${yearA} (Eliminat)`}
          </RoText>
          <RoText style={styles.contentText}>{article.a.content}</RoText>
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
 * Uses InterLatin (Google Fonts "latin" subset) as default font and
 * InterExt (Google Fonts "latin-ext" subset) for Romanian diacritics
 * (ă, ș, ț). Both are Inter so metrics match perfectly, avoiding the
 * black-rectangle and line-break bugs from the old Helvetica+InterExt mix.
 */
export function DiffPdfDocument({ yearA, yearB, summary, articles, locale = "ro" }: DiffPdfProps) {
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
      title={`Comparație Constituția ${yearA} vs ${yearB}`}
      author="Constituția României"
      subject={`Diferențe între versiunile ${yearA} și ${yearB} ale Constituției României`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <RoText style={styles.title} bold>
            {"Comparație Constituție"}
          </RoText>
          <RoText style={styles.subtitle}>
            {`Constituția din ${yearA} vs Constituția din ${yearB}`}
          </RoText>
          <RoText style={styles.dateText}>{`Generat la ${dateStr}`}</RoText>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <SummaryStat
            count={summary.added}
            label="Adăugate"
            color={colors.added}
            bgColor={colors.addedBg}
          />
          <SummaryStat
            count={summary.removed}
            label="Eliminate"
            color={colors.removed}
            bgColor={colors.removedBg}
          />
          <SummaryStat
            count={summary.modified}
            label="Modificate"
            color={colors.modified}
            bgColor={colors.modifiedBg}
          />
          <SummaryStat
            count={summary.unchanged}
            label="Neschimbate"
            color={colors.textMuted}
            bgColor={colors.bgSection}
          />
        </View>

        {/* Changed articles */}
        {changedArticles.map((article) => (
          <ArticleCard key={article.articleNumber} article={article} yearA={yearA} yearB={yearB} />
        ))}

        {/* Empty state */}
        {changedArticles.length === 0 && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <RoText style={{ color: colors.textMuted, fontSize: 12 }}>
              {"Nu există diferențe între cele două versiuni."}
            </RoText>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <RoText style={styles.footerText}>
            {`Constituția României — Comparație ${yearA} vs ${yearB}`}
          </RoText>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
