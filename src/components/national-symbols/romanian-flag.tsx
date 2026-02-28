/**
 * Romanian Flag SVG
 *
 * A prominent, visually striking Romanian tricolor flag.
 * Renders as an SVG with the official colors: blue (#002B7F), yellow (#FCD116), red (#CE1126).
 * Includes a subtle waving effect and drop shadow for visual impact.
 *
 * Works in both light and dark mode.
 */
export function RomanianFlag({
  className = "",
  label = "Romanian Flag",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={`relative ${className}`} aria-label={label} role="img">
      <svg
        viewBox="0 0 300 200"
        className="w-full h-full drop-shadow-lg dark:drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{label}</title>
        <defs>
          {/* Subtle wave distortion */}
          <clipPath id="flag-wave">
            <path d="M0,8 Q50,0 100,8 Q150,16 200,8 Q250,0 300,8 L300,192 Q250,200 200,192 Q150,184 100,192 Q50,200 0,192 Z" />
          </clipPath>
          {/* Light sheen gradient for realism */}
          <linearGradient id="flag-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.08" />
          </linearGradient>
          {/* Subtle shadow on the left edge (flagpole side) */}
          <linearGradient id="flag-shadow" x1="0" y1="0" x2="0.05" y2="0">
            <stop offset="0%" stopColor="black" stopOpacity="0.15" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g clipPath="url(#flag-wave)">
          {/* Blue stripe */}
          <rect x="0" y="0" width="100" height="200" fill="#002B7F" />
          {/* Yellow stripe */}
          <rect x="100" y="0" width="100" height="200" fill="#FCD116" />
          {/* Red stripe */}
          <rect x="200" y="0" width="100" height="200" fill="#CE1126" />
          {/* Sheen overlay */}
          <rect x="0" y="0" width="300" height="200" fill="url(#flag-sheen)" />
          {/* Pole shadow */}
          <rect x="0" y="0" width="300" height="200" fill="url(#flag-shadow)" />
        </g>

        {/* Thin border for definition against backgrounds */}
        <g clipPath="url(#flag-wave)">
          <rect
            x="0.5"
            y="0.5"
            width="299"
            height="199"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
        </g>
      </svg>
    </div>
  );
}
