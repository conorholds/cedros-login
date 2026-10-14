import { useExternalEffect } from '../../hooks/effects';
import { useState, useCallback, useRef } from 'react';
import type { Invite, DisplayError } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { getInviteTargetLabel } from './inviteLabels';

export interface InviteListProps {
  /** List of pending invites */
  invites: Invite[];
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: DisplayError;
  /** Whether the current user can manage invites */
  canManage?: boolean;
  /** Callback when invite is cancelled */
  onCancel?: (inviteId: string) => Promise<void>;
  /** Callback when invite is resent */
  onResend?: (inviteId: string) => Promise<void>;
  /** Additional CSS class */
  className?: string;
}

/**
 * Display and manage pending organization invites.
 *
 * @example
 * ```tsx
 * function PendingInvites() {
 *   const { activeOrg, hasPermission } = useOrgs();
 *   const { invites, isLoading, error, cancelInvite, resendInvite } = useInvites(activeOrg?.id);
 *
 *   return (
 *     <InviteList
 *       invites={invites}
 *       isLoading={isLoading}
 *       error={error?.message}
 *       canManage={hasPermission('invite:cancel')}
 *       onCancel={cancelInvite}
 *       onResend={resendInvite}
 *     />
 *   );
 * }
 * ```
 */
export function InviteList({
  invites,
  isLoading = false,
  error,
  canManage = false,
  onCancel,
  onResend,
  className = '',
}: InviteListProps) {
  if (isLoading && invites.length === 0) {
    return (
      <div className={`cedros-invite-list cedros-invite-list-loading ${className}`}>
        <LoadingSpinner />
        <span>Loading invites...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`cedros-invite-list ${className}`}>
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className={`cedros-invite-list cedros-invite-list-empty ${className}`}>
        <p>
          {canManage
            ? 'No pending invites. Use the invite form to send one.'
            : 'No pending invites.'}
        </p>
      </div>
    );
  }

  return (
    <div className={`cedros-invite-list ${className}`}>
      <ul className="cedros-invite-items">
        {invites.map((invite) => (
          <InviteItem
            key={invite.id}
            invite={invite}
            canManage={canManage}
            onCancel={onCancel}
            onResend={onResend}
          />
        ))}
      </ul>
    </div>
  );
}

// Invite item component
interface InviteItemProps {
  invite: Invite;
  canManage: boolean;
  onCancel?: (inviteId: string) => Promise<void>;
  onResend?: (inviteId: string) => Promise<void>;
}

function InviteItem({ invite, canManage, onCancel, onResend }: InviteItemProps) {
  const { confirm, dialogProps } = useConfirmDialog();
  const [isUpdating, setIsUpdating] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const resendTimerRef = useRef<number | null>(null);

  const isExpired = new Date(invite.expiresAt) < new Date();
  const inviteTarget = getInviteTargetLabel(invite);

  const handleCancel = useCallback(async () => {
    if (!onCancel) return;

    const confirmed = await confirm({
      title: 'Cancel invite?',
      description: `The invite for ${inviteTarget} will be revoked.`,
      confirmLabel: 'Cancel invite',
      cancelLabel: 'Keep invite',
      destructive: true,
    });
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await onCancel(invite.id);
    } finally {
      setIsUpdating(false);
    }
  }, [confirm, invite.id, inviteTarget, onCancel]);

  const handleResend = useCallback(async () => {
    if (!onResend) return;

    setIsUpdating(true);
    setResendSuccess(false);
    try {
      await onResend(invite.id);
      setResendSuccess(true);
      if (resendTimerRef.current !== null) {
        window.clearTimeout(resendTimerRef.current);
      }
      resendTimerRef.current = window.setTimeout(() => {
        setResendSuccess(false);
        resendTimerRef.current = null;
      }, 3000);
    } finally {
      setIsUpdating(false);
    }
  }, [invite.id, onResend]);

  useExternalEffect(() => {
    return () => {
      if (resendTimerRef.current !== null) {
        window.clearTimeout(resendTimerRef.current);
        resendTimerRef.current = null;
      }
    };
  }, []);

  return (
    <li className={`cedros-invite-item ${isExpired ? 'cedros-invite-item-expired' : ''}`}>
      <div className="cedros-invite-item-info">
        <div className="cedros-invite-item-main">
          <span className="cedros-invite-item-email">{inviteTarget}</span>
          <span className={`cedros-role-badge cedros-role-badge-${invite.role}`}>
            {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
          </span>
          {isExpired && <span className="cedros-invite-expired-badge">Expired</span>}
        </div>
        <div className="cedros-invite-item-meta">
          <span className="cedros-invite-item-date">
            {/* TYPE-05: invitedByName removed - backend doesn't populate it */}
            Invited {formatDate(invite.createdAt)}
          </span>
          {!isExpired && (
            <span className="cedros-invite-item-expires">
              Expires {formatRelativeTime(invite.expiresAt)}
            </span>
          )}
        </div>
      </div>

      {canManage && (
        <div className="cedros-invite-item-actions">
          {resendSuccess && <span className="cedros-invite-resend-success">Sent!</span>}
          {onResend && !isExpired && (
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-sm"
              onClick={handleResend}
              disabled={isUpdating}
              aria-label={`Resend invite to ${inviteTarget}`}
            >
              {isUpdating ? <LoadingSpinner size="sm" /> : 'Resend'}
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              className="cedros-button cedros-button-danger cedros-button-sm"
              onClick={handleCancel}
              disabled={isUpdating}
              aria-label={`Cancel invite for ${inviteTarget}`}
            >
              Cancel
            </button>
          )}
        </div>
      )}
      <ConfirmDialog {...dialogProps} />
    </li>
  );
}

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'tomorrow';
  } else if (diffDays < 7) {
    return `in ${diffDays} days`;
  } else {
    return formatDate(dateString);
  }
}
