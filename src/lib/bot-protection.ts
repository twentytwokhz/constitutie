/**
 * Bot Protection Module
 *
 * Detects automated/bot-like requests by analyzing HTTP headers.
 * Uses a scoring system where multiple signals combine to determine
 * if a request is likely from a bot.
 *
 * In production, this would be replaced by Arcjet Shield for more
 * sophisticated detection (TLS fingerprinting, behavioral analysis).
 * This implementation covers header-based heuristics.
 */

/** Known bot User-Agent patterns */
const BOT_UA_PATTERNS = [
  /^$/,
  /curl\//i,
  /wget\//i,
  /python-requests/i,
  /python-urllib/i,
  /node-fetch/i,
  /axios\//i,
  /go-http-client/i,
  /java\//i,
  /libwww/i,
  /httpie/i,
  /postman/i,
  /insomnia/i,
  /scrapy/i,
  /phantomjs/i,
  /headlesschrome/i,
  /bot\b/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
];

/** Well-known good bots that should be allowed (search engines, monitors) */
const ALLOWED_BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /duckduckbot/i,
  /uptimerobot/i,
  /pingdom/i,
];

interface BotCheckResult {
  isBot: boolean;
  score: number;
  reason: string | null;
}

/**
 * Analyze request headers to detect bot-like behavior.
 *
 * Scoring:
 * - 0-2: Likely human (allowed)
 * - 3-4: Suspicious (allowed with warning)
 * - 5+: Likely bot (blocked)
 *
 * Only mutation endpoints (POST/PUT/DELETE) are protected.
 * GET requests are always allowed to support API consumers.
 */
export function detectBot(headers: Headers, method: string): BotCheckResult {
  // Only protect mutation endpoints — GET is always allowed
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { isBot: false, score: 0, reason: null };
  }

  const ua = headers.get("user-agent") || "";
  let score = 0;
  const reasons: string[] = [];

  // Check for allowed bots (search engines, monitoring)
  for (const pattern of ALLOWED_BOT_PATTERNS) {
    if (pattern.test(ua)) {
      return { isBot: false, score: 0, reason: null };
    }
  }

  // Signal 1: Known bot User-Agent (strong signal)
  for (const pattern of BOT_UA_PATTERNS) {
    if (pattern.test(ua)) {
      score += 3;
      reasons.push("bot-ua");
      break;
    }
  }

  // Signal 2: Missing User-Agent entirely (strong signal)
  if (!ua) {
    score += 3;
    reasons.push("no-ua");
  }

  // Signal 3: Missing Accept header (browsers always send this)
  if (!headers.get("accept")) {
    score += 2;
    reasons.push("no-accept");
  }

  // Signal 4: Missing Accept-Language (browsers always send this)
  if (!headers.get("accept-language")) {
    score += 1;
    reasons.push("no-accept-lang");
  }

  // Signal 5: Missing or suspicious Content-Type for POST
  if (method === "POST") {
    const ct = headers.get("content-type") || "";
    if (!ct.includes("application/json") && !ct.includes("multipart/form-data")) {
      score += 1;
      reasons.push("bad-content-type");
    }
  }

  const isBot = score >= 5;

  return {
    isBot,
    score,
    reason: isBot ? reasons.join(",") : null,
  };
}
