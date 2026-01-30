"use strict";
/**
 * API key authentication middleware
 *
 * All endpoints (except /health) require a valid API key in the Authorization header.
 * Format: Authorization: Bearer <api-key>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthMiddleware = createAuthMiddleware;
const crypto_1 = require("crypto");
/**
 * Create auth middleware with the given API key
 */
function createAuthMiddleware(apiKey) {
    const apiKeyBuffer = Buffer.from(apiKey);
    return (req, res, next) => {
        // Skip auth for health check
        if (req.path === '/health') {
            return next();
        }
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'Missing Authorization header' });
            return;
        }
        const match = authHeader.match(/^Bearer\s+(.+)$/i);
        if (!match) {
            res.status(401).json({ error: 'Invalid Authorization header format. Expected: Bearer <token>' });
            return;
        }
        const providedKey = match[1];
        const providedBuffer = Buffer.from(providedKey);
        // Timing-safe comparison to prevent timing attacks
        if (providedBuffer.length !== apiKeyBuffer.length ||
            !(0, crypto_1.timingSafeEqual)(providedBuffer, apiKeyBuffer)) {
            res.status(401).json({ error: 'Invalid API key' });
            return;
        }
        next();
    };
}
