#!/usr/bin/env node
/**
 * Install the locked UI dependencies, regenerate shared contract mirrors,
 * rebuild the cedros-login extension archive, then copy the single
 * `.cedros-extension.zip` into the main working directory (default
 * ~/Workspace/cedros/cedros-login), overwriting any existing copy.
 *
 * The upload system expects exactly one zip — don't drop release packets or
 * runtime tarballs here. Override the destination with CEDROS_MAIN_DIR.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const distDir = resolve(repoRoot, 'dist');
const uiDir = resolve(repoRoot, 'ui');
const nativeDir = resolve(repoRoot, 'react-native');
const dest =
  process.env.CEDROS_MAIN_DIR ?? resolve(homedir(), 'Workspace/cedros/cedros-login');

if (!existsSync(dest)) {
  throw new Error(
    `destination ${dest} does not exist; set CEDROS_MAIN_DIR or create the directory first`,
  );
}

run('npm', ['ci'], uiDir);
run('npm', ['ci'], nativeDir);
run('node', ['scripts/generate-shared-contracts.mjs']);
run('node', ['scripts/package-cedros-extension.mjs']);
run('node', ['scripts/validate-cedros-package-archive.mjs']);

const manifestPath = resolve(repoRoot, 'cedros-extension.manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const zipName = `${manifest.extensionId}-${manifest.version}.cedros-extension.zip`;
const sourceZip = resolve(distDir, zipName);
if (!existsSync(sourceZip)) {
  throw new Error(`expected archive ${sourceZip} does not exist`);
}

const target = resolve(dest, zipName);
copyFileSync(sourceZip, target);
const bytes = statSync(target).size;
console.log(`copied ${zipName} (${bytes} bytes) -> ${target}`);

function run(command, args, cwd = repoRoot) {
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}
