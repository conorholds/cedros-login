import { useRef, useState, type FormEvent } from 'react';
import { isEmailVerificationPending, useEmailAuth } from '../../hooks/useEmailAuth';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { InviteUnlockCelebration } from './InviteUnlockCelebration';
import { EmailVerificationPending } from './EmailVerificationPending';
import { useTranslations } from '../../i18n';
import type { AuthResponse } from '../../types';

export interface InviteCodeRedeemFormProps {
  /** The single-use pending-invite token returned by register or login. */
  pendingInviteToken: string;
  /** Show enrollment-success copy only after the trusted host accepted it. */
  onSuccess?: (response: AuthResponse) => void;
  onBackToLogin?: () => void;
  className?: string;
}

/**
 * Invite-code entry form shown when the registration gate is on and the account
 * has not redeemed a code yet. Shared by both the register flow (gated signup)
 * and the login flow (a pending account signing back in — the server re-issues a
 * fresh `pendingInviteToken` so the user is never dead-ended). Manages its own
 * loading/error state via `useEmailAuth`.
 *
 * A successful redemption first shows the unlock celebration (revealing any
 * discount the code granted) with the login commit deferred. The user chooses
 * when to continue, then the commit and `onSuccess` fire together.
 */
export function InviteCodeRedeemForm({
  pendingInviteToken,
  onSuccess,
  onBackToLogin,
  className = '',
}: InviteCodeRedeemFormProps) {
  const { redeemInviteCode, completeInviteRedemption, isLoading, error, clearError } =
    useEmailAuth();
  const t = useTranslations();
  const [inviteCode, setInviteCode] = useState('');
  const [celebration, setCelebration] = useState<AuthResponse | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const hasContinued = useRef(false);

  const handleContinue = () => {
    if (!celebration || hasContinued.current) return;
    hasContinued.current = true;
    if (isEmailVerificationPending(celebration)) {
      setPendingVerificationEmail(celebration.user.email ?? '');
      setCelebration(null);
      return;
    }
    completeInviteRedemption(celebration);
    onSuccess?.(celebration);
  };

  const canSubmit = inviteCode.trim().length > 0 && !isLoading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      const response = await redeemInviteCode(pendingInviteToken, inviteCode.trim(), {
        deferLoginSuccess: true,
      });
      setCelebration(response);
    } catch {
      // Error is surfaced via the hook's error state.
    }
  };

  if (celebration) {
    return (
      <InviteUnlockCelebration
        discount={celebration.inviteDiscount}
        onContinue={handleContinue}
        className={className}
      />
    );
  }

  if (pendingVerificationEmail !== null) {
    return (
      <EmailVerificationPending
        email={pendingVerificationEmail}
        onBackToLogin={onBackToLogin}
        className={className}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`cedros-form ${className}`}>
      <div className="cedros-form-header">
        <h2 className="cedros-form-title">{t.auth.inviteCodeRequiredTitle}</h2>
        <p className="cedros-form-subtitle">{t.auth.inviteCodeRequiredBody}</p>
      </div>

      <div className="cedros-form-field">
        <label htmlFor="invite-code-redeem" className="cedros-label">
          {t.auth.inviteCode}
        </label>
        <input
          id="invite-code-redeem"
          type="text"
          className="cedros-input"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder={t.auth.enterInviteCode}
          autoComplete="one-time-code"
          disabled={isLoading}
        />
      </div>

      <ErrorMessage error={error} onDismiss={clearError} />

      <button
        type="submit"
        className="cedros-button cedros-button-primary cedros-button-md cedros-button-full"
        disabled={!canSubmit}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" announce label={t.common.continue} />
            <span>{t.messages.verifyingSignature}</span>
          </>
        ) : (
          t.common.continue
        )}
      </button>
    </form>
  );
}
