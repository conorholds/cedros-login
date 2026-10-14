import { existsSync, lstatSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Files from `ui/dist/**` (the compiled React admin runtime) that the intake
 * ZIP must carry so Cedros platform can resolve `@cedros/login-react/admin/register`
 * directly from the uploaded archive — no npm/tarball/workspace fetch.
 *
 * Excludes source maps (large, debug-only) and the MSW worker (test infra).
 * Keeps both ESM (.js) and CJS (.cjs) so package.json `exports.import` and
 * `exports.require` conditions both resolve, plus type declarations (.d.ts)
 * and the bundled stylesheet.
 */
export function intakeReactDistEntries(repoRoot) {
  const distExcludes = [
    /\.map$/,
    /(^|\/)mockServiceWorker\.js$/,
    /(^|\/)\.DS_Store$/,
  ];
  return mapDirectory(repoRoot, 'ui/dist', 'workspace/react/dist', {
    exclude: distExcludes,
  });
}

/**
 * Compiled React Native package files required by the manifest-owned native
 * registration entrypoint. The host validates every package export against
 * the immutable intake archive, so source-only native packages are invalid.
 */
export function intakeReactNativeDistEntries(repoRoot) {
  return mapDirectory(repoRoot, 'react-native/dist', 'workspace/react-native/dist', {
    exclude: [/\.map$/, /(^|\/)\.DS_Store$/],
  });
}

export function intakeEntryPlan() {
  return [
    mapEntry('server/Cargo.toml', 'workspace/server/Cargo.toml'),
    mapEntry('server/examples/export_extension_manifest.rs', 'workspace/server/examples/export_extension_manifest.rs'),
    mapEntry('server/src/extension_ai_surface.rs', 'workspace/server/src/extension_ai_surface.rs'),
    mapEntry('server/src/extension_manifest.rs', 'workspace/server/src/extension_manifest.rs'),
    mapEntry('server/src/extension_manifest_metadata.rs', 'workspace/server/src/extension_manifest_metadata.rs'),
    mapEntry('server/src/extension_onboarding.rs', 'workspace/server/src/extension_onboarding.rs'),
    mapEntry('server/src/extension_server_routes.rs', 'workspace/server/src/extension_server_routes.rs'),
    mapEntry('server/src/extension_starters.rs', 'workspace/server/src/extension_starters.rs'),
    mapEntry('server/src/extension_visual_builder.rs', 'workspace/server/src/extension_visual_builder.rs'),
    mapEntry('server/src/lib.rs', 'workspace/server/src/lib.rs'),
    mapEntry('ui/package.json', 'workspace/react/package.json'),
    mapEntry('ui/src/admin/cedrosAdminModule.ts', 'workspace/react/src/admin/cedrosAdminModule.ts'),
    mapEntry('ui/src/admin/register.ts', 'workspace/react/src/admin/register.ts'),
    mapEntry('ui/src/extension/capabilities.ts', 'workspace/react/src/extension/capabilities.ts'),
    mapEntry('ui/src/extension/contracts.ts', 'workspace/react/src/extension/contracts.ts'),
    mapEntry('ui/src/extension/manifest.ts', 'workspace/react/src/extension/manifest.ts'),
    mapEntry('ui/src/extension/serverRoutes.ts', 'workspace/react/src/extension/serverRoutes.ts'),
    mapEntry('ui/src/extension/starters.ts', 'workspace/react/src/extension/starters.ts'),
    mapEntry('ui/src/extension/auth-blocks.css', 'workspace/react/src/extension/auth-blocks.css'),
    mapEntry('ui/src/extension/auth-blocks.css', 'workspace/react/dist/auth-blocks.css'),
    mapEntry('ui/src/extension/authFormBlockRenderer.ts', 'workspace/react/src/extension/authFormBlockRenderer.ts'),
    mapEntry('ui/src/components/shared/providerIcons.tsx', 'workspace/react/src/components/shared/providerIcons.tsx'),
    mapEntry('ui/src/extension/visualBuilder.ts', 'workspace/react/src/extension/visualBuilder.ts'),
    mapEntry('ui/src/extension/visualBuilderIds.ts', 'workspace/react/src/extension/visualBuilderIds.ts'),
    mapEntry('ui/src/extension/visualBuilderRenderers.ts', 'workspace/react/src/extension/visualBuilderRenderers.ts'),
    mapEntry('ui/src/web/register.ts', 'workspace/react/src/web/register.ts'),
    mapEntry('react-native/package.json', 'workspace/react-native/package.json'),
    mapEntry('react-native/src/extension/contracts.ts', 'workspace/react-native/src/extension/contracts.ts'),
    mapEntry('react-native/src/extension/manifest.json', 'workspace/react-native/src/extension/manifest.json'),
    mapEntry('react-native/src/extension/manifest.ts', 'workspace/react-native/src/extension/manifest.ts'),
    mapEntry('react-native/src/register.ts', 'workspace/react-native/src/register.ts'),
    ...handoffEntries(),
  ];
}

export function sourceReviewEntryPlan(repoRoot) {
  const srcExcludes = [
    /(^|\/)\.DS_Store$/,
    /\.swp$/,
    /(^|\/)\.env(\..*)?$/,
    /(^|\/)\.envrc$/,
    /(^|\/)\.npmrc$/,
  ];
  const serverExcludes = [
    /^target(\/|$)/,
    /^vendor(\/|$)/,
    /^\.git(\/|$)/,
    /^node_modules(\/|$)/,
    /^\.cargo(\/|$)/,
    /(^|\/)Cargo\.lock$/,
    /(^|\/)\.DS_Store$/,
    /\.swp$/,
    /(^|\/)\.env(\..*)?$/,
    /(^|\/)\.envrc$/,
    /(^|\/)\.npmrc$/,
    /(^|\/)\.cargo-ok$/,
    /\.log$/,
  ];
  return [
    mapEntry('ui/package.json', 'workspace/react/package.json'),
    mapEntry('ui/tsconfig.json', 'workspace/react/tsconfig.json'),
    mapEntry('ui/tsconfig.app.json', 'workspace/react/tsconfig.app.json'),
    mapEntry('ui/tsconfig.build.json', 'workspace/react/tsconfig.build.json'),
    mapEntry('ui/tsconfig.node.json', 'workspace/react/tsconfig.node.json'),
    mapEntry('ui/vite.config.ts', 'workspace/react/vite.config.ts'),
    ...mapDirectory(repoRoot, 'ui/src', 'workspace/react/src', { exclude: srcExcludes }),
    mapEntry('react-native/package.json', 'workspace/react-native/package.json'),
    mapEntry('react-native/tsconfig.json', 'workspace/react-native/tsconfig.json'),
    mapEntry('react-native/vite.config.ts', 'workspace/react-native/vite.config.ts'),
    ...mapDirectory(repoRoot, 'react-native/src', 'workspace/react-native/src', { exclude: srcExcludes }),
    ...mapDirectory(repoRoot, 'server', 'workspace/server', { exclude: serverExcludes }),
    ...mapDirectory(repoRoot, 'server-wasm', 'workspace/server-wasm', { exclude: serverExcludes }),
    mapEntry('scripts/benchmark-server-wasm-artifact.mjs', 'workspace/scripts/benchmark-server-wasm-artifact.mjs'),
    ...handoffEntries(),
  ];
}

function handoffEntries() {
  return [
    mapEntry('contracts/schemas/cedros-login-access-token.schema.json', 'workspace/contracts/schemas/cedros-login-access-token.schema.json'),
    mapEntry('contracts/schemas/cedros-login-auth-response.schema.json', 'workspace/contracts/schemas/cedros-login-auth-response.schema.json'),
    mapEntry('contracts/schemas/cedros-login-user-context.schema.json', 'workspace/contracts/schemas/cedros-login-user-context.schema.json'),
    mapEntry('contracts/schemas/cedros-login-identity-profile-v1.schema.json', 'workspace/contracts/schemas/cedros-login-identity-profile-v1.schema.json'),
    mapEntry('contracts/schemas/cedros-login-identity-profile-error-v1.schema.json', 'workspace/contracts/schemas/cedros-login-identity-profile-error-v1.schema.json'),
    mapEntry('contracts/host/cedros-login-identity-profile-contract.v1.json', 'workspace/contracts/host/cedros-login-identity-profile-contract.v1.json'),
    mapEntry('contracts/fixtures/cedros-login-identity-profile-v1.json', 'workspace/contracts/fixtures/cedros-login-identity-profile-v1.json'),
    mapEntry('scripts/test-cedros-login-identity-profile-installed-host.mjs', 'workspace/scripts/test-cedros-login-identity-profile-installed-host.mjs'),
    mapEntry('contracts/schemas/cedros-login-v1-jwks.schema.json', 'workspace/contracts/schemas/cedros-login-v1-jwks.schema.json'),
    mapEntry('contracts/schemas/cedros-login-session-introspection-v1.schema.json', 'workspace/contracts/schemas/cedros-login-session-introspection-v1.schema.json'),
    mapEntry('contracts/schemas/cedros-login-user-directory-v1.schema.json', 'workspace/contracts/schemas/cedros-login-user-directory-v1.schema.json'),
    mapEntry('contracts/schemas/cedros-login-user-count-v1.schema.json', 'workspace/contracts/schemas/cedros-login-user-count-v1.schema.json'),
    mapEntry('contracts/host/cedros-login-relying-party-identity-contract.v1.json', 'workspace/contracts/host/cedros-login-relying-party-identity-contract.v1.json'),
    mapEntry('contracts/fixtures/cedros-login-relying-party-identity-v1.json', 'workspace/contracts/fixtures/cedros-login-relying-party-identity-v1.json'),
    mapEntry('scripts/validate-cedros-login-relying-party-contract.mjs', 'workspace/scripts/validate-cedros-login-relying-party-contract.mjs'),
    mapEntry('docs/cedros-controls-login-contract.md', 'workspace/docs/cedros-controls-login-contract.md'),
    mapEntry('docs/cedros-login-identity-profile-contract.md', 'workspace/docs/cedros-login-identity-profile-contract.md'),
    mapEntry('docs/cedros-package-family-shape-map.json', 'workspace/docs/cedros-package-family-shape-map.json'),
    mapEntry('docs/cedros-release-readiness-handoff.md', 'workspace/docs/cedros-release-readiness-handoff.md'),
    mapEntry('docs/cedros-release-readiness-map.json', 'workspace/docs/cedros-release-readiness-map.json'),
    mapEntry('docs/cedros-host-coordination-handoff-map.json', 'workspace/docs/cedros-host-coordination-handoff-map.json'),
    mapEntry('docs/cedros-server-native-host-coordination-map.json', 'workspace/docs/cedros-server-native-host-coordination-map.json'),
  ];
}

function mapDirectory(repoRoot, sourceDir, entryDir, options = {}) {
  const absoluteRoot = resolve(repoRoot, sourceDir);
  if (!existsSync(absoluteRoot) || !lstatSync(absoluteRoot).isDirectory()) {
    throw new Error(`missing source directory ${sourceDir}`);
  }
  const exclude = options.exclude ?? [];
  const mapped = [];
  const stack = [''];
  while (stack.length > 0) {
    const relativeDir = stack.pop();
    const absoluteDir = resolve(absoluteRoot, relativeDir);
    for (const item of readdirSync(absoluteDir, { withFileTypes: true })) {
      const relativePath = relativeDir ? `${relativeDir}/${item.name}` : item.name;
      if (exclude.some((pattern) => pattern.test(relativePath))) continue;
      if (item.isDirectory()) stack.push(relativePath);
      if (item.isFile()) mapped.push(mapEntry(`${sourceDir}/${relativePath}`, `${entryDir}/${relativePath}`));
    }
  }
  return mapped.sort((left, right) => left.entry.localeCompare(right.entry));
}

function mapEntry(source, entry) {
  return { source, entry };
}
