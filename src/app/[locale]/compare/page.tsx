import type { Metadata } from "next";
import { ComparePageClient } from "./compare-client";

/**
 * Generate OG meta tags for the comparison page.
 *
 * Uses searchParams (a, b) to build a descriptive title when available.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}): Promise<Metadata> {
  const { a, b } = await searchParams;

  const hasYears = a && b;
  const ogTitle = hasYears
    ? `Comparație: Constituția ${a} vs ${b}`
    : "Comparație versiuni — Constituția României";
  const ogDescription = hasYears
    ? `Compară Constituția din ${a} cu cea din ${b}: diferențe articol cu articol, vizualizare adăugări, eliminări și modificări.`
    : "Compară orice două versiuni ale Constituției României articol cu articol.";

  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website",
      locale: "ro_RO",
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description: ogDescription,
    },
  };
}

export default function ComparePage() {
  return <ComparePageClient />;
}
