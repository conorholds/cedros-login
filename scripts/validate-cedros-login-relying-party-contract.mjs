#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateSchemaValue } from "./lib/validate-json-schema-subset.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);
const contract = readJson(
  "contracts/host/cedros-login-relying-party-identity-contract.v1.json",
);
const fixture = readJson(contract.fixture);
const manifest = readJson("cedros-extension.manifest.json");
const schemas = Object.fromEntries(
  Object.entries(contract.schemas).map(([name, path]) => [
    name,
    executableSchema(readJson(path)),
  ]),
);

assertEqual(contract.schemaVersion, 1, "contract schema version");
assertEqual(
  contract.contractId,
  "cedros-login:relying-party-identity:v1",
  "contract id",
);
assertEqual(contract.owner, "cedros-login", "contract owner");
assertEqual(
  contract.releaseVersion,
  manifest.version,
  "contract release version",
);
assertEqual(fixture.contractId, contract.contractId, "fixture contract id");

const routeIds = new Set(manifest.surfaces.server.routes);
for (const route of Object.values(contract.routes)) {
  if (!routeIds.has(route.routeId))
    throw new Error(`manifest is missing ${route.routeId}`);
}
assertEqual(
  contract.routes.introspection.requiredScope,
  "session:introspect",
  "introspection scope",
);
assertEqual(
  contract.routes.directoryUser.requiredScope,
  "users:read",
  "directory scope",
);
assertEqual(
  contract.routes.directoryUser.emailScope,
  "users:email:read",
  "email scope",
);
assertEqual(
  contract.routes.directoryCount.requiredScope,
  "users:count",
  "count scope",
);

validateSchemaValue(
  fixture.introspection.active,
  schemas.introspection,
  schemas.introspection,
  "active introspection",
);
validateSchemaValue(
  fixture.introspection.inactive,
  schemas.introspection,
  schemas.introspection,
  "inactive introspection",
);
for (const [name, user] of Object.entries({
  active: fixture.directory.active,
  suspendedWithEmail: fixture.directory.suspendedWithEmail,
})) {
  validateSchemaValue(
    user,
    schemas.directoryUser,
    schemas.directoryUser,
    `directory.${name}`,
  );
  assertEqual(user.userId, user.id, `directory.${name} legacy id alias`);
}
validateSchemaValue(
  fixture.directory.count,
  schemas.directoryCount,
  schemas.directoryCount,
  "directory.count",
);
assertEqual(
  fixture.directory.count.count,
  fixture.directory.count.total,
  "count alias",
);

const inactiveKeys = Object.keys(fixture.introspection.inactive);
assertEqual(inactiveKeys.length, 1, "inactive response field count");
assertEqual(inactiveKeys[0], "active", "inactive response only field");
for (const field of contract.routes.directoryUser.privateFields) {
  for (const user of [
    fixture.directory.active,
    fixture.directory.suspendedWithEmail,
  ]) {
    if (Object.hasOwn(user, field))
      throw new Error(`directory fixture leaks private field ${field}`);
  }
}
if (
  !contract.routes.introspection.freshness.includes("current Login session")
) {
  throw new Error("introspection must bind current mutable Login state");
}
for (const route of Object.values(contract.routes)) {
  if (!route.tenantBoundary?.toLowerCase().includes("org")) {
    throw new Error(`${route.routeId} must document its organization boundary`);
  }
}

console.log("Cedros Login relying-party identity v1 contract passed");

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
  return JSON.parse(readFileSync(absolute, "utf8"));
}

function assertEqual(actual, expected, label) {
  if (actual !== expected)
    throw new Error(`${label} expected ${expected}, got ${actual}`);
}
