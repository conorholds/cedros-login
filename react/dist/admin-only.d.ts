import { AdminGroupConfig } from '@cedros/admin-react';
import { AdminHostContext } from '@cedros/admin-react';
import { AdminHostServiceBag } from '@cedros/admin-react';
import { AdminPlugin } from '@cedros/admin-react';
import { AdminSectionConfig } from '@cedros/admin-react';
import { AdminSectionProps } from '@cedros/admin-react';
import { HostContext } from '@cedros/admin-react';
import { PluginContext } from '@cedros/admin-react';
import { PluginId } from '@cedros/admin-react';
import { PluginPermission } from '@cedros/admin-react';
import { PluginRegistry } from '@cedros/admin-react';
import { QualifiedSectionId } from '@cedros/admin-react';
import { ResolvedSection } from '@cedros/admin-react';
import { SectionId } from '@cedros/admin-react';

export { AdminGroupConfig }

export { AdminHostContext }

export { AdminHostServiceBag }

export { AdminPlugin }

export { AdminSectionConfig }

export { AdminSectionProps }

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

export { HostContext }

export { PluginContext }

export { PluginId }

export { PluginPermission }

export { PluginRegistry }

export { QualifiedSectionId }

export { ResolvedSection }

export { SectionId }

export { }
