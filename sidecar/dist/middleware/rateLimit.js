"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimitMiddleware = createRateLimitMiddleware;
const paths_js_1 = require("./paths.js");
/** Run deterministic cleanup at most once per interval. */
const CLEANUP_INTERVAL_MS = 30_000;
/** Hard cap to prevent unbounded memory growth under high-cardinality traffic. */
const MAX_BUCKETS = 10_000;
function createRateLimitMiddleware({ windowMs, maxRequests }) {
    const buckets = new Map();
    let lastCleanupMs = 0;
    function cleanupExpired(now) {
        for (const [ip, entry] of buckets) {
            if (entry.resetAtMs <= now) {
                buckets.delete(ip);
            }
        }
    }
    function evictOldestBucket() {
        let oldestKey = null;
        let oldestResetAt = Number.POSITIVE_INFINITY;
        for (const [ip, entry] of buckets) {
            if (entry.resetAtMs < oldestResetAt) {
                oldestResetAt = entry.resetAtMs;
                oldestKey = ip;
            }
        }
        if (oldestKey) {
            buckets.delete(oldestKey);
        }
    }
    return (req, res, next) => {
        if (req.path === paths_js_1.HEALTH_PATH) {
            next();
            return;
        }
        const now = Date.now();
        // Deterministic cleanup to keep memory bounded.
        if (now - lastCleanupMs >= CLEANUP_INTERVAL_MS || buckets.size >= MAX_BUCKETS) {
            cleanupExpired(now);
            lastCleanupMs = now;
        }
        // SC-02: Always use socket address for rate limiting. req.ip trusts
        // X-Forwarded-For when trust-proxy is enabled, allowing bypass.
        const ip = req.socket.remoteAddress || 'unknown';
        const existing = buckets.get(ip);
        // If we're at capacity and this is a new key, evict the oldest bucket.
        if (!existing && buckets.size >= MAX_BUCKETS) {
            evictOldestBucket();
        }
        if (!existing || existing.resetAtMs <= now) {
            buckets.set(ip, { count: 1, resetAtMs: now + windowMs });
            next();
            return;
        }
        existing.count += 1;
        buckets.set(ip, existing);
        if (existing.count > maxRequests) {
            const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAtMs - now) / 1000));
            res.setHeader('Retry-After', String(retryAfterSeconds));
            res.status(429).json({ error: 'Too many requests' });
            return;
        }
        next();
    };
}
