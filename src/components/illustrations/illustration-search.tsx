/**
 * unDraw-style "Search" illustration
 * Shows a person with a magnifying glass exploring documents — representing cross-version search.
 * Adapts to dark/light mode via Tailwind fill classes.
 */
interface IllustrationProps {
  className?: string;
}

export function IllustrationSearch({ className = "w-64 h-64" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Large magnifying glass */}
      <circle cx="220" cy="120" r="70" className="stroke-primary/40" strokeWidth="8" fill="none" />
      <circle cx="220" cy="120" r="62" className="fill-primary/5 dark:fill-primary/10" />
      {/* Handle */}
      <line
        x1="270"
        y1="170"
        x2="330"
        y2="240"
        className="stroke-primary/40"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Text lines inside magnifying glass (search results) */}
      <rect x="180" y="95" width="80" height="5" rx="2.5" className="fill-primary/30" />
      <rect x="180" y="108" width="65" height="5" rx="2.5" className="fill-muted-foreground/20" />
      <rect x="180" y="121" width="75" height="5" rx="2.5" className="fill-muted-foreground/20" />
      {/* Highlighted match */}
      <rect x="178" y="133" width="84" height="13" rx="3" className="fill-primary/15" />
      <rect x="182" y="137" width="55" height="5" rx="2.5" className="fill-primary/50" />
      {/* Floating document cards behind */}
      <rect
        x="40"
        y="50"
        width="90"
        height="70"
        rx="6"
        className="fill-card stroke-border"
        strokeWidth="1"
      />
      <rect x="52" y="62" width="40" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="52" y="72" width="66" height="3" rx="1.5" className="fill-muted-foreground/10" />
      <rect x="52" y="80" width="58" height="3" rx="1.5" className="fill-muted-foreground/10" />
      <rect x="52" y="88" width="62" height="3" rx="1.5" className="fill-muted-foreground/10" />
      <rect x="52" y="96" width="50" height="3" rx="1.5" className="fill-muted-foreground/10" />
      <rect
        x="60"
        y="150"
        width="90"
        height="70"
        rx="6"
        className="fill-card stroke-border"
        strokeWidth="1"
      />
      <rect x="72" y="162" width="40" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="72" y="172" width="66" height="3" rx="1.5" className="fill-muted-foreground/10" />
      <rect x="72" y="180" width="58" height="3" rx="1.5" className="fill-muted-foreground/10" />
      <rect x="72" y="188" width="62" height="3" rx="1.5" className="fill-muted-foreground/10" />
      <rect x="72" y="196" width="50" height="3" rx="1.5" className="fill-muted-foreground/10" />
      {/* Person figure */}
      <circle cx="100" cy="250" r="15" className="fill-primary/80" />
      <path
        d="M88 265 C88 265 85 290 88 300 L112 300 C115 290 112 265 112 265 Z"
        className="fill-primary/60"
      />
      {/* Decorative sparkles */}
      <circle cx="340" cy="60" r="3" className="fill-primary/25" />
      <circle cx="360" cy="80" r="2" className="fill-primary/15" />
      <circle cx="30" cy="280" r="4" className="fill-primary/15" />
    </svg>
  );
}
