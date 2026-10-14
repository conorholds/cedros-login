/**
 * ChangePasswordForm — password change form with current/new/confirm fields.
 *
 * Extracted from ProfileTab to keep file sizes under the 400-line threshold.
 */

import { useState, useCallback } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { PasswordInput } from '../email/PasswordInput';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { validatePassword } from '../../utils/validation';

export interface ChangePasswordFormProps {
  /** Called after password is changed successfully */
  onPasswordChange?: () => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Additional CSS class */
  className?: string;
}

export function ChangePasswordForm({
  onPasswordChange,
  onCancel,
  className = '',
}: ChangePasswordFormProps) {
  const { isLoading, error, changePassword, clearError } = useProfile();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    passwordValidation.isValid &&
    passwordsMatch;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setActionError(null);
    setSuccessMessage(null);

    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password changed successfully. Other sessions have been logged out.');
      onPasswordChange?.();

      setTimeout(() => onCancel(), 2000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to change password');
    }
  }, [canSubmit, currentPassword, newPassword, changePassword, onPasswordChange, onCancel]);

  const handleCancel = useCallback(() => {
    setActionError(null);
    clearError();
    onCancel();
  }, [clearError, onCancel]);

  return (
    <div className={`cedros-profile-settings ${className}`}>
      <div className="cedros-profile-panel">
        <h3 className="cedros-profile-title">Change password</h3>
        <p className="cedros-profile-description">
          Enter your current password and choose a new one. This will log you out of other devices.
        </p>

        {(actionError || error) && (
          <div className="cedros-profile-error">
            <ErrorMessage
              error={{ code: 'UNKNOWN_ERROR', message: actionError || error?.message || '' }}
              onDismiss={() => {
                setActionError(null);
                clearError();
              }}
            />
          </div>
        )}

        {successMessage && (
          <div className="cedros-profile-success">
            <span className="cedros-profile-success-icon">&#10003;</span>
            {successMessage}
          </div>
        )}

        <div className="cedros-profile-form">
          <div className="cedros-profile-field">
            <PasswordInput
              label="Current password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <div className="cedros-profile-field">
            <PasswordInput
              label="New password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              showStrengthMeter
            />
          </div>
          <div className="cedros-profile-field">
            <PasswordInput
              label="Confirm new password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              error={
                confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : undefined
              }
            />
          </div>
        </div>

        <div className="cedros-profile-actions">
          <button
            type="button"
            className="cedros-button cedros-button-outline cedros-button-md"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cedros-button cedros-button-primary cedros-button-md"
            onClick={handleSubmit}
            disabled={isLoading || !canSubmit}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Changing...</span>
              </>
            ) : (
              'Change password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
