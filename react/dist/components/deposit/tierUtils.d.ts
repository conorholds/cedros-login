import { DepositConfigResponse, DepositTier } from '../../types/deposit';
/**
 * Determine which tier an amount falls into
 *
 * When private deposits are disabled (recovery mode enabled), the 'private'
 * tier is not available and amounts that would qualify for it fall back to 'public'.
 */
export declare function getTierForAmount(usd: number, config: DepositConfigResponse): DepositTier;
