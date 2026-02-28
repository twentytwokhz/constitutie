/**
 * unDraw-style "Graph/Network" illustration
 * Shows an interconnected node graph — representing the constitution structure visualization.
 * Adapts to dark/light mode via Tailwind fill classes with explicit dark: variants
 * for strong contrast in both themes.
 */
interface IllustrationProps {
  className?: string;
}

export function IllustrationGraph({ className = "w-64 h-64" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Edges (connections between nodes) */}
      <line
        x1="200"
        y1="70"
        x2="120"
        y2="140"
        className="stroke-muted-foreground/30 dark:stroke-muted-foreground/50"
        strokeWidth="2"
      />
      <line
        x1="200"
        y1="70"
        x2="280"
        y2="140"
        className="stroke-muted-foreground/30 dark:stroke-muted-foreground/50"
        strokeWidth="2"
      />
      <line
        x1="200"
        y1="70"
        x2="200"
        y2="150"
        className="stroke-muted-foreground/30 dark:stroke-muted-foreground/50"
        strokeWidth="2"
      />
      <line
        x1="120"
        y1="140"
        x2="70"
        y2="210"
        className="stroke-muted-foreground/30 dark:stroke-muted-foreground/50"
        strokeWidth="2"
      />
      <line
        x1="120"
        y1="140"
        x2="150"
        y2="220"
        className="stroke-muted-foreground/30 dark:stroke-muted-foreground/50"
        strokeWidth="2"
      />
      <line
        x1="280"
        y1="140"
        x2="250"
        y2="220"
        className="stroke-muted-foreground/30 dark:stroke-muted-foreground/50"
        strokeWidth="2"
      />
      <line
        x1="280"
        y1="140"
        x2="330"
        y2="210"
        className="stroke-muted-foreground/30 dark:stroke-muted-foreground/50"
        strokeWidth="2"
      />
      <line
        x1="200"
        y1="150"
        x2="200"
        y2="230"
        className="stroke-muted-foreground/30 dark:stroke-muted-foreground/50"
        strokeWidth="2"
      />
      {/* Cross-reference dashed edges */}
      <line
        x1="70"
        y1="210"
        x2="250"
        y2="220"
        className="stroke-primary/40 dark:stroke-primary/65"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />
      <line
        x1="150"
        y1="220"
        x2="330"
        y2="210"
        className="stroke-primary/40 dark:stroke-primary/65"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />
      {/* Root node (Titlu) - large */}
      <circle cx="200" cy="70" r="22" className="fill-primary" />
      <text
        x="200"
        y="75"
        className="fill-primary-foreground"
        fontSize="11"
        textAnchor="middle"
        fontWeight="600"
      >
        T
      </text>
      {/* Level 2 nodes (Capitol) - medium */}
      <circle cx="120" cy="140" r="16" className="fill-primary/75 dark:fill-primary/95" />
      <text x="120" y="145" className="fill-primary-foreground" fontSize="10" textAnchor="middle">
        C1
      </text>
      <circle cx="200" cy="150" r="16" className="fill-primary/75 dark:fill-primary/95" />
      <text x="200" y="155" className="fill-primary-foreground" fontSize="10" textAnchor="middle">
        C2
      </text>
      <circle cx="280" cy="140" r="16" className="fill-primary/75 dark:fill-primary/95" />
      <text x="280" y="145" className="fill-primary-foreground" fontSize="10" textAnchor="middle">
        C3
      </text>
      {/* Level 3 nodes (Articol) - small */}
      <circle
        cx="70"
        cy="210"
        r="11"
        className="fill-muted-foreground/40 dark:fill-muted-foreground/65"
      />
      <circle
        cx="150"
        cy="220"
        r="11"
        className="fill-muted-foreground/40 dark:fill-muted-foreground/65"
      />
      <circle
        cx="200"
        cy="230"
        r="11"
        className="fill-muted-foreground/40 dark:fill-muted-foreground/65"
      />
      <circle
        cx="250"
        cy="220"
        r="11"
        className="fill-muted-foreground/40 dark:fill-muted-foreground/65"
      />
      <circle
        cx="330"
        cy="210"
        r="11"
        className="fill-muted-foreground/40 dark:fill-muted-foreground/65"
      />
      {/* Article numbers */}
      <text
        x="70"
        y="214"
        className="fill-foreground/70 dark:fill-foreground/85"
        fontSize="8"
        textAnchor="middle"
      >
        A1
      </text>
      <text
        x="150"
        y="224"
        className="fill-foreground/70 dark:fill-foreground/85"
        fontSize="8"
        textAnchor="middle"
      >
        A2
      </text>
      <text
        x="200"
        y="234"
        className="fill-foreground/70 dark:fill-foreground/85"
        fontSize="8"
        textAnchor="middle"
      >
        A3
      </text>
      <text
        x="250"
        y="224"
        className="fill-foreground/70 dark:fill-foreground/85"
        fontSize="8"
        textAnchor="middle"
      >
        A4
      </text>
      <text
        x="330"
        y="214"
        className="fill-foreground/70 dark:fill-foreground/85"
        fontSize="8"
        textAnchor="middle"
      >
        A5
      </text>
      {/* Person interacting with graph */}
      <circle cx="55" cy="95" r="14" className="fill-primary/85 dark:fill-primary/95" />
      <path
        d="M44 109 C44 109 40 135 43 155 L67 155 C69 135 66 109 66 109 Z"
        className="fill-primary/70 dark:fill-primary/85"
      />
      {/* Arm pointing at graph */}
      <path
        d="M64 120 Q85 115 100 125"
        className="stroke-primary/70 dark:stroke-primary/85"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Decorative elements */}
      <circle cx="360" cy="50" r="3" className="fill-primary/25 dark:fill-primary/45" />
      <circle cx="370" cy="65" r="2" className="fill-primary/20 dark:fill-primary/40" />
      <circle cx="30" cy="260" r="4" className="fill-primary/20 dark:fill-primary/40" />
    </svg>
  );
}
