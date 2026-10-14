import { useExternalEffect } from '../../hooks/effects';
/**
 * TOTP Setup component for enabling two-factor authentication
 *
 * Guides users through:
 * 1. Scanning QR code with authenticator app
 * 2. Saving backup codes
 * 3. Verifying setup with a code
 */

import { useState, useRef } from 'react';
import { useTotp } from '../../hooks/useTotp';
import { OtpInput } from './OtpInput';
import { QrCode } from './QrCode';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { DirectionalPanel } from '../shared/MotionPrimitives';

const SETUP_STEPS = ['qr', 'backup', 'verify'] as const;

export interface TotpSetupProps {
  /** Called when setup is completed successfully */
  onSuccess?: () => void;
  /** Called when user cancels setup */
  onCancel?: () => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * Two-factor authentication setup wizard.
 *
 * Displays QR code for authenticator app scanning,
 * recovery codes for account recovery, and verification step.
 */
export function TotpSetup({ onSuccess, onCancel, className = '' }: TotpSetupProps) {
  const { setupState, setupData, isLoading, error, beginSetup, enableTotp, clearError, reset } =
    useTotp();

  const [step, setStep] = useState<'qr' | 'backup' | 'verify'>('qr');
  const [verifyCode, setVerifyCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [savedBackupCodes, setSavedBackupCodes] = useState(false);
  const verifying = useRef(false);
  const copyTimerRef = useRef<number | null>(null);

  // Start setup on mount
  useExternalEffect(() => {
    if (setupState === 'idle') {
      beginSetup().catch(() => {
        // Error handled by hook
      });
    }
  }, [setupState, beginSetup]);

  // Handle successful setup
  useExternalEffect(() => {
    if (setupState === 'success') {
      onSuccess?.();
    }
  }, [setupState, onSuccess]);

  const handleCopySecret = async () => {
    if (setupData?.secret) {
      await navigator.clipboard.writeText(setupData.secret);
      setCopiedSecret(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleCopyBackupCodes = async () => {
    if (setupData?.recoveryCodes) {
      const codes = setupData.recoveryCodes.join('\n');
      await navigator.clipboard.writeText(codes);
    }
  };

  const handleVerify = async (completedCode?: string) => {
    const code = completedCode ?? verifyCode;
    if (verifying.current || !/^\d{6}$/.test(code)) return;
    verifying.current = true;
    try {
      await enableTotp(code);
    } catch {
      // Error handled by hook
      setVerifyCode('');
    } finally {
      verifying.current = false;
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  useExternalEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    };
  }, []);

  // Loading state
  if (setupState === 'loading' || (setupState === 'idle' && isLoading)) {
    return (
      <div className={`cedros-totp-setup ${className}`}>
        <div className="cedros-totp-loading">
          <LoadingSpinner size="lg" label="Setting up two-factor authentication" />
        </div>
      </div>
    );
  }

  // Error state (failed to start setup)
  if (setupState === 'error' && !setupData) {
    return (
      <div className={`cedros-totp-setup ${className}`}>
        <ErrorMessage error={error} onDismiss={clearError} />
        <div className="cedros-totp-actions">
          <button
            type="button"
            className="cedros-button cedros-button-outline cedros-button-md"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cedros-button cedros-button-primary cedros-button-md"
            onClick={() => beginSetup()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (setupState === 'success') {
    return (
      <div className={`cedros-totp-setup ${className}`}>
        <div className="cedros-totp-success">
          <svg
            className="cedros-totp-success-icon"
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
          <h3 className="cedros-totp-title">Two-factor authentication enabled</h3>
          <p className="cedros-totp-description">
            Your account is now protected with an additional layer of security.
          </p>
        </div>
      </div>
    );
  }

  if (!setupData) return null;

  return (
    <div className={`cedros-totp-setup ${className}`}>
      <DirectionalPanel stateKey={step} order={SETUP_STEPS} focusOnChange>
        {/* Step 1: QR Code */}
        {step === 'qr' && (
          <div className="cedros-totp-step">
            <h3 className="cedros-totp-title">Scan QR code</h3>
            <p className="cedros-totp-description">
              Use your authenticator app to scan this QR code.
            </p>

            <div className="cedros-totp-qr">
              {/* QR code generated client-side from the server-provided otpauth URI */}
              <QrCode value={setupData.otpauthUri} size={200} alt="QR code for authenticator app" />
            </div>

            <div className="cedros-totp-manual">
              <p className="cedros-totp-manual-label">Or enter this code manually:</p>
              <div className="cedros-totp-secret">
                <code className="cedros-totp-secret-code">{setupData.secret}</code>
                <button
                  type="button"
                  className="cedros-button cedros-button-ghost cedros-button-sm"
                  onClick={handleCopySecret}
                  aria-label="Copy secret"
                >
                  {copiedSecret ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="cedros-totp-actions">
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-md"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cedros-button cedros-button-primary cedros-button-md"
                onClick={() => setStep('backup')}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Recovery Codes */}
        {step === 'backup' && (
          <div className="cedros-totp-step">
            <h3 className="cedros-totp-title">Save recovery codes</h3>
            <p className="cedros-totp-description">
              Save these codes in a secure place. You can use them to access your account if you
              lose your authenticator device.
            </p>

            <div className="cedros-totp-backup-codes">
              {setupData.recoveryCodes.map((code, index) => (
                <code key={index} className="cedros-totp-backup-code">
                  {code}
                </code>
              ))}
            </div>

            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-md cedros-button-full"
              onClick={handleCopyBackupCodes}
            >
              Copy all codes
            </button>

            <label className="cedros-checkbox-label cedros-totp-confirm">
              <input
                type="checkbox"
                className="cedros-checkbox"
                checked={savedBackupCodes}
                onChange={(e) => setSavedBackupCodes(e.target.checked)}
              />
              <span className="cedros-checkbox-text">I have saved these recovery codes</span>
            </label>

            <div className="cedros-totp-actions">
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-md"
                onClick={() => setStep('qr')}
              >
                Back
              </button>
              <button
                type="button"
                className="cedros-button cedros-button-primary cedros-button-md"
                onClick={() => setStep('verify')}
                disabled={!savedBackupCodes}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verify */}
        {step === 'verify' && (
          <div className="cedros-totp-step">
            <h3 className="cedros-totp-title">Verify setup</h3>
            <p className="cedros-totp-description">
              Enter the 6-digit code from your authenticator app to complete setup.
            </p>

            <OtpInput
              value={verifyCode}
              onChange={setVerifyCode}
              onComplete={handleVerify}
              disabled={isLoading}
              error={error?.message}
              autoFocus
            />

            <div className="cedros-totp-actions">
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-md"
                onClick={() => setStep('backup')}
                disabled={isLoading}
              >
                Back
              </button>
              <button
                type="button"
                className="cedros-button cedros-button-primary cedros-button-md"
                onClick={() => handleVerify()}
                disabled={isLoading || !/^\d{6}$/.test(verifyCode)}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  'Enable 2FA'
                )}
              </button>
            </div>
          </div>
        )}
      </DirectionalPanel>
    </div>
  );
}
