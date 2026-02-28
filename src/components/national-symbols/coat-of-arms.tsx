import Image from "next/image";

/**
 * Map of constitution years to their corresponding coat of arms image paths.
 */
const COAT_OF_ARMS_MAP: Record<number, string> = {
  1952: "/images/logo1952.webp",
  1986: "/images/logo1986.webp",
  1991: "/images/logo1991.webp",
  2003: "/images/logo2003.webp",
};

/**
 * Coat of Arms (Stema Rom\u00e2niei)
 *
 * Displays the version-specific coat of arms using Next.js Image for optimization.
 * Adapts to dark mode with a subtle drop shadow and light border for visibility.
 *
 * @param year - The constitution year (1952, 1986, 1991, 2003)
 * @param size - Size in pixels (used for both width and height)
 * @param className - Additional CSS classes
 */
export function CoatOfArms({
  year,
  size = 48,
  className = "",
}: {
  year: number;
  size?: number;
  className?: string;
}) {
  const src = COAT_OF_ARMS_MAP[year];

  if (!src) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm ring-1 ring-transparent dark:ring-white/10 ${className}`}
    >
      <Image
        src={src}
        alt={`Stema Rom\u00e2niei - Constitu\u021bia ${year}`}
        width={size}
        height={size}
        className="inline-block object-contain drop-shadow-sm dark:drop-shadow-[0_2px_4px_rgba(255,255,255,0.12)] dark:brightness-110 rounded-sm"
        unoptimized
      />
    </span>
  );
}
