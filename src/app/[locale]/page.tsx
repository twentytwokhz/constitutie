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
import { FolkDivider } from "@/components/landing/folk-divider";
import { GridBackground } from "@/components/landing/grid-background";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { StatsSection } from "@/components/landing/stats-section";
import { Timeline } from "@/components/landing/timeline";
import { Footer } from "@/components/layout/footer";
import { RomanianFlag, TricolorDivider } from "@/components/national-symbols";
import { Link } from "@/i18n/navigation";
import { BookOpen, GitCompareArrows, MessageSquare, Network, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

/**
 * Landing Page - Constituția României
 *
 * Full-width layout with stacked sections:
 * Hero → Feature Cards → Cum Funcționează → Timeline → Statistici → FAQ → CTA → Footer
 *
 * Visual features:
 * - Romanian folk motif geometric patterns (GridBackground with ie-inspired SVG)
 * - Tricolor gradient accent in hero (blue/yellow/red glow + top bar)
 * - Folk-inspired section dividers (FolkDivider) with progressive intensity
 * - All patterns adapt to dark/light mode and respect prefers-reduced-motion
 */
export default async function HomePage() {
  const t = await getTranslations();
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section — full viewport, animated headline, grid background */}
      <section className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden py-10 md:py-0">
        <GridBackground />

        {/* Tricolor top bar removed — now integrated into the sticky header */}

        {/* Tricolor gradient accent — subtle background glow behind hero content */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute -left-32 top-1/2 -translate-y-1/2 h-[500px] w-[200px] rotate-12 opacity-[0.12] dark:opacity-[0.18] blur-3xl rounded-full"
            style={{
              background:
                "linear-gradient(180deg, #002B7F 0%, #002B7F 33%, #FCD116 33%, #FCD116 66%, #CE1126 66%, #CE1126 100%)",
            }}
          />
          <div
            className="absolute -right-32 top-1/2 -translate-y-1/2 h-[400px] w-[160px] -rotate-12 opacity-[0.10] dark:opacity-[0.14] blur-3xl rounded-full"
            style={{
              background:
                "linear-gradient(180deg, #002B7F 0%, #002B7F 33%, #FCD116 33%, #FCD116 66%, #CE1126 66%, #CE1126 100%)",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col items-center gap-8 md:gap-12 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              {/* Romanian Flag — prominent tricolor above headline */}
              <div
                className="mb-6 flex items-center justify-center gap-4 md:justify-start animate-word-reveal"
                style={{ animationDelay: "50ms" }}
              >
                <RomanianFlag
                  className="w-28 h-[76px] sm:w-36 sm:h-24 md:w-44 md:h-[120px] drop-shadow-md"
                  label={t("common.romanianFlag")}
                />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
                    {t("hero.romania")}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 sm:text-xs">
                    {t("hero.fundamentalLaw")}
                  </span>
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
                <AnimatedText
                  text={`${t("hero.headline")} ${t("hero.headlineHighlight")}`}
                  highlightWords={[t("hero.headlineHighlight")]}
                  highlightClass="text-primary"
                  staggerMs={120}
                />
              </h1>
              <p
                className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg md:mx-0 animate-word-reveal"
                style={{ animationDelay: "400ms" }}
              >
                {t("hero.subtitle")} {t("hero.years")}
              </p>
              <div
                className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4 md:justify-start animate-word-reveal"
                style={{ animationDelay: "700ms" }}
              >
                <Link
                  href="/2003"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 sm:h-11"
                >
                  {t("hero.ctaExplore")}
                </Link>
                <Link
                  href="/compare"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground sm:h-11"
                >
                  {t("hero.ctaCompare")}
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0 animate-word-reveal" style={{ animationDelay: "300ms" }}>
              <IllustrationConstitution className="h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80" />
            </div>
          </div>
        </div>

        {/* Tricolor bottom bar accent — mirrors the top bar to frame the hero */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to right, #002B7F 0%, #002B7F 33.33%, #FCD116 33.33%, #FCD116 66.66%, #CE1126 66.66%, #CE1126 100%)",
          }}
        />
      </section>

      {/* Folk divider: Hero → Features (strong intensity — most prominent near hero) */}
      <FolkDivider intensity="strong" />

      {/* Feature Cards Section */}
      <section className="border-t bg-muted/30 py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {t("features.sectionTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
              {t("features.sectionDescription")}
            </p>
          </ScrollReveal>
          <div className="mt-8 grid gap-6 sm:mt-14 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Explore card */}
            <ScrollReveal delay={0}>
              <div className="group h-full rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
                <IllustrationExplore className="mx-auto h-36 w-36" />
                <div className="mt-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{t("features.exploreArticles")}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("features.exploreArticlesDesc")}
                </p>
              </div>
            </ScrollReveal>
            {/* Compare card */}
            <ScrollReveal delay={100}>
              <div className="group h-full rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
                <IllustrationCompare className="mx-auto h-36 w-36" />
                <div className="mt-4 flex items-center gap-2">
                  <GitCompareArrows className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{t("features.compareVersions")}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("features.compareVersionsDesc")}
                </p>
              </div>
            </ScrollReveal>
            {/* Graph card */}
            <ScrollReveal delay={200}>
              <div className="group h-full rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
                <IllustrationGraph className="mx-auto h-36 w-36" />
                <div className="mt-4 flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{t("features.graphView")}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t("features.graphViewDesc")}</p>
              </div>
            </ScrollReveal>
            {/* Search card */}
            <ScrollReveal delay={0}>
              <div className="group h-full rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
                <IllustrationSearch className="mx-auto h-36 w-36" />
                <div className="mt-4 flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{t("features.crossSearch")}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("features.crossSearchDesc")}
                </p>
              </div>
            </ScrollReveal>
            {/* Feedback card */}
            <ScrollReveal delay={100}>
              <div className="group h-full rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
                <IllustrationFeedback className="mx-auto h-36 w-36" />
                <div className="mt-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{t("features.feedback")}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t("features.feedbackDesc")}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Folk divider + tricolor: Features → How It Works (medium intensity) */}
      <FolkDivider intensity="medium" />
      <TricolorDivider />

      {/* How It Works — 3-step visual section */}
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      {/* Folk divider + tricolor: How It Works → Timeline (medium, flipped for variety) */}
      <TricolorDivider />
      <FolkDivider intensity="medium" flip />

      {/* Timeline — interactive constitution versions */}
      <ScrollReveal>
        <Timeline />
      </ScrollReveal>

      {/* Folk divider + tricolor: Timeline → Statistics (subtle intensity) */}
      <FolkDivider intensity="subtle" />
      <TricolorDivider />

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

      {/* Folk divider + tricolor: Statistics → FAQ (subtle, flipped) */}
      <TricolorDivider />
      <FolkDivider intensity="subtle" flip />

      {/* FAQ Section */}
      <ScrollReveal>
        <FaqSection />
      </ScrollReveal>

      {/* Folk divider: FAQ → CTA (subtle — lightest near footer) */}
      <FolkDivider intensity="subtle" />
      <TricolorDivider />

      {/* Final CTA Section */}
      <ScrollReveal>
        <section className="border-t bg-primary/5 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("cta.title")}</h2>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                {t("cta.description")}
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/2003"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-10 text-base font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
                >
                  {t("cta.explore")}
                </Link>
                <Link
                  href="/compare"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-10 text-base font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {t("cta.compare")}
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
