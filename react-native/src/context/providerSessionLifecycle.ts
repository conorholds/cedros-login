import {
  useMemo,
  useRef,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { useExternalEffect } from "../hooks/effects";
import type { ApiServices } from "../services/api";
import type { AuthCallbacks, AuthError, AuthUser } from "../types";
import { restorePersistedSession } from "./sessionRestoration";

export interface ProviderSessionControls {
  guard: SessionGuard;
  callbacksRef: MutableRefObject<AuthCallbacks | undefined>;
  setUser: Dispatch<SetStateAction<AuthUser | null>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<AuthError | null>>;
}

export interface SessionGuard {
  mount: () => void;
  unmount: () => void;
  nextVersion: () => number;
  invalidate: () => void;
  isCurrent: (version: number) => boolean;
  isMounted: () => boolean;
}

export function useSessionGuard(): SessionGuard {
  const versionRef = useRef(0);
  const mountedRef = useRef(true);
  return useMemo(
    () => ({
      mount: () => {
        mountedRef.current = true;
      },
      unmount: () => {
        mountedRef.current = false;
        versionRef.current += 1;
      },
      nextVersion: () => (versionRef.current += 1),
      invalidate: () => {
        versionRef.current += 1;
      },
      isCurrent: (version: number) =>
        mountedRef.current && versionRef.current === version,
      isMounted: () => mountedRef.current,
    }),
    [],
  );
}

export function useProviderMountedState(
  controls: ProviderSessionControls,
): void {
  useExternalEffect(() => {
    controls.guard.mount();
    return controls.guard.unmount;
  }, [controls]);
}

function startRestoration(
  services: ApiServices,
  controls: ProviderSessionControls,
): () => void {
  const version = controls.guard.nextVersion();
  let active = true;
  const isOwnerActive = () => active && controls.guard.isMounted();
  const isRestorationActive = () => active && controls.guard.isCurrent(version);
  const tokenManager = services.tokenManager;

  controls.setIsLoading(true);
  controls.setError(null);
  tokenManager.setSessionExpiredCallback(() => {
    if (!isOwnerActive()) return;
    controls.guard.invalidate();
    controls.setUser(null);
    controls.setIsLoading(false);
    controls.callbacksRef.current?.onSessionExpired?.();
  });
  void restorePersistedSession(services.auth, isRestorationActive)
    .then((user) => {
      if (isRestorationActive()) controls.setUser(user);
    })
    .catch((cause: unknown) => {
      if (!isRestorationActive()) return;
      controls.setUser(null);
      controls.setError({
        code: "REFRESH_FAILED",
        message:
          cause instanceof Error ? cause.message : "Failed to restore session",
      });
    })
    .finally(() => {
      if (isRestorationActive()) controls.setIsLoading(false);
    });

  return () => {
    active = false;
    if (controls.guard.isCurrent(version)) controls.guard.invalidate();
    tokenManager.destroy();
  };
}

export function useSessionRestoration(
  services: ApiServices | null,
  ready: boolean,
  controls: ProviderSessionControls,
): void {
  useExternalEffect(() => {
    if (!ready || !services) {
      controls.setIsLoading(true);
      return;
    }
    return startRestoration(services, controls);
  }, [controls, ready, services]);
}
