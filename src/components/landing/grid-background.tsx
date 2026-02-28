"use client";

/**
 * Deterministic particle positions — seeded at build time for SSR consistency.
 * Each particle has position (%), size, opacity, and animation delay.
 */
const PARTICLES = [
  { x: 12, y: 18, size: 3.5, opacity: 0.25, delay: 0 },
  { x: 78, y: 25, size: 3, opacity: 0.2, delay: 2 },
  { x: 35, y: 72, size: 3, opacity: 0.18, delay: 4 },
  { x: 88, y: 60, size: 2.5, opacity: 0.22, delay: 1 },
  { x: 55, y: 85, size: 3.5, opacity: 0.16, delay: 3 },
  { x: 22, y: 45, size: 3, opacity: 0.2, delay: 5 },
  { x: 65, y: 15, size: 3, opacity: 0.22, delay: 2.5 },
  { x: 42, y: 38, size: 2.5, opacity: 0.18, delay: 1.5 },
  { x: 8, y: 65, size: 2.5, opacity: 0.15, delay: 3.5 },
  { x: 92, y: 35, size: 3, opacity: 0.2, delay: 4.5 },
];

/**
 * GridBackground — Romanian folk motif geometric pattern background for the hero section.
 *
 * INTENTIONALLY uses DIFFERENT motifs from FolkDivider to create visual variety:
 * - GridBackground: rosette wheels, Tree of Life motif, meander/key patterns
 * - FolkDivider: diamond chains, chevron lines, cross-stitch dots
 *
 * This distinction ensures the hero background feels unique and complementary
 * rather than repetitive when combined with the folk divider bands.
 *
 * Pattern visibility is boosted significantly in dark mode for strong contrast
 * against stone-950 backgrounds.
 *
 * All effects use CSS-only animations with GPU compositing.
 * Respects prefers-reduced-motion.
 */
export function GridBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Romanian folk motif SVG patterns — distinct from FolkDivider patterns */}
      <svg
        className="absolute inset-0 h-full w-full animate-grid-fade"
        role="img"
        aria-label="Romanian folk motif background pattern"
      >
        <defs>
          {/*
           * Pattern 1: Rosette / Solar wheel — a circular folk motif common in
           * Romanian wood carving and painted eggs (ouă încondeiate).
           * Differs from FolkDivider's diamond chains.
           */}
          <pattern
            id="folk-rosette"
            x="0"
            y="0"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            {/* Outer circle */}
            <circle
              cx="32"
              cy="32"
              r="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.9"
              className="text-primary/[0.28] dark:text-primary/[0.45]"
            />
            {/* Inner circle */}
            <circle
              cx="32"
              cy="32"
              r="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              className="text-primary/[0.22] dark:text-primary/[0.38]"
            />
            {/* Radial spokes (6-pointed star within circle) */}
            <path
              d="M32 10 L32 54 M14 21 L50 43 M14 43 L50 21"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              className="text-primary/[0.18] dark:text-primary/[0.32]"
            />
            {/* Center dot */}
            <circle
              cx="32"
              cy="32"
              r="2.5"
              className="fill-primary/[0.30] dark:fill-primary/[0.48]"
            />
          </pattern>

          {/*
           * Pattern 2: Tree of Life / Pomul Vieții — a vertical branching motif
           * fundamental to Romanian folk embroidery. Distinct from FolkDivider's
           * horizontal chevron bands.
           */}
          <pattern id="folk-tree" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            {/* Central trunk */}
            <line
              x1="24"
              y1="6"
              x2="24"
              y2="42"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-primary/[0.22] dark:text-primary/[0.38]"
            />
            {/* Upper branches (V shapes) */}
            <path
              d="M24 14 L16 22 M24 14 L32 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              className="text-primary/[0.20] dark:text-primary/[0.35]"
            />
            {/* Lower branches */}
            <path
              d="M24 26 L14 34 M24 26 L34 34"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              className="text-primary/[0.20] dark:text-primary/[0.35]"
            />
            {/* Root base */}
            <path
              d="M20 42 L24 42 L28 42"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.9"
              className="text-primary/[0.24] dark:text-primary/[0.40]"
            />
            {/* Leaf dots at branch tips */}
            <circle
              cx="16"
              cy="22"
              r="1.5"
              className="fill-primary/[0.18] dark:fill-primary/[0.32]"
            />
            <circle
              cx="32"
              cy="22"
              r="1.5"
              className="fill-primary/[0.18] dark:fill-primary/[0.32]"
            />
            <circle
              cx="14"
              cy="34"
              r="1.5"
              className="fill-primary/[0.16] dark:fill-primary/[0.28]"
            />
            <circle
              cx="34"
              cy="34"
              r="1.5"
              className="fill-primary/[0.16] dark:fill-primary/[0.28]"
            />
          </pattern>

          {/*
           * Pattern 3: Meander / Greek key — found in Romanian folk pottery and
           * carpet weaving. A continuous angular spiral distinct from cross-stitch dots.
           */}
          <pattern
            id="folk-meander"
            x="0"
            y="0"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            {/* Angular spiral motif */}
            <path
              d="M4 16 L4 4 L20 4 L20 12 L12 12 L12 20 L28 20 L28 28 L4 28 L4 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              className="text-primary/[0.20] dark:text-primary/[0.35]"
            />
          </pattern>

          {/* Radial gradient mask — fades pattern at edges for soft vignette */}
          <radialGradient id="folk-mask-gradient" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="white" />
            <stop offset="70%" stopColor="#999" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
          <mask id="folk-pattern-fade">
            <rect width="100%" height="100%" fill="url(#folk-mask-gradient)" />
          </mask>
        </defs>

        {/* Layer 1: Rosette pattern (primary motif — distinct circular shapes) */}
        <rect width="100%" height="100%" fill="url(#folk-rosette)" mask="url(#folk-pattern-fade)" />

        {/* Layer 2: Tree of Life pattern (secondary, offset) */}
        <rect
          width="100%"
          height="100%"
          fill="url(#folk-tree)"
          mask="url(#folk-pattern-fade)"
          style={{ opacity: 0.8 }}
        />

        {/* Layer 3: Meander key pattern (texture fill) */}
        <rect
          width="100%"
          height="100%"
          fill="url(#folk-meander)"
          mask="url(#folk-pattern-fade)"
          style={{ opacity: 0.65 }}
        />
      </svg>

      {/* Floating particles — CSS-animated indigo dots */}
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
      <div className="absolute top-1/3 left-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.10] blur-3xl dark:bg-primary/[0.18]" />
    </div>
  );
}
