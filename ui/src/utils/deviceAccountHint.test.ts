import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../types';
import {
  DEVICE_ACCOUNT_HINT_KEY,
  clearDeviceAccountHint,
  detectDeviceAccountPrompt,
  dismissDeviceAccountPair,
  readDeviceAccountHint,
  recordDeviceAccountHint,
  sha256Hex,
} from './deviceAccountHint';

const baseUser: AuthUser = {
  id: 'user-1',
  email: 'customer@gmail.com',
  authMethods: ['google'],
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('device account hint storage', () => {
  it('stores only a masked label and hash for successful logins', async () => {
    await recordDeviceAccountHint(baseUser, 'google');

    const raw = localStorage.getItem(DEVICE_ACCOUNT_HINT_KEY);
    expect(raw).toBeTruthy();
    expect(raw).not.toContain('customer@gmail.com');

    const hint = readDeviceAccountHint();
    expect(hint).toMatchObject({
      label: 'c•••@gmail.com',
      method: 'google',
      dismissedIdHashes: [],
    });
    expect(hint?.idHash).toHaveLength(64);
  });

  it('detects mismatched identifiers but skips matching, dismissed, absent, and corrupt hints', async () => {
    expect(await detectDeviceAccountPrompt('new@gmail.com', 'email')).toBeNull();

    await recordDeviceAccountHint(baseUser, 'google');
    expect(await detectDeviceAccountPrompt('customer@gmail.com', 'email')).toBeNull();

    const mismatch = await detectDeviceAccountPrompt('new@gmail.com', 'email');
    expect(mismatch?.hint.label).toBe('c•••@gmail.com');

    const newHash = await sha256Hex('new@gmail.com');
    expect(newHash).toBeTruthy();
    dismissDeviceAccountPair(newHash!);
    expect(await detectDeviceAccountPrompt('new@gmail.com', 'email')).toBeNull();

    localStorage.setItem(DEVICE_ACCOUNT_HINT_KEY, '{bad json');
    expect(await detectDeviceAccountPrompt('other@gmail.com', 'email')).toBeNull();

    clearDeviceAccountHint();
    expect(readDeviceAccountHint()).toBeNull();
  });
});
