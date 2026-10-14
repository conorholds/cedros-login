import { cedrosLoginNativeExtensionManifest } from "./extension/manifest";
import type { CedrosExtensionBootstrap } from "./extension/contracts";

const cedrosLoginNativeExtensionBootstrap: CedrosExtensionBootstrap = {
  manifest: cedrosLoginNativeExtensionManifest,
};

function registerCedrosLoginNativeSurface(): CedrosExtensionBootstrap {
  return cedrosLoginNativeExtensionBootstrap;
}

export default registerCedrosLoginNativeSurface;
