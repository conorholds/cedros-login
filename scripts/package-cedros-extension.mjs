#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  intakeEntryPlan,
  intakeReactDistEntries,
  intakeReactNativeDistEntries,
  sourceReviewEntryPlan,
} from './cedros-package-entry-plan.mjs';
import {
  intakeLimits,
  sourceReviewLimits,
  validateEntryMap,
} from './cedros-archive-limits.mjs';
import { buildArchiveBootstrap } from './cedros-archive-bootstrap.mjs';
import { createZip } from './cedros-zip.mjs';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const distDir = resolve(repoRoot, 'dist');

run('node', ['scripts/generate-cedros-extension-shell.mjs']);
const manifest = readJson('cedros-extension.manifest.json');
const bootstrap = buildArchiveBootstrap(
  manifest,
  readJson('docs/cedros-visual-builder-map.json')
);
assertDeepEqual(
  readJson('cedros-extension.bootstrap.json'),
  bootstrap,
  'generated archive bootstrap'
);
const archiveName = `${manifest.extensionId}-${manifest.version}.cedros-extension.zip`;
const releaseReadiness = readJson('docs/cedros-release-readiness-map.json');
releaseReadiness.archive.fileName = archiveName;
releaseReadiness.archive.path = `dist/${archiveName}`;
writeFileSync(
  resolve(repoRoot, 'docs/cedros-release-readiness-map.json'),
  `${JSON.stringify(releaseReadiness, null, 2)}\n`
);
run('make', ['cedros-validate']);
runIn('npm', ['run', 'build'], resolve(repoRoot, 'ui'));
runIn('npm', ['run', 'verify:exports'], resolve(repoRoot, 'ui'));
runIn('npm', ['run', 'verify:browser-admin'], resolve(repoRoot, 'ui'));
runIn('npm', ['run', 'verify:browser-web'], resolve(repoRoot, 'ui'));
assertCompiledAdminEntrypoint();
runIn('npm', ['run', 'build'], resolve(repoRoot, 'react-native'));
assertCompiledNativeEntrypoint();

// Build the server backend as a wasm component for the archive (operator installs it).
run('cargo', [
  '+1.92.0',
  'build',
  '--locked',
  '--manifest-path',
  'server-wasm/Cargo.toml',
  '--target',
  'wasm32-wasip2',
  '--release',
]);
copyFileSync(
  resolve(repoRoot, 'server-wasm/target/wasm32-wasip2/release/cedros_login_server_wasm.wasm'),
  resolve(repoRoot, 'cedros-extension.server.wasm')
);
run('wasm-tools', ['validate', 'cedros-extension.server.wasm']);
run('node', ['scripts/validate-cedros-wasm-abi.mjs', 'cedros-extension.server.wasm']);

const packageShape = readJson('docs/cedros-package-family-shape-map.json');
const hostHandoff = readJson('docs/cedros-host-coordination-handoff-map.json');

validateManifestPair(manifest, bootstrap);
validatePackageMetadata(manifest);
verifySupplyChain(manifest);

const intakeEntries = [
  ...intakeEntryPlan(),
  ...intakeReactDistEntries(repoRoot),
  ...intakeReactNativeDistEntries(repoRoot),
  {
    entry: 'cedros-extension.server.wasm',
    source: 'cedros-extension.server.wasm',
  },
];
const archiveEntries = buildArchiveEntries(manifest, bootstrap, workspaceReadme, intakeEntries, {
  normalizeCedrosRuntimeExports: true,
});
validateEntryMap(archiveEntries, intakeLimits);
assertCompiledAdminRuntimeIncluded(archiveEntries);
assertCompiledNativeRuntimeIncluded(archiveEntries);
assertCompiledServerWasmIncluded(archiveEntries);
const sourceReviewEntries = buildArchiveEntries(manifest, bootstrap, sourceReviewReadme, sourceReviewEntryPlan(repoRoot));
validateEntryMap(sourceReviewEntries, sourceReviewLimits);

const archivePath = resolve(distDir, archiveName);
const zipBytes = createZip(archiveEntries);
if (zipBytes.length > intakeLimits.maxZipBytes) {
  throw new Error(`archive exceeds ${intakeLimits.maxZipBytes} byte browser intake limit`);
}

mkdirSync(distDir, { recursive: true });
writeFileSync(archivePath, zipBytes);
const archiveSha256 = sha256(zipBytes);
const sourceReviewName = `${manifest.extensionId}-${manifest.version}.source-review.zip`;
const sourceReviewPath = resolve(distDir, sourceReviewName);
const sourceReviewBytes = createZip(sourceReviewEntries);
writeFileSync(sourceReviewPath, sourceReviewBytes);
const sourceReviewSha256 = sha256(sourceReviewBytes);
const sourceReviewArchive = {
  fileName: sourceReviewName,
  path: `dist/${sourceReviewName}`,
  sha256: sourceReviewSha256,
  bytes: sourceReviewBytes.length,
  entries: Object.keys(sourceReviewEntries).length,
};
const releasePacket = buildReleasePacket(manifest, archiveName, archiveSha256, zipBytes.length, sourceReviewArchive);
const releasePacketPath = resolve(distDir, `${manifest.extensionId}-${manifest.version}.release.json`);
writeFileSync(releasePacketPath, `${JSON.stringify(releasePacket, null, 2)}\n`);

writeArchiveMap(manifest, archiveEntries, archiveName, sourceReviewArchive);

console.log(`archive ${archivePath}`);
console.log(`sha256 ${archiveSha256}`);
console.log(`entries ${Object.keys(archiveEntries).length}`);
console.log(`bytes ${zipBytes.length}`);
console.log(`source review archive ${sourceReviewPath}`);
console.log(`source review sha256 ${sourceReviewSha256}`);
console.log(`source review entries ${Object.keys(sourceReviewEntries).length}`);
console.log(`source review bytes ${sourceReviewBytes.length}`);
console.log(`release packet ${releasePacketPath}`);

function buildArchiveEntries(
  currentManifest,
  currentBootstrap,
  readmeFactory,
  entryPlan = intakeEntryPlan(),
  options = {}
) {
  const entries = {
    'cedros-extension.manifest.json': bytes(jsonLine(currentManifest)),
    'cedros-extension.bootstrap.json': bytes(jsonLine(currentBootstrap)),
    'workspace/README.md': bytes(readmeFactory(currentManifest)),
  };
  for (const item of entryPlan) {
    entries[item.entry] = options.normalizeCedrosRuntimeExports ? readIntakeEntry(item) : readBytes(item.source);
  }
  return Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
}

function readIntakeEntry(item) {
  const runtimeExports = {
    'workspace/react/package.json': {
      './admin/register': './dist/admin/register.js',
      './web/register': './dist/web/register.js',
    },
    'workspace/react-native/package.json': {
      './register': './dist/register.js',
    },
  }[item.entry];
  if (!runtimeExports) return readBytes(item.source);

  const packageMetadata = readJson(item.source);
  return bytes(
    jsonLine({
      ...packageMetadata,
      exports: { ...packageMetadata.exports, ...runtimeExports },
    })
  );
}

function validateManifestPair(currentManifest, currentBootstrap) {
  assertDeepEqual(currentBootstrap.manifest, currentManifest, 'bootstrap manifest');
  if (currentManifest.schemaVersion !== 1) throw new Error('schemaVersion must be 1');
  if (currentManifest.platformApiVersion !== '1') throw new Error('platformApiVersion must be 1');
  if (currentManifest.compatibility?.platformApiVersion !== '1') {
    throw new Error('compatibility.platformApiVersion must be 1');
  }
}

function validatePackageMetadata(currentManifest) {
  const serverCargo = readText('server/Cargo.toml');
  const uiPackage = readJson('ui/package.json');
  const nativePackage = readJson('react-native/package.json');
  assertEqual(tomlValue(serverCargo, 'package', 'name'), currentManifest.packageFamily.server.packageName, 'server package name');
  assertEqual(tomlValue(serverCargo, 'package', 'version'), currentManifest.packageFamily.server.version, 'server package version');
  assertEqual(uiPackage.name, currentManifest.packageFamily.react.packageName, 'react package name');
  assertEqual(uiPackage.version, currentManifest.packageFamily.react.version, 'react package version');
  assertEqual(nativePackage.name, currentManifest.packageFamily.reactNative.packageName, 'native package name');
  assertEqual(nativePackage.version, currentManifest.packageFamily.reactNative.version, 'native package version');
  if (!uiPackage.exports?.['./admin/register']) throw new Error('React package missing ./admin/register export');
  if (!uiPackage.exports?.['./web/register']) throw new Error('React package missing ./web/register export');
  if (!nativePackage.exports?.['./register']) throw new Error('React Native package missing ./register export');
}

function verifySupplyChain(currentManifest) {
  const supplyChain = currentManifest.supplyChain;
  if (!supplyChain) return;
  for (const key of ['verified', 'marketplaceVerified', 'trusted', 'slsaLevel']) {
    if (Object.hasOwn(supplyChain, key)) throw new Error(`supplyChain.${key} is computed by Cedros`);
  }
  verifyEvidencePair(supplyChain.build?.provenanceUrl, supplyChain.build?.provenanceSha256, 'build provenance');
  verifyEvidencePair(supplyChain.sbom?.url, supplyChain.sbom?.sha256, 'SBOM');
  for (const artifact of supplyChain.artifacts ?? []) {
    verifyEvidencePair(artifact.signatureUrl, artifact.signatureSha256, `${artifact.name} signature`);
    verifyEvidencePair(artifact.provenanceUrl, artifact.provenanceSha256, `${artifact.name} provenance`);
    verifyEvidencePair(artifact.sbomUrl, artifact.sbomSha256, `${artifact.name} SBOM`);
  }
}

function buildReleasePacket(currentManifest, archiveName, archiveSha256, archiveBytes, sourceReviewArchive) {
  const generatedAt = new Date().toISOString();
  const commit = gitRevision();
  return {
    extensionId: currentManifest.extensionId,
    version: currentManifest.version,
    displayName: currentManifest.displayName,
    generatedAt,
    sourceCommit: commit,
    targetEnvironment: releaseReadiness.targetEnvironment,
    installOwner: releaseReadiness.installOwner,
    supportEscalation: releaseReadiness.supportEscalation,
    installGateStatus: releaseReadiness.installGateStatus,
    launchGateStatus: releaseReadiness.launchGateStatus,
    archive: { fileName: archiveName, path: `dist/${archiveName}`, sha256: archiveSha256, bytes: archiveBytes },
    sourceReviewArchive,
    supplyChainVerification: supplyChainVerification(currentManifest),
    supplyChainEvidence: releaseReadiness.supplyChain,
    packageFamily: packageShape.packageMembers.map((member) => ({
      packageRef: member.packageRef,
      packageName: member.manifestPackageName,
      version: member.manifestVersion,
      status: member.status,
    })),
    requiredServices: currentManifest.dependencies?.services ?? [],
    requiredCapabilities: currentManifest.dependencies?.capabilities ?? [],
    requiredProviders: releaseReadiness.requiredProviders,
    officialContracts: releaseReadiness.officialContracts,
    includedSurfaces: includedSurfaces(currentManifest),
    readinessTable: releaseReadiness.readinessTable,
    hostCoordinatedItems: hostCoordinatedItems(),
    doNotLaunchItems: doNotLaunchItems(),
    validationEvidence: validationEvidence(generatedAt, commit),
    installSmokeChecklist: releaseReadiness.installSmokeChecklist,
    rollback: releaseReadiness.rollback,
    knownRisks: releaseReadiness.knownRisks,
    signOff: releaseReadiness.signOff,
    uploadInstructions: 'Upload only the .cedros-extension.zip through Cedros local package intake. It carries the compiled React admin runtime under workspace/react/dist/** so Cedros Data can hydrate adminModules[] without npm/tarball/workspace fetches. The .source-review.zip is separate human review evidence and is not the upload artifact.',
  };
}

function includedSurfaces(currentManifest) {
  return {
    adminModules: (currentManifest.adminModules ?? []).map((module) => module.moduleId),
    dashboardCards: (currentManifest.adminModules ?? []).flatMap((module) => module.contributions?.dashboardCards?.map((card) => card.id) ?? []),
    pageSeeds: (currentManifest.pageSeeds ?? []).map((seed) => seed.id),
    contentBlocks: (currentManifest.contentBlocks ?? []).map((block) => block.type),
    contentTemplates: (currentManifest.contentTemplates ?? []).map((template) => template.id),
    forms: (currentManifest.formTemplates ?? []).map((form) => form.id),
    docs: (currentManifest.docsArticles ?? []).map((article) => article.id),
    onboarding: (currentManifest.onboardingPages ?? []).map((page) => page.id),
    analytics: (currentManifest.analytics?.events ?? []).map((event) => event.id),
    aiSkills: (currentManifest.surfaces.ai?.skills ?? []).map((skill) => skill.id),
    aiCapabilities: (currentManifest.surfaces.ai?.capabilities ?? []).map((capability) => capability.id),
    native: [...(currentManifest.surfaces.native.screenIds ?? []), ...(currentManifest.surfaces.native.providerIds ?? [])],
  };
}

function hostCoordinatedItems() {
  return hostHandoff.handoffRows.map((row) => ({
    manifestId: row.manifestId,
    type: row.type,
    hostStatus: row.status,
    releaseStatus: releaseStatusForHost(row.status),
    owner: row.owner,
    blocking: row.blocking,
    launchGate: row.launchGate,
  }));
}

function doNotLaunchItems() {
  return hostHandoff.handoffRows
    .filter((row) => row.status !== 'bound-in-production')
    .map((row) => ({
      hook: row.manifestId,
      status: row.status,
      owner: row.owner,
      launchImpact: row.blocking ? 'blocks live launch for this behavior' : 'metadata can install; live emission remains unavailable',
      nextAction: `${row.owner} binds ${row.hostHookRequired} for ${row.type} before ${row.launchGate}`,
    }));
}

function validationEvidence(generatedAt, commit) {
  return [
    evidence('node scripts/package-cedros-extension.mjs', generatedAt, commit, 'passed'),
    evidence('make cedros-validate', generatedAt, commit, 'passed through package script'),
    evidence('node scripts/validate-cedros-package-archive.mjs', generatedAt, commit, 'passed'),
  ];
}

function workspaceReadme(currentManifest) {
  return `# ${currentManifest.displayName} Extension Archive

This archive is the complete intake artifact for Cedros Login. It carries:

- canonical manifest + bootstrap JSON (\`cedros-extension.manifest.json\`,
  \`cedros-extension.bootstrap.json\`)
- React package metadata (\`workspace/react/package.json\`)
- compiled React admin runtime (\`workspace/react/dist/**\`), including the
  executable \`./admin/register\` entrypoint and every relative chunk, module,
  style, and JSON file it imports
- a small Rust/TS source slice for human review

Cedros Data does not fetch npm packages, tarballs, workspaces, registries, or
crates at intake time. The compiled admin runtime is loaded from this ZIP.
Only host-shim bare imports (\`react\` and \`react/jsx-runtime\`) remain
unresolved at upload time.

- Extension id: ${currentManifest.extensionId}
- Version: ${currentManifest.version}
- Intake artifact: manifest + bootstrap + compiled admin runtime
- Source review artifact: \`${currentManifest.extensionId}-${currentManifest.version}.source-review.zip\`
`;
}

function sourceReviewReadme(currentManifest) {
  return `# ${currentManifest.displayName} Source Review Archive

This archive carries source review material for Cedros Login. It deliberately
excludes build outputs, dependency caches, vendored crates, node_modules, local
environment files, and private keys. Do not upload this archive through Cedros
local package intake unless a separate source-handoff/build lane is approved.

- Extension id: ${currentManifest.extensionId}
- Version: ${currentManifest.version}
- Runtime lane: packageFamily and host-coordinated build/deploy
`;
}

function supplyChainVerification(currentManifest) {
  if (!currentManifest.supplyChain) {
    return { status: 'not-provided', summary: 'Author manifest does not declare source, provenance, SBOM, signature, or artifact evidence for this archive.' };
  }
  return { status: 'provided-unverified', summary: 'Author supplied supplyChain evidence; Cedros marketplace or operator verification has not run.' };
}

function releaseStatusForHost(status) {
  const statuses = {
    'bound-in-production': 'ready',
    'bound-in-staging': 'host-coordinated',
    'host-hook-requested': 'host-coordinated',
    'metadata-only': 'metadata-only',
    deferred: 'deferred',
    blocked: 'blocked',
    unsupported: 'blocked',
  };
  return statuses[status] ?? 'blocked';
}

function evidence(command, timestamp, commit, result) {
  return { command, environment: 'local workspace', timestamp, commit, result };
}

function gitRevision() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function verifyEvidencePair(url, digest, label) {
  if (url && !digest) throw new Error(`${label} URL requires a SHA-256 digest`);
  if (digest && !url) throw new Error(`${label} digest requires a URL`);
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

function readJson(path) {
  return JSON.parse(readText(path));
}

function readText(path) {
  return readFileSync(resolve(repoRoot, path), 'utf8');
}

function readBytes(path) {
  const absolute = resolve(repoRoot, path);
  if (!existsSync(absolute)) throw new Error(`missing archive source ${path}`);
  if (lstatSync(absolute).isSymbolicLink()) throw new Error(`archive source is a symlink ${path}`);
  return new Uint8Array(readFileSync(absolute));
}

function jsonLine(value) {
  return `${JSON.stringify(value)}\n`;
}

function bytes(value) {
  return Buffer.from(value);
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

function run(command, args) {
  execFileSync(command, args, { cwd: repoRoot, stdio: 'inherit' });
}

function runIn(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function assertCompiledAdminEntrypoint() {
  const adminRegister = resolve(repoRoot, 'ui/dist/admin/register.js');
  if (!existsSync(adminRegister)) {
    throw new Error(
      'ui/dist/admin/register.js is missing after `npm run build` — the React admin runtime must be compiled before packaging the intake ZIP',
    );
  }
  const pkg = readJson('ui/package.json');
  const target = pkg.exports?.['./admin/register']?.import?.default;
  if (target !== './dist/admin/register.js') {
    throw new Error(
      `ui/package.json exports['./admin/register'].import.default must point to './dist/admin/register.js' (got ${target ?? 'undefined'})`,
    );
  }
}

function assertCompiledAdminRuntimeIncluded(entries) {
  const required = 'workspace/react/dist/admin/register.js';
  if (!entries[required]) {
    throw new Error(
      `intake archive missing compiled admin runtime entry ${required}; Cedros Data treats adminModules[] as unbacked without it`,
    );
  }
}

function assertCompiledNativeEntrypoint() {
  const nativeRegister = resolve(repoRoot, 'react-native/dist/register.js');
  if (!existsSync(nativeRegister)) {
    throw new Error(
      'react-native/dist/register.js is missing after `npm run build` — the native registration runtime must be compiled before packaging the intake ZIP',
    );
  }
  const pkg = readJson('react-native/package.json');
  const target = pkg.exports?.['./register']?.import?.default;
  if (target !== './dist/register.js') {
    throw new Error(
      `react-native/package.json exports['./register'].import.default must point to './dist/register.js' (got ${target ?? 'undefined'})`,
    );
  }
}

function assertCompiledNativeRuntimeIncluded(entries) {
  const required = 'workspace/react-native/dist/register.js';
  if (!entries[required]) {
    throw new Error(
      `intake archive missing compiled native runtime entry ${required}; the host cannot resolve the manifest native entrypoint without it`,
    );
  }
}

function assertCompiledServerWasmIncluded(entries) {
  const required = 'cedros-extension.server.wasm';
  if (!entries[required]) {
    throw new Error(
      `intake archive missing compiled server component ${required}; the host cannot run server routes/jobs without it`,
    );
  }
}

function writeArchiveMap(currentManifest, entries, archiveName, sourceReviewArchive) {
  const grouped = groupArchiveEntries(Object.keys(entries));
  const archiveMap = {
    extensionId: currentManifest.extensionId,
    version: currentManifest.version,
    archiveName,
    outputDirectory: 'dist',
    canonicalEntries: grouped.canonical,
    workspaceEntries: {
      readme: 'workspace/README.md',
      runtimeArtifacts: grouped.runtimeArtifacts,
      react: grouped.react,
      reactNative: grouped.reactNative,
      server: grouped.server,
      contracts: grouped.contracts,
      docs: grouped.docs,
      scripts: grouped.scripts,
    },
    excluded: [
      'node_modules',
      'target',
      '.git',
      '.env',
      'source maps (*.map)',
      'mockServiceWorker.js (MSW test infra)',
      'dependency caches',
      'machine-local paths',
      'raw logs',
      'secrets or private keys',
    ],
    scripts: {
      package: 'node scripts/package-cedros-extension.mjs',
      validate: 'node scripts/validate-cedros-package-archive.mjs',
      makeTarget: 'make cedros-package',
    },
    intakeLimits: {
      zipBytes: intakeLimits.maxZipBytes,
      entryCount: intakeLimits.maxEntries,
      entryBytes: intakeLimits.maxEntryBytes,
      wasmBytes: intakeLimits.maxWasmBytes,
      uncompressedBytes: intakeLimits.maxUncompressedBytes,
    },
    releasePacket: {
      path: `dist/${currentManifest.extensionId}-${currentManifest.version}.release.json`,
      archiveDigestLocation: 'release packet only',
      supplyChainVerificationStatus: 'not-provided',
      runtimeCodeStatus: 'compiled React admin runtime included under workspace/react/dist/** and compiled Wasm server backend included as cedros-extension.server.wasm; Cedros Data loads both directly from the ZIP without npm/tarball/workspace fetches',
      sourceReviewArchive,
    },
  };
  writeFileSync(
    resolve(repoRoot, 'docs/cedros-package-archive-map.json'),
    `${JSON.stringify(archiveMap, null, 2)}\n`
  );
}

function groupArchiveEntries(entryNames) {
  const sorted = [...entryNames].sort((a, b) => a.localeCompare(b));
  const canonical = [];
  const react = [];
  const reactNative = [];
  const server = [];
  const contracts = [];
  const docs = [];
  const scripts = [];
  const runtimeArtifacts = [];
  for (const name of sorted) {
    if (name === 'cedros-extension.manifest.json' || name === 'cedros-extension.bootstrap.json') {
      canonical.push(name);
    } else if (name === 'cedros-extension.server.wasm') {
      runtimeArtifacts.push(name);
    } else if (name === 'workspace/README.md') {
      continue;
    } else if (name.startsWith('workspace/react/')) {
      react.push(name);
    } else if (name.startsWith('workspace/react-native/')) {
      reactNative.push(name);
    } else if (name.startsWith('workspace/server/')) {
      server.push(name);
    } else if (name.startsWith('workspace/contracts/')) {
      contracts.push(name);
    } else if (name.startsWith('workspace/docs/')) {
      docs.push(name);
    } else if (name.startsWith('workspace/scripts/')) {
      scripts.push(name);
    }
  }
  return { canonical, runtimeArtifacts, react, reactNative, server, contracts, docs, scripts };
}
