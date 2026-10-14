#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const manifest = readJson('cedros-extension.manifest.json');
const bootstrap = readJson('cedros-extension.bootstrap.json');
const analyticsMap = readJson('docs/cedros-analytics-events-map.json');

assertDeepEqual(manifest, bootstrap.manifest, 'bootstrap manifest');
assertEqual(analyticsMap.extensionId, manifest.extensionId, 'analytics extensionId');
assertEqual(analyticsMap.version, manifest.version, 'analytics version');

const events = manifest.analytics?.events ?? [];
if (!events.length) throw new Error('manifest must declare analytics.events per 16-analytics-and-site-brain.md');
validateEventIds(events, manifest.extensionId);
validateMapCoverage(analyticsMap.events ?? [], events);

for (const event of events) {
  validateManifestEvent(event, manifest.extensionId);
}

for (const event of analyticsMap.events ?? []) {
  validateMappedEvent(event);
}

for (const row of analyticsMap.hostHandoffRows ?? []) {
  validateHandoffRow(row, manifest.extensionId);
}

console.log('cedros analytics events validation passed');

function validateEventIds(events, extensionId) {
  assertUnique(events.map((event) => event.id), 'analytics event ids');
  for (const event of events) {
    assertNamespaced(event.id, extensionId, 'analytics event id');
  }
}

function validateMapCoverage(mappedEvents, manifestEvents) {
  const mappedIds = new Set(mappedEvents.map((event) => event.id));
  const manifestIds = new Set(manifestEvents.map((event) => event.id));
  assertEqual([...mappedIds].sort().join(','), [...manifestIds].sort().join(','), 'analytics map coverage');
}

function validateManifestEvent(event, extensionId) {
  for (const field of ['id', 'displayName', 'description', 'category', 'visibility']) {
    if (!event[field]) throw new Error(`${event.id} missing ${field}`);
  }
  assertNamespaced(event.id, extensionId, 'analytics event id');
  if (!['public', 'authenticated', 'admin'].includes(event.visibility)) {
    throw new Error(`${event.id} has invalid visibility ${event.visibility}`);
  }
  assertSafeText(event.displayName, `${event.id}.displayName`);
  assertSafeText(event.description, `${event.id}.description`);
  assertSafeText(event.category, `${event.id}.category`);
}

function validateMappedEvent(event) {
  for (const field of [
    'id',
    'trigger',
    'triggerSurface',
    'ownerAction',
    'runtimeStatus',
    'browserReportingPath',
    'serverReportingPath',
    'safeProperties',
  ]) {
    if (!event[field]) throw new Error(`${event.id} missing ${field}`);
  }
  if (!String(event.runtimeStatus).includes('wasm-telemetry-live')) {
    throw new Error(`${event.id} must mark runtime analytics emission wasm-telemetry-live`);
  }
  validateSafePropertyKeys(event.safeProperties, `${event.id}.safeProperties`);
  for (const rule of event.redactionRules ?? []) {
    assertSafeText(rule, `${event.id}.redactionRules`);
  }
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
  assertNamespaced(row.manifestId, extensionId, 'analytics handoff manifest id');
  if (typeof row.blocking !== 'boolean') throw new Error(`${row.manifestId} missing boolean blocking`);
  if (!['metadata-only', 'host-hook-requested', 'bound-in-staging', 'bound-in-production', 'deferred', 'blocked'].includes(row.status)) {
    throw new Error(`${row.manifestId} has invalid status ${row.status}`);
  }
}

function validateSafePropertyKeys(schema, label) {
  if (schema.type !== 'object') throw new Error(`${label} must be an object schema`);
  const forbiddenKeys = new Set([
    'authorization',
    'authHeader',
    'cookie',
    'email',
    'emailAddress',
    'ip',
    'ipAddress',
    'phone',
    'prompt',
    'rawPayload',
    'sessionId',
    'sessionToken',
    'subject',
    'token',
    'userAgent',
    'userId',
    'walletAddress',
  ]);
  visitSchemaKeys(schema, label, (key, path) => {
    if (forbiddenKeys.has(key)) throw new Error(`${path} uses forbidden analytics property key ${key}`);
  });
}

function visitSchemaKeys(schema, label, visitor) {
  for (const key of Object.keys(schema.properties ?? {})) {
    const path = `${label}.${key}`;
    visitor(key, path);
    const child = schema.properties[key];
    if (child?.type === 'object') visitSchemaKeys(child, path, visitor);
  }
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
