/**
 * FolkDivider — Geometric section divider inspired by Romanian ie folk motifs.
 *
 * Renders an SVG band of traditional Romanian embroidery patterns between
 * landing page sections. Supports three intensity levels:
 * - "strong": full opacity, used in hero/features transitions
 * - "medium": reduced opacity, used between mid-page sections
 * - "subtle": barely visible, used near the footer
 *
 * Motifs include diamond chains, chevron lines, and cross-stitch geometry.
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
    stroke: string;
    darkStroke: string;
    height: number;
    strokeWidth: number;
    innerStrokeWidth: number;
    accentStrokeWidth: number;
    bgOpacity: string;
    darkBgOpacity: string;
  }
> = {
  strong: {
    stroke: "text-primary/[0.50]",
    darkStroke: "dark:text-primary/[0.70]",
    height: 56,
    strokeWidth: 1.4,
    innerStrokeWidth: 1.0,
    accentStrokeWidth: 1.1,
    bgOpacity: "bg-primary/[0.07]",
    darkBgOpacity: "dark:bg-primary/[0.14]",
  },
  medium: {
    stroke: "text-primary/[0.38]",
    darkStroke: "dark:text-primary/[0.55]",
    height: 44,
    strokeWidth: 1.2,
    innerStrokeWidth: 0.85,
    accentStrokeWidth: 0.95,
    bgOpacity: "bg-primary/[0.05]",
    darkBgOpacity: "dark:bg-primary/[0.10]",
  },
  subtle: {
    stroke: "text-primary/[0.25]",
    darkStroke: "dark:text-primary/[0.42]",
    height: 32,
    strokeWidth: 1.0,
    innerStrokeWidth: 0.7,
    accentStrokeWidth: 0.8,
    bgOpacity: "bg-primary/[0.03]",
    darkBgOpacity: "dark:bg-primary/[0.08]",
  },
};

export function FolkDivider({
  intensity = "medium",
  className = "",
  flip = false,
}: FolkDividerProps) {
  const config = intensityMap[intensity];

  return (
    <div
      className={`pointer-events-none w-full overflow-hidden ${config.bgOpacity} ${config.darkBgOpacity} ${className}`}
      aria-hidden="true"
      style={{ transform: flip ? "scaleY(-1)" : undefined }}
    >
      <svg
        className="w-full"
        style={{ height: config.height }}
        viewBox={`0 0 1200 ${config.height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Decorative folk pattern divider"
      >
        <defs>
          {/* Diamond chain pattern — repeating horizontal band */}
          <pattern
            id={`divider-diamond-${intensity}`}
            x="0"
            y="0"
            width="48"
            height={config.height}
            patternUnits="userSpaceOnUse"
          >
            {/* Central diamond */}
            <path
              d={`M24 ${config.height * 0.15} L${24 + config.height * 0.35} ${config.height * 0.5} L24 ${config.height * 0.85} L${24 - config.height * 0.35} ${config.height * 0.5} Z`}
              fill="none"
              stroke="currentColor"
              strokeWidth={config.strokeWidth}
              className={`${config.stroke} ${config.darkStroke}`}
            />
            {/* Inner diamond */}
            <path
              d={`M24 ${config.height * 0.3} L${24 + config.height * 0.2} ${config.height * 0.5} L24 ${config.height * 0.7} L${24 - config.height * 0.2} ${config.height * 0.5} Z`}
              fill="none"
              stroke="currentColor"
              strokeWidth={config.innerStrokeWidth}
              className={`${config.stroke} ${config.darkStroke}`}
            />
            {/* Cross at center */}
            <line
              x1="22"
              y1={config.height * 0.5}
              x2="26"
              y2={config.height * 0.5}
              stroke="currentColor"
              strokeWidth={config.accentStrokeWidth}
              className={`${config.stroke} ${config.darkStroke}`}
            />
            <line
              x1="24"
              y1={config.height * 0.5 - 2}
              x2="24"
              y2={config.height * 0.5 + 2}
              stroke="currentColor"
              strokeWidth={config.accentStrokeWidth}
              className={`${config.stroke} ${config.darkStroke}`}
            />
          </pattern>

          {/* Chevron border lines at top and bottom */}
          <pattern
            id={`divider-chevron-${intensity}`}
            x="0"
            y="0"
            width="24"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 6 L6 2 L12 6 L18 2 L24 6"
              fill="none"
              stroke="currentColor"
              strokeWidth={config.accentStrokeWidth}
              className={`${config.stroke} ${config.darkStroke}`}
            />
          </pattern>
        </defs>

        {/* Top chevron border line */}
        <rect x="0" y="0" width="1200" height="8" fill={`url(#divider-chevron-${intensity})`} />

        {/* Central diamond chain band */}
        <rect
          x="0"
          y="4"
          width="1200"
          height={config.height - 8}
          fill={`url(#divider-diamond-${intensity})`}
        />

        {/* Bottom chevron border line */}
        <rect
          x="0"
          y={config.height - 8}
          width="1200"
          height="8"
          fill={`url(#divider-chevron-${intensity})`}
        />
      </svg>
    </div>
  );
}
