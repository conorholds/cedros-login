/** Contracts for the admin modules and services contributed to the host. */
import type { ComponentType, ReactNode } from 'react';

export type PluginId = string;
export type SectionId = string;
export type QualifiedSectionId = `${PluginId}:${SectionId}`;
export type PluginPermission = string;
export type HostServiceId = string;
export type AdminHostServiceBag = Record<HostServiceId, unknown>;

export interface HostContext {
  cedrosLogin?: {
    user: { id: string; email?: string; name?: string; picture?: string } | null;
    getAccessToken: () => string | null;
    serverUrl: string;
  };
  cedrosPay?: { walletAddress?: string; jwtToken?: string; serverUrl: string };
  org?: { orgId: string; role: string; permissions: string[] };
  dashboardPermissions?: { canAccess: (sectionId: string) => boolean };
  services?: AdminHostServiceBag;
  custom?: Record<string, unknown>;
}

export type AdminHostContext = HostContext;

export interface PluginContext {
  serverUrl: string;
  userId?: string;
  getAccessToken: () => string | null;
  hasPermission: (permission: PluginPermission) => boolean;
  orgId?: string;
  pluginData?: Record<string, unknown>;
}

export interface AdminPageAccess {
  /** Returns false when the host denies access to a qualified admin section id. */
  canAccess?: (sectionId: string) => boolean;
  configurable?: boolean;
  protected?: boolean;
  routePath?: string;
}

export interface AdminSectionProps {
  pluginContext: PluginContext;
  pageSize: number;
  refreshInterval: number;
  adminPageAccess?: AdminPageAccess;
}

export interface AdminGroupConfig {
  id: string;
  label: string;
  order: number;
  icon?: ReactNode;
  defaultCollapsed?: boolean;
}

export interface AdminSectionConfig {
  id: SectionId;
  label: string;
  labelKey?: string;
  icon: ReactNode | (() => ReactNode);
  group?: string;
  groupKey?: string;
  order?: number;
  requiredPermission?: PluginPermission;
  badge?: ReactNode;
  routeId?: SectionId | QualifiedSectionId;
  routePath?: string;
  defaultTab?: string;
  hideFromNavigation?: boolean;
  requiredExtensionId?: string;
  replacesSectionIds?: Array<SectionId | QualifiedSectionId>;
  disabledReason?: string;
  disabledReasonKey?: string;
  disabled?: boolean;
  adminPageAccess?: AdminPageAccess;
}

export interface AdminModuleManifest {
  moduleId: string;
  extensionId: string;
  displayName: string;
  version: string;
  packageName: string;
  packageSubpath?: string;
  description?: string;
  hostApiVersion?: string;
  enabledByDefault?: boolean;
  sectionIds?: SectionId[];
  sectionIcons?: Record<string, string>;
  navigation?: {
    sections: Array<{
      id: SectionId;
      label: string;
      group: string;
      order: number;
      labelKey?: string;
      groupKey?: string;
      hideFromNavigation?: boolean;
      requiredPermission?: PluginPermission;
      requiredExtensionId?: string;
      replacesSectionIds?: SectionId[];
      disabledReason?: string;
      disabledReasonKey?: string;
      disabled?: boolean;
      adminPageAccess?: {
        configurable?: boolean;
        protected?: boolean;
        routePath?: string;
      };
    }>;
    groups?: Array<{
      id: string;
      label: string;
      order: number;
      labelKey?: string;
      defaultCollapsed?: boolean;
      hideLabel?: boolean;
    }>;
  };
  slots?: string[];
}

export type PluginManifest = Partial<AdminModuleManifest>;
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export interface AdminDashboardCardContributionProps {
  hostContext: HostContext;
  pluginContext: PluginContext;
  extensionId: string;
  refreshInterval: number;
  isLoading: boolean;
  analyticsSnapshot: JsonValue | null;
  analyticsError?: string;
}

export interface AdminDashboardCardContribution {
  id: string;
  Component: ComponentType<AdminDashboardCardContributionProps>;
  order?: number;
}

export interface AdminPluginContributions {
  dashboardCards?: AdminDashboardCardContribution[];
}

export interface AdminPlugin {
  id: PluginId;
  name: string;
  version: string;
  sections: AdminSectionConfig[];
  groups?: AdminGroupConfig[];
  components: Record<SectionId, ComponentType<AdminSectionProps>>;
  createPluginContext: (hostContext: HostContext) => PluginContext;
  checkPermission: (permission: PluginPermission, hostContext: HostContext) => boolean;
  cssNamespace: string;
  manifest?: PluginManifest;
  pages?: AdminSectionConfig[];
  contributions?: AdminPluginContributions;
}
