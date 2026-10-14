const MIB = 1024 * 1024;

/** Shared Cedros intake limits from 22-packaging-and-upload.md. */
export const intakeLimits = Object.freeze({
  maxZipBytes: 64 * MIB,
  maxEntries: 4096,
  maxEntryBytes: 2 * MIB,
  maxWasmBytes: 64 * MIB,
  maxUncompressedBytes: 8 * MIB,
});

/** Repo-local review artifact limits; this ZIP is never sent to Cedros intake. */
export const sourceReviewLimits = Object.freeze({
  maxZipBytes: 32 * MIB,
  maxEntries: 4096,
  maxEntryBytes: 16 * MIB,
  maxWasmBytes: 16 * MIB,
  maxUncompressedBytes: 128 * MIB,
});

export function entryByteLimit(name, limits) {
  return isServerWasm(name) ? limits.maxWasmBytes : limits.maxEntryBytes;
}

export function countsTowardTextTotal(name) {
  return !isServerWasm(name);
}

export function assertTextEntry(name, data) {
  if (isServerWasm(name)) return;
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(data);
  } catch {
    throw new Error(`${name} is not UTF-8 text`);
  }
}

export function validateEntryMap(entries, limits) {
  if (Object.keys(entries).length > limits.maxEntries) {
    throw new Error('archive has too many entries');
  }
  let totalBytes = 0;
  const seen = new Set();
  for (const [name, data] of Object.entries(entries)) {
    validateArchivePath(name);
    if (seen.has(name.toLowerCase())) throw new Error(`duplicate archive path ${name}`);
    seen.add(name.toLowerCase());
    if (data.length > entryByteLimit(name, limits)) {
      throw new Error(`${name} exceeds entry byte limit`);
    }
    assertTextEntry(name, data);
    if (countsTowardTextTotal(name)) totalBytes += data.length;
  }
  if (totalBytes > limits.maxUncompressedBytes) {
    throw new Error('archive exceeds uncompressed byte limit');
  }
}

export function validateArchivePath(name) {
  const segments = name.split('/');
  if (
    name.startsWith('/') ||
    name.includes('\\') ||
    segments.includes('.') ||
    segments.includes('..')
  ) {
    throw new Error(`archive contains unsafe path "${name}"`);
  }
  const secret = /(^|\/)(\.env|\.npmrc|\.pypirc|id_rsa|id_dsa|id_ecdsa|id_ed25519)(\/|$)/;
  if (secret.test(name.toLowerCase())) {
    throw new Error(`archive contains hidden secret path "${name}"`);
  }
}

function isServerWasm(name) {
  return name === 'cedros-extension.server.wasm';
}
