import { VersionBarChart } from "@/components/statistics/version-bar-chart";
import { db } from "@/lib/db";
import {
  articleReferences,
  articles,
  comments,
  constitutionVersions,
  votes,
} from "@/lib/db/schema";
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
import Link from "next/link";

/**
 * Statistics Dashboard Page
 *
 * Route: /statistics
 *
 * Displays dashboard-style stat cards with real data from the database,
 * plus per-version article counts and voting statistics.
 */

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  description: string;
  trend?: string;
}

function StatCard({ icon, value, label, description, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
        {value.toLocaleString("ro-RO")}
      </p>
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
  const stats = await getStatistics();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Statistici</h1>
        <p className="mt-2 text-muted-foreground">
          Dashboard cu date reale din baza de date a Constituției României.
        </p>
      </div>

      {/* Main stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          value={stats.totalArticles}
          label="Total Articole"
          description="Din toate cele 4 versiuni"
          trend="active"
        />
        <StatCard
          icon={<GitCompareArrows className="h-5 w-5" />}
          value={stats.totalVersions}
          label="Versiuni"
          description="1952, 1986, 1991, 2003"
        />
        <StatCard
          icon={<Link2 className="h-5 w-5" />}
          value={stats.totalReferences}
          label="Referințe inter-articol"
          description="Legături între articole"
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5" />}
          value={stats.totalComments}
          label="Comentarii"
          description="Aprobate de moderare AI"
        />
      </div>

      {/* Voting stats */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<ThumbsUp className="h-5 w-5" />}
          value={stats.agreeVotes}
          label="Voturi De Acord"
          description="Pe toate articolele"
        />
        <StatCard
          icon={<ThumbsDown className="h-5 w-5" />}
          value={stats.disagreeVotes}
          label="Voturi Dezacord"
          description="Pe toate articolele"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          value={stats.totalVotes}
          label="Total Voturi"
          description="Participare cetățeni"
        />
      </div>

      {/* Per-version breakdown + top referenced */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Articles per version - Recharts bar chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Articole per versiune</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Numărul de articole din fiecare versiune a constituției
          </p>
          <div className="mt-4">
            <VersionBarChart data={stats.versionStats} />
          </div>
        </div>

        {/* Top referenced articles */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Top articole referențiate</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Articolele cu cele mai multe referințe din alte articole
          </p>
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
                        Art. {article.number}
                        {article.title ? ` — ${article.title}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Constituția din {article.year}
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
              <p className="text-sm text-muted-foreground">
                Nu au fost detectate referințe inter-articol.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
