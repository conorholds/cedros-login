#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { validateSchemaValue } from "./lib/validate-json-schema-subset.mjs";

const v1 = readJson("contracts/host/cedros-database-concurrency-contract.v1.json");
const v1Fixture = readJson("contracts/fixtures/cedros-database-concurrency-v1.json");
const contractPath = "contracts/host/cedros-database-concurrency-contract.v2.json";
const fixturePath = "contracts/fixtures/cedros-database-concurrency-v2.json";
const contract = readJson(contractPath);
const fixture = readJson(fixturePath);
const schema = readJson("contracts/schemas/cedros-database-concurrency-contract.v2.schema.json");
const manifest = readJson("cedros-extension.manifest.json");

validateSchemaValue(contract, schema, schema, "v2 contract");

const immutableV1Operations = [
  "identity.verifications.consume-live-purpose-bound",
  "identity.setup.claim-first-admin",
  "identity.system-admin.demote",
  "organization.membership.change-role",
  "identity.canonical-email.transition",
  "identity.outbox.claim-delivery",
];
for (const [path, digest] of Object.entries({
  "contracts/host/cedros-database-concurrency-contract.v1.json": "f9d731a61e5fa9659e0464a3113738de79258aaea789e1b11551ad560a2e6694",
  "contracts/fixtures/cedros-database-concurrency-v1.json": "62108929dc4f6e39d8a8c6d113bf62691bad3c6030b1366475aa196cb3a5ed56",
  "contracts/schemas/cedros-database-concurrency-contract.schema.json": "afcde18e70cbf5fc659f2fc6b50baa04391854970357f04b1e395ec8ebe2db49",
})) {
  assertEqual(sha256(path), digest, `${path} immutable digest`);
}
assertEqual(v1.contractId, "cedros-data:database-concurrency-v1", "immutable v1 id");
assertSetEqual(v1.conditionalMutations.map(({ id }) => id), immutableV1Operations, "immutable v1 operations");
assertEqual(v1Fixture.scenarios.length, 6, "immutable v1 scenario count");
assertEqual(contract.supersedes?.contractId, v1.contractId, "v2 supersedes v1");
assertSetEqual(contract.supersedes?.immutableOperationIds, immutableV1Operations, "v2 immutable operation relation");

assertEqual(contract.schemaVersion, 2, "v2 schema version");
assertEqual(contract.contractId, "cedros-data:database-concurrency-v2", "v2 contract id");
assertEqual(contract.capability?.id, contract.contractId, "v2 capability id");
assertEqual(contract.compatibility?.currentGuestBehavior, "conditional-batch-v2", "guest behavior");
assertEqual(schema.properties?.conditionalMutations?.minItems, 22, "schema operation minimum");
assertEqual(schema.properties?.acceptanceFixture?.properties?.requiredScenarioIds?.minItems, 22, "schema scenario minimum");
assertEqual(schema.properties?.acceptanceFixture?.properties?.requiredCompositeCases?.minItems, 24, "schema composite minimum");
assertEqual(contract.acceptanceFixture?.path, fixturePath, "v2 fixture path");

const modelsByAccess = new Map(
  (manifest.databaseAccess ?? []).map((access) => [access.id, new Set(access.contentModels ?? [])]),
);
const operationIds = new Set();
for (const constraint of contract.uniqueConstraints ?? []) {
  validateOperation(constraint, [constraint.contentModelId]);
}
for (const mutation of contract.conditionalMutations ?? []) {
  validateOperation(mutation, mutation.contentModelIds);
  assertArray(mutation.preconditions, `${mutation.id}.preconditions`);
  assertArray(mutation.mutations, `${mutation.id}.mutations`);
}
assertEqual(contract.conditionalMutations.length, 22, "v2 conditional operation count");
const tokenEmailMutation = contract.conditionalMutations.find(
  ({ id }) => id === "identity.outbox.enqueue-token-email",
);
assertEqual(
  tokenEmailMutation?.requiredCapabilityId,
  "cedros-data:token-email-evidence-v1",
  "token email additive host capability",
);
const signupMutation = contract.conditionalMutations.find(
  ({ id }) => id === "registration.account.create",
);
const signupLimitStatusMutation = contract.conditionalMutations.find(
  ({ id }) => id === "registration.signup-limit.status",
);
const completeRegistrationMutation = contract.conditionalMutations.find(
  ({ id }) => id === "registration.account.complete",
);
assertSetEqual(
  schema.$defs?.conditionalMutation?.properties?.requiredCapabilityId?.enum,
  [
    "cedros-data:token-email-evidence-v1",
    "cedros-data:identity-atomic-v1",
    "cedros-data:signup-limit-atomic-v1",
  ],
  "additive capability schema",
);
assertEqual(
  signupMutation?.requiredCapabilityId,
  "cedros-data:signup-limit-atomic-v1",
  "signup limit additive host capability",
);
assertEqual(
  signupLimitStatusMutation?.requiredCapabilityId,
  "cedros-data:signup-limit-atomic-v1",
  "signup limit status additive host capability",
);
assertEqual(
  completeRegistrationMutation?.requiredCapabilityId,
  "cedros-data:identity-atomic-v1",
  "atomic registration completion host capability",
);
assertEqual(
  completeRegistrationMutation?.atomicity,
  "single-host-serializable-transaction",
  "atomic registration completion isolation",
);
assertSetEqual(
  completeRegistrationMutation?.contentModelIds ?? [],
  [
    "cedros-login:verifications",
    "cedros-login:nonces",
    "cedros-login:users",
    "cedros-login:user-emails",
    "cedros-login:credentials",
    "cedros-login:sessions",
    "cedros-login:orgs",
    "cedros-login:memberships",
    "cedros-login:invite-code-accounts",
    "cedros-login:outbox",
  ],
  "atomic registration completion model coverage",
);

const schemaOperationIds = new Set();
const wireSchemas = new Map();
for (const catalogPath of contract.operationSchemaCatalogs ?? []) {
  const catalog = readJson(catalogPath);
  assertEqual(catalog.schemaVersion, 2, `${catalogPath}.schemaVersion`);
  for (const [id, wire] of Object.entries(catalog.operations ?? {})) {
    if (schemaOperationIds.has(id)) throw new Error(`duplicate operation wire schema ${id}`);
    schemaOperationIds.add(id);
    assertSchema(wire.requestSchema, `${id}.requestSchema`);
    assertSchema(wire.outputSchema, `${id}.outputSchema`);
    wireSchemas.set(id, { wire, catalog });
  }
}
assertSetEqual([...schemaOperationIds], [...operationIds].filter((id) => !id.includes(".normalized-") && !id.endsWith(".username") && !id.endsWith(".google-id") && !id.endsWith(".apple-id") && !id.endsWith(".wallet-address") && !id.endsWith(".one-primary") && !id.endsWith(".slug") && !id.endsWith(".user-org") && !id.includes("invites.pending-")), "wire schema operation coverage");

const guestExamples = readJson("contracts/host/operations/v2/guest-wire-examples.json");
assertEqual(guestExamples.schemaVersion, 2, "guest wire example schema version");
assertSetEqual(Object.keys(guestExamples.operations ?? {}), [...schemaOperationIds], "guest wire example coverage");
for (const [id, example] of Object.entries(guestExamples.operations)) {
  const { wire, catalog } = wireSchemas.get(id);
  validateSchemaValue(example.params, wire.requestSchema, catalog, `${id}.guest.params`);
  validateSchemaValue(example.output, wire.outputSchema, catalog, `${id}.guest.output`);
}
assertSetEqual(
  wireSchemas.get("registration.account.complete")?.wire?.requestSchema?.required ?? [],
  ["user", "membership", "emailVerification", "emailOutbox", "signupLimit"],
  "registration completion required inputs",
);
validateTokenEmailExample(
  guestExamples.operations["identity.outbox.enqueue-token-email"]?.params,
);

assertEqual(fixture.schemaVersion, 2, "fixture schema version");
assertEqual(fixture.contractId, contract.contractId, "fixture contract id");
assertEqual(fixture.minimumConcurrentAttempts, 50, "fixture attempt minimum");
assertEqual(fixture.minimumIndependentWorkers, 2, "fixture worker minimum");
assertEqual(fixture.referenceModelOnly, true, "reference runner label");
assertEqual(fixture.workerIds?.length, 2, "fixture worker ids");
assertUnique(fixture.workerIds, "fixture worker ids");

const scenarios = new Map((fixture.scenarios ?? []).map((scenario) => [scenario.id, scenario]));
assertEqual(fixture.scenarios?.length, 22, "top-level live-host fixture count");
assertEqual(scenarios.size, 22, "top-level live-host scenario count");
assertSetEqual([...scenarios.keys()], contract.acceptanceFixture?.requiredScenarioIds ?? [], "required live-host scenario coverage");
assertEqual(
  scenarios.get("concurrent-token-email-enqueue")?.operationId,
  "identity.outbox.enqueue-token-email",
  "token email live-host operation",
);
assertEqual(
  scenarios.get("concurrent-registration-account-completion")?.operationId,
  "registration.account.complete",
  "registration completion live-host operation",
);
for (const id of contract.acceptanceFixture?.requiredScenarioIds ?? []) {
  const scenario = scenarios.get(id);
  if (!scenario) throw new Error(`missing live-host scenario ${id}`);
  if (!operationIds.has(scenario.operationId)) throw new Error(`${id} references unknown operation`);
  validateVector(scenario, id);
}

const recoveries = [...scenarios.values()].flatMap((scenario) => scenario.recoveryCases ?? []);
for (const recovery of recoveries) validateVector(recovery, recovery.id);
const requiredRecoveryIds = [
  ...(contract.acceptanceFixture?.requiredOutboxRecoveryCases ?? []),
  ...(contract.acceptanceFixture?.requiredCompositeCases ?? []),
];
assertUnique(recoveries.map(({ id }) => id), "recovery vector ids");
assertUnique(requiredRecoveryIds, "required recovery vector ids");
assertSetEqual(recoveries.map(({ id }) => id), requiredRecoveryIds, "required recovery vector coverage");
assertEqual(recoveries.length, 28, "nested recovery vector count");
const signupLimitCase = recoveries.find(({ id }) => id === "signup-limit-last-slot-atomic");
assertEqual(signupLimitCase?.operationId, undefined, "signup limit recovery inherits operation");
assertEqual(signupLimitCase?.expected?.created, 1, "signup limit sample created count");
assertEqual(signupLimitCase?.expected?.limitReached, 1, "signup limit sample rejection count");
assertEqual(signupLimitCase?.expected?.minimumRun?.created, 1, "signup limit live created count");
assertEqual(signupLimitCase?.expected?.minimumRun?.limitReached, 49, "signup limit live rejection count");
assertEqual(signupLimitCase?.expected?.resetsAt, "2026-08-01T00:00:00Z", "signup limit reset time");
const registrationRollback = recoveries.find(
  ({ id }) => id === "registration-completion-rollback",
);
assertEqual(registrationRollback?.expected?.finalUserCardinality, 0, "registration rollback users");
assertEqual(
  registrationRollback?.expected?.finalVerificationCardinality,
  0,
  "registration rollback verifications",
);
assertEqual(
  registrationRollback?.expected?.finalOutboxCardinality,
  0,
  "registration rollback outbox",
);
assertEqual(
  registrationRollback?.expected?.finalSignupLimitUsed,
  98,
  "registration rollback signup-limit usage",
);
const registrationReplay = recoveries.find(
  ({ id }) => id === "registration-completion-response-lost-replay",
);
assertEqual(registrationReplay?.expected?.finalUserCardinality, 1, "registration replay users");
assertEqual(
  registrationReplay?.expected?.finalVerificationCardinality,
  1,
  "registration replay verifications",
);
assertEqual(registrationReplay?.expected?.finalOutboxCardinality, 1, "registration replay outbox");
assertEqual(
  registrationReplay?.expected?.finalSignupLimitUsed,
  99,
  "registration replay signup-limit usage",
);
assertEqual(
  registrationReplay?.expected?.finalSideEffectCount,
  1,
  "registration replay side effects",
);

const guestDb = readFileSync("server-wasm/src/host/db/batch/operation.rs", "utf8");
for (const id of contract.conditionalMutations.map(({ id }) => id)) {
  if (!guestDb.includes(`\"${id}\"`)) throw new Error(`guest enum is missing ${id}`);
}

console.log(
  `Cedros database concurrency contracts passed (v1 immutable: 6 ops; v2: ${contract.conditionalMutations.length} conditionals, ${scenarios.size} scenarios, ${recoveries.length} recoveries, ${wireSchemas.size} guest wire examples)`,
);

function validateOperation(operation, models) {
  assertSafeId(operation.id, "operation id");
  if (operationIds.has(operation.id)) throw new Error(`duplicate operation id ${operation.id}`);
  operationIds.add(operation.id);
  const allowed = modelsByAccess.get(operation.accessId);
  if (!allowed) throw new Error(`${operation.id} references unknown access ${operation.accessId}`);
  assertArray(models, `${operation.id}.models`);
  for (const model of models) {
    if (!allowed.has(model)) throw new Error(`${operation.id} references undeclared ${model}`);
  }
}

function validateTokenEmailExample(params) {
  const verification = params?.verification;
  const outbox = params?.outbox;
  assertEqual(verification?.entryKey, verification?.data?.id, "token email verification identity");
  assertEqual(outbox?.entryKey, outbox?.data?.id, "token email outbox identity");
  assertEqual(verification?.data?.userId, outbox?.data?.userId, "token email user binding");
  assertEqual(
    verification?.data?.targetEmail?.toLowerCase(),
    outbox?.data?.to?.toLowerCase(),
    "token email recipient binding",
  );
  if (Date.parse(verification.data.createdAt) >= Date.parse(verification.data.expiresAt)) {
    throw new Error("token email guest token must be live after creation");
  }
}

function validateVector(vector, label) {
  assertArray(vector.attempts, `${label}.attempts`);
  assertEqual(vector.attempts.length, 2, `${label}.sample attempts`);
  const invalidRequests = vector.expected.invalidRequests ?? 0;
  assertEqual(
    vector.expected.committed + vector.expected.conflicts + invalidRequests,
    2,
    `${label}.sample outcomes`,
  );
  const run = vector.expected.minimumRun ?? {
    committed: vector.expected.committed,
    conflicts: fixture.minimumConcurrentAttempts - vector.expected.committed - invalidRequests,
    invalidRequests,
  };
  assertEqual(
    run.committed + run.conflicts + (run.invalidRequests ?? 0),
    fixture.minimumConcurrentAttempts,
    `${label}.live outcomes`,
  );
  if (vector.expected.conflicts > 0) {
    if (!/^cedros\.db\.v1\|(unique|precondition|lease)\|[a-z0-9._:-]+$/.test(vector.expected.conflictMarker ?? "")) {
      throw new Error(`${label}.conflictMarker is invalid`);
    }
  }
  if (invalidRequests > 0) {
    assertEqual(vector.expected.invalidCode, "invalid_request", `${label}.invalidCode`);
  }
}

function assertSchema(value, label) {
  if (!value || typeof value !== "object") throw new Error(`${label} must be a JSON Schema`);
  if (!value.$ref && value.type !== "object") throw new Error(`${label} must define object or $ref`);
}
function readJson(path) { return JSON.parse(readFileSync(path, "utf8")); }
function sha256(path) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
function assertSafeId(value, label) {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9._:-]+$/.test(value)) throw new Error(`${label} is unsafe`);
}
function assertArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be non-empty`);
}
function assertUnique(values, label) {
  if (new Set(values).size !== values.length) throw new Error(`${label} must be unique`);
}
function assertSetEqual(actual, expected, label) {
  assertArray(actual, label);
  if (actual.length !== expected.length || expected.some((value) => !actual.includes(value))) throw new Error(`${label} mismatch`);
}
function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`);
}
