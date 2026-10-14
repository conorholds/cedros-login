#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const SUPPORTED_WASI_VERSION = '0.2.6';

export function validateWasiImports(componentWit) {
  const versions = new Set(
    [...componentWit.matchAll(/\bimport wasi:[^;@]+@(\d+\.\d+\.\d+);/g)].map(
      (match) => match[1],
    ),
  );

  if (versions.size === 0) {
    throw new Error('compiled component declares no versioned WASI imports');
  }

  const unsupported = [...versions].filter((version) => version !== SUPPORTED_WASI_VERSION);
  if (unsupported.length > 0) {
    throw new Error(
      `compiled component uses unsupported WASI ${unsupported.join(', ')}; Cedros host requires ${SUPPORTED_WASI_VERSION}. Build the Wasm package with Rust 1.92.0.`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const componentPath = process.argv[2];
  if (!componentPath) throw new Error('usage: validate-cedros-wasm-abi.mjs <component.wasm>');
  const componentWit = execFileSync('wasm-tools', ['component', 'wit', componentPath], {
    encoding: 'utf8',
  });
  validateWasiImports(componentWit);
  console.log(`cedros Wasm ABI validation passed (WASI ${SUPPORTED_WASI_VERSION})`);
}
