import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation utilities.
 *
 * Use these instead of next/link and next/navigation to ensure
 * all links and paths are correctly prefixed with the current locale.
 */
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
