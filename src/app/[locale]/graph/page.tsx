import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GraphPageClient } from "./graph-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("graph");

  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function GraphPage() {
  return <GraphPageClient />;
}
