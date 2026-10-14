#!/usr/bin/env node
/**
 * Build the cedros-login React runtime as a local tarball.
 *
 * Cedros Data separates extension inventory (the `.cedros-extension.zip`) from
 * the executable runtime bootstrap. This script produces the runtime tarball
 * locally — no `npm publish` — so cedros-data deployments can consume it
 * through any trusted channel (file dependency, vendored workspace, private
 * registry handoff, etc.) and register the bootstrap with their
 * extensionRuntimeBootstraps / HOST_SERVICE_IDS.extensionRuntimeRegistry.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const uiRoot = resolve(repoRoot, 'ui');
const distDir = resolve(repoRoot, 'dist');

mkdirSync(distDir, { recursive: true });

run('npm', ['run', 'build'], uiRoot);
run('npm', ['run', 'verify:exports'], uiRoot);

const packOutput = execFileSync('npm', ['pack', '--silent', '--ignore-scripts'], {
  cwd: uiRoot,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(Boolean);
const tarballName = packOutput.at(-1);
if (!tarballName) throw new Error('npm pack did not produce a tarball');

const tarballSrc = resolve(uiRoot, tarballName);
const tarballDest = resolve(distDir, tarballName);
renameSync(tarballSrc, tarballDest);

const bytes = statSync(tarballDest).size;
const sha256 = createHash('sha256').update(readFileSync(tarballDest)).digest('hex');

console.log(`runtime tarball ${tarballDest}`);
console.log(`sha256 ${sha256}`);
console.log(`bytes ${bytes}`);

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}
