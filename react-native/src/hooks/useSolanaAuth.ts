import { useCallback, useState } from "react";
import { getAuthApi } from "../services/api";
import type { AuthError, AuthResponse } from "../types";
import { useCedrosLogin } from "../context/CedrosLoginProvider";

export interface UseSolanaAuthReturn {
  signIn: (
    walletAddress: string,
    signature: string,
    nonce: string,
  ) => Promise<AuthResponse>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

export function useSolanaAuth(): UseSolanaAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { login: contextLogin } = useCedrosLogin();

  const signIn = useCallback(
    async (
      walletAddress: string,
      signature: string,
      nonce: string,
    ): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAuthApi().solanaSignIn({
          walletAddress,
          signature,
          nonce,
        });
        if (response.tokens && response.user) {
          contextLogin(response.user, response.tokens);
        }
        return response;
      } catch (err) {
        const authError: AuthError =
          err instanceof Error
            ? { code: "INVALID_SIGNATURE", message: err.message }
            : {
                code: "INVALID_SIGNATURE",
                message: "Solana authentication failed",
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
