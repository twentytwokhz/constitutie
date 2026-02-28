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
 * All patterns are rotated 45° (diamond orientation) to avoid rigid square-grid
 * appearance and create a softer, more intricate textile-like visual.
 *
 * INTENTIONALLY uses DIFFERENT motifs from FolkDivider to create visual variety:
 * - GridBackground: interlocking diamond lattice, rosette stars, fine cross-hatch
 * - FolkDivider: diamond chains, chevron lines, cross-stitch dots
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
      {/* Romanian folk motif SVG patterns — all rotated 45° for diamond orientation */}
      <svg
        className="absolute inset-0 h-full w-full animate-grid-fade"
        role="img"
        aria-label="Romanian folk motif background pattern"
      >
        <defs>
          {/*
           * Pattern 1: Diamond lattice with inner cross — classic Romanian embroidery motif.
           * Rotated 45° so diamonds appear as upright rhombi, not squares.
           * Smaller tile size (40px) for denser, more intricate texture.
           */}
          <pattern
            id="folk-diamond-lattice"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            {/* Outer diamond frame */}
            <path
              d="M20 2 L38 20 L20 38 L2 20 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              className="text-primary/[0.22] dark:text-primary/[0.38]"
            />
            {/* Inner diamond */}
            <path
              d="M20 10 L30 20 L20 30 L10 20 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/[0.16] dark:text-primary/[0.28]"
            />
            {/* Central cross */}
            <line
              x1="20"
              y1="13"
              x2="20"
              y2="27"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/[0.14] dark:text-primary/[0.24]"
            />
            <line
              x1="13"
              y1="20"
              x2="27"
              y2="20"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/[0.14] dark:text-primary/[0.24]"
            />
            {/* Corner dots (connecting points between tiles) */}
            <circle
              cx="20"
              cy="2"
              r="1.2"
              className="fill-primary/[0.18] dark:fill-primary/[0.30]"
            />
            <circle
              cx="20"
              cy="38"
              r="1.2"
              className="fill-primary/[0.18] dark:fill-primary/[0.30]"
            />
            <circle
              cx="2"
              cy="20"
              r="1.2"
              className="fill-primary/[0.18] dark:fill-primary/[0.30]"
            />
            <circle
              cx="38"
              cy="20"
              r="1.2"
              className="fill-primary/[0.18] dark:fill-primary/[0.30]"
            />
            {/* Center dot */}
            <circle
              cx="20"
              cy="20"
              r="1.8"
              className="fill-primary/[0.24] dark:fill-primary/[0.40]"
            />
          </pattern>

          {/*
           * Pattern 2: 8-pointed star rosette — signature Romanian folk motif (steaua).
           * Rotated 45° for diagonal alignment. Larger tile (56px) for visual hierarchy.
           */}
          <pattern
            id="folk-star-rosette"
            x="0"
            y="0"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            {/* 8-pointed star: 4 cardinal + 4 diagonal rays */}
            <path
              d="M28 6 L32 22 L28 18 L24 22 Z"
              fill="currentColor"
              className="text-primary/[0.12] dark:text-primary/[0.22]"
            />
            <path
              d="M28 50 L32 34 L28 38 L24 34 Z"
              fill="currentColor"
              className="text-primary/[0.12] dark:text-primary/[0.22]"
            />
            <path
              d="M6 28 L22 24 L18 28 L22 32 Z"
              fill="currentColor"
              className="text-primary/[0.12] dark:text-primary/[0.22]"
            />
            <path
              d="M50 28 L34 32 L38 28 L34 24 Z"
              fill="currentColor"
              className="text-primary/[0.12] dark:text-primary/[0.22]"
            />
            {/* Diagonal rays */}
            <path
              d="M12 12 L24 22 L20 20 L22 24 Z"
              fill="currentColor"
              className="text-primary/[0.10] dark:text-primary/[0.18]"
            />
            <path
              d="M44 12 L34 22 L36 20 L32 24 Z"
              fill="currentColor"
              className="text-primary/[0.10] dark:text-primary/[0.18]"
            />
            <path
              d="M12 44 L22 34 L20 36 L24 32 Z"
              fill="currentColor"
              className="text-primary/[0.10] dark:text-primary/[0.18]"
            />
            <path
              d="M44 44 L34 34 L36 36 L32 32 Z"
              fill="currentColor"
              className="text-primary/[0.10] dark:text-primary/[0.18]"
            />
            {/* Center ring */}
            <circle
              cx="28"
              cy="28"
              r="5"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              className="text-primary/[0.18] dark:text-primary/[0.32]"
            />
            {/* Center dot */}
            <circle
              cx="28"
              cy="28"
              r="2"
              className="fill-primary/[0.22] dark:fill-primary/[0.38]"
            />
          </pattern>

          {/*
           * Pattern 3: Fine diagonal cross-hatch — delicate filler texture inspired
           * by Romanian woven textile backgrounds. Tiny tile (20px) for very fine grain.
           * Rotated additional 45° (total 90° from original = back to 0°, but because
           * the other patterns are at 45° this creates visual contrast).
           */}
          <pattern
            id="folk-crosshatch"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            {/* Fine diagonal lines */}
            <line
              x1="0"
              y1="10"
              x2="20"
              y2="10"
              stroke="currentColor"
              strokeWidth="0.35"
              className="text-primary/[0.10] dark:text-primary/[0.18]"
            />
            <line
              x1="10"
              y1="0"
              x2="10"
              y2="20"
              stroke="currentColor"
              strokeWidth="0.35"
              className="text-primary/[0.10] dark:text-primary/[0.18]"
            />
            {/* Small accent dots at intersections */}
            <circle
              cx="10"
              cy="10"
              r="0.8"
              className="fill-primary/[0.12] dark:fill-primary/[0.20]"
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

        {/* Layer 1: Diamond lattice (primary structural pattern) */}
        <rect
          width="100%"
          height="100%"
          fill="url(#folk-diamond-lattice)"
          mask="url(#folk-pattern-fade)"
        />

        {/* Layer 2: 8-pointed star rosette (secondary decorative motif) */}
        <rect
          width="100%"
          height="100%"
          fill="url(#folk-star-rosette)"
          mask="url(#folk-pattern-fade)"
          style={{ opacity: 0.75 }}
        />

        {/* Layer 3: Fine cross-hatch texture (background fill for depth) */}
        <rect
          width="100%"
          height="100%"
          fill="url(#folk-crosshatch)"
          mask="url(#folk-pattern-fade)"
          style={{ opacity: 0.5 }}
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
