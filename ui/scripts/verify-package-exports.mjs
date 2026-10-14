import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiRoot = path.resolve(__dirname, '..');
const distRoot = path.join(uiRoot, 'dist');

const pkg = JSON.parse(
  await readFile(path.join(uiRoot, 'package.json'), 'utf8')
);

const requiredExports = [
  '.',
  './admin',
  './admin/register',
  './non-wallet',
  './email-only',
  './google-only',
  './solana-only',
  './web/register',
];

for (const key of requiredExports) {
  const target = pkg.exports[key];

  if (!target) {
    throw new Error(`Missing package export: ${key}`);
  }

  for (const condition of ['import', 'require']) {
    const entry = target[condition]?.default;

    if (!entry) {
      throw new Error(`Missing ${condition} target for export ${key}`);
    }

    await assertExists(path.join(uiRoot, entry.replace(/^\.\//, '')));
  }
}

await assertExists(path.join(distRoot, 'index.d.ts'));
await assertExists(path.join(distRoot, 'admin.d.ts'));
await assertExists(path.join(distRoot, 'admin/register.d.ts'));
await assertExists(path.join(distRoot, 'non-wallet.d.ts'));
await assertExists(path.join(distRoot, 'web/register.d.ts'));

console.log('Package exports verified');

async function assertExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
  } catch {
    throw new Error(`Missing built artifact: ${path.relative(uiRoot, filePath)}`);
  }
}
