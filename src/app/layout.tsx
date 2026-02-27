import { ThemeProvider } from "@/components/layout/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Constituția României - Explorare Interactivă",
  description:
    "Platformă interactivă pentru explorarea Constituției României prin toate versiunile sale istorice (1952, 1986, 1991, 2003). Navigare articol cu articol, comparare versiuni, vizualizare graf, căutare cross-versiune.",
  keywords: [
    "Constituția României",
    "constituție",
    "lege fundamentală",
    "drept constituțional",
    "1952",
    "1986",
    "1991",
    "2003",
  ],
  authors: [{ name: "Constituția României Project" }],
  openGraph: {
    title: "Constituția României - Explorare Interactivă",
    description: "Explorează Constituția României prin toate versiunile sale istorice.",
    type: "website",
    locale: "ro_RO",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
