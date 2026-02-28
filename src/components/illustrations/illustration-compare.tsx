/**
 * unDraw-style "Compare" illustration
 * Shows two documents side by side with diff markers — representing version comparison.
 * Adapts to dark/light mode via Tailwind fill classes with explicit dark: variants
 * for strong contrast in both themes.
 */
interface IllustrationProps {
  className?: string;
}

export function IllustrationCompare({ className = "w-64 h-64" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left document */}
      <rect
        x="40"
        y="40"
        width="140"
        height="200"
        rx="8"
        className="fill-card stroke-border dark:stroke-border/80"
        strokeWidth="1.5"
      />
      <rect
        x="55"
        y="60"
        width="50"
        height="6"
        rx="3"
        className="fill-muted-foreground/40 dark:fill-muted-foreground/45"
      />
      <rect
        x="55"
        y="78"
        width="110"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="55"
        y="90"
        width="100"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      {/* Green added line */}
      <rect
        x="53"
        y="104"
        width="114"
        height="14"
        rx="3"
        className="fill-emerald-500/20 dark:fill-emerald-500/25"
      />
      <rect
        x="57"
        y="108"
        width="80"
        height="4"
        rx="2"
        className="fill-emerald-500/60 dark:fill-emerald-400/65"
      />
      <rect
        x="55"
        y="128"
        width="105"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="55"
        y="140"
        width="95"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      {/* Yellow modified line */}
      <rect
        x="53"
        y="154"
        width="114"
        height="14"
        rx="3"
        className="fill-amber-500/20 dark:fill-amber-500/25"
      />
      <rect
        x="57"
        y="158"
        width="70"
        height="4"
        rx="2"
        className="fill-amber-500/60 dark:fill-amber-400/65"
      />
      <rect
        x="55"
        y="178"
        width="100"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="55"
        y="190"
        width="90"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="55"
        y="202"
        width="108"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      {/* Right document */}
      <rect
        x="220"
        y="40"
        width="140"
        height="200"
        rx="8"
        className="fill-card stroke-border dark:stroke-border/80"
        strokeWidth="1.5"
      />
      <rect
        x="235"
        y="60"
        width="50"
        height="6"
        rx="3"
        className="fill-muted-foreground/40 dark:fill-muted-foreground/45"
      />
      <rect
        x="235"
        y="78"
        width="110"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="235"
        y="90"
        width="100"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="235"
        y="104"
        width="105"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="235"
        y="118"
        width="95"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      {/* Red removed line */}
      <rect
        x="233"
        y="132"
        width="114"
        height="14"
        rx="3"
        className="fill-rose-500/20 dark:fill-rose-500/25"
      />
      <rect
        x="237"
        y="136"
        width="85"
        height="4"
        rx="2"
        className="fill-rose-500/60 dark:fill-rose-400/65"
      />
      {/* Yellow modified line */}
      <rect
        x="233"
        y="156"
        width="114"
        height="14"
        rx="3"
        className="fill-amber-500/20 dark:fill-amber-500/25"
      />
      <rect
        x="237"
        y="160"
        width="74"
        height="4"
        rx="2"
        className="fill-amber-500/60 dark:fill-amber-400/65"
      />
      <rect
        x="235"
        y="180"
        width="100"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="235"
        y="192"
        width="90"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      <rect
        x="235"
        y="204"
        width="108"
        height="4"
        rx="2"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/30"
      />
      {/* Comparison arrows in center */}
      <path
        d="M188 120 L212 120"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M207 115 L214 120 L207 125"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M212 160 L188 160"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M193 155 L186 160 L193 165"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Decorative circles */}
      <circle cx="200" cy="30" r="6" className="fill-primary/25 dark:fill-primary/30" />
      <circle cx="200" cy="270" r="4" className="fill-primary/20 dark:fill-primary/25" />
      {/* Labels */}
      <text
        x="85"
        y="30"
        className="fill-muted-foreground/60 dark:fill-muted-foreground/65"
        fontSize="11"
        textAnchor="middle"
      >
        v1
      </text>
      <text
        x="290"
        y="30"
        className="fill-muted-foreground/60 dark:fill-muted-foreground/65"
        fontSize="11"
        textAnchor="middle"
      >
        v2
      </text>
    </svg>
  );
}
