"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Extra delay in ms before the animation starts */
  delay?: number;
  /** IntersectionObserver threshold (0-1). Default: 0.15 */
  threshold?: number;
}

/**
 * Scroll-triggered reveal wrapper.
 *
 * Uses IntersectionObserver to detect when the element enters the viewport,
 * then applies a blur-fade-in animation. Once revealed, it stays visible
 * (no re-hiding on scroll up) for a smooth one-way experience.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if user prefers reduced motion — skip animation entirely
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // One-way: stay visible once revealed
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={cn(isVisible ? "scroll-reveal-visible" : "scroll-reveal-hidden", className)}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
