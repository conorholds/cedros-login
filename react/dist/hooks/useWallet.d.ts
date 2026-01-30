import { WalletContextValue } from '../types/wallet';
/**
 * Main wallet hook
 *
 * Provides wallet status, capabilities, and refresh functionality.
 * Distinguishes between external Solana wallet and SSS embedded wallet.
 *
 * Returns safe defaults when called outside CedrosLoginProvider.
 */
export declare function useWallet(): WalletContextValue;
