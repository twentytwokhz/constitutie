import { count, eq, inArray, sql } from "drizzle-orm";
import {
  ArrowRight,
  BookOpen,
  GitCompareArrows,
  Link2,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { VersionBarChart } from "@/components/statistics/version-bar-chart";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import {
  articleReferences,
  articles,
  comments,
  constitutionVersions,
  votes,
} from "@/lib/db/schema";

/**
 * Statistics Dashboard Page
 *
 * Route: /statistics
 *
 * Displays dashboard-style stat cards with real data from the database,
 * plus per-version article counts and voting statistics.
 */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("statistics");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

interface StatCardProps {
  icon: React.ReactNode;
  formattedValue: string;
  label: string;
  description: string;
  trend?: string;
}

function StatCard({ icon, formattedValue, label, description, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{formattedValue}</p>
      <div className="mt-1 flex items-center gap-1">
        {trend && <TrendingUp className="h-3 w-3 text-emerald-500" />}
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

async function getStatistics() {
  const [versionsCount] = await db.select({ value: count() }).from(constitutionVersions);
  const [articlesCount] = await db.select({ value: count() }).from(articles);
  const [referencesCount] = await db.select({ value: count() }).from(articleReferences);
  const [approvedComments] = await db
    .select({ value: count() })
    .from(comments)
    .where(eq(comments.status, "approved"));
  const [totalVotes] = await db.select({ value: count() }).from(votes);
  const [agreeVotes] = await db
    .select({ value: count() })
    .from(votes)
    .where(eq(votes.voteType, "agree"));
  const [disagreeVotes] = await db
    .select({ value: count() })
    .from(votes)
    .where(eq(votes.voteType, "disagree"));

  const versionStats = await db
    .select({
      year: constitutionVersions.year,
      name: constitutionVersions.name,
      totalArticles: constitutionVersions.totalArticles,
    })
    .from(constitutionVersions)
    .orderBy(constitutionVersions.year);

  const topReferenced = await db
    .select({
      articleId: articleReferences.targetArticleId,
      refCount: count(),
    })
    .from(articleReferences)
    .groupBy(articleReferences.targetArticleId)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  let topArticles: Array<{
    number: number;
    title: string | null;
    year: number;
    refCount: number;
  }> = [];

  if (topReferenced.length > 0) {
    const articleIds = topReferenced.map((r) => r.articleId);
    const articleDetails = await db
      .select({
        id: articles.id,
        number: articles.number,
        title: articles.title,
        year: constitutionVersions.year,
      })
      .from(articles)
      .innerJoin(constitutionVersions, eq(articles.versionId, constitutionVersions.id))
      .where(inArray(articles.id, articleIds));

    topArticles = topReferenced.map((ref) => {
      const detail = articleDetails.find((a) => a.id === ref.articleId);
      return {
        number: detail?.number ?? 0,
        title: detail?.title ?? null,
        year: detail?.year ?? 0,
        refCount: ref.refCount,
      };
    });
  }

  return {
    totalArticles: articlesCount?.value ?? 0,
    totalVersions: versionsCount?.value ?? 0,
    totalReferences: referencesCount?.value ?? 0,
    totalComments: approvedComments?.value ?? 0,
    totalVotes: totalVotes?.value ?? 0,
    agreeVotes: agreeVotes?.value ?? 0,
    disagreeVotes: disagreeVotes?.value ?? 0,
    versionStats,
    topArticles,
  };
}

export default async function StatisticsPage() {
  const [stats, format, t, tCommon] = await Promise.all([
    getStatistics(),
    getFormatter(),
    getTranslations("statistics"),
    getTranslations("common"),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Main stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          formattedValue={format.number(stats.totalArticles)}
          label={t("totalArticles")}
          description={t("totalArticlesDesc")}
          trend="active"
        />
        <StatCard
          icon={<GitCompareArrows className="h-5 w-5" />}
          formattedValue={format.number(stats.totalVersions)}
          label={t("totalVersions")}
          description={t("totalVersionsDesc")}
        />
        <StatCard
          icon={<Link2 className="h-5 w-5" />}
          formattedValue={format.number(stats.totalReferences)}
          label={t("totalReferences")}
          description={t("totalReferencesDesc")}
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5" />}
          formattedValue={format.number(stats.totalComments)}
          label={t("totalComments")}
          description={t("totalCommentsDesc")}
        />
      </div>

      {/* Voting stats */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<ThumbsUp className="h-5 w-5" />}
          formattedValue={format.number(stats.agreeVotes)}
          label={t("agreeVotes")}
          description={t("agreeVotesDesc")}
        />
        <StatCard
          icon={<ThumbsDown className="h-5 w-5" />}
          formattedValue={format.number(stats.disagreeVotes)}
          label={t("disagreeVotes")}
          description={t("disagreeVotesDesc")}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          formattedValue={format.number(stats.totalVotes)}
          label={t("totalVotes")}
          description={t("totalVotesDesc")}
        />
      </div>

      {/* Per-version breakdown + top referenced */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Articles per version - Recharts bar chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{t("articlesPerVersion")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("articlesPerVersionDesc")}</p>
          <div className="mt-4">
            <VersionBarChart data={stats.versionStats} />
          </div>
        </div>

        {/* Top referenced articles */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{t("topReferenced")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("topReferencedDesc")}</p>
          <div className="mt-6">
            {stats.topArticles.length > 0 ? (
              <div className="space-y-3">
                {stats.topArticles.map((article) => (
                  <Link
                    key={`art-${article.year}-${article.number}`}
                    href={`/${article.year}/articolul-${article.number}`}
                    className="group flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary">
                        {tCommon("art")} {article.number}
                        {article.title ? ` — ${article.title}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tCommon("constitutionOf")} {article.year}
                      </p>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-2">
                      <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1">
                        <Link2 className="h-3 w-3 text-primary" />
                        <span className="text-xs font-semibold text-primary tabular-nums">
                          {article.refCount}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noReferences")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
