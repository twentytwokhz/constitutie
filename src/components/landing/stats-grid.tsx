"use client";

import { BookOpen, GitCompareArrows, Link2, MessageSquare } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "book-open": BookOpen,
  "git-compare-arrows": GitCompareArrows,
  "link-2": Link2,
  "message-square": MessageSquare,
};

interface StatItem {
  iconName: string;
  value: number;
  formattedValue: string;
  label: string;
  description: string;
}

interface StatsGridProps {
  items: StatItem[];
}

/**
 * StatsGrid — Client component that renders stat cards with animated count-up numbers.
 *
 * Each card displays an icon, an animated number counter (counts from 0 to value on scroll),
 * a label, and a description. The counter triggers when the card scrolls into view.
 *
 * Receives pre-fetched data from the server-side StatsSection parent.
 */
export function StatsGrid({ items }: StatsGridProps) {
  return (
    <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = ICON_MAP[item.iconName] ?? BookOpen;
        return (
          <div
            key={item.iconName}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg sm:p-6"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-12 sm:w-12">
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
                  <AnimatedCounter
                    value={item.value}
                    formattedValue={item.formattedValue}
                    duration={1800}
                  />
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        );
      })}
    </div>
  );
}
