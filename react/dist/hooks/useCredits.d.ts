import { UseCreditsReturn } from '../types/deposit';
export type { UseCreditsReturn } from '../types/deposit';
/**
 * Hook for credit balance and transaction history
 *
 * Credits represent the user's balance from Privacy Cash deposits.
 * The balance can be used for services within the application.
 *
 * Safe to call outside CedrosLoginProvider - returns no-op functions that throw.
 */
export declare function useCredits(): UseCreditsReturn;
