import assert from 'node:assert/strict';
import test from 'node:test';

import { validateWasiImports } from './validate-cedros-wasm-abi.mjs';

test('accepts the Cedros host WASI version', () => {
  assert.doesNotThrow(() =>
    validateWasiImports('world root { import wasi:cli/environment@0.2.6; }'),
  );
});

test('rejects a newer WASI version before packaging', () => {
  assert.throws(
    () => validateWasiImports('world root { import wasi:cli/environment@0.2.12; }'),
    /unsupported WASI 0\.2\.12; Cedros host requires 0\.2\.6/,
  );
});

test('rejects components without versioned WASI imports', () => {
  assert.throws(
    () => validateWasiImports('world root { import cedros:extension/logging@0.1.0; }'),
    /declares no versioned WASI imports/,
  );
});
