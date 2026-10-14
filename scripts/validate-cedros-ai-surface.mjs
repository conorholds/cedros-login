#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const manifest = readJson('cedros-extension.manifest.json');
const bootstrap = readJson('cedros-extension.bootstrap.json');
const aiMap = readJson('docs/cedros-ai-skills-capabilities-map.json');
const hostHandoff = readJson('docs/cedros-host-coordination-handoff-map.json');
const wasmRoutes = [...readFileSync('server-wasm/src/routes/registry.rs', 'utf8')
  .matchAll(/route\(\s*"([^"\n]+)"\s*,\s*"([A-Z]+)"\s*,\s*"([^"\n]+)"\s*,?\s*\)/g)]
  .map((match) => ({ id: match[1], method: match[2], path: match[3] }));

assertDeepEqual(manifest, bootstrap.manifest, 'bootstrap manifest');
assertEqual(aiMap.extensionId, manifest.extensionId, 'AI map extensionId');
assertEqual(aiMap.version, manifest.version, 'AI map version');

const ai = manifest.surfaces?.ai;
if (!ai) throw new Error('manifest must declare surfaces.ai per 17-ai-skills-and-capabilities.md');
assertEqual(ai.packageRef, 'server', 'surfaces.ai.packageRef');
if (!(ai.skills?.length || ai.capabilities?.length)) {
  throw new Error('surfaces.ai must declare at least one skill or capability');
}

validateCoverage(aiMap.skills ?? [], ai.skills ?? [], 'id', 'AI skills');
validateCoverage(
  aiMap.capabilityRouteMappings ?? [],
  ai.capabilities ?? [],
  'capabilityId',
  'AI capability mappings',
  'id'
);

for (const skill of ai.skills ?? []) validateSkill(skill, manifest.extensionId);
for (const capability of ai.capabilities ?? []) validateCapability(capability, manifest.extensionId);
for (const mapping of aiMap.capabilityRouteMappings ?? []) validateMapping(mapping, manifest);
for (const row of aiMap.hostHandoffRows ?? []) validateMapHandoffRow(row, hostHandoff, manifest.extensionId);

console.log('cedros AI surface validation passed');

function validateSkill(skill, extensionId) {
  for (const field of ['id', 'name', 'description', 'category', 'visibility']) {
    if (!skill[field]) throw new Error(`${skill.id ?? 'skill'} missing ${field}`);
  }
  assertNamespaced(skill.id, extensionId, 'skill id');
  assertNoWhitespaceOrSlash(skill.id, 'skill id');
  validateVisibility(skill.visibility, skill.id);
  if (!skill.docs?.markdown?.trim()) throw new Error(`${skill.id} missing docs.markdown`);
  assertSafeText(skill.docs.markdown, `${skill.id}.docs.markdown`);
}

function validateCapability(capability, extensionId) {
  for (const field of ['id', 'name', 'description', 'kind', 'visibility', 'endpoint', 'inputSchema']) {
    if (!capability[field]) throw new Error(`${capability.id ?? 'capability'} missing ${field}`);
  }
  assertNamespaced(capability.id, extensionId, 'capability id');
  assertNoWhitespaceOrSlash(capability.id, 'capability id');
  validateVisibility(capability.visibility, capability.id);
  if (!['tool', 'action'].includes(capability.kind)) throw new Error(`${capability.id} has invalid kind`);
  if (!['POST', 'PUT', 'PATCH'].includes(capability.endpoint.method)) {
    throw new Error(`${capability.id} has invalid endpoint method ${capability.endpoint.method}`);
  }
  if (!capability.endpoint.path?.startsWith('/')) throw new Error(`${capability.id} endpoint path must be absolute`);
  if (!capability.endpoint.path.startsWith(`/extensions/${extensionId}/`)) {
    throw new Error(`${capability.id} endpoint must use its executable extension route prefix`);
  }
  if (capability.endpoint.path.startsWith('/ai/capabilities')) {
    throw new Error(`${capability.id} endpoint path uses reserved AI execution prefix`);
  }
  if (capability.endpoint.path.includes('//') || /[\\\u0000-\u001f]/.test(capability.endpoint.path)) {
    throw new Error(`${capability.id} endpoint path contains invalid characters`);
  }
  if (['authenticated', 'admin'].includes(capability.visibility)) {
    const schemes = capability.auth?.schemes ?? [];
    if (!schemes.includes('bearer-token')) throw new Error(`${capability.id} requires bearer-token auth`);
  }
  validateSchema(capability.inputSchema, `${capability.id}.inputSchema`);
  if (capability.id === 'cedros-login:disable-mfa') {
    const schema = capability.inputSchema;
    assertEqual(`${Object.keys(schema.properties ?? {}).sort().join(',')}:${schema.minProperties}:${schema.maxProperties}:${schema.required === undefined}`, 'code,recoveryCode:1:1:true', `${capability.id}.inputSchema exact-one enrolled-factor schema`);
    if (!/exactly one of code or recoveryCode/.test(schema.description ?? '')) throw new Error(`${capability.id}.inputSchema must document the enrolled-factor requirement`);
  }
  if (capability.outputSchema) validateSchema(capability.outputSchema, `${capability.id}.outputSchema`);
}

function validateMapping(mapping, currentManifest) {
  for (const field of [
    'capabilityId',
    'endpointPath',
    'method',
    'ownedByExtension',
    'serverRouteId',
    'hostHandoffManifestId',
    'status',
    'authRequirement',
    'safety',
    'redactionRules',
  ]) {
    if (mapping[field] === undefined || mapping[field] === '') {
      throw new Error(`${mapping.capabilityId ?? 'mapping'} missing ${field}`);
    }
  }
  if (mapping.ownedByExtension !== true) throw new Error(`${mapping.capabilityId} must be owned by this extension`);
  if (!(currentManifest.surfaces.server.routes ?? []).includes(mapping.serverRouteId)) {
    throw new Error(`${mapping.capabilityId} references missing server route ${mapping.serverRouteId}`);
  }
  const capability = (currentManifest.surfaces.ai.capabilities ?? []).find((item) => item.id === mapping.capabilityId);
  if (!capability) throw new Error(`${mapping.capabilityId} missing manifest capability`);
  assertEqual(mapping.endpointPath, capability.endpoint.path, `${mapping.capabilityId} endpointPath`);
  assertEqual(mapping.method, capability.endpoint.method, `${mapping.capabilityId} method`);
  const route = wasmRoutes.find((item) => item.id === mapping.serverRouteId);
  if (!route || route.method !== mapping.method
      || `/extensions/${currentManifest.extensionId}${route.path}` !== mapping.endpointPath) {
    throw new Error(`${mapping.capabilityId} endpoint is not bound to its declared Wasm route`);
  }
  assertEqual(mapping.hostHandoffManifestId, mapping.capabilityId, `${mapping.capabilityId} hostHandoffManifestId`);
  for (const field of ['sideEffects', 'approval', 'idempotency', 'siteBrainSubject']) {
    if (!mapping.safety[field]) throw new Error(`${mapping.capabilityId}.safety missing ${field}`);
  }
  for (const rule of mapping.redactionRules) assertSafeText(rule, `${mapping.capabilityId}.redactionRules`);
}

function validateMapHandoffRow(row, hostHandoffMap, extensionId) {
  for (const field of ['manifestId', 'type', 'runtimePackage', 'hostHookRequired', 'status', 'owner', 'launchGate']) {
    if (!row[field]) throw new Error(`${row.manifestId ?? 'handoff'} missing ${field}`);
  }
  assertNamespaced(row.manifestId, extensionId, 'AI handoff manifest id');
  const canonical = (hostHandoffMap.handoffRows ?? []).find((candidate) => candidate.manifestId === row.manifestId);
  if (!canonical) throw new Error(`${row.manifestId} missing canonical host handoff row`);
  assertEqual(row.type, canonical.type, `${row.manifestId} handoff type`);
  assertEqual(row.status, canonical.status, `${row.manifestId} handoff status`);
}

function validateSchema(schema, label) {
  if (schema.type !== 'object') throw new Error(`${label} must be an object schema`);
  const unsupported = ['$ref', 'oneOf', 'anyOf', 'allOf', 'format'];
  for (const key of unsupported) {
    if (schema[key] !== undefined) throw new Error(`${label} uses unsupported schema keyword ${key}`);
  }
  for (const [propertyKey, property] of Object.entries(schema.properties ?? {})) {
    validateSafePropertyKey(propertyKey, `${label}.${propertyKey}`);
    validateProperty(property, `${label}.${propertyKey}`);
  }
}

function validateProperty(property, label) {
  const allowedTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
  if (!allowedTypes.includes(property.type)) throw new Error(`${label} has unsupported type ${property.type}`);
  for (const key of ['$ref', 'oneOf', 'anyOf', 'allOf', 'format']) {
    if (property[key] !== undefined) throw new Error(`${label} uses unsupported schema keyword ${key}`);
  }
  if (property.type === 'array' && property.items) validateProperty(property.items, `${label}.items`);
  if (property.type === 'object') validateSchema(property, label);
}

function validateSafePropertyKey(key, label) {
  const forbidden = ['authorization', 'cookie', 'privateKey', 'sessionToken'];
  if (forbidden.includes(key)) throw new Error(`${label} uses forbidden property key ${key}`);
}

function validateCoverage(actualItems = [], expectedItems = [], actualKey, label, expectedKey = actualKey) {
  const actualIds = actualItems.map((item) => item[actualKey]);
  const expectedIds = expectedItems.map((item) => item[expectedKey]);
  assertUnique(actualIds, label);
  assertEqual([...actualIds].sort().join(','), [...expectedIds].sort().join(','), `${label} coverage`);
}

function validateVisibility(value, label) {
  if (!['public', 'authenticated', 'admin'].includes(value)) throw new Error(`${label} has invalid visibility ${value}`);
}

function assertNoWhitespaceOrSlash(value, label) {
  if (/\s|\//.test(value)) throw new Error(`${label} ${value} must not contain whitespace or slash`);
}

function assertSafeText(value, label) {
  const text = String(value);
  const unsafePatterns = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bBearer\s+[A-Za-z0-9._~+/-]{12,}=*/i,
    /postgres:\/\/[^"\\\s]+/i,
    /sk_live_[A-Za-z0-9]+/i,
    /token=[A-Za-z0-9._~+/-]+/i,
  ];
  for (const pattern of unsafePatterns) {
    if (pattern.test(text)) throw new Error(`${label} contains secret-like text`);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} expected ${expected}, got ${actual}`);
}

function assertDeepEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label} mismatch`);
}

function assertNamespaced(id, extensionId, label) {
  if (!id?.startsWith(`${extensionId}:`)) throw new Error(`${label} ${id} must be namespaced with ${extensionId}`);
}

function assertUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`${label} contains duplicate ${value}`);
    seen.add(value);
  }
}
