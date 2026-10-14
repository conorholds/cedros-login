import { useI18n } from '../../i18n';
import { useEmailVerification } from '../../hooks/useEmailVerification';
import { ErrorMessage } from '../shared/ErrorMessage';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export interface EmailVerificationPendingProps {
  email: string;
  onBackToLogin?: () => void;
  className?: string;
}

/** Resting state for an account that exists but cannot receive a session yet. */
export function EmailVerificationPending({
  email,
  onBackToLogin,
  className = '',
}: EmailVerificationPendingProps) {
  const { t, message } = useI18n();
  const { resend, isLoading, sent, error, clearError } = useEmailVerification();

  return (
    <div className={`cedros-form ${className}`}>
      <div className="cedros-form-header" role="status" aria-live="polite">
        <h2 className="cedros-form-title">{t.auth.checkYourEmail}</h2>
        <p className="cedros-form-subtitle">
          {message(t.auth.verificationRequiredBody, { email })}
        </p>
      </div>

      <ErrorMessage error={error} onDismiss={clearError} />
      {sent && <p role="status">{t.auth.verificationResent}</p>}

      <button
        type="button"
        className="cedros-button cedros-button-secondary cedros-button-md cedros-button-full"
        disabled={isLoading}
        aria-busy={isLoading}
        onClick={() => void resend(email).catch(() => undefined)}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" announce label={t.buttons.sendVerification} />
            <span>{t.auth.sending}</span>
          </>
        ) : (
          t.buttons.sendVerification
        )}
      </button>

      <div className="cedros-form-footer">
        {onBackToLogin ? (
          <button type="button" className="cedros-link" onClick={onBackToLogin}>
            {t.auth.backToLogin}
          </button>
        ) : (
          <a className="cedros-link" href="/login">
            {t.auth.backToLogin}
          </a>
        )}
      </div>
    </div>
  );
}
