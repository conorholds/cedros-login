import type { ComponentType, ReactNode } from 'react';
import type {
  AdminPlugin,
  HostContext,
  JsonObject,
  JsonValue,
  PluginContext,
} from '../admin/types';
import type { CedrosJsonSchemaObject } from './jsonSchema';
import type { CedrosExtensionSetupSeedsManifest } from './setupSeeds';

export type { CedrosJsonSchema, CedrosJsonSchemaObject } from './jsonSchema';

export interface CedrosDashboardCardContributionProps {
  hostContext: HostContext;
  pluginContext: PluginContext;
  extensionId: string;
  refreshInterval: number;
  isLoading: boolean;
  analyticsSnapshot: JsonValue | null;
  analyticsError?: string;
}

export interface CedrosDashboardCardContribution {
  id: string;
  Component: ComponentType<CedrosDashboardCardContributionProps>;
  order?: number;
}

export interface CedrosAdminModuleContributions {
  dashboardCards?: CedrosDashboardCardContribution[];
}

export type AdminModule = AdminPlugin & {
  contributions?: CedrosAdminModuleContributions;
};
export type CedrosExtensionPackageRef = 'server' | 'react' | 'reactNative';

export interface CedrosExtensionPackageSurface {
  packageName: string;
  version: string;
  subpath?: string;
  required?: boolean;
}

export interface CedrosExtensionPackageFamily {
  server: CedrosExtensionPackageSurface;
  react: CedrosExtensionPackageSurface;
  reactNative: CedrosExtensionPackageSurface;
}

export interface CedrosExtensionCompatibilityManifest {
  platformApiVersion: string;
  minCedrosDataVersion?: string;
  maxCedrosDataVersion?: string;
}

export interface CedrosExtensionServiceDependencyManifest {
  serviceId: string;
  required?: boolean;
  reason?: string;
}

export interface CedrosExtensionCapabilityDependencyManifest {
  capabilityId: string;
  required?: boolean;
  reason?: string;
}

export interface CedrosExtensionFamilyDependencyManifest {
  extensionId: string;
  minVersion?: string;
  maxVersion?: string;
  required?: boolean;
  reason?: string;
}

export interface CedrosExtensionDependenciesManifest {
  services?: CedrosExtensionServiceDependencyManifest[];
  capabilities?: CedrosExtensionCapabilityDependencyManifest[];
  extensions?: CedrosExtensionFamilyDependencyManifest[];
}

export interface CedrosExtensionServerSurfaceManifest {
  packageRef: 'server';
  required?: boolean;
  migrations?: string[];
  settingsSchemas?: string[];
  contentModels?: string[];
  routes?: string[];
  jobs?: string[];
  events?: string[];
}

export interface CedrosExtensionAdminSurfaceManifest {
  packageRef: 'react';
  required?: boolean;
  moduleIds?: string[];
  slotIds?: string[];
  editorSurfaceIds?: string[];
}

export interface CedrosExtensionWebSurfaceManifest {
  packageRef: 'react';
  required?: boolean;
  routeIds?: string[];
  blockTypes?: string[];
  templateIds?: string[];
  authoredSurfaceIds?: string[];
  templateUtilityIds?: string[];
}

export interface CedrosExtensionNativeSurfaceManifest {
  packageRef: 'reactNative';
  required?: boolean;
  screenIds?: string[];
  stackIds?: string[];
  providerIds?: string[];
}

export interface CedrosExtensionSurfacesManifest {
  server: CedrosExtensionServerSurfaceManifest;
  admin: CedrosExtensionAdminSurfaceManifest;
  web: CedrosExtensionWebSurfaceManifest;
  native: CedrosExtensionNativeSurfaceManifest;
  ai?: {
    packageRef: 'server';
    skills: CedrosExtensionAiSkillManifest[];
    capabilities?: CedrosExtensionAiCapabilityManifest[];
  };
}

export interface CedrosExtensionSurfaceRegistrationManifest {
  entrypoint: string;
}

export interface CedrosExtensionRegistrationManifest {
  server: CedrosExtensionSurfaceRegistrationManifest;
  admin: CedrosExtensionSurfaceRegistrationManifest;
  web: CedrosExtensionSurfaceRegistrationManifest;
  native: CedrosExtensionSurfaceRegistrationManifest;
}

export interface CedrosExtensionCapabilityManifest {
  id: string;
  displayName: string;
  description?: string;
  category: string;
  requestedScopes: CedrosExtensionCapabilityScopeManifest[];
}

export interface CedrosExtensionCapabilityScopeManifest {
  verb: 'read' | 'write' | 'trigger' | 'send' | 'call' | 'expose';
  resource: string;
  summary: string;
}

/**
 * Host-resolvable admin sidebar icon names.
 *
 * The Cedros Data host owns the icon registry; these are the names announced
 * by the core team. Extensions reference one of these strings in
 * `adminModules[].sectionIcons[sectionId]` so the host can render an icon
 * next to the entry even when sections come from the manifest only and not
 * from the loaded React module (React `icon` ReactNodes do not survive
 * serialization to the manifest-driven sidebar renderer).
 *
 * Add a new name here only after the core team confirms the host renders it.
 */
export type HostAdminIconName =
  | 'account'
  | 'analytics'
  | 'email'
  | 'extensions'
  | 'history'
  | 'providers'
  | 'security'
  | 'team';

export interface CedrosExtensionAdminNavigationSectionManifest {
  id: string;
  label: string;
  group: string;
  order: number;
  labelKey?: string;
  groupKey?: string;
  hideFromNavigation?: boolean;
  requiredPermission?: string;
  requiredExtensionId?: string;
  replacesSectionIds?: string[];
  disabledReason?: string;
  disabledReasonKey?: string;
  disabled?: boolean;
  adminPageAccess?: {
    configurable?: boolean;
    protected?: boolean;
    routePath?: string;
  };
}

export interface CedrosExtensionAdminNavigationGroupManifest {
  id: string;
  label: string;
  order: number;
  labelKey?: string;
  defaultCollapsed?: boolean;
  hideLabel?: boolean;
}

export interface CedrosExtensionAdminNavigationManifest {
  sections: CedrosExtensionAdminNavigationSectionManifest[];
  groups?: CedrosExtensionAdminNavigationGroupManifest[];
}

export interface CedrosExtensionAdminModuleManifest {
  moduleId: string;
  extensionId: string;
  displayName: string;
  version: string;
  packageName: string;
  sectionIds?: string[];
  /**
   * Host-resolvable icon names per qualified section id.
   * Values must be one of {@link HostAdminIconName}; the host renders these
   * when it builds the sidebar from manifest metadata alone.
   */
  sectionIcons?: Record<string, HostAdminIconName>;
  navigation: CedrosExtensionAdminNavigationManifest;
  slots?: string[];
  contributions?: {
    dashboardCards?: Array<{
      id: string;
      displayName: string;
      description?: string;
      order?: number;
    }>;
  };
}

export interface CedrosExtensionAnalyticsManifest {
  events: Array<{
    id: string;
    displayName: string;
    description: string;
    category: string;
    visibility: 'public' | 'authenticated' | 'admin';
  }>;
}

export interface CedrosExtensionProviderAccessManifest {
  id: string;
  provider: 'intelligence' | 'imageGeneration' | 'voice' | 'storage' | 'email';
  displayName: string;
  description: string;
  scopes: string[];
  tags?: string[];
}

export interface CedrosExtensionDatabaseAccessManifest {
  id: string;
  displayName: string;
  description: string;
  contentModels: string[];
  migrations: string[];
  scopes: Array<{
    verb: 'read' | 'count' | 'write' | 'delete' | 'migrate';
    resource: string;
    summary: string;
  }>;
  tags?: string[];
}

export interface CedrosExtensionPageSeedManifest {
  id: string;
  displayName: string;
  title: string;
  routePath: string;
  description?: string;
  slug?: string;
  templateId?: string;
  autoCreateOnEnable?: boolean;
  publishOnEnable?: boolean;
  seo?: CedrosExtensionSeoManifest;
}

export interface CedrosExtensionSeoManifest {
  /** When true, Core emits robots noindex/nofollow and excludes the page from sitemaps. */
  noindex?: boolean;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Absolute URL or same-origin absolute path; Core validates this at intake. */
  ogImage?: string;
  /** Same-origin absolute path; Core owns canonical tag emission. */
  canonicalPath?: string;
}

export type CedrosContentType =
  | 'page'
  | 'blog'
  | 'docs'
  | 'course'
  | 'airdrop'
  | 'faq'
  | 'directory'
  | 'collection';

export interface CedrosExtensionContentBlockManifest {
  type: string;
  displayName: string;
  description?: string;
  category: string;
  order: number;
}

export interface CedrosExtensionContentTemplateManifest {
  id: string;
  displayName: string;
  description?: string;
  order: number;
  contentTypes: CedrosContentType[];
  surfaceId?: string;
}

export type CedrosExtensionFormFieldType =
  | 'text'
  | 'email'
  | 'textarea'
  | 'tel'
  | 'select'
  | 'checkbox';

export interface CedrosExtensionFormTemplateFieldOption {
  label: string;
  value: string;
}

export interface CedrosExtensionFormTemplateFieldManifest {
  key: string;
  label: string;
  type: CedrosExtensionFormFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: CedrosExtensionFormTemplateFieldOption[];
}

export interface CedrosExtensionFormTemplateManifest {
  id: string;
  displayName: string;
  title: string;
  description?: string;
  defaultKey?: string;
  status?: 'active' | 'draft';
  scope?: 'contact' | 'other';
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  fields: CedrosExtensionFormTemplateFieldManifest[];
  /** Materialize as a real form on enable (host PR #2092); live/draft follows `status`. */
  autoCreateOnEnable?: boolean;
}

export interface CedrosExtensionDocsArticleManifest {
  id: string;
  displayName: string;
  title: string;
  slug: string;
  routePath?: string;
  excerpt?: string;
  bodyMarkdown: string;
  category?: string;
  tags?: string[];
  productSlug?: string;
  productLabel?: string;
  sectionKey?: string;
  sectionLabel?: string;
  sectionOrder?: number;
  navLabel?: string;
  readingMinutes?: number;
  order?: number;
  /** Materialize as a runtime content record on enable (host PR #2092). */
  autoCreateOnEnable?: boolean;
  /** Publish the auto-created article immediately; otherwise it stays a draft. */
  publishOnEnable?: boolean;
}

export interface CedrosExtensionOnboardingPageManifest {
  id: string;
  displayName: string;
  moduleId: string;
  sectionId: string;
  description?: string;
}

export interface CedrosExtensionJobScheduleManifest {
  id: string;
  jobId: string;
  label: string;
  cron: string;
  timezone?: string;
  timeoutSeconds?: number;
  maxRetries?: number;
  /** Create the schedule on enable instead of leaving the job unscheduled (host PR #2092). */
  autoCreateOnEnable?: boolean;
}

export interface CedrosContentBlockComponentProps {
  props: JsonObject;
  /** Trusted host-supplied runtime base URL; never sourced from authored block props. */
  runtimeBaseUrl?: string;
  /**
   * Host-resolved site color mode ("system" already resolved). The host
   * re-invokes the renderer with a fresh value on every footer-toggle or OS
   * change, so this needs no subscription. Undefined during SSR and on older
   * hosts — treat as light and let `.cedros-dark` ancestor CSS own first paint.
   */
  colorMode?: 'light' | 'dark';
}

/**
 * Runtime visual-builder block definition.
 * Inputs are portable authored props; renderers must ignore unrecognized props safely.
 */
export interface CedrosRuntimeContentBlockDefinition extends CedrosExtensionContentBlockManifest {
  Component: ComponentType<CedrosContentBlockComponentProps>;
}

export interface CedrosRuntimeAuthoredBlock {
  type: string;
  props: JsonObject;
}

export interface CedrosRuntimeContentBlockRenderProps {
  /** Authored block payload from the host document. */
  block: CedrosRuntimeAuthoredBlock & { id?: string };
  /** Resolved host theme variant, if the renderer surface provides one. */
  themeVariant?: string;
  /** Host navigation hook for link-like block behavior. */
  onNavigate?: (route: string) => void;
  /** Public-safe host site data for the current render surface. */
  siteData?: unknown;
  /** Host-resolved site color mode; see {@link CedrosContentBlockComponentProps.colorMode}. */
  colorMode?: 'light' | 'dark';
}

export interface CedrosRuntimeContentBlockRenderer {
  /** Content block type handled by this runtime renderer. */
  type: string;
  /** Render the authored block into React output. Throws only for programming errors. */
  render: (props: CedrosRuntimeContentBlockRenderProps) => ReactNode;
}

export interface CedrosRuntimeContentTemplateZone {
  id: string;
  label: string;
  description?: string;
  order: number;
  emptyLabel?: string;
  allowedBlockTypes?: string[];
}

/**
 * Runtime visual-builder template definition.
 * Cedros Data scaffolds page seeds from `label` and `zones`; `blocks` is
 * extension-local starter metadata, not executable React source, HTML, scripts,
 * or styles.
 */
export interface CedrosRuntimeContentTemplateDefinition extends CedrosExtensionContentTemplateManifest {
  label: string;
  zones: CedrosRuntimeContentTemplateZone[];
  blocks: CedrosRuntimeAuthoredBlock[];
  nativeFallback?: string;
}

export interface CedrosExtensionAiSkillManifest {
  id: string;
  name: string;
  description: string;
  category: string;
  tags?: string[];
  visibility: 'public' | 'authenticated' | 'admin';
  docs: { markdown: string };
}

export interface CedrosExtensionAiCapabilityManifest {
  id: string;
  name: string;
  description: string;
  kind: 'tool' | 'action';
  tags?: string[];
  visibility: 'public' | 'authenticated' | 'admin';
  endpoint: { method: 'POST' | 'PUT' | 'PATCH'; path: string };
  auth?: { schemes?: string[] };
  inputSchema: CedrosJsonSchemaObject;
  outputSchema?: CedrosJsonSchemaObject;
}

export interface CedrosExtensionManifest {
  schemaVersion: 1;
  extensionId: string;
  displayName: string;
  version: string;
  description?: string;
  compatibility: CedrosExtensionCompatibilityManifest;
  platformApiVersion: string;
  packageFamily: CedrosExtensionPackageFamily;
  dependencies?: CedrosExtensionDependenciesManifest;
  requiredServices?: string[];
  requiredCapabilities?: string[];
  surfaces: CedrosExtensionSurfacesManifest;
  registration: CedrosExtensionRegistrationManifest;
  capabilities?: CedrosExtensionCapabilityManifest[];
  adminModules?: CedrosExtensionAdminModuleManifest[];
  analytics?: CedrosExtensionAnalyticsManifest;
  providerAccess?: CedrosExtensionProviderAccessManifest[];
  databaseAccess?: CedrosExtensionDatabaseAccessManifest[];
  setupSeeds?: CedrosExtensionSetupSeedsManifest;
  pageSeeds?: CedrosExtensionPageSeedManifest[];
  contentBlocks?: CedrosExtensionContentBlockManifest[];
  contentTemplates?: CedrosExtensionContentTemplateManifest[];
  formTemplates?: CedrosExtensionFormTemplateManifest[];
  docsArticles?: CedrosExtensionDocsArticleManifest[];
  onboardingPages?: CedrosExtensionOnboardingPageManifest[];
  jobSchedules?: CedrosExtensionJobScheduleManifest[];
}

export interface CedrosExtensionBootstrap {
  manifest: CedrosExtensionManifest;
  modules?: AdminModule[];
  contentBlocks?: CedrosRuntimeContentBlockDefinition[];
  contentTemplates?: CedrosRuntimeContentTemplateDefinition[];
  contentBlockRenderers?: CedrosRuntimeContentBlockRenderer[];
}
