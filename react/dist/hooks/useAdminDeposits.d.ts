import { UseAdminDepositsReturn } from '../types/deposit';
export type { UseAdminDepositsReturn } from '../types/deposit';
/**
 * Hook for admin Privacy Cash deposit operations
 *
 * Requires system admin privileges. All methods will fail with 403 if not admin.
 *
 * Safe to call outside CedrosLoginProvider - returns no-op functions that throw.
 */
export declare function useAdminDeposits(): UseAdminDepositsReturn;
