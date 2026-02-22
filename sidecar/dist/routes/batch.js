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
function createBatchRouter(jupiterService) {
    const router = (0, express_1.Router)();
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
            // SC-02: Use safe integer for max lamports (SOL total supply ~585M = 5.85e17 lamports)
            const MAX_LAMPORTS = 585_000_000_000_000_000;
            if (!body.amountLamports ||
                typeof body.amountLamports !== 'number' ||
                !Number.isFinite(body.amountLamports) ||
                !Number.isInteger(body.amountLamports) ||
                body.amountLamports <= 0 ||
                body.amountLamports > MAX_LAMPORTS) {
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
            catch {
                console.error('[Batch] Failed to parse private key');
                return res.status(400).json({
                    success: false,
                    error: 'Invalid private key format',
                });
            }
            console.log(`[Batch] Executing swap: ${body.amountLamports} lamports SOL -> ${body.outputCurrency}`);
            // Execute the swap — zero treasury key material immediately after use
            let result;
            try {
                result = await jupiterService.swapFromSol(outputMint, body.amountLamports.toString(), keypair);
            }
            finally {
                keypair.secretKey.fill(0);
            }
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
                error: 'Internal server error',
            });
        }
    });
    return router;
}
