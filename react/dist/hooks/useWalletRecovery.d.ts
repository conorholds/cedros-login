import { UseWalletRecoveryReturn } from '../types/wallet';
/**
 * Hook for wallet recovery
 *
 * Supports two recovery modes based on server config:
 * - full_seed: User enters the full 12-word seed phrase (portable)
 * - share_c_only: User enters 12-word Share C phrase, server provides Share B (app-locked)
 */
export declare function useWalletRecovery(): UseWalletRecoveryReturn;
