/**
 * Hook for pending wallet recovery management
 *
 * After wallet enrollment, if recovery mode is enabled, the server stores
 * recovery data temporarily. This hook fetches that data and allows the
 * user to acknowledge receipt (after which the data is deleted from server).
 */
export interface UsePendingRecoveryReturn {
    /** Whether there is pending recovery data */
    hasPendingRecovery: boolean;
    /** Recovery type: 'share_c' or 'full_seed' */
    recoveryType: string | null;
    /** Recovery phrase (base64-encoded seed) */
    recoveryPhrase: string | null;
    /** When the recovery data expires */
    expiresAt: Date | null;
    /** Fetch pending recovery data from server */
    fetchPendingRecovery: () => Promise<void>;
    /** Acknowledge that user has saved the recovery phrase (deletes from server) */
    acknowledgeRecovery: () => Promise<void>;
    /** Whether request is in progress */
    isLoading: boolean;
    /** Error from last request */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}
/**
 * Hook for managing pending wallet recovery data
 *
 * Use this after wallet enrollment to show the user their recovery phrase
 * and allow them to acknowledge receipt.
 */
export declare function usePendingRecovery(): UsePendingRecoveryReturn;
