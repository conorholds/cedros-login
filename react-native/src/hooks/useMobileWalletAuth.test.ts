import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mocks ---

vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return (globalThis as Record<string, unknown>).__TEST_PLATFORM_OS__ ?? 'android';
    },
  },
}));

vi.mock('../context/CedrosLoginProvider', () => ({
  useCedrosLogin: () => ({
    config: (globalThis as Record<string, unknown>).__TEST_CONFIG__ ?? {},
  }),
}));

const mockGetSolanaChallenge = vi.fn();
vi.mock('../services/api', () => ({
  getAuthApi: () => ({
    getSolanaChallenge: mockGetSolanaChallenge,
  }),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useState: (initial: unknown) => [initial, vi.fn()],
    useCallback: (fn: (...args: unknown[]) => unknown) => fn,
  };
});

// --- Helpers ---

import {
  useMobileWalletAuth,
  _resetMwaCache,
  _setTransact,
} from './useMobileWalletAuth';

function setPlatform(os: string) {
  (globalThis as Record<string, unknown>).__TEST_PLATFORM_OS__ = os;
}

function setConfig(config: Record<string, unknown>) {
  (globalThis as Record<string, unknown>).__TEST_CONFIG__ = config;
}

const DEFAULT_CONFIG = {
  serverUrl: 'https://api.example.com',
  appName: 'TestApp',
  solana: { network: 'mainnet-beta' },
};

const mockAuthorize = vi.fn();
const mockSignMessages = vi.fn();
const mockTransact = vi.fn(
  async (callback: (wallet: unknown) => Promise<unknown>) =>
    callback({ authorize: mockAuthorize, signMessages: mockSignMessages }),
);

describe('useMobileWalletAuth', () => {
  beforeEach(() => {
    setPlatform('android');
    setConfig(DEFAULT_CONFIG);
    _resetMwaCache();

    mockGetSolanaChallenge.mockReset();
    mockAuthorize.mockReset();
    mockSignMessages.mockReset();
    mockTransact.mockReset();
    mockTransact.mockImplementation(
      async (callback: (wallet: unknown) => Promise<unknown>) =>
        callback({ authorize: mockAuthorize, signMessages: mockSignMessages }),
    );
  });

  it('isAvailable is false on iOS', () => {
    setPlatform('ios');
    _resetMwaCache();

    const result = useMobileWalletAuth();
    expect(result.isAvailable).toBe(false);
  });

  it('isAvailable is false when no MWA package is installed', () => {
    // _resetMwaCache already cleared — require() will fail naturally
    const result = useMobileWalletAuth();
    expect(result.isAvailable).toBe(false);
  });

  it('isAvailable is true when transact is injected', () => {
    _setTransact(mockTransact as never);

    const result = useMobileWalletAuth();
    expect(result.isAvailable).toBe(true);
  });

  it('happy path: authorize + challenge + sign returns credentials', async () => {
    _setTransact(mockTransact as never);

    mockAuthorize.mockResolvedValue({
      accounts: [{ address: 'SolAddr123' }],
      auth_token: 'tok',
    });
    mockGetSolanaChallenge.mockResolvedValue({
      nonce: 'test-nonce',
      message: 'Sign this message',
      expiresAt: '2026-12-31T00:00:00Z',
    });
    const fakeSig = new Uint8Array(64).fill(42);
    mockSignMessages.mockResolvedValue([fakeSig]);

    const { connect } = useMobileWalletAuth();
    const creds = await connect();

    expect(creds.walletAddress).toBe('SolAddr123');
    expect(creds.nonce).toBe('test-nonce');
    expect(typeof creds.signature).toBe('string');
    expect(creds.signature.length).toBeGreaterThan(0);

    // Verify authorize was called with correct cluster and identity
    expect(mockAuthorize).toHaveBeenCalledWith({
      cluster: 'solana:mainnet',
      identity: {
        name: 'TestApp',
        uri: 'https://api.example.com',
        icon: undefined,
      },
    });

    // Verify challenge was fetched for the correct address
    expect(mockGetSolanaChallenge).toHaveBeenCalledWith('SolAddr123');

    // Verify signMessages was called with correct payload
    expect(mockSignMessages).toHaveBeenCalledWith({
      addresses: ['SolAddr123'],
      payloads: [new TextEncoder().encode('Sign this message')],
    });
  });

  it('connect throws when MWA is not available on Android', async () => {
    // No transact injected, require() fails → not available
    const { connect } = useMobileWalletAuth();

    await expect(connect()).rejects.toThrow(
      'Install @wallet-ui/react-native-web3js to use MWA',
    );
  });

  it('connect throws on iOS with appropriate message', async () => {
    setPlatform('ios');
    _resetMwaCache();

    const { connect } = useMobileWalletAuth();

    await expect(connect()).rejects.toThrow(
      'Solana Mobile Wallet Adapter is only available on Android',
    );
  });

  it('error from wallet rejection is surfaced', async () => {
    _setTransact(mockTransact as never);
    mockAuthorize.mockRejectedValue(new Error('User rejected the request'));

    const { connect } = useMobileWalletAuth();

    await expect(connect()).rejects.toThrow('User rejected the request');
  });

  it('uses devnet cluster when configured', async () => {
    setConfig({
      ...DEFAULT_CONFIG,
      solana: { network: 'devnet' },
    });
    _setTransact(mockTransact as never);

    mockAuthorize.mockResolvedValue({
      accounts: [{ address: 'Addr' }],
      auth_token: 'tok',
    });
    mockGetSolanaChallenge.mockResolvedValue({
      nonce: 'n',
      message: 'msg',
      expiresAt: '2026-12-31T00:00:00Z',
    });
    mockSignMessages.mockResolvedValue([new Uint8Array(64).fill(1)]);

    const { connect } = useMobileWalletAuth();
    await connect();

    expect(mockAuthorize).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: 'solana:devnet' }),
    );
  });
});
