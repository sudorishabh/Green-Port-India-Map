import "server-only";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 250;

interface Window {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

// In-memory and per server instance, like the express-rate-limit memory store it replaces.
const windows = new Map<string, Window>();
let nextSweepAt = 0;

/** Fixed-window limiter: 250 requests per 10 minutes for each key (client IP). */
export function rateLimit(key: string, now = Date.now()): RateLimitResult {
  sweepExpiredWindows(now);

  let window = windows.get(key);
  if (!window || window.resetAt <= now) {
    window = { count: 0, resetAt: now + WINDOW_MS };
    windows.set(key, window);
  }
  window.count += 1;

  return {
    allowed: window.count <= MAX_REQUESTS_PER_WINDOW,
    retryAfterSeconds: Math.ceil((window.resetAt - now) / 1000),
  };
}

function sweepExpiredWindows(now: number) {
  if (now < nextSweepAt) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
  nextSweepAt = now + WINDOW_MS;
}
