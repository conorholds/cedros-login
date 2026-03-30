import { AdminHostContext } from '@cedros/data-react/admin';
import { AdminHostServiceBag } from '@cedros/data-react/admin';
import { AdminModule } from '@cedros/data-react/admin';
import { AdminModuleId } from '@cedros/data-react/admin';
import { AdminModuleManifest } from '@cedros/data-react/admin';
import { AdminModulePermission } from '@cedros/data-react/admin';
import { AdminModuleRegistry } from '@cedros/data-react/admin';
import { AdminPlugin } from '@cedros/data-react/admin';
import { AdminShellSectionWrapper } from '@cedros/data-react/admin';
import { CedrosExtensionManifest } from '@cedros/data-react/admin';
import { CedrosExtensionPackageSurface } from '@cedros/data-react/admin';
import { CedrosInstalledExtension } from '@cedros/data-react/admin';
import { CedrosInstalledExtensionCatalog } from '@cedros/data-react/admin';

export { AdminHostContext }

export { AdminHostServiceBag }

export { AdminModule }

export { AdminModuleId }

export { AdminModuleManifest }

export { AdminModulePermission }

export { AdminModuleRegistry }

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

export { CedrosExtensionManifest }

export { CedrosExtensionPackageSurface }

export { CedrosInstalledExtension }

export { CedrosInstalledExtensionCatalog }

export declare const cedrosLoginAdminModuleManifest: AdminModuleManifest;

export declare const CedrosLoginAdminSectionWrapper: AdminShellSectionWrapper;

export declare const cedrosLoginExtensionManifest: CedrosExtensionManifest;

/**
 * Ready-made installed-extension descriptor for AdminShell's preferred
 * `installedExtensions` composition path.
 */
export declare const cedrosLoginInstalledExtension: CedrosInstalledExtension;

declare const cedrosLoginPlugin: AdminPlugin;
export { cedrosLoginPlugin }
export { cedrosLoginPlugin as loginPlugin }

export { }
