import canonicalManifest from "./manifest.json";
import type { CedrosExtensionManifest } from "./contracts";

/**
 * Canonical Cedros Login manifest returned by the React Native registration
 * export. The JSON copy is generated with the root archive manifest so native
 * bootstrap cannot drift into a shortened package-local surface.
 */
export const cedrosLoginNativeExtensionManifest =
  canonicalManifest as unknown as CedrosExtensionManifest;
