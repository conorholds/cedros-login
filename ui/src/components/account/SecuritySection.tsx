/**
 * SecuritySection — the Security tab of the account settings page.
 *
 * Stacks the password card, two-factor authentication, and active sessions.
 * Sessions data is wired here (SessionList is presentational).
 */

import { PasswordCard } from './PasswordCard';
import { TotpSettings } from '../totp';
import { SessionList } from '../sessions/SessionList';
import { useAuthState } from '../../context/useCedrosLogin';
import { useSessions } from '../../hooks/useSessions';

export interface SecuritySectionProps {
  /** Called after the password is changed or set */
  onPasswordChange?: () => void;
  /** Called when 2FA status changes */
  onTotpChange?: (enabled: boolean) => void;
  className?: string;
}

export function SecuritySection({
  onPasswordChange,
  onTotpChange,
  className = '',
}: SecuritySectionProps) {
  const { user, config } = useAuthState();
  const { sessions, isLoading, error, fetchSessions, revokeAllSessions } = useSessions();

  return (
    <div className={`cedros-account-stack ${className}`.trim()}>
      <PasswordCard
        onPasswordChange={() => {
          void fetchSessions();
          onPasswordChange?.();
        }}
      />
      <TotpSettings onStatusChange={onTotpChange} />
      <section className="cedros-account-card cedros-account-card--pad">
        <header className="cedros-account-card__header">
          <h3 className="cedros-account-card__title">Active sessions</h3>
          <p className="cedros-account-card__desc">
            Active sign-ins to your account. The same browser can have multiple sessions.
          </p>
        </header>
        <SessionList
          key={`${config.serverUrl}:${user?.id ?? ''}`}
          onRefresh={fetchSessions}
          sessions={sessions}
          isLoading={isLoading}
          error={error ?? undefined}
          onRevokeAll={async () => {
            await revokeAllSessions();
          }}
        />
      </section>
    </div>
  );
}
