"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * AnimatedText — MagicUI-style text animation component.
 *
 * Renders each word with a staggered fade-up + blur reveal animation.
 * Uses CSS animations with inline delay for smooth, jank-free rendering.
 * Respects prefers-reduced-motion (instantly shows text without animation).
 */
export function AnimatedText({
  text,
  className = "",
  highlightWords = [],
  highlightClass = "text-primary",
  staggerMs = 80,
}: {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightClass?: string;
  staggerMs?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure CSS animation triggers after hydration
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const wordEntries = useMemo(
    () =>
      text.split(" ").map((word, idx) => ({
        word,
        key: `${text.slice(0, text.indexOf(word))}-${word}`,
        idx,
      })),
    [text],
  );

  return (
    <span className={className}>
      {wordEntries.map(({ word, key, idx }) => {
        const isHighlighted = highlightWords.includes(word);
        return (
          <span
            key={key}
            className={`inline-block ${isHighlighted ? highlightClass : ""} ${
              mounted ? "animate-word-reveal" : "opacity-0"
            }`}
            style={{
              animationDelay: mounted ? `${idx * staggerMs}ms` : undefined,
              animationFillMode: "forwards",
            }}
          >
            {word}
            {idx < wordEntries.length - 1 ? "\u00A0" : ""}
          </span>
        );
      })}
    </span>
  );
}
