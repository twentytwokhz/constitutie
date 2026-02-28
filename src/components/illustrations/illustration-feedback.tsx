/**
 * unDraw-style "Feedback/Community" illustration
 * Shows people collaborating with speech bubbles — representing anonymous feedback and comments.
 * Adapts to dark/light mode via Tailwind fill classes with explicit dark: variants
 * for strong contrast in both themes.
 */
interface IllustrationProps {
  className?: string;
}

export function IllustrationFeedback({ className = "w-64 h-64" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Large speech bubble */}
      <path
        d="M100 50 H300 Q320 50 320 70 V160 Q320 180 300 180 H220 L195 210 L190 180 H100 Q80 180 80 160 V70 Q80 50 100 50Z"
        className="fill-primary/15 dark:fill-primary/40 stroke-primary/30 dark:stroke-primary/50"
        strokeWidth="1.5"
      />
      {/* Text lines in bubble */}
      <rect
        x="110"
        y="80"
        width="120"
        height="5"
        rx="2.5"
        className="fill-muted-foreground/30 dark:fill-muted-foreground/50"
      />
      <rect
        x="110"
        y="95"
        width="180"
        height="5"
        rx="2.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/45"
      />
      <rect
        x="110"
        y="110"
        width="160"
        height="5"
        rx="2.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/45"
      />
      <rect
        x="110"
        y="125"
        width="140"
        height="5"
        rx="2.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/45"
      />
      {/* Thumbs up icon in bubble */}
      <rect
        x="110"
        y="145"
        width="50"
        height="20"
        rx="10"
        className="fill-emerald-500/25 dark:fill-emerald-500/45"
      />
      <text
        x="135"
        y="159"
        className="fill-emerald-600 dark:fill-emerald-400"
        fontSize="12"
        textAnchor="middle"
      >
        +42
      </text>
      {/* Thumbs down icon */}
      <rect
        x="170"
        y="145"
        width="50"
        height="20"
        rx="10"
        className="fill-rose-500/20 dark:fill-rose-500/40"
      />
      <text
        x="195"
        y="159"
        className="fill-rose-600 dark:fill-rose-400"
        fontSize="12"
        textAnchor="middle"
      >
        -3
      </text>
      {/* Person 1 (left) */}
      <circle cx="120" cy="240" r="16" className="fill-primary/85 dark:fill-primary/95" />
      <path
        d="M107 256 C107 256 103 280 106 298 L134 298 C137 280 133 256 133 256 Z"
        className="fill-primary/70 dark:fill-primary/85"
      />
      {/* Person 2 (right) */}
      <circle cx="280" cy="245" r="14" className="fill-primary/60 dark:fill-primary/85" />
      <path
        d="M269 259 C269 259 266 278 268 298 L292 298 C294 278 291 259 291 259 Z"
        className="fill-primary/45 dark:fill-primary/70"
      />
      {/* Small speech bubble from person 2 */}
      <path
        d="M300 220 H340 Q348 220 348 228 V248 Q348 256 340 256 H315 L310 265 L308 256 H300 Q292 256 292 248 V228 Q292 220 300 220Z"
        className="fill-primary/12 dark:fill-primary/45 stroke-primary/20 dark:stroke-primary/40"
        strokeWidth="1"
      />
      <rect
        x="302"
        y="233"
        width="36"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/45"
      />
      <rect
        x="302"
        y="241"
        width="28"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/25 dark:fill-muted-foreground/45"
      />
      {/* Decorative */}
      <circle cx="50" cy="40" r="4" className="fill-primary/20 dark:fill-primary/40" />
      <circle cx="370" cy="50" r="3" className="fill-primary/25 dark:fill-primary/45" />
    </svg>
  );
}
