import type { ParsedTransactionWithMeta } from '@solana/web3.js';
export type VerifySolTransferParams = {
    signature: string;
    expectedSource?: string;
    expectedDestination: string;
    minLamports?: number;
};
export type VerifySolTransferResult = {
    signature: string;
    observedLamports: number;
    source: string;
    destination: string;
};
/**
 * Verify a finalized SOL transfer using a parsed Solana transaction.
 *
 * This is used to prove a claimed tx signature:
 * - exists and succeeded
 * - includes a SystemProgram transfer
 * - moves lamports from expected source (optional) to expected destination
 */
export declare function verifySolTransferFromParsedTransaction(tx: ParsedTransactionWithMeta | null, params: VerifySolTransferParams): VerifySolTransferResult;
