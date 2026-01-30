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
            const rpcConnected = await solana.isConnected();
            const sdkLoaded = await privacyCash.isLoaded();
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
