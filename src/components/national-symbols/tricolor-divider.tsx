/**
 * Tricolor Divider
 *
 * A decorative full-width section divider with the Romanian tricolor.
 * Used between landing page sections for visual continuity.
 *
 * Renders as a full-width horizontal bar with three equal-width color
 * segments (blue, yellow, red) at 100% opacity.
 * Tricolor national symbols should never be faded or have less than 100% opacity.
 */
export function TricolorDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full h-[3px] ${className}`}
      role="presentation"
      aria-hidden="true"
      style={{
        background:
          "linear-gradient(to right, #002B7F 0%, #002B7F 33.33%, #FCD116 33.33%, #FCD116 66.66%, #CE1126 66.66%, #CE1126 100%)",
      }}
    />
  );
}
