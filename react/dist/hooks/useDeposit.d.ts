import { UseDepositReturn } from '../types/deposit';
export type { UseDepositReturn } from '../types/deposit';
/**
 * Hook for Privacy Cash deposit operations
 *
 * Deposits go to the user's Privacy Cash account (user's pubkey is owner).
 * Credits are issued immediately, withdrawal to company wallet happens later.
 *
 * Requirements:
 * - User must have SSS wallet enrolled
 * - Wallet must be unlocked (call POST /wallet/unlock first)
 * - Wallet must be in "no recovery" mode
 *
 * Safe to call outside CedrosLoginProvider - returns no-op functions that throw.
 */
export declare function useDeposit(): UseDepositReturn;
