import { useCallback } from "react";
import { getAuthApi } from "../services/api";
import { useCedrosLogin } from "../context/CedrosLoginProvider";
import type { AuthUser, TokenPair, AuthError } from "../types";

export interface UseAuthReturn {
  login: (user: AuthUser, tokens?: TokenPair) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
}

export function useAuth(): UseAuthReturn {
  const context = useCedrosLogin();

  const logout = useCallback(async () => {
    try {
      if (getAuthApi) {
        await getAuthApi().logout();
      }
    } catch (err) {
      const authError: AuthError =
        err instanceof Error
          ? { code: "SERVER_ERROR", message: err.message }
          : { code: "SERVER_ERROR", message: "Logout failed" };
      throw authError;
    } finally {
      context.logout();
    }
  }, [context]);

  return {
    login: context.login,
    logout,
    refreshUser: context.refreshUser,
    getAccessToken: context.getAccessToken,
  };
}
