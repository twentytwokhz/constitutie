/**
 * unDraw-style "Statistics" illustration
 * Shows bar charts and data visualization — representing constitution statistics dashboard.
 * Adapts to dark/light mode via Tailwind fill classes with explicit dark: variants
 * for strong contrast in both themes.
 */
interface IllustrationProps {
  className?: string;
}

export function IllustrationStatistics({ className = "w-64 h-64" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Chart background panel */}
      <rect
        x="80"
        y="30"
        width="260"
        height="200"
        rx="8"
        className="fill-card stroke-border dark:stroke-border/80"
        strokeWidth="1.5"
      />
      {/* Chart axes */}
      <line
        x1="110"
        y1="200"
        x2="310"
        y2="200"
        className="stroke-muted-foreground/35 dark:stroke-muted-foreground/40"
        strokeWidth="1.5"
      />
      <line
        x1="110"
        y1="200"
        x2="110"
        y2="55"
        className="stroke-muted-foreground/35 dark:stroke-muted-foreground/40"
        strokeWidth="1.5"
      />
      {/* Grid lines */}
      <line
        x1="110"
        y1="165"
        x2="310"
        y2="165"
        className="stroke-muted-foreground/15 dark:stroke-muted-foreground/20"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <line
        x1="110"
        y1="130"
        x2="310"
        y2="130"
        className="stroke-muted-foreground/15 dark:stroke-muted-foreground/20"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <line
        x1="110"
        y1="95"
        x2="310"
        y2="95"
        className="stroke-muted-foreground/15 dark:stroke-muted-foreground/20"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      {/* Bars — representing articles per version (1952: 105, 1986: 121, 1991: 152, 2003: 157) */}
      {/* 1952 bar */}
      <rect
        x="130"
        y="120"
        width="32"
        height="80"
        rx="4"
        className="fill-primary/50 dark:fill-primary/55"
      />
      <text
        x="146"
        y="210"
        className="fill-muted-foreground/50 dark:fill-muted-foreground/55"
        fontSize="9"
        textAnchor="middle"
      >
        1952
      </text>
      {/* 1986 bar */}
      <rect
        x="178"
        y="110"
        width="32"
        height="90"
        rx="4"
        className="fill-primary/65 dark:fill-primary/70"
      />
      <text
        x="194"
        y="210"
        className="fill-muted-foreground/50 dark:fill-muted-foreground/55"
        fontSize="9"
        textAnchor="middle"
      >
        1986
      </text>
      {/* 1991 bar */}
      <rect
        x="226"
        y="80"
        width="32"
        height="120"
        rx="4"
        className="fill-primary/75 dark:fill-primary/80"
      />
      <text
        x="242"
        y="210"
        className="fill-muted-foreground/50 dark:fill-muted-foreground/55"
        fontSize="9"
        textAnchor="middle"
      >
        1991
      </text>
      {/* 2003 bar */}
      <rect
        x="274"
        y="75"
        width="32"
        height="125"
        rx="4"
        className="fill-primary/90 dark:fill-primary/95"
      />
      <text
        x="290"
        y="210"
        className="fill-muted-foreground/50 dark:fill-muted-foreground/55"
        fontSize="9"
        textAnchor="middle"
      >
        2003
      </text>
      {/* Bar value labels */}
      <text
        x="146"
        y="115"
        className="fill-primary/85 dark:fill-primary/90"
        fontSize="9"
        textAnchor="middle"
        fontWeight="600"
      >
        105
      </text>
      <text
        x="194"
        y="105"
        className="fill-primary/85 dark:fill-primary/90"
        fontSize="9"
        textAnchor="middle"
        fontWeight="600"
      >
        121
      </text>
      <text
        x="242"
        y="75"
        className="fill-primary/85 dark:fill-primary/90"
        fontSize="9"
        textAnchor="middle"
        fontWeight="600"
      >
        152
      </text>
      <text
        x="290"
        y="70"
        className="fill-primary/85 dark:fill-primary/90"
        fontSize="9"
        textAnchor="middle"
        fontWeight="600"
      >
        157
      </text>
      {/* Y-axis label */}
      <text
        x="95"
        y="130"
        className="fill-muted-foreground/40 dark:fill-muted-foreground/45"
        fontSize="8"
        textAnchor="end"
        transform="rotate(-90 95 130)"
      >
        Articole
      </text>
      {/* Person analyzing chart */}
      <circle cx="55" cy="180" r="16" className="fill-primary/85 dark:fill-primary/90" />
      <path
        d="M43 196 C43 196 39 225 42 250 L68 250 C71 225 67 196 67 196 Z"
        className="fill-primary/70 dark:fill-primary/75"
      />
      {/* Arm pointing at chart */}
      <path
        d="M65 210 Q80 200 95 190"
        className="stroke-primary/70 dark:stroke-primary/75"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Stat cards at bottom */}
      <rect
        x="80"
        y="258"
        width="80"
        height="30"
        rx="5"
        className="fill-primary/15 dark:fill-primary/20"
      />
      <rect
        x="90"
        y="266"
        width="30"
        height="4"
        rx="2"
        className="fill-primary/60 dark:fill-primary/65"
      />
      <rect
        x="90"
        y="276"
        width="50"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="175"
        y="258"
        width="80"
        height="30"
        rx="5"
        className="fill-primary/15 dark:fill-primary/20"
      />
      <rect
        x="185"
        y="266"
        width="30"
        height="4"
        rx="2"
        className="fill-primary/60 dark:fill-primary/65"
      />
      <rect
        x="185"
        y="276"
        width="50"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="270"
        y="258"
        width="80"
        height="30"
        rx="5"
        className="fill-primary/15 dark:fill-primary/20"
      />
      <rect
        x="280"
        y="266"
        width="30"
        height="4"
        rx="2"
        className="fill-primary/60 dark:fill-primary/65"
      />
      <rect
        x="280"
        y="276"
        width="50"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      {/* Decorative */}
      <circle cx="365" cy="40" r="3" className="fill-primary/25 dark:fill-primary/30" />
      <circle cx="30" cy="140" r="4" className="fill-primary/20 dark:fill-primary/25" />
    </svg>
  );
}
