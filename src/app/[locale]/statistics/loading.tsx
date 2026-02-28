/**
 * Statistics Page Loading Skeleton
 *
 * Displays animated skeleton placeholders while the statistics page
 * fetches data from the database. Mirrors the layout of the actual page.
 */
export default function StatisticsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page heading skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-96 max-w-full animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Main stat cards (4 cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="mt-3 h-8 w-20 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Voting stat cards (3 cards) */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Charts row (2 columns) */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Bar chart skeleton */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-1 h-4 w-64 max-w-full animate-pulse rounded bg-muted" />
          <div className="mt-6 flex items-end gap-3 h-48">
            {[40, 55, 75, 90].map((h) => (
              <div
                key={h}
                className="flex-1 animate-pulse rounded-t bg-muted"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Top referenced articles skeleton */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-1 h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
              >
                <div>
                  <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                  <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-6 w-10 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
