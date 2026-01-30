import { WalletRecoveryMode } from '../types/wallet';
/** Return type for useWalletDiscovery hook */
export interface UseWalletDiscoveryReturn {
    /** Whether wallet feature is enabled on server */
    walletEnabled: boolean;
    /** Recovery mode: share_c_only or full_seed */
    recoveryMode: WalletRecoveryMode;
    /** Session unlock TTL in seconds */
    unlockTtlSeconds: number;
    /** Whether config is still loading */
    isLoading: boolean;
    /** Error message if fetch failed */
    error: string | null;
    /** Refetch the config */
    refetch: () => Promise<void>;
}
/**
 * Hook to fetch wallet discovery configuration from server
 *
 * Automatically fetches on mount and caches the result.
 * Default values are used if fetch fails or wallet is not enabled.
 * Returns defaults when used outside CedrosLoginProvider.
 */
export declare function useWalletDiscovery(): UseWalletDiscoveryReturn;
