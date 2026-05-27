import type { Request, Response, NextFunction } from "express";
import { HttpError } from "./errors";

let limiter: { limit: (key: string) => Promise<{ success: boolean }> } | null = null;

// Build the limiter lazily; if env is absent or wiring fails, stay null → fail-open.
function getLimiter() {
  if (limiter) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    // Require lazily so tests without env never touch the SDK.
    const { Ratelimit } = require("@upstash/ratelimit");
    const { Redis } = require("@upstash/redis");
    const redis = new Redis({ url, token, retry: { retries: 1, backoff: () => 0 } });
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      prefix: "swelter:",
    });
    return limiter;
  } catch {
    return null;
  }
}

export function rateLimit() {
  return async function (req: Request, _res: Response, next: NextFunction) {
    const l = getLimiter();
    if (!l) return next(); // fail-open: no limiter configured
    try {
      const key = req.ip ?? "anon";
      const { success } = await l.limit(key);
      if (!success) return next(new HttpError(429, "Rate limit exceeded"));
      return next();
    } catch {
      return next(); // fail-open on any Upstash error
    }
  };
}
