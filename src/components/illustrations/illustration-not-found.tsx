/**
 * unDraw-style "Not Found" illustration
 * Shows a person looking confused at a broken/missing page — representing 404 errors.
 * Adapts to dark/light mode via Tailwind fill classes with explicit dark: variants
 * for strong contrast in both themes.
 */
interface IllustrationProps {
  className?: string;
}

export function IllustrationNotFound({ className = "w-64 h-64" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Broken/torn document */}
      <path
        d="M140 40 H260 Q268 40 268 48 V145 L230 145 L228 120 L200 150 L190 130 L170 148 L165 145 V48 Q165 40 140 40Z"
        className="fill-card stroke-border dark:stroke-border/80"
        strokeWidth="1.5"
      />
      {/* Text lines on document */}
      <rect
        x="180"
        y="60"
        width="70"
        height="4"
        rx="2"
        className="fill-muted-foreground/30 dark:fill-muted-foreground/35"
      />
      <rect
        x="180"
        y="74"
        width="60"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/20 dark:fill-muted-foreground/25"
      />
      <rect
        x="180"
        y="84"
        width="68"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/20 dark:fill-muted-foreground/25"
      />
      <rect
        x="180"
        y="94"
        width="55"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/20 dark:fill-muted-foreground/25"
      />
      <rect
        x="180"
        y="104"
        width="65"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/20 dark:fill-muted-foreground/25"
      />
      {/* Bottom torn piece */}
      <path
        d="M165 155 L170 158 L190 140 L200 160 L228 130 L230 155 H268 Q268 155 268 163 V240 Q268 248 260 248 H150 Q142 248 142 240 V175 L155 160 Z"
        className="fill-card stroke-border dark:stroke-border/80"
        strokeWidth="1.5"
      />
      <rect
        x="165"
        y="175"
        width="80"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/20 dark:fill-muted-foreground/25"
      />
      <rect
        x="165"
        y="185"
        width="70"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/20 dark:fill-muted-foreground/25"
      />
      <rect
        x="165"
        y="195"
        width="75"
        height="3"
        rx="1.5"
        className="fill-muted-foreground/20 dark:fill-muted-foreground/25"
      />
      {/* Question marks */}
      <text
        x="310"
        y="100"
        className="fill-primary/40 dark:fill-primary/45"
        fontSize="40"
        fontWeight="bold"
      >
        ?
      </text>
      <text
        x="85"
        y="130"
        className="fill-primary/30 dark:fill-primary/35"
        fontSize="28"
        fontWeight="bold"
      >
        ?
      </text>
      {/* Person looking confused */}
      <circle cx="80" cy="195" r="18" className="fill-primary/85 dark:fill-primary/90" />
      {/* Confused expression - scratch marks */}
      <path
        d="M72 188 L78 193 M78 188 L72 193"
        className="stroke-primary-foreground/70 dark:stroke-primary-foreground/75"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Body */}
      <path
        d="M66 213 C66 213 62 245 65 270 L95 270 C98 245 94 213 94 213 Z"
        className="fill-primary/70 dark:fill-primary/75"
      />
      {/* Arm scratching head */}
      <path
        d="M90 225 Q100 210 95 195"
        className="stroke-primary/70 dark:stroke-primary/75"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Other arm */}
      <path
        d="M70 230 Q55 240 50 250"
        className="stroke-primary/70 dark:stroke-primary/75"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Floor line */}
      <path
        d="M30 280 H370"
        className="stroke-muted-foreground/25 dark:stroke-muted-foreground/30"
        strokeWidth="2"
        strokeDasharray="8 4"
      />
      {/* Decorative dots */}
      <circle cx="340" cy="50" r="4" className="fill-primary/20 dark:fill-primary/25" />
      <circle cx="355" cy="70" r="3" className="fill-primary/15 dark:fill-primary/20" />
      <circle cx="50" cy="50" r="3" className="fill-primary/20 dark:fill-primary/25" />
    </svg>
  );
}
