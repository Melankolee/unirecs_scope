/**
 * In-memory, per-IP token bucket. This is not the one-check-per-visitor rule
 * (that lives in the database) — it is the thing that stops a script from
 * burning the API budget in a minute.
 *
 * Each limiter counts into its own namespace. One shared map keyed by IP alone
 * meant every route spent the same counter: `/api/track` is allowed 240 events
 * a minute and `/api/check` 5 checks, and a visitor who pressed a few chips on
 * the landing page had spent the check budget without ever making a check. The
 * counter has to know which limit it is counting against.
 */
const buckets = new Map();

let unnamed = 0;

export function rateLimit({ windowMs = 60_000, max = 10, name } = {}) {
  // Named at the call site so the namespace does not depend on the order the
  // routes happen to be declared in.
  const scope = name || `rl${(unnamed += 1)}`;

  return function rateLimitMiddleware(req, res, next) {
    // A space cannot appear in either half, so the two can never run together
    // into a key that belongs to somebody else.
    const key = `${scope} ${req.ip || 'unknown'}`;
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
