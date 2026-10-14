/**
 * TOTP Verification component for login flow
 *
 * Displayed when a user with 2FA enabled needs to
 * enter their verification code to complete login.
 */

import { useId, useRef, useState } from 'react';
import { useTotpVerify } from '../../hooks/useTotpVerify';
import { OtpInput } from './OtpInput';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useTranslations } from '../../i18n';
import type { AuthResponse } from '../../types';

export interface TotpVerifyProps {
  /** Temporary token from password authentication */
  mfaToken: string;
  /** Email address (for display) */
  email?: string;
  /** Called when verification succeeds */
  onSuccess?: (response: AuthResponse) => void;
  /** Called when user wants to go back */
  onBack?: () => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * Two-factor authentication verification for login.
 *
 * Accepts 6-digit codes from authenticator apps
 * or recovery codes for account recovery.
 */
export function TotpVerify({
  mfaToken,
  email,
  onSuccess,
  onBack,
  className = '',
}: TotpVerifyProps) {
  const t = useTranslations();
  const recoveryId = useId();
  const submitting = useRef(false);
  const { verifyTotp, isLoading, error, clearError } = useTotpVerify();
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');

  const handleVerify = async (verifyCode?: string) => {
    const codeToVerify = (verifyCode || (useBackupCode ? backupCode : code)).trim();
    if (!codeToVerify || submitting.current) return;
    submitting.current = true;

    try {
      const response = await verifyTotp(mfaToken, codeToVerify);
      onSuccess?.(response);
    } catch {
      // Error handled by hook, clear the input
      if (useBackupCode) {
        setBackupCode('');
      } else {
        setCode('');
      }
    } finally {
      submitting.current = false;
    }
  };

  const handleOtpComplete = (value: string) => {
    handleVerify(value);
  };

  const toggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    clearError();
    setCode('');
    setBackupCode('');
  };

  return (
    <div className={`cedros-totp-verify ${className}`}>
      <div className="cedros-totp-verify-header">
        <svg
          className="cedros-totp-verify-icon"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <rect x="8" y="20" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M16 20V14a8 8 0 1 1 16 0v6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="24" cy="32" r="3" fill="currentColor" />
        </svg>
        <h3 className="cedros-totp-title">{t.auth.twoFactorTitle}</h3>
        <p className="cedros-totp-description">
          {useBackupCode ? t.auth.recoveryCodeDescription : t.auth.authenticatorCodeDescription}
        </p>
        {email && <p className="cedros-totp-email">{email}</p>}
      </div>

      {useBackupCode ? (
        <div className="cedros-totp-backup-input">
          <label htmlFor={recoveryId} className="cedros-label">
            {t.auth.recoveryCode}
          </label>
          <input
            id={recoveryId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${recoveryId}-error` : undefined}
            spellCheck={false}
            autoCapitalize="none"
            type="text"
            className={`cedros-input ${error ? 'cedros-input-error' : ''}`}
            placeholder={t.auth.enterRecoveryCode}
            value={backupCode}
            onChange={(e) => {
              setBackupCode(e.target.value);
              clearError();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && backupCode) {
                handleVerify();
              }
            }}
            disabled={isLoading}
            autoFocus
            autoComplete="one-time-code"
          />
          {error && (
            <p id={`${recoveryId}-error`} className="cedros-input-error" role="alert">
              {error.message}
            </p>
          )}
        </div>
      ) : (
        <OtpInput
          value={code}
          onChange={(value) => {
            setCode(value);
            clearError();
          }}
          onComplete={handleOtpComplete}
          disabled={isLoading}
          error={error?.message}
          autoFocus
        />
      )}

      <button
        type="button"
        className="cedros-button cedros-button-primary cedros-button-md cedros-button-full"
        onClick={() => handleVerify()}
        disabled={isLoading || (useBackupCode ? !backupCode : !/^\d{6}$/.test(code))}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            <span>{t.auth.verifying}</span>
          </>
        ) : (
          t.auth.verify
        )}
      </button>

      <div className="cedros-totp-verify-footer">
        <button
          type="button"
          className="cedros-link cedros-link-sm"
          onClick={toggleBackupCode}
          disabled={isLoading}
        >
          {useBackupCode ? t.auth.useAuthenticatorApp : t.auth.useRecoveryCode}
        </button>

        {onBack && (
          <>
            <span className="cedros-totp-verify-divider">•</span>
            <button
              type="button"
              className="cedros-link cedros-link-sm"
              onClick={onBack}
              disabled={isLoading}
            >
              {t.auth.backToLogin}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
