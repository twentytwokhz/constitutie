import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { detectBot } from "@/lib/bot-protection";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Next.js Middleware — i18n Routing + Bot Protection
 *
 * Handles two concerns:
 * 1. Locale detection and routing for all page requests (via next-intl)
 * 2. Bot protection for API routes (blocks automated mutation requests)
 */
export function middleware(request: NextRequest) {
  // Bot protection for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const { isBot, score, reason } = detectBot(request.headers, request.method);

    if (isBot) {
      console.warn(
        `[bot-protection] Blocked request: ${request.method} ${request.nextUrl.pathname} (score=${score}, reason=${reason})`,
      );

      return NextResponse.json(
        {
          error: "Request blocked by bot protection",
          code: "BOT_DETECTED",
        },
        {
          status: 403,
          headers: {
            "X-Bot-Score": String(score),
          },
        },
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-Bot-Score", String(score));
    return response;
  }

  // i18n middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except static files and Next.js internals
    "/((?!_next|_vercel|.*\\..*).*)",
    // Also match API routes for bot protection
    "/api/:path*",
  ],
};
