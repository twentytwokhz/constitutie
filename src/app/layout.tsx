import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://constitutia-romaniei.ro";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Constituția României - Explorare Interactivă",
    template: "%s | Constituția României",
  },
  description:
    "Platformă interactivă pentru explorarea Constituției României prin toate versiunile sale istorice (1866–2003). Navigare articol cu articol, comparare versiuni, vizualizare graf și feedback cetățenesc.",
  keywords: [
    "Constituția României",
    "Romanian Constitution",
    "constituție",
    "lege fundamentală",
    "drept constituțional",
    "articole constituție",
    "comparație versiuni constituție",
    "1866",
    "1923",
    "1938",
    "1948",
    "1952",
    "1965",
    "1986",
    "1991",
    "2003",
  ],
  authors: [{ name: "Constituția României Project" }],
  creator: "Constituția României Project",
  publisher: "Constituția României Project",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    alternateLocale: "en_US",
    siteName: "Constituția României",
    title: "Constituția României - Explorare Interactivă",
    description:
      "Platformă interactivă pentru explorarea Constituției României prin toate versiunile sale istorice (1866–2003).",
    images: [
      {
        url: "/images/logo2003.png",
        width: 512,
        height: 512,
        alt: "Stema României - Constituția României",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Constituția României - Explorare Interactivă",
    description:
      "Platformă interactivă pentru explorarea Constituției României prin toate versiunile sale istorice.",
    images: ["/images/logo2003.png"],
  },
  icons: {
    icon: [
      { url: "/images/logo2003.webp", type: "image/webp" },
      { url: "/images/logo2003.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/images/logo2003.png", sizes: "180x180" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification when available
    // google: "verification-token",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
