import { useState, type FormEvent } from 'react';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { PasswordInput } from './PasswordInput';
import { ErrorMessage } from '../shared/ErrorMessage';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { validatePassword } from '../../utils/validation';
import { useTranslations } from '../../i18n';
import type { PasswordValidation } from '../../types';
import { DirectionalPanel } from '../shared/MotionPrimitives';

const RESET_STEPS = ['reset', 'success'] as const;

export interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
  onLoginClick?: () => void;
  className?: string;
}

/**
 * Form for resetting password using a reset token.
 *
 * @example
 * ```tsx
 * // Get token from URL params
 * const token = new URLSearchParams(location.search).get('token');
 *
 * <ResetPasswordForm
 *   token={token}
 *   onSuccess={() => navigate('/login')}
 *   onLoginClick={() => navigate('/login')}
 * />
 * ```
 */
export function ResetPasswordForm({
  token,
  onSuccess,
  onLoginClick,
  className = '',
}: ResetPasswordFormProps) {
  const t = useTranslations();
  const [requestNewLink, setRequestNewLink] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validation, setValidation] = useState<PasswordValidation | null>(null);
  const { resetPassword, isLoading, isSuccess, error, clearError } = usePasswordReset();

  const passwordsMatch = password === confirmPassword;
  const isValid = validation?.isValid && passwordsMatch && password.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      await resetPassword(token, password);
      onSuccess?.();
    } catch {
      // Error is already set in the hook
    }
  };

  if (requestNewLink) {
    return <ForgotPasswordForm mode="reset" onCancel={onLoginClick} className={className} />;
  }

  if (isSuccess) {
    return (
      <DirectionalPanel stateKey="success" order={RESET_STEPS} focusOnChange>
        <div className={`cedros-reset-password-success ${className}`}>
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
          <h3 className="cedros-success-title">{t.auth.passwordResetSuccessful}</h3>
          <p className="cedros-success-message">{t.auth.passwordResetSuccessfulBody}</p>
          {onLoginClick && (
            <button
              type="button"
              className="cedros-button cedros-button-md cedros-button-primary"
              onClick={onLoginClick}
            >
              {t.auth.goToLogin}
            </button>
          )}
        </div>
      </DirectionalPanel>
    );
  }

  return (
    <DirectionalPanel stateKey="reset" order={RESET_STEPS}>
      <form className={`cedros-reset-password-form ${className}`} onSubmit={handleSubmit}>
        <div className="cedros-form-header">
          <h3 className="cedros-form-title">{t.auth.resetYourPassword}</h3>
          <p className="cedros-form-subtitle">{t.auth.resetPasswordSubtitle}</p>
        </div>

        <ErrorMessage error={error} onDismiss={clearError} />
        {(error?.code === 'TOKEN_EXPIRED' || error?.code === 'INVALID_TOKEN') && (
          <button
            type="button"
            className="cedros-button cedros-button-outline"
            onClick={() => {
              setPassword('');
              setConfirmPassword('');
              setRequestNewLink(true);
            }}
          >
            {t.auth.requestNewResetLink}
          </button>
        )}

        <div className="cedros-form-field">
          <PasswordInput
            label={t.auth.newPassword}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setValidation(validatePassword(e.target.value, t.passwordValidation));
            }}
            showStrengthMeter
            onValidationChange={setValidation}
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>

        <div className="cedros-form-field">
          <PasswordInput
            label={t.auth.confirmPassword}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="new-password"
            error={confirmPassword && !passwordsMatch ? t.messages.passwordsDoNotMatch : undefined}
          />
        </div>

        <div className="cedros-form-actions">
          <button
            type="submit"
            className="cedros-button cedros-button-md cedros-button-primary cedros-button-full"
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                {t.auth.resetting}
              </>
            ) : (
              t.buttons.resetPassword
            )}
          </button>

          {onLoginClick && (
            <button
              type="button"
              className="cedros-button cedros-button-md cedros-button-ghost cedros-button-full"
              onClick={onLoginClick}
              disabled={isLoading}
            >
              {t.auth.backToLogin}
            </button>
          )}
        </div>
      </form>
    </DirectionalPanel>
  );
}
