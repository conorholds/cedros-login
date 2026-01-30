"use strict";
/**
 * Deposit endpoints for Privacy Cash deposits (SSS embedded wallets only)
 *
 * POST /deposit - Execute a deposit to the user's Privacy Cash account
 * POST /deposit/swap-and-deposit - Swap SPL token to SOL and deposit (gasless)
 *
 * Architecture:
 * - User's keypair is reconstructed server-side from SSS shares
 * - Deposit goes to user's Privacy Cash account (user's pubkey)
 * - Server stores Share B during privacy period for later withdrawal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDepositRoutes = createDepositRoutes;
const express_1 = require("express");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
function createDepositRoutes(privacyCash, jupiter) {
    const router = (0, express_1.Router)();
    /**
     * POST /deposit
     *
     * Execute a Privacy Cash deposit for an SSS embedded wallet.
     *
     * The deposit goes to the USER's Privacy Cash account (user's pubkey is owner).
     * This provides privacy because the subsequent withdrawal to company wallet
     * is unlinkable on-chain.
     *
     * Requirements:
     * - User must have no-recovery wallet (no Share C)
     * - Server temporarily stores Share B during privacy period
     */
    router.post('/deposit', async (req, res) => {
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
            // Execute the deposit to user's Privacy Cash account
            const result = await privacyCash.executeDeposit(userKeypair, body.amount_lamports);
            res.json({
                success: result.success,
                tx_signature: result.txSignature,
                user_pubkey: userKeypair.publicKey.toBase58(),
            });
        }
        catch (error) {
            console.error('[Deposit] Error:', error);
            res.status(500).json({
                error: 'Failed to execute deposit',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    /**
     * POST /deposit/swap-and-deposit
     *
     * Swap SPL token to SOL using Jupiter gasless swap, then deposit to Privacy Cash.
     *
     * This endpoint combines two operations:
     * 1. Gasless swap: SPL token → SOL (Jupiter pays gas fees)
     * 2. Privacy Cash deposit: SOL → user's Privacy Cash account
     *
     * Requirements:
     * - User wallet must have < 0.01 SOL (gasless requirement)
     * - Trade size must be > ~$10 USD (Jupiter minimum)
     * - User must have no-recovery wallet (no Share C)
     */
    router.post('/deposit/swap-and-deposit', async (req, res) => {
        try {
            const body = req.body;
            // Validate request
            if (!body.user_private_key || typeof body.user_private_key !== 'string') {
                res.status(400).json({ error: 'user_private_key is required and must be a base58 string' });
                return;
            }
            if (!body.input_mint || typeof body.input_mint !== 'string') {
                res.status(400).json({ error: 'input_mint is required and must be a string' });
                return;
            }
            if (!body.amount || typeof body.amount !== 'string') {
                res.status(400).json({ error: 'amount is required and must be a string' });
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
            const userPubkey = userKeypair.publicKey.toBase58();
            console.log(`[SwapAndDeposit] Starting for user: ${userPubkey}`);
            // Step 1: Execute gasless swap (SPL token → SOL)
            console.log(`[SwapAndDeposit] Swapping ${body.amount} of ${body.input_mint} to SOL`);
            const swapResult = await jupiter.swapToSol(body.input_mint, body.amount, userKeypair);
            if (!swapResult.success) {
                console.error(`[SwapAndDeposit] Swap failed: ${swapResult.error} (code: ${swapResult.errorCode})`);
                res.status(500).json({
                    error: 'Swap failed',
                    details: swapResult.error,
                    error_code: swapResult.errorCode,
                    swap_tx_signature: swapResult.txSignature || null,
                    gasless: swapResult.gasless,
                });
                return;
            }
            // Use actual output if available, otherwise expected
            const solAmount = swapResult.actualOutAmount || swapResult.expectedOutAmount;
            console.log(`[SwapAndDeposit] Swap succeeded: ${swapResult.txSignature}, got ${solAmount} lamports (gasless: ${swapResult.gasless})`);
            // Step 2: Execute Privacy Cash deposit with the swapped SOL
            const solAmountLamports = parseInt(solAmount, 10);
            console.log(`[SwapAndDeposit] Depositing ${solAmountLamports} lamports to Privacy Cash`);
            const depositResult = await privacyCash.executeDeposit(userKeypair, solAmountLamports);
            console.log(`[SwapAndDeposit] Deposit succeeded: ${depositResult.txSignature}`);
            res.json({
                success: true,
                swap_tx_signature: swapResult.txSignature,
                deposit_tx_signature: depositResult.txSignature,
                sol_amount_lamports: solAmountLamports,
                gasless: swapResult.gasless,
                // Return input (pre-swap) amount for crediting
                input_mint: body.input_mint,
                input_amount: body.amount,
                user_pubkey: userPubkey,
            });
        }
        catch (error) {
            console.error('[SwapAndDeposit] Error:', error);
            res.status(500).json({
                error: 'Failed to execute swap and deposit',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });
    return router;
}
