import { AuthError } from '../types';
export interface UsePasswordResetReturn {
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    isLoading: boolean;
    isSuccess: boolean;
    error: AuthError | null;
    clearError: () => void;
    reset: () => void;
    /** Number of remaining attempts before rate limiting */
    remainingAttempts: number;
}
/**
 * Hook for password reset functionality.
 *
 * @example
 * ```tsx
 * function ForgotPasswordForm() {
 *   const { forgotPassword, isLoading, isSuccess, error } = usePasswordReset();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     await forgotPassword(email);
 *   };
 *
 *   if (isSuccess) {
 *     return <p>Check your email for reset instructions</p>;
 *   }
 * }
 * ```
 */
export declare function usePasswordReset(): UsePasswordResetReturn;
