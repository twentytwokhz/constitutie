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
  keywords: [
    "Constituția României",
    "Romanian Constitution",
    "constituție",
    "lege fundamentală",
    "drept constituțional",
    "1952",
    "1986",
    "1991",
    "2003",
  ],
  authors: [{ name: "Constituția României Project" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
