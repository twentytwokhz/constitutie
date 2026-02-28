"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const VERSIONS = [
  { year: "2003", label: "Constituția 2003" },
  { year: "1991", label: "Constituția 1991" },
  { year: "1986", label: "Constituția 1986" },
  { year: "1952", label: "Constituția 1952" },
] as const;

/**
 * Version selector dropdown for the header.
 *
 * Detects the currently active constitution year from the URL,
 * and navigates to the selected version's reader page on change.
 */
export function VersionSelector() {
  const pathname = usePathname();
  const router = useRouter();

  // Extract current year from pathname (e.g., /2003/... → "2003")
  const yearMatch = pathname.match(/^\/(\d{4})(\/|$)/);
  const currentYear = yearMatch ? yearMatch[1] : undefined;

  const handleVersionChange = (year: string) => {
    router.push(`/${year}`);
  };

  return (
    <Select value={currentYear} onValueChange={handleVersionChange}>
      <SelectTrigger
        className="h-8 w-auto gap-1.5 border-border/60 bg-transparent px-2.5 text-xs font-medium focus:ring-1"
        aria-label="Selectează versiunea constituției"
      >
        <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
        <SelectValue placeholder="Versiune" />
      </SelectTrigger>
      <SelectContent>
        {VERSIONS.map((v) => (
          <SelectItem key={v.year} value={v.year}>
            {v.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
