import { useExternalEffect } from './effects';
import { useState, useCallback, useRef, useMemo } from 'react';
import type { AuthUser, AuthState, TokenPair, SessionConfig, AuthCallbacks } from '../types';
import { TokenManager } from '../utils/tokenManager';
import { TabSync } from '../utils/tabSync';
import { getCsrfToken } from '../utils/csrf';
import { runSessionRefresh, runSingleFlightRefresh } from './sessionRefresh';

export interface UseAuthSessionOptions {
  serverUrl: string;
  session?: SessionConfig;
  callbacks?: AuthCallbacks;
  requestTimeoutMs?: number;
}

export interface UseAuthSessionReturn {
  user: AuthUser | null;
  authState: AuthState;
  handleLoginSuccess: (user: AuthUser, tokens?: TokenPair) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
}

function isValidUserResponse(data: unknown): data is { user: AuthUser } {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.user !== 'object' || obj.user === null) return false;
  const user = obj.user as Record<string, unknown>;
  return typeof user.id === 'string' && user.id.length > 0;
}

/**
 * Hook that manages authentication session state, token refresh, and tab sync.
 */
export function useAuthSession({
  serverUrl,
  session,
  callbacks,
  requestTimeoutMs,
}: UseAuthSessionOptions): UseAuthSessionReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authState, setAuthState] = useState<AuthState>('idle');

  const tokenManagerRef = useRef<TokenManager | null>(null);
  const tabSyncRef = useRef<TabSync | null>(null);
  const callbacksRef = useRef(callbacks);
  const isMountedRef = useRef(true);
  const generationRef = useRef(0);
  const loggingOutRef = useRef(false);
  const refreshInFlightRef = useRef<Promise<void> | null>(null);
  const refreshTokensRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const handleSessionExpiredRef = useRef<() => void>(() => {});

  useExternalEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useExternalEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      generationRef.current += 1;
    };
  }, []);

  const setUserIfMounted = useCallback((nextUser: AuthUser | null) => {
    if (isMountedRef.current) {
      setUser(nextUser);
    }
  }, []);

  const setAuthStateIfMounted = useCallback((nextState: AuthState) => {
    if (isMountedRef.current) {
      setAuthState(nextState);
    }
  }, []);

  const sessionConfig = useMemo(
    () => ({
      storage: session?.storage ?? 'cookie',
      autoRefresh: session?.autoRefresh ?? true,
      syncTabs: session?.syncTabs ?? true,
      persistKey: session?.persistKey,
      allowWebStorage: session?.allowWebStorage ?? false,
    }),
    [
      session?.storage,
      session?.autoRefresh,
      session?.syncTabs,
      session?.persistKey,
      session?.allowWebStorage,
    ]
  );

  useExternalEffect(() => {
    loggingOutRef.current = false;
    const manager = new TokenManager(sessionConfig.storage, sessionConfig.persistKey, {
      allowWebStorage: sessionConfig.allowWebStorage,
    });
    tokenManagerRef.current = manager;

    if (sessionConfig.autoRefresh) {
      manager.setRefreshCallback(() => refreshTokensRef.current());
    }
    manager.setSessionExpiredCallback(() => handleSessionExpiredRef.current());

    if (sessionConfig.syncTabs) {
      tabSyncRef.current = new TabSync(serverUrl);
    }

    return () => {
      generationRef.current += 1;
      manager.destroy();
      tokenManagerRef.current = null;
      tabSyncRef.current?.close();
    };
  }, [
    serverUrl,
    sessionConfig.storage,
    sessionConfig.syncTabs,
    sessionConfig.persistKey,
    sessionConfig.allowWebStorage,
    sessionConfig.autoRefresh,
  ]);

  const refreshTokens = useCallback(async (): Promise<void> => {
    if (loggingOutRef.current) return;
    const generation = generationRef.current;
    const manager = tokenManagerRef.current;
    await runSingleFlightRefresh(refreshInFlightRef, () =>
      runSessionRefresh({
        serverUrl,
        storage: sessionConfig.storage,
        persistKey: sessionConfig.persistKey,
        allowWebStorage: sessionConfig.allowWebStorage,
        requestTimeoutMs,
        tokenStore: {
          getRefreshToken: () => manager?.getRefreshToken() ?? null,
          setTokens: (tokens, expiresAt) => manager?.setTokens(tokens, expiresAt),
        },
        isCurrent: () =>
          isMountedRef.current && generationRef.current === generation && !loggingOutRef.current,
        onRefresh: () => tabSyncRef.current?.broadcastRefresh(),
      })
    );
  }, [
    serverUrl,
    sessionConfig.storage,
    sessionConfig.persistKey,
    sessionConfig.allowWebStorage,
    requestTimeoutMs,
  ]);

  const getAuthHeaders = useCallback((): Record<string, string> | undefined => {
    if (sessionConfig.storage === 'cookie') return undefined;
    const accessToken = tokenManagerRef.current?.getAccessToken();
    if (!accessToken) return undefined;
    return { Authorization: `Bearer ${accessToken}` };
  }, [sessionConfig.storage]);

  const handleSessionExpired = useCallback(() => {
    generationRef.current += 1;
    tokenManagerRef.current?.clear();
    setUserIfMounted(null);
    setAuthStateIfMounted('unauthenticated');
    callbacksRef.current?.onSessionExpired?.();
  }, [setAuthStateIfMounted, setUserIfMounted]);

  // Keep refs in sync with latest callback versions
  refreshTokensRef.current = refreshTokens;
  handleSessionExpiredRef.current = handleSessionExpired;

  // Helper to build fetch options with timeout + CSRF
  const fetchWithTimeoutAndCsrf = useCallback(
    (url: string): { promise: Promise<Response>; cleanup: () => void } => {
      const controller = new AbortController();
      const timeoutMs = requestTimeoutMs ?? 10_000;
      const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
      const headers: Record<string, string> = {};
      const authHeaders = getAuthHeaders();
      if (authHeaders) Object.assign(headers, authHeaders);
      const csrfToken = getCsrfToken();
      if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

      return {
        promise: fetch(url, {
          credentials: 'include',
          headers: Object.keys(headers).length > 0 ? headers : undefined,
          signal: controller.signal,
        }),
        cleanup: () => window.clearTimeout(timeoutId),
      };
    },
    [getAuthHeaders, requestTimeoutMs]
  );

  const refreshUser = useCallback(async () => {
    if (loggingOutRef.current) return;
    const generation = generationRef.current;
    const isCurrent = () =>
      isMountedRef.current && generationRef.current === generation && !loggingOutRef.current;
    const req = fetchWithTimeoutAndCsrf(`${serverUrl}/user`);
    try {
      const response = await req.promise;
      if (!isCurrent()) return;

      if (response.ok) {
        const data = await response.json();
        if (isValidUserResponse(data)) {
          if (!isCurrent()) return;
          setUserIfMounted(data.user);
          setAuthStateIfMounted('authenticated');
          return;
        }
      }

      if (response.status === 401 && sessionConfig.autoRefresh) {
        try {
          await refreshTokens();
        } catch {
          if (!isCurrent()) return;
          handleSessionExpired();
          return;
        }
        if (!isCurrent()) return;
        const retry = fetchWithTimeoutAndCsrf(`${serverUrl}/user`);
        try {
          const retryResponse = await retry.promise;
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            if (isValidUserResponse(data)) {
              if (!isCurrent()) return;
              setUserIfMounted(data.user);
              setAuthStateIfMounted('authenticated');
              return;
            }
          }
        } finally {
          retry.cleanup();
        }
      }

      if (!isCurrent()) return;
      setUserIfMounted(null);
      setAuthStateIfMounted('unauthenticated');
    } catch {
      // On network/unexpected error, clear user and mark unauthenticated
      if (!isCurrent()) return;
      setUserIfMounted(null);
      setAuthStateIfMounted('unauthenticated');
    } finally {
      req.cleanup();
    }
  }, [
    serverUrl,
    sessionConfig.autoRefresh,
    refreshTokens,
    fetchWithTimeoutAndCsrf,
    handleSessionExpired,
    setAuthStateIfMounted,
    setUserIfMounted,
  ]);

  useExternalEffect(() => {
    if (!tabSyncRef.current || !sessionConfig.syncTabs) return;

    tabSyncRef.current.setCallback((event) => {
      switch (event.type) {
        case 'login':
          generationRef.current += 1;
          loggingOutRef.current = false;
          void refreshUser();
          break;
        case 'logout':
          generationRef.current += 1;
          setUserIfMounted(null);
          setAuthStateIfMounted('unauthenticated');
          tokenManagerRef.current?.clear();
          break;
        case 'refresh':
          refreshUser();
          break;
        default: {
          // Exhaustiveness check - TypeScript will error if a new event type is added
          const _exhaustiveCheck: never = event;
          console.warn('[Cedros Login] Unhandled tab sync event:', _exhaustiveCheck);
        }
      }
    });
  }, [sessionConfig.syncTabs, refreshUser, setAuthStateIfMounted, setUserIfMounted]);

  useExternalEffect(() => {
    const controller = new AbortController();
    // UI-TIMEOUT: Add timeout to session check fetch (default 10s, same as refresh)
    const timeoutMs = requestTimeoutMs ?? 10_000;
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    let active = true;
    const generation = generationRef.current;
    const isCurrent = () =>
      isMountedRef.current &&
      active &&
      generationRef.current === generation &&
      !loggingOutRef.current;
    const checkSession = async () => {
      setAuthStateIfMounted('loading');
      try {
        const response = await fetch(`${serverUrl}/user`, {
          credentials: 'include',
          headers: getAuthHeaders(),
          signal: controller.signal,
        });

        if (!isCurrent()) return;
        if (response.ok) {
          const data = await response.json();
          if (isValidUserResponse(data)) {
            if (!isCurrent()) return;
            setUserIfMounted(data.user);
            setAuthStateIfMounted('authenticated');
            return;
          }
        }

        if (response.status === 401 && sessionConfig.autoRefresh) {
          try {
            await refreshTokens();
          } catch {
            if (!isCurrent()) return;
            handleSessionExpired();
            return;
          }
          if (!isCurrent()) return;
          const retryResponse = await fetch(`${serverUrl}/user`, {
            credentials: 'include',
            headers: getAuthHeaders(),
            signal: controller.signal,
          });
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            if (isValidUserResponse(data)) {
              if (!isCurrent()) return;
              setUserIfMounted(data.user);
              setAuthStateIfMounted('authenticated');
              return;
            }
          }
        }

        if (!isCurrent()) return;
        setUserIfMounted(null);
        setAuthStateIfMounted('unauthenticated');
      } catch {
        if (!isCurrent()) return;
        setUserIfMounted(null);
        setAuthStateIfMounted('unauthenticated');
      }
    };

    checkSession();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    serverUrl,
    sessionConfig.autoRefresh,
    refreshTokens,
    getAuthHeaders,
    handleSessionExpired,
    setAuthStateIfMounted,
    setUserIfMounted,
    requestTimeoutMs,
  ]);

  const handleLoginSuccess = useCallback(
    (authUser: AuthUser, tokens?: TokenPair) => {
      generationRef.current += 1;
      loggingOutRef.current = false;
      setUserIfMounted(authUser);
      setAuthStateIfMounted('authenticated');
      if (tokens) {
        tokenManagerRef.current?.setTokens(tokens);
      }
      // Guard broadcast with mounted check to avoid calling closed TabSync
      if (isMountedRef.current) {
        tabSyncRef.current?.broadcastLogin(authUser);
      }
    },
    [setUserIfMounted, setAuthStateIfMounted]
  );

  const logout = useCallback(async () => {
    loggingOutRef.current = true;
    generationRef.current += 1;
    const generation = generationRef.current;
    const authHeaders = getAuthHeaders();
    const refreshToken = tokenManagerRef.current?.getRefreshToken();
    tokenManagerRef.current?.clear();
    setUserIfMounted(null);
    setAuthStateIfMounted('unauthenticated');
    // Prefer clearing cookies after an in-flight response, but a suspended tab
    // holding the refresh lock must not block revocation indefinitely. Family
    // revocation also invalidates credentials from a late refresh response.
    const pendingRefresh = refreshInFlightRef.current;
    if (pendingRefresh) {
      let waitTimeout: number | undefined;
      try {
        await Promise.race([
          pendingRefresh.catch(() => {}),
          new Promise<void>((resolve) => {
            waitTimeout = window.setTimeout(resolve, requestTimeoutMs ?? 10_000);
          }),
        ]);
      } finally {
        window.clearTimeout(waitTimeout);
      }
    }
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs ?? 10_000);
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(`${serverUrl}/logout`, {
        method: 'POST',
        headers: {
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
          ...(authHeaders ?? {}),
          ...(refreshToken ? { 'Content-Type': 'application/json' } : {}),
        },
        body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
        credentials: 'include',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Session revocation failed');
      if (generationRef.current === generation) callbacksRef.current?.onLogout?.();
    } finally {
      window.clearTimeout(timeoutId);
      if (generationRef.current === generation) {
        tabSyncRef.current?.broadcastLogout();
      }
    }
  }, [serverUrl, getAuthHeaders, setUserIfMounted, setAuthStateIfMounted, requestTimeoutMs]);

  const getAccessToken = useCallback(() => {
    return tokenManagerRef.current?.getAccessToken() ?? null;
  }, []);

  return {
    user,
    authState,
    handleLoginSuccess,
    logout,
    refreshUser,
    getAccessToken,
  };
}
