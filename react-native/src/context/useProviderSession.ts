import { useMemo, useRef, useState } from "react";
import { useExternalEffect } from "../hooks/effects";
import type {
  AuthError,
  AuthUser,
  CedrosLoginConfig,
  TokenPair,
} from "../types";
import type { ApiServices } from "../services/api";
import { useProviderSessionActions } from "./providerSessionActions";
import {
  type ProviderSessionControls,
  useProviderMountedState,
  useSessionGuard,
  useSessionRestoration,
} from "./providerSessionLifecycle";

export interface ProviderSession {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthError | null;
  login: (user: AuthUser, tokens?: TokenPair) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
  clearError: () => void;
}

/** Own provider session state while delegating lifecycle and event operations. */
export function useProviderSession(
  config: CedrosLoginConfig,
  services: ApiServices | null,
  ready: boolean,
): ProviderSession {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const guard = useSessionGuard();
  const callbacksRef = useRef(config.callbacks);
  const controls = useMemo<ProviderSessionControls>(
    () => ({
      guard,
      callbacksRef,
      setUser,
      setIsLoading,
      setError,
    }),
    [guard],
  );

  useExternalEffect(() => {
    callbacksRef.current = config.callbacks;
  }, [config.callbacks]);
  useProviderMountedState(controls);
  useSessionRestoration(services, ready, controls);
  const actions = useProviderSessionActions(controls, services?.auth ?? null);
  return { user, isLoading, error, ...actions };
}
