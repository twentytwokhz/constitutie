/**
 * Reader Page Loading Skeleton
 *
 * Displays animated skeleton placeholders while the reader page
 * fetches article data from the database. Mirrors the 3-column layout.
 */
export default function ReaderLoading() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Reading progress placeholder */}
      <div className="h-6 border-b border-border bg-muted/30" />

      <div className="flex flex-1">
        {/* TOC Sidebar skeleton — desktop only */}
        <aside className="hidden lg:block w-[280px] shrink-0 border-r border-border sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-1.5 mt-3">
                <div
                  className="h-4 animate-pulse rounded bg-muted"
                  style={{ width: `${70 + ((i * 13) % 30)}%` }}
                />
                {i % 3 === 0 && (
                  <div className="ml-4 space-y-1">
                    <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content area skeleton */}
        <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-8 max-w-4xl mx-auto w-full">
          {/* Breadcrumb skeleton */}
          <nav className="mb-6 flex items-center gap-2">
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
            <span className="text-muted-foreground/50">/</span>
            <div className="h-4 w-10 animate-pulse rounded bg-muted" />
            <span className="text-muted-foreground/50">/</span>
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </nav>

          {/* Structural heading skeleton */}
          <div className="mb-4 space-y-1">
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>

          {/* Article header skeleton */}
          <header className="mb-8">
            <div className="flex items-baseline gap-3">
              <div className="h-6 w-16 animate-pulse rounded bg-primary/20" />
              <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            </div>
          </header>

          {/* Article content skeleton */}
          <article className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div
                  className="h-4 animate-pulse rounded bg-muted"
                  style={{ width: `${85 + ((i * 7) % 15)}%` }}
                />
                <div
                  className="h-4 animate-pulse rounded bg-muted"
                  style={{ width: `${70 + ((i * 11) % 25)}%` }}
                />
                {i % 2 === 0 && (
                  <div
                    className="h-4 animate-pulse rounded bg-muted"
                    style={{ width: `${50 + ((i * 9) % 30)}%` }}
                  />
                )}
              </div>
            ))}
          </article>

          {/* Vote buttons skeleton */}
          <div className="mt-8 border-t border-border pt-6">
            <div className="h-4 w-56 animate-pulse rounded bg-muted mb-3" />
            <div className="flex gap-3">
              <div className="h-10 w-28 animate-pulse rounded-lg bg-muted" />
              <div className="h-10 w-28 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>

          {/* Navigation skeleton */}
          <nav className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <div className="h-14 w-40 animate-pulse rounded-lg border border-border" />
            <div className="h-14 w-40 animate-pulse rounded-lg border border-border" />
          </nav>

          {/* Comments skeleton */}
          <section className="mt-8 border-t border-border pt-6">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-4 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border border-border p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
