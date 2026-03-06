/**
 * Shared rate limiter — works across all API routes in the same Cloud Run instance.
 * Uses an in-memory Map (fast, zero latency, zero cost).
 *
 * For multi-instance deployments, swap the Map for Redis/Upstash.
 * Firebase Gen2 warm instances persist state, so this works well in practice.
 */

interface RateLimitSlot {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitSlot>();

/** Prune expired entries to prevent unbounded memory growth. */
function prune(now: number) {
    if (store.size > 8000) {
        for (const [k, v] of store) {
            if (v.resetAt < now) store.delete(k);
        }
    }
}

/**
 * Check and increment rate limit for a given key.
 * @returns true if allowed, false if rate limited.
 */
export function checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    prune(now);

    const slot = store.get(key);

    if (!slot || slot.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
    }

    if (slot.count >= maxRequests) {
        return {
            allowed: false,
            retryAfterSeconds: Math.ceil((slot.resetAt - now) / 1000),
        };
    }

    slot.count++;
    return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Extract the best available IP from a Next.js Request.
 */
export function getClientIp(req: Request): string {
    const fwd = (req.headers as Headers).get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return (req.headers as Headers).get("x-real-ip") ?? "unknown";
}
