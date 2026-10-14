export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export interface CedrosJsonSchemaObject {
  [keyword: string]:
    | JsonValue
    | CedrosJsonSchema
    | readonly CedrosJsonSchema[]
    | Record<string, CedrosJsonSchema>
    | undefined;
  type?: string | readonly string[];
  properties?: Record<string, CedrosJsonSchema>;
  required?: readonly string[];
  additionalProperties?: boolean | CedrosJsonSchema;
  items?: CedrosJsonSchema | readonly CedrosJsonSchema[];
  enum?: readonly JsonValue[];
  const?: JsonValue;
  description?: string;
  format?: string;
}

export type CedrosJsonSchema = boolean | CedrosJsonSchemaObject;

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

export interface CedrosExtensionServerSurfaceManifest {
  packageRef: "server";
  required?: boolean;
  migrations?: string[];
  settingsSchemas?: string[];
  contentModels?: string[];
  routes?: string[];
  jobs?: string[];
  events?: string[];
}

export interface CedrosExtensionAdminSurfaceManifest {
  packageRef: "react";
  required?: boolean;
  moduleIds?: string[];
  slotIds?: string[];
  editorSurfaceIds?: string[];
}

export interface CedrosExtensionWebSurfaceManifest {
  packageRef: "react";
  required?: boolean;
  routeIds?: string[];
  blockTypes?: string[];
  templateIds?: string[];
  authoredSurfaceIds?: string[];
  templateUtilityIds?: string[];
}

export interface CedrosExtensionNativeSurfaceManifest {
  packageRef: "reactNative";
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
    packageRef: "server";
    skills: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      tags?: string[];
      visibility: "public" | "authenticated" | "admin";
      docs: { markdown: string };
    }>;
    capabilities?: Array<{
      id: string;
      name: string;
      description: string;
      kind: "tool" | "action";
      tags?: string[];
      visibility: "public" | "authenticated" | "admin";
      endpoint: { method: "POST" | "PUT" | "PATCH"; path: string };
      auth?: { schemes?: string[] };
      inputSchema: CedrosJsonSchemaObject;
      outputSchema?: CedrosJsonSchemaObject;
    }>;
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

export interface CedrosExtensionCapabilityScopeManifest {
  verb: "read" | "write" | "trigger" | "send" | "call" | "expose";
  resource: string;
  summary: string;
}

export interface CedrosExtensionAdminModuleManifest {
  moduleId: string;
  extensionId: string;
  displayName: string;
  version: string;
  packageName: string;
  sectionIds?: string[];
  sectionIcons?: Record<string, string>;
  navigation: {
    sections: Array<{
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
    visibility: "public" | "authenticated" | "admin";
  }>;
}

export interface CedrosExtensionProviderAccessManifest {
  id: string;
  provider: "intelligence" | "imageGeneration" | "voice" | "storage" | "email";
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
    verb: "read" | "count" | "write" | "delete" | "migrate";
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
  | "page"
  | "blog"
  | "docs"
  | "course"
  | "airdrop"
  | "faq"
  | "directory"
  | "collection";

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
  | "text"
  | "email"
  | "textarea"
  | "tel"
  | "select"
  | "checkbox";

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
  status?: "active" | "draft";
  scope?: "contact" | "other";
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  fields: CedrosExtensionFormTemplateFieldManifest[];
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
}

export interface CedrosExtensionOnboardingPageManifest {
  id: string;
  displayName: string;
  moduleId: string;
  sectionId: string;
  description?: string;
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
  surfaces: CedrosExtensionSurfacesManifest;
  registration: CedrosExtensionRegistrationManifest;
  requiredServices?: string[];
  requiredCapabilities?: string[];
  dependencies?: {
    services?: Array<{
      serviceId: string;
      required?: boolean;
      reason?: string;
    }>;
    capabilities?: Array<{
      capabilityId: string;
      required?: boolean;
      reason?: string;
    }>;
    extensions?: Array<{
      extensionId: string;
      minVersion?: string;
      maxVersion?: string;
      required?: boolean;
      reason?: string;
    }>;
  };
  capabilities?: Array<{
    id: string;
    displayName: string;
    description?: string;
    category: string;
    requestedScopes: CedrosExtensionCapabilityScopeManifest[];
  }>;
  adminModules?: CedrosExtensionAdminModuleManifest[];
  analytics?: CedrosExtensionAnalyticsManifest;
  providerAccess?: CedrosExtensionProviderAccessManifest[];
  databaseAccess?: CedrosExtensionDatabaseAccessManifest[];
  pageSeeds?: CedrosExtensionPageSeedManifest[];
  contentBlocks?: CedrosExtensionContentBlockManifest[];
  contentTemplates?: CedrosExtensionContentTemplateManifest[];
  formTemplates?: CedrosExtensionFormTemplateManifest[];
  docsArticles?: CedrosExtensionDocsArticleManifest[];
  onboardingPages?: CedrosExtensionOnboardingPageManifest[];
}

export interface CedrosExtensionBootstrap {
  manifest: CedrosExtensionManifest;
  modules?: JsonObject[];
  contentBlocks?: JsonObject[];
  contentTemplates?: JsonObject[];
}
