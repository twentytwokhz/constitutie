"use client";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { VersionSelector } from "@/components/layout/version-selector";
import { CoatOfArms, TricolorStripe } from "@/components/national-symbols";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Menu, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

/**
 * Global Header
 *
 * Persistent header with:
 * - Logo "Constituția României"
 * - Navigation links
 * - Search trigger (Ctrl+K / Cmd+K)
 * - Dark/light mode toggle
 * - Mobile hamburger menu
 */
export function Header() {
  const pathname = usePathname();
  const t = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/2003" as const, label: t("nav.explore") },
    { href: "/compare" as const, label: t("nav.compare") },
    { href: "/graph" as const, label: t("nav.graph") },
    { href: "/statistics" as const, label: t("nav.statistics") },
  ];

  // Close mobile menu on route change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally react to pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  /** Check if a nav link should be highlighted as active */
  const isActive = (href: string) => {
    if (href === "/2003") {
      // Match any /[year] route (e.g., /1952, /1986, /1991, /2003) and sub-paths
      return /^\/\d{4}(\/|$)/.test(pathname);
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur shadow-sm supports-[backdrop-filter]:bg-background/60">
      {/* Tricolor band — sticks with header, subtle national accent */}
      <TricolorStripe height="3px" />
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <CoatOfArms year={2003} size={22} className="shrink-0" />
          <span>
            {t("common.appName").replace(t("common.appNameHighlight"), "")}{" "}
            <span className="text-primary">{t("common.appNameHighlight")}</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive(link.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: Version Selector + Search + Theme Toggle + Mobile Menu */}
        <div className="flex items-center gap-1">
          {/* Version Selector */}
          <div className="hidden sm:block">
            <VersionSelector />
          </div>

          {/* Search trigger - dispatches custom event to open CommandPalette */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("common.searchShortcut")}
            title={t("common.searchShortcut")}
            className="text-muted-foreground"
            onClick={() => document.dispatchEvent(new CustomEvent("open-command-palette"))}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t("common.closeMenu") : t("common.openMenu")}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay: click outside to close */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Close menu"
            className="fixed inset-0 top-[67px] z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMobileMenuOpen(false);
            }}
          />
          <nav className="relative z-50 md:hidden border-t border-border/40 bg-background pb-4 animate-slide-down">
            <div className="container mx-auto px-4 pt-2 flex flex-col gap-1">
              {/* Mobile version selector */}
              <div className="px-3 py-2 sm:hidden">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  {t("common.version")}
                </p>
                <VersionSelector />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2.5 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive(link.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
