"use strict";
/**
 * Withdrawal endpoints for withdrawing from user's Privacy Cash to company wallet
 *
 * POST /withdraw - Withdraw from a user's Privacy Cash account to company wallet
 * POST /withdraw/balance - Get a user's private balance in Privacy Cash
 *
 * Architecture:
 * - Withdrawal requires user's keypair (reconstructed from stored shares)
 * - Funds go from user's Privacy Cash account to company wallet
 * - This is the second half of the privacy flow (deposit → wait → withdraw)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWithdrawRoutes = createWithdrawRoutes;
const express_1 = require("express");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
function createWithdrawRoutes(privacyCash, _jupiter) {
    const router = (0, express_1.Router)();
    /**
     * POST /withdraw
     *
     * Withdraw funds from a user's Privacy Cash account to the company wallet.
     * This is called after the "privacy period" has elapsed.
     *
     * The user's keypair is reconstructed from stored SSS shares (Share A + Share B).
     * Funds are sent to the configured company wallet address.
     */
    router.post('/withdraw', async (req, res) => {
        try {
            const body = req.body;
            // Validate request
            if (!body.user_private_key || typeof body.user_private_key !== 'string') {
                res.status(400).json({ error: 'user_private_key is required and must be a base58 string' });
                return;
            }
            if (!body.amount_lamports || typeof body.amount_lamports !== 'number') {
                res.status(400).json({ error: 'amount_lamports is required and must be a number' });
                return;
            }
            if (body.amount_lamports <= 0) {
                res.status(400).json({ error: 'amount_lamports must be positive' });
                return;
            }
            // Decode the private key
            let userKeypair;
            try {
                const privateKeyBytes = bs58_1.default.decode(body.user_private_key);
                userKeypair = web3_js_1.Keypair.fromSecretKey(privateKeyBytes);
            }
            catch {
                res.status(400).json({ error: 'Invalid private key format' });
                return;
            }
            // Execute the withdrawal from user's account to company wallet
            const result = await privacyCash.withdrawFromUser(userKeypair, body.amount_lamports);
            // NOTE: Swap-on-withdraw is not supported.
            // The Privacy Cash withdrawal sends funds to the company wallet.
            // Swapping would require signing with the company/treasury key.
            const targetCurrency = body.target_currency?.toUpperCase() || 'SOL';
            if (targetCurrency !== 'SOL') {
                res.json({
                    success: result.success,
                    tx_signature: result.txSignature,
                    fee_lamports: result.feeLamports,
                    amount_lamports: result.amountLamports,
                    is_partial: result.isPartial,
                    swap_failed: true,
                    swap_error: 'Swap-on-withdraw is not supported; funds remain in SOL',
                    currency: 'SOL',
                });
                return;
            }
            // No swap needed - return SOL
            res.json({
                success: result.success,
                tx_signature: result.txSignature,
                fee_lamports: result.feeLamports,
                amount_lamports: result.amountLamports,
                is_partial: result.isPartial,
                currency: 'SOL',
            });
        }
        catch (error) {
            console.error('[Withdraw] Error:', error);
            res.status(500).json({
                error: 'Failed to withdraw funds',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    /**
     * POST /withdraw/balance
     *
     * Get a user's private balance in Privacy Cash.
     * Requires the user's keypair to decrypt UTXO data.
     *
     * Note: This is POST (not GET) because it requires a request body with the private key.
     */
    router.post('/withdraw/balance', async (req, res) => {
        try {
            const body = req.body;
            // Validate request
            if (!body.user_private_key || typeof body.user_private_key !== 'string') {
                res.status(400).json({ error: 'user_private_key is required and must be a base58 string' });
                return;
            }
            // Decode the private key
            let userKeypair;
            try {
                const privateKeyBytes = bs58_1.default.decode(body.user_private_key);
                userKeypair = web3_js_1.Keypair.fromSecretKey(privateKeyBytes);
            }
            catch {
                res.status(400).json({ error: 'Invalid private key format' });
                return;
            }
            const balanceLamports = await privacyCash.getUserPrivateBalance(userKeypair);
            res.json({
                balance_lamports: balanceLamports,
                balance_sol: balanceLamports / 1_000_000_000,
                user_pubkey: userKeypair.publicKey.toBase58(),
            });
        }
        catch (error) {
            console.error('[Withdraw/Balance] Error:', error);
            res.status(500).json({
                error: 'Failed to get private balance',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    return router;
}
