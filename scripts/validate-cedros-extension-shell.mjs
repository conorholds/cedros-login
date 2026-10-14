#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const manifest = readJson('cedros-extension.manifest.json');
const bootstrap = readJson('cedros-extension.bootstrap.json');
const hostHandoff = readJson('docs/cedros-host-coordination-handoff-map.json');
const packageShape = readJson('docs/cedros-package-family-shape-map.json');
const serverNative = readJson('docs/cedros-server-native-host-coordination-map.json');
const NOTIFICATION_AUDIENCES = new Set(['team', 'personal']);
const NOTIFICATION_CHANNELS = new Set(['email', 'discord', 'slack', 'telegram']);
const NOTIFICATION_SEVERITIES = new Set(['info', 'warning', 'error']);
const UNSAFE_NOTIFICATION_TEMPLATE_PATTERN =
  /\{\{\s*(email|user(id|_id)?|session(id|_id)?|token|password|ip(address|_address)?|wallet(address|_address)?|auth(payload|_payload)?|provider(payload|_payload)?)\b/i;

assertDeepEqual(manifest, bootstrap.manifest, 'bootstrap manifest must match manifest file');
assertNoRawSecretValues(manifest, 'manifest');
assertNoRawSecretValues(bootstrap, 'bootstrap');

assertEqual(manifest.schemaVersion, 1, 'schemaVersion');
assertEqual(manifest.platformApiVersion, '1', 'platformApiVersion');
assertEqual(manifest.compatibility?.platformApiVersion, '1', 'compatibility.platformApiVersion');
assertEqual(manifest.compatibility?.minCedrosDataVersion, '0.1.91', 'compatibility.minCedrosDataVersion');
assertEqual(
  manifest.compatibility?.witChecksum,
  '2bb16879743cfd2748b7deefefcb82204c16b55a1c1a70385f4e9707a83d48f9',
  'compatibility.witChecksum'
);
assertEqual(
  createHash('sha256').update(readFileSync('server-wasm/wit/cedros-extension.wit')).digest('hex'),
  manifest.compatibility.witChecksum,
  'canonical WIT checksum'
);

const expectedRegistration = {
  server: 'cedros_login::register_extension_family',
  admin: '@cedros/login-react/admin/register',
  web: '@cedros/login-react/web/register',
  native: '@cedros/login-react-native/register',
};

for (const [surface, entrypoint] of Object.entries(expectedRegistration)) {
  assertEqual(manifest.registration?.[surface]?.entrypoint, entrypoint, `registration.${surface}`);
}

const serverCargo = readFileSync('server/Cargo.toml', 'utf8');
const uiPackage = readJson('ui/package.json');
const nativePackage = readJson('react-native/package.json');
const serverPackageName = tomlValue(serverCargo, 'package', 'name');
const serverPackageVersion = tomlValue(serverCargo, 'package', 'version');
const serverLibName = tomlValue(serverCargo, 'lib', 'name');
assertEqual(serverPackageName, manifest.packageFamily.server.packageName, 'server package name');
assertEqual(serverPackageVersion, manifest.packageFamily.server.version, 'server package version');
assertEqual(uiPackage.name, manifest.packageFamily.react.packageName, 'react package name');
assertEqual(uiPackage.version, manifest.packageFamily.react.version, 'react package version');
assertEqual(nativePackage.name, manifest.packageFamily.reactNative.packageName, 'native package name');
assertEqual(nativePackage.version, manifest.packageFamily.reactNative.version, 'native package version');
assertEqual(
  manifest.registration.server.entrypoint,
  `${serverLibName}::register_extension_family`,
  'server entrypoint crate path'
);
if (!uiPackage.exports?.['./admin/register']) throw new Error('ui package missing ./admin/register export');
if (!uiPackage.exports?.['./web/register']) throw new Error('ui package missing ./web/register export');
if (!nativePackage.exports?.['./register']) throw new Error('native package missing ./register export');
validatePackageShapeMap(packageShape, manifest, {
  server: { name: serverPackageName, version: serverPackageVersion },
  react: { name: uiPackage.name, version: uiPackage.version },
  reactNative: { name: nativePackage.name, version: nativePackage.version },
});

const publishedOfficialCapabilities = new Set([
  'cedros-login:user-context',
  'cedros-login:session-manage',
  'cedros-login:admin-auth',
]);
const extensionDependencies = manifest.dependencies?.extensions ?? [];
assertEqual(extensionDependencies.length, 1, 'one optional subscription provider');
assertEqual(extensionDependencies[0].extensionId, 'cedros-pay', 'subscription provider');
assertEqual(extensionDependencies[0].minVersion, '4.0.5', 'host-authenticated subscription contract version');
assertEqual(extensionDependencies[0].required, false, 'Login works without subscription selection');
if (!extensionDependencies[0].reason?.includes('denies plan-limited invitations')) {
  throw new Error('Pay dependency must document the configured fail-closed state');
}
for (const dependency of manifest.dependencies?.services ?? []) {
  throw new Error(`Unexpected consumed service dependency declared: ${dependency.serviceId}`);
}
const expectedCapabilityDependencies = [
  {
    capabilityId: 'cedros-data:database-concurrency-v2',
    required: true,
    reason: 'Preserves the published host-atomic conditional mutations used by Login identity, session, organization, outbox, and lifecycle flows.',
  },
  {
    capabilityId: 'cedros-data:token-email-evidence-v1',
    required: true,
    reason: 'Requires identity.outbox.enqueue-token-email to atomically bind a live purpose-bound token to outbox work with host-issued delivery evidence.',
  },
  {
    capabilityId: 'cedros-data:identity-atomic-v1',
    required: true,
    reason: 'Uses registration.account.complete to create password accounts with their verification token and outbox work in one host transaction.',
  },
  {
    capabilityId: 'cedros-data:session-atomic-v1',
    required: true,
    reason: 'Requires atomic session rotation and revocation so concurrent refresh cannot escape sign-out.',
  },
  {
    capabilityId: 'cedros-data:signup-limit-atomic-v1',
    required: true,
    reason: 'Requires signup-limit status plus registration account creation to report and enforce enabled limits against one durable, atomic ledger.',
  },
  {
    capabilityId: 'cedros-data:abuse-budget-consume-v1',
    required: true,
    reason: 'Atomically enforces multi-dimensional identity abuse budgets with bounded expiring host storage.',
  },
  {
    capabilityId: 'cedros-data:extension-storage-cas-v1',
    required: true,
    reason: 'Atomically binds MFA enrollment, factor consumption, and login completion to the exact verified row revisions.',
  },
  {capabilityId: "cedros-data:mcp-connection-revoke-v1", required: true, reason: "Durably cancels and retries deletion of existing OAuth-bound MCP keys without relying on revoked browser or OAuth credentials."},
  {
    capabilityId: 'cedros-pay:subscription-read',
    required: false,
    reason: 'Reads same-site subscription selection through the host-authenticated Login service contract; unavailable Pay keeps the chooser gate closed.',
  },
];
assertDeepEqual(
  manifest.dependencies?.capabilities ?? [],
  expectedCapabilityDependencies,
  'consumed capability dependencies'
);
assertDeepEqual(
  manifest.requiredCapabilities ?? [],
  expectedCapabilityDependencies.filter(({ required }) => required).map(({ capabilityId }) => capabilityId),
  'flattened required capabilities'
);
validatePublishedOfficialCapabilities(manifest.capabilities ?? [], publishedOfficialCapabilities);

assertEqual(
  manifest.adminModules?.[0]?.moduleId,
  manifest.surfaces.admin.moduleIds?.[0],
  'admin module manifest id'
);

assertUnique(manifest.surfaces.server.contentModels ?? [], 'surfaces.server.contentModels');
assertUnique(manifest.surfaces.server.migrations ?? [], 'surfaces.server.migrations');
assertUnique(manifest.surfaces.server.routes ?? [], 'surfaces.server.routes');
assertUnique(manifest.surfaces.server.jobs ?? [], 'surfaces.server.jobs');
assertUnique(manifest.surfaces.server.events ?? [], 'surfaces.server.events');
assertUnique((manifest.databaseAccess ?? []).map((access) => access.id), 'databaseAccess ids');

const contentModels = new Set(manifest.surfaces.server.contentModels ?? []);
const migrations = new Set(manifest.surfaces.server.migrations ?? []);
for (const access of manifest.databaseAccess ?? []) {
  if (!access.scopes?.length) throw new Error(`${access.id} must declare database scopes`);
  assertNamespaced(access.id, manifest.extensionId, 'databaseAccess id');
  assertUnique(access.contentModels ?? [], `${access.id}.contentModels`);
  assertUnique(access.migrations ?? [], `${access.id}.migrations`);
  assertUnique(access.tags ?? [], `${access.id}.tags`);
  assertUnique(
    access.scopes.map((scope) => `${scope.verb}:${scope.resource}`),
    `${access.id}.scopes`
  );
  for (const contentModel of access.contentModels ?? []) {
    if (!contentModels.has(contentModel)) {
      throw new Error(`${access.id} references missing content model ${contentModel}`);
    }
  }
  for (const migration of access.migrations ?? []) {
    if (!migrations.has(migration)) {
      throw new Error(`${access.id} references missing migration ${migration}`);
    }
  }
}

const providerScopesByFamily = new Map([
  ['intelligence', new Set(['chat.generate'])],
  ['imageGeneration', new Set(['image.generate'])],
  ['voice', new Set(['voice.synthesize', 'voice.transcribe'])],
  // Host storage dispatches on put/get/delete and scope-checks operation == scope
  // (cedros-data wasm_extension_providers storage::execute + tests), so the grant
  // names those verbs — not the 08-doc's aspirational storage.read/write.
  ['storage', new Set(['put', 'get', 'delete'])],
  ['email', new Set(['email.send', 'email.design.resolve'])],
]);
for (const access of manifest.providerAccess ?? []) {
  assertNamespaced(access.id, manifest.extensionId, 'providerAccess id');
  const allowedScopes = providerScopesByFamily.get(access.provider);
  if (!allowedScopes) {
    throw new Error(`${access.id} uses unsupported provider ${access.provider}`);
  }
  if (!access.scopes?.length) throw new Error(`${access.id} must declare provider scopes`);
  assertUnique(access.scopes, `${access.id}.scopes`);
  for (const scope of access.scopes) {
    if (!allowedScopes.has(scope)) {
      throw new Error(`${access.id} uses unsupported provider scope ${scope}`);
    }
  }
  assertUnique(access.tags ?? [], `${access.id}.tags`);
}

validateServerNativeMap(serverNative, manifest);
validateSetupSeeds(manifest);

const validHostHandoffStatuses = new Set([
  'metadata-only',
  'host-hook-requested',
  'bound-in-staging',
  'bound-in-production',
  'deferred',
  'blocked',
  'unsupported',
]);
assertEqual(hostHandoff.extensionId, manifest.extensionId, 'host handoff extensionId');
assertUnique((hostHandoff.handoffRows ?? []).map((row) => row.manifestId), 'host handoff manifest ids');
for (const row of hostHandoff.handoffRows ?? []) {
  assertNamespaced(row.manifestId, manifest.extensionId, 'host handoff manifest id');
  if (!validHostHandoffStatuses.has(row.status)) {
    throw new Error(`${row.manifestId} has invalid host handoff status ${row.status}`);
  }
  for (const field of ['type', 'runtimePackage', 'hostHookRequired', 'owner', 'launchGate']) {
    if (!row[field]) throw new Error(`${row.manifestId} missing host handoff field ${field}`);
  }
  if (typeof row.blocking !== 'boolean') throw new Error(`${row.manifestId} missing boolean blocking`);
}
const handoffIds = new Set((hostHandoff.handoffRows ?? []).map((row) => row.manifestId));
const handoffRowsById = new Map((hostHandoff.handoffRows ?? []).map((row) => [row.manifestId, row]));
for (const { id, type } of requiredHostHandoffEntries(manifest)) {
  if (!handoffIds.has(id)) throw new Error(`Missing host handoff row for ${id}`);
  if (handoffRowsById.get(id)?.type !== type) {
    throw new Error(`${id} host handoff type expected ${type}, got ${handoffRowsById.get(id)?.type}`);
  }
}

console.log('cedros extension shell validation passed');

function validatePublishedOfficialCapabilities(capabilities, expectedIds) {
  const byId = new Map(capabilities.map((capability) => [capability.id, capability]));
  const allowedVerbs = new Set(['read', 'write', 'trigger', 'send', 'call', 'expose']);
  for (const id of expectedIds) {
    const capability = byId.get(id);
    if (!capability) throw new Error(`Missing published official capability ${id}`);
    for (const field of ['displayName', 'category']) {
      if (!capability[field]) throw new Error(`${id} missing ${field}`);
    }
    if (!Array.isArray(capability.requestedScopes) || !capability.requestedScopes.length) {
      throw new Error(`${id} must declare requestedScopes`);
    }
    for (const scope of capability.requestedScopes) {
      if (!allowedVerbs.has(scope.verb)) throw new Error(`${id} has invalid scope verb ${scope.verb}`);
      for (const field of ['resource', 'summary']) {
        if (!scope[field]) throw new Error(`${id} scope missing ${field}`);
      }
    }
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function tomlValue(text, section, key) {
  let currentSection = '';
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }
    if (currentSection !== section) continue;
    const valueMatch = line.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`));
    if (valueMatch) return valueMatch[1];
  }
  throw new Error(`Missing TOML value ${section}.${key}`);
}

function validatePackageShapeMap(shape, currentManifest, metadata) {
  assertEqual(shape.extensionId, currentManifest.extensionId, 'package shape extensionId');
  assertEqual(shape.manifestVersion, currentManifest.version, 'package shape manifestVersion');
  const packageRefs = new Set();
  for (const member of shape.packageMembers ?? []) {
    packageRefs.add(member.packageRef);
    const manifestMember = currentManifest.packageFamily[member.packageRef];
    if (!manifestMember) throw new Error(`package shape has unknown packageRef ${member.packageRef}`);
    assertEqual(member.manifestPackageName, manifestMember.packageName, `${member.packageRef} manifest package name`);
    assertEqual(member.manifestVersion, manifestMember.version, `${member.packageRef} manifest version`);
    assertEqual(member.metadataPackageName, metadata[member.packageRef].name, `${member.packageRef} metadata package name`);
    assertEqual(member.metadataVersion, metadata[member.packageRef].version, `${member.packageRef} metadata version`);
  }
  for (const packageRef of ['server', 'react', 'reactNative']) {
    if (!packageRefs.has(packageRef)) throw new Error(`package shape missing ${packageRef}`);
  }

  const documentedMismatches = new Map(
    (shape.versionAlignment?.documentedRootVersionMismatches ?? []).map((item) => [item.packageRef, item])
  );
  for (const [packageRef, member] of Object.entries(currentManifest.packageFamily)) {
    const mismatch = member.version !== currentManifest.version;
    if (mismatch && !documentedMismatches.has(packageRef)) {
      throw new Error(`${packageRef} version mismatch with root manifest is not documented`);
    }
    if (!mismatch && documentedMismatches.has(packageRef)) {
      throw new Error(`${packageRef} documents a version mismatch but versions match`);
    }
    if (mismatch) {
      const documented = documentedMismatches.get(packageRef);
      assertEqual(documented.packageVersion, member.version, `${packageRef} documented mismatch packageVersion`);
      assertEqual(documented.rootManifestVersion, currentManifest.version, `${packageRef} documented mismatch rootManifestVersion`);
      if (!documented.reason) throw new Error(`${packageRef} documented mismatch missing reason`);
    }
  }
}

function validateSetupSeeds(currentManifest) {
  const notifications = currentManifest.setupSeeds?.notifications ?? [];
  const serverEvents = new Set(currentManifest.surfaces.server.events ?? []);
  assertUnique(notifications.map((seed) => seed.id), 'setupSeeds.notifications ids');
  for (const seed of notifications) {
    requireFields(seed, ['id', 'displayName', 'title', 'eventId', 'audience', 'bodyTemplate']);
    assertNamespaced(seed.id, currentManifest.extensionId, 'notification seed id');
    if (!serverEvents.has(seed.eventId)) {
      throw new Error(`${seed.id} references undeclared server event ${seed.eventId}`);
    }
    if (!NOTIFICATION_AUDIENCES.has(seed.audience)) {
      throw new Error(`${seed.id} has invalid notification audience ${seed.audience}`);
    }
    if (seed.severity && !NOTIFICATION_SEVERITIES.has(seed.severity)) {
      throw new Error(`${seed.id} has invalid notification severity ${seed.severity}`);
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

function validateServerNativeMap(map, currentManifest) {
  assertEqual(map.extensionId, currentManifest.extensionId, 'server/native map extensionId');
  assertEqual(map.version, currentManifest.version, 'server/native map version');
  validateContractCoverage(map.routes, currentManifest.surfaces.server.routes, 'routeId', 'server/native routes');
  validateContractCoverage(map.jobs, currentManifest.surfaces.server.jobs, 'jobId', 'server/native jobs');
  validateContractCoverage(map.migrations, currentManifest.surfaces.server.migrations, 'migrationId', 'server/native migrations');
  validateContractCoverage(
    map.settingsSchemas,
    currentManifest.surfaces.server.settingsSchemas,
    'settingsSchemaId',
    'server/native settings schemas'
  );
  validateContractCoverage(map.contentModels, currentManifest.surfaces.server.contentModels, 'contentModelId', 'server/native content models');
  validateContractCoverage(map.events, currentManifest.surfaces.server.events, 'eventId', 'server/native events');
  const nativeIds = [
    ...(currentManifest.surfaces.native.screenIds ?? []),
    ...(currentManifest.surfaces.native.stackIds ?? []),
    ...(currentManifest.surfaces.native.providerIds ?? []),
  ];
  validateContractCoverage(map.nativeSurfaces, nativeIds, 'nativeId', 'server/native native surfaces');

  validateRoutes(map.routes ?? [], currentManifest);
  validateJobs(map.jobs ?? [], currentManifest);
  validateMigrations(map.migrations ?? [], currentManifest);
  validateNativeSurfaces(map.nativeSurfaces ?? []);
}

function validateRoutes(routes, currentManifest) {
  const databaseIds = new Set((currentManifest.databaseAccess ?? []).map((access) => access.id));
  const providerIds = new Set((currentManifest.providerAccess ?? []).map((access) => access.id));
  const settingsIds = new Set(currentManifest.surfaces.server.settingsSchemas ?? []);
  const allowedMethods = new Set(['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']);
  for (const route of routes) {
    requireFields(route, [
      'routeId',
      'handlerExport',
      'method',
      'path',
      'authRequirement',
      'permissionRequirement',
      'requestSchema',
      'responseSchema',
      'validationRules',
      'errorCodes',
      'rateLimits',
      'idempotencyKeyStrategy',
      'stagingVerification',
      'rollbackBehavior',
      'launchGate',
    ]);
    if (!allowedMethods.has(route.method)) throw new Error(`${route.routeId} has unsupported method ${route.method}`);
    if (!route.path.startsWith(`/extensions/${currentManifest.extensionId}/`)) {
      throw new Error(`${route.routeId} path must use /extensions/${currentManifest.extensionId}/ prefix`);
    }
    if (route.path.includes('//') || /[\\\u0000-\u001f]/.test(route.path)) {
      throw new Error(`${route.routeId} path contains invalid characters`);
    }
    if (!route.validationRules.length) throw new Error(`${route.routeId} must declare validation rules`);
    if (!route.errorCodes.length) throw new Error(`${route.routeId} must declare error codes`);
    validateRefs(route.databaseAccessIds ?? [], databaseIds, `${route.routeId}.databaseAccessIds`);
    validateRefs(route.providerAccessIds ?? [], providerIds, `${route.routeId}.providerAccessIds`);
    validateRefs(route.settingsSchemaIds ?? [], settingsIds, `${route.routeId}.settingsSchemaIds`);
  }
}

function validateJobs(jobs, currentManifest) {
  const databaseIds = new Set((currentManifest.databaseAccess ?? []).map((access) => access.id));
  const providerIds = new Set((currentManifest.providerAccess ?? []).map((access) => access.id));
  for (const job of jobs) {
    requireFields(job, [
      'jobId',
      'executorExport',
      'scheduleExamples',
      'metadataSchema',
      'timeoutSeconds',
      'retryBehavior',
      'concurrency',
      'idempotencyKeyStrategy',
      'failureRecords',
      'disableBehavior',
      'stagingVerification',
    ]);
    if (!job.scheduleExamples.length) throw new Error(`${job.jobId} must declare schedule examples`);
    if (!Number.isInteger(job.timeoutSeconds) || job.timeoutSeconds <= 0) {
      throw new Error(`${job.jobId} must declare a positive integer timeoutSeconds`);
    }
    validateRefs(job.databaseAccessIds ?? [], databaseIds, `${job.jobId}.databaseAccessIds`);
    validateRefs(job.providerAccessIds ?? [], providerIds, `${job.jobId}.providerAccessIds`);
  }
}

function validateMigrations(migrations, currentManifest) {
  const contentModelIds = new Set(currentManifest.surfaces.server.contentModels ?? []);
  for (const migration of migrations) {
    requireFields(migration, ['migrationId', 'targetContentModelId', 'ordering', 'classification', 'rollbackPlan', 'stagingVerification']);
    if (!contentModelIds.has(migration.targetContentModelId)) {
      throw new Error(`${migration.migrationId} references missing content model ${migration.targetContentModelId}`);
    }
  }
}

function validateNativeSurfaces(nativeSurfaces) {
  for (const nativeSurface of nativeSurfaces) {
    requireFields(nativeSurface, [
      'nativeId',
      'kind',
      'packageExport',
      'requiredMobileHostVersion',
      'fallback',
      'ownerVisibleBehavior',
      'stagingDeviceVerification',
    ]);
  }
}

function validateContractCoverage(items = [], expectedIds = [], idKey, label) {
  const actualIds = items.map((item) => item[idKey]);
  assertUnique(actualIds, label);
  const actual = new Set(actualIds);
  const expected = new Set(expectedIds ?? []);
  for (const id of expected) {
    if (!actual.has(id)) throw new Error(`${label} missing ${id}`);
  }
  for (const id of actual) {
    if (!expected.has(id)) throw new Error(`${label} includes undeclared id ${id}`);
  }
}

function requireFields(item, fields) {
  const label = item.routeId ?? item.jobId ?? item.migrationId ?? item.nativeId ?? item.id ?? 'item';
  for (const field of fields) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      throw new Error(`${label} missing ${field}`);
    }
  }
}

function validateRefs(refs, allowed, label) {
  assertUnique(refs, label);
  for (const ref of refs) {
    if (!allowed.has(ref)) throw new Error(`${label} references undeclared id ${ref}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} expected ${expected}, got ${actual}`);
}

function assertDeepEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(label);
}

function assertNamespaced(id, extensionId, label) {
  if (!id?.startsWith(`${extensionId}:`)) {
    throw new Error(`${label} ${id} must be namespaced with ${extensionId}:`);
  }
}

function assertUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`${label} contains duplicate ${value}`);
    seen.add(value);
  }
}

function assertNoRawSecretValues(value, label) {
  const secretValuePatterns = [
    /postgres:\/\/[^"\\\s]+/i,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bBearer\s+[A-Za-z0-9._~+/-]+=*/i,
    /\bsk_(live|test)_[A-Za-z0-9]+/i,
    /\bwhsec_[A-Za-z0-9_]+/i,
    /\bxox[baprs]-[A-Za-z0-9-]+/i,
  ];

  const stack = [{ path: label, value }];
  while (stack.length) {
    const current = stack.pop();
    if (typeof current.value === 'string') {
      for (const pattern of secretValuePatterns) {
        if (pattern.test(current.value)) {
          throw new Error(`${current.path} contains a raw secret-like value`);
        }
      }
    } else if (Array.isArray(current.value)) {
      current.value.forEach((item, index) => stack.push({ path: `${current.path}[${index}]`, value: item }));
    } else if (current.value && typeof current.value === 'object') {
      for (const [key, nested] of Object.entries(current.value)) {
        stack.push({ path: `${current.path}.${key}`, value: nested });
      }
    }
  }
}

function requiredHostHandoffEntries(currentManifest) {
  return [
    ...typedEntries(currentManifest.surfaces.native.screenIds, 'native screen'),
    ...typedEntries(currentManifest.surfaces.native.stackIds, 'native stack'),
    ...typedEntries(currentManifest.surfaces.native.providerIds, 'native provider'),
  ];
}

function typedEntries(ids = [], type) {
  return ids.map((id) => ({ id, type }));
}
