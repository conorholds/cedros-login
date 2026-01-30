import { UnlockCredential } from '../types/wallet';
/** Signing method in use */
export type SigningMethod = 'external' | 'sss' | 'none';
/** Options for external wallet signing */
export interface ExternalSignOptions {
    /**
     * Callback to sign transaction with external wallet adapter.
     * Only called when user has external Solana wallet.
     *
     * @param transaction - Transaction bytes to sign
     * @returns Signature bytes (64 bytes Ed25519)
     */
    onExternalSign?: (transaction: Uint8Array) => Promise<Uint8Array>;
}
/** Return type for useTransactionSigning hook */
export interface UseTransactionSigningReturn {
    /** Sign a transaction (routes to appropriate method) */
    signTransaction: (transaction: Uint8Array, credential?: UnlockCredential) => Promise<Uint8Array>;
    /** Which signing method is available */
    signingMethod: SigningMethod;
    /** Whether user can sign transactions */
    canSign: boolean;
    /** Whether signing is in progress */
    isSigning: boolean;
    /** Solana public key (from either wallet type) */
    publicKey: string | null;
    /** Whether user has external Solana wallet */
    hasExternalWallet: boolean;
    /** Whether SSS wallet is enrolled */
    hasSssWallet: boolean;
    /** Whether SSS wallet is unlocked (for session-based signing) */
    isSssUnlocked: boolean;
    /** Error from last signing attempt */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}
/**
 * Unified transaction signing hook
 *
 * Automatically routes signing requests to the appropriate method:
 * - External wallet: Uses provided callback
 * - SSS wallet: Uses server-side signing
 */
export declare function useTransactionSigning(options?: ExternalSignOptions): UseTransactionSigningReturn;
