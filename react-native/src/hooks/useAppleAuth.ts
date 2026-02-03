import { useCallback, useState } from "react";
import { getAuthApi } from "../services/api";
import type { AuthError, AuthResponse } from "../types";
import { useCedrosLogin } from "../context/CedrosLoginProvider";

export interface UseAppleAuthReturn {
  signIn: (idToken: string) => Promise<AuthResponse>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

export function useAppleAuth(): UseAppleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { login: contextLogin } = useCedrosLogin();

  const signIn = useCallback(
    async (idToken: string): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAuthApi().appleSignIn({ idToken });
        if (response.tokens && response.user) {
          contextLogin(response.user, response.tokens);
        }
        return response;
      } catch (err) {
        const authError: AuthError =
          err instanceof Error
            ? { code: "INVALID_CREDENTIALS", message: err.message }
            : {
                code: "INVALID_CREDENTIALS",
                message: "Apple authentication failed",
              };
        setError(authError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contextLogin],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signIn,
    isLoading,
    error,
    clearError,
  };
}
