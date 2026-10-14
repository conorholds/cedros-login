import { useCallback, useState } from "react";
import { useProviderAuthApi } from "../context/ApiServicesContext";
import type { AuthError, AuthResponse, LoginAttemptResponse } from "../types";
import { useCedrosLogin } from "../context/CedrosLoginProvider";

export interface UseEmailAuthReturn {
  login: (email: string, password: string) => Promise<LoginAttemptResponse>;
  completeMfa: (mfaToken: string, code: string) => Promise<AuthResponse>;
  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<AuthResponse>;
  resendVerificationEmail: (email: string) => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

/** True when account creation completed but the server intentionally withheld a session. */
export function isEmailVerificationPending(response: AuthResponse): boolean {
  return Boolean(
    response.user.email &&
    (response.emailQueued === true ||
      (response.user.emailVerified === false && response.tokens === undefined)),
  );
}

function authErrorFrom(
  cause: unknown,
  fallbackCode: AuthError["code"],
  fallback: string,
): AuthError {
  if (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    "message" in cause
  ) {
    return {
      code: cause.code as AuthError["code"],
      message: String(cause.message),
    };
  }
  return { code: fallbackCode, message: fallback };
}

export function useEmailAuth(): UseEmailAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { login: contextLogin } = useCedrosLogin();
  const authApi = useProviderAuthApi();

  const login = useCallback(
    async (email: string, password: string): Promise<LoginAttemptResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.login({ email, password });
        if (!("mfaRequired" in response) && response.tokens && response.user) {
          contextLogin(response.user, response.tokens);
        }
        return response;
      } catch (err) {
        const authError = authErrorFrom(err, "LOGIN_FAILED", "Login failed");
        setError(authError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [authApi, contextLogin],
  );

  const completeMfa = useCallback(
    async (mfaToken: string, code: string): Promise<AuthResponse> => {
      const response = await authApi.loginMfa({ mfaToken, code });
      if (response.tokens && response.user) {
        contextLogin(response.user, response.tokens);
      }
      return response;
    },
    [authApi, contextLogin],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name?: string,
    ): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authApi.register({
          email,
          password,
          name: name || "",
        });
        if (response.tokens && response.user) {
          contextLogin(response.user, response.tokens);
        }
        return response;
      } catch (err) {
        const authError = authErrorFrom(
          err,
          "REGISTER_FAILED",
          "Registration failed",
        );
        setError(authError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [authApi, contextLogin],
  );

  const resendVerificationEmail = useCallback(
    async (email: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await authApi.resendVerificationEmail(email);
      } catch (err) {
        const authError = authErrorFrom(
          err,
          "REGISTER_FAILED",
          "Unable to send verification email",
        );
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

  return {
    login,
    completeMfa,
    register,
    resendVerificationEmail,
    isLoading,
    error,
    clearError,
  };
}
