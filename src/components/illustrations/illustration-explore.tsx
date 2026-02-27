/**
 * unDraw-style "Explore" illustration
 * Shows a person reading a large document/book — representing constitution exploration.
 * Adapts to dark/light mode via Tailwind fill classes.
 */
interface IllustrationProps {
  className?: string;
}

export function IllustrationExplore({ className = "w-64 h-64" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Large open book */}
      <rect
        x="80"
        y="80"
        width="240"
        height="180"
        rx="8"
        className="fill-primary/10 dark:fill-primary/20"
      />
      <path d="M200 80 V260" className="stroke-primary/30" strokeWidth="2" />
      {/* Left page lines */}
      <rect x="100" y="110" width="80" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="100" y="125" width="75" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="100" y="140" width="82" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="100" y="155" width="70" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="100" y="170" width="78" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="100" y="185" width="65" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="100" y="200" width="80" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="100" y="215" width="72" height="4" rx="2" className="fill-muted-foreground/20" />
      {/* Right page lines */}
      <rect x="220" y="110" width="80" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="220" y="125" width="75" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="220" y="140" width="82" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="220" y="155" width="70" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="220" y="170" width="78" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="220" y="185" width="65" height="4" rx="2" className="fill-muted-foreground/20" />
      {/* Highlighted article on right page */}
      <rect
        x="218"
        y="198"
        width="86"
        height="24"
        rx="4"
        className="fill-primary/15 dark:fill-primary/25"
      />
      <rect x="222" y="204" width="60" height="4" rx="2" className="fill-primary/60" />
      <rect x="222" y="214" width="50" height="4" rx="2" className="fill-primary/40" />
      {/* Person sitting and reading */}
      {/* Head */}
      <circle cx="54" cy="145" r="18" className="fill-primary/80" />
      {/* Body */}
      <path
        d="M40 163 C40 163 35 200 38 220 L68 220 C70 200 67 163 67 163 Z"
        className="fill-primary/60"
      />
      {/* Arm reaching to book */}
      <path
        d="M65 175 Q75 170 85 168"
        className="stroke-primary/60"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Legs */}
      <path
        d="M42 220 L30 260 M62 220 L70 260"
        className="stroke-primary/60"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Small decorative elements */}
      <circle cx="340" cy="60" r="4" className="fill-primary/30" />
      <circle cx="355" cy="75" r="3" className="fill-primary/20" />
      <circle cx="50" cy="60" r="5" className="fill-primary/20" />
      {/* Floor line */}
      <path
        d="M20 270 H380"
        className="stroke-muted-foreground/20"
        strokeWidth="2"
        strokeDasharray="8 4"
      />
    </svg>
  );
}
