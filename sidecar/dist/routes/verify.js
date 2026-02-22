"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVerifyRoutes = createVerifyRoutes;
const express_1 = require("express");
const bs58_1 = __importDefault(require("bs58"));
const verifySolTransfer_js_1 = require("../utils/verifySolTransfer.js");
/** SC-05: Validate a string is a valid base58-encoded 32-byte Solana public key. */
function isValidBase58Pubkey(value) {
    try {
        const decoded = bs58_1.default.decode(value);
        return decoded.length === 32;
    }
    catch {
        return false;
    }
}
/**
 * SC-14: Validate a string is a plausible base58-encoded Solana transaction signature.
 * A Solana signature is 64 bytes; base58-encoded it is 87-88 characters.
 * Only base58 alphabet characters are accepted.
 */
const BASE58_SIGNATURE_RE = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
function isValidBase58Signature(value) {
    return BASE58_SIGNATURE_RE.test(value);
}
function createVerifyRoutes(solanaService) {
    const router = (0, express_1.Router)();
    router.post('/verify/sol-transfer', async (req, res) => {
        try {
            const body = req.body;
            if (!body || typeof body.signature !== 'string') {
                return res.status(400).json({ error: 'Missing signature' });
            }
            if (!isValidBase58Signature(body.signature)) {
                return res.status(400).json({ error: 'Invalid signature: must be a base58-encoded Solana transaction signature' });
            }
            if (typeof body.expectedDestination !== 'string' || body.expectedDestination.length === 0) {
                return res.status(400).json({ error: 'Missing expectedDestination' });
            }
            if (!isValidBase58Pubkey(body.expectedDestination)) {
                return res.status(400).json({ error: 'Invalid expectedDestination: must be a valid base58 Solana public key' });
            }
            if (body.expectedSource !== undefined && typeof body.expectedSource !== 'string') {
                return res.status(400).json({ error: 'Invalid expectedSource' });
            }
            if (body.minLamports !== undefined && typeof body.minLamports !== 'number') {
                return res.status(400).json({ error: 'Invalid minLamports' });
            }
            const connection = solanaService.getConnection();
            const tx = await connection.getParsedTransaction(body.signature, {
                commitment: 'finalized',
                maxSupportedTransactionVersion: 0,
            });
            const result = (0, verifySolTransfer_js_1.verifySolTransferFromParsedTransaction)(tx, {
                signature: body.signature,
                expectedSource: body.expectedSource,
                expectedDestination: body.expectedDestination,
                minLamports: body.minLamports,
            });
            return res.json({
                ok: true,
                signature: result.signature,
                observedLamports: result.observedLamports,
                source: result.source,
                destination: result.destination,
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Verification failed';
            return res.status(400).json({ error: message });
        }
    });
    return router;
}
