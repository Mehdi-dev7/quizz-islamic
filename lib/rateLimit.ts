// Rate limiter en mémoire — suffisant pour un projet sans Redis
// Se réinitialise au redémarrage du serveur

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfterSecs: 0 };
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, retryAfterSecs: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, retryAfterSecs: 0 };
}
