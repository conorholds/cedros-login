import canonicalManifest from './manifest.generated.json';
import type { CedrosExtensionManifest, CedrosExtensionPackageFamily } from './contracts';

/** Generated from the canonical Rust registration manifest. */
export const cedrosLoginExtensionManifest = canonicalManifest as unknown as CedrosExtensionManifest;

export const CEDROS_LOGIN_EXTENSION_ID = cedrosLoginExtensionManifest.extensionId;
export const CEDROS_LOGIN_EXTENSION_VERSION = cedrosLoginExtensionManifest.version;
export const CEDROS_LOGIN_DASHBOARD_CARD_ID = 'cedros-login:identity-health-card';
export const CEDROS_LOGIN_DASHBOARD_CARD_ORDER = 20;
export const CEDROS_LOGIN_ADMIN_MODULE_ID = 'cedros-login:admin';

export const cedrosLoginPackageFamily =
  cedrosLoginExtensionManifest.packageFamily as CedrosExtensionPackageFamily;

export const cedrosLoginAdminModuleManifest = (() => {
  const adminModule = cedrosLoginExtensionManifest.adminModules?.find(
    (module) => module.moduleId === CEDROS_LOGIN_ADMIN_MODULE_ID
  );
  if (!adminModule) {
    throw new Error(`Canonical manifest is missing admin module ${CEDROS_LOGIN_ADMIN_MODULE_ID}`);
  }
  return adminModule;
})();

export const cedrosLoginAdminNavigation = cedrosLoginAdminModuleManifest.navigation;
