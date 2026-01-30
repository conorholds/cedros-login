import { UseWalletSigningReturn, UnlockCredential } from '../types/wallet';
/**
 * Hook for wallet transaction signing
 *
 * Usage:
 * ```tsx
 * const { signTransaction, isSigning, error } = useWalletSigning();
 *
 * // Sign with password
 * const signature = await signTransaction(txBytes, { type: 'password', password: 'xxx' });
 *
 * // Sign with PIN
 * const signature = await signTransaction(txBytes, { type: 'password', password: 'secret' });
 *
 * // Sign with passkey (PRF)
 * const signature = await signTransaction(txBytes, { type: 'prfOutput', prfOutput: 'base64...' });
 * ```
 */
export declare function useWalletSigning(): UseWalletSigningReturn;
/**
 * Helper hook to get PRF output for passkey signing
 *
 * This handles the WebAuthn PRF flow and returns a credential
 * that can be used with useWalletSigning.
 */
export declare function usePasskeySigning(): {
    getPasskeyCredential: () => Promise<UnlockCredential | null>;
    isAuthenticating: boolean;
    error: string | null;
    clearError: () => void;
};
