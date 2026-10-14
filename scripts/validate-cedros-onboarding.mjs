#!/usr/bin/env node
import {
  assertDeepEqual,
  assertEqual,
  assertNamespaced,
  assertSetEqual,
  readJson,
} from './cedros-validation-helpers.mjs';

const manifest = readJson('cedros-extension.manifest.json');
const bootstrap = readJson('cedros-extension.bootstrap.json');
const onboarding = readJson('docs/cedros-onboarding-flow-map.json');

assertDeepEqual(manifest, bootstrap.manifest, 'bootstrap manifest');
assertEqual(onboarding.extensionId, manifest.extensionId, 'onboarding extensionId');
assertEqual(onboarding.version, manifest.version, 'onboarding version');

const pages = manifest.onboardingPages ?? [];
if (!pages.length) {
  if ((onboarding.onboardingPages ?? []).length) {
    throw new Error('docs map declares onboarding pages that are absent from the manifest');
  }
  console.log('cedros onboarding validation passed');
  process.exit(0);
}
assertSetEqual(new Set(onboarding.onboardingPages.map((page) => page.id)), new Set(pages.map((page) => page.id)), 'docs map onboarding ids');

const modules = new Map((manifest.adminModules ?? []).map((module) => [module.moduleId, module]));
const seen = new Set();
for (const page of pages) {
  assertNamespaced(page.id, manifest.extensionId, 'onboarding page id');
  if (seen.has(page.id)) throw new Error(`duplicate onboarding page id ${page.id}`);
  seen.add(page.id);
  if (!page.displayName || !page.moduleId || !page.sectionId) throw new Error(`${page.id} missing required metadata`);
  const module = modules.get(page.moduleId);
  if (!module) throw new Error(`${page.id} targets missing admin module ${page.moduleId}`);
  if (!(module.sectionIds ?? []).includes(page.sectionId)) {
    throw new Error(`${page.id} targets missing admin section ${page.sectionId}`);
  }
}

for (const page of onboarding.onboardingPages) {
  const manifestPage = pages.find((candidate) => candidate.id === page.id);
  assertEqual(page.moduleId, manifestPage.moduleId, `${page.id} moduleId`);
  assertEqual(page.sectionId, manifestPage.sectionId, `${page.id} sectionId`);
  if (!page.completionCriteria || !page.blockedState) throw new Error(`${page.id} missing runtime guidance`);
}

console.log('cedros onboarding validation passed');
