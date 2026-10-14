import { readFileSync } from 'node:fs';

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function assertNamespaced(id, extensionId, label) {
  if (!id.startsWith(`${extensionId}:`)) {
    throw new Error(`${label} ${id} must be namespaced with ${extensionId}`);
  }
}

export function assertSetEqual(actual, expected, label) {
  assertEqual([...actual].sort().join(','), [...expected].sort().join(','), label);
}

export function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} expected ${expected}, got ${actual}`);
}

export function assertDeepEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${label} mismatch`);
}
