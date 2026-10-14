import { useExternalEffect } from '../../hooks/effects';
import { useState, useCallback, useRef, useMemo, useId } from 'react';
import type { Session, DisplayError } from '../../types';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

export interface SessionListProps {
  /** List of active sessions */
  sessions: Session[];
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: DisplayError;
  /** Callback to revoke all other sessions */
  onRevokeAll?: () => Promise<void>;
  /** Reload sessions after a failure or an external sign-in change. */
  onRefresh?: () => Promise<void>;
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
export function SessionList({
  sessions,
  isLoading = false,
  error,
  onRevokeAll,
  onRefresh,
  className = '',
}: SessionListProps) {
  const { confirm, dialogProps } = useConfirmDialog();
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeSuccess, setRevokeSuccess] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const listId = useId();
  const mountedRef = useRef(false);
  const busyRef = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  const otherSessionCount = useMemo(() => sessions.filter((s) => !s.isCurrent).length, [sessions]);
  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent)),
    [sessions]
  );
  const visibleSessions = showAll ? sortedSessions : sortedSessions.slice(0, 3);

  const handleRevokeAll = useCallback(async () => {
    if (!onRevokeAll || busyRef.current || isLoading) return;

    const currentOtherCount = sessions.filter((s) => !s.isCurrent).length;
    if (currentOtherCount === 0) return;

    busyRef.current = true;
    const confirmed = await confirm({
      title: 'Sign out of all other sessions?',
      description:
        'Your current session will stay signed in. Other sessions will need to sign in again.',
      confirmLabel: 'Sign out',
      destructive: true,
    });
    if (!confirmed || !mountedRef.current) {
      busyRef.current = false;
      return;
    }

    setIsRevoking(true);
    setRevokeSuccess(false);
    setRevokeError(null);

    try {
      await onRevokeAll();
      if (mountedRef.current) setRevokeSuccess(true);
    } catch {
      if (mountedRef.current)
        setRevokeError('Could not sign out of other sessions. Please try again.');
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setIsRevoking(false);
    }
  }, [confirm, onRevokeAll, sessions, isLoading]);

  useExternalEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useExternalEffect(() => {
    if (revokeSuccess) successRef.current?.focus();
  }, [revokeSuccess]);

  const refreshControl = onRefresh && (
    <button
      type="button"
      className="cedros-button cedros-button-outline cedros-button-sm"
      disabled={isLoading || isRevoking}
      onClick={async () => {
        setRevokeError(null);
        setRevokeSuccess(false);
        try {
          await onRefresh();
        } catch {
          if (mountedRef.current) setRevokeError('Could not refresh sessions. Please try again.');
        }
      }}
    >
      {isLoading ? 'Refreshing…' : 'Refresh sessions'}
    </button>
  );

  if (isLoading && sessions.length === 0) {
    return (
      <div className={`cedros-session-list cedros-session-list-loading ${className}`}>
        <LoadingSpinner size="sm" />
        <span>Loading sessions…</span>
        <ConfirmDialog {...dialogProps} />
      </div>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <div className={`cedros-session-list ${className}`}>
        <ErrorMessage error={error} />
        {refreshControl}
        <ConfirmDialog {...dialogProps} />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className={`cedros-session-list cedros-session-list-empty ${className}`}>
        <p>No active sessions found.</p>
        {revokeError && <ErrorMessage error={revokeError} />}
        {refreshControl}
        <ConfirmDialog {...dialogProps} />
      </div>
    );
  }

  return (
    <div className={`cedros-session-list ${className}`} aria-busy={isLoading || isRevoking}>
      {(error || revokeError) && <ErrorMessage error={error || revokeError} />}
      {revokeSuccess && (
        <div ref={successRef} className="cedros-session-success" role="status" tabIndex={-1}>
          <CheckIcon />
          <span>All other sessions have been revoked.</span>
        </div>
      )}

      <ul id={listId} className="cedros-session-items">
        {visibleSessions.map((session) => (
          <SessionItem key={session.id} session={session} />
        ))}
      </ul>

      {sessions.length > 3 && (
        <button
          type="button"
          className="cedros-button cedros-button-ghost cedros-button-sm cedros-session-toggle"
          aria-expanded={showAll}
          aria-controls={listId}
          onClick={() => setShowAll((expanded) => !expanded)}
        >
          {showAll ? 'Show fewer sessions' : `Show all ${sessions.length} sessions`}
        </button>
      )}

      {(onRefresh || (onRevokeAll && otherSessionCount > 0)) && (
        <div className="cedros-session-actions">
          {refreshControl}
          {onRevokeAll && otherSessionCount > 0 && (
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-sm"
              onClick={handleRevokeAll}
              disabled={isRevoking || isLoading}
            >
              {isRevoking ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing out…</span>
                </>
              ) : (
                'Sign out of all other sessions'
              )}
            </button>
          )}
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

// Session item component
function SessionItem({ session }: { session: Session }) {
  const browserInfo = parseUserAgent(session.userAgent);
  const isExpiringSoon = isSessionExpiringSoon(session.expiresAt);

  return (
    <li className={`cedros-session-item ${session.isCurrent ? 'cedros-session-item-current' : ''}`}>
      <div className="cedros-session-item-icon">
        <DeviceIcon userAgent={session.userAgent} />
      </div>
      <div className="cedros-session-item-info">
        <div className="cedros-session-item-main">
          <span className="cedros-session-item-device">
            {browserInfo.browser} on {browserInfo.os}
          </span>
          {session.isCurrent && (
            <span className="cedros-session-current-badge">Current session</span>
          )}
        </div>
        <div className="cedros-session-item-meta">
          {session.ipAddress && (
            <span className="cedros-session-item-ip">IP: {session.ipAddress}</span>
          )}
          <span className="cedros-session-item-created">
            Started {formatRelativeTime(session.createdAt)}
          </span>
          {isExpiringSoon && <span className="cedros-session-expiring">Expires soon</span>}
        </div>
      </div>
    </li>
  );
}

// Helper functions
interface BrowserInfo {
  browser: string;
  os: string;
}

function parseUserAgent(userAgent?: string): BrowserInfo {
  if (!userAgent) {
    return { browser: 'Unknown browser', os: 'Unknown device' };
  }

  // Simple browser detection
  let browser = 'Unknown browser';
  if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('OPR/') || userAgent.includes('OPiOS/')) {
    browser = 'Opera';
  } else if (userAgent.includes('Chrome') || userAgent.includes('CriOS/')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox') || userAgent.includes('FxiOS/')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
  }

  // Simple OS detection
  let os = 'Unknown device';
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  }

  return { browser, os };
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (!Number.isFinite(date.getTime())) return 'at an unknown time';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

function isSessionExpiringSoon(expiresAt: string): boolean {
  const expires = new Date(expiresAt);
  const now = new Date();
  const hourInMs = 60 * 60 * 1000;
  const remaining = expires.getTime() - now.getTime();
  return remaining > 0 && remaining < hourInMs;
}

// Icon components
function DeviceIcon({ userAgent }: { userAgent?: string }) {
  const isMobile =
    userAgent?.includes('iPhone') || userAgent?.includes('iPad') || userAgent?.includes('Android');

  if (isMobile) {
    return (
      <svg
        aria-hidden="true"
        className="cedros-session-device-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="18" r="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="cedros-session-device-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 21H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 18V21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="cedros-session-check"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8L6 11L13 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
