import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// Register Inter font with latin-ext support (Romanian diacritics: ț, ș, ă, î, â)
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf",
      fontWeight: 700,
    },
  ],
});

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
    fontFamily: "Inter",
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
    fontFamily: "Inter",
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
    fontFamily: "Inter",
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
    fontFamily: "Inter",
    fontWeight: 700,
  },
  articleTitle: {
    fontSize: 10,
    color: colors.textSecondary,
    flex: 1,
  },
  statusBadge: {
    fontSize: 7,
    fontFamily: "Inter",
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
    fontFamily: "Inter",
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
}: { article: PdfDiffArticle; yearA: number; yearB: number }) {
  const status = getStatusStyles(article.status);
  const title = article.a?.title || article.b?.title;

  return (
    <View
      style={[
        styles.articleCard,
        { border: `1px solid ${status.border}`, backgroundColor: status.bg },
      ]}
      wrap={false}
    >
      {/* Article header */}
      <View style={[styles.articleHeader, { borderBottom: `1px solid ${status.border}` }]}>
        <Text style={[styles.articleNumber, { color: status.text }]}>
          Articolul {article.articleNumber}
        </Text>
        {title && <Text style={styles.articleTitle}>{title}</Text>}
        <Text
          style={[
            styles.statusBadge,
            { color: status.text, backgroundColor: `${status.border}40` },
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
          <Text style={styles.contentColumnLabel}>{yearB} (Adăugat)</Text>
          <Text style={styles.contentText}>{article.b.content}</Text>
        </View>
      )}

      {article.status === "removed" && article.a && (
        <View style={styles.singleContent}>
          <Text style={styles.contentColumnLabel}>{yearA} (Eliminat)</Text>
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
 */
export function DiffPdfDocument({ yearA, yearB, summary, articles }: DiffPdfProps) {
  const changedArticles = articles.filter((a) => a.status !== "unchanged");
  const now = new Date();
  const dateStr = now.toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Document
      title={`Comparație Constituția ${yearA} vs ${yearB}`}
      author="Constituția României"
      subject={`Diferențe între versiunile ${yearA} și ${yearB} ale Constituției României`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Comparație Constituție</Text>
          <Text style={styles.subtitle}>
            Constituția din {yearA} vs Constituția din {yearB}
          </Text>
          <Text style={styles.dateText}>Generat la {dateStr}</Text>
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
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              Nu există diferențe între cele două versiuni.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Constituția României — Comparație {yearA} vs {yearB}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
