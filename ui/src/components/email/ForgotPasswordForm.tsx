import { useState, useId, type FormEvent } from 'react';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { useInstantLink } from '../../hooks/useInstantLink';
import { ErrorMessage } from '../shared/ErrorMessage';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useI18n } from '../../i18n';
import { DirectionalPanel } from '../shared/MotionPrimitives';

const FORGOT_STEPS = ['request', 'success'] as const;

export interface ForgotPasswordFormProps {
  /** Which action to perform: password reset email or instant sign-in link */
  mode?: 'reset' | 'instantLink';
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Form for requesting a password reset or instant sign-in link.
 *
 * @param mode - `'reset'` sends a password reset email; `'instantLink'` sends a passwordless sign-in link.
 */
export function ForgotPasswordForm({
  mode = 'reset',
  onSuccess,
  onCancel,
  className = '',
}: ForgotPasswordFormProps) {
  const { t, message } = useI18n();
  const [email, setEmail] = useState('');
  const passwordReset = usePasswordReset();
  const instantLink = useInstantLink();
  const emailId = useId();

  const hook =
    mode === 'instantLink'
      ? {
          submit: instantLink.sendInstantLink,
          isLoading: instantLink.isLoading,
          isSuccess: instantLink.isSuccess,
          error: instantLink.error,
          clearError: instantLink.clearError,
        }
      : {
          submit: passwordReset.forgotPassword,
          isLoading: passwordReset.isLoading,
          isSuccess: passwordReset.isSuccess,
          error: passwordReset.error,
          clearError: passwordReset.clearError,
        };

  const isInstantLink = mode === 'instantLink';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await hook.submit(email);
      onSuccess?.();
    } catch {
      // Error is already set in the hook
    }
  };

  if (hook.isSuccess) {
    return (
      <DirectionalPanel stateKey="success" order={FORGOT_STEPS} focusOnChange>
        <div className={`cedros-forgot-password-success ${className}`}>
          <svg
            className="cedros-success-icon"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
            <path
              d="M14 24l7 7 13-13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="cedros-success-title">{t.auth.checkYourEmail}</h3>
          <p className="cedros-success-message">
            {message(isInstantLink ? t.auth.instantLinkSent : t.auth.passwordResetSent, { email })}
          </p>
          {onCancel && (
            <button
              type="button"
              className="cedros-button cedros-button-md cedros-button-outline"
              onClick={onCancel}
            >
              {t.auth.backToLogin}
            </button>
          )}
        </div>
      </DirectionalPanel>
    );
  }

  return (
    <DirectionalPanel stateKey="request" order={FORGOT_STEPS}>
      <form className={`cedros-forgot-password-form ${className}`} onSubmit={handleSubmit}>
        <div className="cedros-form-header">
          <h3 className="cedros-form-title">{t.auth.forgotPasswordTitle}</h3>
          <p className="cedros-form-subtitle">
            {isInstantLink ? t.auth.instantLinkSubtitle : t.auth.forgotPasswordResetSubtitle}
          </p>
        </div>

        <ErrorMessage error={hook.error} onDismiss={hook.clearError} />

        <div className="cedros-form-field">
          <label htmlFor={emailId} className="cedros-label">
            {t.auth.emailAddress}
          </label>
          <input
            id={emailId}
            type="email"
            className="cedros-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.auth.emailPlaceholder}
            required
            autoComplete="email"
            disabled={hook.isLoading}
          />
        </div>

        <div className="cedros-form-actions">
          <button
            type="submit"
            className="cedros-button cedros-button-md cedros-button-primary cedros-button-full"
            disabled={hook.isLoading || !email}
          >
            {hook.isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                {t.auth.sending}
              </>
            ) : isInstantLink ? (
              t.buttons.sendSignInLink
            ) : (
              t.buttons.sendResetLink
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              className="cedros-button cedros-button-md cedros-button-ghost cedros-button-full"
              onClick={onCancel}
              disabled={hook.isLoading}
            >
              {t.auth.backToLogin}
            </button>
          )}
        </div>
      </form>
    </DirectionalPanel>
  );
}
