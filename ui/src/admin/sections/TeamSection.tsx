/**
 * Team Section - Plugin wrapper
 *
 * Combined team member management and invites for organizations.
 */

import { useMemo, useState, type JSX } from 'react';
import { useExternalEffect } from '../../hooks/effects';
import type { AdminSectionProps } from '../types';
import { MemberList } from '../../components/members/MemberList';
import { InviteForm } from '../../components/invites/InviteForm';
import { InviteList } from '../../components/invites/InviteList';
import { StatsBar } from '../../components/admin/StatsBar';
import { PermissionsSection } from '../../components/admin/PermissionsSection';
import { useOrgs } from '../../hooks/useOrgs';
import { useMembers } from '../../hooks/useMembers';
import { useInvites } from '../../hooks/useInvites';
import { useI18n } from '../../i18n';

type TeamTab = 'members' | 'invites' | 'permissions';

interface TeamSectionInnerProps extends AdminSectionProps {
  initialTab?: TeamTab;
}

function TeamSectionInner({
  pluginContext,
  initialTab = 'members',
}: TeamSectionInnerProps): JSX.Element {
  const { t, message } = useI18n();
  const [activeTab, setActiveTab] = useState<TeamTab>(initialTab);
  const {
    activeOrg,
    hasPermission,
    role,
    isLoading: orgsLoading,
    error: orgsError,
    fetchOrgs,
  } = useOrgs();
  const canViewInvites = hasPermission('invite:read');

  const {
    members,
    isLoading: membersLoading,
    error: membersError,
    updateMemberRole,
    removeMember,
  } = useMembers(activeOrg?.id ?? '');
  const {
    invites,
    isLoading: invitesLoading,
    error: invitesError,
    createInvite,
    cancelInvite,
    resendInvite,
  } = useInvites(canViewInvites ? activeOrg?.id : undefined);

  useExternalEffect(() => {
    if (activeTab === 'invites' && !canViewInvites) {
      setActiveTab('members');
    }
  }, [activeTab, canViewInvites]);

  // Compute role counts BEFORE any early return to follow React Hooks rules
  const roleCounts = useMemo(
    () =>
      members.reduce(
        (acc, member) => {
          acc[member.role] = (acc[member.role] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    [members]
  );

  if (orgsLoading && !activeOrg) {
    return (
      <div className="cedros-dashboard__section">
        <div className="cedros-dashboard__empty">
          <span className="cedros-admin-loading-indicator" />
          <span className="cedros-admin-loading-text">{t.admin.team.loadingOrganization}</span>
        </div>
      </div>
    );
  }

  if (orgsError && !activeOrg) {
    return (
      <div className="cedros-dashboard__section">
        <div className="cedros-dashboard__empty">
          <p className="cedros-admin-error">{orgsError.message}</p>
          <button type="button" className="cedros-button cedros-button-outline" onClick={fetchOrgs}>
            {t.common.retry}
          </button>
        </div>
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="cedros-dashboard__section">
        <div className="cedros-dashboard__empty">{t.admin.team.noOrganizations}</div>
      </div>
    );
  }

  const canInvite = hasPermission('invite:create');
  const canCancel = hasPermission('invite:cancel');
  const pendingCount = canViewInvites ? invites.length : 0;
  const ownerCount = roleCounts.owner ?? 0;
  const adminCount = roleCounts.admin ?? 0;
  const memberCount = roleCounts.member ?? 0;

  return (
    <div className="cedros-dashboard__team">
      <StatsBar
        stats={[
          { label: t.admin.team.owners, value: ownerCount },
          { label: t.admin.team.admins, value: adminCount },
          { label: t.admin.team.members, value: memberCount },
          { label: t.admin.team.invites, value: pendingCount },
        ]}
      />
      {/* Tabs */}
      <div className="cedros-admin-tabs cedros-admin-tabs--line">
        <button
          type="button"
          className={`cedros-admin-tab ${activeTab === 'members' ? 'cedros-admin-tab-active' : ''}`}
          onClick={() => setActiveTab('members')}
          aria-selected={activeTab === 'members'}
          role="tab"
        >
          {t.admin.team.members}
        </button>
        {canViewInvites && (
          <button
            type="button"
            className={`cedros-admin-tab ${activeTab === 'invites' ? 'cedros-admin-tab-active' : ''}`}
            onClick={() => setActiveTab('invites')}
            aria-selected={activeTab === 'invites'}
            role="tab"
          >
            {message(t.admin.team.pendingInvites, { count: pendingCount })}
          </button>
        )}
        {role === 'owner' && (
          <button
            type="button"
            className={`cedros-admin-tab ${activeTab === 'permissions' ? 'cedros-admin-tab-active' : ''}`}
            onClick={() => setActiveTab('permissions')}
            aria-selected={activeTab === 'permissions'}
            role="tab"
          >
            {t.admin.team.permissions}
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="cedros-admin-tab-content" role="tabpanel">
        {activeTab === 'members' && (
          <MemberList
            members={members}
            currentUserId={pluginContext.userId}
            isLoading={membersLoading}
            error={membersError?.message}
            canManage={hasPermission('member:remove')}
            canChangeRoles={hasPermission('member:role_change')}
            onUpdateRole={updateMemberRole}
            onRemove={removeMember}
          />
        )}

        {canViewInvites && activeTab === 'invites' && (
          <div className="cedros-dashboard__invites">
            {canInvite && (
              <div className="cedros-dashboard__section">
                <div className="cedros-dashboard__section-header">
                  <h3 className="cedros-dashboard__section-title">{t.admin.team.sendInvitation}</h3>
                </div>
                <InviteForm
                  onSubmit={createInvite}
                  isLoading={invitesLoading}
                  error={invitesError?.message}
                />
              </div>
            )}

            <div className="cedros-dashboard__section">
              <InviteList
                invites={invites}
                isLoading={invitesLoading}
                error={invitesError?.message}
                canManage={canCancel || canInvite}
                onCancel={canCancel ? cancelInvite : undefined}
                onResend={canInvite ? resendInvite : undefined}
              />
            </div>
          </div>
        )}

        {activeTab === 'permissions' && role === 'owner' && <PermissionsSection userRole={role} />}
      </div>
    </div>
  );
}

export default function TeamSection(props: AdminSectionProps): JSX.Element {
  return <TeamSectionInner {...props} initialTab="members" />;
}

export function TeamInvitesSection(props: AdminSectionProps): JSX.Element {
  return <TeamSectionInner {...props} initialTab="invites" />;
}
