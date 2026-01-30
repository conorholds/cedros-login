"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimitMiddleware = createRateLimitMiddleware;
function createRateLimitMiddleware({ windowMs, maxRequests }) {
    const buckets = new Map();
    return (req, res, next) => {
        if (req.path === '/health') {
            next();
            return;
        }
        const now = Date.now();
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const existing = buckets.get(ip);
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
