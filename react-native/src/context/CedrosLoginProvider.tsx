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
  FeatureFlags,
  AuthUser,
  AuthError,
  TokenPair,
} from "../types";
import { initializeApiServices, getAuthApi } from "../services/api";
import { TokenManager } from "../utils/tokenManager";
import { useAutoFeatures } from "../hooks/useAutoFeatures";

export const AUTH_USER_ENDPOINT = "/auth/user";

export interface CedrosLoginContextValue {
  config: CedrosLoginConfig;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (
    user: AuthUser,
    tokens?: { accessToken: string; refreshToken: string; expiresIn: number },
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
  clearError: () => void;
}

const CedrosLoginContext = createContext<CedrosLoginContextValue | null>(null);

/**
 * Config prop type for `<CedrosLoginProvider>`.
 *
 * The `features` field also accepts `'auto'` to fetch enabled auth methods
 * and client IDs from the server at startup.
 */
export type CedrosLoginProviderConfig = Omit<CedrosLoginConfig, "features"> & {
  features?: FeatureFlags | "auto";
};

export interface CedrosLoginProviderProps {
  config: CedrosLoginProviderConfig;
  children: React.ReactNode;
}

export function CedrosLoginProvider({
  config,
  children,
}: CedrosLoginProviderProps): React.ReactElement {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Resolve features: 'auto' by fetching enabled methods from the server
  const isAutoFeatures = config.features === "auto";
  const {
    features: serverFeatures,
    googleClientId: serverGoogleClientId,
    appleClientId: serverAppleClientId,
    isLoading: featuresLoading,
  } = useAutoFeatures(config.serverUrl, isAutoFeatures, config.requestTimeout);

  // Build resolved config — replace 'auto' with fetched FeatureFlags,
  // and merge server-provided client IDs (explicit frontend config wins via ??).
  const resolvedConfig = useMemo((): CedrosLoginConfig => {
    if (!isAutoFeatures) return config as CedrosLoginConfig;
    if (!serverFeatures) return config as CedrosLoginConfig;
    return {
      ...config,
      features: serverFeatures,
      googleClientId: config.googleClientId ?? serverGoogleClientId,
      appleClientId: config.appleClientId ?? serverAppleClientId,
    } as CedrosLoginConfig;
  }, [
    config,
    isAutoFeatures,
    serverFeatures,
    serverGoogleClientId,
    serverAppleClientId,
  ]);

  useEffect(() => {
    const tokenManager = new TokenManager();
    initializeApiServices({
      config: resolvedConfig,
      tokenManager,
    });
    return () => {
      tokenManager.destroy();
    };
  }, [resolvedConfig]);

  const login = useCallback(async (newUser: AuthUser, tokens?: TokenPair) => {
    setUser(newUser);
    setError(null);

    if (tokens) {
      try {
        const authApi = getAuthApi();
        const tokenManager = authApi.getTokenManager();
        // F-23: Await token persistence to prevent data loss on crash/navigation
        await tokenManager.setTokens(tokens);
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
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const authApi = getAuthApi();
      const token = authApi.getTokenManager().getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const response = await authApi.getRequest<{ user: AuthUser }>(
        AUTH_USER_ENDPOINT,
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
      return authApi.getTokenManager().getAccessToken();
    } catch {
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      config: resolvedConfig,
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
      resolvedConfig,
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

  // Wait for server feature discovery before rendering children.
  if (isAutoFeatures && featuresLoading) return <>{null}</>;

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
