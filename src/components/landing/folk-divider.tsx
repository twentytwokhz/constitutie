/**
 * FolkDivider — Romanian cross-stitch embroidery band divider between landing sections.
 *
 * Inspired by traditional Romanian "cusături" (cross-stitch embroidery) bands,
 * featuring repeating 8-pointed star motifs connected by diagonal lattice grids,
 * with small cross accents filling negative space — all built on a pixel grid
 * for authentic cross-stitch stepped-edge appearance.
 *
 * Supports three intensity levels:
 * - "strong": full opacity, prominent band near hero (tallest)
 * - "medium": reduced opacity, mid-page section transitions
 * - "subtle": lightest, near footer
 *
 * Adapts to dark/light mode via CSS currentColor and Tailwind dark: variants.
 * Respects prefers-reduced-motion (static rendering, no animation).
 */

type FolkDividerIntensity = "strong" | "medium" | "subtle";

interface FolkDividerProps {
  /** Visual intensity of the pattern — strongest near hero, subtle near footer */
  intensity?: FolkDividerIntensity;
  /** Additional CSS classes for the wrapper */
  className?: string;
  /** Whether to flip the pattern vertically for variety */
  flip?: boolean;
}

const intensityMap: Record<
  FolkDividerIntensity,
  {
    /** Base opacity multiplier for primary pattern elements (0-1 range) */
    opacityBase: number;
    /** Opacity multiplier for dark mode (added on top of base) */
    opacityDarkBoost: number;
    /** Band height in px */
    height: number;
    /** Cell size for the cross-stitch grid */
    cellSize: number;
    /** Background tint opacity class */
    bgOpacity: string;
    darkBgOpacity: string;
  }
> = {
  strong: {
    opacityBase: 0.4,
    opacityDarkBoost: 0.2,
    height: 64,
    cellSize: 4,
    bgOpacity: "bg-primary/[0.06]",
    darkBgOpacity: "dark:bg-primary/[0.12]",
  },
  medium: {
    opacityBase: 0.28,
    opacityDarkBoost: 0.16,
    height: 52,
    cellSize: 3,
    bgOpacity: "bg-primary/[0.04]",
    darkBgOpacity: "dark:bg-primary/[0.09]",
  },
  subtle: {
    opacityBase: 0.18,
    opacityDarkBoost: 0.12,
    height: 40,
    cellSize: 3,
    bgOpacity: "bg-primary/[0.03]",
    darkBgOpacity: "dark:bg-primary/[0.07]",
  },
};

/**
 * Generate opacity class string for light and dark mode.
 * Uses Tailwind arbitrary values for precise control.
 */
function opClasses(base: number, darkBoost: number, factor: number): string {
  const light = Math.round(base * factor * 100) / 100;
  const dark = Math.round((base + darkBoost) * factor * 100) / 100;
  return `text-primary/[${light.toFixed(2)}] dark:text-primary/[${dark.toFixed(2)}]`;
}

export function FolkDivider({
  intensity = "medium",
  className = "",
  flip = false,
}: FolkDividerProps) {
  const config = intensityMap[intensity];
  const { opacityBase: ob, opacityDarkBoost: db, height, cellSize: c } = config;

  // Pattern tile dimensions — the star motif repeats every tileW pixels
  const tileW = c * 16; // 16 cells wide
  const tileH = height;
  const mid = tileW / 2; // center x of tile
  const midY = tileH / 2; // center y of tile

  return (
    <div
      className={`pointer-events-none w-full overflow-hidden ${config.bgOpacity} ${config.darkBgOpacity} ${className}`}
      aria-hidden="true"
      style={{ transform: flip ? "scaleY(-1)" : undefined }}
    >
      <svg
        className="w-full"
        style={{ height }}
        viewBox={`0 0 1200 ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Decorative Romanian cross-stitch band pattern"
      >
        <defs>
          {/*
           * Cross-stitch star band pattern — a horizontally-repeating 8-pointed
           * star motif with connecting lattice, built entirely from small rects
           * on a grid to achieve authentic embroidery appearance.
           */}
          <pattern
            id={`band-star-${intensity}`}
            x="0"
            y="0"
            width={tileW}
            height={tileH}
            patternUnits="userSpaceOnUse"
          >
            {/* === CENTRAL 8-POINTED STAR === */}

            {/* Center core */}
            <rect
              x={mid - c}
              y={midY - c}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 1.0)}
            />

            {/* Inner ring — 4 cardinal rects */}
            <rect
              x={mid - c}
              y={midY - c * 3}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.85)}
            />
            <rect
              x={mid - c}
              y={midY + c}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.85)}
            />
            <rect
              x={mid - c * 3}
              y={midY - c}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.85)}
            />
            <rect
              x={mid + c}
              y={midY - c}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.85)}
            />

            {/* Inner ring — 4 diagonal rects */}
            <rect
              x={mid - c * 3}
              y={midY - c * 3}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.75)}
            />
            <rect
              x={mid + c}
              y={midY - c * 3}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.75)}
            />
            <rect
              x={mid - c * 3}
              y={midY + c}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.75)}
            />
            <rect
              x={mid + c}
              y={midY + c}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.75)}
            />

            {/* Outer arms — cardinal extensions (staircase) */}
            <rect
              x={mid - c}
              y={midY - c * 5}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.65)}
            />
            <rect
              x={mid - c}
              y={midY + c * 3}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.65)}
            />
            <rect
              x={mid - c * 5}
              y={midY - c}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.65)}
            />
            <rect
              x={mid + c * 3}
              y={midY - c}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.65)}
            />

            {/* Outer arms — diagonal extensions */}
            <rect
              x={mid - c * 5}
              y={midY - c * 5}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.5)}
            />
            <rect
              x={mid + c * 3}
              y={midY - c * 5}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.5)}
            />
            <rect
              x={mid - c * 5}
              y={midY + c * 3}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.5)}
            />
            <rect
              x={mid + c * 3}
              y={midY + c * 3}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.5)}
            />

            {/* Star tip points — furthest reach */}
            <rect
              x={mid - c * 5}
              y={midY - c * 3}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.55)}
            />
            <rect
              x={mid + c * 3}
              y={midY - c * 3}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.55)}
            />
            <rect
              x={mid - c * 5}
              y={midY + c}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.55)}
            />
            <rect
              x={mid + c * 3}
              y={midY + c}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.55)}
            />
            <rect
              x={mid - c * 3}
              y={midY - c * 5}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.55)}
            />
            <rect
              x={mid + c}
              y={midY - c * 5}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.55)}
            />
            <rect
              x={mid - c * 3}
              y={midY + c * 3}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.55)}
            />
            <rect
              x={mid + c}
              y={midY + c * 3}
              width={c * 2}
              height={c * 2}
              fill="currentColor"
              className={opClasses(ob, db, 0.55)}
            />

            {/* === CONNECTING LATTICE DOTS at tile corners === */}
            {/* These are visible where 4 tiles meet, creating the lattice grid */}
            <rect
              x={0}
              y={0}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.4)}
            />
            <rect
              x={c}
              y={c}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.3)}
            />
            <rect
              x={tileW - c}
              y={0}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.4)}
            />
            <rect
              x={tileW - c * 2}
              y={c}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.3)}
            />
            <rect
              x={0}
              y={tileH - c}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.4)}
            />
            <rect
              x={c}
              y={tileH - c * 2}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.3)}
            />
            <rect
              x={tileW - c}
              y={tileH - c}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.4)}
            />
            <rect
              x={tileW - c * 2}
              y={tileH - c * 2}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.3)}
            />
          </pattern>

          {/* Top/bottom border pattern — small repeating stepped chevron */}
          <pattern
            id={`band-border-${intensity}`}
            x="0"
            y="0"
            width={c * 8}
            height={c * 3}
            patternUnits="userSpaceOnUse"
          >
            {/* Zigzag staircase — 2-cell steps */}
            <rect
              x={0}
              y={c * 2}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.7)}
            />
            <rect
              x={c}
              y={c}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.7)}
            />
            <rect
              x={c * 2}
              y={0}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.7)}
            />
            <rect
              x={c * 3}
              y={c}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.7)}
            />
            <rect
              x={c * 4}
              y={c * 2}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.7)}
            />
            <rect
              x={c * 5}
              y={c}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.7)}
            />
            <rect
              x={c * 6}
              y={0}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.7)}
            />
            <rect
              x={c * 7}
              y={c}
              width={c}
              height={c}
              fill="currentColor"
              className={opClasses(ob, db, 0.7)}
            />
          </pattern>
        </defs>

        {/* Top border — stepped zigzag line */}
        <rect x="0" y="0" width="1200" height={c * 3} fill={`url(#band-border-${intensity})`} />

        {/* Central star band */}
        <rect
          x="0"
          y={c * 3}
          width="1200"
          height={height - c * 6}
          fill={`url(#band-star-${intensity})`}
        />

        {/* Bottom border — stepped zigzag line (mirrored) */}
        <rect
          x="0"
          y={height - c * 3}
          width="1200"
          height={c * 3}
          fill={`url(#band-border-${intensity})`}
          style={{ transform: "scaleY(-1)", transformOrigin: `0 ${height - c * 1.5}px` }}
        />
      </svg>
    </div>
  );
}
