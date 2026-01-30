import { AuthResponse, AuthError } from '../types';
/** @internal */
export declare const _internalGoogleScriptLoader: {
    loading: boolean;
    loaded: boolean;
    error: Error | null;
    callbacks: Array<{
        resolve: () => void;
        reject: (err: Error) => void;
    }>;
    load(): Promise<void>;
    /**
     * Reset singleton state for test isolation (F-08)
     * @internal - Only use in test setup/teardown
     */
    _reset(): void;
};
export interface UseGoogleAuthReturn {
    signIn: () => Promise<AuthResponse>;
    isLoading: boolean;
    isInitialized: boolean;
    error: AuthError | null;
    clearError: () => void;
}
/**
 * Hook for Google OAuth authentication.
 *
 * @example
 * ```tsx
 * function GoogleButton() {
 *   const { signIn, isLoading, isInitialized, error } = useGoogleAuth();
 *
 *   return (
 *     <button onClick={signIn} disabled={!isInitialized || isLoading}>
 *       {isLoading ? 'Signing in...' : 'Sign in with Google'}
 *     </button>
 *   );
 * }
 * ```
 */
export declare function useGoogleAuth(): UseGoogleAuthReturn;
declare global {
    interface Window {
        google?: {
            accounts?: {
                id?: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: {
                            credential: string;
                        }) => void;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                    }) => void;
                    prompt: (callback: (notification: {
                        isNotDisplayed: () => boolean;
                        isSkippedMoment: () => boolean;
                        isDismissedMoment: () => boolean;
                        getMomentType: () => string;
                    }) => void) => void;
                    renderButton: (element: HTMLElement, config: object) => void;
                    disableAutoSelect: () => void;
                };
            };
        };
    }
}
