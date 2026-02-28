/**
 * Romanian Flag SVG — Animated Wind Wave
 *
 * A visually striking Romanian tricolor flag with a natural wind animation.
 * Uses SVG `<animate>` on a clip-path to simulate gentle wind rippling
 * from the pole (left, minimal movement) to the free edge (right, larger amplitude).
 *
 * Design principles:
 * - Left edge (pole) barely moves — fixed attachment point
 * - Right edge (free) has the most amplitude — natural fabric behaviour
 * - 7-second cycle with spline easing for calm, organic rhythm
 * - Fabric fold shading via animated gradient stops
 * - Respects prefers-reduced-motion (CSS disables SVG <animate>)
 *
 * Works in both light and dark mode with appropriate drop shadows.
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
        className="w-full h-full flag-shadow-static"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{label}</title>
        <defs>
          {/* Animated wave clip-path — wind propagation from left (pole) to right (free edge) */}
          <clipPath id="flag-wave-anim">
            <path>
              <animate
                attributeName="d"
                dur="7s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
                values="
                  M0,2 C40,2 80,5 120,8 C160,11 200,4 240,0 C270,0 290,6 300,10 L300,190 C290,194 270,200 240,200 C200,196 160,189 120,192 C80,195 40,198 0,198 Z;
                  M0,3 C40,4 80,10 120,14 C160,6 200,0 240,4 C270,6 290,10 300,14 L300,186 C290,190 270,196 240,200 C200,194 160,188 120,194 C80,198 40,196 0,197 Z;
                  M0,2 C40,1 80,4 120,2 C160,8 200,14 240,10 C270,8 290,4 300,6 L300,194 C290,196 270,192 240,190 C200,196 160,200 120,196 C80,192 40,199 0,198 Z;
                  M0,3 C40,5 80,8 120,12 C160,4 200,2 240,6 C270,10 290,12 300,8 L300,192 C290,188 270,194 240,198 C200,200 160,194 120,190 C80,196 40,198 0,197 Z;
                  M0,2 C40,2 80,5 120,8 C160,11 200,4 240,0 C270,0 290,6 300,10 L300,190 C290,194 270,200 240,200 C200,196 160,189 120,192 C80,195 40,198 0,198 Z
                "
              />
            </path>
          </clipPath>

          {/* Fabric fold shading — animated gradient simulating light on ripples */}
          <linearGradient id="flag-fold" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0%" stopColor="black" stopOpacity="0.10">
              <animate
                attributeName="stopOpacity"
                dur="7s"
                repeatCount="indefinite"
                values="0.10;0.06;0.12;0.08;0.10"
              />
            </stop>
            <stop offset="30%" stopColor="white" stopOpacity="0.08">
              <animate
                attributeName="offset"
                dur="7s"
                repeatCount="indefinite"
                values="0.30;0.35;0.25;0.32;0.30"
              />
            </stop>
            <stop offset="55%" stopColor="black" stopOpacity="0.04">
              <animate
                attributeName="offset"
                dur="7s"
                repeatCount="indefinite"
                values="0.55;0.50;0.60;0.52;0.55"
              />
            </stop>
            <stop offset="80%" stopColor="white" stopOpacity="0.10">
              <animate
                attributeName="stopOpacity"
                dur="7s"
                repeatCount="indefinite"
                values="0.10;0.14;0.06;0.12;0.10"
              />
            </stop>
            <stop offset="100%" stopColor="black" stopOpacity="0.05" />
          </linearGradient>

          {/* Pole-side shadow — darker at the left edge */}
          <linearGradient id="flag-pole-shadow" x1="0" y1="0" x2="0.06" y2="0">
            <stop offset="0%" stopColor="black" stopOpacity="0.18" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g clipPath="url(#flag-wave-anim)">
          {/* Blue stripe */}
          <rect x="0" y="0" width="100" height="200" fill="#002B7F" />
          {/* Yellow stripe */}
          <rect x="100" y="0" width="100" height="200" fill="#FCD116" />
          {/* Red stripe */}
          <rect x="200" y="0" width="100" height="200" fill="#CE1126" />
          {/* Fabric fold shading overlay */}
          <rect x="0" y="0" width="300" height="200" fill="url(#flag-fold)" />
          {/* Pole shadow */}
          <rect x="0" y="0" width="300" height="200" fill="url(#flag-pole-shadow)" />
        </g>

        {/* Thin border for definition against backgrounds */}
        <g clipPath="url(#flag-wave-anim)">
          <rect
            x="0.5"
            y="0.5"
            width="299"
            height="199"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="1"
          />
        </g>
      </svg>
    </div>
  );
}
