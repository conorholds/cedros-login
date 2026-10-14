import { useExternalEffect } from './effects';
import { useState, useCallback, useMemo, useRef } from 'react';
import type { Session, AuthError, RevokeAllSessionsResponse } from '../types';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { SessionApiClient } from '../utils/sessionApi';
import { handleApiError } from '../utils/apiClient';

export interface UseSessionsReturn {
  /** List of active sessions */
  sessions: Session[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: AuthError | null;
  /** Fetch/refresh sessions list */
  fetchSessions: () => Promise<void>;
  /** Revoke all other sessions, keeping the current session signed in. */
  revokeAllSessions: () => Promise<RevokeAllSessionsResponse>;
  /** Number of other active sessions (excluding current) */
  otherSessionCount: number;
}

interface SessionState {
  scope: object;
  sessions: Session[];
  isLoading: boolean;
  error: AuthError | null;
}

/**
 * Hook for managing active sign-in sessions.
 *
 * @example
 * ```tsx
 * function SessionManager() {
 *   const { sessions, isLoading, revokeAllSessions, otherSessionCount } = useSessions();
 *
 *   return (
 *     <div>
 *       <h3>Active Sessions ({sessions.length})</h3>
 *       <ul>
 *         {sessions.map(session => (
 *           <li key={session.id}>
 *             {session.userAgent}
 *             {session.isCurrent && ' (current)'}
 *           </li>
 *         ))}
 *       </ul>
 *       {otherSessionCount > 0 && (
 *         <button onClick={revokeAllSessions}>
 *           Sign out of {otherSessionCount} other session(s)
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

export function useSessions(): UseSessionsReturn {
  const { config, authState, user, _internal } = useCedrosLogin();
  const getAccessToken = _internal?.getAccessToken;
  const apiClient = useMemo(
    () =>
      new SessionApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, getAccessToken]
  );
  const scope = useMemo(
    () => ({ apiClient, authState, userId: user?.id }),
    [apiClient, authState, user?.id]
  );
  const authenticated = authState === 'authenticated' && !!user?.id;
  const [state, setState] = useState<SessionState>({
    scope,
    sessions: [],
    isLoading: authenticated,
    error: null,
  });
  const activeScope = useRef<object | null>(null);
  const requestIdRef = useRef(0);
  const mutationRef = useRef<Promise<RevokeAllSessionsResponse> | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!authenticated || activeScope.current !== scope || mutationRef.current) return;
    const requestId = ++requestIdRef.current;
    setState((previous) => ({ ...previous, isLoading: true, error: null }));
    try {
      const sessions = await apiClient.listSessions(true);
      if (requestId === requestIdRef.current && activeScope.current === scope) {
        setState({ scope, sessions, isLoading: false, error: null });
      }
    } catch (err) {
      if (requestId === requestIdRef.current && activeScope.current === scope) {
        setState((previous) => ({
          ...previous,
          isLoading: false,
          error: handleApiError(err, 'Failed to load sessions'),
        }));
      }
    }
  }, [authenticated, apiClient, scope]);

  useExternalEffect(() => {
    activeScope.current = scope;
    mutationRef.current = null;
    setState({ scope, sessions: [], isLoading: authenticated, error: null });
    void fetchSessions();
    const refreshVisible = () => {
      if (document.visibilityState === 'visible') void fetchSessions();
    };
    window.addEventListener('focus', refreshVisible);
    document.addEventListener('visibilitychange', refreshVisible);
    return () => {
      activeScope.current = null;
      requestIdRef.current += 1;
      window.removeEventListener('focus', refreshVisible);
      document.removeEventListener('visibilitychange', refreshVisible);
    };
  }, [scope, authenticated, fetchSessions]);

  const revokeAllSessions = useCallback((): Promise<RevokeAllSessionsResponse> => {
    if (!authenticated || activeScope.current !== scope) {
      return Promise.reject({ code: 'UNAUTHORIZED', message: 'Sign in again to manage sessions.' });
    }
    if (mutationRef.current) return mutationRef.current;
    // Invalidate reads started before this mutation; they must not restore revoked rows.
    requestIdRef.current += 1;
    setState((previous) => ({ ...previous, isLoading: true, error: null }));
    const ensureActive = () => {
      if (activeScope.current !== scope)
        throw new Error('Session owner changed during the request');
    };
    const operation = (async () => {
      try {
        const result = await apiClient.revokeAllSessions();
        ensureActive();
        setState((previous) => ({
          ...previous,
          sessions: previous.sessions.filter((session) => session.isCurrent),
        }));
        try {
          const sessions = await apiClient.listSessions(true);
          ensureActive();
          setState({ scope, sessions, isLoading: false, error: null });
        } catch (err) {
          ensureActive();
          setState((previous) => ({
            ...previous,
            error: {
              ...handleApiError(err, 'Failed to refresh sessions'),
              message:
                'Other sessions were signed out, but the updated list could not be loaded. Refresh sessions to try again.',
            },
          }));
        }
        return result;
      } catch (err) {
        if (activeScope.current === scope) {
          setState((previous) => ({
            ...previous,
            error: handleApiError(err, 'Failed to sign out of other sessions'),
          }));
        }
        throw err;
      } finally {
        if (activeScope.current === scope) {
          mutationRef.current = null;
          setState((previous) => ({ ...previous, isLoading: false }));
        }
      }
    })();
    mutationRef.current = operation;
    return operation;
  }, [authenticated, apiClient, scope]);

  const sessions = state.scope === scope ? state.sessions : [];
  return {
    sessions,
    isLoading: state.scope === scope ? state.isLoading : authenticated,
    error: state.scope === scope ? state.error : null,
    fetchSessions,
    revokeAllSessions,
    otherSessionCount: sessions.filter((session) => !session.isCurrent).length,
  };
}
