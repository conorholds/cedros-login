#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const manifest = readJson('cedros-extension.manifest.json');
const bootstrap = readJson('cedros-extension.bootstrap.json');
const publicPages = readJson('docs/cedros-public-pages-map.json');

const AUTH_NOINDEX_ROUTES = new Set([
  '/login',
  '/register',
  '/password-recovery',
  '/reset-password',
  '/verify-email',
  '/instant-link/verify',
  '/accept-invite',
  '/profile',
]);

assertDeepEqual(manifest, bootstrap.manifest, 'bootstrap manifest');
assertEqual(publicPages.extensionId, manifest.extensionId, 'public pages extensionId');
assertEqual(publicPages.version, manifest.version, 'public pages version');
if (!/auto-create.*editable.*page rows.*publish.*on enable/i.test(publicPages.contentRowPolicy?.installBehavior ?? '')) {
  throw new Error('public page seeds must auto-create and publish editable Cedros platform page rows on enable');
}

const pageSeeds = manifest.pageSeeds ?? [];
if (!pageSeeds.length) throw new Error('manifest must declare pageSeeds per 13-public-pages-and-seo.md');

const routeIds = new Set(manifest.surfaces?.web?.routeIds ?? []);
const pageSeedIds = new Set();
const normalizedRoutes = new Set();
const templateIds = new Set(manifest.surfaces?.web?.templateIds ?? []);
for (const template of manifest.contentTemplates ?? []) {
  templateIds.add(template.id);
}

for (const seed of pageSeeds) {
  assertNamespaced(seed.id, manifest.extensionId, 'page seed id');
  if (pageSeedIds.has(seed.id)) throw new Error(`duplicate page seed id ${seed.id}`);
  pageSeedIds.add(seed.id);
  if (!routeIds.has(seed.id)) throw new Error(`missing surfaces.web.routeIds entry for ${seed.id}`);
  for (const field of ['displayName', 'title', 'routePath']) {
    if (!seed[field]) throw new Error(`${seed.id} missing ${field}`);
  }
  if (!seed.routePath.startsWith('/')) {
    throw new Error(`${seed.id} routePath must be absolute`);
  }
  const normalized = normalizeRoute(seed.routePath);
  if (normalizedRoutes.has(normalized)) throw new Error(`duplicate normalized route ${normalized}`);
  normalizedRoutes.add(normalized);
  if (!seed.templateId) throw new Error(`${seed.id} must declare templateId`);
  if (seed.templateId !== 'page-default' && !templateIds.has(seed.templateId)) {
    throw new Error(`${seed.id} references unresolved templateId ${seed.templateId}`);
  }
  if (seed.autoCreateOnEnable !== true || seed.publishOnEnable !== true) {
    throw new Error(
      `${seed.id} must set autoCreateOnEnable=true and publishOnEnable=true so the public URL is live after install`,
    );
  }
  validateSeedSeo(seed, normalized);
}

for (const id of routeIds) {
  if (!pageSeedIds.has(id)) throw new Error(`web route id ${id} is not a page seed id`);
}

if (pageSeeds.some((seed) => normalizeRoute(seed.routePath) === '/account')) {
  throw new Error('Cedros Login must not declare the Cedros Shop-owned /account page route');
}
const profileSeeds = pageSeeds.filter((seed) => normalizeRoute(seed.routePath) === '/profile');
if (profileSeeds.length !== 1) {
  throw new Error(`Cedros Login must declare exactly one /profile page seed, got ${profileSeeds.length}`);
}
assertEqual(profileSeeds[0].id, 'cedros-login:public-profile-page', 'stable /profile page seed id');

const mappedSeedsById = new Map((publicPages.pageSeeds ?? []).map((seed) => [seed.id, seed]));
const mappedIds = new Set(mappedSeedsById.keys());
for (const id of pageSeedIds) {
  if (!mappedIds.has(id)) throw new Error(`docs map missing page seed ${id}`);
}
for (const seed of pageSeeds) {
  if (!AUTH_NOINDEX_ROUTES.has(normalizeRoute(seed.routePath))) continue;
  const mappedSeed = mappedSeedsById.get(seed.id);
  if (mappedSeed?.seo?.noindex !== true) {
    throw new Error(`docs map page seed ${seed.id} must mirror seo.noindex=true`);
  }
}

console.log('cedros public pages validation passed');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function normalizeRoute(path) {
  return `/${path.split('/').filter(Boolean).join('/')}`.replace(/\/$/, '') || '/';
}

function validateSeedSeo(seed, normalizedRoute) {
  const seo = seed.seo ?? {};
  if (AUTH_NOINDEX_ROUTES.has(normalizedRoute) && seo.noindex !== true) {
    throw new Error(`${seed.id} must set seo.noindex=true for auth-sensitive route ${normalizedRoute}`);
  }
  if (seo.canonicalPath && !isSameOriginAbsolutePath(seo.canonicalPath)) {
    throw new Error(`${seed.id} seo.canonicalPath must be a same-origin absolute path`);
  }
  if (seo.ogImage && !isAbsoluteUrl(seo.ogImage) && !isSameOriginAbsolutePath(seo.ogImage)) {
    throw new Error(`${seed.id} seo.ogImage must be an absolute URL or same-origin absolute path`);
  }
}

function isSameOriginAbsolutePath(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
}

function isAbsoluteUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function assertNamespaced(id, extensionId, label) {
  if (!id.startsWith(`${extensionId}:`)) {
    throw new Error(`${label} ${id} must be namespaced with ${extensionId}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} expected ${expected}, got ${actual}`);
}

function assertDeepEqual(actual, expected, label) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) throw new Error(`${label} mismatch`);
}
