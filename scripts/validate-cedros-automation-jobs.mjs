#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const manifest = readJson('cedros-extension.manifest.json');
const serverNative = readJson('docs/cedros-server-native-host-coordination-map.json');
const automation = readJson('docs/cedros-automation-jobs-map.json');
const hostProviders = readJson('docs/cedros-host-provider-map.json');

assertEqual(automation.extensionId, manifest.extensionId, 'automation extensionId');
assertEqual(automation.version, manifest.version, 'automation version');
if (!Number.isInteger(automation.metadataMaxBytes) || automation.metadataMaxBytes <= 0) {
  throw new Error('automation metadataMaxBytes must be a positive integer');
}
validateCoverage(automation.jobs, manifest.surfaces.server.jobs ?? [], 'jobId', 'automation jobs');
validateManifestSchedules(manifest.jobSchedules ?? [], manifest.surfaces.server.jobs ?? []);

const serverJobsById = new Map((serverNative.jobs ?? []).map((job) => [job.jobId, job]));
for (const job of automation.jobs ?? []) {
  validateAutomationJob(job, serverJobsById.get(job.jobId), automation);
}
validateEmailDeliveryContract(hostProviders);

console.log('cedros automation jobs validation passed');

function validateAutomationJob(job, serverJob, defaults) {
  if (!serverJob) throw new Error(`${job.jobId} missing server/native job contract`);
  requireFields(job, [
    'jobId',
    'purpose',
    'executorExport',
    'hostHookStatus',
    'cedrosAutomationJob',
    'metadataSchema',
    'idempotencyKeyStrategy',
    'retryableConditions',
    'downstreamLimits',
    'missedRunBehavior',
    'siteBrainRecords',
    'failureNotificationBehavior',
    'stagingVerification',
  ]);
  assertEqual(job.executorExport, serverJob.executorExport, `${job.jobId} executorExport`);
  if (!['wasm-ready', 'host-hook-requested', 'bound-in-staging', 'bound-in-production', 'blocked', 'deferred'].includes(job.hostHookStatus)) {
    throw new Error(`${job.jobId} has invalid hostHookStatus`);
  }
  const schedule = job.cedrosAutomationJob;
  assertEqual(schedule.extensionId, defaults.extensionId, `${job.jobId} schedule extensionId`);
  assertEqual(schedule.jobId, job.jobId, `${job.jobId} schedule jobId`);
  assertEqual(schedule.timeoutSeconds, serverJob.timeoutSeconds, `${job.jobId} timeoutSeconds`);
  if (!serverJob.scheduleExamples.includes(schedule.schedule.expression)) {
    throw new Error(`${job.jobId} schedule expression missing from server/native contract`);
  }
  validateSchedule(schedule, defaults, job);
  validateSafeJson(schedule.metadata ?? {}, defaults.metadataMaxBytes, `${job.jobId}.metadata`);
  if (!job.retryableConditions.length) throw new Error(`${job.jobId} must declare retryable conditions`);
  if (!job.siteBrainRecords.length) throw new Error(`${job.jobId} must declare site-brain record plans`);
  for (const record of job.siteBrainRecords) {
    requireFields(record, ['category', 'subject', 'title', 'details']);
    assertEqual(record.subject, job.jobId, `${job.jobId} site-brain subject`);
  }
  if (job.jobId === 'cedros-login:outbox-dispatch') {
    validateAtLeastOnceClaim(job, serverJob);
  }
}

function validateManifestSchedules(schedules, declaredJobIds) {
  for (const [index, schedule] of schedules.entries()) {
    if (!declaredJobIds.includes(schedule.jobId)) {
      throw new Error(`jobSchedules[${index}].jobId references undeclared job ${schedule.jobId}`);
    }
    if (schedule.maxRetries !== undefined && schedule.maxRetries !== 0) {
      throw new Error(
        `jobSchedules[${index}].maxRetries must be 0 because automatic executor retries are unsupported`
      );
    }
  }
}

function validateAtLeastOnceClaim(job, serverJob) {
  const contract = [
    job.idempotencyKeyStrategy,
    job.downstreamLimits,
    job.missedRunBehavior,
    serverJob.retryBehavior,
    serverJob.idempotencyKeyStrategy,
  ].join(' ');
  if (!contract.toLowerCase().includes('at-least-once')) {
    throw new Error(`${job.jobId} must declare at-least-once delivery`);
  }
  if (!contract.toLowerCase().includes('correlation')) {
    throw new Error(`${job.jobId} must distinguish correlation from provider idempotency`);
  }
  if (/never send|exactly[- ]once|duplicate sends guarded/i.test(contract)) {
    throw new Error(`${job.jobId} overstates duplicate-delivery protection`);
  }
}

function validateEmailDeliveryContract(providerMap) {
  const access = (providerMap.providerAccess ?? []).find(
    (candidate) => candidate.id === 'cedros-login:email-provider'
  );
  if (!access) throw new Error('email provider access contract missing');
  const verification = access.runtimeCalls?.find(
    (call) => call.feature === 'email.verification'
  );
  const context = verification?.requestSchema?.optionalDeliveryContext;
  for (const field of ['contractVersion', 'idempotencyKey', 'attempt', 'duplicateRisk']) {
    if (!context?.[field]) throw new Error(`email provider delivery context missing ${field}`);
  }
  const providerRef = verification?.responseSchema?.properties?.providerMessageRef;
  if (!providerRef || providerRef.required !== false) {
    throw new Error('email provider response must declare providerMessageRef optional');
  }
  if (!verification.idempotency.toLowerCase().includes('at-least-once')) {
    throw new Error('email provider contract must declare at-least-once delivery');
  }
}

function validateSchedule(schedule, defaults, job) {
  requireFields(schedule, [
    'id',
    'extensionId',
    'jobId',
    'enabled',
    'schedule',
    'timeoutSeconds',
    'maxRetries',
    'concurrency',
    'metadata',
    'notificationChannels',
  ]);
  if (schedule.enabled !== false && ['blocked', 'host-hook-requested'].includes(job.hostHookStatus)) {
    throw new Error(`${job.jobId} must default disabled until host binding is live`);
  }
  if (!isValidCron(schedule.schedule.expression)) {
    throw new Error(`${job.jobId} has invalid cron ${schedule.schedule.expression}`);
  }
  assertEqual(schedule.schedule.timezone, defaults.timezone, `${job.jobId} timezone`);
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: schedule.schedule.timezone });
  } catch {
    throw new Error(`${job.jobId} timezone is not an IANA timezone`);
  }
  if (!Number.isInteger(schedule.timeoutSeconds) || schedule.timeoutSeconds < 1 || schedule.timeoutSeconds > 86400) {
    throw new Error(`${job.jobId} timeoutSeconds must be between 1 and 86400`);
  }
  if (schedule.maxRetries !== 0) {
    throw new Error(`${job.jobId} maxRetries must be 0 because automatic executor retries are unsupported`);
  }
  validateConcurrency(schedule.concurrency, job.jobId);
  validateNotifications(schedule.notificationChannels, job.jobId);
}

function validateConcurrency(concurrency, jobId) {
  const allowedModes = new Set(['single-flight', 'per-site', 'per-account', 'concurrent']);
  requireFields(concurrency, ['mode', 'scope']);
  if (!allowedModes.has(concurrency.mode)) throw new Error(`${jobId} has invalid concurrency mode`);
}

function validateNotifications(channels, jobId) {
  if (!Array.isArray(channels)) throw new Error(`${jobId} notificationChannels must be an array`);
  for (const channel of channels) {
    requireFields(channel, ['type', 'destinationRef', 'redaction']);
    if (channel.redaction !== 'summary-only') throw new Error(`${jobId} notification must be summary-only`);
  }
}

function isValidCron(expression) {
  if (typeof expression !== 'string') return false;
  const fields = expression.trim().split(/\s+/);
  if (![5, 6].includes(fields.length)) return false;
  return fields.every((field) => /^[\d*/,\-]+$/.test(field));
}

function validateCoverage(items = [], expectedIds = [], idKey, label) {
  const actualIds = items.map((item) => item[idKey]);
  assertUnique(actualIds, label);
  const actual = new Set(actualIds);
  for (const id of expectedIds) {
    if (!actual.has(id)) throw new Error(`${label} missing ${id}`);
  }
  for (const id of actual) {
    if (!expectedIds.includes(id)) throw new Error(`${label} includes undeclared id ${id}`);
  }
}

function validateSafeJson(value, maxBytes, label) {
  const encoded = JSON.stringify(value);
  if (encoded.length > maxBytes) throw new Error(`${label} exceeds ${maxBytes} bytes`);
  assertNoRawSecretValues(value, label);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function requireFields(item, fields) {
  const label = item.jobId ?? item.id ?? item.subject ?? 'item';
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
        if (pattern.test(current.value)) throw new Error(`${current.path} contains a raw secret-like value`);
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
