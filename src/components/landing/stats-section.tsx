import { count, eq } from "drizzle-orm";
import { getFormatter, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { articleReferences, articles, comments, constitutionVersions } from "@/lib/db/schema";
import { StatsGrid } from "./stats-grid";

async function getStats() {
  const [versionsCount] = await db.select({ value: count() }).from(constitutionVersions);
  const [articlesCount] = await db.select({ value: count() }).from(articles);
  const [referencesCount] = await db.select({ value: count() }).from(articleReferences);
  const [commentsCount] = await db
    .select({ value: count() })
    .from(comments)
    .where(eq(comments.status, "approved"));

  return {
    totalArticles: articlesCount?.value ?? 0,
    totalVersions: versionsCount?.value ?? 0,
    totalReferences: referencesCount?.value ?? 0,
    totalComments: commentsCount?.value ?? 0,
  };
}

/**
 * StatsSection — Server Component that fetches stats from the database
 * and passes them to the client-side StatsGrid for animated number rendering.
 */
export async function StatsSection() {
  const stats = await getStats();
  const t = await getTranslations();
  const format = await getFormatter();

  return (
    <section className="py-12 sm:py-20" id="statistici">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {t("stats.sectionTitle").replace(t("stats.sectionTitleHighlight"), "")}{" "}
            <span className="text-primary">{t("stats.sectionTitleHighlight")}</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
            {t("stats.sectionDescription")}
          </p>
        </div>

        <StatsGrid
          items={[
            {
              iconName: "book-open",
              value: stats.totalArticles,
              formattedValue: format.number(stats.totalArticles),
              label: t("stats.articles"),
              description: t("stats.articlesSubtitle"),
            },
            {
              iconName: "git-compare-arrows",
              value: stats.totalVersions,
              formattedValue: format.number(stats.totalVersions),
              label: t("stats.versions"),
              description: t("stats.versionsSubtitle"),
            },
            {
              iconName: "link-2",
              value: stats.totalReferences,
              formattedValue: format.number(stats.totalReferences),
              label: t("stats.references"),
              description: t("stats.referencesSubtitle"),
            },
            {
              iconName: "message-square",
              value: stats.totalComments,
              formattedValue: format.number(stats.totalComments),
              label: t("stats.comments"),
              description: t("stats.commentsSubtitle"),
            },
          ]}
        />
      </div>
    </section>
  );
}
