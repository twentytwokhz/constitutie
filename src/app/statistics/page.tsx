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
      <p className="mt-4 text-muted-foreground">
        Statistics dashboard - to be implemented
      </p>
    </div>
  );
}
