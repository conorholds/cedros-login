#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const manifest = readJson('cedros-extension.manifest.json');
const dashboard = readJson('docs/cedros-dashboard-cards-map.json');

assertEqual(dashboard.extensionId, manifest.extensionId, 'dashboard cards extensionId');
assertEqual(dashboard.version, manifest.version, 'dashboard cards version');

const manifestCards = (manifest.adminModules ?? []).flatMap((module) =>
  (module.contributions?.dashboardCards ?? []).map((card) => ({
    ...card,
    moduleId: module.moduleId,
  }))
);
validateCoverage(dashboard.cards, manifestCards, 'id', 'dashboard cards');

const adminSectionIds = new Set((manifest.adminModules ?? []).flatMap((module) => module.sectionIds ?? []));
const adminModuleIds = new Set((manifest.adminModules ?? []).map((module) => module.moduleId));
for (const card of dashboard.cards ?? []) {
  validateCard(card, manifestCards.find((manifestCard) => manifestCard.id === card.id));
  if (!adminModuleIds.has(card.actionTarget.moduleId)) {
    throw new Error(`${card.id} action target module is missing from manifest`);
  }
  if (!adminSectionIds.has(card.actionTarget.sectionId)) {
    throw new Error(`${card.id} action target section is missing from manifest`);
  }
}

console.log('cedros dashboard cards validation passed');

function validateCard(card, manifestCard) {
  if (!manifestCard) throw new Error(`${card.id} missing manifest card metadata`);
  for (const field of ['id', 'moduleId', 'displayName', 'description', 'order', 'runtimeComponent']) {
    if (card[field] === undefined || card[field] === '') throw new Error(`${card.id} missing ${field}`);
  }
  assertEqual(card.moduleId, manifestCard.moduleId, `${card.id} moduleId`);
  assertEqual(card.displayName, manifestCard.displayName, `${card.id} displayName`);
  assertEqual(card.description, manifestCard.description, `${card.id} description`);
  assertEqual(card.order, manifestCard.order, `${card.id} order`);
  for (const state of ['loading', 'empty', 'error', 'disabled', 'happy']) {
    if (!card.states?.includes(state)) throw new Error(`${card.id} missing ${state} state`);
  }
  if (!card.requiredPermissions?.length) throw new Error(`${card.id} missing required permissions`);
  if (!card.redactionRules?.length) throw new Error(`${card.id} missing redaction rules`);
}

function validateCoverage(actualItems = [], expectedItems = [], idKey, label) {
  const actualIds = actualItems.map((item) => item[idKey]);
  const expectedIds = expectedItems.map((item) => item[idKey]);
  assertUnique(actualIds, label);
  for (const id of expectedIds) {
    if (!actualIds.includes(id)) throw new Error(`${label} missing ${id}`);
  }
  for (const id of actualIds) {
    if (!expectedIds.includes(id)) throw new Error(`${label} includes undeclared id ${id}`);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
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
