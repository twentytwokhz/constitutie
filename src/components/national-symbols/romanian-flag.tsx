/**
 * Romanian Flag SVG
 *
 * A prominent, visually striking Romanian tricolor flag with subtle wave animation.
 * Renders as an SVG with the official colors: blue (#002B7F), yellow (#FCD116), red (#CE1126).
 * Includes animated waving effect, sheen, and drop shadow for visual impact.
 *
 * The wave animation uses SVG `<animate>` to gently undulate the clip path,
 * and CSS `animate-flag-shadow` for a breathing shadow effect.
 * Both respect `prefers-reduced-motion`.
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
    <div className={`relative animate-flag-shadow ${className}`} aria-label={label} role="img">
      <svg viewBox="0 0 300 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <title>{label}</title>
        <defs>
          {/* Animated wave clip path — gentle undulation */}
          <clipPath id="flag-wave">
            <path d="M0,8 Q50,0 100,8 Q150,16 200,8 Q250,0 300,8 L300,192 Q250,200 200,192 Q150,184 100,192 Q50,200 0,192 Z">
              <animate
                attributeName="d"
                values="
                  M0,8 Q50,0 100,8 Q150,16 200,8 Q250,0 300,8 L300,192 Q250,200 200,192 Q150,184 100,192 Q50,200 0,192 Z;
                  M0,6 Q50,14 100,4 Q150,10 200,6 Q250,12 300,4 L300,194 Q250,186 200,196 Q150,190 100,194 Q50,186 0,196 Z;
                  M0,10 Q50,2 100,12 Q150,6 200,10 Q250,4 300,12 L300,190 Q250,198 200,188 Q150,194 100,190 Q50,198 0,188 Z;
                  M0,8 Q50,0 100,8 Q150,16 200,8 Q250,0 300,8 L300,192 Q250,200 200,192 Q150,184 100,192 Q50,200 0,192 Z"
                dur="4s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
              />
            </path>
          </clipPath>
          {/* Animated sheen — light sweeps across the flag surface */}
          <linearGradient id="flag-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.12">
              <animate
                attributeName="stop-opacity"
                values="0.12;0.06;0.12"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="white" stopOpacity="0">
              <animate
                attributeName="stop-opacity"
                values="0;0.05;0"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="black" stopOpacity="0.08">
              <animate
                attributeName="stop-opacity"
                values="0.08;0.12;0.08"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
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
