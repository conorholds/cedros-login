import { AuthError, AuthResponse, TotpVerifyState } from '../types';
export interface UseTotpVerifyReturn {
    /** Verification state */
    state: TotpVerifyState;
    /** Whether verification is in progress */
    isLoading: boolean;
    /** Error from the last request */
    error: AuthError | null;
    /** Verify MFA code during login */
    verifyTotp: (mfaToken: string, code: string) => Promise<AuthResponse>;
    /** Clear error state */
    clearError: () => void;
    /** Reset to initial state */
    reset: () => void;
    /** Number of remaining verification attempts before rate limiting */
    remainingAttempts: number;
    /** Time in ms until rate limit resets (0 if not rate limited) */
    timeUntilReset: number;
}
/**
 * Hook for verifying TOTP codes during the login flow.
 *
 * Used when a user has TOTP enabled and needs to provide
 * their 6-digit code after password authentication.
 *
 * @example
 * ```tsx
 * function TotpVerifyStep({ mfaToken }) {
 *   const { verifyTotp, isLoading, error } = useTotpVerify();
 *
 *   const handleVerify = async (code: string) => {
 *     const response = await verifyTotp(mfaToken, code);
 *     // User is now authenticated
 *   };
 * }
 * ```
 */
export declare function useTotpVerify(): UseTotpVerifyReturn;
