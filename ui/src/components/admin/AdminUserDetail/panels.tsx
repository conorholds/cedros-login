/**
 * Presentational panels for AdminUserDetail.
 * UserInfoPanel is a pure display component.
 */

import type { AdminUser } from '../../../types';
import { formatDate } from './helpers';
import { useI18n } from '../../../i18n';

// =============================================================================
// UserInfoPanel
// =============================================================================

export interface UserInfoPanelProps {
  user: AdminUser;
  isCurrentUser: boolean;
}

export function UserInfoPanel({ user, isCurrentUser }: UserInfoPanelProps) {
  const { t, locale, message } = useI18n();
  return (
    <div className="cedros-admin-user-detail-info">
      <div className="cedros-admin-user-detail-avatar">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || user.email || t.admin.users.userImageAlt}
            className="cedros-admin-user-detail-avatar-img"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="cedros-admin-user-detail-avatar-placeholder">
            {(user.name?.[0] || user.email?.[0] || '?').toUpperCase()}
          </span>
        )}
      </div>
      <div className="cedros-admin-user-detail-meta">
        <h2 className="cedros-admin-user-detail-name">
          {user.name || t.admin.users.unknown}
          {isCurrentUser && (
            <span className="cedros-admin-user-you">({t.admin.users.currentUser})</span>
          )}
        </h2>
        <p className="cedros-admin-user-detail-email">
          {user.email || t.admin.users.noEmail}
          {user.emailVerified && (
            <span className="cedros-admin-verified-badge" title={t.admin.users.emailVerified}>
              {t.admin.users.emailVerified}
            </span>
          )}
        </p>
        {user.isSystemAdmin && (
          <div className="cedros-admin-user-detail-badges">
            <span className="cedros-admin-admin-badge cedros-admin-admin-badge-yes">
              {t.admin.users.systemAdmin}
            </span>
          </div>
        )}
        <div className="cedros-admin-user-detail-methods">
          <span className="cedros-admin-user-detail-methods-label">
            {t.admin.users.authMethods}
          </span>
          {user.authMethods.length > 0 ? (
            user.authMethods.map((method) => (
              <span
                key={method}
                className={`cedros-admin-auth-badge cedros-admin-auth-badge-${method}`}
              >
                {method}
              </span>
            ))
          ) : (
            <span className="cedros-admin-auth-badge cedros-admin-auth-badge-none">
              {t.admin.users.none}
            </span>
          )}
        </div>
        <p className="cedros-admin-user-detail-dates">
          {message(t.admin.users.datesSummary, {
            registered: formatDate(user.createdAt, locale),
            updated: formatDate(user.updatedAt, locale),
          })}
        </p>
        {user.referralCode && (
          <div className="cedros-admin-user-detail-referral">
            <span className="cedros-admin-user-detail-referral-label">
              {t.admin.users.referral}
            </span>
            <span className="cedros-admin-user-detail-referral-code">{user.referralCode}</span>
            {user.referralCount !== undefined && user.referralCount > 0 && (
              <span className="cedros-admin-user-detail-referral-count">
                {message(t.admin.users.referralCount, { count: user.referralCount })}
              </span>
            )}
            {user.referredBy && (
              <span className="cedros-admin-user-detail-referred-by">
                {t.admin.users.referredBy}{' '}
                <button
                  type="button"
                  className="cedros-admin-user-uuid-link"
                  onClick={() => navigator.clipboard?.writeText(user.referredBy!)}
                  title={t.admin.users.copyReferrerUuid}
                >
                  {user.referredBy}
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
