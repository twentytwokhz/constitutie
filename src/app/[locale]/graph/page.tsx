import type { Metadata } from "next";
import { GraphPageClient } from "./graph-client";

export const metadata: Metadata = {
  title: "Vizualizare structurală — Constituția României",
  description:
    "Vizualizează structura ierarhică și referințele inter-articol ale Constituției României printr-un graf interactiv.",
  openGraph: {
    title: "Vizualizare structurală — Constituția României",
    description:
      "Vizualizează structura ierarhică și referințele inter-articol ale Constituției României printr-un graf interactiv.",
    type: "website",
    locale: "ro_RO",
  },
  twitter: {
    card: "summary",
    title: "Vizualizare structurală — Constituția României",
    description:
      "Vizualizează structura ierarhică și referințele inter-articol ale Constituției României printr-un graf interactiv.",
  },
};

export default function GraphPage() {
  return <GraphPageClient />;
}
