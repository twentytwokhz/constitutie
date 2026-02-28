import { count, eq } from "drizzle-orm";
import { BookOpen, GitCompareArrows, Link2, MessageSquare } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { articleReferences, articles, comments, constitutionVersions } from "@/lib/db/schema";

interface StatCardProps {
  icon: React.ReactNode;
  formattedValue: string;
  label: string;
  description: string;
}

function StatCard({ icon, formattedValue, label, description }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-12 sm:w-12">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
            {formattedValue}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

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

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<BookOpen className="h-6 w-6" />}
            formattedValue={format.number(stats.totalArticles)}
            label={t("stats.articles")}
            description={t("stats.articlesSubtitle")}
          />
          <StatCard
            icon={<GitCompareArrows className="h-6 w-6" />}
            formattedValue={format.number(stats.totalVersions)}
            label={t("stats.versions")}
            description={t("stats.versionsSubtitle")}
          />
          <StatCard
            icon={<Link2 className="h-6 w-6" />}
            formattedValue={format.number(stats.totalReferences)}
            label={t("stats.references")}
            description={t("stats.referencesSubtitle")}
          />
          <StatCard
            icon={<MessageSquare className="h-6 w-6" />}
            formattedValue={format.number(stats.totalComments)}
            label={t("stats.comments")}
            description={t("stats.commentsSubtitle")}
          />
        </div>
      </div>
    </section>
  );
}
