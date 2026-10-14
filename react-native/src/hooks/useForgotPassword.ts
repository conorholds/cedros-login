import { useCallback, useState } from "react";
import { useProviderAuthApi } from "../context/ApiServicesContext";
import type { AuthError } from "../types";
import { validateEmail } from "../utils/validation";

export interface UseForgotPasswordReturn {
  forgotPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: AuthError | null;
  clearError: () => void;
  reset: () => void;
}

/**
 * Send a password reset email for the supplied address.
 *
 * Requires `CedrosLoginProvider` so the auth API client is initialized.
 */
export function useForgotPassword(): UseForgotPasswordReturn {
  const authApi = useProviderAuthApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const forgotPassword = useCallback(
    async (email: string): Promise<void> => {
      const normalizedEmail = email.trim();
      if (!validateEmail(normalizedEmail)) {
        const validationError: AuthError = {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address",
        };
        setError(validationError);
        setIsSuccess(false);
        throw validationError;
      }

      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        await authApi.forgotPassword(normalizedEmail);
        setIsSuccess(true);
      } catch (err) {
        const authError: AuthError =
          err instanceof Error
            ? { code: "UNKNOWN_ERROR", message: err.message }
            : {
                code: "UNKNOWN_ERROR",
                message: "Failed to send reset email. Please try again.",
              };
        setError(authError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [authApi],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  return {
    forgotPassword,
    isLoading,
    isSuccess,
    error,
    clearError,
    reset,
  };
}
