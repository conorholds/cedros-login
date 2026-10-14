import type { AdminPlugin, AdminGroupConfig, AdminSectionConfig } from './types';
import {
  CEDROS_LOGIN_EXTENSION_SETTINGS_GROUP,
  cedrosLoginPlugin,
  CEDROS_LOGIN_SECTION_IDS,
  CEDROS_LOGIN_USERS_GROUP,
  createCedrosLoginExtensionPluginContext,
} from './plugin';
import {
  CEDROS_LOGIN_ADMIN_MODULE_ID,
  CEDROS_LOGIN_DASHBOARD_CARD_ID,
  CEDROS_LOGIN_DASHBOARD_CARD_ORDER,
  CEDROS_LOGIN_EXTENSION_ID,
  CEDROS_LOGIN_EXTENSION_VERSION,
  cedrosLoginAdminModuleManifest,
  cedrosLoginAdminNavigation,
  cedrosLoginPackageFamily,
} from '../extension/manifest';
import type { AdminModule } from '../extension/contracts';
import { LoginHealthDashboardCard } from './dashboard/LoginHealthDashboardCard';
import { CEDROS_LOGIN_ADMIN_SECTION_IDS } from './adminIds';

const SECTION_ID_BY_LOCAL_ID: Record<string, string> = {
  [CEDROS_LOGIN_SECTION_IDS.users]: CEDROS_LOGIN_ADMIN_SECTION_IDS.users,
  [CEDROS_LOGIN_SECTION_IDS.team]: CEDROS_LOGIN_ADMIN_SECTION_IDS.team,
  [CEDROS_LOGIN_SECTION_IDS.teamInvites]: CEDROS_LOGIN_ADMIN_SECTION_IDS.teamInvites,
  [CEDROS_LOGIN_SECTION_IDS.login]: CEDROS_LOGIN_ADMIN_SECTION_IDS.login,
};

const BUILT_IN_PERMISSION_BY_LOCAL_ID: Record<string, string> = {
  [CEDROS_LOGIN_SECTION_IDS.users]: 'manage_users',
  [CEDROS_LOGIN_SECTION_IDS.team]: 'manage_users',
  [CEDROS_LOGIN_SECTION_IDS.teamInvites]: 'manage_users',
  [CEDROS_LOGIN_SECTION_IDS.login]: 'manage_settings',
};

const OFFICIAL_GROUP_BY_LOCAL_ID: Record<string, string> = {
  [CEDROS_LOGIN_SECTION_IDS.users]: CEDROS_LOGIN_USERS_GROUP,
  [CEDROS_LOGIN_SECTION_IDS.team]: CEDROS_LOGIN_USERS_GROUP,
  [CEDROS_LOGIN_SECTION_IDS.teamInvites]: CEDROS_LOGIN_USERS_GROUP,
  [CEDROS_LOGIN_SECTION_IDS.login]: CEDROS_LOGIN_EXTENSION_SETTINGS_GROUP,
};

const CEDROS_ADMIN_GROUPS: AdminGroupConfig[] = [
  { id: 'Users', label: CEDROS_LOGIN_USERS_GROUP, order: 0 },
  { id: 'Extension Settings', label: CEDROS_LOGIN_EXTENSION_SETTINGS_GROUP, order: 1 },
];

const cedrosLoginAdminManifest = {
  moduleId: CEDROS_LOGIN_ADMIN_MODULE_ID,
  extensionId: CEDROS_LOGIN_EXTENSION_ID,
  displayName: 'Cedros Login',
  version: CEDROS_LOGIN_EXTENSION_VERSION,
  packageName: cedrosLoginPackageFamily.react.packageName,
  sectionIds: [...(cedrosLoginAdminModuleManifest.sectionIds ?? [])],
  sectionIcons: { ...(cedrosLoginAdminModuleManifest.sectionIcons ?? {}) },
  navigation: cedrosLoginAdminNavigation,
};

// Team / Team Invites are owned by the Cedros platform host (it reads our roster via
// the cedros-login-team-directory host service), so the extension only ships the
// Login (auth settings) section. The standalone cedrosLoginAdminModule still
// exposes the full set for non-host consumers.
const CEDROS_DATA_EXTENSION_LOCAL_SECTION_IDS = [CEDROS_LOGIN_SECTION_IDS.login] as const;

function toCedrosSection(section: AdminSectionConfig): AdminSectionConfig {
  const id = SECTION_ID_BY_LOCAL_ID[section.id];
  if (!id) throw new Error(`Missing Cedros admin section mapping for ${section.id}`);

  return {
    ...section,
    id,
    group: OFFICIAL_GROUP_BY_LOCAL_ID[section.id],
    requiredPermission: BUILT_IN_PERMISSION_BY_LOCAL_ID[section.id],
  };
}

function toCedrosComponents(components: AdminPlugin['components']): AdminPlugin['components'] {
  return Object.fromEntries(
    Object.entries(components).map(([localId, component]) => {
      const sectionId = SECTION_ID_BY_LOCAL_ID[localId];
      if (!sectionId) throw new Error(`Missing Cedros admin component mapping for ${localId}`);
      return [sectionId, component];
    })
  );
}

function requireCedrosSection(localId: string): AdminSectionConfig {
  const section = cedrosLoginPlugin.sections.find((entry) => entry.id === localId);
  if (!section) throw new Error(`Missing Cedros Login admin section ${localId}`);
  return section;
}

function toCedrosExtensionSection(localId: string): AdminSectionConfig {
  const runtimeSection = toCedrosSection(requireCedrosSection(localId));
  const sectionId = SECTION_ID_BY_LOCAL_ID[localId];
  const navigationSection = cedrosLoginAdminNavigation.sections.find(
    (section) => section.id === sectionId
  );
  if (!navigationSection) {
    throw new Error(`Canonical manifest navigation is missing section ${sectionId}`);
  }
  const { adminPageAccess, replacesSectionIds, ...navigationFields } = navigationSection;

  return {
    ...navigationFields,
    icon: runtimeSection.icon,
    routeId: navigationSection.id,
    routePath: adminPageAccess?.routePath,
    replacesSectionIds: replacesSectionIds ? [...replacesSectionIds] : undefined,
    adminPageAccess: adminPageAccess ? { ...adminPageAccess } : undefined,
  };
}

function toCedrosComponentsByLocalIds(localIds: readonly string[]): AdminPlugin['components'] {
  const entries = localIds.map((localId) => {
    const sectionId = SECTION_ID_BY_LOCAL_ID[localId];
    const component = cedrosLoginPlugin.components[localId];
    if (!sectionId || !component) throw new Error(`Missing Cedros admin component ${localId}`);
    return [sectionId, component] as const;
  });

  return Object.fromEntries(entries);
}

export const cedrosLoginAdminModule: AdminModule = {
  ...cedrosLoginPlugin,
  id: CEDROS_LOGIN_ADMIN_MODULE_ID,
  name: 'Cedros Login',
  version: CEDROS_LOGIN_EXTENSION_VERSION,
  manifest: {
    ...cedrosLoginAdminManifest,
    displayName: 'Cedros Login',
    sectionIds: cedrosLoginPlugin.sections.map((section) => SECTION_ID_BY_LOCAL_ID[section.id]),
  },
  sections: cedrosLoginPlugin.sections.map(toCedrosSection),
  groups: CEDROS_ADMIN_GROUPS,
  components: toCedrosComponents(cedrosLoginPlugin.components),
  contributions: {
    dashboardCards: [
      {
        id: CEDROS_LOGIN_DASHBOARD_CARD_ID,
        Component: LoginHealthDashboardCard,
        order: CEDROS_LOGIN_DASHBOARD_CARD_ORDER,
      },
    ],
  },
};

export const cedrosLoginExtensionAdminModule: AdminModule = {
  ...cedrosLoginPlugin,
  id: CEDROS_LOGIN_ADMIN_MODULE_ID,
  name: 'Cedros Login',
  version: CEDROS_LOGIN_EXTENSION_VERSION,
  manifest: {
    ...cedrosLoginAdminManifest,
  },
  sections: CEDROS_DATA_EXTENSION_LOCAL_SECTION_IDS.map(toCedrosExtensionSection),
  groups: (cedrosLoginAdminNavigation.groups ?? []).map((group) => ({ ...group })),
  components: toCedrosComponentsByLocalIds(CEDROS_DATA_EXTENSION_LOCAL_SECTION_IDS),
  createPluginContext: createCedrosLoginExtensionPluginContext,
  contributions: {
    dashboardCards: [
      {
        id: CEDROS_LOGIN_DASHBOARD_CARD_ID,
        Component: LoginHealthDashboardCard,
        order: CEDROS_LOGIN_DASHBOARD_CARD_ORDER,
      },
    ],
  },
};

export const cedrosLoginSettingsAdminModule = cedrosLoginExtensionAdminModule;
