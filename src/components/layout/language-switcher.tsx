"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";

const localeLabels: Record<string, string> = {
  ro: "RO",
  en: "EN",
};

/**
 * Language Switcher
 *
 * Toggles between Romanian and English.
 * Preserves the current route when switching locale.
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const nextLocale = locale === "ro" ? "en" : "ro";

  const handleSwitch = () => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={`Switch to ${localeLabels[nextLocale]}`}
      title={`Switch to ${localeLabels[nextLocale]}`}
      className="text-muted-foreground relative"
    >
      <Globe className="h-5 w-5" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold leading-none bg-background rounded px-0.5">
        {localeLabels[locale]}
      </span>
    </Button>
  );
}
