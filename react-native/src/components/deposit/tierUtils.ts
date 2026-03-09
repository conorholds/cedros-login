import type { DepositConfigResponse, DepositTier } from "../../types/deposit";

/**
 * Determine which tier an amount falls into.
 *
 * When private deposits are disabled (recovery mode), the 'private'
 * tier is unavailable and amounts that would qualify fall back to 'public'.
 */
export function getTierForAmount(
  usd: number,
  config: DepositConfigResponse,
): DepositTier {
  if (config.privateDepositsEnabled && usd >= config.privateMinUsd)
    return "private";
  if (usd >= config.publicMinUsd) return "public";
  return "sol_micro";
}
