import { useId, useState, type FormEvent } from 'react';
import { useEmailAuth } from '../../hooks/useEmailAuth';
import { PasswordInput } from './PasswordInput';
import { InviteCodeRedeemForm } from './InviteCodeRedeemForm';
import { EmailVerificationPending } from './EmailVerificationPending';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { TotpVerify } from '../totp/TotpVerify';
import { useTranslations } from '../../i18n';
import type { AuthResponse } from '../../types';
import { DirectionalPanel } from '../shared/MotionPrimitives';

const LOGIN_STEPS = ['credentials', 'mfa', 'invite'] as const;

export interface EmailLoginFormProps {
  onSuccess?: (response?: AuthResponse) => void;
  onSwitchToRegister?: () => void;
  /** Called when user clicks "Forgot password?" — navigates to forgot-password screen */
  onForgotPassword?: () => void;
  className?: string;
}

/**
 * Email/password login form
 */
export function EmailLoginForm({
  onSuccess,
  onSwitchToRegister,
  onForgotPassword,
  className = '',
}: EmailLoginFormProps) {
  const t = useTranslations();
  const fieldId = useId();
  const { login, isLoading, error, clearError } = useEmailAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // MFA state for 2FA flow
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaEmail, setMfaEmail] = useState<string>('');
  // Set when a pending gated account logs in and must redeem a code.
  const [pendingInviteToken, setPendingInviteToken] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      if (result.mfaRequired) {
        // MFA verification needed
        setMfaToken(result.mfaToken);
        setMfaEmail(result.email);
      } else if ('inviteCodeRequired' in result) {
        // Pending invite-code gate — collect a code instead of logging in.
        setPendingInviteToken(result.pendingInviteToken);
      } else {
        // Login successful
        setEmail('');
        setPassword('');
        onSuccess?.(result.response);
      }
    } catch {
      // Error is handled by the hook
    }
  };

  const handleTotpSuccess = (response: AuthResponse) => {
    setMfaToken(null);
    setMfaEmail('');
    onSuccess?.(response);
  };

  const handleTotpBack = () => {
    setMfaToken(null);
    setMfaEmail('');
    setPassword(''); // Clear password for security
  };

  // Show TOTP verification step
  if (mfaToken) {
    return (
      <DirectionalPanel stateKey="mfa" order={LOGIN_STEPS} focusOnChange>
        <TotpVerify
          mfaToken={mfaToken}
          email={mfaEmail}
          onSuccess={handleTotpSuccess}
          onBack={handleTotpBack}
          className={className}
        />
      </DirectionalPanel>
    );
  }

  // Pending invite-code gate — show the redeem form instead of logging in.
  if (pendingInviteToken) {
    return (
      <DirectionalPanel stateKey="invite" order={LOGIN_STEPS} focusOnChange>
        <InviteCodeRedeemForm
          pendingInviteToken={pendingInviteToken}
          onSuccess={onSuccess}
          className={className}
        />
      </DirectionalPanel>
    );
  }

  if (error?.code === 'EMAIL_NOT_VERIFIED') {
    return (
      <DirectionalPanel stateKey="credentials" order={LOGIN_STEPS} focusOnChange>
        <EmailVerificationPending
          email={email}
          onBackToLogin={() => {
            clearError();
            setPassword('');
          }}
          className={className}
        />
      </DirectionalPanel>
    );
  }

  return (
    <DirectionalPanel stateKey="credentials" order={LOGIN_STEPS}>
      <form onSubmit={handleSubmit} className={`cedros-form ${className}`}>
        <div className="cedros-form-field">
          <label htmlFor={`${fieldId}-email`} className="cedros-label">
            {t.auth.email}
          </label>
          <input
            id={`${fieldId}-email`}
            type="email"
            className="cedros-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.auth.emailPlaceholder}
            required
            aria-required="true"
            autoComplete="username"
            name="username"
            disabled={isLoading}
          />
        </div>

        <div className="cedros-form-field">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.auth.enterPassword}
            required
            autoComplete="current-password"
            name="password"
            disabled={isLoading}
            labelAction={
              onForgotPassword ? (
                <button
                  type="button"
                  className="cedros-link cedros-link-muted cedros-link-sm"
                  onClick={onForgotPassword}
                >
                  {t.auth.forgotYourPassword}
                </button>
              ) : undefined
            }
          />
        </div>

        <ErrorMessage error={error} onDismiss={clearError} />

        <button
          type="submit"
          className="cedros-button cedros-button-primary cedros-button-md cedros-button-full"
          disabled={isLoading || !email || !password}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" announce label={t.buttons.signIn} />
              <span>{t.messages.signingIn}</span>
            </>
          ) : (
            t.buttons.signIn
          )}
        </button>

        {onSwitchToRegister && (
          <p className="cedros-form-footer">
            {t.auth.dontHaveAccount}{' '}
            <button
              type="button"
              className="cedros-link cedros-link-muted"
              onClick={onSwitchToRegister}
            >
              {t.buttons.signUp}
            </button>
          </p>
        )}
      </form>
    </DirectionalPanel>
  );
}
