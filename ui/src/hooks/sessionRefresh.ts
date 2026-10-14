import type { SessionStorage, TokenPair } from '../types';
import { getCsrfToken } from '../utils/csrf';

const REFRESH_LOCK_NAME = 'cedros-login:refresh';
const DEFAULT_TOKEN_STORAGE_KEY = 'cedros_tokens';

interface StoredTokenData {
  tokens: TokenPair;
  expiresAt: number;
}

interface RefreshTokenStore {
  getRefreshToken: () => string | null;
  setTokens: (tokens: TokenPair, expiresAt?: number) => void;
}

interface SessionRefreshOptions {
  serverUrl: string;
  storage: SessionStorage;
  persistKey?: string;
  allowWebStorage: boolean;
  requestTimeoutMs?: number;
  tokenStore: RefreshTokenStore;
  onRefresh?: () => void;
  isCurrent?: () => boolean;
}

interface ExecuteRefreshOptions {
  probeCookieSession: boolean;
  reconcileTokenStorage: boolean;
}

interface RefreshInFlightRef {
  current: Promise<void> | null;
}

interface DeferredPromise {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
}

/**
 * Refreshes the current session, optionally coordinated by Web Locks.
 *
 * Inputs are the server URL, session storage mode, token store accessors, and
 * timeout. Resolves after a successful refresh or a locked-cookie probe that
 * proves another tab already refreshed. Throws when the refresh endpoint fails,
 * returns invalid token data, or token storage mode receives no replacement
 * tokens. Token-storage reconciliation must run inside the Web Lock before any
 * refresh POST so stale refresh tokens are not replayed by queued tabs.
 */
export async function runSessionRefresh(options: SessionRefreshOptions): Promise<void> {
  const lockManager = getLockManager();

  if (lockManager) {
    let callbackStarted = false;
    try {
      await lockManager.request(REFRESH_LOCK_NAME, () => {
        callbackStarted = true;
        return executeRefresh(options, {
          probeCookieSession: true,
          reconcileTokenStorage: true,
        });
      });
      return;
    } catch (error) {
      // Browsers can expose navigator.locks while denying lock acquisition in
      // the current context. Only fall back when the callback never ran; a
      // refresh failure inside the lock must still reach the caller.
      if (callbackStarted) throw error;
    }
  }

  await executeRefresh(options, {
    probeCookieSession: false,
    reconcileTokenStorage: false,
  });
}

/**
 * Runs refresh work as a same-hook single flight.
 *
 * The in-flight ref is assigned synchronously before any awaited work, so two
 * same-tab callers cannot both enter the refresh path. It resolves/rejects with
 * the refresh callback and always clears the ref after the settled result is
 * observed.
 */
export async function runSingleFlightRefresh(
  inFlightRef: RefreshInFlightRef,
  refresh: () => Promise<void>
): Promise<void> {
  if (inFlightRef.current) {
    return inFlightRef.current;
  }

  const deferred = createDeferredPromise();
  inFlightRef.current = deferred.promise;

  const refreshPromise = Promise.resolve()
    .then(refresh)
    .then(deferred.resolve, (error: unknown) => {
      deferred.reject(error);
      throw error;
    });
  refreshPromise.catch(() => {});

  try {
    await deferred.promise;
  } finally {
    inFlightRef.current = null;
  }
}

function createDeferredPromise(): DeferredPromise {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function getLockManager(): LockManager | null {
  if (typeof navigator === 'undefined') return null;
  return typeof navigator.locks?.request === 'function' ? navigator.locks : null;
}

async function executeRefresh(
  options: SessionRefreshOptions,
  executeOptions: ExecuteRefreshOptions
): Promise<void> {
  const controller = new AbortController();
  const timeoutMs = options.requestTimeoutMs ?? 10_000;
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (options.isCurrent?.() === false) return;
    if (
      executeOptions.probeCookieSession &&
      options.storage === 'cookie' &&
      (await hasActiveCookieSession(options.serverUrl, controller.signal))
    ) {
      return;
    }

    if (options.isCurrent?.() === false) return;
    if (executeOptions.reconcileTokenStorage && reconcileStoredTokens(options)) {
      return;
    }

    await postRefresh(options, controller.signal);
    if (options.isCurrent?.() !== false) options.onRefresh?.();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function hasActiveCookieSession(serverUrl: string, signal: AbortSignal): Promise<boolean> {
  try {
    const probe = await fetch(`${serverUrl}/user`, {
      credentials: 'include',
      signal,
    });
    return probe.ok;
  } catch {
    return false;
  }
}

function reconcileStoredTokens(options: SessionRefreshOptions): boolean {
  const storedTokens = readStoredTokens(options);
  if (!storedTokens) return false;

  const refreshToken = options.tokenStore.getRefreshToken();
  if (storedTokens.tokens.refreshToken === refreshToken) return false;

  options.tokenStore.setTokens(storedTokens.tokens, storedTokens.expiresAt);
  return true;
}

async function postRefresh(options: SessionRefreshOptions, signal: AbortSignal): Promise<void> {
  const refreshToken = options.tokenStore.getRefreshToken();
  const response = await fetch(`${options.serverUrl}/refresh`, {
    method: 'POST',
    headers: buildRefreshHeaders(refreshToken),
    credentials: 'include',
    body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
    signal,
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  await applyRefreshResponse(options, response);
}

function buildRefreshHeaders(refreshToken: string | null): Record<string, string> | undefined {
  const headers: Record<string, string> = {};
  const csrfToken = getCsrfToken();

  if (refreshToken) {
    headers['Content-Type'] = 'application/json';
  }
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  return Object.keys(headers).length > 0 ? headers : undefined;
}

async function applyRefreshResponse(
  options: SessionRefreshOptions,
  response: Response
): Promise<void> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    // JSON parser errors can quote response text containing bearer credentials.
    throw new Error('Invalid token response structure');
  }
  if (options.isCurrent?.() === false) return;
  const tokens = isRecord(data) ? data.tokens : undefined;

  if (tokens) {
    if (!isValidTokenResponse(tokens)) {
      throw new Error('Invalid token response structure');
    }
    options.tokenStore.setTokens(tokens);
    return;
  }

  if (options.storage !== 'cookie') {
    throw new Error('Token refresh failed');
  }
}

function readStoredTokens(options: SessionRefreshOptions): StoredTokenData | null {
  const storage = getPersistentStorage(options.storage, options.allowWebStorage);
  if (!storage) return null;

  try {
    const raw = storage.getItem(options.persistKey ?? DEFAULT_TOKEN_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isStoredTokenData(parsed) || parsed.expiresAt <= Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    console.warn('[Cedros Login] Unable to read token storage before refresh');
    return null;
  }
}

function getPersistentStorage(storage: SessionStorage, allowWebStorage: boolean): Storage | null {
  if (!allowWebStorage || typeof window === 'undefined') return null;
  if (storage === 'localStorage') return window.localStorage;
  if (storage === 'sessionStorage') return window.sessionStorage;
  return null;
}

function isStoredTokenData(data: unknown): data is StoredTokenData {
  return (
    isRecord(data) &&
    typeof data.expiresAt === 'number' &&
    Number.isFinite(data.expiresAt) &&
    isValidTokenResponse(data.tokens)
  );
}

function isValidTokenResponse(tokens: unknown): tokens is TokenPair {
  if (!isRecord(tokens)) return false;
  return (
    typeof tokens.accessToken === 'string' &&
    tokens.accessToken.length > 0 &&
    typeof tokens.refreshToken === 'string' &&
    tokens.refreshToken.length > 0 &&
    typeof tokens.expiresIn === 'number' &&
    Number.isFinite(tokens.expiresIn) &&
    tokens.expiresIn > 0
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
