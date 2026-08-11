/**
 * In-memory, per-IP token bucket. This is not the one-check-per-visitor rule
 * (that lives in the database) — it is the thing that stops a script from
 * burning the API budget in a minute.
 */
const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 10 } = {}) {
  return function rateLimitMiddleware(req, res, next) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'Too many requests. Give it a minute.' });
    }
    return next();
  };
}

// Keep the map from growing without bound on a long-lived process.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now > entry.resetAt) buckets.delete(key);
  }
}, 60_000).unref();
