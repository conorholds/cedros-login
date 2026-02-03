import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type {
  CedrosLoginConfig,
  AuthUser,
  AuthError,
  TokenPair,
} from "../types";
import { initializeApiServices, getAuthApi } from "../services/api";
import { TokenManager } from "../utils/tokenManager";

export interface CedrosLoginContextValue {
  config: CedrosLoginConfig;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (
    user: AuthUser,
    tokens?: { accessToken: string; refreshToken: string; expiresIn: number },
  ) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
  clearError: () => void;
}

const CedrosLoginContext = createContext<CedrosLoginContextValue | null>(null);

export interface CedrosLoginProviderProps {
  config: CedrosLoginConfig;
  children: React.ReactNode;
}

export function CedrosLoginProvider({
  config,
  children,
}: CedrosLoginProviderProps): React.ReactElement {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const tokenManager = new TokenManager();
    initializeApiServices({
      config,
      tokenManager,
    });
  }, [config]);

  const login = useCallback((newUser: AuthUser, tokens?: TokenPair) => {
    setUser(newUser);
    setError(null);

    if (tokens) {
      try {
        const authApi = getAuthApi();
        const tokenManager = authApi["client"].getTokenManager();
        tokenManager.setTokens(tokens);
      } catch {
        // API not initialized yet
      }
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const authApi = getAuthApi();
      await authApi.logout();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError({ code: "LOGOUT_FAILED", message: errorMessage });
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const authApi = getAuthApi();
      const token = authApi["client"].getTokenManager().getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const response = await authApi["client"].get<{ user: AuthUser }>(
        "/auth/me",
      );
      if (response?.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh user";
      setError({ code: "REFRESH_FAILED", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAccessToken = useCallback((): string | null => {
    try {
      const authApi = getAuthApi();
      return authApi["client"].getTokenManager().getAccessToken();
    } catch {
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      config,
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      logout,
      refreshUser,
      getAccessToken,
      clearError,
    }),
    [
      config,
      user,
      isLoading,
      error,
      login,
      logout,
      refreshUser,
      getAccessToken,
      clearError,
    ],
  );

  return (
    <CedrosLoginContext.Provider value={value}>
      {children}
    </CedrosLoginContext.Provider>
  );
}

export function useCedrosLogin(): CedrosLoginContextValue {
  const context = useContext(CedrosLoginContext);
  if (!context) {
    throw new Error("useCedrosLogin must be used within a CedrosLoginProvider");
  }
  return context;
}
