#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const sharedTypeFiles = [
  'auth.ts',
  'invite.ts',
  'member.ts',
  'org.ts',
  'profile.ts',
  'session.ts',
  'totp.ts',
];
const packageTargets = ['ui/src/types', 'react-native/src/types'];

validateSharedTypes();
validateManifestContract();

console.log('cedros contracts validation passed');

function validateSharedTypes() {
  for (const file of sharedTypeFiles) {
    const source = readText(`contracts/src/types/${file}`);
    for (const targetDir of packageTargets) {
      const target = `${targetDir}/${file}`;
      assertEqual(readText(target), source, `${target} is not generated from contracts/src/types/${file}`);
    }
  }
}

function validateManifestContract() {
  for (const schema of [
    'extension-manifest.schema.json',
    'cedros-login-access-token.schema.json',
    'cedros-login-auth-response.schema.json',
    'cedros-login-user-context.schema.json',
    'cedros-login-identity-profile-v1.schema.json',
    'cedros-login-identity-profile-error-v1.schema.json',
    'cedros-login-v1-jwks.schema.json',
    'cedros-login-session-introspection-v1.schema.json',
    'cedros-login-user-directory-v1.schema.json',
    'cedros-login-user-count-v1.schema.json',
  ]) {
    readJson(`contracts/schemas/${schema}`);
  }
  const manifest = readJson('cedros-extension.manifest.json');
  const bootstrap = readJson('cedros-extension.bootstrap.json');
  const nativeSourceManifest = readJson('react-native/src/extension/manifest.json');

  assertDeepEqual(bootstrap.manifest, manifest, 'bootstrap manifest must match canonical manifest');
  assertDeepEqual(nativeSourceManifest, manifest, 'React Native source manifest must match canonical manifest');
  assertEqual(manifest.schemaVersion, 1, 'manifest schemaVersion');
  assertString(manifest.extensionId, 'manifest.extensionId');
  assertString(manifest.displayName, 'manifest.displayName');
  assertString(manifest.version, 'manifest.version');

  const serverCargo = readText('server/Cargo.toml');
  const uiPackage = readJson('ui/package.json');
  const nativePackage = readJson('react-native/package.json');
  assertEqual(manifest.packageFamily.server.packageName, tomlValue(serverCargo, 'package', 'name'), 'server package name');
  assertEqual(manifest.packageFamily.server.version, tomlValue(serverCargo, 'package', 'version'), 'server package version');
  assertEqual(manifest.packageFamily.react.packageName, uiPackage.name, 'React package name');
  assertEqual(manifest.packageFamily.react.version, uiPackage.version, 'React package version');
  assertEqual(manifest.packageFamily.reactNative.packageName, nativePackage.name, 'React Native package name');
  assertEqual(manifest.packageFamily.reactNative.version, nativePackage.version, 'React Native package version');

  validateRequiredSurface(manifest.surfaces.server, 'server', ['routes', 'jobs', 'migrations', 'settingsSchemas', 'contentModels']);
  validateOptionalSurface(manifest.surfaces.admin, 'admin', ['moduleIds']);
  validateRequiredSurface(manifest.surfaces.web, 'web', ['routeIds', 'blockTypes', 'templateIds']);
  validateRequiredSurface(manifest.surfaces.native, 'native', ['screenIds', 'providerIds']);
  validateNamespacedIds(collectManifestIds(manifest));
  validateUniqueIds(collectDeclaredIds(manifest));
  validatePublishedCapabilities(manifest.capabilities ?? []);
  validateAiSurface(manifest.surfaces.ai);
}

function validateRequiredSurface(surface, label, arrayFields) {
  if (!surface || surface.required !== true) throw new Error(`${label} surface must be required`);
  assertString(surface.packageRef, `${label}.packageRef`);
  for (const field of arrayFields) {
    if (!Array.isArray(surface[field]) || !surface[field].length) {
      throw new Error(`${label}.${field} must be a non-empty array`);
    }
  }
}

function validateOptionalSurface(surface, label, arrayFields) {
  if (!surface) throw new Error(`${label} surface must be declared`);
  if (surface.required !== true && surface.required !== false) {
    throw new Error(`${label} surface must declare required as a boolean`);
  }
  assertString(surface.packageRef, `${label}.packageRef`);
  if (surface.required === false) {
    for (const field of arrayFields) {
      if (surface[field] !== undefined && !Array.isArray(surface[field])) {
        throw new Error(`${label}.${field} must be an array when declared`);
      }
    }
    return;
  }
  validateRequiredSurface(surface, label, arrayFields);
}

function collectManifestIds(manifest) {
  return [
    manifest.extensionId,
    ...(manifest.adminModules ?? []).flatMap((module) => [
      module.moduleId,
      ...(module.sectionIds ?? []),
      ...(module.contributions?.dashboardCards ?? []).map((card) => card.id),
    ]),
    ...(manifest.capabilities ?? []).map((capability) => capability.id),
    ...(manifest.analytics?.events ?? []).map((event) => event.id),
    ...(manifest.providerAccess ?? []).map((access) => access.id),
    ...(manifest.databaseAccess ?? []).map((access) => access.id),
    ...(manifest.pageSeeds ?? []).map((seed) => seed.id),
    ...(manifest.contentBlocks ?? []).map((block) => block.type),
    ...(manifest.contentTemplates ?? []).map((template) => template.id),
    ...(manifest.formTemplates ?? []).map((template) => template.id),
    ...(manifest.docsArticles ?? []).map((article) => article.id),
    ...(manifest.onboardingPages ?? []).map((page) => page.id),
    ...(manifest.surfaces.server.routes ?? []),
    ...(manifest.surfaces.server.jobs ?? []),
    ...(manifest.surfaces.server.migrations ?? []),
    ...(manifest.surfaces.server.settingsSchemas ?? []),
    ...(manifest.surfaces.server.contentModels ?? []),
    ...(manifest.surfaces.web.routeIds ?? []),
    ...(manifest.surfaces.web.blockTypes ?? []),
    ...(manifest.surfaces.web.templateIds ?? []),
    ...(manifest.surfaces.native.screenIds ?? []),
    ...(manifest.surfaces.native.providerIds ?? []),
    ...(manifest.surfaces.ai?.skills ?? []).map((skill) => skill.id),
    ...(manifest.surfaces.ai?.capabilities ?? []).map((capability) => capability.id),
  ];
}

function collectDeclaredIds(manifest) {
  return [
    manifest.extensionId,
    ...(manifest.adminModules ?? []).map((module) => module.moduleId),
    ...(manifest.adminModules ?? []).flatMap((module) =>
      (module.contributions?.dashboardCards ?? []).map((card) => card.id)
    ),
    ...(manifest.capabilities ?? []).map((capability) => capability.id),
    ...(manifest.analytics?.events ?? []).map((event) => event.id),
    ...(manifest.providerAccess ?? []).map((access) => access.id),
    ...(manifest.databaseAccess ?? []).map((access) => access.id),
    ...(manifest.pageSeeds ?? []).map((seed) => seed.id),
    ...(manifest.contentBlocks ?? []).map((block) => block.type),
    ...(manifest.contentTemplates ?? []).map((template) => template.id),
    ...(manifest.formTemplates ?? []).map((template) => template.id),
    ...(manifest.docsArticles ?? []).map((article) => article.id),
    ...(manifest.onboardingPages ?? []).map((page) => page.id),
    ...(manifest.surfaces.ai?.skills ?? []).map((skill) => skill.id),
    ...(manifest.surfaces.ai?.capabilities ?? []).map((capability) => capability.id),
  ];
}

function validateNamespacedIds(ids) {
  for (const id of ids) assertNamespacedId(id);
}

function validateUniqueIds(ids) {
  const seen = new Set();
  for (const id of ids) {
    assertNamespacedId(id);
    if (seen.has(id)) throw new Error(`duplicate manifest id ${id}`);
    seen.add(id);
  }
}

function validatePublishedCapabilities(capabilities) {
  const allowedVerbs = new Set(['read', 'write', 'trigger', 'send', 'call', 'expose']);
  for (const capability of capabilities) {
    for (const field of ['id', 'displayName', 'category']) {
      assertString(capability[field], `capability.${field}`);
    }
    if (!Array.isArray(capability.requestedScopes) || !capability.requestedScopes.length) {
      throw new Error(`${capability.id} must declare requestedScopes`);
    }
    for (const scope of capability.requestedScopes) {
      if (!allowedVerbs.has(scope.verb)) throw new Error(`${capability.id} has invalid scope verb`);
      assertString(scope.resource, `${capability.id}.scope.resource`);
      assertString(scope.summary, `${capability.id}.scope.summary`);
    }
  }
}

function assertNamespacedId(id) {
  assertString(id, 'manifest id');
  if (id !== 'cedros-login' && !id.startsWith('cedros-login:')) {
    throw new Error(`manifest id ${id} must use the cedros-login namespace`);
  }
}

function validateAiSurface(surface) {
  if (!surface?.capabilities?.length || !surface?.skills?.length) {
    throw new Error('AI surface must declare skills and capabilities');
  }
  for (const capability of surface.capabilities) {
    for (const field of ['id', 'name', 'kind', 'visibility']) assertString(capability[field], `capability.${field}`);
    if (!['POST', 'PUT', 'PATCH'].includes(capability.endpoint?.method)) {
      throw new Error(`${capability.id} has invalid endpoint method`);
    }
    if (!capability.endpoint.path?.startsWith('/')) throw new Error(`${capability.id} endpoint path must be absolute`);
    validateJsonObjectSchema(capability.inputSchema, `${capability.id}.inputSchema`);
    validateJsonObjectSchema(capability.outputSchema, `${capability.id}.outputSchema`);
  }
}

function validateJsonObjectSchema(schema, label) {
  if (!schema || schema.type !== 'object') throw new Error(`${label} must be an object schema`);
  if (schema.additionalProperties !== false) throw new Error(`${label} must disallow additional properties`);
}

function assertString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string`);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} expected ${expected}, got ${actual}`);
}

function assertDeepEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label} mismatch`);
}

function tomlValue(text, section, key) {
  let currentSection = '';
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) currentSection = sectionMatch[1];
    if (currentSection !== section) continue;
    const valueMatch = line.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`));
    if (valueMatch) return valueMatch[1];
  }
  throw new Error(`missing TOML value ${section}.${key}`);
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function readText(path) {
  const absolute = resolve(repoRoot, path);
  if (!existsSync(absolute)) throw new Error(`missing ${path}`);
  return readFileSync(absolute, 'utf8');
}
