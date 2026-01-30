import { AuthResponse, AuthError } from '../types';
export interface UseAppleAuthReturn {
    signIn: () => Promise<AuthResponse>;
    isLoading: boolean;
    isInitialized: boolean;
    error: AuthError | null;
    clearError: () => void;
}
/**
 * Hook for Apple Sign In authentication.
 *
 * @example
 * ```tsx
 * function AppleButton() {
 *   const { signIn, isLoading, isInitialized, error } = useAppleAuth();
 *
 *   return (
 *     <button onClick={signIn} disabled={!isInitialized || isLoading}>
 *       {isLoading ? 'Signing in...' : 'Sign in with Apple'}
 *     </button>
 *   );
 * }
 * ```
 */
export declare function useAppleAuth(): UseAppleAuthReturn;
declare global {
    interface Window {
        AppleID?: {
            auth?: {
                init: (config: {
                    clientId: string;
                    scope: string;
                    redirectURI: string;
                    usePopup?: boolean;
                }) => void;
                signIn: () => Promise<{
                    authorization?: {
                        id_token?: string;
                        code?: string;
                    };
                    user?: {
                        email?: string;
                        name?: {
                            firstName?: string;
                            lastName?: string;
                        };
                    };
                }>;
            };
        };
    }
}
