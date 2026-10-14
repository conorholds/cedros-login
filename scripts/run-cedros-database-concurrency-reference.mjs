#!/usr/bin/env node
import { readFileSync } from "node:fs";

const fixture = JSON.parse(readFileSync("contracts/fixtures/cedros-database-concurrency-v2.json", "utf8"));
const tokenEmailPurposes = new Set([
  "email_verification",
  "account_email_verify",
  "password_reset",
  "instant_link",
  "account_deletion",
]);

const minimumAttempts = fixture.minimumConcurrentAttempts;
let vectorCount = 0;
for (const scenario of fixture.scenarios) {
  await verifyScenario(scenario);
  vectorCount += 1;
  for (const recovery of scenario.recoveryCases ?? []) {
    await verifyScenario({
      operationId: scenario.operationId,
      ...recovery,
      kind: recovery.kind ?? scenario.kind,
    });
    vectorCount += 1;
  }
}

console.log(`Cedros database concurrency model-only reference passed (${vectorCount} vectors, ${minimumAttempts} serialized attempts each; live-host concurrency remains required)`);

async function verifyScenario(scenario) {
  const result = await runScenario(scenario, minimumAttempts);
  const minimumRun = scenario.expected.minimumRun ?? {
    committed: scenario.expected.committed,
    conflicts:
      minimumAttempts - scenario.expected.committed - (scenario.expected.invalidRequests ?? 0),
    invalidRequests: scenario.expected.invalidRequests ?? 0,
  };
  assertEqual(result.committed, minimumRun.committed, `${scenario.id}.committed`);
  assertEqual(result.conflicts, minimumRun.conflicts, `${scenario.id}.conflicts`);
  assertEqual(
    result.invalidRequests,
    minimumRun.invalidRequests ?? 0,
    `${scenario.id}.invalidRequests`,
  );
  if ("finalCardinality" in scenario.expected) {
    assertEqual(result.finalCardinality, scenario.expected.finalCardinality, `${scenario.id}.finalCardinality`);
  }
  if ("finalState" in scenario.expected) {
    assertEqual(result.finalState, scenario.expected.finalState, `${scenario.id}.finalState`);
  }
  if ("finalStatePrefix" in scenario.expected && !result.finalState.startsWith(scenario.expected.finalStatePrefix)) {
    throw new Error(`${scenario.id}.finalState must start with ${scenario.expected.finalStatePrefix}`);
  }
  if ("finalUsesCount" in scenario.expected) {
    const usesCount = stateCount(result, scenario, "usesCount");
    assertEqual(usesCount, scenario.expected.finalUsesCount, `${scenario.id}.finalUsesCount`);
  }
  if ("finalDependentCardinality" in scenario.expected) {
    assertEqual(
      result.finalDependentCardinality,
      scenario.expected.finalDependentCardinality,
      `${scenario.id}.finalDependentCardinality`,
    );
  }
  if ("finalSideEffectCount" in scenario.expected) {
    assertEqual(result.finalSideEffectCount, scenario.expected.finalSideEffectCount, `${scenario.id}.finalSideEffectCount`);
  }
  if ("finalRedemptionId" in scenario.expected) {
    assertEqual(result.finalRedemptionId, scenario.expected.finalRedemptionId, `${scenario.id}.finalRedemptionId`);
  }
  if ("finalInviteCodeId" in scenario.expected) {
    assertEqual(result.finalInviteCodeId, scenario.expected.finalInviteCodeId, `${scenario.id}.finalInviteCodeId`);
  }
  if ("finalVerificationCardinality" in scenario.expected) {
    assertEqual(
      result.finalVerificationCardinality,
      scenario.expected.finalVerificationCardinality,
      `${scenario.id}.finalVerificationCardinality`,
    );
  }
  if ("finalUserCardinality" in scenario.expected) {
    assertEqual(
      result.finalUserCardinality,
      scenario.expected.finalUserCardinality,
      `${scenario.id}.finalUserCardinality`,
    );
  }
  if ("finalOutboxCardinality" in scenario.expected) {
    assertEqual(
      result.finalOutboxCardinality,
      scenario.expected.finalOutboxCardinality,
      `${scenario.id}.finalOutboxCardinality`,
    );
  }
  if ("finalEvidenceCardinality" in scenario.expected) {
    assertEqual(
      result.finalEvidenceCardinality,
      scenario.expected.finalEvidenceCardinality,
      `${scenario.id}.finalEvidenceCardinality`,
    );
  }
  if ("finalSignupLimitUsed" in scenario.expected) {
    assertEqual(
      result.finalSignupLimitUsed,
      scenario.expected.finalSignupLimitUsed,
      `${scenario.id}.finalSignupLimitUsed`,
    );
  }
  if ("created" in minimumRun) {
    assertEqual(result.created, minimumRun.created, `${scenario.id}.created`);
  }
  if ("limitReached" in minimumRun) {
    assertEqual(result.limitReached, minimumRun.limitReached, `${scenario.id}.limitReached`);
  }
}

function stateCount(result, scenario, field) {
  return result[field] ?? scenario.expected[field === "usesCount" ? "finalUsesCount" : field];
}

async function runScenario(scenario, attemptCount) {
  const state = structuredClone(scenario.initial);
  let transactionTail = Promise.resolve();
  const transact = (attempt) => {
    const result = transactionTail.then(() => applyAttempt(scenario, state, attempt));
    transactionTail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };
  const attempts = Array.from({ length: attemptCount }, (_, index) => scenario.attempts[index % scenario.attempts.length]);
  const settled = await Promise.allSettled(attempts.map(transact));
  const expectedMarker = scenario.expected.conflictMarker ?? defaultMarker(scenario);
  for (const item of settled) {
    if (item.status !== "rejected") continue;
    if (item.reason?.kind === "invalid_request") {
      if (item.reason?.message !== scenario.expected.invalidCode) {
        throw new Error(
          `${scenario.id}.invalidCode: expected ${scenario.expected.invalidCode}, received ${item.reason?.message}`,
        );
      }
    } else if (item.reason?.message !== expectedMarker) {
      throw new Error(
        `${scenario.id}.marker: expected ${expectedMarker}, received ${item.reason?.message}`,
      );
    }
  }
  const result = {
    committed: settled.filter(({ status }) => status === "fulfilled").length,
    conflicts: settled.filter(
      (item) => item.status === "rejected" && item.reason?.kind !== "invalid_request",
    ).length,
    invalidRequests: settled.filter(
      (item) => item.status === "rejected" && item.reason?.kind === "invalid_request",
    ).length,
  };
  if (state.claimedKeys) result.finalCardinality = state.claimedKeys.length;
  if (state.members) result.finalCardinality = state.members.length;
  if (state.state) result.finalState = state.state;
  if (state.usesCount !== undefined) result.usesCount = state.usesCount;
  if (state.dependentCardinality !== undefined) {
    result.finalDependentCardinality = state.dependentCardinality;
  }
  if (state.sideEffectCount !== undefined) result.finalSideEffectCount = state.sideEffectCount;
  if (state.redemptionId !== undefined) result.finalRedemptionId = state.redemptionId;
  if (state.inviteCodeId !== undefined) result.finalInviteCodeId = state.inviteCodeId;
  if (state.verificationIds) result.finalVerificationCardinality = state.verificationIds.length;
  if (state.userIds) result.finalUserCardinality = state.userIds.length;
  if (state.outboxIds) result.finalOutboxCardinality = state.outboxIds.length;
  if (state.evidenceReferences) result.finalEvidenceCardinality = state.evidenceReferences.length;
  if (state.created !== undefined) result.created = state.created;
  if (state.limitReached !== undefined) result.limitReached = state.limitReached;
  if (state.used !== undefined) result.finalSignupLimitUsed = state.used;
  return result;
}

function applyAttempt(scenario, state, attempt) {
  switch (scenario.kind) {
    case "unique-claim": {
      const [, key] = attempt.split(":", 2);
      if (state.claimedKeys.includes(key)) throw conflict(scenario);
      state.claimedKeys.push(key);
      return;
    }
    case "single-transition": {
      const [expected, next] = attempt.split("->", 2);
      if (state.state !== expected) throw conflict(scenario);
      state.state = next;
      return;
    }
    case "cascade-transition": {
      const [expected, next] = attempt.split("->", 2);
      if (state.state !== expected) throw conflict(scenario);
      state.state = next;
      state.dependentCardinality = 0;
      return;
    }
    case "exclusive-redemption":
      if (state.state !== "pending") throw conflict(scenario);
      state.state = "activated";
      state.redemptionId = attempt;
      state.usesCount += 1;
      return;
    case "idempotent-redemption":
      if (state.redemptionId === attempt) return;
      if (state.state !== "pending") throw conflict(scenario);
      state.state = "activated";
      state.redemptionId = attempt;
      state.usesCount += 1;
      return;
    case "always-conflict":
      throw conflict(scenario);
    case "minimum-cardinality-removal":
      if (!state.members.includes(attempt) || state.members.length <= state.minimum) {
        throw conflict(scenario);
      }
      state.members = state.members.filter((member) => member !== attempt);
      return;
    case "idempotent-transition":
      if (state.receiptId === attempt) return;
      if (state.receiptId !== null) throw conflict(scenario);
      state.receiptId = attempt;
      state.state = "completed";
      state.sideEffectCount += 1;
      return;
    case "competing-gate-activation":
      if (state.state !== "pending" || state.revision !== 1) throw conflict(scenario);
      if (attempt === "redeem") {
        state.state = "activated:redeemed";
        state.redemptionId = "redemption-1";
        state.inviteCodeId = "invite-1";
      } else if (attempt === "release") {
        state.state = "activated:released";
      } else {
        throw new Error(`unknown gate activation ${attempt}`);
      }
      state.revision += 1;
      return;
    case "idempotent-gate-release":
      if (!state.state.startsWith("activated:") || attempt !== "release") throw conflict(scenario);
      return;
    case "delete-guard-race":
      if (attempt === "delete" && state.state === "active") {
        state.state = "deleted:tombstoned";
        return;
      }
      throw conflict(scenario);
    case "token-email-enqueue": {
      const validRequest = attempt
        && typeof attempt === "object"
        && isUuid(attempt.verificationId)
        && isUuid(attempt.outboxId)
        && typeof attempt.userId === "string"
        && attempt.userId.length > 0
        && attempt.userId === attempt.outboxUserId
        && tokenEmailPurposes.has(attempt.tokenPurpose)
        && typeof attempt.targetEmail === "string"
        && typeof attempt.recipient === "string"
        && attempt.targetEmail.toLowerCase() === attempt.recipient.toLowerCase()
        && attempt.tokenState === "live"
        && attempt.outboxState === "initial";
      if (!validRequest) throw invalidRequest();
      const identitiesAvailable = !state.verificationIds.includes(attempt.verificationId)
        && !state.outboxIds.includes(attempt.outboxId)
        && !state.evidenceReferences.includes(attempt.outboxId);
      if (!identitiesAvailable) throw conflict(scenario);
      // Validate every precondition before changing any collection: duplicate
      // token, outbox or receipt identities must leave all three unchanged.
      state.verificationIds.push(attempt.verificationId);
      state.outboxIds.push(attempt.outboxId);
      state.evidenceReferences.push(attempt.outboxId);
      return;
    }
    case "signup-limit-last-slot":
      if (state.used >= state.limit) {
        state.limitReached += 1;
        return;
      }
      state.used += 1;
      state.created += 1;
      state.state = "one-account-created:signup-limit-used-100";
      return;
    case "signup-limit-status":
      if (attempt !== "read-status" || state.used > state.limit) throw invalidRequest();
      return;
    default:
      throw new Error(`unknown scenario kind ${scenario.kind}`);
  }
}

function invalidRequest() {
  const error = new Error("invalid_request");
  error.kind = "invalid_request";
  return error;
}

function isUuid(value) {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
}

function conflict(scenario) {
  const error = new Error(scenario.expected.conflictMarker ?? defaultMarker(scenario));
  error.kind = "conflict";
  return error;
}

function defaultMarker(scenario) {
  const category = scenario.kind === "unique-claim"
    ? "unique"
    : scenario.operationId?.includes("outbox") ? "lease" : "precondition";
  return `cedros.db.v1|${category}|${scenario.operationId ?? "reference-operation"}`;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`);
}
