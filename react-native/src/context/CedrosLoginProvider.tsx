import React, { createContext, useContext, useMemo } from "react";
import { useAutoFeatures } from "../hooks/useAutoFeatures";
import type {
  AuthError,
  AuthUser,
  CedrosLoginConfig,
  FeatureFlags,
  TokenPair,
} from "../types";
import { ApiServicesProvider } from "./ApiServicesContext";
import { CedrosThemeProvider, type CedrosThemeOverrides } from "./ThemeContext";
import { useProviderApiServices } from "./useProviderApiServices";
import { useProviderSession } from "./useProviderSession";

export interface CedrosLoginContextValue {
  config: CedrosLoginConfig;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (user: AuthUser, tokens?: TokenPair) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
  clearError: () => void;
}

const CedrosLoginContext = createContext<CedrosLoginContextValue | null>(null);

/** Config accepted by CedrosLoginProvider, including server feature discovery. */
export type CedrosLoginProviderConfig = Omit<CedrosLoginConfig, "features"> & {
  features?: FeatureFlags | "auto";
};

export interface CedrosLoginProviderProps {
  config: CedrosLoginProviderConfig;
  /** Optional React Native theme overrides merged with the default theme. */
  themeOverrides?: CedrosThemeOverrides;
  children: React.ReactNode;
}

function useResolvedConfig(config: CedrosLoginProviderConfig): {
  config: CedrosLoginConfig;
  isLoading: boolean;
} {
  const isAuto = config.features === "auto";
  const {
    features,
    googleClientId,
    appleClientId,
    signupAvailability,
    isLoading,
  } = useAutoFeatures(config.serverUrl, isAuto, config.requestTimeout);
  const resolvedConfig = useMemo((): CedrosLoginConfig => {
    if (!isAuto || !features) return config as CedrosLoginConfig;
    return {
      ...config,
      features,
      googleClientId: config.googleClientId ?? googleClientId,
      appleClientId: config.appleClientId ?? appleClientId,
      signupAvailability: config.signupAvailability ?? signupAvailability,
    } as CedrosLoginConfig;
  }, [
    config,
    isAuto,
    features,
    googleClientId,
    appleClientId,
    signupAvailability,
  ]);

  return { config: resolvedConfig, isLoading: isAuto && isLoading };
}

export function CedrosLoginProvider({
  config,
  themeOverrides,
  children,
}: CedrosLoginProviderProps): React.ReactElement {
  const { config: resolvedConfig, isLoading: featuresLoading } =
    useResolvedConfig(config);

  const sessionReady = !featuresLoading;
  const services = useProviderApiServices(resolvedConfig, sessionReady);
  const session = useProviderSession(resolvedConfig, services, sessionReady);

  const value = useMemo(
    () => ({
      config: resolvedConfig,
      ...session,
      isAuthenticated: !!session.user,
    }),
    [resolvedConfig, session],
  );

  if (!sessionReady || !services) return <>{null}</>;
  return (
    <ApiServicesProvider services={services}>
      <CedrosThemeProvider overrides={themeOverrides}>
        <CedrosLoginContext.Provider value={value}>
          {children}
        </CedrosLoginContext.Provider>
      </CedrosThemeProvider>
    </ApiServicesProvider>
  );
}

export function useCedrosLogin(): CedrosLoginContextValue {
  const context = useContext(CedrosLoginContext);
  if (!context) {
    throw new Error("useCedrosLogin must be used within a CedrosLoginProvider");
  }
  return context;
}
