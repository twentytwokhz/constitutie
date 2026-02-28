"use client";

/**
 * Deterministic particle positions — seeded at build time for SSR consistency.
 * Each particle has position (%), size, opacity, and animation delay.
 */
const PARTICLES = [
  { x: 12, y: 18, size: 3, opacity: 0.15, delay: 0 },
  { x: 78, y: 25, size: 2, opacity: 0.12, delay: 2 },
  { x: 35, y: 72, size: 2.5, opacity: 0.1, delay: 4 },
  { x: 88, y: 60, size: 2, opacity: 0.14, delay: 1 },
  { x: 55, y: 85, size: 3, opacity: 0.08, delay: 3 },
  { x: 22, y: 45, size: 2, opacity: 0.1, delay: 5 },
  { x: 65, y: 15, size: 2.5, opacity: 0.12, delay: 2.5 },
  { x: 42, y: 38, size: 2, opacity: 0.09, delay: 1.5 },
];

/**
 * GridBackground — Romanian folk motif geometric pattern background.
 *
 * Replaces the plain grid with SVG patterns inspired by traditional Romanian
 * "ie" (folk blouse) embroidery motifs: rhombus/diamond shapes, chevron/zigzag
 * patterns, and cross-stitch style geometry.
 *
 * Retains floating particles and radial glow from the original component.
 * All effects use CSS-only animations with GPU compositing.
 * Respects prefers-reduced-motion.
 *
 * The patterns use indigo primary with stone neutrals from the app's palette.
 * Light mode: subtle light strokes on white/stone background.
 * Dark mode: faint strokes on dark background.
 */
export function GridBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Romanian folk motif SVG patterns */}
      <svg
        className="absolute inset-0 h-full w-full animate-grid-fade"
        role="img"
        aria-label="Romanian folk motif background pattern"
      >
        <defs>
          {/*
           * Pattern 1: Diamond/Rhombus chain — the central motif of Romanian ie embroidery.
           * A repeating diamond grid with small accent crosses at intersections.
           */}
          <pattern
            id="folk-diamond"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Main diamond shape */}
            <path
              d="M30 5 L55 30 L30 55 L5 30 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              className="text-primary/[0.10] dark:text-primary/[0.14]"
            />
            {/* Inner concentric diamond */}
            <path
              d="M30 15 L45 30 L30 45 L15 30 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.4"
              className="text-primary/[0.07] dark:text-primary/[0.10]"
            />
            {/* Cross-stitch accent at center */}
            <path
              d="M28 30 L32 30 M30 28 L30 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              className="text-primary/[0.12] dark:text-primary/[0.16]"
            />
            {/* Small crosses at diamond corners */}
            <path
              d="M29 5 L31 5 M30 4 L30 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/[0.08] dark:text-primary/[0.12]"
            />
            <path
              d="M29 55 L31 55 M30 54 L30 56"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/[0.08] dark:text-primary/[0.12]"
            />
          </pattern>

          {/*
           * Pattern 2: Chevron/zigzag border — traditional band motif from ie sleeves.
           * Alternating chevron rows creating a woven-fabric appearance.
           */}
          <pattern
            id="folk-chevron"
            x="0"
            y="0"
            width="40"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            {/* Zigzag row */}
            <path
              d="M0 15 L10 5 L20 15 L30 5 L40 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/[0.06] dark:text-primary/[0.09]"
            />
            {/* Parallel shifted zigzag for depth */}
            <path
              d="M0 18 L10 8 L20 18 L30 8 L40 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-primary/[0.04] dark:text-primary/[0.06]"
            />
          </pattern>

          {/*
           * Pattern 3: Cross-stitch dots — small X marks arranged in a grid,
           * evoking the counted cross-stitch technique used on traditional ie.
           */}
          <pattern
            id="folk-crosses"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            {/* Cross-stitch X at grid intersections */}
            <path
              d="M10 10 L14 14 M14 10 L10 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/[0.08] dark:text-primary/[0.12]"
            />
          </pattern>

          {/* Radial gradient mask — fades pattern at edges for soft vignette */}
          <radialGradient id="folk-mask-gradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
          <mask id="folk-pattern-fade">
            <rect width="100%" height="100%" fill="url(#folk-mask-gradient)" />
          </mask>
        </defs>

        {/* Layer 1: Diamond pattern (primary motif) */}
        <rect
          width="100%"
          height="100%"
          fill="url(#folk-diamond)"
          mask="url(#folk-pattern-fade)"
        />

        {/* Layer 2: Chevron pattern (secondary, offset) */}
        <rect
          width="100%"
          height="100%"
          fill="url(#folk-chevron)"
          mask="url(#folk-pattern-fade)"
          style={{ opacity: 0.7 }}
        />

        {/* Layer 3: Cross-stitch dots (texture fill) */}
        <rect
          width="100%"
          height="100%"
          fill="url(#folk-crosses)"
          mask="url(#folk-pattern-fade)"
          style={{ opacity: 0.5 }}
        />
      </svg>

      {/* Floating particles — subtle, CSS-animated dots */}
      {PARTICLES.map((p) => (
        <div
          key={`p-${p.x}-${p.y}`}
          className="absolute animate-particle rounded-full bg-primary"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Radial glow behind hero content */}
      <div className="absolute top-1/3 left-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-3xl dark:bg-primary/[0.12]" />
    </div>
  );
}
