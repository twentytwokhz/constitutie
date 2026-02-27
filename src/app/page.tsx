import {
  IllustrationCompare,
  IllustrationConstitution,
  IllustrationExplore,
  IllustrationFeedback,
  IllustrationGraph,
  IllustrationSearch,
} from "@/components/illustrations";
import { StatsSection } from "@/components/landing/stats-section";
import { BookOpen, GitCompareArrows, MessageSquare, Network, Search } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

/**
 * Landing Page - Constituția României
 *
 * Full-width layout with stacked sections:
 * Hero → Feature Cards → Cum Funcționează → Timeline → Statistici → FAQ → CTA → Footer
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex min-h-[90vh] items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
                Constituția <span className="text-primary">României</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:mx-0">
                Explorează legea fundamentală a României prin toate versiunile sale istorice: 1952,
                1986, 1991, 2003.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
                <Link
                  href="/2003"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
                >
                  Explorează Constituția
                </Link>
                <Link
                  href="/compare"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Compară Versiuni
                </Link>
              </div>
            </div>
            <IllustrationConstitution className="h-64 w-64 flex-shrink-0 md:h-80 md:w-80" />
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Descoperă funcționalitățile
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Tot ce ai nevoie pentru a explora și înțelege Constituția României
          </p>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Explore card */}
            <div className="group rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
              <IllustrationExplore className="mx-auto h-36 w-36" />
              <div className="mt-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Explorare articole</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Navighează articol cu articol prin toate versiunile constituției, cu table of
                contents interactiv și deep linking.
              </p>
            </div>
            {/* Compare card */}
            <div className="group rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
              <IllustrationCompare className="mx-auto h-36 w-36" />
              <div className="mt-4 flex items-center gap-2">
                <GitCompareArrows className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Comparare versiuni</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Compară orice două versiuni ale Constituției cu diff viewer modern, vizualizare
                adăugări, eliminări și modificări.
              </p>
            </div>
            {/* Graph card */}
            <div className="group rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
              <IllustrationGraph className="mx-auto h-36 w-36" />
              <div className="mt-4 flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Vizualizare graf</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Vizualizează structura ierarhică și referințele inter-articol printr-un graf
                interactiv.
              </p>
            </div>
            {/* Search card */}
            <div className="group rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
              <IllustrationSearch className="mx-auto h-36 w-36" />
              <div className="mt-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Căutare cross-versiune</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Caută instantaneu articole prin toate versiunile, cu command palette (Ctrl+K) și
                preview cu highlight.
              </p>
            </div>
            {/* Feedback card */}
            <div className="group rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
              <IllustrationFeedback className="mx-auto h-36 w-36" />
              <div className="mt-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Feedback anonim</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Exprimă-ți acordul sau dezacordul și lasă comentarii anonime, moderate automat de
                AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <Suspense
        fallback={
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto h-10 w-64 animate-pulse rounded bg-muted" />
                <div className="mx-auto mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
              </div>
              <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
                <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
                <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
                <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
              </div>
            </div>
          </section>
        }
      >
        <StatsSection />
      </Suspense>
    </main>
  );
}
