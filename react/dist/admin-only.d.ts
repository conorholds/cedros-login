import { ComponentType } from 'react';
import { default as default_2 } from 'react';
import { ReactNode } from 'react';

/**
 * Group configuration for sidebar organization.
 *
 * **Ordering rules:**
 * - Groups are keyed by `label` (not `id`) when merging across plugins.
 * - The first plugin to declare a given label wins the `order` number.
 * - Later plugins adding sections with `group: 'Same Label'` merge into
 *   the existing group without overriding the order.
 * - Groups without an explicit config default to `order: 99` (sink to bottom).
 * - cedros-login declares `Users` at order 0 and `Configuration` at order 2,
 *   leaving order 1 available for other plugins to insert between them.
 */
export declare interface AdminGroupConfig {
    /** Group identifier */
    id: string;
    /** Display label — used as the merge key across plugins */
    label: string;
    /** Sort order (lower = higher in sidebar). First plugin to declare a label wins. */
    order: number;
    /** Icon for the group header */
    icon?: ReactNode;
    /** Whether group starts collapsed */
    defaultCollapsed?: boolean;
}

/**
 * Plugin definition — the main export from each admin module.
 *
 * **Plugin merge order:** Plugins are iterated in registration order (insertion
 * order of the registry `Map`). Sections from later plugins are appended after
 * sections from earlier plugins. There is no cross-plugin section dedup — each
 * plugin's section IDs are namespaced via `qualifiedId` (`pluginId:sectionId`).
 *
 * **Section visibility:** Each section passes two filters:
 * 1. `checkPermission(section.requiredPermission, hostContext)` — role-based.
 * 2. `hostContext.dashboardPermissions?.canAccess(section.id)` — owner RBAC.
 *
 * Register at the composition root:
 * ```tsx
 * <AdminShell plugins={[cedrosLoginPlugin, cedrosPayPlugin]} hostContext={ctx}>
 *   {children}
 * </AdminShell>
 * ```
 */
export declare interface AdminPlugin {
    /** Unique plugin identifier */
    id: PluginId;
    /** Display name for the plugin */
    name: string;
    /** Plugin version (semver) */
    version: string;
    /** Sections this plugin contributes */
    sections: AdminSectionConfig[];
    /** Sidebar groups with display order */
    groups?: AdminGroupConfig[];
    /** Map of section ID to component */
    components: Record<SectionId, ComponentType<AdminSectionProps>>;
    /**
     * Context bridge - converts host context to plugin-specific context.
     */
    createPluginContext: (hostContext: HostContext) => PluginContext;
    /**
     * Permission resolver - maps plugin permissions to host permission checks.
     */
    checkPermission: (permission: PluginPermission, hostContext: HostContext) => boolean;
    /** CSS class prefix for all plugin styles */
    cssNamespace: string;
    /** Called when plugin is registered */
    onRegister?: (registry: PluginRegistry) => void;
    /** Called when plugin is unregistered */
    onUnregister?: () => void;
}

/**
 * Section configuration for sidebar navigation.
 *
 * **Ordering:** Sections within a group are sorted by `order` (ascending).
 * Sections with the same order are shown in plugin registration order.
 * Sections without a `group` fall into the implicit `'Menu'` group.
 */
export declare interface AdminSectionConfig {
    /** Section ID unique within the plugin */
    id: SectionId;
    /** Display label for sidebar */
    label: string;
    /** React node for the icon (SVG or component) */
    icon: ReactNode;
    /** Sidebar group name — must match an {@link AdminGroupConfig.label} to merge into that group */
    group?: string;
    /** Sort order within group (lower = higher). Default: 0 */
    order?: number;
    /** Permission required to see this section */
    requiredPermission?: PluginPermission;
    /** Badge content (e.g., notification count) */
    badge?: ReactNode;
}

/**
 * Props passed to section components by AdminShell.
 */
export declare interface AdminSectionProps {
    /** Plugin context with auth and API access */
    pluginContext: PluginContext;
    /** Page size for lists */
    pageSize: number;
    /** Refresh interval for auto-updating data (0 = disabled) */
    refreshInterval: number;
}

export declare function AdminShell({ title, plugins: initialPlugins, hostContext, defaultSection, pageSize, refreshInterval, onSectionChange, logo, sidebarFooter, onSettingsClick, onLogoutClick, className, }: AdminShellProps): default_2.JSX.Element;

declare interface AdminShellContextValue {
    registry: PluginRegistry;
    hostContext: HostContext;
    activeSection: QualifiedSectionId | null;
    setActiveSection: (section: QualifiedSectionId) => void;
    getPluginContext: (pluginId: string) => PluginContext | null;
}

export declare interface AdminShellProps {
    /** Dashboard title */
    title?: string;
    /** Plugins to load */
    plugins?: AdminPlugin[];
    /** Host context from parent providers */
    hostContext: HostContext;
    /** Default active section (qualified ID) */
    defaultSection?: QualifiedSectionId;
    /** Page size for lists */
    pageSize?: number;
    /** Refresh interval in ms (0 to disable) */
    refreshInterval?: number;
    /** Callback when section changes */
    onSectionChange?: (section: QualifiedSectionId) => void;
    /** Custom logo/header content */
    logo?: ReactNode;
    /** Additional sidebar footer content */
    sidebarFooter?: ReactNode;
    /** Callback when user clicks Settings in profile dropdown */
    onSettingsClick?: () => void;
    /** Callback when user clicks Logout in profile dropdown */
    onLogoutClick?: () => void;
    /** Additional CSS class */
    className?: string;
}

/**
 * All section IDs registered by the cedros-login plugin.
 *
 * Use these to reference specific sections when configuring
 * `dashboardPermissions.canAccess()` or navigating programmatically.
 *
 * Qualified IDs (for multi-plugin use) are prefixed: `cedros-login:{id}`.
 */
export declare const CEDROS_LOGIN_SECTION_IDS: {
    readonly users: "users";
    readonly team: "team";
    readonly deposits: "deposits";
    readonly withdrawals: "withdrawals";
    readonly settingsAuth: "settings-auth";
    readonly settingsEmail: "settings-email";
    readonly settingsWebhooks: "settings-webhooks";
    readonly settingsWallet: "settings-wallet";
    readonly settingsCredits: "settings-credits";
    readonly settingsServer: "settings-server";
};

declare const cedrosLoginPlugin: AdminPlugin;
export { cedrosLoginPlugin }
export { cedrosLoginPlugin as loginPlugin }

/**
 * Host context provided by the application to `<AdminShell>`.
 *
 * Each field is optional — omit fields your app doesn't use.
 * Plugins read the fields they need and degrade gracefully when absent.
 *
 * **Which plugin reads what:**
 * - `cedros-login` plugin: requires `cedrosLogin` (throws if missing).
 *   Uses `user`, `getAccessToken`, `serverUrl` for all API calls.
 *   Reads `org` for role-based section filtering.
 * - `cedros-pay` plugin: requires `cedrosPay`. Uses `walletAddress`,
 *   `jwtToken`, `serverUrl`.
 * - Both plugins: respect `dashboardPermissions` for section-level RBAC.
 *
 * **Missing field behavior:**
 * - `cedrosLogin` missing → cedros-login plugin throws at `createPluginContext()`.
 * - `cedrosPay` missing → cedros-pay plugin throws at `createPluginContext()`.
 * - `org` missing → all authenticated users are treated as global admins
 *   (all permission checks pass).
 * - `dashboardPermissions` missing → all sections visible (no owner-level filtering).
 * - `custom` → pass-through bag, not read by built-in plugins.
 */
export declare interface HostContext {
    /**
     * Cedros Login auth context.
     *
     * **Required by:** `cedros-login` plugin.
     * **Missing behavior:** plugin throws `'cedros-login plugin requires cedrosLogin in hostContext'`.
     */
    cedrosLogin?: {
        /** Authenticated user, or null if not signed in */
        user: {
            id: string;
            email?: string;
            name?: string;
            picture?: string;
        } | null;
        /** Returns current JWT access token, or null */
        getAccessToken: () => string | null;
        /** Base URL of the cedros-login server (e.g., `https://api.example.com`) */
        serverUrl: string;
    };
    /**
     * Cedros Pay context.
     *
     * **Required by:** `cedros-pay` plugin.
     * **Missing behavior:** pay plugin throws at context creation.
     */
    cedrosPay?: {
        /** Connected wallet public key */
        walletAddress?: string;
        /** JWT for cedros-pay API */
        jwtToken?: string;
        /** Base URL of the cedros-pay server */
        serverUrl: string;
    };
    /**
     * Organization context for multi-tenant role-based access.
     *
     * **Missing behavior:** all permission checks pass (global admin assumed).
     */
    org?: {
        /** Current organization ID */
        orgId: string;
        /** User's role in this org (e.g., 'owner', 'admin', 'member') */
        role: string;
        /** Granular permission strings (e.g., 'member:read', 'invite:create') */
        permissions: string[];
    };
    /**
     * Owner-configured section-level access control.
     *
     * Applied *after* plugin permission checks — a section must pass both
     * `plugin.checkPermission()` and `canAccess()` to be visible.
     *
     * **Missing behavior:** all sections visible (no owner-level filtering).
     */
    dashboardPermissions?: {
        /** Check if current user can access a section by its `SectionId` */
        canAccess: (sectionId: string) => boolean;
    };
    /** Generic extension point for custom plugins. Not read by built-in plugins. */
    custom?: Record<string, unknown>;
}

export declare const Icons: Record<string, ReactNode>;

/**
 * Context provided to each plugin's section components.
 */
export declare interface PluginContext {
    /** Server URL for API calls */
    serverUrl: string;
    /** Current authenticated user ID (if any) */
    userId?: string;
    /** Function to get current access token */
    getAccessToken: () => string | null;
    /** Permission check function */
    hasPermission: (permission: PluginPermission) => boolean;
    /** Current organization ID (if applicable) */
    orgId?: string;
    /** Plugin-specific context data */
    pluginData?: Record<string, unknown>;
}

/** Unique identifier for a plugin */
export declare type PluginId = string;

/** Permission identifier for capability checking */
export declare type PluginPermission = string;

/**
 * Plugin registry for runtime management.
 */
export declare interface PluginRegistry {
    /** Register a plugin */
    register(plugin: AdminPlugin): void;
    /** Unregister a plugin by ID */
    unregister(pluginId: PluginId): void;
    /** Get registered plugin by ID */
    get(pluginId: PluginId): AdminPlugin | undefined;
    /** Get all registered plugins */
    getAll(): AdminPlugin[];
    /** Listen for registration changes */
    subscribe(listener: (plugins: AdminPlugin[]) => void): () => void;
}

/** Fully qualified section ID: `pluginId:sectionId` */
export declare type QualifiedSectionId = `${PluginId}:${SectionId}`;

/**
 * Extended section config with plugin metadata (internal use).
 */
export declare interface ResolvedSection extends AdminSectionConfig {
    /** Fully qualified section ID */
    qualifiedId: QualifiedSectionId;
    /** Source plugin ID */
    pluginId: PluginId;
    /** CSS namespace from plugin */
    cssNamespace: string;
}

/** Section identifier, unique within a plugin */
export declare type SectionId = string;

export declare function useAdminShell(): AdminShellContextValue;

export { }
