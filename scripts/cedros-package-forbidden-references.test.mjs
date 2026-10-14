import assert from 'node:assert/strict';
import test from 'node:test';

import { validateForbiddenArchiveReferences } from './cedros-package-forbidden-references.mjs';

function entry(name, text) {
  return { name, data: new TextEncoder().encode(text) };
}

test('accepts an archive with only host-owned admin module contracts', () => {
  assert.doesNotThrow(() =>
    validateForbiddenArchiveReferences([
      entry('workspace/react/package.json', '{"name":"@cedros/login-react"}'),
      entry('workspace/react/dist/admin/register.js', 'export const modules = [];'),
    ])
  );
});

test('rejects any archive entry referencing @cedros/admin-react', () => {
  assert.throws(
    () =>
      validateForbiddenArchiveReferences([
        entry('workspace/react/README.md', 'Requires @cedros/admin-react at runtime.'),
      ]),
    /workspace\/react\/README\.md contains forbidden reference/
  );
});
