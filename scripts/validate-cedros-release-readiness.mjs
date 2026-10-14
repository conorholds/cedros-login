#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const manifest = readJson('cedros-extension.manifest.json');
const readiness = readJson('docs/cedros-release-readiness-map.json');
const hostHandoff = readJson('docs/cedros-host-coordination-handoff-map.json');
const archiveName = `${manifest.extensionId}-${manifest.version}.cedros-extension.zip`;

const allowedReleaseStatuses = new Set(['ready', 'host-coordinated', 'deferred', 'blocked', 'metadata-only', 'not applicable']);
const allowedVerificationStatuses = new Set([
  'not-provided',
  'provided-unverified',
  'source-unreachable',
  'source-revision-matched',
  'signed-source-verified',
  'provenance-verified',
  'sbom-present',
  'artifact-signature-verified',
  'rebuild-matched',
  'verification-failed',
  'not-applicable',
]);

assertEqual(readiness.extensionId, manifest.extensionId, 'release readiness extensionId');
assertEqual(readiness.version, manifest.version, 'release readiness version');
assertEqual(readiness.displayName, manifest.displayName, 'release readiness displayName');
assertEqual(readiness.archive?.fileName, archiveName, 'archive filename');
assertEqual(readiness.archive?.path, `dist/${archiveName}`, 'archive path');
assertStatus(readiness.installGateStatus, 'installGateStatus');
assertStatus(readiness.launchGateStatus, 'launchGateStatus');
if (readiness.installGateStatus !== 'ready') throw new Error('install gate must be ready per 23-release-versioning-and-upgrades.md');
if (!allowedVerificationStatuses.has(readiness.supplyChain?.status)) {
  throw new Error(`invalid supply-chain status ${readiness.supplyChain?.status}`);
}

validateReadinessTable(readiness.readinessTable ?? [], manifest);
validateProviders(readiness.requiredProviders ?? [], manifest);
validateOfficialContracts(readiness.officialContracts ?? [], readiness.launchGateStatus);
validateSmokeChecklist(readiness.installSmokeChecklist ?? []);
validateRollback(readiness.rollback ?? {});
validateSignOff(readiness.signOff ?? {});
validateHostHandoffCoverage(hostHandoff, readiness);

console.log('cedros release readiness validation passed');

function validateReadinessTable(rows, currentManifest) {
  if (!rows.length) throw new Error('readiness table is empty');
  const ids = new Set(rows.flatMap((row) => row.manifestIds ?? []));
  for (const row of rows) {
    assertStatus(row.status, `${row.surface}.status`);
    for (const field of ['surface', 'smokeTest', 'owner']) {
      if (!row[field]) throw new Error(`readiness row missing ${field}`);
    }
    if (!Array.isArray(row.manifestIds) || !row.manifestIds.length) {
      throw new Error(`${row.surface} must declare manifestIds`);
    }
    if (typeof row.runtimePackagePresent !== 'boolean') throw new Error(`${row.surface} missing runtimePackagePresent`);
    if (typeof row.hostHookBound !== 'boolean') throw new Error(`${row.surface} missing hostHookBound`);
  }
  for (const id of requiredManifestIds(currentManifest)) {
    if (!ids.has(id)) throw new Error(`readiness table missing manifest id ${id}`);
  }
}

function validateProviders(providers, currentManifest) {
  const providerIds = new Set((currentManifest.providerAccess ?? []).map((access) => access.id));
  for (const provider of providers) {
    if (!providerIds.has(provider.id)) throw new Error(`readiness provider ${provider.id} is not in providerAccess`);
    assertStatus(provider.status, `${provider.id}.status`);
    if (typeof provider.required !== 'boolean') throw new Error(`${provider.id} missing required boolean`);
    if (!provider.serviceId) throw new Error(`${provider.id} missing serviceId`);
  }
}

function validateOfficialContracts(contracts, launchGateStatus) {
  const valid = new Set(['published', 'draft', 'planned', 'host-coordinated', 'unavailable']);
  for (const contract of contracts) {
    if (!contract.contractId || !contract.owner) throw new Error('official contract missing id or owner');
    if (!valid.has(contract.status)) throw new Error(`${contract.contractId} has invalid status ${contract.status}`);
    if (typeof contract.requiredForRelease !== 'boolean') {
      throw new Error(`${contract.contractId} missing requiredForRelease boolean`);
    }
    const coordinatedGate = contract.status === 'host-coordinated'
      && launchGateStatus === 'host-coordinated';
    if (contract.requiredForRelease && contract.status !== 'published' && !coordinatedGate) {
      throw new Error(`${contract.contractId} is required but not published`);
    }
  }
}

function validateHostHandoffCoverage(handoff, currentReadiness) {
  assertEqual(handoff.extensionId, currentReadiness.extensionId, 'host handoff extensionId');
  const unresolved = handoff.handoffRows.filter((row) => row.status !== 'bound-in-production');
  if (!unresolved.length) return;
  if (!['host-coordinated', 'blocked'].includes(currentReadiness.launchGateStatus)) {
    throw new Error('unresolved host handoff rows require host-coordinated or blocked launch gate');
  }
  for (const row of unresolved) {
    for (const field of ['manifestId', 'type', 'owner', 'status', 'launchGate']) {
      if (!row[field]) throw new Error(`host handoff row missing ${field}`);
    }
  }
}

function validateSmokeChecklist(items) {
  if (items.length < 4) throw new Error('install smoke checklist must include at least four checks');
  for (const item of items) {
    if (typeof item !== 'string' || !item.trim()) {
      throw new Error('smoke checklist contains unsafe or empty item');
    }
    const safetyText = item
      .replaceAll('cedros-data:token-email-evidence-v1', '')
      .replaceAll('identity.outbox.enqueue-token-email', '');
    if (/secret|token|private key/i.test(safetyText)) throw new Error('smoke checklist contains unsafe or empty item');
  }
}

function validateRollback(rollback) {
  for (const field of ['owner', 'deadline', 'disableInstructions', 'rollbackInstructions']) {
    if (!rollback[field]) throw new Error(`rollback missing ${field}`);
  }
  if (/delete/i.test(rollback.rollbackInstructions) && !/approved/i.test(rollback.rollbackInstructions)) {
    throw new Error('rollback deletion language must require approval');
  }
}

function validateSignOff(signOff) {
  for (const field of ['extensionAuthor', 'cedrosHostOwner', 'operator', 'qaReviewer']) {
    if (!signOff[field]) throw new Error(`signOff missing ${field}`);
  }
  assertStatus(signOff.installGateStatus, 'signOff.installGateStatus');
  assertStatus(signOff.launchGateStatus, 'signOff.launchGateStatus');
}

function requiredManifestIds(currentManifest) {
  return [
    currentManifest.extensionId,
    ...(currentManifest.adminModules ?? []).flatMap((module) => [
      module.moduleId,
      ...(module.navigation?.sections ?? []).map((section) => section.id),
      ...(module.contributions?.dashboardCards ?? []).map((card) => card.id),
    ]),
    ...(currentManifest.capabilities ?? []).map((capability) => capability.id),
    ...(currentManifest.pageSeeds ?? []).map((seed) => seed.id),
    ...(currentManifest.contentBlocks ?? []).map((block) => block.type),
    ...(currentManifest.contentTemplates ?? []).map((template) => template.id),
    ...(currentManifest.formTemplates ?? []).map((form) => form.id),
    ...(currentManifest.docsArticles ?? []).map((article) => article.id),
    ...(currentManifest.onboardingPages ?? []).map((page) => page.id),
    ...(currentManifest.analytics?.events ?? []).map((event) => event.id),
    ...(currentManifest.providerAccess ?? []).map((access) => access.id),
    ...(currentManifest.databaseAccess ?? []).map((access) => access.id),
    ...(currentManifest.surfaces.server.routes ?? []),
    ...(currentManifest.surfaces.server.jobs ?? []),
    ...(currentManifest.surfaces.server.migrations ?? []),
    ...(currentManifest.surfaces.server.settingsSchemas ?? []),
    ...(currentManifest.surfaces.server.contentModels ?? []),
    ...(currentManifest.surfaces.ai?.skills ?? []).map((skill) => skill.id),
    ...(currentManifest.surfaces.ai?.capabilities ?? []).map((capability) => capability.id),
    ...(currentManifest.surfaces.native.screenIds ?? []),
    ...(currentManifest.surfaces.native.providerIds ?? []),
    ...(currentManifest.crmSourceAccess ?? []).map((access) => access.id),
    ...(currentManifest.jobSchedules ?? []).map((schedule) => schedule.id),
    ...Object.values(currentManifest.setupSeeds ?? {})
      .flat()
      .map((seed) => seed.id),
  ];
}

function assertStatus(status, label) {
  if (!allowedReleaseStatuses.has(status)) throw new Error(`${label} has invalid status ${status}`);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} expected ${expected}, got ${actual}`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
