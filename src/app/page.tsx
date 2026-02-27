import Link from "next/link";

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
      <section className="flex min-h-screen items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
            Constituția <span className="text-primary">României</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Explorează legea fundamentală a României prin toate versiunile sale istorice: 1952,
            1986, 1991, 2003.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
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
      </section>
    </main>
  );
}
