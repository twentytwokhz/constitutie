"use client";

/**
 * GridBackground — MagicUI-style animated grid pattern.
 *
 * Renders an SVG grid with a radial gradient mask that fades at edges.
 * Subtle pulse animation creates a "living" background effect.
 * Performance-safe: uses will-change and GPU-composited transforms.
 */
export function GridBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Animated grid pattern */}
      <svg
        className="absolute inset-0 h-full w-full animate-grid-fade"
        role="img"
        aria-label="Grid background pattern"
      >
        <defs>
          <pattern id="hero-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/[0.08] dark:text-primary/[0.12]"
            />
          </pattern>
          <radialGradient id="hero-grid-mask" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
          <mask id="hero-grid-fade">
            <rect width="100%" height="100%" fill="url(#hero-grid-mask)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" mask="url(#hero-grid-fade)" />
      </svg>

      {/* Radial glow behind hero content */}
      <div className="absolute top-1/3 left-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-3xl dark:bg-primary/[0.08]" />
    </div>
  );
}
