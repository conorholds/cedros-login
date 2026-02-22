"use strict";
/**
 * Request correlation ID middleware.
 *
 * Propagates incoming X-Request-ID header from the Rust server,
 * or generates a new one if absent. Sets it on the response
 * and makes it available via `req.headers['x-request-id']`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestIdMiddleware = createRequestIdMiddleware;
const node_crypto_1 = require("node:crypto");
// F-25: UUID v4 format validation to prevent request ID spoofing
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function createRequestIdMiddleware() {
    return (req, res, next) => {
        const existing = req.headers['x-request-id'];
        // F-25: Only accept well-formed UUIDs; reject arbitrary strings
        const requestId = (typeof existing === 'string' && UUID_RE.test(existing))
            ? existing
            : (0, node_crypto_1.randomUUID)();
        // Ensure downstream code can read it from the request
        req.headers['x-request-id'] = requestId;
        // Echo back so callers can correlate
        res.setHeader('X-Request-ID', requestId);
        next();
    };
}
