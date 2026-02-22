import { useCallback, useState } from "react";
import { getAuthApi } from "../services/api";
import type { AuthError, AuthResponse } from "../types";
import { useCedrosLogin } from "../context/CedrosLoginProvider";

export interface UseEmailAuthReturn {
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<AuthResponse>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

export function useEmailAuth(): UseEmailAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { login: contextLogin } = useCedrosLogin();

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAuthApi().login({ email, password });
        if (response.tokens && response.user) {
          contextLogin(response.user, response.tokens);
        }
        return response;
      } catch (err) {
        const authError: AuthError =
          err instanceof Error
            ? { code: "LOGIN_FAILED", message: err.message }
            : { code: "LOGIN_FAILED", message: "Login failed" };
        setError(authError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contextLogin],
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
        const response = await getAuthApi().register({
          email,
          password,
          name: name || "",
        });
        if (response.tokens && response.user) {
          contextLogin(response.user, response.tokens);
        }
        return response;
      } catch (err) {
        const authError: AuthError =
          err instanceof Error
            ? { code: "REGISTER_FAILED", message: err.message }
            : { code: "REGISTER_FAILED", message: "Registration failed" };
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
    login,
    register,
    isLoading,
    error,
    clearError,
  };
}
