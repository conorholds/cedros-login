/* eslint-disable react-refresh/only-export-components */

/**
 * Cedros Login Admin Plugin
 *
 * Contributes admin sections for a host-owned shell:
 *   - users (system admin user list)
 *   - team (org members + invites)
 *   - login (single Login admin page in the Extension Settings group)
 *
 * Extension-owned auth setup, settings, policy, and credential references live
 * inside the `login` section's component; this file does not register them as
 * separate sidebar entries.
 */

import { lazy, type ComponentType, type ReactNode } from 'react';
import { HOST_SERVICE_IDS, getHostService } from './platform';
import type {
  AdminPlugin,
  HostContext,
  PluginContext,
  AdminSectionConfig,
  AdminSectionProps,
} from './types';
import { AdminPluginIcons } from './icons';
import { CedrosLoginAdminRuntimeProvider } from './CedrosLoginAdminRuntimeProvider';
import { cedrosLoginExtensionBaseUrl } from './extensionBaseUrl';
import LoginAdminSection from './sections/LoginAdminSection';

// ============================================================================
// Lazy-loaded Section Components
// ============================================================================

type AdminSectionComponent = (props: AdminSectionProps) => ReactNode;

const wrapSection = (
  loadComponent: () => Promise<ComponentType<AdminSectionProps>>
): AdminSectionComponent =>
  lazy(async () => {
    const OriginalComponent = await loadComponent();

    return {
      default: function WrappedCedrosLoginAdminSection(props: AdminSectionProps) {
        return (
          <CedrosLoginAdminRuntimeProvider pluginContext={props.pluginContext}>
            <OriginalComponent {...props} />
          </CedrosLoginAdminRuntimeProvider>
        );
      },
    };
  });

const UsersSection = wrapSection(async () => (await import('./sections/UsersSection')).default);
const TeamSection = wrapSection(async () => (await import('./sections/TeamSection')).default);
const TeamInvitesSection = wrapSection(
  async () => (await import('./sections/TeamSection')).TeamInvitesSection
);

/**
 * The ZIP-hosted extension route must not defer its first render through a
 * runtime-archive chunk resolver. Hosts may refresh their installed-extension
 * snapshot after bootstrap, so keep the contributed Login route and its
 * provider in the entry module's static graph.
 */
const LoginSection: AdminSectionComponent = (props) => {
  return (
    <CedrosLoginAdminRuntimeProvider pluginContext={props.pluginContext}>
      <LoginAdminSection {...props} />
    </CedrosLoginAdminRuntimeProvider>
  );
};

// ============================================================================
// Permission Mapping
// ============================================================================

type LoginPermission =
  | 'login:users:read'
  | 'login:users:write'
  | 'login:members:read'
  | 'login:members:write'
  | 'login:invites:read'
  | 'login:invites:write'
  | 'login:settings:read'
  | 'login:settings:write'
  | 'manage_users'
  | 'manage_settings'
  | 'view_audit_log';

type CedrosLoginHostService = NonNullable<HostContext['cedrosLogin']>;
type OrgHostService = NonNullable<HostContext['org']>;
type ServerUrlResolver = (serverUrl: string) => string;

export const CEDROS_LOGIN_USERS_GROUP = 'Users' as const;
export const CEDROS_LOGIN_EXTENSION_SETTINGS_GROUP = 'Extension Settings' as const;
const CEDROS_PAY_EXTENSION_IDS = ['cedros-pay', 'cedros-pay:admin'] as const;

const CEDROS_PAY_EXTENSION_ID_SET = new Set<string>(CEDROS_PAY_EXTENSION_IDS);
const CEDROS_PAY_CUSTOM_BOOLEAN_KEYS = ['cedrosPayInstalled', 'isCedrosPayInstalled'];
const CEDROS_PAY_CUSTOM_LIST_KEYS = [
  'installedExtensionIds',
  'installedExtensions',
  'extensionIds',
  'loadedPluginIds',
  'loadedPlugins',
  'installedPluginIds',
  'installedPlugins',
  'adminPlugins',
];
const CEDROS_PAY_OBJECT_ID_KEYS = [
  'id',
  'extensionId',
  'pluginId',
  'moduleId',
  'name',
  'packageName',
];

function isCedrosPayIdentifier(value: unknown): boolean {
  return typeof value === 'string' && CEDROS_PAY_EXTENSION_ID_SET.has(value);
}

function cedrosPayIdentifiers(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(cedrosPayIdentifiers);
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  return [
    ...Object.keys(record),
    ...CEDROS_PAY_OBJECT_ID_KEYS.flatMap((key) => cedrosPayIdentifiers(record[key])),
  ];
}

function isCedrosPayPlugin(plugin: Pick<AdminPlugin, 'id' | 'manifest'>): boolean {
  return (
    isCedrosPayIdentifier(plugin.id) ||
    isCedrosPayIdentifier(plugin.manifest?.extensionId) ||
    isCedrosPayIdentifier(plugin.manifest?.moduleId)
  );
}

export function hasCedrosPayPlugin(plugins: readonly Pick<AdminPlugin, 'id' | 'manifest'>[]) {
  return plugins.some(isCedrosPayPlugin);
}

export function resolveCedrosPayInstalled(custom: HostContext['custom']): boolean | undefined {
  if (!custom) return undefined;

  for (const key of CEDROS_PAY_CUSTOM_BOOLEAN_KEYS) {
    const value = custom[key];
    if (typeof value === 'boolean') return value;
  }

  let hasInstalledList = false;
  for (const key of CEDROS_PAY_CUSTOM_LIST_KEYS) {
    if (!(key in custom)) continue;
    hasInstalledList = true;
    if (cedrosPayIdentifiers(custom[key]).some(isCedrosPayIdentifier)) return true;
  }

  return hasInstalledList ? false : undefined;
}

/**
 * Maps plugin permissions to org-level permissions/roles.
 */
const PERMISSION_MAP: Record<LoginPermission, string[]> = {
  'login:users:read': ['admin', 'owner'],
  'login:users:write': ['admin', 'owner'],
  'login:members:read': ['member:read', 'admin', 'owner'],
  'login:members:write': ['member:remove', 'member:role_change'],
  'login:invites:read': ['invite:read', 'admin', 'owner'],
  'login:invites:write': ['invite:create', 'invite:cancel'],
  'login:settings:read': ['admin', 'owner'],
  'login:settings:write': ['admin', 'owner'],
  manage_users: ['admin', 'owner', 'manage_users'],
  manage_settings: ['admin', 'owner', 'manage_settings'],
  view_audit_log: ['admin', 'owner', 'view_audit_log'],
};

// ============================================================================
// Section Configuration
// ============================================================================

function buildPluginContext(
  hostContext: HostContext,
  resolveServerUrl: ServerUrlResolver
): PluginContext {
  const cedrosLogin = getHostService<CedrosLoginHostService>(
    hostContext,
    HOST_SERVICE_IDS.cedrosLogin
  );
  if (!cedrosLogin) {
    throw new Error('cedros-login plugin requires the cedros-login host service');
  }
  const org = getHostService<OrgHostService>(hostContext, HOST_SERVICE_IDS.org);

  return {
    serverUrl: resolveServerUrl(cedrosLogin.serverUrl),
    userId: cedrosLogin.user?.id,
    getAccessToken: cedrosLogin.getAccessToken,
    hasPermission: (permission: string) =>
      cedrosLoginPlugin.checkPermission(permission, hostContext),
    orgId: org?.orgId,
    pluginData: {
      user: cedrosLogin.user,
      orgRole: org?.role,
      cedrosLoginPasskeyDefaults: hostContext.custom?.cedrosLoginPasskeyDefaults,
      cedrosPayInstalled: resolveCedrosPayInstalled(hostContext.custom),
      cedrosLoginEarlyAccess: hostContext.custom?.cedrosLoginEarlyAccess,
    },
  };
}

export function createCedrosLoginExtensionPluginContext(hostContext: HostContext): PluginContext {
  return buildPluginContext(hostContext, cedrosLoginExtensionBaseUrl);
}

const SECTIONS: AdminSectionConfig[] = [
  {
    id: 'users',
    label: 'Users',
    icon: AdminPluginIcons.users,
    group: CEDROS_LOGIN_USERS_GROUP,
    order: 0,
    requiredPermission: 'login:users:read',
  },
  {
    id: 'team',
    label: 'Team',
    icon: AdminPluginIcons.members,
    group: CEDROS_LOGIN_USERS_GROUP,
    order: 1,
    requiredPermission: 'login:members:read',
    routeId: 'cedros-login:team',
    routePath: '/users/team',
    defaultTab: 'members',
  },
  {
    id: 'team-invites',
    label: 'Invite Team Members',
    icon: AdminPluginIcons.members,
    group: CEDROS_LOGIN_USERS_GROUP,
    order: 2,
    requiredPermission: 'login:invites:write',
    routeId: 'cedros-login:team-invites',
    routePath: '/users/team/invite',
    defaultTab: 'invites',
    hideFromNavigation: true,
  },
  // Consolidated Login admin entry (single extension-owned settings item).
  // Sidebar visibility uses the lowest-common read permission; per-tab gating
  // happens inside LoginAdminSection via pluginContext.hasPermission().
  {
    id: 'login',
    label: 'Login',
    icon: AdminPluginIcons.shield,
    group: CEDROS_LOGIN_EXTENSION_SETTINGS_GROUP,
    order: 0,
    requiredPermission: 'login:settings:read',
    routeId: 'cedros-login:login',
    routePath: '/settings/login',
  },
];

// ============================================================================
// Plugin Definition
// ============================================================================

export const cedrosLoginPlugin: AdminPlugin = {
  id: 'cedros-login',
  name: 'Cedros Login',
  version: '1.0.0',

  sections: SECTIONS,

  groups: [
    { id: 'users', label: CEDROS_LOGIN_USERS_GROUP, order: 0 },
    { id: 'extension-settings', label: CEDROS_LOGIN_EXTENSION_SETTINGS_GROUP, order: 1 },
  ],

  components: {
    users: UsersSection,
    team: TeamSection,
    'team-invites': TeamInvitesSection,
    login: LoginSection,
  },

  createPluginContext(hostContext: HostContext): PluginContext {
    // Standalone admin talks directly to the cedros-login server, where admin
    // routes live at /admin/*. Extension-mounted modules override this with the
    // host path prefix in cedrosAdminModule.ts.
    return buildPluginContext(hostContext, (serverUrl) => serverUrl);
  },

  checkPermission(permission: string, hostContext: HostContext): boolean {
    const org = getHostService<OrgHostService>(hostContext, HOST_SERVICE_IDS.org);
    const login = getHostService<CedrosLoginHostService>(hostContext, HOST_SERVICE_IDS.cedrosLogin);

    // No org context = admin-level access (for global admins)
    if (!org) {
      // Check if user is in cedrosLogin context - assume admin if present
      return Boolean(login?.user);
    }

    const requiredPerms = PERMISSION_MAP[permission as LoginPermission];
    if (!requiredPerms) {
      // Unknown permission - default deny
      return false;
    }

    // Check if user has any of the required permissions
    return requiredPerms.some(
      (p) =>
        org.permissions.includes(p) ||
        p === org.role ||
        (p === 'admin' && ['admin', 'owner'].includes(org.role)) ||
        (p === 'owner' && org.role === 'owner')
    );
  },

  cssNamespace: 'cedros-dashboard',
};

/**
 * All section IDs registered by the cedros-login plugin's sidebar surface.
 *
 * Use these to reference specific sections when configuring
 * `dashboardPermissions.canAccess()` or navigating programmatically.
 *
 * Qualified IDs (for multi-plugin use) are prefixed: `cedros-login:{id}`.
 */
export const CEDROS_LOGIN_SECTION_IDS = {
  users: 'users',
  team: 'team',
  teamInvites: 'team-invites',
  /** Consolidated single sidebar entry for extension-owned Login configuration. */
  login: 'login',
} as const;
