#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const manifest = readJson('cedros-extension.manifest.json');
const adminPages = readJson('docs/cedros-admin-pages-map.json');
const officialGroups = new Set([
  '',
  'Content',
  'Email',
  'Monetization',
  'Assistant',
  'Users',
  'Settings',
  'Extension Settings',
  'Tools',
  'Build',
]);
const builtInPermissions = new Set([
  'manage_settings',
  'manage_users',
  'manage_extensions',
  'manage_themes',
  'create_content',
  'edit_own_content',
  'edit_all_content',
  'publish_content',
  'schedule_content',
  'manage_media',
  'manage_redirects',
  'view_audit_log',
  'manage_comments',
  'manage_taxonomies',
]);

assertEqual(adminPages.extensionId, manifest.extensionId, 'admin pages extensionId');
assertEqual(adminPages.version, manifest.version, 'admin pages version');
validateCoverage(adminPages.adminModules, manifest.adminModules ?? [], 'moduleId', 'admin modules');

const manifestModules = new Map((manifest.adminModules ?? []).map((module) => [module.moduleId, module]));
for (const module of adminPages.adminModules ?? []) {
  validateAdminModule(module, manifestModules.get(module.moduleId));
}

console.log('cedros admin pages validation passed');

function validateAdminModule(module, manifestModule) {
  if (!manifestModule) throw new Error(`${module.moduleId} missing manifest admin module`);
  assertEqual(module.packageName, manifestModule.packageName, `${module.moduleId} packageName`);
  assertEqual(module.runtimeExport, manifest.registration.admin.entrypoint, `${module.moduleId} runtimeExport`);
  validateCoverage(module.sections, manifestModule.sectionIds ?? [], 'id', `${module.moduleId} sections`);
  validateCoverage(
    module.dashboardCards ?? [],
    manifestModule.contributions?.dashboardCards ?? [],
    'id',
    `${module.moduleId} dashboard cards`
  );
  validateCoverage(
    module.onboardingPages ?? [],
    (manifest.onboardingPages ?? []).filter((page) => page.moduleId === module.moduleId),
    'id',
    `${module.moduleId} onboarding pages`
  );
  for (const section of module.sections ?? []) {
    requireFields(section, ['id', 'label', 'group', 'requiredPermission', 'component', 'states']);
    if (!section.id.startsWith(`${manifest.extensionId}:`)) {
      throw new Error(`${section.id} must be namespaced`);
    }
    if (!officialGroups.has(section.group)) throw new Error(`${section.id} uses non-official group ${section.group}`);
    if (!builtInPermissions.has(section.requiredPermission)) {
      throw new Error(`${section.id} uses non-built-in permission ${section.requiredPermission}`);
    }
    for (const state of ['loading', 'empty', 'error', 'disabled']) {
      if (!section.states.includes(state)) throw new Error(`${section.id} missing ${state} state`);
    }
  }
  for (const key of ['contentEditorPanels', 'slots']) {
    if ((module[key] ?? []).length) throw new Error(`${module.moduleId} unexpected ${key} contribution`);
  }
}

function validateCoverage(actualItems = [], expectedItems = [], idKey, label) {
  const actualIds = actualItems.map((item) => (typeof item === 'string' ? item : item[idKey]));
  const expectedIds = expectedItems.map((item) => (typeof item === 'string' ? item : item[idKey]));
  assertUnique(actualIds, label);
  for (const id of expectedIds) {
    if (!actualIds.includes(id)) throw new Error(`${label} missing ${id}`);
  }
  for (const id of actualIds) {
    if (!expectedIds.includes(id)) throw new Error(`${label} includes undeclared id ${id}`);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function requireFields(item, fields) {
  const label = item.id ?? item.moduleId ?? 'item';
  for (const field of fields) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      throw new Error(`${label} missing ${field}`);
    }
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} expected ${expected}, got ${actual}`);
}

function assertUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`${label} contains duplicate ${value}`);
    seen.add(value);
  }
}
