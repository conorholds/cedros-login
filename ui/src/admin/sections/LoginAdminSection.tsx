/**
 * Cedros Login admin section.
 *
 * Auth-only now: it renders the authentication settings directly (their own
 * sub-tabs handle provider selection), so there is no outer tab layer. Email,
 * webhooks, server infra, images, team access, and activity were removed in
 * favor of the host's seams (email, notifications, logging/metrics, object
 * storage, analytics) and the Users → Team page.
 */

import type { ReactNode } from 'react';

import type { AdminSectionProps } from '../types';
import { CEDROS_LOGIN_EXTENSION_ID } from '../../extension/manifest';
import { useTranslations } from '../../i18n';
import AuthenticationSettings from './AuthenticationSettings';

const AUTH_PERMISSION = 'login:settings:read';
const AUTH_SECTION_ID = 'cedros-login:account-settings';

export default function LoginAdminSection(props: AdminSectionProps): ReactNode {
  const t = useTranslations();
  const { pluginContext } = props;
  const canAccess = props.adminPageAccess?.canAccess;
  const canView =
    pluginContext.hasPermission(AUTH_PERMISSION) &&
    (typeof canAccess !== 'function' || canAccess(AUTH_SECTION_ID) !== false);

  if (!canView) {
    return (
      <div
        className="cedros-login-admin-root cedros-data cedros-dashboard__login"
        data-extension-id={CEDROS_LOGIN_EXTENSION_ID}
      >
        <div className="cedros-dashboard__section cedros-data-stack">
          <div className="cedros-data-status cedros-data-status--info" role="status">
            <p>{t.admin.login.emptyPermission}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cedros-login-admin-root cedros-data cedros-dashboard__login"
      data-extension-id={CEDROS_LOGIN_EXTENSION_ID}
    >
      <div className="cedros-dashboard__section cedros-data-stack">
        <AuthenticationSettings />
      </div>
    </div>
  );
}
