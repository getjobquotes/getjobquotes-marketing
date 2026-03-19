const store = new Map<string, { count: number; resetAt: number }>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "stripe-checkout": { max: 5,  windowMs: 60_000 },
  "auth-email":      { max: 3,  windowMs: 60_000 },
  "send-quote":      { max: 10, windowMs: 60_000 },
  "default":         { max: 30, windowMs: 60_000 },
};

export function rateLimit(
  identifier: string,
  type = "default"
): { success: boolean; remaining: number } {
  const limit = LIMITS[type] || LIMITS["default"];
  const key = `${type}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + limit.windowMs });
    return { success: true, remaining: limit.max - 1 };
  }

  if (entry.count >= limit.max) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit.max - entry.count };
}
