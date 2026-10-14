import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('rejects manifest schedules with automatic retries', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'cedros-login-automation-'));
  try {
    mkdirSync(join(fixtureRoot, 'docs'));
    for (const path of [
      'docs/cedros-server-native-host-coordination-map.json',
      'docs/cedros-automation-jobs-map.json',
      'docs/cedros-host-provider-map.json',
    ]) {
      copyFileSync(resolve(repoRoot, path), resolve(fixtureRoot, path));
    }

    const manifest = JSON.parse(readFileSync(resolve(repoRoot, 'cedros-extension.manifest.json')));
    manifest.jobSchedules[0].maxRetries = 1;
    writeFileSync(
      join(fixtureRoot, 'cedros-extension.manifest.json'),
      `${JSON.stringify(manifest)}\n`
    );

    const result = spawnSync(
      process.execPath,
      [resolve(repoRoot, 'scripts/validate-cedros-automation-jobs.mjs')],
      { cwd: fixtureRoot, encoding: 'utf8' }
    );

    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /jobSchedules\[0\]\.maxRetries must be 0 because automatic executor retries are unsupported/
    );
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
