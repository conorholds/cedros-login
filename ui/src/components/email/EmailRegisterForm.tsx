import { useId, useState, type FormEvent } from 'react';
import { useCedrosLogin } from '../../context/useCedrosLogin';
import { isEmailVerificationPending, useEmailAuth } from '../../hooks/useEmailAuth';
import { useServerFeatures } from '../../hooks/useServerFeatures';
import { PasswordInput } from './PasswordInput';
import { InviteCodeRedeemForm } from './InviteCodeRedeemForm';
import { EmailVerificationPending } from './EmailVerificationPending';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { SignupAvailabilityNotice } from '../shared/SignupAvailabilityNotice';
import { sanitizeExternalUrl } from '../../utils/sanitization';
import { useCurrentSignupAvailability } from '../../hooks/useCurrentSignupAvailability';
import { useTranslations } from '../../i18n';
import type { PasswordValidation, AuthError, AuthResponse } from '../../types';

export interface EmailRegisterFormProps {
  onSuccess?: (response?: AuthResponse) => void;
  onAccountCreated?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
  /**
   * Access code value controlled by the parent (e.g. LoginForm).
   * When provided, the internal access code input is hidden and this value
   * is used directly. Allows LoginForm to show a single shared field.
   */
  accessCode?: string;
  /** Set false when a parent form already renders the shared quota notice. */
  showSignupAvailability?: boolean;
  /** Locks the selected plan while submitting and while invite/email confirmation is pending. */
  onRegistrationPendingChange?: (pending: boolean) => void;
}

/** Values collected from the registration form (for callback) */
export interface RegistrationData {
  termsAccepted: boolean;
  emailOptIn: boolean;
}

/**
 * Email/password registration form
 */
export function EmailRegisterForm({
  onSuccess,
  onAccountCreated,
  onSwitchToLogin,
  className = '',
  accessCode: accessCodeProp,
  showSignupAvailability = true,
  onRegistrationPendingChange,
}: EmailRegisterFormProps) {
  const t = useTranslations();
  const fieldId = useId();
  const { config } = useCedrosLogin();
  const { register, isLoading, error, clearError } = useEmailAuth();
  const { features } = useServerFeatures();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingInviteToken, setPendingInviteToken] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  // Internal state used only when parent hasn't provided an accessCode prop
  const [accessCodeInternal, setAccessCodeInternal] = useState('');
  const accessCode = accessCodeProp ?? accessCodeInternal;
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation | null>(null);
  const [termsError, setTermsError] = useState<AuthError | null>(null);

  // Get form configuration
  const termsConfig = config.forms?.termsOfService;
  const emailOptInConfig = config.forms?.emailOptIn;

  const showTerms = termsConfig?.show ?? false;
  const termsRequired = termsConfig?.required ?? true;
  const termsDefaultChecked = termsConfig?.defaultChecked ?? false;
  const termsLabel = termsConfig?.label ?? `${t.auth.termsAgreementPrefix} {terms}`;
  const termsUrl = termsConfig?.url;
  const safeTermsUrl = sanitizeExternalUrl(termsUrl);

  const showEmailOptIn = emailOptInConfig?.show ?? false;
  const emailOptInDefaultChecked = emailOptInConfig?.defaultChecked ?? false;
  const emailOptInLabel = emailOptInConfig?.label ?? t.auth.emailOptInDefault;

  // Initialize checkbox states with defaults
  const [termsAccepted, setTermsAccepted] = useState(termsDefaultChecked);
  const [emailOptIn, setEmailOptIn] = useState(emailOptInDefaultChecked);

  const passwordsMatch = password === confirmPassword;
  const isPasswordValid = passwordValidation?.isValid ?? false;

  // Terms must be accepted if shown and required
  const termsValid = !showTerms || !termsRequired || termsAccepted;

  const accessCodeRequired =
    config.signupAccessCodeRequired ?? features?.signupAccessCodeRequired ?? false;
  const signupAvailability = useCurrentSignupAvailability(config.signupAvailability);
  const signupFull = signupAvailability?.remaining === 0;

  const canSubmit =
    email &&
    password &&
    confirmPassword &&
    passwordsMatch &&
    isPasswordValid &&
    termsValid &&
    (!accessCodeRequired || accessCode.trim()) &&
    !signupFull &&
    !isLoading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear any previous terms error
    setTermsError(null);

    // Validate terms if required
    if (showTerms && termsRequired && !termsAccepted) {
      setTermsError({
        code: 'VALIDATION_ERROR',
        message: t.auth.termsRequiredError,
      });
      return;
    }

    if (!canSubmit) return;

    onRegistrationPendingChange?.(true);
    try {
      const response = await register(
        email,
        password,
        name || undefined,
        undefined,
        accessCodeRequired ? accessCode.trim() || undefined : undefined
      );
      if (response.inviteCodeRequired && response.pendingInviteToken) {
        onAccountCreated?.();
        setPendingInviteToken(response.pendingInviteToken);
        return;
      }
      if (isEmailVerificationPending(response)) {
        onAccountCreated?.();
        setPassword('');
        setConfirmPassword('');
        setPendingVerificationEmail(response.user.email ?? email);
        return;
      }
      onSuccess?.(response);
    } catch {
      onRegistrationPendingChange?.(false);
      // Error is handled by the hook
    }
  };

  const combinedError = error || termsError;
  const combinedClearError = () => {
    clearError();
    setTermsError(null);
  };
  const signInFooter = onSwitchToLogin ? (
    <p className="cedros-form-footer">
      {t.auth.alreadyHaveAccount}{' '}
      <button type="button" className="cedros-link cedros-link-muted" onClick={onSwitchToLogin}>
        {t.buttons.signIn}
      </button>
    </p>
  ) : null;

  if (pendingInviteToken) {
    return (
      <InviteCodeRedeemForm
        pendingInviteToken={pendingInviteToken}
        onSuccess={onSuccess}
        onBackToLogin={onSwitchToLogin}
        className={className}
      />
    );
  }

  if (pendingVerificationEmail) {
    return (
      <EmailVerificationPending
        email={pendingVerificationEmail}
        onBackToLogin={onSwitchToLogin}
        className={className}
      />
    );
  }

  if (signupFull) {
    return (
      <div className={`cedros-form ${className}`}>
        {showSignupAvailability && <SignupAvailabilityNotice availability={signupAvailability} />}
        {signInFooter}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`cedros-form ${className}`}>
      {showSignupAvailability && <SignupAvailabilityNotice availability={signupAvailability} />}
      <div className="cedros-form-field">
        <label htmlFor={`${fieldId}-name`} className="cedros-label">
          {t.auth.name} <span className="cedros-optional">{t.common.optional}</span>
        </label>
        <input
          id={`${fieldId}-name`}
          type="text"
          className="cedros-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.auth.namePlaceholder}
          autoComplete="name"
          disabled={isLoading}
        />
      </div>

      <div className="cedros-form-field">
        <label htmlFor={`${fieldId}-register-email`} className="cedros-label">
          {t.auth.email}
        </label>
        <input
          id={`${fieldId}-register-email`}
          type="email"
          className="cedros-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.auth.emailPlaceholder}
          required
          aria-required="true"
          autoComplete="email"
          disabled={isLoading}
        />
      </div>

      <div className="cedros-form-field">
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.auth.createPassword}
          required
          autoComplete="new-password"
          disabled={isLoading}
          showStrengthMeter
          onValidationChange={setPasswordValidation}
        />
      </div>

      <div className="cedros-form-field">
        <PasswordInput
          label={t.auth.confirmPassword}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t.auth.confirmYourPassword}
          required
          autoComplete="new-password"
          disabled={isLoading}
          aria-invalid={confirmPassword && !passwordsMatch ? 'true' : undefined}
          error={confirmPassword && !passwordsMatch ? t.messages.passwordsDoNotMatch : undefined}
        />
      </div>

      {/* Access code field — only shown when required AND parent hasn't provided the value */}
      {accessCodeRequired && accessCodeProp === undefined && (
        <div className="cedros-form-field">
          <label htmlFor={`${fieldId}-register-access-code`} className="cedros-label">
            {t.auth.accessCode}
          </label>
          <input
            id={`${fieldId}-register-access-code`}
            type="text"
            className="cedros-input"
            value={accessCodeInternal}
            onChange={(e) => setAccessCodeInternal(e.target.value)}
            placeholder={t.auth.enterAccessCode}
            required
            aria-required="true"
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
      )}

      {/* Terms of Service checkbox */}
      {showTerms && (
        <div className="cedros-form-field cedros-checkbox-field">
          <label className="cedros-checkbox-label">
            <input
              type="checkbox"
              className="cedros-checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={isLoading}
              aria-required={termsRequired}
            />
            <span className="cedros-checkbox-text">
              {safeTermsUrl ? (
                <>
                  {termsLabel.split('{terms}')[0].trim()}{' '}
                  <a
                    href={safeTermsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cedros-link"
                  >
                    {t.auth.termsOfService}
                  </a>
                  {termsLabel.split('{terms}')[1]
                    ? ` ${termsLabel.split('{terms}')[1].trim()}`
                    : ''}
                </>
              ) : (
                termsLabel.replace('{terms}', t.auth.termsOfService)
              )}
              {termsRequired && <span className="cedros-required">*</span>}
            </span>
          </label>
        </div>
      )}

      {/* Email opt-in checkbox */}
      {showEmailOptIn && (
        <div className="cedros-form-field cedros-checkbox-field">
          <label className="cedros-checkbox-label">
            <input
              type="checkbox"
              className="cedros-checkbox"
              checked={emailOptIn}
              onChange={(e) => setEmailOptIn(e.target.checked)}
              disabled={isLoading}
            />
            <span className="cedros-checkbox-text">{emailOptInLabel}</span>
          </label>
        </div>
      )}

      <ErrorMessage error={combinedError} onDismiss={combinedClearError} />

      <button
        type="submit"
        className="cedros-button cedros-button-primary cedros-button-md cedros-button-full"
        disabled={!canSubmit}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" announce label={t.buttons.createAccount} />
            <span>{t.messages.creatingAccount}</span>
          </>
        ) : (
          t.buttons.createAccount
        )}
      </button>

      {signInFooter}
    </form>
  );
}
