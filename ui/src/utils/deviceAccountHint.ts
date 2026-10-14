import type { AuthMethod, AuthUser } from '../types';
import { safeGetItem, safeRemoveItem, safeSetItem } from './safeStorage';

export const DEVICE_ACCOUNT_HINT_KEY = 'cedros_last_account';

export type DeviceAccountHintMethod = Extract<
  AuthMethod,
  'email' | 'password' | 'google' | 'apple' | 'solana' | 'webauthn'
>;

export interface DeviceAccountHint {
  label: string;
  method: DeviceAccountHintMethod;
  idHash: string;
  updatedAt: string;
  dismissedIdHashes: string[];
}

export interface DeviceAccountDetection {
  hint: DeviceAccountHint;
  idHash: string;
  label: string;
}

const EMAIL_METHODS = new Set<DeviceAccountHintMethod>([
  'email',
  'password',
  'google',
  'apple',
  'webauthn',
]);

export async function recordDeviceAccountHint(user: AuthUser, method: AuthMethod): Promise<void> {
  const hintMethod = toHintMethod(method);
  if (!hintMethod) return;

  const identifier = identifierFromUser(user, hintMethod);
  if (!identifier) return;

  const normalized = normalizeIdentifier(identifier, hintMethod);
  const idHash = await sha256Hex(normalized);
  if (!idHash) return;

  const previous = readDeviceAccountHint();
  const label = hintMethod === 'solana' ? maskWallet(normalized) : maskEmail(normalized);
  const next: DeviceAccountHint = {
    label,
    method: hintMethod,
    idHash,
    updatedAt: new Date().toISOString(),
    dismissedIdHashes: previous?.idHash === idHash ? previous.dismissedIdHashes : [],
  };

  safeSetItem(DEVICE_ACCOUNT_HINT_KEY, JSON.stringify(next));
}

export async function detectDeviceAccountPrompt(
  identifier: string,
  method: DeviceAccountHintMethod
): Promise<DeviceAccountDetection | null> {
  const hint = readDeviceAccountHint();
  if (!hint) return null;

  const normalized = normalizeIdentifier(identifier, method);
  const idHash = await sha256Hex(normalized);
  if (!idHash || idHash === hint.idHash || hint.dismissedIdHashes.includes(idHash)) {
    return null;
  }

  return {
    hint,
    idHash,
    label: method === 'solana' ? maskWallet(normalized) : maskEmail(normalized),
  };
}

export function readDeviceAccountHint(): DeviceAccountHint | null {
  const raw = safeGetItem(DEVICE_ACCOUNT_HINT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DeviceAccountHint>;
    if (
      typeof parsed.label !== 'string' ||
      typeof parsed.method !== 'string' ||
      !isHintMethod(parsed.method) ||
      typeof parsed.idHash !== 'string' ||
      typeof parsed.updatedAt !== 'string' ||
      !Array.isArray(parsed.dismissedIdHashes) ||
      !parsed.dismissedIdHashes.every((value) => typeof value === 'string')
    ) {
      return null;
    }
    return {
      label: parsed.label,
      method: parsed.method,
      idHash: parsed.idHash,
      updatedAt: parsed.updatedAt,
      dismissedIdHashes: parsed.dismissedIdHashes,
    };
  } catch {
    return null;
  }
}

export function dismissDeviceAccountPair(idHash: string): void {
  const hint = readDeviceAccountHint();
  if (!hint || hint.dismissedIdHashes.includes(idHash)) return;
  safeSetItem(
    DEVICE_ACCOUNT_HINT_KEY,
    JSON.stringify({
      ...hint,
      dismissedIdHashes: [...hint.dismissedIdHashes, idHash],
      updatedAt: new Date().toISOString(),
    })
  );
}

export function clearDeviceAccountHint(): void {
  safeRemoveItem(DEVICE_ACCOUNT_HINT_KEY);
}

function normalizeIdentifier(identifier: string, method: DeviceAccountHintMethod): string {
  const trimmed = identifier.trim();
  return EMAIL_METHODS.has(method) ? trimmed.toLowerCase() : trimmed;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'email account';
  return `${local[0]}${'•'.repeat(Math.min(3, Math.max(1, local.length - 1)))}@${domain}`;
}

function maskWallet(publicKey: string): string {
  if (publicKey.length <= 10) return publicKey;
  return `${publicKey.slice(0, 3)}…${publicKey.slice(-3)}`;
}

export function decodeJwtPayload<T extends Record<string, unknown>>(token: string): T | null {
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as T;
  } catch {
    return null;
  }
}

export async function sha256Hex(value: string): Promise<string | null> {
  try {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return null;
    const digest = await subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  } catch {
    return null;
  }
}

function identifierFromUser(user: AuthUser, method: DeviceAccountHintMethod): string | null {
  if (method === 'solana') return user.walletAddress ?? null;
  return user.email ?? null;
}

function toHintMethod(method: AuthMethod): DeviceAccountHintMethod | null {
  return isHintMethod(method) ? method : null;
}

function isHintMethod(method: string): method is DeviceAccountHintMethod {
  return (
    method === 'email' ||
    method === 'password' ||
    method === 'google' ||
    method === 'apple' ||
    method === 'solana' ||
    method === 'webauthn'
  );
}
