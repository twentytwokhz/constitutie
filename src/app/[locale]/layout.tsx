import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { TricolorStripe } from "@/components/national-symbols";
import { CommandPalette } from "@/components/search/command-palette";
import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://constitutia-romaniei.ro";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        ro: `${BASE_URL}/ro`,
        en: `${BASE_URL}/en`,
        "x-default": `${BASE_URL}/ro`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "ro" ? "ro_RO" : "en_US",
      alternateLocale: locale === "ro" ? "en_US" : "ro_RO",
      siteName: t("appName"),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <TricolorStripe height="4px" />
        <Header />
        <Suspense fallback={null}>
          <CommandPalette />
        </Suspense>
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
