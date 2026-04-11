import { asc } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { articles, constitutionVersions } from "@/lib/db/schema";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://constitutia-romaniei.ro";

/**
 * Dynamic sitemap generation.
 *
 * Generates URLs for all pages including:
 * - Landing page (ro + en)
 * - Compare page (ro + en)
 * - Graph page (ro + en)
 * - Statistics page (ro + en)
 * - Every article page per version (ro + en)
 *
 * Article URLs use the deep-link format: /{locale}/{year}/articolul-{number}
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["ro", "en"];

  // Static pages with their change frequencies and priorities
  const staticPages = [
    { path: "", changeFrequency: "monthly" as const, priority: 1.0 },
    { path: "/compare", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/graph", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/statistics", changeFrequency: "weekly" as const, priority: 0.6 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          ro: `${BASE_URL}/ro${page.path}`,
          en: `${BASE_URL}/en${page.path}`,
        },
      },
    })),
  );

  // Fetch all versions
  const versions = await db
    .select({ id: constitutionVersions.id, year: constitutionVersions.year })
    .from(constitutionVersions)
    .orderBy(asc(constitutionVersions.year));

  // Version landing pages (e.g., /ro/2003)
  const versionEntries: MetadataRoute.Sitemap = versions.flatMap((version) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/${version.year}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
      alternates: {
        languages: {
          ro: `${BASE_URL}/ro/${version.year}`,
          en: `${BASE_URL}/en/${version.year}`,
        },
      },
    })),
  );

  // Fetch all articles with their structural units for deep-link URLs
  const allArticles = await db
    .select({
      number: articles.number,
      versionId: articles.versionId,
      structuralUnitId: articles.structuralUnitId,
    })
    .from(articles)
    .orderBy(asc(articles.versionId), asc(articles.orderIndex));

  // Build version ID → year map
  const versionMap = new Map(versions.map((v) => [v.id, v.year]));

  // Article pages (e.g., /ro/2003/articolul-15)
  const articleEntries: MetadataRoute.Sitemap = allArticles.flatMap((article) => {
    const year = versionMap.get(article.versionId);
    if (!year) return [];

    const articlePath = `/${year}/articolul-${article.number}`;

    return locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${articlePath}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          ro: `${BASE_URL}/ro${articlePath}`,
          en: `${BASE_URL}/en${articlePath}`,
        },
      },
    }));
  });

  return [...staticEntries, ...versionEntries, ...articleEntries];
}
