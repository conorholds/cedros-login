#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const fixture = JSON.parse(
  readFileSync(resolve(root, 'contracts/fixtures/cedros-login-identity-profile-v1.json'), 'utf8')
);
const cases = new Map(fixture.installedHostCases.map((testCase) => [testCase.id, testCase]));

const baseUrl = required('CEDROS_LOGIN_IDENTITY_PROFILE_BASE_URL').replace(/\/$/, '');
const tokens = {
  current: required('CEDROS_LOGIN_CURRENT_USER_TOKEN'),
  expired: required('CEDROS_LOGIN_EXPIRED_SESSION_TOKEN'),
  admin: required('CEDROS_LOGIN_PROFILE_ADMIN_TOKEN'),
  denied: required('CEDROS_LOGIN_PROFILE_DENIED_TOKEN'),
  systemAdmin: required('CEDROS_LOGIN_SYSTEM_ADMIN_TOKEN'),
};
const callers = {
  admin: process.env.CEDROS_LOGIN_PROFILE_RELYING_PARTY || 'cedros-casino',
  denied: process.env.CEDROS_LOGIN_PROFILE_DENIED_RELYING_PARTY || 'cedros-portal',
};
const auditEvent = cases.get('administrator').expectedAuditEvent;
const auditTarget = fixture.projections.complete.subjectId;

await expectCase('current-user', tokens.current);
await expectCase('expired-session', tokens.expired);

const auditBeforeDenials = await auditSnapshot();
await expectCase('denial', tokens.denied, callers.denied);
await expectCase('cross-tenant', tokens.admin, callers.admin);
const auditAfterDenials = await auditSnapshot();
assertEqual(auditAfterDenials.total, auditBeforeDenials.total, 'denial audit count');

await expectCase('administrator', tokens.admin, callers.admin);
const auditAfterAdmin = await auditSnapshot();
assertEqual(auditAfterAdmin.total, auditBeforeDenials.total + 1, 'administrator audit count');
const latest = auditAfterAdmin.logs[0];
if (
  latest?.eventType !== auditEvent ||
  latest?.actorUserId != null ||
  latest?.relyingPartyId !== callers.admin ||
  latest?.orgId !== fixture.projections.complete.tenantId ||
  latest?.targetType !== 'identity_profile' ||
  latest?.targetId !== auditTarget
) {
  throw new Error('administrator audit record does not match the profile access');
}
console.log(`PASS audit: denials=0 authorized=1 event=${auditEvent}`);

async function expectCase(id, token, caller) {
  const testCase = cases.get(id);
  if (!testCase) throw new Error(`fixture case missing ${id}`);
  const url = routeUrl(testCase.request);
  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${token}`,
  };
  if (caller) headers['x-cedros-relying-party'] = caller;
  const response = await fetch(url, {
    method: testCase.request.method,
    headers,
  });
  const body = await json(response, id);

  assertEqual(response.status, testCase.expectedStatus, `${id} status`);
  assertEqual(response.headers.get('cache-control'), testCase.expectedCacheControl, `${id} cache-control`);
  if (testCase.expectedError) {
    assertDeepEqual(body, { error: testCase.expectedError }, `${id} error`);
  } else {
    assertDeepEqual(body, fixture.projections[testCase.expectedProjection], `${id} projection`);
  }
  console.log(`PASS ${id}: status=${response.status} cache=${testCase.expectedCacheControl}`);
}

async function auditSnapshot() {
  const query = new URLSearchParams({
    eventType: auditEvent,
    targetId: auditTarget,
    limit: '10',
  });
  const response = await fetch(`${baseUrl}/extensions/cedros-login/admin/audit?${query.toString()}`, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${tokens.systemAdmin}`,
    },
  });
  const body = await json(response, 'audit');
  assertEqual(response.status, 200, 'audit status');
  if (!Number.isSafeInteger(body.total) || !Array.isArray(body.logs)) {
    throw new Error('audit response is malformed');
  }
  return body;
}

function routeUrl(request) {
  const url = new URL(`${baseUrl}/extensions/cedros-login${request.path}`);
  for (const [key, value] of Object.entries(request.query ?? {})) {
    url.searchParams.set(key, value);
  }
  return url;
}

async function json(response, label) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} returned a non-JSON response with status ${response.status}`);
  }
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`missing required environment variable ${name}`);
  return value;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

function assertDeepEqual(actual, expected, label) {
  if (JSON.stringify(canonical(actual)) !== JSON.stringify(canonical(expected))) {
    throw new Error(`${label} did not match the published fixture`);
  }
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonical(entry)])
  );
}
