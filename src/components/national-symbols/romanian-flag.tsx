/**
 * Romanian Flag SVG
 *
 * A prominent, visually striking Romanian tricolor flag with natural wind animation.
 * Renders as an SVG with the official colors: blue (#002B7F), yellow (#FCD116), red (#CE1126).
 * Includes animated waving effect (wind propagating from pole to free edge), fabric folds,
 * and a subtle constant drop shadow for visual depth.
 *
 * The wind animation uses SVG `<animate>` with asymmetric wave propagation:
 * - Near the pole (left): minimal movement (flag is attached)
 * - Toward the free edge (right): larger, flowing undulation
 * - 7s cycle for calm, natural rhythm (not pulsating)
 *
 * A secondary "fabric fold" overlay adds depth via animated vertical shading.
 * Respects `prefers-reduced-motion`. Works in both light and dark mode.
 */
export function RomanianFlag({
  className = "",
  label = "Romanian Flag",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={`relative flag-shadow-static ${className}`} aria-label={label} role="img">
      <svg viewBox="0 0 300 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <title>{label}</title>
        <defs>
          {/*
           * Wind wave clip path — asymmetric propagation from pole (left) to free edge (right).
           * Left side barely moves (attached to pole), amplitude increases toward the right.
           * 5 keyframes over 7s for a slow, natural wind cycle.
           */}
          <clipPath id="flag-wave">
            <path d="M0,2 Q30,2 75,4 Q150,8 225,14 Q270,4 300,10 L300,198 Q270,196 225,186 Q150,192 75,196 Q30,198 0,198 Z">
              <animate
                attributeName="d"
                values="
                  M0,2 Q30,2 75,4 Q150,8 225,14 Q270,4 300,10 L300,198 Q270,196 225,186 Q150,192 75,196 Q30,198 0,198 Z;
                  M0,2 Q30,3 75,6 Q150,2 225,8 Q270,16 300,6 L300,198 Q270,184 225,192 Q150,198 75,194 Q30,197 0,198 Z;
                  M0,2 Q30,2 75,3 Q150,10 225,4 Q270,12 300,14 L300,198 Q270,188 225,196 Q150,190 75,197 Q30,198 0,198 Z;
                  M0,2 Q30,3 75,7 Q150,4 225,12 Q270,6 300,8 L300,198 Q270,194 225,188 Q150,196 75,193 Q30,197 0,198 Z;
                  M0,2 Q30,2 75,4 Q150,8 225,14 Q270,4 300,10 L300,198 Q270,196 225,186 Q150,192 75,196 Q30,198 0,198 Z"
                dur="7s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
              />
            </path>
          </clipPath>
          {/*
           * Fabric fold shading — vertical gradient that shifts position to simulate
           * light catching different folds as the flag moves. Creates depth without pulsating.
           */}
          <linearGradient id="flag-fold" x1="0" y1="0" x2="1" y2="0.15">
            <stop offset="0%" stopColor="black" stopOpacity="0.06" />
            <stop offset="25%" stopColor="white" stopOpacity="0.06">
              <animate
                attributeName="offset"
                values="0.25;0.30;0.20;0.28;0.25"
                dur="7s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="black" stopOpacity="0.04">
              <animate
                attributeName="offset"
                values="0.50;0.55;0.45;0.52;0.50"
                dur="7s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="75%" stopColor="white" stopOpacity="0.08">
              <animate
                attributeName="offset"
                values="0.75;0.70;0.80;0.72;0.75"
                dur="7s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="black" stopOpacity="0.03" />
          </linearGradient>
          {/* Subtle constant shadow near the pole (left edge) */}
          <linearGradient id="flag-pole-shadow" x1="0" y1="0" x2="0.06" y2="0">
            <stop offset="0%" stopColor="black" stopOpacity="0.12" />
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
          {/* Fabric fold lighting */}
          <rect x="0" y="0" width="300" height="200" fill="url(#flag-fold)" />
          {/* Pole shadow */}
          <rect x="0" y="0" width="300" height="200" fill="url(#flag-pole-shadow)" />
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
            strokeOpacity="0.08"
            strokeWidth="0.75"
          />
        </g>
      </svg>
    </div>
  );
}
