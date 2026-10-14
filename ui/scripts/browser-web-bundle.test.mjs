import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { gzipSync } from 'node:zlib';

const uiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const webEntryPath = resolve(uiRoot, 'dist/web/register.js');
const runtimeImportSpecifierPattern =
  /(\bfrom\s*["']|import\s*\(\s*["']|import\s+["'])([^"']+)(["'])/g;
const maxPublicDataModuleUrlLength = 2 * 1024 * 1024;

test('packaged web ESM is a self-contained browser runtime within the host URL budget', async (t) => {
  const source = await readFile(webEntryPath, 'utf8');
  const relativeImports = [...source.matchAll(runtimeImportSpecifierPattern)]
    .map((match) => match[2])
    .filter((specifier) => specifier.startsWith('.') || specifier.startsWith('/'));

  assert.deepEqual(
    relativeImports,
    [],
    `public web runtime must not emit ZIP-local chunks: ${relativeImports.join(', ')}`
  );

  const encodedUrlLength =
    'data:text/javascript;base64,'.length + Buffer.from(source).toString('base64').length;
  t.diagnostic(
    JSON.stringify({
      raw_bytes: Buffer.byteLength(source),
      gzip_bytes: gzipSync(source).byteLength,
      data_url_bytes: encodedUrlLength,
    })
  );
  assert.ok(
    encodedUrlLength <= maxPublicDataModuleUrlLength,
    `public web runtime data URL is ${Math.ceil(encodedUrlLength)} bytes; host limit is ${maxPublicDataModuleUrlLength}`
  );
});
