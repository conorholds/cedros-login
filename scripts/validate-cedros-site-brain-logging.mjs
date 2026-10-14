#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const manifest = readJson('cedros-extension.manifest.json');
const bootstrap = readJson('cedros-extension.bootstrap.json');
const siteBrain = readJson('docs/cedros-site-brain-logging-map.json');

assertDeepEqual(manifest, bootstrap.manifest, 'bootstrap manifest');
assertEqual(siteBrain.extensionId, manifest.extensionId, 'site-brain extensionId');
assertEqual(siteBrain.version, manifest.version, 'site-brain version');

if (!siteBrain.durableRecordPlans?.length) throw new Error('site-brain map must declare durableRecordPlans');
if (!siteBrain.transientLogPlans?.length) throw new Error('site-brain map must declare transientLogPlans');
if (!String(siteBrain.runtimeStatus?.siteBrainEmitter ?? '').includes('wasm-telemetry-live')) {
  throw new Error('site-brain emitter must be wasm-telemetry-live');
}

assertUnique(siteBrain.durableRecordPlans.map((record) => record.recordId), 'durable record ids');
assertUnique(siteBrain.durableRecordPlans.map((record) => record.subject), 'durable record subjects');
for (const record of siteBrain.durableRecordPlans) {
  validateRecord(record, manifest.extensionId);
}
validateSiteBrainScopes(siteBrain.durableRecordPlans, manifest);

assertUnique(siteBrain.transientLogPlans.map((log) => log.logId), 'transient log ids');
for (const log of siteBrain.transientLogPlans) {
  validateLogPlan(log, manifest.extensionId);
}

for (const row of siteBrain.hostHandoffRows ?? []) {
  validateHandoffRow(row, manifest.extensionId);
}

console.log('cedros site-brain/logging validation passed');

function validateRecord(record, extensionId) {
  for (const field of [
    'recordId',
    'category',
    'subject',
    'titlePattern',
    'summaryPattern',
    'tags',
    'detailsSchema',
    'references',
    'recoveryAction',
  ]) {
    if (!record[field]) throw new Error(`${record.recordId ?? 'record'} missing ${field}`);
  }
  assertNamespaced(record.recordId, extensionId, 'record id');
  assertNamespaced(record.subject, extensionId, 'record subject');
  assertStableLowercase(record.category, `${record.recordId}.category`);
  if (!record.tags.length) throw new Error(`${record.recordId} must declare tags`);
  for (const tag of record.tags) assertStableTag(tag, `${record.recordId}.tag`);
  assertSafeText(record.titlePattern, `${record.recordId}.titlePattern`);
  assertSafeText(record.summaryPattern, `${record.recordId}.summaryPattern`);
  assertSafeText(record.textPattern ?? '', `${record.recordId}.textPattern`);
  validateSafeSchema(record.detailsSchema, `${record.recordId}.detailsSchema`);
  for (const ref of record.references) validateReference(ref, record.recordId);
}

function validateSiteBrainScopes(records, currentManifest) {
  const scopes = new Set(
    (currentManifest.capabilities ?? [])
      .flatMap((capability) => capability.requestedScopes ?? [])
      .filter((scope) => scope.verb === 'write')
      .map((scope) => scope.resource)
  );
  for (const category of new Set(records.map((record) => record.category))) {
    const resource = `site-brain-record:${category}`;
    if (!scopes.has(resource)) throw new Error(`manifest is missing ${resource} write scope`);
  }
}

function validateLogPlan(log, extensionId) {
  for (const field of ['logId', 'level', 'surface', 'operation', 'message', 'fields', 'causeCodes', 'redactionRules']) {
    if (log[field] === undefined || log[field] === '') throw new Error(`${log.logId ?? 'log'} missing ${field}`);
  }
  assertNamespaced(log.logId, extensionId, 'log id');
  if (!['debug', 'info', 'warn', 'error'].includes(log.level)) throw new Error(`${log.logId} has invalid level`);
  if (!['admin', 'web', 'server', 'native', 'job', 'provider', 'outbox', 'ai'].includes(log.surface)) {
    throw new Error(`${log.logId} has invalid surface ${log.surface}`);
  }
  assertStableLowercase(log.operation, `${log.logId}.operation`);
  if (!log.fields.includes('extensionId')) throw new Error(`${log.logId} must include extensionId field`);
  for (const field of log.fields) validateSafeKey(field, `${log.logId}.fields`);
  for (const cause of log.causeCodes) {
    if (cause !== 'none') assertStableLowercase(cause, `${log.logId}.cause`);
  }
  for (const rule of log.redactionRules) assertSafeText(rule, `${log.logId}.redactionRules`);
}

function validateReference(ref, recordId) {
  for (const field of ['kind', 'label']) {
    if (!ref[field]) throw new Error(`${recordId} reference missing ${field}`);
  }
  const allowedKinds = new Set([
    'admin-page',
    'public-page',
    'job',
    'route',
    'provider-call',
    'database-operation',
    'ai-capability',
  ]);
  if (!allowedKinds.has(ref.kind)) throw new Error(`${recordId} reference has invalid kind ${ref.kind}`);
  if (!ref.id && !ref.path && !ref.url) throw new Error(`${recordId} reference must include id, path, or url`);
  assertSafeText(ref.label, `${recordId}.reference.label`);
  assertSafeText(ref.description ?? '', `${recordId}.reference.description`);
}

function validateHandoffRow(row, extensionId) {
  for (const field of [
    'item',
    'manifestId',
    'type',
    'runtimePackage',
    'hostHookRequired',
    'status',
    'owner',
    'launchGate',
  ]) {
    if (!row[field]) throw new Error(`${row.manifestId ?? row.item} missing ${field}`);
  }
  assertNamespaced(row.manifestId, extensionId, 'handoff manifest id');
  if (typeof row.blocking !== 'boolean') throw new Error(`${row.manifestId} missing boolean blocking`);
  const statuses = ['metadata-only', 'host-hook-requested', 'bound-in-staging', 'bound-in-production', 'deferred', 'blocked'];
  if (!statuses.includes(row.status)) throw new Error(`${row.manifestId} has invalid status ${row.status}`);
}

function validateSafeSchema(schema, label) {
  if (schema.type !== 'object') throw new Error(`${label} must be an object schema`);
  for (const key of Object.keys(schema.properties ?? {})) {
    validateSafeKey(key, `${label}.${key}`);
    const child = schema.properties[key];
    if (child?.type === 'object') validateSafeSchema(child, `${label}.${key}`);
  }
}

function validateSafeKey(key, label) {
  const normalized = key.replace(/^metadata\./, '').toLowerCase();
  const forbidden = [
    'authorization',
    'authheader',
    'cookie',
    'email',
    'emailaddress',
    'ip',
    'ipaddress',
    'password',
    'phone',
    'privatekey',
    'prompt',
    'rawpayload',
    'requestheaders',
    'sessionid',
    'sessiontoken',
    'token',
    'userid',
    'useragent',
    'walletaddress',
  ];
  if (forbidden.includes(normalized)) throw new Error(`${label} uses unsafe key ${key}`);
}

function assertSafeText(value, label) {
  const text = String(value);
  const unsafePatterns = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bBearer\s+[A-Za-z0-9._~+/-]+=*/i,
    /postgres:\/\/[^"\\\s]+/i,
    /sk_live_[A-Za-z0-9]+/i,
    /token=[A-Za-z0-9._~+/-]+/i,
  ];
  for (const pattern of unsafePatterns) {
    if (pattern.test(text)) throw new Error(`${label} contains secret-like text`);
  }
}

function assertStableLowercase(value, label) {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(value)) throw new Error(`${label} must be lowercase stable text`);
}

function assertStableTag(value, label) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(value)) throw new Error(`${label} must be a lowercase stable tag`);
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
