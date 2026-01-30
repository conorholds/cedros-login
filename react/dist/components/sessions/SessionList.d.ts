import { Session, DisplayError } from '../../types';
export interface SessionListProps {
    /** List of active sessions */
    sessions: Session[];
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: DisplayError;
    /** Callback to revoke all other sessions */
    onRevokeAll?: () => Promise<void>;
    /** Additional CSS class */
    className?: string;
}
/**
 * Display active sessions and allow revoking all other sessions.
 *
 * @example
 * ```tsx
 * function SecuritySettings() {
 *   const { sessions, isLoading, error, revokeAllSessions } = useSessions();
 *
 *   return (
 *     <SessionList
 *       sessions={sessions}
 *       isLoading={isLoading}
 *       error={error?.message}
 *       onRevokeAll={revokeAllSessions}
 *     />
 *   );
 * }
 * ```
 */
export declare function SessionList({ sessions, isLoading, error, onRevokeAll, className, }: SessionListProps): import("react/jsx-runtime").JSX.Element;
