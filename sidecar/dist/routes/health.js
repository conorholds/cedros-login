"use strict";
/**
 * Health check endpoint
 *
 * GET /health - Returns service health status
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHealthRoutes = createHealthRoutes;
const express_1 = require("express");
function createHealthRoutes(solana, privacyCash) {
    const router = (0, express_1.Router)();
    router.get('/health', async (_req, res) => {
        try {
            // SC-07: Timeout health probes to prevent /health from hanging
            const HEALTH_TIMEOUT_MS = 5_000;
            const withTimeout = (p, fallback) => Promise.race([p, new Promise((resolve) => setTimeout(() => resolve(fallback), HEALTH_TIMEOUT_MS))]);
            const rpcConnected = await withTimeout(solana.isConnected(), false);
            const sdkLoaded = await withTimeout(privacyCash.isLoaded(), false);
            const status = rpcConnected && sdkLoaded ? 'healthy' : 'degraded';
            res.json({
                status,
                timestamp: new Date().toISOString(),
                network: solana.getNetwork(),
                checks: {
                    rpc_connected: rpcConnected,
                    sdk_loaded: sdkLoaded,
                },
            });
        }
        catch (error) {
            console.error('[Health] Check failed:', error);
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    return router;
}
