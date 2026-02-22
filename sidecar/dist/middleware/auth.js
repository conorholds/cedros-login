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
const paths_js_1 = require("./paths.js");
/** Hash a key with SHA-256 so all comparisons use fixed-length buffers */
function hashKey(key) {
    return (0, crypto_1.createHash)('sha256').update(key).digest();
}
/**
 * Create auth middleware with the given API key.
 *
 * Both keys are SHA-256 hashed before comparison. This eliminates
 * the length-leak timing side-channel (S-03r) while keeping
 * constant-time equality via timingSafeEqual on fixed 32-byte digests.
 */
function createAuthMiddleware(apiKey) {
    const apiKeyHash = hashKey(apiKey);
    return (req, res, next) => {
        // Skip auth for health check
        if (req.path === paths_js_1.HEALTH_PATH) {
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
        const providedHash = hashKey(match[1]);
        // Constant-time comparison on fixed-length SHA-256 digests
        if (!(0, crypto_1.timingSafeEqual)(providedHash, apiKeyHash)) {
            res.status(401).json({ error: 'Invalid API key' });
            return;
        }
        next();
    };
}
