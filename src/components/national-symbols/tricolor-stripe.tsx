/**
 * Tricolor Stripe
 *
 * A thin horizontal bar in the Romanian flag colors (blue, yellow, red).
 * Used at the very top of the page above the header, and as section dividers.
 *
 * @param height - CSS height of the stripe (default: "4px")
 * @param className - Additional CSS classes
 */
export function TricolorStripe({
  height = "4px",
  className = "",
}: {
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full flex shrink-0 ${className}`}
      style={{ height }}
      role="presentation"
      aria-hidden="true"
    >
      <div className="flex-1" style={{ backgroundColor: "#002B7F" }} />
      <div className="flex-1" style={{ backgroundColor: "#FCD116" }} />
      <div className="flex-1" style={{ backgroundColor: "#CE1126" }} />
    </div>
  );
}
