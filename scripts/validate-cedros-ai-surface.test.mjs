import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname);
const validator = resolve(root, 'scripts/validate-cedros-ai-surface.mjs');
const files = ['cedros-extension.manifest.json', 'cedros-extension.bootstrap.json',
  'docs/cedros-ai-skills-capabilities-map.json', 'docs/cedros-host-coordination-handoff-map.json',
  'server-wasm/src/routes/registry.rs'];
function fixture(run) {
  const dir = mkdtempSync(resolve(tmpdir(), 'login-ai-routes-'));
  try {
    for (const file of files) {
      mkdirSync(dirname(resolve(dir, file)), { recursive: true });
      writeFileSync(resolve(dir, file), readFileSync(resolve(root, file)));
    }
    run(dir);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
function changeEndpoint(dir, path, routeId) {
  const manifest = JSON.parse(readFileSync(resolve(dir, files[0]), 'utf8'));
  const capability = manifest.surfaces.ai.capabilities.find(c => c.id === 'cedros-login:verify-email-token');
  capability.endpoint.path = path;
  writeFileSync(resolve(dir, files[0]), JSON.stringify(manifest));
  const bootstrap = JSON.parse(readFileSync(resolve(dir, files[1]), 'utf8'));
  bootstrap.manifest = manifest;
  writeFileSync(resolve(dir, files[1]), JSON.stringify(bootstrap));
  const map = JSON.parse(readFileSync(resolve(dir, files[2]), 'utf8'));
  const mapping = map.capabilityRouteMappings.find(c => c.capabilityId === capability.id);
  mapping.endpointPath = path;
  if (routeId) mapping.serverRouteId = routeId;
  writeFileSync(resolve(dir, files[2]), JSON.stringify(map));
}
test('all published AI actions resolve to their owning Wasm routes', () => fixture(dir => {
  assert.match(execFileSync(process.execPath, [validator], { cwd: dir, encoding: 'utf8' }), /validation passed/);
}));
test('unprefixed, foreign, missing and mismatched AI bindings fail before packaging', () => {
  for (const [path, routeId] of [
    ['/verify-email'], ['/extensions/another-extension/verify-email'],
    ['/extensions/cedros-login/missing'],
    ['/extensions/cedros-login/verify-email', 'cedros-login:register'],
  ]) fixture(dir => {
    changeEndpoint(dir, path, routeId);
    assert.throws(() => execFileSync(process.execPath, [validator], { cwd: dir, encoding: 'utf8', stdio: 'pipe' }),
      error => /executable extension route prefix|not bound to its declared Wasm route/.test(error.stderr));
  });
});
