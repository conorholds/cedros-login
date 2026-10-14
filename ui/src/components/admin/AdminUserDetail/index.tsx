import { useExternalEffect } from '../../../hooks/effects';
/**
 * Admin user detail component
 *
 * Displays detailed information about a specific user including:
 * - Account information (email, auth methods, admin status)
 * - Login-owned referral metadata
 *
 * Requires system admin privileges.
 */

import { useState, useCallback } from 'react';
import { useAdminUsers } from '../../../hooks/useAdminUsers';
import type { AdminUser } from '../../../types';
import { UserInfoPanel } from './panels';
import { ConfirmDialog } from '../../shared/ConfirmDialog';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useI18n } from '../../../i18n';

export interface AdminUserDetailProps {
  /** User ID to display */
  userId: string;
  /** Callback when back button is clicked */
  onBack: () => void;
  /** Current user's ID (to prevent self-demotion) */
  currentUserId?: string;
  /** Callback when edit is clicked (parent handles modal) */
  onEditUser?: (user: AdminUser) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Admin user detail display
 *
 * Shows login-owned user information and admin actions.
 */
export function AdminUserDetail(props: AdminUserDetailProps) {
  return <AdminUserDetailView key={props.userId} {...props} />;
}

function AdminUserDetailView({
  userId,
  onBack,
  currentUserId,
  onEditUser,
  className = '',
}: AdminUserDetailProps) {
  const { t, message } = useI18n();
  const { confirm, dialogProps } = useConfirmDialog();
  const { isLoading, getUser, deleteUser, forcePasswordReset, clearError } = useAdminUsers();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getUser(userId);
      setUser(userData);
      setUserError(null);
    } catch (err) {
      setUserError(err instanceof Error ? err.message : t.admin.users.failedToLoadUser);
    }
  }, [userId, getUser, t.admin.users.failedToLoadUser]);

  // Initial load
  useExternalEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleDelete = async () => {
    if (!user) return;
    if (user.id === currentUserId) {
      setActionError(t.admin.users.cannotDeleteSelf);
      return;
    }
    if (user.isSystemAdmin) {
      setActionError(t.admin.users.cannotDeleteSystemAdmin);
      return;
    }

    const confirmed = await confirm({
      title: message(t.admin.users.deleteConfirm, {
        name: user.name || user.email || t.admin.users.unknown,
      }),
      confirmLabel: t.common.delete,
      destructive: true,
    });
    if (!confirmed) return;

    setActionError(null);
    setActionStatus(null);
    setActionInProgress(true);
    try {
      await deleteUser(user.id);
      onBack();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setActionError(t.admin.users.noEmailAddress);
      return;
    }

    const confirmed = await confirm({
      title: message(t.admin.users.sendResetConfirm, { email: user.email }),
      confirmLabel: t.common.confirm,
    });
    if (!confirmed) return;

    setActionError(null);
    setActionStatus(null);
    setActionInProgress(true);
    try {
      await forcePasswordReset(user.id);
      setActionStatus(t.admin.users.resetSent);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setActionInProgress(false);
    }
  };

  // Critical error - user fetch failed
  if (userError) {
    return (
      <div className={`cedros-admin-user-detail cedros-admin-user-detail-error ${className}`}>
        <button
          type="button"
          className="cedros-button cedros-button-outline cedros-button-sm"
          onClick={onBack}
        >
          {t.admin.users.back}
        </button>
        <p role="alert" className="cedros-admin-error">
          {userError}
        </p>
        <button
          type="button"
          className="cedros-button cedros-button-outline"
          onClick={() => {
            clearError();
            setUserError(null);
            fetchUser();
          }}
        >
          {t.common.retry}
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading && !user) {
    return (
      <div className={`cedros-admin-user-detail cedros-admin-user-detail-loading ${className}`}>
        <span className="cedros-admin-loading-indicator" />
        <span className="cedros-admin-loading-text">{t.admin.users.loadingUser}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`cedros-admin-user-detail ${className}`}>
        <button
          type="button"
          className="cedros-button cedros-button-outline cedros-button-sm"
          onClick={onBack}
        >
          {t.admin.users.back}
        </button>
        <p className="cedros-admin-empty-message">{t.admin.users.userNotFound}</p>
      </div>
    );
  }

  const isCurrentUser = user.id === currentUserId;

  return (
    <div className={`cedros-admin-user-detail ${className}`}>
      {/* Header */}
      <div className="cedros-admin-user-detail-header">
        <button
          type="button"
          className="cedros-button cedros-button-outline cedros-button-sm cedros-admin-back-btn"
          onClick={onBack}
        >
          {t.admin.users.backToUsers}
        </button>
        <div className="cedros-admin-user-detail-actions">
          {onEditUser && (
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-sm"
              onClick={() => onEditUser(user)}
              disabled={actionInProgress}
            >
              {t.common.edit}
            </button>
          )}
          {user.email && (
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-sm"
              onClick={handlePasswordReset}
              disabled={actionInProgress}
            >
              {t.admin.users.resetPassword}
            </button>
          )}
          {!isCurrentUser && !user.isSystemAdmin && (
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-sm cedros-admin-btn-danger"
              onClick={handleDelete}
              disabled={actionInProgress}
            >
              {t.common.delete}
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <p role="alert" className="cedros-admin-error">
          {actionError}
        </p>
      )}
      {actionStatus && <p role="status">{actionStatus}</p>}

      {/* User Info Section */}
      <UserInfoPanel user={user} isCurrentUser={isCurrentUser} />

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
