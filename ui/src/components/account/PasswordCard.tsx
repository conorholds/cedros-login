/**
 * PasswordCard — security card for the account password.
 *
 * Accounts with a password get a "Change password" flow (current + new);
 * passwordless accounts (social/wallet/passkey) get a "Set a password" flow
 * (new only, via POST /set-password). Password presence is detected from the
 * user's credentials.
 */

import { useCallback, useState } from 'react';
import { useCredentials } from '../../hooks/useCredentials';
import { useSetPassword } from '../../hooks/useSetPassword';
import { ChangePasswordForm } from './ChangePasswordForm';
import { PasswordInput } from '../email/PasswordInput';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { validatePassword } from '../../utils/validation';

export interface PasswordCardProps {
  onPasswordChange?: () => void;
  className?: string;
}

type Mode = 'view' | 'change' | 'set';

export function PasswordCard({ onPasswordChange, className = '' }: PasswordCardProps) {
  const { credentials, fetchCredentials } = useCredentials();
  const hasPassword = credentials.some((c) => c.credentialType === 'password');
  const [mode, setMode] = useState<Mode>('view');

  if (mode === 'change') {
    return (
      <ChangePasswordForm
        className={className}
        onCancel={() => setMode('view')}
        onPasswordChange={() => {
          setMode('view');
          onPasswordChange?.();
        }}
      />
    );
  }

  if (mode === 'set') {
    return (
      <SetPasswordForm
        className={className}
        onCancel={() => setMode('view')}
        onDone={async () => {
          await fetchCredentials();
          setMode('view');
          onPasswordChange?.();
        }}
      />
    );
  }

  return (
    <div className={`cedros-account-card ${className}`.trim()}>
      <div className="cedros-field">
        <div className="cedros-field__head">
          <span className="cedros-field__label">Password</span>
          {hasPassword ? (
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-sm"
              onClick={() => setMode('change')}
            >
              Change password
            </button>
          ) : (
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-sm"
              onClick={() => setMode('set')}
            >
              Set a password
            </button>
          )}
        </div>
        <span className={`cedros-field__value${hasPassword ? '' : ' cedros-field__value--empty'}`}>
          {hasPassword ? '••••••••' : 'No password set'}
        </span>
        {!hasPassword && (
          <span className="cedros-field__help">
            Add a password so you can sign in with your email as well.
          </span>
        )}
      </div>
    </div>
  );
}

interface SetPasswordFormProps {
  onCancel: () => void;
  onDone: () => void | Promise<void>;
  className?: string;
}

function SetPasswordForm({ onCancel, onDone, className = '' }: SetPasswordFormProps) {
  const { setPassword, isLoading } = useSetPassword();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validation = validatePassword(newPassword);
  const matches = newPassword === confirmPassword;
  const canSubmit = validation.isValid && matches && confirmPassword.length > 0;

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setError(null);
    try {
      await setPassword(newPassword);
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set password.');
    }
  }, [canSubmit, newPassword, setPassword, onDone]);

  return (
    <div className={`cedros-profile-settings ${className}`.trim()}>
      <div className="cedros-profile-panel">
        <h3 className="cedros-profile-title">Set a password</h3>
        <p className="cedros-profile-description">
          Choose a password to enable email sign-in alongside your current methods.
        </p>
        {error && <div className="cedros-profile-error">{error}</div>}
        <div className="cedros-profile-form">
          <div className="cedros-profile-field">
            <PasswordInput
              label="New password"
              placeholder="Enter a new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              showStrengthMeter
              autoFocus
            />
          </div>
          <div className="cedros-profile-field">
            <PasswordInput
              label="Confirm password"
              placeholder="Re-enter the password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              error={confirmPassword.length > 0 && !matches ? 'Passwords do not match' : undefined}
            />
          </div>
        </div>
        <div className="cedros-profile-actions">
          <button
            type="button"
            className="cedros-button cedros-button-outline cedros-button-md"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cedros-button cedros-button-primary cedros-button-md"
            onClick={submit}
            disabled={isLoading || !canSubmit}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Set password'}
          </button>
        </div>
      </div>
    </div>
  );
}
