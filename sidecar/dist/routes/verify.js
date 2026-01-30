"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVerifyRoutes = createVerifyRoutes;
const express_1 = require("express");
const verifySolTransfer_js_1 = require("../utils/verifySolTransfer.js");
function createVerifyRoutes(solanaService) {
    const router = (0, express_1.Router)();
    router.post('/verify/sol-transfer', async (req, res) => {
        try {
            const body = req.body;
            if (!body || typeof body.signature !== 'string') {
                return res.status(400).json({ error: 'Missing signature' });
            }
            if (typeof body.expectedDestination !== 'string' || body.expectedDestination.length === 0) {
                return res.status(400).json({ error: 'Missing expectedDestination' });
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
