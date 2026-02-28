"use client";

import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { CoatOfArms } from "@/components/national-symbols";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";

const VERSION_YEARS = ["2003", "1991", "1986", "1952"] as const;

/**
 * Version selector dropdown for the header.
 *
 * Detects the currently active constitution year from the URL,
 * and navigates to the selected version's reader page on change.
 */
export function VersionSelector() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("versionSelector");

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
        aria-label={t("label")}
      >
        <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
        <SelectValue placeholder={t("placeholder")} />
      </SelectTrigger>
      <SelectContent>
        {VERSION_YEARS.map((year) => (
          <SelectItem key={year} value={year}>
            <span className="inline-flex items-center gap-2">
              <CoatOfArms year={Number(year)} size={20} className="shrink-0" />
              {t(`constitution${year}`)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
