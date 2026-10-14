#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateSchemaValue } from './lib/validate-json-schema-subset.mjs';

const root = resolve(new URL('..', import.meta.url).pathname);
const contract = readJson('contracts/host/cedros-login-identity-profile-contract.v1.json');
const fixture = readJson(contract.fixture);
const responseSchema = executableSchema(readJson(contract.responseSchema));
const errorSchema = executableSchema(readJson(contract.errorSchema));
const manifest = readJson('cedros-extension.manifest.json');

assertEqual(contract.schemaVersion, 1, 'contract schemaVersion');
assertEqual(contract.contractId, 'cedros-login:identity-profile:v1', 'contract id');
assertEqual(contract.owner, 'cedros-login', 'contract owner');
assertEqual(contract.releaseVersion, manifest.version, 'contract release version');
assertEqual(contract.minimumLoginVersion, '1.0.15', 'minimum Login version');
assertEqual(fixture.contractId, contract.contractId, 'fixture contract id');
if (!existsSync(resolve(root, contract.installedHostTest))) {
  throw new Error(`missing installed-host test ${contract.installedHostTest}`);
}

const routeIds = new Set(manifest.surfaces.server.routes);
for (const endpoint of [contract.currentUser, contract.privileged]) {
  if (!routeIds.has(endpoint.routeId)) throw new Error(`manifest is missing ${endpoint.routeId}`);
  if (endpoint.method !== 'GET') throw new Error(`${endpoint.routeId} must remain read-only GET`);
}
if (contract.currentUser.requestBody !== null) throw new Error('current-user request body must be null');
if (!contract.currentUser.subjectBinding.includes('no caller-supplied subject')) {
  throw new Error('current-user subject binding must reject caller-supplied users');
}
assertEqual(contract.privileged.requiredScope, 'identity-profile:read', 'privileged scope');
assertEqual(contract.privileged.auditEvent, 'admin.identity_profile_read', 'audit event');
assertEqual(
  contract.privileged.auditFields.relyingPartyId,
  'authenticated machine caller',
  'audit relying party attribution'
);
assertEqual(
  contract.privileged.auditFields.orgId,
  'authorized Login organization',
  'audit tenant attribution'
);
assertEqual(contract.freshness.cacheControl, 'private, no-store', 'cache policy');

const capabilityIds = new Set((manifest.capabilities ?? []).map(({ id }) => id));
if (!capabilityIds.has(contract.capabilityId)) {
  throw new Error(`manifest is missing capability ${contract.capabilityId}`);
}

for (const [name, projection] of Object.entries(fixture.projections ?? {})) {
  validateSchemaValue(projection, responseSchema, responseSchema, `fixture.projections.${name}`);
  const encoded = JSON.stringify(projection).toLowerCase();
  for (const forbidden of [
    'emailaddress', 'walletaddress', 'passwordhash', 'recovery', 'secret', 'credentialmaterial',
  ]) {
    if (encoded.includes(forbidden)) throw new Error(`projection ${name} exposes ${forbidden}`);
  }
}

const cases = new Map((fixture.installedHostCases ?? []).map((testCase) => [testCase.id, testCase]));
const setup = fixture.installedHostSetup;
if (!setup || setup.isolation !== 'dedicated non-production site with no concurrent identity-profile audit traffic') {
  throw new Error('installed-host fixture must declare its isolation boundary');
}
assertEqual(setup.sessions.currentUser.jwtState, 'valid', 'current-user JWT state');
assertEqual(setup.sessions.currentUser.databaseSessionState, 'active', 'current-user session state');
assertEqual(setup.sessions.expiredSession.jwtState, 'valid', 'expired-session JWT state');
assertEqual(setup.sessions.expiredSession.databaseSessionState, 'expired', 'expired database session state');
assertEqual(
  setup.relyingParties.profileAdmin.scopes.includes(contract.privileged.requiredScope),
  true,
  'admin RP scope'
);
assertEqual(
  setup.relyingParties.profileDenied.scopes.includes(contract.privileged.requiredScope),
  false,
  'denied RP scope'
);
const requiredCases = ['current-user', 'administrator', 'expired-session', 'denial', 'cross-tenant'];
for (const id of requiredCases) {
  if (!cases.has(id)) throw new Error(`installed-host fixture is missing ${id}`);
}
if (cases.size !== requiredCases.length) throw new Error('installed-host fixture contains an unreviewed case');
for (const testCase of cases.values()) {
  assertEqual(testCase.expectedCacheControl, contract.freshness.cacheControl, `${testCase.id} cache`);
  if (testCase.expectedError) {
    validateSchemaValue({ error: testCase.expectedError }, errorSchema, errorSchema, `${testCase.id}.error`);
  } else {
    const projection = fixture.projections[testCase.expectedProjection];
    if (!projection) throw new Error(`${testCase.id} references a missing projection`);
    validateSchemaValue(projection, responseSchema, responseSchema, `${testCase.id}.projection`);
  }
}
assertEqual(cases.get('administrator').expectedAuditEvent, contract.privileged.auditEvent, 'admin audit');
assertEqual(cases.get('denial').expectedAuditEvents, 0, 'denial audit count');
assertEqual(cases.get('cross-tenant').expectedAuditEvents, 0, 'cross-tenant audit count');
assertEqual(cases.get('cross-tenant').request.query.orgId, 'org-casino', 'cross-tenant lookup org');
assertEqual(cases.get('cross-tenant').expectedError, 'subject_not_found', 'cross-tenant concealment');

for (const signal of Object.values(contract.excludedSignals ?? {})) {
  if (!Object.values(signal).includes('not-published')) {
    throw new Error('excluded identity signal must identify its unpublished proof/verdict contract');
  }
}

console.log('Cedros Login identity-profile v1 contract passed');

function executableSchema(schema) {
  const copy = structuredClone(schema);
  delete copy.$schema;
  delete copy.$id;
  delete copy.title;
  return copy;
}

function readJson(path) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) throw new Error(`missing ${path}`);
  return JSON.parse(readFileSync(absolute, 'utf8'));
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} expected ${expected}, got ${actual}`);
}
