#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);

const checks = [
  {
    file: 'src/admin/dashboard/LoginHealthDashboardCard.tsx',
    pattern: /Intl\.NumberFormat\(['"]en-US['"]/,
    message: 'dashboard number formatting must use the active locale',
  },
  {
    file: 'src/extension/visualBuilderRenderers.ts',
    pattern: /aria-label=["']Authentication options["']/,
    message: 'public auth form ARIA text must come from translations',
  },
];

const failures = checks.filter((check) =>
  check.pattern.test(readFileSync(resolve(root, check.file), 'utf8'))
);

if (failures.length) {
  for (const failure of failures) {
    console.error(`${failure.file}: ${failure.message}`);
  }
  process.exit(1);
}

console.log('i18n regression checks passed');
