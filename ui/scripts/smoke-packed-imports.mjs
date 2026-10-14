import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiRoot = path.resolve(__dirname, '..');

let tempDir;
let tarballPath;

const SMOKE_TEST = `
  const root = await import('@cedros/login-react');
  const admin = await import('@cedros/login-react/admin');
  const adminRegister = await import('@cedros/login-react/admin/register');
  const nonWallet = await import('@cedros/login-react/non-wallet');
  const webRegister = await import('@cedros/login-react/web/register');

  assertExport(root, 'CedrosLoginProvider', '@cedros/login-react');
  assertExport(root, 'LoginForm', '@cedros/login-react');
  assertExport(root, 'useCedrosLogin', '@cedros/login-react');
  assertMissingExport(root, 'CedrosAdminDashboard', '@cedros/login-react');

  assertMissingExport(admin, 'CedrosUnifiedAdmin', '@cedros/login-react/admin');
  assertMissingExport(admin, 'AdminShell', '@cedros/login-react/admin');
  assertMissingExport(admin, 'useAdminShell', '@cedros/login-react/admin');
  assertExport(admin, 'HOST_SERVICE_IDS', '@cedros/login-react/admin');
  assertExport(admin, 'cedrosLoginPlugin', '@cedros/login-react/admin');
  assertExport(admin, 'cedrosLoginExtensionAdminModule', '@cedros/login-react/admin');
  assertExport(admin, 'cedrosLoginTeamDirectoryHostService', '@cedros/login-react/admin');

  assertExport(nonWallet, 'CedrosLoginProvider', '@cedros/login-react/non-wallet');
  assertExport(nonWallet, 'LoginForm', '@cedros/login-react/non-wallet');
  assertExport(nonWallet, 'useCedrosLogin', '@cedros/login-react/non-wallet');
  assertExport(nonWallet, 'useOrgs', '@cedros/login-react/non-wallet');
  assertExport(nonWallet, 'useSetup', '@cedros/login-react/non-wallet');
  assertExport(nonWallet, 'SetupWizard', '@cedros/login-react/non-wallet');

  const adminBootstrap = adminRegister.default();
  const webBootstrap = webRegister.default();

  assertManifest(adminBootstrap.manifest, '@cedros/login-react/admin/register');
  assertManifest(webBootstrap.manifest, '@cedros/login-react/web/register');

  if (!Array.isArray(adminBootstrap.modules) || adminBootstrap.modules.length !== 1) {
    throw new Error('Expected @cedros/login-react/admin/register to expose one admin module');
  }

  if (webBootstrap.modules !== undefined) {
    throw new Error('Expected @cedros/login-react/web/register to omit admin modules');
  }

  function assertExport(module, key, specifier) {
    if (!(key in module)) {
      throw new Error('Missing export ' + key + ' from ' + specifier);
    }
  }

  function assertManifest(manifest, specifier) {
    if (!manifest || manifest.extensionId !== 'cedros-login') {
      throw new Error('Missing cedros-login manifest from ' + specifier);
    }

    if (manifest.registration.admin.entrypoint !== '@cedros/login-react/admin/register') {
      throw new Error('Unexpected admin registration entrypoint in ' + specifier);
    }

    if (manifest.registration.web.entrypoint !== '@cedros/login-react/web/register') {
      throw new Error('Unexpected web registration entrypoint in ' + specifier);
    }

    if (manifest.registration.native.entrypoint !== '@cedros/login-react-native/register') {
      throw new Error('Unexpected native registration entrypoint in ' + specifier);
    }
  }

  function assertMissingExport(module, key, specifier) {
    if (key in module) {
      throw new Error('Unexpected export ' + key + ' from ' + specifier);
    }
  }
`;

try {
  const tarballName = execFileSync('npm', ['pack', '--silent', '--ignore-scripts'], {
    cwd: uiRoot,
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .at(-1);

  if (!tarballName) {
    throw new Error('npm pack did not produce a tarball');
  }

  tarballPath = path.join(uiRoot, tarballName);
  tempDir = await mkdtemp(path.join(tmpdir(), 'cedros-login-pack-'));

  run('npm', ['init', '-y'], tempDir, 'ignore');
  run('npm', ['install', '--silent', 'react', 'react-dom', tarballPath], tempDir);
  run('node', ['--input-type=module', '-e', SMOKE_TEST], tempDir);

  console.log('Packed tarball smoke test passed');
} finally {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
  }

  if (tarballPath) {
    await rm(tarballPath, { force: true });
  }
}

function run(command, args, cwd, stdio = 'inherit') {
  execFileSync(command, args, { cwd, stdio });
}
