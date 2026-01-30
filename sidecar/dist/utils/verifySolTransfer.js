"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySolTransferFromParsedTransaction = verifySolTransferFromParsedTransaction;
function isRecord(value) {
    return !!value && typeof value === 'object';
}
function isSystemTransferInstruction(ix) {
    if (!isRecord(ix))
        return false;
    if (ix.program !== 'system')
        return false;
    const parsed = ix.parsed;
    if (!isRecord(parsed))
        return false;
    if (parsed.type !== 'transfer')
        return false;
    const info = parsed.info;
    if (!isRecord(info))
        return false;
    if (typeof info.source !== 'string')
        return false;
    if (typeof info.destination !== 'string')
        return false;
    const lamports = info.lamports;
    if (!(typeof lamports === 'number' || typeof lamports === 'string'))
        return false;
    return true;
}
function toLamports(value) {
    const n = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(n) || n <= 0) {
        throw new Error('Invalid lamports value');
    }
    return Math.floor(n);
}
/**
 * Verify a finalized SOL transfer using a parsed Solana transaction.
 *
 * This is used to prove a claimed tx signature:
 * - exists and succeeded
 * - includes a SystemProgram transfer
 * - moves lamports from expected source (optional) to expected destination
 */
function verifySolTransferFromParsedTransaction(tx, params) {
    if (!tx) {
        throw new Error('Transaction not found');
    }
    if (tx.meta?.err) {
        throw new Error('Transaction failed');
    }
    const { signature, expectedDestination, expectedSource, minLamports } = params;
    const instructions = tx.transaction.message.instructions;
    let observedLamports = 0;
    let matchedSource = '';
    for (const ix of instructions) {
        if (!isSystemTransferInstruction(ix))
            continue;
        const source = ix.parsed.info.source;
        const destination = ix.parsed.info.destination;
        if (destination !== expectedDestination)
            continue;
        if (expectedSource && source !== expectedSource)
            continue;
        observedLamports += toLamports(ix.parsed.info.lamports);
        if (!matchedSource)
            matchedSource = source;
    }
    if (observedLamports <= 0) {
        throw new Error('No matching SOL transfer found');
    }
    if (minLamports !== undefined && observedLamports < minLamports) {
        throw new Error('Transfer amount below minimum');
    }
    return {
        signature,
        observedLamports,
        source: expectedSource ?? matchedSource,
        destination: expectedDestination,
    };
}
