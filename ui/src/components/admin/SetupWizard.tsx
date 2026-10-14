import { useExternalEffect } from '../../hooks/effects';
/**
 * Setup Wizard Component
 *
 * Displayed during first-run when no admin user exists.
 * Allows creating the first admin account.
 *
 * @example
 * ```tsx
 * function AdminApp() {
 *   const { status, isLoading, checkStatus, createAdmin } = useSetup();
 *
 *   useExternalEffect(() => {
 *     checkStatus();
 *   }, [checkStatus]);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (status?.needsSetup) {
 *     return <SetupWizard onComplete={() => window.location.reload()} />;
 *   }
 *   return <AdminRoute />;
 * }
 * ```
 */

import { useState, useCallback } from 'react';
import { useSetup } from '../../hooks/useSetup';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { useI18n, type Translations } from '../../i18n';
import type { MessageValues } from '../../i18n/formatters';

export interface SetupWizardProps {
  /** Callback when setup is complete */
  onComplete?: () => void;
  /** Additional CSS class */
  className?: string;
}

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  orgName: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const ERROR_IDS = {
  email: 'setup-email-error',
  password: 'setup-password-error',
  confirmPassword: 'setup-confirm-password-error',
};

function validateForm(
  form: FormState,
  t: Translations,
  message: (message: string, values?: MessageValues) => string
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!form.email) {
    errors.email = t.admin.setup.emailRequired;
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = t.admin.setup.invalidEmail;
  }

  if (!form.password) {
    errors.password = t.admin.setup.passwordRequired;
  } else if (form.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = message(t.admin.setup.passwordMinLength, { count: MIN_PASSWORD_LENGTH });
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = t.admin.setup.confirmPasswordRequired;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = t.messages.passwordsDoNotMatch;
  }

  return errors;
}

function SetupCompleteMessage({
  className,
  title,
  body,
}: {
  className: string;
  title: string;
  body: string;
}) {
  return (
    <div className={`cedros-setup ${className}`}>
      <div className="cedros-setup__complete">
        <div className="cedros-setup__icon cedros-setup__icon--success">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="cedros-setup__title">{title}</h2>
        <p className="cedros-setup__text">{body}</p>
      </div>
    </div>
  );
}

export function SetupWizard({ onComplete, className = '' }: SetupWizardProps) {
  const { t, message } = useI18n();
  const { status, isLoading, isCreating, error, checkStatus, createAdmin } = useSetup();
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    orgName: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [success, setSuccess] = useState(false);

  useExternalEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleChange = useCallback(
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear validation error when user types
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors = validateForm(form, t, message);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      const request = {
        email: form.email,
        password: form.password,
        name: form.name || undefined,
        orgName: form.orgName || undefined,
      };

      try {
        await createAdmin(request);
      } catch {
        // useSetup owns the user-facing error state for create failures.
        return;
      }

      setSuccess(true);
      onComplete?.();
    },
    [form, createAdmin, onComplete, message, t]
  );

  if (isLoading) {
    return (
      <div className={`cedros-setup ${className}`}>
        <div className="cedros-setup__loading" role="status" aria-live="polite">
          <LoadingSpinner size="sm" />
          <span className="cedros-setup__loading-text">{t.admin.setup.checkingStatus}</span>
        </div>
      </div>
    );
  }

  if (status && !status.needsSetup) {
    return (
      <SetupCompleteMessage
        className={className}
        title={t.admin.setup.setupCompleteTitle}
        body={t.admin.setup.setupCompleteBody}
      />
    );
  }

  if (success) {
    return (
      <SetupCompleteMessage
        className={className}
        title={t.admin.setup.createdTitle}
        body={t.admin.setup.createdBody}
      />
    );
  }

  return (
    <div className={`cedros-setup ${className}`}>
      <div className="cedros-setup__container">
        <div className="cedros-setup__header">
          <div className="cedros-setup__logo">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
            </svg>
          </div>
          <h1 className="cedros-setup__title">{t.admin.setup.welcomeTitle}</h1>
          <p className="cedros-setup__subtitle">{t.admin.setup.welcomeSubtitle}</p>
        </div>

        <form className="cedros-setup__form" onSubmit={handleSubmit}>
          {error && <ErrorMessage error={error.message} autoFocus />}

          <div className="cedros-setup__field">
            <label htmlFor="setup-email" className="cedros-setup__label">
              {t.auth.emailAddress} <span className="cedros-setup__required">*</span>
            </label>
            <input
              id="setup-email"
              type="email"
              className={`cedros-setup__input ${validationErrors.email ? 'cedros-setup__input--error' : ''}`}
              value={form.email}
              onChange={handleChange('email')}
              placeholder={t.admin.setup.emailPlaceholder}
              autoComplete="email"
              aria-required="true"
              aria-invalid={validationErrors.email ? 'true' : undefined}
              aria-describedby={validationErrors.email ? ERROR_IDS.email : undefined}
              autoFocus
              disabled={isCreating}
            />
            {validationErrors.email && (
              <span id={ERROR_IDS.email} className="cedros-setup__error" role="alert">
                {validationErrors.email}
              </span>
            )}
          </div>

          <div className="cedros-setup__field">
            <label htmlFor="setup-name" className="cedros-setup__label">
              {t.admin.setup.displayName}
            </label>
            <input
              id="setup-name"
              type="text"
              className="cedros-setup__input"
              value={form.name}
              onChange={handleChange('name')}
              placeholder={t.admin.setup.displayNamePlaceholder}
              autoComplete="name"
              disabled={isCreating}
            />
          </div>

          <div className="cedros-setup__field">
            <label htmlFor="setup-org-name" className="cedros-setup__label">
              {t.admin.setup.organizationName}
            </label>
            <input
              id="setup-org-name"
              type="text"
              className="cedros-setup__input"
              value={form.orgName}
              onChange={handleChange('orgName')}
              placeholder={t.admin.setup.organizationNamePlaceholder}
              disabled={isCreating}
            />
          </div>

          <div className="cedros-setup__field">
            <label htmlFor="setup-password" className="cedros-setup__label">
              {t.auth.password} <span className="cedros-setup__required">*</span>
            </label>
            <input
              id="setup-password"
              type="password"
              className={`cedros-setup__input ${validationErrors.password ? 'cedros-setup__input--error' : ''}`}
              value={form.password}
              onChange={handleChange('password')}
              placeholder={t.admin.setup.passwordPlaceholder}
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={validationErrors.password ? 'true' : undefined}
              aria-describedby={validationErrors.password ? ERROR_IDS.password : undefined}
              disabled={isCreating}
            />
            {validationErrors.password && (
              <span id={ERROR_IDS.password} className="cedros-setup__error" role="alert">
                {validationErrors.password}
              </span>
            )}
          </div>

          <div className="cedros-setup__field">
            <label htmlFor="setup-confirm-password" className="cedros-setup__label">
              {t.auth.confirmPassword} <span className="cedros-setup__required">*</span>
            </label>
            <input
              id="setup-confirm-password"
              type="password"
              className={`cedros-setup__input ${validationErrors.confirmPassword ? 'cedros-setup__input--error' : ''}`}
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder={t.auth.confirmYourPassword}
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={validationErrors.confirmPassword ? 'true' : undefined}
              aria-describedby={
                validationErrors.confirmPassword ? ERROR_IDS.confirmPassword : undefined
              }
              disabled={isCreating}
            />
            {validationErrors.confirmPassword && (
              <span id={ERROR_IDS.confirmPassword} className="cedros-setup__error" role="alert">
                {validationErrors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="cedros-setup__button" disabled={isCreating}>
            {isCreating ? (
              <>
                <LoadingSpinner announce label={t.admin.setup.creatingAccount} />
                <span>{t.admin.setup.creatingAccount}</span>
              </>
            ) : (
              t.admin.setup.createAdminAccount
            )}
          </button>
        </form>

        <div className="cedros-setup__footer">
          <p className="cedros-setup__note">{t.admin.setup.footerNote}</p>
          {status?.serverVersion && (
            <p className="cedros-setup__version">
              {message(t.admin.setup.serverVersion, { version: status.serverVersion })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
