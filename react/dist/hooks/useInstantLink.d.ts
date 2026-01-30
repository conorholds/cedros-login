import { AuthError, AuthResponse, MfaRequiredResponse } from '../types';
export interface UseInstantLinkReturn {
    /** Send an instant link email to the given address */
    sendInstantLink: (email: string) => Promise<void>;
    /** Verify an instant link token and sign in */
    verifyInstantLink: (token: string) => Promise<AuthResponse | MfaRequiredResponse>;
    /** Whether a request is in progress */
    isLoading: boolean;
    /** Whether the instant link was sent successfully */
    isSuccess: boolean;
    /** Error from the last request */
    error: AuthError | null;
    /** Clear the error state */
    clearError: () => void;
    /** Reset to initial state */
    reset: () => void;
    /** Number of remaining attempts before rate limiting */
    remainingAttempts: number;
}
/**
 * Hook for instant link (passwordless) authentication.
 *
 * Sends an instant link email that allows the user to sign in
 * without entering their password.
 *
 * @example
 * ```tsx
 * function InstantLinkForm() {
 *   const { sendInstantLink, isLoading, isSuccess, error } = useInstantLink();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     await sendInstantLink(email);
 *   };
 *
 *   if (isSuccess) {
 *     return <p>Check your email for the sign-in link</p>;
 *   }
 * }
 * ```
 */
export declare function useInstantLink(): UseInstantLinkReturn;
