import Image from "next/image";

/**
 * Map of constitution years to their corresponding coat of arms image paths.
 * Each year uses its historically-accurate coat of arms (stema):
 * - 1866, 1923, 1938: Kingdom of Romania (various royal emblems)
 * - 1948, 1952: People's Republic of Romania (Soviet-influenced emblem)
 * - 1965: Socialist Republic of Romania (updated socialist emblem)
 * - 1986, 1991, 2003: Post-socialist Romania (modern coat of arms)
 */
const COAT_OF_ARMS_MAP: Record<number, string> = {
  1866: "/images/stema-1866.webp",
  1923: "/images/stema-1923.webp",
  1938: "/images/stema-1938.webp",
  1948: "/images/stema-1948.webp",
  1952: "/images/stema-1952.webp",
  1965: "/images/stema-1965.webp",
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
 * @param year - The constitution year (1866–2003). Returns null for years without images.
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
