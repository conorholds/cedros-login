#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { buildArchiveBootstrap } from './cedros-archive-bootstrap.mjs';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const manifestPath = resolve(repoRoot, 'cedros-extension.manifest.json');
const bootstrapPath = resolve(repoRoot, 'cedros-extension.bootstrap.json');
const nativeManifestPath = resolve(repoRoot, 'react-native/src/extension/manifest.json');
const reactManifestPath = resolve(repoRoot, 'ui/src/extension/manifest.generated.json');
const visualBuilderPath = resolve(repoRoot, 'docs/cedros-visual-builder-map.json');

// Host-resolvable sidebar icon names. Must stay in sync with
// `HOST_ADMIN_ICON_NAMES` in `server/src/extension_manifest_metadata.rs` and
// `ui/src/extension/contracts.ts`.
const HOST_ADMIN_ICON_NAMES = new Set([
  'account',
  'analytics',
  'email',
  'extensions',
  'history',
  'providers',
  'security',
  'team',
]);
const HOST_ADMIN_GROUP_LABELS = new Set([
  '',
  'Content',
  'Users',
  'Monetization',
  'Email',
  'Grow',
  'Assistant',
  'Settings',
  'Extension Settings',
  'Tools',
  'Build',
  'Control Plane',
]);
const NOTIFICATION_AUDIENCES = new Set(['team', 'personal']);
const NOTIFICATION_CHANNELS = new Set(['email', 'discord', 'slack', 'telegram']);
const NOTIFICATION_SEVERITIES = new Set(['info', 'warning', 'error']);
const UNSAFE_NOTIFICATION_TEMPLATE_PATTERN =
  /\{\{\s*(email|user(id|_id)?|session(id|_id)?|token|password|ip(address|_address)?|wallet(address|_address)?|auth(payload|_payload)?|provider(payload|_payload)?)\b/i;

const stdout = execFileSync(
  'cargo',
  [
    'run',
    '--quiet',
    '--manifest-path',
    resolve(repoRoot, 'server/Cargo.toml'),
    '--example',
    'export_extension_manifest',
  ],
  { cwd: repoRoot, encoding: 'utf8' }
);

const manifest = JSON.parse(stdout);
validateManifest(manifest);
const bootstrap = buildArchiveBootstrap(
  manifest,
  JSON.parse(readFileSync(visualBuilderPath, 'utf8'))
);

writeJson(manifestPath, manifest);
writeJson(bootstrapPath, bootstrap);
writeJson(nativeManifestPath, manifest);
writeJson(reactManifestPath, manifest);

console.log(`wrote ${manifestPath}`);
console.log(`wrote ${bootstrapPath}`);
console.log(`wrote ${nativeManifestPath}`);
console.log(`wrote ${reactManifestPath}`);

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value)}\n`);
}

function validateManifest(manifest) {
  const expected = {
    schemaVersion: 1,
    extensionId: 'cedros-login',
    platformApiVersion: '1',
    minCedrosDataVersion: '0.1.91',
    witChecksum: '2bb16879743cfd2748b7deefefcb82204c16b55a1c1a70385f4e9707a83d48f9',
    server: 'cedros_login::register_extension_family',
    admin: '@cedros/login-react/admin/register',
    web: '@cedros/login-react/web/register',
    native: '@cedros/login-react-native/register',
  };

  assertEqual(manifest.schemaVersion, expected.schemaVersion, 'schemaVersion');
  assertEqual(manifest.extensionId, expected.extensionId, 'extensionId');
  assertEqual(manifest.platformApiVersion, expected.platformApiVersion, 'platformApiVersion');
  assertEqual(
    manifest.compatibility?.platformApiVersion,
    expected.platformApiVersion,
    'compatibility.platformApiVersion'
  );
  assertEqual(
    manifest.compatibility?.minCedrosDataVersion,
    expected.minCedrosDataVersion,
    'compatibility.minCedrosDataVersion'
  );
  assertEqual(manifest.compatibility?.witChecksum, expected.witChecksum, 'compatibility.witChecksum');
  assertEqual(
    createHash('sha256')
      .update(readFileSync(resolve(repoRoot, 'server-wasm/wit/cedros-extension.wit')))
      .digest('hex'),
    expected.witChecksum,
    'canonical WIT checksum'
  );
  assertEqual(manifest.registration?.server?.entrypoint, expected.server, 'registration.server');
  assertEqual(manifest.registration?.admin?.entrypoint, expected.admin, 'registration.admin');
  assertEqual(manifest.registration?.web?.entrypoint, expected.web, 'registration.web');
  assertEqual(manifest.registration?.native?.entrypoint, expected.native, 'registration.native');

  for (const packageRef of ['server', 'react', 'reactNative']) {
    const member = manifest.packageFamily?.[packageRef];
    if (!member?.packageName || !member?.version || member.required !== true) {
      throw new Error(`packageFamily.${packageRef} must include packageName, version, and required true`);
    }
    assertEqual(member.version, manifest.version, `packageFamily.${packageRef}.version`);
  }

  for (const surface of ['server', 'admin', 'web', 'native']) {
    if (manifest.surfaces?.[surface]?.packageRef !== surfacePackageRef(surface)) {
      throw new Error(`surfaces.${surface}.packageRef is invalid`);
    }
  }

  const contentModels = new Set(manifest.surfaces.server.contentModels ?? []);
  const migrations = new Set(manifest.surfaces.server.migrations ?? []);
  for (const access of manifest.databaseAccess ?? []) {
    for (const id of access.contentModels ?? []) {
      if (!contentModels.has(id)) {
        throw new Error(`databaseAccess ${access.id} references missing content model ${id}`);
      }
    }
    for (const id of access.migrations ?? []) {
      if (!migrations.has(id)) {
        throw new Error(`databaseAccess ${access.id} references missing migration ${id}`);
      }
    }
  }

  validateAdminModuleSectionIcons(manifest.adminModules ?? []);
  validateAdminModuleNavigation(manifest.adminModules ?? []);
  validateSetupSeeds(manifest);
}

function validateAdminModuleSectionIcons(adminModules) {
  for (const module of adminModules) {
    const sectionIds = module.sectionIds ?? [];
    const sectionIcons = module.sectionIcons ?? {};
    for (const sectionId of sectionIds) {
      const iconName = sectionIcons[sectionId];
      if (!iconName) {
        throw new Error(
          `adminModule ${module.moduleId} section ${sectionId} is missing a sectionIcons entry — ` +
            `the host renders sidebar entries from manifest metadata, so React icon props do not survive`
        );
      }
      if (!HOST_ADMIN_ICON_NAMES.has(iconName)) {
        throw new Error(
          `adminModule ${module.moduleId} section ${sectionId} declares icon '${iconName}' ` +
            `which is not in the host icon allowlist: ${[...HOST_ADMIN_ICON_NAMES].join(', ')}`
        );
      }
    }
    for (const iconSectionId of Object.keys(sectionIcons)) {
      if (!sectionIds.includes(iconSectionId)) {
        throw new Error(
          `adminModule ${module.moduleId} sectionIcons references ${iconSectionId} which is not in sectionIds`
        );
      }
    }
  }
}

function validateAdminModuleNavigation(adminModules) {
  for (const module of adminModules) {
    const sectionIds = module.sectionIds ?? [];
    if (!sectionIds.length) continue;

    const sections = module.navigation?.sections;
    if (!Array.isArray(sections)) {
      throw new Error(`adminModule ${module.moduleId} must declare navigation.sections`);
    }
    assertUnique(sectionIds, `${module.moduleId}.sectionIds`);
    assertUnique(sections.map((section) => section.id), `${module.moduleId}.navigation.sections ids`);
    assertEqual(sections.length, sectionIds.length, `${module.moduleId}.navigation.sections length`);

    for (const section of sections) {
      if (!sectionIds.includes(section.id)) {
        throw new Error(
          `adminModule ${module.moduleId} navigation.sections references ${section.id} which is not in sectionIds`
        );
      }
      for (const field of ['id', 'label', 'group']) {
        if (typeof section[field] !== 'string') {
          throw new Error(`${module.moduleId}.navigation.sections.${section.id}.${field} must be a string`);
        }
      }
      if (!Number.isFinite(section.order)) {
        throw new Error(`${module.moduleId}.navigation.sections.${section.id}.order must be finite`);
      }
    }

    const groups = module.navigation.groups ?? [];
    assertUnique(groups.map((group) => group.id), `${module.moduleId}.navigation.groups ids`);
    assertUnique(groups.map((group) => group.label), `${module.moduleId}.navigation.groups labels`);
    for (const group of groups) {
      if (typeof group.id !== 'string' || typeof group.label !== 'string') {
        throw new Error(`${module.moduleId}.navigation.groups id and label must be strings`);
      }
      if (!Number.isFinite(group.order)) {
        throw new Error(`${module.moduleId}.navigation.groups.${group.id}.order must be finite`);
      }
    }

    const declaredGroupLabels = new Set(groups.map((group) => group.label));
    for (const section of sections) {
      if (
        !HOST_ADMIN_GROUP_LABELS.has(section.group) &&
        !declaredGroupLabels.has(section.group)
      ) {
        throw new Error(
          `${module.moduleId}.navigation section ${section.id} uses custom group ${section.group} without a navigation.groups entry`
        );
      }
    }
  }
}

function validateSetupSeeds(manifest) {
  const notifications = manifest.setupSeeds?.notifications ?? [];
  const serverEvents = new Set(manifest.surfaces?.server?.events ?? []);
  assertUnique(notifications.map((seed) => seed.id), 'setupSeeds.notifications ids');
  for (const seed of notifications) {
    for (const field of ['id', 'displayName', 'title', 'eventId', 'audience', 'bodyTemplate']) {
      if (!seed[field]) throw new Error(`${seed.id ?? 'notification seed'} missing ${field}`);
    }
    if (!seed.id.startsWith(`${manifest.extensionId}:`)) {
      throw new Error(`notification seed ${seed.id} must be namespaced with ${manifest.extensionId}:`);
    }
    if (!serverEvents.has(seed.eventId)) {
      throw new Error(`notification seed ${seed.id} references undeclared server event ${seed.eventId}`);
    }
    if (!NOTIFICATION_AUDIENCES.has(seed.audience)) {
      throw new Error(`notification seed ${seed.id} has invalid audience ${seed.audience}`);
    }
    if (seed.severity && !NOTIFICATION_SEVERITIES.has(seed.severity)) {
      throw new Error(`notification seed ${seed.id} has invalid severity ${seed.severity}`);
    }
    assertUnique(seed.defaultChannels ?? [], `${seed.id}.defaultChannels`);
    assertUnique(seed.tags ?? [], `${seed.id}.tags`);
    for (const channel of seed.defaultChannels ?? []) {
      if (!NOTIFICATION_CHANNELS.has(channel)) throw new Error(`${seed.id} uses invalid channel ${channel}`);
    }
    assertRedactedNotificationTemplate(seed.subjectTemplate, `${seed.id}.subjectTemplate`);
    assertRedactedNotificationTemplate(seed.bodyTemplate, `${seed.id}.bodyTemplate`);
  }
}

function assertRedactedNotificationTemplate(template, label) {
  if (!template) return;
  if (UNSAFE_NOTIFICATION_TEMPLATE_PATTERN.test(template)) {
    throw new Error(`${label} must not interpolate identifiers, secrets, auth payloads, or PII`);
  }
}

function assertUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`${label} contains duplicate ${value}`);
    seen.add(value);
  }
}

function surfacePackageRef(surface) {
  if (surface === 'native') return 'reactNative';
  if (surface === 'admin' || surface === 'web') return 'react';
  return surface;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} expected ${expected}, got ${actual}`);
  }
}
