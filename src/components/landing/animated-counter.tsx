"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AnimatedCounter — counts from 0 to `value` when the element enters the viewport.
 *
 * Uses requestAnimationFrame + IntersectionObserver for a smooth, performant
 * count-up animation. Inspired by MagicUI NumberTicker component.
 *
 * Easing: easeOutExpo — fast start, decelerating finish — feels satisfying
 * for dashboard-style number reveals.
 *
 * Respects prefers-reduced-motion: skips animation and shows final value immediately.
 */
interface AnimatedCounterProps {
  /** The target number to animate towards */
  value: number;
  /** Pre-formatted final string (e.g. "535" or "1.234") to display after animation */
  formattedValue: string;
  /** Animation duration in ms (default: 1800) */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - 2 ** (-10 * t);
}

export function AnimatedCounter({
  value,
  formattedValue,
  duration = 1800,
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState("0");
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;

    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(formattedValue);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.unobserve(el);

          const startTime = performance.now();

          function animate(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            const current = Math.round(easedProgress * value);

            setDisplayValue(current.toLocaleString("ro-RO"));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // Ensure we show the exact formatted value at the end
              setDisplayValue(formattedValue);
            }
          }

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, formattedValue, duration, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
