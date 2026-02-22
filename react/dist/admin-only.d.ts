import { ComponentType } from 'react';
import { default as default_2 } from 'react';
import { ReactNode } from 'react';

/**
 * Group configuration for sidebar organization.
 */
export declare interface AdminGroupConfig {
    /** Group identifier */
    id: string;
    /** Display label */
    label: string;
    /** Sort order (lower = higher in sidebar) */
    order: number;
    /** Icon for the group header */
    icon?: ReactNode;
    /** Whether group starts collapsed */
    defaultCollapsed?: boolean;
}

/**
 * Plugin definition - the main export from each admin module.
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
 */
export declare interface AdminSectionConfig {
    /** Section ID unique within the plugin */
    id: SectionId;
    /** Display label for sidebar */
    label: string;
    /** React node for the icon (SVG or component) */
    icon: ReactNode;
    /** Sidebar group name for visual organization */
    group?: string;
    /** Sort order within group (lower = higher) */
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

declare const cedrosLoginPlugin: AdminPlugin;
export { cedrosLoginPlugin }
export { cedrosLoginPlugin as loginPlugin }

/**
 * Host context provided by AdminShell to plugins.
 * Aggregates auth/context from all available sources.
 */
export declare interface HostContext {
    /** cedros-login context */
    cedrosLogin?: {
        user: {
            id: string;
            email?: string;
            name?: string;
            picture?: string;
        } | null;
        getAccessToken: () => string | null;
        serverUrl: string;
    };
    /** cedros-pay context */
    cedrosPay?: {
        walletAddress?: string;
        jwtToken?: string;
        serverUrl: string;
    };
    /** Organization context */
    org?: {
        orgId: string;
        role: string;
        permissions: string[];
    };
    /**
     * Dashboard section permissions (configured by org owner).
     * Provides role-based access control for individual dashboard sections.
     */
    dashboardPermissions?: {
        /** Check if current user can access a section by ID */
        canAccess: (sectionId: string) => boolean;
    };
    /** Generic extension point */
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
