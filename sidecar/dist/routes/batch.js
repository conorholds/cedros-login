"use strict";
/**
 * Batch swap route for micro deposit batching
 *
 * POST /batch/swap - Swap SOL to output currency via Jupiter
 *
 * Used by the micro batch worker to convert accumulated SOL deposits
 * into the company's preferred currency (USDC/USDT).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBatchRouter = createBatchRouter;
const express_1 = require("express");
const jupiter_js_1 = require("../services/jupiter.js");
function createBatchRouter(config) {
    const router = (0, express_1.Router)();
    const jupiterService = new jupiter_js_1.JupiterService(config);
    /**
     * POST /batch/swap
     *
     * Swaps SOL from treasury wallet to output currency via Jupiter.
     * Used for batching micro deposits.
     */
    router.post('/swap', async (req, res) => {
        try {
            const body = req.body;
            // Validate request
            if (!body.privateKey || typeof body.privateKey !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Missing or invalid privateKey',
                });
            }
            if (!body.amountLamports || typeof body.amountLamports !== 'number' || body.amountLamports <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing or invalid amountLamports',
                });
            }
            if (!body.outputCurrency || !['USDC', 'USDT'].includes(body.outputCurrency.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'outputCurrency must be USDC or USDT',
                });
            }
            // Get output mint
            const outputMint = jupiter_js_1.JupiterService.getMintForCurrency(body.outputCurrency);
            if (!outputMint) {
                return res.status(400).json({
                    success: false,
                    error: `Unsupported output currency: ${body.outputCurrency}`,
                });
            }
            // Parse the keypair
            let keypair;
            try {
                keypair = jupiter_js_1.JupiterService.parseKeypair(body.privateKey);
            }
            catch (e) {
                console.error('[Batch] Failed to parse private key:', e);
                return res.status(400).json({
                    success: false,
                    error: 'Invalid private key format',
                });
            }
            console.log(`[Batch] Executing swap: ${body.amountLamports} lamports SOL -> ${body.outputCurrency}`);
            // Execute the swap
            const result = await jupiterService.swapFromSol(outputMint, body.amountLamports.toString(), keypair);
            if (!result.success) {
                console.error(`[Batch] Swap failed: ${result.error}`);
                return res.status(500).json({
                    success: false,
                    txSignature: result.txSignature || '',
                    inputLamports: body.amountLamports,
                    outputAmount: '0',
                    outputCurrency: body.outputCurrency.toUpperCase(),
                    error: result.error || 'Swap execution failed',
                });
            }
            console.log(`[Batch] Swap succeeded: signature=${result.txSignature}, output=${result.actualOutAmount || result.expectedOutAmount}`);
            const response = {
                success: true,
                txSignature: result.txSignature,
                inputLamports: body.amountLamports,
                outputAmount: result.actualOutAmount || result.expectedOutAmount,
                outputCurrency: body.outputCurrency.toUpperCase(),
            };
            return res.json(response);
        }
        catch (error) {
            console.error('[Batch] Unexpected error:', error);
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });
    return router;
}
