import { describe, expect, it } from "vitest";

import canonicalManifest from "./extension/manifest.json";
import registerCedrosLoginNativeSurface from "./register";

describe("cedros-login native extension registration", () => {
  it("returns the canonical Cedros Login manifest bootstrap", () => {
    const bootstrap = registerCedrosLoginNativeSurface();

    expect(bootstrap.manifest).toEqual(canonicalManifest);
    expect(bootstrap.manifest.extensionId).toBe("cedros-login");
    expect(bootstrap.manifest.registration.native.entrypoint).toBe(
      "@cedros/login-react-native/register",
    );
    expect(bootstrap.manifest.registration.admin.entrypoint).toBe(
      "@cedros/login-react/admin/register",
    );
    expect(bootstrap.manifest.surfaces.native.packageRef).toBe("reactNative");
    expect(bootstrap.manifest.surfaces.native.providerIds).toContain(
      "cedros-login:provider",
    );
    expect(bootstrap.manifest.surfaces.server.contentModels).toContain(
      "cedros-login:identity-records",
    );
    expect(bootstrap.manifest.surfaces.admin.required).toBe(true);
    expect(bootstrap.manifest.surfaces.admin.moduleIds).toEqual([
      "cedros-login:admin",
    ]);
    expect(bootstrap.manifest.adminModules?.[0]?.sectionIds).toEqual([
      "cedros-login:login",
    ]);
    expect(
      bootstrap.manifest.contentBlocks?.map((block) => block.type),
    ).toContain("cedros-login:auth-form");
    expect(bootstrap.manifest.databaseAccess?.[0]?.migrations).toContain(
      "cedros-login:identity-schema-v1",
    );
  });
});
