import { useCallback } from "react";
import type AuthApi from "../services/api/auth";
import type { AuthUser, TokenPair } from "../types";
import type { ProviderSessionControls } from "./providerSessionLifecycle";

const AUTH_USER_ENDPOINT = "/auth/user";

function useLogin(controls: ProviderSessionControls, authApi: AuthApi | null) {
  return useCallback(
    async (user: AuthUser, tokens?: TokenPair) => {
      controls.guard.invalidate();
      controls.setUser(user);
      controls.setIsLoading(false);
      controls.setError(null);
      if (!tokens) return;
      try {
        await authApi?.getTokenManager().setTokens(tokens);
      } catch {
        // The API may not be initialized during feature discovery.
      }
    },
    [authApi, controls],
  );
}

function useLogout(controls: ProviderSessionControls, authApi: AuthApi | null) {
  return useCallback(async () => {
    const version = controls.guard.nextVersion();
    const isActive = () => controls.guard.isCurrent(version);
    if (isActive()) controls.setIsLoading(true);
    let completed = false;
    try {
      if (!authApi) throw new Error("Provider auth client is unavailable");
      await authApi.logout();
      completed = true;
    } catch (cause) {
      if (isActive()) {
        controls.setError({
          code: "LOGOUT_FAILED",
          message: cause instanceof Error ? cause.message : "Logout failed",
        });
      }
    } finally {
      if (isActive()) {
        controls.setUser(null);
        controls.setIsLoading(false);
      }
    }
    if (completed && isActive()) controls.callbacksRef.current?.onLogout?.();
  }, [authApi, controls]);
}

function useRefreshUser(
  controls: ProviderSessionControls,
  authApi: AuthApi | null,
) {
  return useCallback(async () => {
    const version = controls.guard.nextVersion();
    const isActive = () => controls.guard.isCurrent(version);
    if (isActive()) controls.setIsLoading(true);
    try {
      if (!authApi) throw new Error("Provider auth client is unavailable");
      if (!authApi.getTokenManager().getAccessToken()) {
        if (isActive()) controls.setUser(null);
        return;
      }
      const response = await authApi.getRequest<{ user: AuthUser }>(
        AUTH_USER_ENDPOINT,
        { forceRefresh: true },
      );
      if (isActive()) controls.setUser(response.data.user ?? null);
    } catch (cause) {
      if (isActive()) {
        controls.setError({
          code: "REFRESH_FAILED",
          message:
            cause instanceof Error ? cause.message : "Failed to refresh user",
        });
      }
    } finally {
      if (isActive()) controls.setIsLoading(false);
    }
  }, [authApi, controls]);
}

function useAccessToken(authApi: AuthApi | null) {
  return useCallback(
    () => authApi?.getTokenManager().getAccessToken() ?? null,
    [authApi],
  );
}

export function useProviderSessionActions(
  controls: ProviderSessionControls,
  authApi: AuthApi | null,
) {
  return {
    login: useLogin(controls, authApi),
    logout: useLogout(controls, authApi),
    refreshUser: useRefreshUser(controls, authApi),
    getAccessToken: useAccessToken(authApi),
    clearError: useCallback(() => controls.setError(null), [controls]),
  };
}
