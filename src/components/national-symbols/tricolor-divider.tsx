/**
 * Tricolor Divider
 *
 * A decorative section divider with the Romanian tricolor accent.
 * Used between landing page sections for visual continuity.
 *
 * Renders as a centered short tricolor bar with faded edges.
 */
export function TricolorDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center py-1 ${className}`}
      role="presentation"
      aria-hidden="true"
    >
      <div className="h-[3px] w-8 rounded-l-full bg-gradient-to-r from-transparent to-[#002B7F]" />
      <div className="h-[3px] w-12" style={{ backgroundColor: "#002B7F" }} />
      <div className="h-[3px] w-12" style={{ backgroundColor: "#FCD116" }} />
      <div className="h-[3px] w-12" style={{ backgroundColor: "#CE1126" }} />
      <div className="h-[3px] w-8 rounded-r-full bg-gradient-to-l from-transparent to-[#CE1126]" />
    </div>
  );
}
