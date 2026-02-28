/**
 * unDraw-style "Constitution" illustration
 * Shows a grand legal document with a seal — representing the Romanian constitution.
 * Used on the hero/landing section. Adapts to dark/light mode via Tailwind fill classes
 * with explicit dark: variants for strong contrast in both themes.
 */
interface IllustrationProps {
  className?: string;
}

export function IllustrationConstitution({ className = "w-64 h-64" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Shadow behind document */}
      <rect
        x="115"
        y="28"
        width="180"
        height="252"
        rx="6"
        className="fill-muted-foreground/12 dark:fill-muted-foreground/15"
      />
      {/* Main document */}
      <rect
        x="110"
        y="24"
        width="180"
        height="252"
        rx="6"
        className="fill-card stroke-border dark:stroke-border/80"
        strokeWidth="1.5"
      />
      {/* Document header decoration */}
      <rect
        x="130"
        y="40"
        width="140"
        height="3"
        rx="1.5"
        className="fill-primary/50 dark:fill-primary/55"
      />
      {/* Title area */}
      <rect
        x="155"
        y="55"
        width="90"
        height="7"
        rx="3.5"
        className="fill-primary/60 dark:fill-primary/65"
      />
      <rect
        x="165"
        y="70"
        width="70"
        height="5"
        rx="2.5"
        className="fill-primary/40 dark:fill-primary/45"
      />
      {/* Horizontal rule */}
      <line
        x1="140"
        y1="88"
        x2="260"
        y2="88"
        className="stroke-border dark:stroke-border/80"
        strokeWidth="1"
      />
      {/* Article lines */}
      <rect
        x="130"
        y="100"
        width="30"
        height="4"
        rx="2"
        className="fill-primary/35 dark:fill-primary/40"
      />
      <rect
        x="130"
        y="112"
        width="140"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="130"
        y="122"
        width="130"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="130"
        y="132"
        width="136"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="130"
        y="148"
        width="30"
        height="4"
        rx="2"
        className="fill-primary/35 dark:fill-primary/40"
      />
      <rect
        x="130"
        y="160"
        width="140"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="130"
        y="170"
        width="125"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="130"
        y="180"
        width="135"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="130"
        y="190"
        width="120"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="130"
        y="206"
        width="30"
        height="4"
        rx="2"
        className="fill-primary/35 dark:fill-primary/40"
      />
      <rect
        x="130"
        y="218"
        width="138"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="130"
        y="228"
        width="128"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      {/* Official seal */}
      <circle
        cx="200"
        cy="252"
        r="14"
        className="fill-primary/25 dark:fill-primary/30 stroke-primary/50 dark:stroke-primary/55"
        strokeWidth="1.5"
      />
      <circle cx="200" cy="252" r="8" className="fill-primary/40 dark:fill-primary/45" />
      {/* Decorative elements - scales of justice */}
      <g transform="translate(330, 50)">
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="40"
          className="stroke-primary/40 dark:stroke-primary/45"
          strokeWidth="2"
        />
        <line
          x1="-20"
          y1="0"
          x2="20"
          y2="0"
          className="stroke-primary/40 dark:stroke-primary/45"
          strokeWidth="2"
        />
        {/* Left plate */}
        <path d="M-20 0 L-28 18 H-12 Z" className="fill-primary/30 dark:fill-primary/35" />
        {/* Right plate */}
        <path d="M20 0 L12 22 H28 Z" className="fill-primary/25 dark:fill-primary/30" />
        {/* Base */}
        <rect
          x="-8"
          y="40"
          width="16"
          height="4"
          rx="2"
          className="fill-primary/35 dark:fill-primary/40"
        />
      </g>
      {/* Flying decorative papers */}
      <rect
        x="30"
        y="80"
        width="50"
        height="35"
        rx="3"
        transform="rotate(-12 55 97)"
        className="fill-card stroke-border dark:stroke-border/60"
        strokeWidth="1"
      />
      <rect
        x="320"
        y="180"
        width="50"
        height="35"
        rx="3"
        transform="rotate(8 345 197)"
        className="fill-card stroke-border dark:stroke-border/60"
        strokeWidth="1"
      />
      {/* Decorative circles */}
      <circle cx="50" cy="40" r="5" className="fill-primary/20 dark:fill-primary/25" />
      <circle cx="370" cy="120" r="4" className="fill-primary/25 dark:fill-primary/30" />
      <circle cx="360" cy="270" r="3" className="fill-primary/15 dark:fill-primary/20" />
    </svg>
  );
}
