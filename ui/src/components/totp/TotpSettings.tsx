import { useExternalEffect } from '../../hooks/effects';
/**
 * TOTP Settings component for managing two-factor authentication
 *
 * Allows users to:
 * - View current 2FA status
 * - Enable 2FA (via TotpSetup wizard)
 * - Disable 2FA (requires verification)
 * - Regenerate backup codes
 */

import { useState, useCallback, useRef } from 'react';
import { useTotp } from '../../hooks/useTotp';
import { useCedrosLoginOptional } from '../../context/useCedrosLogin';
import { TotpSetup } from './TotpSetup';
import { OtpInput } from './OtpInput';
import { PasswordInput } from '../email/PasswordInput';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import type { AuthMethod, TotpDisableMethod } from '../../types';

export interface TotpSettingsProps {
  /** Called when 2FA status changes */
  onStatusChange?: (enabled: boolean) => void;
  /** Additional CSS class */
  className?: string;
}

type SettingsView = 'status' | 'setup' | 'disable' | 'regenerate';
type DisableMode = 'password' | 'code' | 'recovery';

const ALL_DISABLE_MODES: readonly DisableMode[] = ['password', 'code', 'recovery'];
const PASSWORD_DISABLE_MODES: readonly DisableMode[] = ['password'];
const PASSWORDLESS_DISABLE_MODES: readonly DisableMode[] = ['code', 'recovery'];

function hasPasswordBackedAuthMethod(authMethods: readonly AuthMethod[]): boolean {
  return authMethods.some((method) => method === 'email' || method === 'password');
}

function getAllowedDisableModes(
  disableMethods?: readonly TotpDisableMethod[],
  authMethods?: readonly AuthMethod[]
): readonly DisableMode[] {
  if (disableMethods) {
    return disableMethods.map((method) => (method === 'recoveryCode' ? 'recovery' : method));
  }
  if (!authMethods || authMethods.length === 0) return ALL_DISABLE_MODES;
  return hasPasswordBackedAuthMethod(authMethods)
    ? PASSWORD_DISABLE_MODES
    : PASSWORDLESS_DISABLE_MODES;
}

function getDefaultDisableMode(allowedModes: readonly DisableMode[]): DisableMode {
  return allowedModes[0] ?? 'password';
}

function isAllowedDisableMode(mode: DisableMode, allowedModes: readonly DisableMode[]): boolean {
  return allowedModes.includes(mode);
}

/**
 * Two-factor authentication settings panel.
 *
 * Shows current 2FA status and provides controls for
 * enabling, disabling, and managing backup codes.
 */
export function TotpSettings({ onStatusChange, className = '' }: TotpSettingsProps) {
  const { status, isLoading, error, getStatus, disableTotp, regenerateBackupCodes, clearError } =
    useTotp();
  const loginContext = useCedrosLoginOptional();

  const [view, setView] = useState<SettingsView>('status');
  const [disableMode, setDisableMode] = useState<DisableMode>('password');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disableRecoveryCode, setDisableRecoveryCode] = useState('');
  const regenerating = useRef(false);
  const [regenerateCode, setRegenerateCode] = useState('');
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[] | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const allowedDisableModes = getAllowedDisableModes(
    status?.disableMethods,
    loginContext?.user?.authMethods
  );
  const defaultDisableMode = getDefaultDisableMode(allowedDisableModes);
  const activeDisableMode = isAllowedDisableMode(disableMode, allowedDisableModes)
    ? disableMode
    : defaultDisableMode;
  const canUsePasswordDisable = isAllowedDisableMode('password', allowedDisableModes);
  const canUseCodeDisable = isAllowedDisableMode('code', allowedDisableModes);
  const canUseRecoveryDisable = isAllowedDisableMode('recovery', allowedDisableModes);
  const nextDisableMode =
    activeDisableMode === 'password' && canUseCodeDisable
      ? 'code'
      : activeDisableMode === 'code' && canUseRecoveryDisable
        ? 'recovery'
        : activeDisableMode === 'code' && canUsePasswordDisable
          ? 'password'
          : activeDisableMode === 'recovery' && canUsePasswordDisable
            ? 'password'
            : activeDisableMode === 'recovery' && canUseCodeDisable
              ? 'code'
              : null;
  const nextDisableModeLabel =
    nextDisableMode === 'password'
      ? 'Use password'
      : nextDisableMode === 'code'
        ? 'Use authenticator code'
        : nextDisableMode === 'recovery'
          ? 'Use recovery code'
          : '';
  const disableDescription =
    canUsePasswordDisable && !canUseCodeDisable
      ? 'This will make your account less secure. Enter your password to confirm.'
      : canUsePasswordDisable
        ? 'This will make your account less secure. Confirm with your password or a two-factor code.'
        : 'This will make your account less secure. Confirm with an authenticator or recovery code.';

  // Fetch status on mount
  useExternalEffect(() => {
    getStatus().catch(() => {
      // Error handled by hook
    });
  }, [getStatus]);

  const handleSetupComplete = useCallback(() => {
    setView('status');
    onStatusChange?.(true);
  }, [onStatusChange]);

  const resetDisableInputs = () => {
    setDisablePassword('');
    setDisableCode('');
    setDisableRecoveryCode('');
    setDisableMode(defaultDisableMode);
    setActionError(null);
  };

  const switchDisableMode = (nextMode: DisableMode) => {
    setDisablePassword('');
    setDisableCode('');
    setDisableRecoveryCode('');
    setDisableMode(nextMode);
    setActionError(null);
  };

  const getDisableConfirmation = () => {
    if (activeDisableMode === 'code') return { code: disableCode };
    if (activeDisableMode === 'recovery') return { recoveryCode: disableRecoveryCode };
    return { password: disablePassword };
  };

  const canSubmitDisable =
    activeDisableMode === 'code'
      ? /^\d{6}$/.test(disableCode)
      : activeDisableMode === 'recovery'
        ? disableRecoveryCode.trim().length > 0
        : disablePassword.length > 0;

  const handleDisable = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await disableTotp(getDisableConfirmation());
      setView('status');
      resetDisableInputs();
      onStatusChange?.(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to disable 2FA');
      setDisablePassword('');
      setDisableCode('');
      setDisableRecoveryCode('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerate = async (completedCode?: string) => {
    const code = completedCode ?? regenerateCode;
    if (regenerating.current || !/^\d{6}$/.test(code)) return;
    regenerating.current = true;
    setActionLoading(true);
    setActionError(null);
    try {
      const result = await regenerateBackupCodes(code);
      setNewRecoveryCodes(result.recoveryCodes);
      setRegenerateCode('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to regenerate codes');
      setRegenerateCode('');
    } finally {
      regenerating.current = false;
      setActionLoading(false);
    }
  };

  const handleCopyBackupCodes = async () => {
    if (newRecoveryCodes) {
      await navigator.clipboard.writeText(newRecoveryCodes.join('\n'));
    }
  };

  // Loading state
  if (isLoading && !status) {
    return (
      <div className={`cedros-totp-settings ${className}`}>
        <div className="cedros-totp-panel">
          <div className="cedros-totp-loading">
            <LoadingSpinner size="sm" />
            <span>Loading two-factor authentication…</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !status) {
    return (
      <div className={`cedros-totp-settings ${className}`}>
        <ErrorMessage error={error} onDismiss={clearError} />
        <button
          type="button"
          className="cedros-button cedros-button-primary cedros-button-md"
          onClick={() => getStatus()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Setup view
  if (view === 'setup') {
    return (
      <div className={`cedros-totp-settings ${className}`}>
        <TotpSetup onSuccess={handleSetupComplete} onCancel={() => setView('status')} />
      </div>
    );
  }

  // Disable confirmation view
  if (view === 'disable') {
    return (
      <div className={`cedros-totp-settings ${className}`}>
        <div className="cedros-totp-panel">
          <h3 className="cedros-totp-title">Disable two-factor authentication</h3>
          <p className="cedros-totp-description cedros-totp-warning">{disableDescription}</p>

          {actionError && (
            <div className="cedros-totp-error">
              <ErrorMessage
                error={{ code: 'UNKNOWN_ERROR', message: actionError }}
                onDismiss={() => setActionError(null)}
              />
            </div>
          )}

          <div className="cedros-totp-verify-input">
            {activeDisableMode === 'password' && (
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                disabled={actionLoading}
                autoFocus
              />
            )}

            {activeDisableMode === 'code' && (
              <OtpInput
                value={disableCode}
                onChange={setDisableCode}
                onComplete={() => undefined}
                disabled={actionLoading}
                autoFocus
              />
            )}

            {activeDisableMode === 'recovery' && (
              <>
                <label className="cedros-label" htmlFor="disable-recovery-code">
                  Recovery code
                </label>
                <input
                  id="disable-recovery-code"
                  type="text"
                  className="cedros-input"
                  placeholder="Enter recovery code"
                  value={disableRecoveryCode}
                  onChange={(e) => setDisableRecoveryCode(e.target.value)}
                  disabled={actionLoading}
                  autoFocus
                  autoComplete="one-time-code"
                />
              </>
            )}

            {nextDisableMode && (
              <button
                type="button"
                className="cedros-button cedros-button-ghost cedros-button-sm"
                onClick={() => switchDisableMode(nextDisableMode)}
                disabled={actionLoading}
              >
                {nextDisableModeLabel}
              </button>
            )}
          </div>

          <div className="cedros-totp-actions">
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-md"
              onClick={() => {
                setView('status');
                resetDisableInputs();
              }}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="cedros-button cedros-button-danger cedros-button-md"
              onClick={handleDisable}
              disabled={actionLoading || !canSubmitDisable}
            >
              {actionLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Disabling...</span>
                </>
              ) : (
                'Disable 2FA'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regenerate backup codes view
  if (view === 'regenerate') {
    // Show new codes after regeneration
    if (newRecoveryCodes) {
      return (
        <div className={`cedros-totp-settings ${className}`}>
          <div className="cedros-totp-panel">
            <h3 className="cedros-totp-title">New recovery codes</h3>
            <p className="cedros-totp-description">
              Save these codes in a secure place. Your old codes are no longer valid.
            </p>

            <div className="cedros-totp-backup-codes">
              {newRecoveryCodes.map((code, index) => (
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

            <div className="cedros-totp-actions">
              <button
                type="button"
                className="cedros-button cedros-button-primary cedros-button-md"
                onClick={() => {
                  setView('status');
                  setNewRecoveryCodes(null);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Code entry for regeneration
    return (
      <div className={`cedros-totp-settings ${className}`}>
        <div className="cedros-totp-panel">
          <h3 className="cedros-totp-title">Regenerate recovery codes</h3>
          <p className="cedros-totp-description">
            This will invalidate all existing recovery codes. Enter your authenticator code to
            confirm.
          </p>

          {actionError && (
            <div className="cedros-totp-error">
              <ErrorMessage
                error={{ code: 'UNKNOWN_ERROR', message: actionError }}
                onDismiss={() => setActionError(null)}
              />
            </div>
          )}

          <div className="cedros-totp-verify-input">
            <OtpInput
              value={regenerateCode}
              onChange={setRegenerateCode}
              onComplete={handleRegenerate}
              disabled={actionLoading}
              autoFocus
            />
          </div>

          <div className="cedros-totp-actions">
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-md"
              onClick={() => {
                setView('status');
                setRegenerateCode('');
                setActionError(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="cedros-button cedros-button-primary cedros-button-md"
              onClick={() => handleRegenerate()}
              disabled={actionLoading || !/^\d{6}$/.test(regenerateCode)}
            >
              {actionLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Regenerating...</span>
                </>
              ) : (
                'Regenerate codes'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main status view
  return (
    <div className={`cedros-totp-settings ${className}`}>
      <div className="cedros-totp-panel">
        <div className="cedros-totp-status-header">
          <div className="cedros-totp-status-info">
            <h3 className="cedros-totp-title">Two-factor authentication</h3>
            <p className="cedros-totp-description">
              Require a code from your authenticator app when you sign in with your password.
            </p>
          </div>
          <span
            className={`cedros-badge ${status?.enabled ? 'cedros-badge--ok' : 'cedros-badge--muted'}`}
          >
            {status?.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {status?.enabled ? (
          <div className="cedros-totp-enabled-actions">
            <div className="cedros-totp-description" style={{ marginTop: '0.25rem' }}>
              Recovery codes remaining: <strong>{status.recoveryCodesRemaining}</strong>
            </div>
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-md"
              onClick={() => setView('regenerate')}
            >
              Regenerate recovery codes
            </button>
            <button
              type="button"
              className="cedros-button cedros-button-danger-outline cedros-button-md"
              onClick={() => {
                setDisableMode(defaultDisableMode);
                setView('disable');
              }}
            >
              Disable 2FA
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="cedros-button cedros-button-primary cedros-button-md"
            onClick={() => setView('setup')}
          >
            Enable two-factor authentication
          </button>
        )}
      </div>
    </div>
  );
}
