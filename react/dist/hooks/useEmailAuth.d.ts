import { AuthResponse, AuthError } from '../types';
/** Result when MFA verification is required */
export interface MfaRequiredResult {
    mfaRequired: true;
    mfaToken: string;
    email: string;
    userId: string;
}
/** Result of successful login (no TOTP required or after TOTP verification) */
export interface LoginSuccessResult {
    mfaRequired: false;
    response: AuthResponse;
}
/** Union type for login result */
export type LoginResult = MfaRequiredResult | LoginSuccessResult;
export interface UseEmailAuthReturn {
    /** Login - may return mfaRequired if 2FA is enabled */
    login: (email: string, password: string) => Promise<LoginResult>;
    register: (email: string, password: string, name?: string) => Promise<AuthResponse>;
    isLoading: boolean;
    error: AuthError | null;
    clearError: () => void;
    /**
     * Number of remaining login attempts before rate limiting.
     *
     * M-10: Snapshot Behavior
     * This value is a point-in-time snapshot computed at render time.
     * It may be briefly stale during rapid requests or concurrent renders.
     * For UI display only - actual rate limiting is enforced inside login/register.
     */
    remainingAttempts: number;
    /**
     * Time in ms until rate limit resets (0 if not rate limited).
     *
     * M-10: Snapshot Behavior
     * This value is a point-in-time snapshot computed at render time.
     * It may be briefly stale - use for UI display, not for logic decisions.
     */
    timeUntilReset: number;
}
/**
 * Hook for email/password authentication.
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { login, isLoading, error } = useEmailAuth();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     try {
 *       await login(email, password);
 *     } catch (err) {
 *       // Handle error
 *     }
 *   };
 * }
 * ```
 */
export declare function useEmailAuth(): UseEmailAuthReturn;
