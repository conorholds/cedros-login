import { useCedrosLogin } from "../context/CedrosLoginProvider";
import type { AuthUser, TokenPair } from "../types";

export interface UseAuthReturn {
  login: (user: AuthUser, tokens?: TokenPair) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
}

export function useAuth(): UseAuthReturn {
  const context = useCedrosLogin();

  return {
    login: context.login,
    logout: context.logout,
    refreshUser: context.refreshUser,
    getAccessToken: context.getAccessToken,
  };
}
