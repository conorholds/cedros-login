#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateRawSync } from 'node:zlib';
import {
  assertTextEntry,
  countsTowardTextTotal,
  entryByteLimit,
  intakeLimits as limits,
  sourceReviewLimits,
  validateArchivePath,
} from './cedros-archive-limits.mjs';
import { validateForbiddenArchiveReferences } from './cedros-package-forbidden-references.mjs';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);

// Bare modules the cedros-data extension runtime loader shims at load time
// (ui/src/admin/extensionRuntimeArchiveLoader.ts in cedros-data). Any other
// bare import anywhere in the compiled runtime graph throws "is not bundled"
// in the host, the chunk graph fails to load, and the surface renders blank.
const HOST_SHIMMED_BARE_IMPORTS = new Set([
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'cedros:admin',
]);
// Surface entry points the host loads from the archive.
const RUNTIME_ENTRY_PATHS = [
  'workspace/react/dist/admin/register.js',
  'workspace/react/dist/web/register.js',
];
// Same specifier pattern the host loader uses to rewrite imports.
const RUNTIME_IMPORT_SPECIFIER_PATTERN = /(\bfrom\s*["']|import\s*\(\s*["']|import\s+["'])([^"']+)(["'])/g;
// Shape of a real bundler-emitted bare module id. Regex matches inside string
// literals (e.g. `"...path from ", e, "..."` in the qrcode chunk) produce
// "specifiers" with spaces/commas that no real import has.
const BARE_MODULE_ID_PATTERN = /^(@[\w.-]+\/)?[\w.-]+(\/[\w.-]+)*$/;

const manifest = readJson('cedros-extension.manifest.json');
const bootstrap = readJson('cedros-extension.bootstrap.json');
const packageArchive = readJson('docs/cedros-package-archive-map.json');
const releasePath = `dist/${manifest.extensionId}-${manifest.version}.release.json`;
if (!existsSync(resolve(repoRoot, releasePath))) {
  throw new Error(`missing release packet ${releasePath}; run node scripts/package-cedros-extension.mjs`);
}

const releasePacket = readJson(releasePath);
const archivePath = releasePacket.archive?.path;
if (!archivePath || !existsSync(resolve(repoRoot, archivePath))) {
  throw new Error(`missing archive ${archivePath ?? '(not declared)'}`);
}

const archiveBytes = readBytes(archivePath);
const archiveSha256 = sha256(archiveBytes);
if (archiveSha256 !== releasePacket.archive.sha256) throw new Error('release packet archive sha256 mismatch');
if (archiveBytes.length !== releasePacket.archive.bytes) throw new Error('release packet archive byte size mismatch');
if (archiveBytes.length > limits.maxZipBytes) throw new Error('archive exceeds browser intake size limit');

const entries = readZipEntries(Buffer.from(archiveBytes), limits);
validateEntrySet(entries, limits);
validateForbiddenArchiveReferences(entries);
validateCanonicalJson(entries, manifest, bootstrap);
validatePackageEntries(entries, manifest, { allowReactDist: true });
validateRuntimeBareImports(entries);
validateAdminRuntimeConstraints(entries);
validateArchiveMapCoverage(entries, packageArchive);
validateSourceReviewArchive(releasePacket);
validateReleasePacket(releasePacket, manifest);

console.log('cedros package archive validation passed');

function readZipEntries(buffer, entryLimits) {
  const eocdOffset = findEocd(buffer);
  const count = buffer.readUInt16LE(eocdOffset + 10);
  const centralOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = [];
  let cursor = centralOffset;
  for (let index = 0; index < count; index += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) throw new Error('invalid central directory entry');
    const entry = readCentralEntry(buffer, cursor);
    entries.push(entry);
    cursor += 46 + entry.nameLength + entry.extraLength + entry.commentLength;
  }
  return entries.map((entry) => ({
    ...entry,
    data: readLocalData(buffer, entry, entryByteLimit(entry.name, entryLimits)),
  }));
}

function readCentralEntry(buffer, cursor) {
  const nameLength = buffer.readUInt16LE(cursor + 28);
  const extraLength = buffer.readUInt16LE(cursor + 30);
  const commentLength = buffer.readUInt16LE(cursor + 32);
  return {
    method: buffer.readUInt16LE(cursor + 10),
    compressedSize: buffer.readUInt32LE(cursor + 20),
    uncompressedSize: buffer.readUInt32LE(cursor + 24),
    externalAttrs: buffer.readUInt32LE(cursor + 38),
    localOffset: buffer.readUInt32LE(cursor + 42),
    nameLength,
    extraLength,
    commentLength,
    name: buffer.slice(cursor + 46, cursor + 46 + nameLength).toString('utf8'),
  };
}

function readLocalData(buffer, entry, maxEntryBytes) {
  if (entry.method !== 0 && entry.method !== 8) {
    throw new Error(`${entry.name} uses unsupported compression method ${entry.method}`);
  }
  if (buffer.readUInt32LE(entry.localOffset) !== 0x04034b50) throw new Error(`${entry.name} missing local header`);
  const localNameLength = buffer.readUInt16LE(entry.localOffset + 26);
  const localExtraLength = buffer.readUInt16LE(entry.localOffset + 28);
  const dataStart = entry.localOffset + 30 + localNameLength + localExtraLength;
  const dataEnd = dataStart + entry.compressedSize;
  const rawSlice = buffer.slice(dataStart, dataEnd);
  const data = entry.method === 8
    ? inflateRawSync(rawSlice, { maxOutputLength: maxEntryBytes + 1 })
    : rawSlice;
  if (data.length !== entry.uncompressedSize) {
    throw new Error(`${entry.name} has invalid uncompressed size`);
  }
  return data;
}

function validateEntrySet(entries, entryLimits) {
  if (entries.length > entryLimits.maxEntries) throw new Error('archive has too many entries');
  let totalBytes = 0;
  const seen = new Set();
  for (const entry of entries) {
    validateArchivePath(entry.name);
    if (seen.has(entry.name.toLowerCase())) throw new Error(`duplicate archive path ${entry.name}`);
    seen.add(entry.name.toLowerCase());
    if (entry.externalAttrs & 0xa0000000) throw new Error(`${entry.name} is a symlink`);
    const entryBytes = entry.data.length;
    if (entryBytes > entryByteLimit(entry.name, entryLimits)) {
      throw new Error(`${entry.name} exceeds entry limit`);
    }
    assertTextEntry(entry.name, entry.data);
    if (countsTowardTextTotal(entry.name)) totalBytes += entryBytes;
  }
  if (totalBytes > entryLimits.maxUncompressedBytes) throw new Error('archive exceeds uncompressed byte limit');
}

function validateCanonicalJson(entries, currentManifest, currentBootstrap) {
  const entryMap = new Map(entries.map((entry) => [entry.name, entry]));
  const manifestEntry = entryMap.get('cedros-extension.manifest.json');
  const bootstrapEntry = entryMap.get('cedros-extension.bootstrap.json');
  if (!manifestEntry) throw new Error('archive missing canonical manifest entry');
  if (!bootstrapEntry) throw new Error('archive missing canonical bootstrap entry');
  const archiveManifest = JSON.parse(manifestEntry.data.toString('utf8'));
  const archiveBootstrap = JSON.parse(bootstrapEntry.data.toString('utf8'));
  assertDeepEqual(archiveManifest, currentManifest, 'archive manifest');
  assertDeepEqual(archiveBootstrap, currentBootstrap, 'archive bootstrap');
  assertDeepEqual(archiveBootstrap.manifest, archiveManifest, 'archive bootstrap manifest');
}

function validatePackageEntries(entries, currentManifest, options = {}) {
  const { allowReactDist = false } = options;
  const entryMap = new Map(entries.map((entry) => [entry.name, entry.data.toString('utf8')]));
  const serverCargo = requiredEntry(entryMap, 'workspace/server/Cargo.toml');
  const reactPackage = JSON.parse(requiredEntry(entryMap, 'workspace/react/package.json'));
  const nativePackage = JSON.parse(requiredEntry(entryMap, 'workspace/react-native/package.json'));
  assertEqual(tomlValue(serverCargo, 'package', 'name'), currentManifest.packageFamily.server.packageName, 'server package name');
  assertEqual(tomlValue(serverCargo, 'package', 'version'), currentManifest.packageFamily.server.version, 'server package version');
  assertEqual(reactPackage.name, currentManifest.packageFamily.react.packageName, 'react package name');
  assertEqual(nativePackage.name, currentManifest.packageFamily.reactNative.packageName, 'native package name');
  if (!reactPackage.exports?.['./admin/register']) throw new Error('archive React package missing admin export');
  if (!reactPackage.exports?.['./web/register']) throw new Error('archive React package missing web export');
  if (!nativePackage.exports?.['./register']) throw new Error('archive native package missing register export');
  requiredEntry(entryMap, 'workspace/react/src/admin/register.ts');
  requiredEntry(entryMap, 'workspace/react/src/web/register.ts');
  requiredEntry(entryMap, 'workspace/react-native/src/register.ts');
  requiredEntry(entryMap, 'workspace/server/src/lib.rs');
  if (allowReactDist) {
    // Intake archive: compiled admin runtime must be present so Cedros Data
    // can hydrate adminModules[] without fetching anything.
    requiredEntry(entryMap, 'workspace/react/dist/admin/register.js');
    assertEqual(
      reactPackage.exports?.['./admin/register'],
      './dist/admin/register.js',
      "archive React package exports['./admin/register']",
    );
    assertEqual(
      reactPackage.exports?.['./web/register'],
      './dist/web/register.js',
      "archive React package exports['./web/register']",
    );
    assertEqual(
      nativePackage.exports?.['./register'],
      './dist/register.js',
      "archive native package exports['./register']",
    );
    validatePackageExportTargets(entryMap, nativePackage, 'workspace/react-native');
  }
  forbidEntries(entryMap, [
    ...(allowReactDist ? [] : [/^workspace\/(react|react-native)\/dist\//]),
    /^workspace\/(react|react-native)\/node_modules\//,
    /^workspace\/server\/target\//,
    /^workspace\/server\/vendor\//,
  ]);
}

function validatePackageExportTargets(entryMap, packageMetadata, packageRoot) {
  const pending = [packageMetadata.exports];
  while (pending.length > 0) {
    const value = pending.pop();
    if (typeof value === 'string') {
      if (!value.startsWith('./') || value.includes('*')) continue;
      requiredEntry(entryMap, `${packageRoot}/${value.slice(2)}`);
      continue;
    }
    if (value && typeof value === 'object') pending.push(...Object.values(value));
  }
}

function validateSourceReviewArchive(releasePacket) {
  const sourceReview = releasePacket.sourceReviewArchive;
  if (!sourceReview?.path) throw new Error('release packet missing sourceReviewArchive path');
  if (!existsSync(resolve(repoRoot, sourceReview.path))) {
    throw new Error(`missing source review archive ${sourceReview.path}`);
  }
  const archiveBytes = readBytes(sourceReview.path);
  if (sha256(archiveBytes) !== sourceReview.sha256) throw new Error('source review archive sha256 mismatch');
  if (archiveBytes.length !== sourceReview.bytes) throw new Error('source review archive byte size mismatch');
  if (archiveBytes.length > sourceReviewLimits.maxZipBytes) throw new Error('source review archive exceeds size limit');
  const sourceEntries = readZipEntries(Buffer.from(archiveBytes), sourceReviewLimits);
  if (sourceReview.entries !== sourceEntries.length) throw new Error('source review archive entry count mismatch');
  validateEntrySet(sourceEntries, sourceReviewLimits);
  validateForbiddenArchiveReferences(sourceEntries);
  validateCanonicalJson(sourceEntries, manifest, bootstrap);
  validatePackageEntries(sourceEntries, manifest);
}

// Walks the static + dynamic import graph of each runtime entry inside the
// archive. Static bare imports outside the host shim list are fatal: the host
// loader throws while resolving the chunk graph and the surface renders blank
// (this is how a stray `react-dom` import blanked the /account page). Dynamic
// bare imports are passed through by the host (allowExternalDynamicImports is
// true on both admin and public paths), so they warn instead of failing the build.
// Regex artifacts from ordinary strings are not graph edges and can be ignored.
function validateRuntimeBareImports(entries) {
  const entryMap = new Map(entries.map((entry) => [entry.name, entry.data.toString('utf8')]));
  const queue = [];
  for (const entryPath of RUNTIME_ENTRY_PATHS) {
    if (!entryMap.has(entryPath)) throw new Error(`archive missing runtime entry ${entryPath}`);
    queue.push(entryPath);
  }
  const visited = new Set();
  const warnings = [];
  while (queue.length > 0) {
    const path = queue.pop();
    if (visited.has(path)) continue;
    visited.add(path);
    if (!/\.(js|mjs)$/.test(path)) continue; // style/json leaves have no graph edges
    for (const match of entryMap.get(path).matchAll(RUNTIME_IMPORT_SPECIFIER_PATTERN)) {
      const [, prefix, specifier] = match;
      const isDynamic = /^import\s*\(/.test(prefix);
      if (!specifier.startsWith('.') && !specifier.startsWith('/')) {
        if (HOST_SHIMMED_BARE_IMPORTS.has(specifier)) continue;
        if (!BARE_MODULE_ID_PATTERN.test(specifier)) continue;
        if (isDynamic) {
          warnings.push(`${path}: dynamic bare import "${specifier}" passes the host loader but fails in browsers without an import map; keep it behind a runtime guard`);
          continue;
        }
        throw new Error(
          `runtime file ${path} statically imports bare module "${specifier}"; the cedros-data loader only shims ${[...HOST_SHIMMED_BARE_IMPORTS].join(', ')} - bundle it into the extension chunks instead`
        );
      }
      const resolved = resolveRuntimeImportPath(path, specifier, entryMap);
      if (!resolved) {
        throw new Error(`runtime import "${specifier}" from ${path} is missing in the archive`);
      }
      queue.push(resolved);
    }
  }
  for (const warning of warnings) console.warn(`runtime import warning: ${warning}`);
}

function validateAdminRuntimeConstraints(entries) {
  const entryMap = new Map(entries.map((entry) => [entry.name, entry.data.toString('utf8')]));
  const entryPath = RUNTIME_ENTRY_PATHS[0];
  const pending = [entryPath];
  const visited = new Set();
  const scriptElementPattern =
    /(?:document|window\.document|globalThis\.document)\s*\.\s*createElement\s*\(\s*(["'`])script\1/;

  while (pending.length > 0) {
    const path = pending.pop();
    if (visited.has(path)) continue;
    visited.add(path);
    if (!/\.(js|mjs)$/.test(path)) continue;

    const source = entryMap.get(path);
    if (scriptElementPattern.test(source)) {
      throw new Error(
        `ZIP-contained runtime file ${path} creates script elements, which is disabled for admin ZIP runtimes. Include executable code as static relative imports inside the ZIP runtime bundle.`
      );
    }

    for (const match of source.matchAll(RUNTIME_IMPORT_SPECIFIER_PATTERN)) {
      const specifier = match[2];
      if (!specifier.startsWith('.') && !specifier.startsWith('/')) continue;
      const resolved = resolveRuntimeImportPath(path, specifier, entryMap);
      if (!resolved) {
        throw new Error(`runtime import "${specifier}" from ${path} is missing in the archive`);
      }
      pending.push(resolved);
    }
  }
}

// Mirrors the host loader's relative resolution: join, drop "." segments,
// apply "..", then try the path plus .js/.mjs/index candidates.
function resolveRuntimeImportPath(fromPath, specifier, entryMap) {
  const segments = fromPath.split('/').slice(0, -1);
  for (const segment of specifier.split('/')) {
    if (segment.length === 0 || segment === '.') continue;
    if (segment === '..') segments.pop();
    else segments.push(segment);
  }
  const target = segments.join('/');
  return (
    [target, `${target}.js`, `${target}.mjs`, `${target}/index.js`, `${target}/index.mjs`].find(
      (candidate) => entryMap.has(candidate)
    ) ?? null
  );
}

function forbidEntries(entryMap, patterns) {
  for (const name of entryMap.keys()) {
    if (patterns.some((pattern) => pattern.test(name))) {
      throw new Error(`archive must not include build/cache path "${name}"`);
    }
  }
}

function validateArchiveMapCoverage(entries, archiveMap) {
  const expectedEntries = new Set([
      ...(archiveMap.canonicalEntries ?? []),
      archiveMap.workspaceEntries?.readme,
    ...Object.values(archiveMap.workspaceEntries ?? {})
      .flatMap((value) => (Array.isArray(value) ? value : [])),
  ].filter(Boolean));
  const actualEntries = new Set(entries.map((entry) => entry.name));
  for (const expectedEntry of expectedEntries) {
    if (!actualEntries.has(expectedEntry)) throw new Error(`archive missing mapped entry ${expectedEntry}`);
  }
  for (const actualEntry of actualEntries) {
    if (!expectedEntries.has(actualEntry)) throw new Error(`archive includes unmapped entry ${actualEntry}`);
  }
}

function validateReleasePacket(releasePacket, currentManifest) {
  assertEqual(releasePacket.extensionId, currentManifest.extensionId, 'release packet extensionId');
  assertEqual(releasePacket.version, currentManifest.version, 'release packet version');
  const status = releasePacket.supplyChainVerification?.status;
  const allowed = new Set(['not-provided', 'provided-unverified', 'source-unreachable', 'source-revision-matched', 'signed-source-verified', 'provenance-verified', 'sbom-present', 'artifact-signature-verified', 'rebuild-matched', 'verification-failed', 'not-applicable']);
  if (!allowed.has(status)) throw new Error(`invalid supplyChainVerification status ${status}`);
  if (currentManifest.supplyChain) verifySupplyChain(currentManifest);
  validateReleaseReadinessFields(releasePacket);
}

function validateReleaseReadinessFields(releasePacket) {
  const statuses = new Set(['ready', 'host-coordinated', 'deferred', 'blocked', 'metadata-only', 'not applicable']);
  if (!statuses.has(releasePacket.installGateStatus)) throw new Error('release packet missing valid installGateStatus');
  if (!statuses.has(releasePacket.launchGateStatus)) throw new Error('release packet missing valid launchGateStatus');
  for (const row of releasePacket.readinessTable ?? []) {
    if (!statuses.has(row.status)) throw new Error(`${row.surface} has invalid release status`);
  }
  if (!releasePacket.readinessTable?.length) throw new Error('release packet missing readinessTable');
  if (!releasePacket.installSmokeChecklist?.length) throw new Error('release packet missing installSmokeChecklist');
  if (!releasePacket.rollback?.disableInstructions) throw new Error('release packet missing rollback instructions');
  for (const item of releasePacket.doNotLaunchItems ?? []) {
    for (const field of ['hook', 'status', 'owner', 'launchImpact', 'nextAction']) {
      if (!item[field]) throw new Error(`doNotLaunch item missing ${field}`);
    }
  }
}

function findEocd(buffer) {
  for (let cursor = buffer.length - 22; cursor >= 0; cursor -= 1) {
    if (buffer.readUInt32LE(cursor) === 0x06054b50) return cursor;
  }
  throw new Error('ZIP end of central directory not found');
}

function verifySupplyChain(currentManifest) {
  const supplyChain = currentManifest.supplyChain;
  for (const key of ['verified', 'marketplaceVerified', 'trusted', 'slsaLevel']) {
    if (Object.hasOwn(supplyChain, key)) throw new Error(`supplyChain.${key} is computed by Cedros`);
  }
}

function tomlValue(text, section, key) {
  let currentSection = '';
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) currentSection = sectionMatch[1];
    if (currentSection !== section) continue;
    const valueMatch = line.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`));
    if (valueMatch) return valueMatch[1];
  }
  throw new Error(`Missing TOML value ${section}.${key}`);
}

function requiredEntry(entryMap, name) {
  const entry = entryMap.get(name);
  if (!entry) throw new Error(`archive missing ${name}`);
  return entry;
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'));
}

function readBytes(path) {
  return new Uint8Array(readFileSync(resolve(repoRoot, path)));
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} expected ${expected}, got ${actual}`);
}

function assertDeepEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label} mismatch`);
}
