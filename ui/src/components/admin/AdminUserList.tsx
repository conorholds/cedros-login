import { useExternalEffect } from '../../hooks/effects';
/**
 * Admin user list component
 *
 * Displays all registered users in the system with management actions.
 * Requires system admin privileges.
 */

import { useState, useCallback, useMemo } from 'react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import type { AdminUser, ListAdminUsersResponse } from '../../types';
import { useI18n } from '../../i18n';

type SortField = 'name' | 'createdAt' | 'lastLoginAt';
type SortOrder = 'asc' | 'desc';

export interface AdminUserListProps {
  /** Number of items per page (default: 20) */
  pageSize?: number;
  /** Current user's ID (to highlight current user) */
  currentUserId?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when list is loaded */
  onLoad?: (response: ListAdminUsersResponse) => void;
  /** Callback when a user is clicked */
  onUserClick?: (user: AdminUser) => void;
}

function formatUserDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function truncateId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

function getSortValue(field: SortField, sortField: SortField, sortOrder: SortOrder) {
  if (field !== sortField) return 'none';
  return sortOrder === 'asc' ? 'ascending' : 'descending';
}

/**
 * Admin user list display
 *
 * Shows all registered users.
 */
export function AdminUserList({
  pageSize = 20,
  currentUserId,
  className = '',
  onLoad,
  onUserClick,
}: AdminUserListProps) {
  const { t, locale, message } = useI18n();
  const { users, total, isLoading, error, listUsers, clearError } = useAdminUsers();

  const [offset, setOffset] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const nameCollator = useMemo(
    () => new Intl.Collator(locale, { sensitivity: 'base', numeric: true }),
    [locale]
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Client-side sort applies only to the current page of results.
  // For cross-page sorting, add server-side ORDER BY with sort parameters.
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let aVal: string | number | null;
      let bVal: string | number | null;

      switch (sortField) {
        case 'name':
          return sortOrder === 'asc'
            ? nameCollator.compare(a.name || a.email || '', b.name || b.email || '')
            : nameCollator.compare(b.name || b.email || '', a.name || a.email || '');
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'lastLoginAt':
          aVal = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          bVal = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortField, sortOrder, nameCollator]);

  const fetchUsers = useCallback(async () => {
    try {
      const result = await listUsers({ limit: pageSize, offset });
      onLoad?.(result);
      setLoadError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setLoadError(err instanceof Error ? err.message : t.admin.users.loadFailed);
    }
  }, [pageSize, offset, listUsers, onLoad, t.admin.users.loadFailed]);

  // Reset offset when page size changes
  useExternalEffect(() => {
    setOffset(0);
  }, [pageSize]);

  // Fetch on mount and when dependencies change
  useExternalEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  const goToPage = (page: number) => {
    const newOffset = (page - 1) * pageSize;
    setOffset(Math.max(0, Math.min(newOffset, Math.max(0, total - 1))));
  };

  // Error state
  if (loadError || error) {
    return (
      <div className={`cedros-admin-user-list cedros-admin-user-list-error ${className}`}>
        <p className="cedros-admin-error" role="alert">
          {loadError || error?.message}
        </p>
        <button
          type="button"
          className="cedros-button cedros-button-outline"
          onClick={() => {
            clearError();
            setLoadError(null);
            fetchUsers();
          }}
        >
          {t.common.retry}
        </button>
      </div>
    );
  }

  // Loading state (initial load only)
  if (isLoading && users.length === 0) {
    return (
      <div
        className={`cedros-admin-user-list cedros-admin-user-list-loading ${className}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="cedros-admin-loading-indicator" />
        <span className="cedros-admin-loading-text">{t.admin.users.loading}</span>
      </div>
    );
  }

  return (
    <div className={`cedros-admin-user-list ${className}`}>
      <div className="cedros-admin-user-list-header">
        <h4 className="cedros-admin-user-list-title">{t.admin.users.allUsers}</h4>
        <div className="cedros-admin-user-list-actions">
          <span className="cedros-admin-queue-count">
            {message(t.admin.users.userCount, { count: total })}
          </span>
          <button
            type="button"
            className="cedros-admin__stats-bar-refresh"
            onClick={fetchUsers}
            disabled={isLoading}
            title={t.admin.users.refreshList}
            aria-label={t.admin.users.refreshList}
          >
            {isLoading ? '...' : '↻'}
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="cedros-admin-empty">
          <p className="cedros-admin-empty-message">{t.admin.users.empty}</p>
        </div>
      ) : (
        <>
          <div className="cedros-admin-user-table" role="table" aria-label={t.admin.users.allUsers}>
            <div className="cedros-admin-user-thead" role="row">
              <div
                className="cedros-admin-user-th"
                role="columnheader"
                aria-sort={getSortValue('name', sortField, sortOrder)}
              >
                <button
                  type="button"
                  className={`cedros-admin-sort-button ${sortField === 'name' ? 'cedros-admin-sort-active' : ''}`}
                  onClick={() => toggleSort('name')}
                  aria-label={t.admin.users.sortByUser}
                >
                  {t.admin.users.userColumn}{' '}
                  <span className="cedros-admin-sort-icon">
                    {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </button>
              </div>
              <div
                className="cedros-admin-user-th"
                role="columnheader"
                aria-sort={getSortValue('createdAt', sortField, sortOrder)}
              >
                <button
                  type="button"
                  className={`cedros-admin-sort-button ${sortField === 'createdAt' ? 'cedros-admin-sort-active' : ''}`}
                  onClick={() => toggleSort('createdAt')}
                  aria-label={t.admin.users.sortByRegisteredDate}
                >
                  {t.admin.users.registered}{' '}
                  <span className="cedros-admin-sort-icon">
                    {sortField === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </button>
              </div>
              <div
                className="cedros-admin-user-th"
                role="columnheader"
                aria-sort={getSortValue('lastLoginAt', sortField, sortOrder)}
              >
                <button
                  type="button"
                  className={`cedros-admin-sort-button ${sortField === 'lastLoginAt' ? 'cedros-admin-sort-active' : ''}`}
                  onClick={() => toggleSort('lastLoginAt')}
                  aria-label={t.admin.users.sortByLastLogin}
                >
                  {t.admin.users.lastLogin}{' '}
                  <span className="cedros-admin-sort-icon">
                    {sortField === 'lastLoginAt' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </button>
              </div>
            </div>
            <div role="rowgroup">
              {sortedUsers.map((user) => {
                const isCurrentUser = user.id === currentUserId;

                return (
                  <div
                    key={user.id}
                    className={`cedros-admin-user-row ${isCurrentUser ? 'cedros-admin-user-row-current' : ''}`}
                    onClick={() => onUserClick?.(user)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onUserClick?.(user);
                      }
                    }}
                    role="row"
                    tabIndex={onUserClick ? 0 : undefined}
                    aria-label={
                      onUserClick
                        ? message(t.admin.users.openUser, {
                            name: user.name || user.email || truncateId(user.id),
                          })
                        : undefined
                    }
                  >
                    <div className="cedros-admin-user-td cedros-admin-user-info" role="cell">
                      <div className="cedros-admin-user-avatar">
                        {user.picture ? (
                          <img
                            src={user.picture}
                            alt={user.name || user.email || t.admin.users.userImageAlt}
                            className="cedros-admin-user-avatar-img"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="cedros-admin-user-avatar-placeholder">
                            {(user.name?.[0] || user.email?.[0] || '?').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="cedros-admin-user-details">
                        <span className="cedros-admin-user-name">
                          {user.name || t.admin.users.unknown}
                          {isCurrentUser && (
                            <span className="cedros-admin-user-you">
                              ({t.admin.users.currentUser})
                            </span>
                          )}
                        </span>
                        <span className="cedros-admin-user-email" title={user.email}>
                          {user.email || truncateId(user.id)}
                        </span>
                      </div>
                    </div>
                    <div className="cedros-admin-user-td" role="cell">
                      {formatUserDate(user.createdAt, locale)}
                    </div>
                    <div className="cedros-admin-user-td" role="cell">
                      {user.lastLoginAt ? formatUserDate(user.lastLoginAt, locale) : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="cedros-admin-pagination">
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                {t.common.previous}
              </button>
              <span className="cedros-admin-page-info">
                {message(t.admin.users.pageInfo, {
                  current: currentPage,
                  totalPages,
                  total,
                })}
              </span>
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                {t.common.next}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
