// Official Romanian heraldic colours (Constitution 1992 reference)
const BLUE = "#002B7F";
const YELLOW = "#FCD116";
const RED = "#CE1126";

export function RomanianFlag({
  className,
  label = "Drapelul României",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={label}
      className={className}
      style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.15))" }}
    >
      <rect x="0" y="0" width="100" height="200" fill={BLUE} />
      <rect x="100" y="0" width="100" height="200" fill={YELLOW} />
      <rect x="200" y="0" width="100" height="200" fill={RED} />
    </svg>
  );
}
