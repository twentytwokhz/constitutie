/**
 * Tricolor Divider
 *
 * A decorative section divider with the Romanian tricolor accent.
 * Used between landing page sections for visual continuity.
 *
 * Renders as a centered short tricolor bar with rounded ends at full opacity.
 * Tricolor national symbols should never be faded or have less than 100% opacity.
 */
export function TricolorDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center py-1 ${className}`}
      role="presentation"
      aria-hidden="true"
    >
      <div className="h-[3px] w-20 rounded-l-full" style={{ backgroundColor: "#002B7F" }} />
      <div className="h-[3px] w-12" style={{ backgroundColor: "#FCD116" }} />
      <div className="h-[3px] w-20 rounded-r-full" style={{ backgroundColor: "#CE1126" }} />
    </div>
  );
}
