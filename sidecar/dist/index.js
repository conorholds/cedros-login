"use strict";
/**
 * Cedros Login Sidecar
 *
 * A Node.js sidecar service used by the Rust backend. This wraps the Privacy Cash SDK
 * and provides related Solana utilities (verification, batching, swaps).
 * Required because the Privacy Cash SDK is JavaScript-only and requires Node.js 24+.
 *
 * Endpoints:
 * - GET  /health         - Health check (no auth required)
 * - POST /deposit/build  - Build unsigned deposit transaction
 * - POST /deposit/submit - Submit signed deposit transaction
 * - POST /withdraw       - Withdraw note to company wallet
 *
 * All endpoints except /health require Bearer token auth.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_js_1 = require("./config.js");
const auth_js_1 = require("./middleware/auth.js");
const rateLimit_js_1 = require("./middleware/rateLimit.js");
const solana_js_1 = require("./services/solana.js");
const privacy_cash_js_1 = require("./services/privacy-cash.js");
const jupiter_js_1 = require("./services/jupiter.js");
const health_js_1 = require("./routes/health.js");
const deposit_js_1 = require("./routes/deposit.js");
const withdraw_js_1 = require("./routes/withdraw.js");
const batch_js_1 = require("./routes/batch.js");
const verify_js_1 = require("./routes/verify.js");
const redactRpcUrl_js_1 = require("./utils/redactRpcUrl.js");
async function main() {
    console.log('[Sidecar] Starting Cedros login sidecar...');
    // Load configuration
    const config = (0, config_js_1.loadConfig)();
    console.log(`[Sidecar] Network: ${config.solanaNetwork}`);
    console.log(`[Sidecar] RPC: ${(0, redactRpcUrl_js_1.redactRpcUrl)(config.solanaRpcUrl)}`);
    console.log(`[Sidecar] Host: ${config.host}`);
    console.log(`[Sidecar] Port: ${config.port}`);
    // Initialize services
    const solanaService = new solana_js_1.SolanaService(config);
    const privacyCashService = new privacy_cash_js_1.PrivacyCashService(config, solanaService);
    const jupiterService = new jupiter_js_1.JupiterService(config);
    // Verify RPC connection
    const rpcConnected = await solanaService.isConnected();
    if (!rpcConnected) {
        console.error('[Sidecar] WARNING: Failed to connect to Solana RPC');
    }
    else {
        console.log('[Sidecar] Connected to Solana RPC');
    }
    // Create Express app
    const app = (0, express_1.default)();
    // Middleware
    app.use(express_1.default.json({ limit: '1mb' }));
    // SIDE-02: Basic in-memory rate limiting (protects sidecar from accidental overload)
    app.use((0, rateLimit_js_1.createRateLimitMiddleware)({ windowMs: 10_000, maxRequests: 200 }));
    // SIDE-02: Request timeout guard (best-effort)
    app.use((_req, res, next) => {
        res.setTimeout(30_000, () => {
            if (!res.headersSent) {
                res.status(503).json({ error: 'Request timeout' });
            }
        });
        next();
    });
    app.use((0, auth_js_1.createAuthMiddleware)(config.apiKey));
    // Request logging (simple, non-blocking)
    app.use((req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
    // Routes
    app.use((0, health_js_1.createHealthRoutes)(solanaService, privacyCashService));
    app.use((0, deposit_js_1.createDepositRoutes)(privacyCashService, jupiterService));
    app.use((0, withdraw_js_1.createWithdrawRoutes)(privacyCashService, jupiterService));
    app.use((0, verify_js_1.createVerifyRoutes)(solanaService));
    app.use('/batch', (0, batch_js_1.createBatchRouter)(config));
    // 404 handler
    app.use((_req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
    // Error handler
    app.use((err, _req, res, _next) => {
        console.error('[Sidecar] Unhandled error:', err);
        res.status(500).json({ error: 'Internal server error' });
    });
    // Start server
    const server = app.listen(config.port, config.host, () => {
        console.log(`[Sidecar] Server running on http://${config.host}:${config.port}`);
        console.log('[Sidecar] Ready to accept requests');
    });
    // SIDE-02: Tighten server-level timeouts (slowloris + hung sockets)
    server.keepAliveTimeout = 5_000;
    server.headersTimeout = 15_000;
    server.requestTimeout = 30_000;
}
main().catch((error) => {
    console.error('[Sidecar] Fatal error:', error);
    process.exit(1);
});
