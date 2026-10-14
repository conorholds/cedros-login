/**
 * Users Section - Plugin wrapper
 *
 * Admin user management with list and detail views.
 */

import { useState, type JSX } from 'react';
import type { AdminSectionProps } from '../types';
import { AdminUserList } from '../../components/admin/AdminUserList';
import { AdminUserDetail } from '../../components/admin/AdminUserDetail';
import { StatsBar } from '../../components/admin/StatsBar';
import type { AdminUser } from '../../types';
import { useUsersStatsSummary } from '../../components/admin/hooks/useUsersStatsSummary';
import { useTranslations } from '../../i18n';

export default function UsersSection({
  pluginContext,
  pageSize = 20,
}: AdminSectionProps): JSX.Element {
  const t = useTranslations();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { statsItems, isLoading, error, refresh } = useUsersStatsSummary();

  if (selectedUser) {
    return (
      <div className="cedros-dashboard__section">
        <AdminUserDetail
          userId={selectedUser.id}
          onBack={() => setSelectedUser(null)}
          currentUserId={pluginContext.userId}
        />
      </div>
    );
  }

  return (
    <div className="cedros-dashboard__section">
      <StatsBar stats={statsItems} isLoading={isLoading} onRefresh={refresh} />
      {error && <p className="cedros-admin-error-inline">{error}</p>}
      <p className="cedros-dashboard__text-muted">{t.admin.users.description}</p>
      <AdminUserList
        pageSize={pageSize}
        currentUserId={pluginContext.userId}
        onUserClick={(user) => setSelectedUser(user)}
      />
    </div>
  );
}
