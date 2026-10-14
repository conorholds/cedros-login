/**
 * Organization list view component
 */
import { useTranslations } from '../../i18n';
import type { OrgWithMembership } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { OrgAvatar } from './OrgAvatar';
import { CheckIcon, PlusIcon } from './icons';

export interface OrgListViewProps {
  orgs: OrgWithMembership[];
  activeOrg: OrgWithMembership | null;
  isLoading: boolean;
  onSelect: (orgId: string) => void;
  onCreateClick?: () => void;
}

export function OrgListView({
  orgs,
  activeOrg,
  isLoading,
  onSelect,
  onCreateClick,
}: OrgListViewProps) {
  const t = useTranslations();
  if (isLoading) {
    return (
      <div className="cedros-org-switcher-loading" role="status">
        <LoadingSpinner />
        <span>{t.organizations.loading}</span>
      </div>
    );
  }

  return (
    <>
      {orgs.length === 0 ? (
        <div className="cedros-org-switcher-empty">
          <p>{t.organizations.noMemberships}</p>
        </div>
      ) : (
        <ul className="cedros-org-switcher-list">
          {orgs.map((org) => (
            <li key={org.id}>
              <button
                type="button"
                className={`cedros-org-switcher-item ${
                  org.id === activeOrg?.id ? 'cedros-org-switcher-item-active' : ''
                }`}
                onClick={() => onSelect(org.id)}
                aria-current={org.id === activeOrg?.id ? true : undefined}
              >
                <OrgAvatar org={org} />
                <div className="cedros-org-switcher-item-content">
                  <span className="cedros-org-switcher-item-name">{org.name}</span>
                  <span className="cedros-org-switcher-item-slug">@{org.slug}</span>
                </div>
                <div className="cedros-org-switcher-item-meta">
                  <span className={`cedros-org-role cedros-org-role-${org.membership.role}`}>
                    {org.membership.role}
                  </span>
                  {org.isPersonal && (
                    <span className="cedros-org-personal-badge">{t.organizations.personal}</span>
                  )}
                </div>
                {org.id === activeOrg?.id && <CheckIcon />}
              </button>
            </li>
          ))}
        </ul>
      )}

      {onCreateClick && (
        <button type="button" className="cedros-org-switcher-create" onClick={onCreateClick}>
          <PlusIcon />
          <span>{t.organizations.createNew}</span>
        </button>
      )}
    </>
  );
}
