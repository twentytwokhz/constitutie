"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { CoatOfArms } from "@/components/national-symbols";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";

const VERSION_YEARS = [
  "2003",
  "1991",
  "1986",
  "1965",
  "1952",
  "1948",
  "1938",
  "1923",
  "1866",
] as const;

/**
 * Version selector dropdown for the header.
 *
 * Detects the currently active constitution year from the URL,
 * and navigates to the selected version's reader page on change.
 *
 * CoatOfArms badge is shown inside each SelectItem; the trigger renders
 * the selected item's content via SelectValue (no separate badge needed).
 * Items use a fixed height to prevent layout shift between versions.
 */
export function VersionSelector() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("versionSelector");

  // Extract current year from pathname (e.g., /2003/... → "2003")
  const yearMatch = pathname.match(/^\/(\d{4})(\/|$)/);
  const currentYear = yearMatch ? yearMatch[1] : undefined;

  // Persist last viewed year so other pages (e.g. Compare) can use it as default
  useEffect(() => {
    if (currentYear) {
      try {
        localStorage.setItem("lastViewedYear", currentYear);
      } catch {
        // localStorage unavailable (SSR, private browsing)
      }
    }
  }, [currentYear]);

  const handleVersionChange = (year: string) => {
    router.push(`/${year}`);
  };

  return (
    <Select value={currentYear} onValueChange={handleVersionChange}>
      <SelectTrigger
        className="h-8 w-auto gap-1.5 border-border/60 bg-transparent px-2.5 text-xs font-medium focus:ring-1"
        aria-label={t("label")}
      >
        <SelectValue placeholder={t("placeholder")} />
      </SelectTrigger>
      <SelectContent>
        {VERSION_YEARS.map((year) => (
          <SelectItem key={year} value={year} className="h-9">
            <span className="inline-flex items-center gap-2">
              <CoatOfArms year={Number(year)} size={18} className="shrink-0" />
              <span className="whitespace-nowrap">{t(`constitution${year}`)}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
