import { AuthUser, AuthState, TokenPair, SessionConfig, AuthCallbacks } from '../types';
export interface UseAuthSessionOptions {
    serverUrl: string;
    session?: SessionConfig;
    callbacks?: AuthCallbacks;
    requestTimeoutMs?: number;
}
export interface UseAuthSessionReturn {
    user: AuthUser | null;
    authState: AuthState;
    handleLoginSuccess: (user: AuthUser, tokens?: TokenPair) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    getAccessToken: () => string | null;
}
/**
 * Hook that manages authentication session state, token refresh, and tab sync.
 */
export declare function useAuthSession({ serverUrl, session, callbacks, requestTimeoutMs, }: UseAuthSessionOptions): UseAuthSessionReturn;
