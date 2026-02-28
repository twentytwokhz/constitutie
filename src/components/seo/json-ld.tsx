/**
 * JSON-LD Structured Data Components
 *
 * Provides rich snippet support for Google Search by embedding
 * schema.org structured data in &lt;script type="application/ld+json"&gt;.
 *
 * All data is server-generated from trusted database content,
 * NOT from user input — no XSS risk. JSON.stringify() also prevents
 * injection by escaping special characters.
 *
 * - WebSiteJsonLd: For the landing page (SearchAction for sitelinks searchbox)
 * - ArticleJsonLd: For individual constitution article pages
 * - BreadcrumbJsonLd: For breadcrumb navigation rich snippets
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://constitutia-romaniei.ro";

interface WebSiteJsonLdProps {
  locale: string;
}

/**
 * WebSite schema for the landing page.
 * Enables the Google sitelinks searchbox in search results.
 *
 * Content is server-generated from static translations, not user input.
 */
export function WebSiteJsonLd({ locale }: WebSiteJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name:
      locale === "en"
        ? "Romanian Constitution - Interactive Explorer"
        : "Constituția României - Explorare Interactivă",
    url: `${BASE_URL}/${locale}`,
    description:
      locale === "en"
        ? "Interactive platform for exploring the Romanian Constitution through all its historical versions (1866, 1923, 1938, 1948, 1952, 1965, 1986, 1991, 2003)."
        : "Platformă interactivă pentru explorarea Constituției României prin toate versiunile sale istorice (1866, 1923, 1938, 1948, 1952, 1965, 1986, 1991, 2003).",
    inLanguage: locale === "en" ? "en-US" : "ro-RO",
    publisher: {
      "@type": "Organization",
      name: "Constituția României Project",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/images/logo2003.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe — JSON.stringify of server-generated schema.org data, no user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ArticleJsonLdProps {
  locale: string;
  year: number;
  articleNumber: number;
  articleTitle?: string | null;
  articleContent: string;
  url: string;
}

/**
 * Legislation schema for individual constitution article pages.
 * Helps Google understand the page is a legislative article.
 *
 * Content is from the trusted database (constitution text), not user input.
 */
export function ArticleJsonLd({
  locale,
  year,
  articleNumber,
  articleTitle,
  articleContent,
  url,
}: ArticleJsonLdProps) {
  const headline = articleTitle
    ? `${locale === "en" ? "Art." : "Art."} ${articleNumber} — ${articleTitle}`
    : `${locale === "en" ? "Article" : "Articolul"} ${articleNumber}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: headline,
    legislationType: locale === "en" ? "Constitution" : "Constituție",
    legislationDate: `${year}-01-01`,
    description: articleContent.substring(0, 300).trim(),
    url: `${BASE_URL}${url}`,
    inLanguage: locale === "en" ? "en-US" : "ro-RO",
    isPartOf: {
      "@type": "Legislation",
      name:
        locale === "en" ? `Romanian Constitution of ${year}` : `Constituția României din ${year}`,
      legislationType: locale === "en" ? "Constitution" : "Constituție",
    },
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe — JSON.stringify of server-generated schema.org data from DB
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbList schema for navigation breadcrumbs.
 * Helps Google show breadcrumb trails in search results.
 *
 * Content is server-generated from DB structural unit names, not user input.
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe — JSON.stringify of server-generated breadcrumb data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
