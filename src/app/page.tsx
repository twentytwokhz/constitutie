import {
  IllustrationCompare,
  IllustrationConstitution,
  IllustrationExplore,
  IllustrationFeedback,
  IllustrationGraph,
  IllustrationSearch,
} from "@/components/illustrations";
import { AnimatedText } from "@/components/landing/animated-text";
import { FaqSection } from "@/components/landing/faq-section";
import { GridBackground } from "@/components/landing/grid-background";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { StatsSection } from "@/components/landing/stats-section";
import { Timeline } from "@/components/landing/timeline";
import { Footer } from "@/components/layout/footer";
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
      {/* Hero Section — full viewport, animated headline, grid background */}
      <section className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden py-10 md:py-0">
        <GridBackground />
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col items-center gap-8 md:gap-12 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
                <AnimatedText
                  text="Constituția României"
                  highlightWords={["României"]}
                  highlightClass="text-primary"
                  staggerMs={120}
                />
              </h1>
              <p
                className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg md:mx-0 animate-word-reveal"
                style={{ animationDelay: "400ms" }}
              >
                Explorează legea fundamentală a României prin toate versiunile sale istorice: 1952,
                1986, 1991, 2003.
              </p>
              <div
                className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4 md:justify-start animate-word-reveal"
                style={{ animationDelay: "700ms" }}
              >
                <Link
                  href="/2003"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 sm:h-11"
                >
                  Explorează Constituția
                </Link>
                <Link
                  href="/compare"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground sm:h-11"
                >
                  Compară Versiuni
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0 animate-word-reveal" style={{ animationDelay: "300ms" }}>
              <IllustrationConstitution className="h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="border-t bg-muted/30 py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Descoperă funcționalitățile
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
              Tot ce ai nevoie pentru a explora și înțelege Constituția României
            </p>
          </ScrollReveal>
          <div className="mt-8 grid gap-6 sm:mt-14 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Explore card */}
            <ScrollReveal delay={0}>
              <div className="group h-full rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
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
            </ScrollReveal>
            {/* Compare card */}
            <ScrollReveal delay={100}>
              <div className="group h-full rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
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
            </ScrollReveal>
            {/* Graph card */}
            <ScrollReveal delay={200}>
              <div className="group h-full rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
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
            </ScrollReveal>
            {/* Search card */}
            <ScrollReveal delay={0}>
              <div className="group h-full rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
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
            </ScrollReveal>
            {/* Feedback card */}
            <ScrollReveal delay={100}>
              <div className="group h-full rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
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
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works — 3-step visual section */}
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      {/* Timeline — interactive constitution versions */}
      <ScrollReveal>
        <Timeline />
      </ScrollReveal>

      {/* Statistics Section */}
      <ScrollReveal>
        <Suspense
          fallback={
            <section className="py-12 sm:py-20">
              <div className="container mx-auto px-4">
                <div className="mx-auto max-w-2xl text-center">
                  <div className="mx-auto h-8 w-48 animate-pulse rounded bg-muted sm:h-10 sm:w-64" />
                  <div className="mx-auto mt-4 h-5 w-full max-w-sm animate-pulse rounded bg-muted sm:max-w-96" />
                </div>
                <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="h-28 animate-pulse rounded-xl border border-border bg-card sm:h-32" />
                  <div className="h-28 animate-pulse rounded-xl border border-border bg-card sm:h-32" />
                  <div className="h-28 animate-pulse rounded-xl border border-border bg-card sm:h-32" />
                  <div className="h-28 animate-pulse rounded-xl border border-border bg-card sm:h-32" />
                </div>
              </div>
            </section>
          }
        >
          <StatsSection />
        </Suspense>
      </ScrollReveal>

      {/* FAQ Section */}
      <ScrollReveal>
        <FaqSection />
      </ScrollReveal>

      {/* Final CTA Section */}
      <ScrollReveal>
        <section className="border-t bg-primary/5 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Pregătit să explorezi legea fundamentală?
              </h2>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Navighează prin toate versiunile Constituției României, compară modificările și
                descoperă evoluția drepturilor tale.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/2003"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-10 text-base font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
                >
                  Explorează Constituția
                </Link>
                <Link
                  href="/compare"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-10 text-base font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Compară Versiuni
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Footer */}
      <Footer />
    </main>
  );
}
