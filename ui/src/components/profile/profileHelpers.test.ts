import { describe, expect, it } from 'vitest';
import { getInitials, getDisplayName, shortenWalletAddress } from './profileHelpers';

const WALLET = 'So11111111111111111111111111111111111111112';

describe('getInitials', () => {
  it('uses name, then email, then wallet, then a placeholder', () => {
    expect(getInitials({ name: 'Site Owner' })).toBe('SO');
    expect(getInitials({ email: 'owner@example.com' })).toBe('O');
    expect(getInitials({ walletAddress: WALLET })).toBe('SO');
    expect(getInitials(null)).toBe('?');
    expect(getInitials({})).toBe('?');
  });
});

describe('shortenWalletAddress', () => {
  it('truncates long addresses to first/last four', () => {
    expect(shortenWalletAddress(WALLET)).toBe('So11…1112');
  });

  it('returns short values unchanged', () => {
    expect(shortenWalletAddress('abc123')).toBe('abc123');
  });
});

describe('getDisplayName', () => {
  it('prefers an explicit name', () => {
    expect(getDisplayName({ name: 'Site Owner', email: 'owner@example.com' })).toBe('Site Owner');
  });

  it('falls back to email, then a shortened wallet, then "User"', () => {
    expect(getDisplayName({ email: 'owner@example.com' })).toBe('owner@example.com');
    expect(getDisplayName({ walletAddress: WALLET })).toBe('So11…1112');
    expect(getDisplayName({})).toBe('User');
    expect(getDisplayName(null)).toBe('User');
  });
});
