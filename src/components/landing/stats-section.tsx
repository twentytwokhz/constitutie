import { db } from "@/lib/db";
import { articleReferences, articles, comments, constitutionVersions } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { BookOpen, GitCompareArrows, Link2, MessageSquare } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  description: string;
}

function StatCard({ icon, value, label, description }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-12 sm:w-12">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
            {value.toLocaleString("ro-RO")}
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

  return (
    <section className="py-12 sm:py-20" id="statistici">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Constituția în <span className="text-primary">cifre</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
            Date reale extrase din toate cele patru versiuni ale Constituției României.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<BookOpen className="h-6 w-6" />}
            value={stats.totalArticles}
            label="Articole"
            description="Din toate cele 4 versiuni"
          />
          <StatCard
            icon={<GitCompareArrows className="h-6 w-6" />}
            value={stats.totalVersions}
            label="Versiuni"
            description="1952, 1986, 1991, 2003"
          />
          <StatCard
            icon={<Link2 className="h-6 w-6" />}
            value={stats.totalReferences}
            label="Referințe"
            description="Între articole diferite"
          />
          <StatCard
            icon={<MessageSquare className="h-6 w-6" />}
            value={stats.totalComments}
            label="Comentarii"
            description="De la cetățeni"
          />
        </div>
      </div>
    </section>
  );
}
