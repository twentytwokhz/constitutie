import { IllustrationStatistics } from "@/components/illustrations";

/**
 * Statistics Dashboard Page
 *
 * Route: /statistics
 *
 * Features:
 * - Stat cards (total articles, versions, references, comments)
 * - Bar chart: articles per version (Recharts via shadcn)
 * - Chart: modifications between consecutive versions
 * - Top articles by reference count
 * - Responsive layout
 */
export default function StatisticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Statistici</h1>
      <div className="mt-12 flex flex-col items-center">
        <IllustrationStatistics className="h-48 w-48 opacity-60" />
        <p className="mt-6 text-muted-foreground">
          Dashboard-ul de statistici — în curs de implementare.
        </p>
      </div>
    </div>
  );
}
