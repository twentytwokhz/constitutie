import { detectBot } from "@/lib/bot-protection";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware — Bot Protection for API Routes
 *
 * Applies bot detection to all /api/* routes. Blocks automated requests
 * to mutation endpoints (POST/PUT/DELETE) while allowing normal browser
 * and legitimate API consumer traffic.
 *
 * In production, this would be replaced by Arcjet middleware for
 * TLS fingerprinting, behavioral analysis, and IP reputation checks.
 */
export function middleware(request: NextRequest) {
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

  // Add bot score header for monitoring (even on allowed requests)
  const response = NextResponse.next();
  response.headers.set("X-Bot-Score", String(score));
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
