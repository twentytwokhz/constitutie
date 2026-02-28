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
 * GridBackground — Romanian cross-stitch embroidery pattern background for the hero section.
 *
 * Inspired by traditional Romanian "cusături" (cross-stitch embroidery) featuring:
 * - 8-pointed star motifs (steaua/floarea) — the signature Romanian folk pattern
 * - Diamond lattice borders connecting the star motifs
 * - Small cross accents filling negative space
 * - All shapes built on a pixel grid for authentic cross-stitch appearance
 *
 * The patterns use stepped/staircase edges (rect-based) rather than smooth curves
 * to faithfully represent the cross-stitch grid structure of Romanian embroidery.
 *
 * INTENTIONALLY uses DIFFERENT motifs from FolkDivider to create visual variety:
 * - GridBackground: 8-pointed stars, diamond lattice, small crosses (area fill)
 * - FolkDivider: band patterns with repeating border motifs (horizontal dividers)
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
      {/* Romanian cross-stitch embroidery SVG patterns */}
      <svg
        className="absolute inset-0 h-full w-full animate-grid-fade"
        role="img"
        aria-label="Romanian cross-stitch embroidery background pattern"
      >
        <defs>
          {/*
           * Pattern 1: 8-pointed star (steaua) — the signature Romanian embroidery motif.
           * Built from stepped rectangles on a grid to achieve authentic cross-stitch look.
           * The star is formed by a central diamond with 4 diagonal arms.
           */}
          <pattern id="folk-star" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* === 8-POINTED STAR MOTIF (centered at 40,40) === */}

            {/* Central diamond — 4 rects forming a small diamond core */}
            <rect
              x="38"
              y="34"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.32] dark:text-primary/[0.50]"
            />
            <rect
              x="34"
              y="38"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.32] dark:text-primary/[0.50]"
            />
            <rect
              x="42"
              y="38"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.32] dark:text-primary/[0.50]"
            />
            <rect
              x="38"
              y="42"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.32] dark:text-primary/[0.50]"
            />
            {/* Center fill */}
            <rect
              x="38"
              y="38"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.38] dark:text-primary/[0.55]"
            />

            {/* Diagonal arm — top-left (staircase pattern) */}
            <rect
              x="34"
              y="30"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.26] dark:text-primary/[0.42]"
            />
            <rect
              x="30"
              y="26"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.22] dark:text-primary/[0.38]"
            />
            <rect
              x="26"
              y="22"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.18] dark:text-primary/[0.32]"
            />

            {/* Diagonal arm — top-right */}
            <rect
              x="42"
              y="30"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.26] dark:text-primary/[0.42]"
            />
            <rect
              x="46"
              y="26"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.22] dark:text-primary/[0.38]"
            />
            <rect
              x="50"
              y="22"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.18] dark:text-primary/[0.32]"
            />

            {/* Diagonal arm — bottom-left */}
            <rect
              x="34"
              y="46"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.26] dark:text-primary/[0.42]"
            />
            <rect
              x="30"
              y="50"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.22] dark:text-primary/[0.38]"
            />
            <rect
              x="26"
              y="54"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.18] dark:text-primary/[0.32]"
            />

            {/* Diagonal arm — bottom-right */}
            <rect
              x="42"
              y="46"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.26] dark:text-primary/[0.42]"
            />
            <rect
              x="46"
              y="50"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.22] dark:text-primary/[0.38]"
            />
            <rect
              x="50"
              y="54"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.18] dark:text-primary/[0.32]"
            />

            {/* Cardinal arms — top */}
            <rect
              x="38"
              y="26"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.26] dark:text-primary/[0.42]"
            />
            <rect
              x="38"
              y="20"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.20] dark:text-primary/[0.35]"
            />

            {/* Cardinal arms — bottom */}
            <rect
              x="38"
              y="50"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.26] dark:text-primary/[0.42]"
            />
            <rect
              x="38"
              y="56"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.20] dark:text-primary/[0.35]"
            />

            {/* Cardinal arms — left */}
            <rect
              x="26"
              y="38"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.26] dark:text-primary/[0.42]"
            />
            <rect
              x="20"
              y="38"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.20] dark:text-primary/[0.35]"
            />

            {/* Cardinal arms — right */}
            <rect
              x="50"
              y="38"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.26] dark:text-primary/[0.42]"
            />
            <rect
              x="56"
              y="38"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.20] dark:text-primary/[0.35]"
            />

            {/* Extra arm tips — gives 8-pointed fullness */}
            <rect
              x="30"
              y="30"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.20] dark:text-primary/[0.35]"
            />
            <rect
              x="46"
              y="30"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.20] dark:text-primary/[0.35]"
            />
            <rect
              x="30"
              y="46"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.20] dark:text-primary/[0.35]"
            />
            <rect
              x="46"
              y="46"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.20] dark:text-primary/[0.35]"
            />

            {/* Corner accent crosses — small crosses at pattern tile corners
                (visible where 4 tiles meet, creating the lattice effect) */}
            <rect
              x="2"
              y="0"
              width="2"
              height="2"
              fill="currentColor"
              className="text-primary/[0.12] dark:text-primary/[0.22]"
            />
            <rect
              x="0"
              y="2"
              width="2"
              height="2"
              fill="currentColor"
              className="text-primary/[0.12] dark:text-primary/[0.22]"
            />
            <rect
              x="4"
              y="2"
              width="2"
              height="2"
              fill="currentColor"
              className="text-primary/[0.12] dark:text-primary/[0.22]"
            />
            <rect
              x="2"
              y="4"
              width="2"
              height="2"
              fill="currentColor"
              className="text-primary/[0.12] dark:text-primary/[0.22]"
            />
          </pattern>

          {/*
           * Pattern 2: Diamond lattice with inner cross — traditional Romanian
           * "romb" (rhombus) pattern used as filler between larger star motifs.
           * Smaller tile size creates a denser, more intricate texture.
           */}
          <pattern
            id="folk-diamond-lattice"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            {/* Diamond outline — stepped edges */}
            <rect
              x="18"
              y="4"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.18] dark:text-primary/[0.30]"
            />
            <rect
              x="14"
              y="8"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.16] dark:text-primary/[0.28]"
            />
            <rect
              x="22"
              y="8"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.16] dark:text-primary/[0.28]"
            />
            <rect
              x="10"
              y="12"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.14] dark:text-primary/[0.25]"
            />
            <rect
              x="26"
              y="12"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.14] dark:text-primary/[0.25]"
            />
            <rect
              x="6"
              y="16"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.12] dark:text-primary/[0.22]"
            />
            <rect
              x="30"
              y="16"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.12] dark:text-primary/[0.22]"
            />
            {/* Diamond bottom half (mirror) */}
            <rect
              x="10"
              y="24"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.14] dark:text-primary/[0.25]"
            />
            <rect
              x="26"
              y="24"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.14] dark:text-primary/[0.25]"
            />
            <rect
              x="14"
              y="28"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.16] dark:text-primary/[0.28]"
            />
            <rect
              x="22"
              y="28"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.16] dark:text-primary/[0.28]"
            />
            <rect
              x="18"
              y="32"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.18] dark:text-primary/[0.30]"
            />
            {/* Inner cross at diamond center */}
            <rect
              x="18"
              y="16"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.22] dark:text-primary/[0.38]"
            />
            <rect
              x="14"
              y="20"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.16] dark:text-primary/[0.28]"
            />
            <rect
              x="22"
              y="20"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.16] dark:text-primary/[0.28]"
            />
            <rect
              x="18"
              y="20"
              width="4"
              height="4"
              fill="currentColor"
              className="text-primary/[0.24] dark:text-primary/[0.40]"
            />
          </pattern>

          {/*
           * Pattern 3: Small repeating crosses — traditional "cruciulițe" filler
           * motif found throughout Romanian embroidery. Creates fine texture between
           * the larger star and diamond patterns.
           */}
          <pattern
            id="folk-crosses"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            {/* Small + cross */}
            <rect
              x="8"
              y="6"
              width="4"
              height="2"
              fill="currentColor"
              className="text-primary/[0.14] dark:text-primary/[0.26]"
            />
            <rect
              x="8"
              y="12"
              width="4"
              height="2"
              fill="currentColor"
              className="text-primary/[0.14] dark:text-primary/[0.26]"
            />
            <rect
              x="6"
              y="8"
              width="2"
              height="4"
              fill="currentColor"
              className="text-primary/[0.14] dark:text-primary/[0.26]"
            />
            <rect
              x="12"
              y="8"
              width="2"
              height="4"
              fill="currentColor"
              className="text-primary/[0.14] dark:text-primary/[0.26]"
            />
            {/* Center dot */}
            <rect
              x="9"
              y="9"
              width="2"
              height="2"
              fill="currentColor"
              className="text-primary/[0.18] dark:text-primary/[0.32]"
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

        {/* Layer 1: 8-pointed star pattern (primary motif — hero centerpiece) */}
        <rect width="100%" height="100%" fill="url(#folk-star)" mask="url(#folk-pattern-fade)" />

        {/* Layer 2: Diamond lattice (secondary, offset for depth) */}
        <rect
          width="100%"
          height="100%"
          fill="url(#folk-diamond-lattice)"
          mask="url(#folk-pattern-fade)"
          style={{ opacity: 0.7 }}
        />

        {/* Layer 3: Small crosses (fine texture fill) */}
        <rect
          width="100%"
          height="100%"
          fill="url(#folk-crosses)"
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
