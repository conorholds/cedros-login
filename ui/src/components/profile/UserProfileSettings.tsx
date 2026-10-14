/**
 * User Profile Settings component
 *
 * Allows users to:
 * - View their profile information
 * - Change their password
 * - Upload a profile picture (avatar)
 */

import { useState, useCallback } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';
import { PasswordInput } from '../email/PasswordInput';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { validatePassword } from '../../utils/validation';
import { AvatarUploader } from '../account/AvatarUploader';

export interface UserProfileSettingsProps {
  /** Called when password is changed successfully */
  onPasswordChange?: () => void;
  /** Called when user requests to close/cancel */
  onClose?: () => void;
  /** Additional CSS class */
  className?: string;
}

type SettingsView = 'main' | 'change-password';

/**
 * User profile settings panel.
 *
 * Shows user profile information and provides controls for
 * changing password and managing profile settings.
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   return (
 *     <UserProfileSettings
 *       onPasswordChange={() => console.log('Password changed')}
 *       onClose={() => navigate('/dashboard')}
 *     />
 *   );
 * }
 * ```
 */
export function UserProfileSettings({
  onPasswordChange,
  onClose,
  className = '',
}: UserProfileSettingsProps) {
  const { user } = useAuth();
  const { isLoading, error, changePassword, clearError } = useProfile();

  const [view, setView] = useState<SettingsView>('main');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password validation
  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmitPassword =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    passwordValidation.isValid &&
    passwordsMatch;

  const handlePasswordChange = useCallback(async () => {
    if (!canSubmitPassword) return;

    setActionError(null);
    setSuccessMessage(null);

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      // Clear form and show success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password changed successfully. Other sessions have been logged out.');
      onPasswordChange?.();

      // Return to main view after short delay
      setTimeout(() => {
        setView('main');
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to change password');
    }
  }, [canSubmitPassword, currentPassword, newPassword, changePassword, onPasswordChange]);

  const handleCancelPasswordChange = useCallback(() => {
    setView('main');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setActionError(null);
    clearError();
  }, [clearError]);

  // Change Password view
  if (view === 'change-password') {
    return (
      <div className={`cedros-profile-settings ${className}`}>
        <div className="cedros-profile-panel">
          <h3 className="cedros-profile-title">Change password</h3>
          <p className="cedros-profile-description">
            Enter your current password and choose a new one. This will log you out of other
            devices.
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
                  confirmPassword.length > 0 && !passwordsMatch
                    ? 'Passwords do not match'
                    : undefined
                }
              />
            </div>
          </div>

          <div className="cedros-profile-actions">
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-md"
              onClick={handleCancelPasswordChange}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="cedros-button cedros-button-primary cedros-button-md"
              onClick={handlePasswordChange}
              disabled={isLoading || !canSubmitPassword}
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

  // Main profile view
  return (
    <div className={`cedros-profile-settings ${className}`}>
      <div className="cedros-profile-panel">
        <div className="cedros-profile-header">
          <AvatarUploader />
          <div className="cedros-profile-info">
            <h3 className="cedros-profile-name">{user?.name || 'User'}</h3>
            <p className="cedros-profile-email">{user?.email}</p>
          </div>
        </div>

        {actionError && (
          <div className="cedros-profile-error">
            <ErrorMessage
              error={{ code: 'UNKNOWN_ERROR', message: actionError }}
              onDismiss={() => setActionError(null)}
            />
          </div>
        )}

        <div className="cedros-profile-section">
          <h4 className="cedros-profile-section-title">Account</h4>

          <div className="cedros-profile-row">
            <div className="cedros-profile-row-content">
              <span className="cedros-profile-row-label">Email</span>
              <span className="cedros-profile-row-value">{user?.email || 'Not set'}</span>
            </div>
          </div>

          <div className="cedros-profile-row">
            <div className="cedros-profile-row-content">
              <span className="cedros-profile-row-label">Password</span>
              <span className="cedros-profile-row-value">••••••••</span>
            </div>
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-sm"
              onClick={() => setView('change-password')}
            >
              Change
            </button>
          </div>
        </div>

        {onClose && (
          <div className="cedros-profile-footer">
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-md"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
