import { UseWalletMaterialReturn } from '../types/wallet';
/**
 * Hook for wallet material API operations
 *
 * Signing happens server-side: server stores Share A (encrypted) and Share B
 * (plaintext), combines shares JIT for signing, and wipes immediately after.
 *
 * Safe to call outside CedrosLoginProvider - returns no-op functions that throw.
 */
export declare function useWalletMaterial(): UseWalletMaterialReturn;
