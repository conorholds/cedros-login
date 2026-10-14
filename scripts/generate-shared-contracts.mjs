#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const sharedTypeFiles = [
  'auth.ts',
  'invite.ts',
  'member.ts',
  'org.ts',
  'profile.ts',
  'session.ts',
  'totp.ts',
];
const targets = ['ui/src/types', 'react-native/src/types'];

for (const file of sharedTypeFiles) {
  const source = readFile(`contracts/src/types/${file}`);
  for (const targetDir of targets) {
    const target = `${targetDir}/${file}`;
    mkdirSync(dirname(resolve(repoRoot, target)), { recursive: true });
    writeFileSync(resolve(repoRoot, target), source);
  }
}

console.log(`generated ${sharedTypeFiles.length} shared contract files into ${targets.length} packages`);

function readFile(path) {
  return readFileSync(resolve(repoRoot, path), 'utf8');
}
