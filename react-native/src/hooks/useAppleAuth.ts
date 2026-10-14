import { useCallback, useState } from "react";
import { useProviderAuthApi } from "../context/ApiServicesContext";
import type { AuthError, LoginAttemptResponse } from "../types";
import { useCedrosLogin } from "../context/CedrosLoginProvider";
import type { AppleSignInPayload } from "../utils/nativeAuthModules";

export type { AppleSignInPayload } from "../utils/nativeAuthModules";

export interface UseAppleAuthReturn {
  signIn: (request: AppleSignInPayload) => Promise<LoginAttemptResponse>;
  requestNonce: () => Promise<string>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

export function useAppleAuth(): UseAppleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { login: contextLogin } = useCedrosLogin();
  const authApi = useProviderAuthApi();

  const signIn = useCallback(
    async (request: AppleSignInPayload): Promise<LoginAttemptResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const fullName = request.fullName;
        const name = fullName
          ? [fullName.givenName, fullName.familyName]
              .filter(Boolean)
              .join(" ")
              .trim() || undefined
          : undefined;
        const response = await authApi.appleSignIn({
          idToken: request.idToken,
          authorizationCode: request.authorizationCode,
          nonce: request.nonce,
          name,
        });
        if (!("mfaRequired" in response) && response.tokens && response.user) {
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
    [authApi, contextLogin],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const requestNonce = useCallback(() => authApi.getAppleNonce(), [authApi]);

  return {
    signIn,
    requestNonce,
    isLoading,
    error,
    clearError,
  };
}
