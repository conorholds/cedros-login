import { useExternalEffect } from '../../hooks/effects';
/**
 * PermissionsSection - Dashboard permissions matrix for role configuration
 *
 * Allows org owners to configure which dashboard sections each role can access.
 */

import { useCallback, useMemo, useState, type JSX } from 'react';
import { useDashboardPermissions } from '../../hooks/useDashboardPermissions';
import {
  AFFILIATES_DASHBOARD_SECTIONS,
  LOGIN_DASHBOARD_SECTIONS,
  DASHBOARD_SECTION_LABELS,
  type DashboardSection,
  type DashboardPermissions,
} from '../../types/dashboardPermissions';
import type { OrgRole } from '../../types';
import { useI18n } from '../../i18n';

interface PermissionToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
}

function PermissionToggle({ checked, onChange, disabled, label }: PermissionToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`cedros-toggle cedros-toggle-sm ${checked ? 'cedros-toggle-on' : 'cedros-toggle-off'} ${disabled ? 'cedros-toggle-disabled' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <span className="cedros-toggle-track">
        <span className="cedros-toggle-thumb" />
      </span>
    </button>
  );
}

export interface PermissionsSectionProps {
  /** Current user's role in the org */
  userRole?: OrgRole | null;
}

export function PermissionsSection({ userRole }: PermissionsSectionProps): JSX.Element {
  const { t, message } = useI18n();
  const { permissions, updatePermissions, isLoading, isUpdating, error } =
    useDashboardPermissions();
  const [draftPermissions, setDraftPermissions] = useState<DashboardPermissions | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isOwner = userRole === 'owner';
  const effectivePermissions = draftPermissions ?? permissions;
  const hasUnsavedChanges = useMemo(
    () => draftPermissions !== null && !dashboardPermissionsEqual(draftPermissions, permissions),
    [draftPermissions, permissions]
  );

  useExternalEffect(() => {
    if (!hasUnsavedChanges) setDraftPermissions(null);
  }, [hasUnsavedChanges, permissions]);

  const handleToggle = useCallback(
    (role: 'admin' | 'member', section: DashboardSection, enabled: boolean) => {
      const newPermissions: DashboardPermissions = {
        ...effectivePermissions,
        [role]: {
          ...effectivePermissions[role],
          [section]: enabled,
        },
      };
      setDraftPermissions(newPermissions);
      setSaveError(null);
    },
    [effectivePermissions]
  );

  const handleReset = useCallback(() => {
    setDraftPermissions(null);
    setSaveError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!draftPermissions || !hasUnsavedChanges) return;
    setSaveError(null);
    try {
      await updatePermissions(draftPermissions);
      setDraftPermissions(null);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : t.admin.settings.saveFailed);
    }
  }, [draftPermissions, hasUnsavedChanges, t.admin.settings.saveFailed, updatePermissions]);

  if (isLoading) {
    return (
      <div className="cedros-dashboard__section">
        <div className="cedros-dashboard__loading">{t.admin.permissions.loading}</div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="cedros-dashboard__section">
        <div className="cedros-dashboard__empty">{t.admin.permissions.ownerOnly}</div>
      </div>
    );
  }

  return (
    <div className="cedros-dashboard__section cedros-permissions-section">
      <div className="cedros-permissions-header">
        <p className="cedros-permissions-description">{t.admin.permissions.description}</p>
        <div className="cedros-permissions-actions">
          {hasUnsavedChanges && (
            <span className="cedros-permissions-saving">{t.admin.settings.unsaved}</span>
          )}
          <button
            type="button"
            className="cedros-button cedros-button-sm cedros-button-outline"
            onClick={handleReset}
            disabled={!hasUnsavedChanges || isUpdating}
          >
            {t.admin.settings.reset}
          </button>
          <button
            type="button"
            className="cedros-button cedros-button-sm cedros-button-primary"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isUpdating}
          >
            {isUpdating ? t.common.saving : t.admin.settings.saveChanges}
          </button>
        </div>
        {(error || saveError) && (
          <div className="cedros-permissions-error">{saveError ?? error?.message}</div>
        )}
      </div>

      <div className="cedros-permissions-matrix">
        <table className="cedros-permissions-table">
          <tbody>
            {/* Cedros Login Sections */}
            <tr className="cedros-permissions-group-header">
              <th className="cedros-permissions-section-header">
                {t.admin.permissions.cedrosLogin}
              </th>
              <th className="cedros-permissions-role-header">{t.admin.permissions.adminRole}</th>
              <th className="cedros-permissions-role-header">{t.admin.permissions.memberRole}</th>
            </tr>
            {LOGIN_DASHBOARD_SECTIONS.map((section) => (
              <tr key={section} className="cedros-permissions-row">
                <td className="cedros-permissions-section-label">
                  {DASHBOARD_SECTION_LABELS[section]}
                </td>
                <td className="cedros-permissions-toggle-cell">
                  <PermissionToggle
                    checked={effectivePermissions.admin[section] ?? false}
                    onChange={(enabled) => handleToggle('admin', section, enabled)}
                    disabled={isUpdating}
                    label={message(t.admin.permissions.adminAccessTo, {
                      section: DASHBOARD_SECTION_LABELS[section],
                    })}
                  />
                </td>
                <td className="cedros-permissions-toggle-cell">
                  <PermissionToggle
                    checked={effectivePermissions.member[section] ?? false}
                    onChange={(enabled) => handleToggle('member', section, enabled)}
                    disabled={isUpdating}
                    label={message(t.admin.permissions.memberAccessTo, {
                      section: DASHBOARD_SECTION_LABELS[section],
                    })}
                  />
                </td>
              </tr>
            ))}

            <tr className="cedros-permissions-group-header">
              <th className="cedros-permissions-section-header">
                {t.admin.permissions.cedrosAffiliates}
              </th>
              <th className="cedros-permissions-role-header">{t.admin.permissions.adminRole}</th>
              <th className="cedros-permissions-role-header">{t.admin.permissions.memberRole}</th>
            </tr>
            {AFFILIATES_DASHBOARD_SECTIONS.map((section) => (
              <tr key={section} className="cedros-permissions-row">
                <td className="cedros-permissions-section-label">
                  {DASHBOARD_SECTION_LABELS[section]}
                </td>
                <td className="cedros-permissions-toggle-cell">
                  <PermissionToggle
                    checked={effectivePermissions.admin[section] ?? false}
                    onChange={(enabled) => handleToggle('admin', section, enabled)}
                    disabled={isUpdating}
                    label={message(t.admin.permissions.adminAccessTo, {
                      section: DASHBOARD_SECTION_LABELS[section],
                    })}
                  />
                </td>
                <td className="cedros-permissions-toggle-cell">
                  <PermissionToggle
                    checked={effectivePermissions.member[section] ?? false}
                    onChange={(enabled) => handleToggle('member', section, enabled)}
                    disabled={isUpdating}
                    label={message(t.admin.permissions.memberAccessTo, {
                      section: DASHBOARD_SECTION_LABELS[section],
                    })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function dashboardPermissionsEqual(a: DashboardPermissions, b: DashboardPermissions): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
