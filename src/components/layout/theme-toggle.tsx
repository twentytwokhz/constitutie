"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Theme Toggle Button
 *
 * Switches between dark and light modes with animated sun/moon icons.
 * Uses next-themes which handles:
 * - localStorage persistence
 * - System preference detection (prefers-color-scheme)
 * - Class-based theme switching for Tailwind
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch - only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with same dimensions to prevent layout shift
    return (
      <Button variant="ghost" size="icon" aria-label="Schimbă tema" disabled>
        <span className="h-5 w-5" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activează modul luminos" : "Activează modul întunecat"}
      title={isDark ? "Mod luminos" : "Mod întunecat"}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Schimbă tema</span>
    </Button>
  );
}
