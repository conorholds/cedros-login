/**
 * ProfileTab — editable profile view with avatar, name, email, and password.
 *
 * Three internal states:
 * - "view": read-only display with edit pencil on name
 * - "edit": inline name editing with Save/Cancel
 * - "change-password": delegates to ChangePasswordForm
 *
 * Detects whether the user has a password credential:
 * - Has password → "Change" button → ChangePasswordForm
 * - No password → "Add password" button → sends forgot-password email
 */

import { useState, useCallback } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';
import { useCredentials } from '../../hooks/useCredentials';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { ChangePasswordForm } from './ChangePasswordForm';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { getInitials, getDisplayName } from '../profile/profileHelpers';

export interface ProfileTabProps {
  /** Called after password is changed successfully */
  onPasswordChange?: () => void;
  /** Additional CSS class */
  className?: string;
}

type ProfileView = 'view' | 'edit' | 'change-password';

export function ProfileTab({ onPasswordChange, className = '' }: ProfileTabProps) {
  const { user, refreshUser } = useAuth();
  const { isLoading, error, updateProfile, clearError } = useProfile();
  const { credentials } = useCredentials();
  const {
    forgotPassword,
    isLoading: isAddingPassword,
    isSuccess: addPasswordSent,
    reset: resetAddPassword,
  } = usePasswordReset();

  const hasPassword = credentials.some((c) => c.credentialType === 'password');

  const [view, setView] = useState<ProfileView>('view');
  const [editName, setEditName] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStartEdit = useCallback(() => {
    setEditName(user?.name || '');
    setView('edit');
    setActionError(null);
  }, [user?.name]);

  const handleSaveName = useCallback(async () => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    setActionError(null);
    try {
      await updateProfile({ name: trimmed });
      await refreshUser();
      setView('view');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update name');
    }
  }, [editName, updateProfile, refreshUser]);

  const handleCancelEdit = useCallback(() => {
    setView('view');
    setEditName('');
    setActionError(null);
    clearError();
  }, [clearError]);

  const handleAddPassword = async () => {
    if (!user?.email) return;
    setActionError(null);
    try {
      await forgotPassword(user.email);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to send password setup email');
    }
  };

  // --- Change Password View ---
  if (view === 'change-password') {
    return (
      <ChangePasswordForm
        onPasswordChange={onPasswordChange}
        onCancel={() => setView('view')}
        className={className}
      />
    );
  }

  // --- Main View (view + edit modes share layout) ---
  return (
    <div className={`cedros-profile-settings ${className}`}>
      <div className="cedros-profile-panel">
        <div className="cedros-profile-header">
          <div className="cedros-profile-avatar-container">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name || 'Profile'}
                className="cedros-profile-avatar"
              />
            ) : (
              <div className="cedros-profile-avatar cedros-profile-avatar-fallback">
                {getInitials(user)}
              </div>
            )}
          </div>
          <div className="cedros-profile-info">
            {view === 'edit' ? (
              <div className="cedros-profile-name-edit">
                <input
                  type="text"
                  className="cedros-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <div className="cedros-profile-name-edit-actions">
                  <button
                    type="button"
                    className="cedros-button cedros-button-primary cedros-button-sm"
                    onClick={handleSaveName}
                    disabled={isLoading || !editName.trim()}
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="cedros-button cedros-button-outline cedros-button-sm"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="cedros-profile-name-row">
                <h3 className="cedros-profile-name">{getDisplayName(user)}</h3>
                <button
                  type="button"
                  className="cedros-profile-edit-btn"
                  onClick={handleStartEdit}
                  title="Edit name"
                  aria-label="Edit name"
                >
                  <EditPencilIcon />
                </button>
              </div>
            )}
            <p className="cedros-profile-email">{user?.name ? user.email : null}</p>
          </div>
        </div>

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
              <span className="cedros-profile-row-value">
                {hasPassword ? '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' : 'Not set'}
              </span>
            </div>
            {hasPassword ? (
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-sm"
                onClick={() => {
                  setView('change-password');
                  setActionError(null);
                }}
              >
                Change
              </button>
            ) : addPasswordSent ? (
              <span className="cedros-profile-row-sent">
                Check your email
                <button
                  type="button"
                  className="cedros-profile-row-sent-dismiss"
                  onClick={resetAddPassword}
                  aria-label="Dismiss"
                >
                  &times;
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-sm"
                onClick={handleAddPassword}
                disabled={isAddingPassword}
              >
                {isAddingPassword ? <LoadingSpinner size="sm" /> : 'Add password'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Inline icon ---
function EditPencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.474 5.408l2.118 2.117m-.756-3.982L12.109 9.27a2.118 2.118 0 00-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 10-2.621-2.621z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 15v3a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
