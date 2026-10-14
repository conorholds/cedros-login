#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const artifactPath = process.argv[2] ?? 'server-wasm/target/wasm32-wasip2/release/cedros_login_server_wasm.wasm';
const artifact = resolve(repoRoot, artifactPath);
const iterations = Number.parseInt(process.env.WASM_BENCH_ITERATIONS ?? '5', 10);

if (!Number.isInteger(iterations) || iterations < 1 || iterations > 100) {
  throw new Error('WASM_BENCH_ITERATIONS must be an integer between 1 and 100');
}
if (!existsSync(artifact)) {
  throw new Error(`missing Wasm artifact ${artifactPath}; run make cedros-package first`);
}

const durations = [];
for (let index = 0; index < iterations; index += 1) {
  const start = performance.now();
  execFileSync('wasm-tools', ['validate', artifact], { stdio: 'ignore' });
  durations.push(performance.now() - start);
}

durations.sort((left, right) => left - right);
const sum = durations.reduce((total, value) => total + value, 0);
const result = {
  artifact: artifactPath,
  bytes: statSync(artifact).size,
  iterations,
  validateMs: {
    min: round(durations[0]),
    avg: round(sum / durations.length),
    max: round(durations[durations.length - 1]),
  },
  note: 'Artifact validation benchmark only; hot route/job invocation requires a Cedros or Wasmtime host runtime.',
};

console.log(JSON.stringify(result, null, 2));

function round(value) {
  return Math.round(value * 100) / 100;
}
