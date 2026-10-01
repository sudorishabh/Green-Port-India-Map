import "server-only";

interface Window {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/** Counts a request for `key` (the client IP) and reports whether it is allowed. */
export type RateLimiter = (key: string, now?: number) => RateLimitResult;

/**
 * Fixed-window limiter: `maxRequests` per `windowMs` for each key. In memory
 * and per server instance, like the express-rate-limit memory store it replaces.
 */
export function createRateLimiter({
  windowMs,
  maxRequests,
}: {
  windowMs: number;
  maxRequests: number;
}): RateLimiter {
  const windows = new Map<string, Window>();
  let nextSweepAt = 0;

  function sweepExpiredWindows(now: number) {
    if (now < nextSweepAt) return;
    for (const [key, window] of windows) {
      if (window.resetAt <= now) windows.delete(key);
    }
    nextSweepAt = now + windowMs;
  }

  return (key, now = Date.now()) => {
    sweepExpiredWindows(now);

    let window = windows.get(key);
    if (!window || window.resetAt <= now) {
      window = { count: 0, resetAt: now + windowMs };
      windows.set(key, window);
    }
    window.count += 1;

    return {
      allowed: window.count <= maxRequests,
      retryAfterSeconds: Math.ceil((window.resetAt - now) / 1000),
    };
  };
}
