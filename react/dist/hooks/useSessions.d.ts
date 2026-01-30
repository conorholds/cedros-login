import { Session, AuthError, RevokeAllSessionsResponse } from '../types';
export interface UseSessionsReturn {
    /** List of active sessions */
    sessions: Session[];
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: AuthError | null;
    /** Fetch/refresh sessions list */
    fetchSessions: () => Promise<void>;
    /** Revoke all sessions (logout everywhere) */
    revokeAllSessions: () => Promise<RevokeAllSessionsResponse>;
    /** Number of other active sessions (excluding current) */
    otherSessionCount: number;
}
/**
 * Hook for managing user sessions across devices.
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
 *           Sign out of {otherSessionCount} other device(s)
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useSessions(): UseSessionsReturn;
