"use strict";
/**
 * User withdrawal transfer endpoints
 *
 * POST /transfer/sol      - Transfer SOL from user wallet to external address
 * POST /transfer/spl      - Transfer SPL tokens from user wallet to external address
 * POST /transfer/balances - Get all token balances for a wallet address
 *
 * These routes are called by the Rust backend after authenticating the user
 * and reconstructing their private key from Shamir shares.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnsignedIntegerString = isUnsignedIntegerString;
exports.createTransferRoutes = createTransferRoutes;
const express_1 = require("express");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
function isUnsignedIntegerString(value) {
    return /^[0-9]+$/.test(value);
}
function isValidBase58Pubkey(value) {
    try {
        const decoded = bs58_1.default.decode(value);
        return decoded.length === 32;
    }
    catch {
        return false;
    }
}
function createTransferRoutes(solanaService) {
    const router = (0, express_1.Router)();
    /**
     * POST /transfer/sol
     *
     * Transfer SOL from the user's embedded wallet to an external address.
     */
    router.post('/transfer/sol', async (req, res) => {
        try {
            const body = req.body;
            // Validate private key
            if (!body.user_private_key || typeof body.user_private_key !== 'string') {
                res.status(400).json({ error: 'user_private_key is required and must be a base58 string' });
                return;
            }
            // Validate destination
            if (!body.destination || typeof body.destination !== 'string') {
                res.status(400).json({ error: 'destination is required and must be a base58 string' });
                return;
            }
            if (!isValidBase58Pubkey(body.destination)) {
                res.status(400).json({ error: 'destination is not a valid Solana address' });
                return;
            }
            // Validate amount
            if (body.amount_lamports === undefined ||
                typeof body.amount_lamports !== 'number' ||
                !Number.isFinite(body.amount_lamports)) {
                res.status(400).json({ error: 'amount_lamports is required and must be a finite number' });
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
            try {
                const destination = new web3_js_1.PublicKey(body.destination);
                const txSignature = await solanaService.transferSol(userKeypair, destination, body.amount_lamports);
                const fee = await solanaService.getTransactionFee(txSignature);
                res.json({
                    success: true,
                    tx_signature: txSignature,
                    fee_lamports: fee,
                });
            }
            finally {
                // S-02r: Zero out secret key material and drop reference.
                // Note: The base58 string in body cannot be wiped (JS strings are immutable).
                userKeypair.secretKey.fill(0);
                userKeypair = null;
            }
        }
        catch (error) {
            console.error('[Transfer/SOL] Error:', error);
            res.status(500).json({
                error: 'Failed to transfer SOL',
            });
        }
    });
    /**
     * POST /transfer/spl
     *
     * Transfer SPL tokens from the user's embedded wallet to an external address.
     * Any valid SPL token mint is accepted — no whitelist restriction.
     */
    router.post('/transfer/spl', async (req, res) => {
        try {
            const body = req.body;
            // Validate private key
            if (!body.user_private_key || typeof body.user_private_key !== 'string') {
                res.status(400).json({ error: 'user_private_key is required and must be a base58 string' });
                return;
            }
            // Validate destination
            if (!body.destination || typeof body.destination !== 'string') {
                res.status(400).json({ error: 'destination is required and must be a base58 string' });
                return;
            }
            if (!isValidBase58Pubkey(body.destination)) {
                res.status(400).json({ error: 'destination is not a valid Solana address' });
                return;
            }
            // Validate token mint (must be a valid pubkey, no whitelist)
            if (!body.token_mint || typeof body.token_mint !== 'string') {
                res.status(400).json({ error: 'token_mint is required' });
                return;
            }
            if (!isValidBase58Pubkey(body.token_mint)) {
                res.status(400).json({ error: 'token_mint is not a valid Solana address' });
                return;
            }
            // Validate amount
            if (!body.amount || typeof body.amount !== 'string') {
                res.status(400).json({ error: 'amount is required and must be a string' });
                return;
            }
            if (!isUnsignedIntegerString(body.amount)) {
                res.status(400).json({ error: 'amount must be an unsigned integer string' });
                return;
            }
            const amountBigInt = BigInt(body.amount);
            if (amountBigInt <= 0n) {
                res.status(400).json({ error: 'amount must be positive' });
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
            try {
                const destination = new web3_js_1.PublicKey(body.destination);
                const mint = new web3_js_1.PublicKey(body.token_mint);
                const txSignature = await solanaService.transferSplToken(userKeypair, destination, mint, amountBigInt);
                const fee = await solanaService.getTransactionFee(txSignature);
                res.json({
                    success: true,
                    tx_signature: txSignature,
                    fee_lamports: fee,
                });
            }
            finally {
                userKeypair.secretKey.fill(0);
                userKeypair = null;
            }
        }
        catch (error) {
            console.error('[Transfer/SPL] Error:', error);
            res.status(500).json({
                error: 'Failed to transfer SPL token',
            });
        }
    });
    /**
     * POST /transfer/balances
     *
     * Get SOL balance + all SPL token holdings for a wallet address.
     * Only returns tokens with non-zero balances.
     */
    router.post('/transfer/balances', async (req, res) => {
        try {
            const body = req.body;
            if (!body.wallet_address || typeof body.wallet_address !== 'string') {
                res.status(400).json({ error: 'wallet_address is required' });
                return;
            }
            if (!isValidBase58Pubkey(body.wallet_address)) {
                res.status(400).json({ error: 'wallet_address is not a valid Solana address' });
                return;
            }
            const pubkey = new web3_js_1.PublicKey(body.wallet_address);
            const balances = await solanaService.getTokenBalances(pubkey);
            res.json(balances);
        }
        catch (error) {
            console.error('[Transfer/Balances] Error:', error);
            res.status(500).json({
                error: 'Failed to fetch token balances',
            });
        }
    });
    return router;
}
