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
 * GridBackground — MagicUI-style animated grid pattern with floating particles.
 *
 * Renders an SVG grid with a radial gradient mask that fades at edges,
 * subtle floating particles, and a radial glow. All effects are
 * performance-safe: CSS-only animations using will-change and GPU compositing.
 * Respects prefers-reduced-motion.
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
      <div className="absolute top-1/3 left-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-3xl dark:bg-primary/[0.08]" />
    </div>
  );
}
