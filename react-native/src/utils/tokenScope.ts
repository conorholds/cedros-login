import type { CedrosLoginConfig } from "../types";

export const LEGACY_TOKEN_STORAGE_KEY = "auth_tokens";
export const LEGACY_TOKEN_CLAIM_KEY = "auth_tokens.legacy_claim.v1";
const SCOPED_TOKEN_PREFIX = "auth_tokens.v2.";
const DEFAULT_SERVICE = "cedros.login";

const SHA256_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotateRight(value: number, bits: number): number {
  return (value >>> bits) | (value << (32 - bits));
}

function utf8Bytes(value: string): number[] {
  const bytes: number[] = [];
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | (code >>> 6), 0x80 | (code & 63));
    else if (code < 0x10000) {
      bytes.push(
        0xe0 | (code >>> 12),
        0x80 | ((code >>> 6) & 63),
        0x80 | (code & 63),
      );
    } else {
      bytes.push(
        0xf0 | (code >>> 18),
        0x80 | ((code >>> 12) & 63),
        0x80 | ((code >>> 6) & 63),
        0x80 | (code & 63),
      );
    }
  }
  return bytes;
}

function paddedMessage(value: string): number[] {
  const bytes = utf8Bytes(value);
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const high = Math.floor(bitLength / 0x1_0000_0000);
  const low = bitLength >>> 0;
  for (let shift = 24; shift >= 0; shift -= 8)
    bytes.push((high >>> shift) & 255);
  for (let shift = 24; shift >= 0; shift -= 8)
    bytes.push((low >>> shift) & 255);
  return bytes;
}

function compressBlock(hash: number[], bytes: number[], offset: number): void {
  const words = new Array<number>(64);
  for (let index = 0; index < 16; index += 1) {
    const start = offset + index * 4;
    words[index] =
      (bytes[start] << 24) |
      (bytes[start + 1] << 16) |
      (bytes[start + 2] << 8) |
      bytes[start + 3];
  }
  for (let index = 16; index < 64; index += 1) {
    const x = words[index - 15];
    const y = words[index - 2];
    const s0 = rotateRight(x, 7) ^ rotateRight(x, 18) ^ (x >>> 3);
    const s1 = rotateRight(y, 17) ^ rotateRight(y, 19) ^ (y >>> 10);
    words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
  }
  let [a, b, c, d, e, f, g, h] = hash;
  for (let index = 0; index < 64; index += 1) {
    const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
    const choice = (e & f) ^ (~e & g);
    const temp1 =
      (h + sum1 + choice + SHA256_CONSTANTS[index] + words[index]) >>> 0;
    const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
    const majority = (a & b) ^ (a & c) ^ (b & c);
    const temp2 = (sum0 + majority) >>> 0;
    [a, b, c, d, e, f, g, h] = [
      (temp1 + temp2) >>> 0,
      a,
      b,
      c,
      (d + temp1) >>> 0,
      e,
      f,
      g,
    ];
  }
  const next = [a, b, c, d, e, f, g, h];
  for (let index = 0; index < 8; index += 1)
    hash[index] = (hash[index] + next[index]) >>> 0;
}

/** Deterministic SHA-256 used only to avoid disclosing provider identity in keys. */
export function sha256Hex(value: string): string {
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];
  const bytes = paddedMessage(value);
  for (let offset = 0; offset < bytes.length; offset += 64) {
    compressBlock(hash, bytes, offset);
  }
  return hash.map((word) => word.toString(16).padStart(8, "0")).join("");
}

export function canonicalServerIdentity(serverUrl: string): string {
  const parsed = new URL(serverUrl);
  const pathname = parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${pathname}`;
}

/** Stable, non-reversible token key for one server and native service scope. */
export function providerTokenStorageKey(
  config: Pick<CedrosLoginConfig, "serverUrl" | "secureStorage">,
): string {
  const service = config.secureStorage?.service?.trim() || DEFAULT_SERVICE;
  const identity = `${canonicalServerIdentity(config.serverUrl)}\0${service}`;
  return `${SCOPED_TOKEN_PREFIX}${sha256Hex(identity)}`;
}
