import { useCallback, useState } from "react";
import { useProviderAuthApi } from "../context/ApiServicesContext";
import type { AuthError, LoginAttemptResponse } from "../types";
import { useCedrosLogin } from "../context/CedrosLoginProvider";

export interface UseSolanaAuthReturn {
  signIn: (
    walletAddress: string,
    signature: string,
    nonce: string,
  ) => Promise<LoginAttemptResponse>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

export function useSolanaAuth(): UseSolanaAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { login: contextLogin } = useCedrosLogin();
  const authApi = useProviderAuthApi();

  const signIn = useCallback(
    async (
      walletAddress: string,
      signature: string,
      nonce: string,
    ): Promise<LoginAttemptResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.solanaSignIn({
          walletAddress,
          signature,
          nonce,
        });
        if (!("mfaRequired" in response) && response.tokens && response.user) {
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
    [authApi, contextLogin],
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
