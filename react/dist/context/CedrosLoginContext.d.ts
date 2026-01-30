import { CedrosLoginConfig, AuthUser, AuthState, AuthError, TokenPair } from '../types';
/**
 * Internal helpers for auth hooks (not part of public API)
 */
export interface CedrosLoginInternalAPI {
    handleLoginSuccess: (user: AuthUser, tokens?: TokenPair) => void;
    getAccessToken: () => string | null;
}
/**
 * Context value provided by CedrosLoginProvider
 */
export interface CedrosLoginContextValue {
    config: CedrosLoginConfig;
    user: AuthUser | null;
    authState: AuthState;
    error: AuthError | null;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    _internal?: CedrosLoginInternalAPI;
}
export declare const CedrosLoginContext: import('react').Context<CedrosLoginContextValue | null>;
