/**
 * Sliding Window Rate Limiter
 *
 * Implements a sliding window rate limiting algorithm that tracks
 * request counts per identifier (IP + fingerprint combination).
 *
 * In production, this would ideally be backed by Redis or Arcjet.
 * This in-memory implementation works for single-instance deployments
 * and development. It automatically evicts expired entries to prevent
 * memory leaks.
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Unix timestamp (ms) when the rate limit resets */
  resetAt: number;
  /** Total limit for this window */
  limit: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries (every 60 seconds)
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(windowMs: number) {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of store) {
        // Remove timestamps older than the largest reasonable window (1 hour)
        entry.timestamps = entry.timestamps.filter((t) => now - t < 3600_000);
        if (entry.timestamps.length === 0) {
          store.delete(key);
        }
      }
    },
    Math.max(windowMs, 60_000),
  );
  // Don't prevent Node.js from exiting
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

/**
 * Check if a request is allowed under the rate limit.
 *
 * @param identifier - Unique key for the requester (e.g., IP hash + fingerprint)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const { maxRequests, windowMs } = config;

  ensureCleanup(windowMs);

  let entry = store.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(identifier, entry);
  }

  // Remove timestamps outside the sliding window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    // Rate limit exceeded
    const oldestInWindow = entry.timestamps[0];
    const resetAt = oldestInWindow + windowMs;

    return {
      allowed: false,
      remaining: 0,
      resetAt,
      limit: maxRequests,
    };
  }

  // Allow the request and record the timestamp
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetAt: now + windowMs,
    limit: maxRequests,
  };
}

/** Rate limit presets */
export const RATE_LIMITS = {
  /** Comments: 5 per minute per identifier */
  comments: {
    maxRequests: 5,
    windowMs: 60_000,
  } satisfies RateLimitConfig,

  /** Votes: 30 per minute per identifier */
  votes: {
    maxRequests: 30,
    windowMs: 60_000,
  } satisfies RateLimitConfig,
} as const;
