import { useI18n } from '../../i18n';
import type { SignupAvailability } from '../../types';
import { parseSignupAvailability } from '../../utils/signupAvailability';

export function SignupAvailabilityNotice({ availability }: { availability?: SignupAvailability }) {
  const { t, message, number, date } = useI18n();
  const snapshot = parseSignupAvailability(availability);
  if (!snapshot) return null;

  const isFull = snapshot.remaining === 0;
  const period = t.auth.signupAvailabilityPeriods[snapshot.period];
  const resetsAt = date(snapshot.resetsAt, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  const primary = isFull
    ? message(t.auth.signupAvailabilityFull, { resetsAt })
    : message(t.auth.signupAvailabilityRemaining, {
        remaining: number(snapshot.remaining),
        limit: number(snapshot.limit),
        period,
      });

  return (
    <div
      className="cedros-signup-availability"
      data-full={isFull ? 'true' : undefined}
      role="status"
      aria-live="polite"
      data-testid="signup-availability"
    >
      <span className="cedros-signup-availability-dot" aria-hidden="true" />
      <span>
        <strong>{primary}</strong> {!isFull && <span>{t.auth.signupAvailabilityDisclaimer}</span>}
      </span>
    </div>
  );
}
