import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("compare");

  const hasYears = a && b;
  const ogTitle = hasYears ? t("metaTitleWithYears", { a, b }) : t("metaTitle");
  const ogDescription = hasYears ? t("metaDescriptionWithYears", { a, b }) : t("metaDescription");

  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website",
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
