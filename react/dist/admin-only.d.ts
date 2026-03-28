import { AdminPlugin } from '@cedros/data-react/admin';
import { AdminShellSectionWrapper } from '@cedros/data-react/admin';

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

export declare const CedrosLoginAdminSectionWrapper: AdminShellSectionWrapper;

declare const cedrosLoginPlugin: AdminPlugin;
export { cedrosLoginPlugin }
export { cedrosLoginPlugin as loginPlugin }

export { }
