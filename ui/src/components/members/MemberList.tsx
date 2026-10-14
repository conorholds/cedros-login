import { useState, useCallback, useMemo } from 'react';
import type { Member, OrgRole, DisplayError } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { sanitizeImageUrl } from '../../utils/sanitization';

type SortField = 'name' | 'role' | 'joinedAt';
type SortOrder = 'asc' | 'desc';

export interface MemberListProps {
  /** List of members to display */
  members: Member[];
  /** Current user's ID (to prevent self-actions) */
  currentUserId?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: DisplayError;
  /** Whether the current user can manage members */
  canManage?: boolean;
  /** Whether the current user can change roles */
  canChangeRoles?: boolean;
  /** Callback when role is updated */
  onUpdateRole?: (userId: string, role: OrgRole) => Promise<void>;
  /** Callback when member is removed */
  onRemove?: (userId: string) => Promise<void>;
  /** Additional CSS class */
  className?: string;
}

const ROLE_OPTIONS: OrgRole[] = ['owner', 'admin', 'member'];

/**
 * Display and manage organization members.
 *
 * @example
 * ```tsx
 * function TeamMembers() {
 *   const { activeOrg, hasPermission } = useOrgs();
 *   const { members, isLoading, error, updateMemberRole, removeMember } = useMembers(activeOrg?.id);
 *   const { user } = useAuth();
 *
 *   return (
 *     <MemberList
 *       members={members}
 *       currentUserId={user?.id}
 *       isLoading={isLoading}
 *       error={error?.message}
 *       canManage={hasPermission('member:remove')}
 *       canChangeRoles={hasPermission('member:role_change')}
 *       onUpdateRole={updateMemberRole}
 *       onRemove={removeMember}
 *     />
 *   );
 * }
 * ```
 */
export function MemberList({
  members,
  currentUserId,
  isLoading = false,
  error,
  canManage = false,
  canChangeRoles = false,
  onUpdateRole,
  onRemove,
  className = '',
}: MemberListProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedMembers = useMemo(() => {
    const roleOrder: Record<OrgRole, number> = { owner: 0, admin: 1, member: 2 };
    return [...members].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'name':
          aVal = (a.user.name || a.user.email || '').toLowerCase();
          bVal = (b.user.name || b.user.email || '').toLowerCase();
          break;
        case 'role':
          aVal = roleOrder[a.role] ?? 99;
          bVal = roleOrder[b.role] ?? 99;
          break;
        case 'joinedAt':
          aVal = new Date(a.joinedAt).getTime();
          bVal = new Date(b.joinedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [members, sortField, sortOrder]);

  if (isLoading && members.length === 0) {
    return (
      <div className={`cedros-member-list cedros-member-list-loading ${className}`}>
        <LoadingSpinner />
        <span>Loading members...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`cedros-member-list ${className}`}>
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className={`cedros-member-list cedros-member-list-empty ${className}`}>
        <p>No members found.</p>
      </div>
    );
  }

  return (
    <div className={`cedros-member-list ${className}`}>
      <table className="cedros-member-table">
        <thead>
          <tr>
            <th>
              <button
                type="button"
                className={`cedros-admin-sort-button ${sortField === 'name' ? 'cedros-admin-sort-active' : ''}`}
                onClick={() => toggleSort('name')}
              >
                Member{' '}
                <span className="cedros-admin-sort-icon">
                  {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </button>
            </th>
            <th>
              <button
                type="button"
                className={`cedros-admin-sort-button ${sortField === 'role' ? 'cedros-admin-sort-active' : ''}`}
                onClick={() => toggleSort('role')}
              >
                Role{' '}
                <span className="cedros-admin-sort-icon">
                  {sortField === 'role' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </button>
            </th>
            <th>
              <button
                type="button"
                className={`cedros-admin-sort-button ${sortField === 'joinedAt' ? 'cedros-admin-sort-active' : ''}`}
                onClick={() => toggleSort('joinedAt')}
              >
                Joined{' '}
                <span className="cedros-admin-sort-icon">
                  {sortField === 'joinedAt' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </button>
            </th>
            {(canManage || canChangeRoles) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedMembers.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isCurrentUser={member.userId === currentUserId}
              canManage={canManage}
              canChangeRoles={canChangeRoles}
              onUpdateRole={onUpdateRole}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Member row component
interface MemberRowProps {
  member: Member;
  isCurrentUser: boolean;
  canManage: boolean;
  canChangeRoles: boolean;
  onUpdateRole?: (userId: string, role: OrgRole) => Promise<void>;
  onRemove?: (userId: string) => Promise<void>;
}

function MemberRow({
  member,
  isCurrentUser,
  canManage,
  canChangeRoles,
  onUpdateRole,
  onRemove,
}: MemberRowProps) {
  const { confirm, dialogProps } = useConfirmDialog();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<OrgRole>(member.role);

  const handleRoleChange = useCallback(
    async (newRole: OrgRole) => {
      if (!onUpdateRole || newRole === member.role) return;

      setIsUpdating(true);
      try {
        await onUpdateRole(member.userId, newRole);
        setSelectedRole(newRole);
      } catch {
        // Revert on error
        setSelectedRole(member.role);
      } finally {
        setIsUpdating(false);
      }
    },
    [member.userId, member.role, onUpdateRole]
  );

  const handleRemove = useCallback(async () => {
    if (!onRemove) return;

    const confirmed = await confirm({
      title: 'Remove member?',
      description: `${member.user.name || member.user.email} will be removed from this organization.`,
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await onRemove(member.userId);
    } finally {
      setIsUpdating(false);
    }
  }, [confirm, member.userId, member.user.name, member.user.email, onRemove]);

  const isOwner = member.role === 'owner';
  const canModify = !isCurrentUser && !isOwner;

  return (
    <tr className={`cedros-member-row ${isCurrentUser ? 'cedros-member-row-current' : ''}`}>
      <td className="cedros-member-info">
        <MemberAvatar user={member.user} />
        <div className="cedros-member-details">
          <span className="cedros-member-name">
            {member.user.name || 'Unknown'}
            {isCurrentUser && <span className="cedros-member-you">(you)</span>}
          </span>
          <span className="cedros-member-email">{member.user.email}</span>
        </div>
      </td>
      <td className="cedros-member-role">
        {canChangeRoles && canModify && onUpdateRole ? (
          <select
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value as OrgRole)}
            disabled={isUpdating}
            className="cedros-role-select"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        ) : (
          <span className={`cedros-role-badge cedros-role-badge-${member.role}`}>
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </span>
        )}
      </td>
      <td className="cedros-member-joined">{formatDate(member.joinedAt)}</td>
      {(canManage || canChangeRoles) && (
        <td className="cedros-member-actions">
          {canManage && canModify && onRemove && (
            <button
              type="button"
              className="cedros-button cedros-button-danger cedros-button-sm"
              onClick={handleRemove}
              disabled={isUpdating}
              aria-label={`Remove ${member.user.name || member.user.email}`}
            >
              {isUpdating ? <LoadingSpinner size="sm" /> : 'Remove'}
            </button>
          )}
        </td>
      )}
      <ConfirmDialog {...dialogProps} />
    </tr>
  );
}

// Helper components
function MemberAvatar({ user }: { user: Member['user'] }) {
  // Cache sanitized URL and verify before use (blocks dangerous protocols)
  const sanitizedPicture = sanitizeImageUrl(user.picture);
  if (sanitizedPicture) {
    return (
      <img
        src={sanitizedPicture}
        alt={user.name || user.email || 'Member'}
        className="cedros-member-avatar"
        referrerPolicy="no-referrer"
      />
    );
  }

  const initial = (user.name?.[0] || user.email?.[0] || '?').toUpperCase();
  return <div className="cedros-member-avatar-placeholder">{initial}</div>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
