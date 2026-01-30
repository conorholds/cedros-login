import { Seed, ShamirShare } from './types';
/** Shamir threshold (minimum shares to reconstruct) */
export declare const SHAMIR_THRESHOLD = 2;
/** Total number of shares */
export declare const SHAMIR_TOTAL = 3;
/** Share identifiers */
export type ShareId = 'A' | 'B' | 'C';
/** Result of splitting a secret into shares */
export interface ShamirSplitResult {
    /** Share A (for password encryption) */
    shareA: ShamirShare;
    /** Share B (for device PRF encryption) */
    shareB: ShamirShare;
    /** Share C (for recovery phrase) */
    shareC: ShamirShare;
}
/**
 * Split a 16-byte seed into 3 shares using Shamir's Secret Sharing
 *
 * @param seed - 16-byte seed to split
 * @returns Three shares (any 2 can reconstruct the seed)
 */
export declare function splitSecret(seed: Seed): ShamirSplitResult;
/**
 * Combine 2 shares to reconstruct the original seed
 *
 * @param share1 - First share
 * @param share2 - Second share (must be different from first)
 * @returns Reconstructed 16-byte seed (MAINT-03: fixed from incorrect "32-byte")
 * @throws Error if shares are invalid or cannot reconstruct
 */
export declare function combineShares(share1: ShamirShare, share2: ShamirShare): Seed;
/**
 * Verify that shares can successfully reconstruct a seed
 *
 * @param share1 - First share
 * @param share2 - Second share
 * @param expectedSeed - Expected seed after reconstruction
 * @returns true if shares reconstruct to expected seed
 */
export declare function verifyShares(share1: ShamirShare, share2: ShamirShare, expectedSeed: Seed): boolean;
/**
 * Extract share index from a share (useful for debugging)
 *
 * @param share - Share to inspect
 * @returns Share index (1-based)
 */
export declare function getShareIndex(share: ShamirShare): number;
/**
 * Pad a Uint8Array to a specific length
 */
export declare function padToLength(data: Uint8Array, targetLength: number): Uint8Array;
