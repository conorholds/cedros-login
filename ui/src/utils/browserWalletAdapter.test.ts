/**
 * Unit tests for browser wallet adapter utilities
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { getBrowserWallets, normalizeSignature } from './browserWalletAdapter';

// Wallet properties to clean up
const WALLET_PROPS = [
  'phantom',
  'solflare',
  'backpack',
  'glow',
  'slope',
  'sollet',
  'coin98',
  'clover',
  'mathWallet',
  'ledger',
  'torus',
  'walletconnect',
  'solana',
] as const;

function getWindow(): Record<string, unknown> {
  return window as unknown as Record<string, unknown>;
}

// Valid mock wallet with expected methods
const mockValidWallet = {
  connect: () => Promise.resolve({ publicKey: { toBase58: () => 'abc123' } }),
  signMessage: () => Promise.resolve(new Uint8Array([1, 2, 3])),
  isConnected: false,
};

// Spoofed wallet without proper methods
const mockSpoofedWallet = {};

describe('browserWalletAdapter', () => {
  beforeEach(() => {
    const win = getWindow();
    for (const prop of WALLET_PROPS) {
      delete win[prop];
    }
  });

  describe('getBrowserWallets', () => {
    it('should return empty array when no wallets are installed', () => {
      expect(getBrowserWallets()).toEqual([]);
    });

    it('should return Phantom wallet when window.phantom.solana is present', () => {
      getWindow().phantom = { solana: mockValidWallet };
      const wallets = getBrowserWallets();
      expect(wallets).toHaveLength(1);
      expect(wallets[0].key).toBe('phantom');
      expect(wallets[0].name).toBe('Phantom');
      expect(wallets[0].provider).toBe(mockValidWallet);
      expect(wallets[0].icon).toMatch(/^data:image\/svg\+xml/);
    });

    it('should return multiple wallets when detected', () => {
      getWindow().phantom = { solana: mockValidWallet };
      getWindow().solflare = { solana: { ...mockValidWallet } };
      const wallets = getBrowserWallets();
      expect(wallets).toHaveLength(2);
      expect(wallets.map((w) => w.key)).toEqual(['phantom', 'solflare']);
    });

    it('should skip spoofed wallets without expected methods', () => {
      getWindow().phantom = { solana: mockSpoofedWallet };
      expect(getBrowserWallets()).toEqual([]);
    });

    it('should skip wallet entries without solana property', () => {
      getWindow().phantom = { ethereum: mockValidWallet };
      expect(getBrowserWallets()).toEqual([]);
    });

    it('should include generic solana provider when no named wallets found', () => {
      getWindow().solana = mockValidWallet;
      const wallets = getBrowserWallets();
      expect(wallets).toHaveLength(1);
      expect(wallets[0].key).toBe('solana');
      expect(wallets[0].name).toBe('Solana Wallet');
    });

    it('should not include generic solana provider when named wallets are present', () => {
      getWindow().phantom = { solana: mockValidWallet };
      getWindow().solana = mockValidWallet;
      const wallets = getBrowserWallets();
      expect(wallets).toHaveLength(1);
      expect(wallets[0].key).toBe('phantom');
    });

    it('should provide display names for known wallets', () => {
      getWindow().backpack = { solana: { ...mockValidWallet } };
      const wallets = getBrowserWallets();
      expect(wallets[0].name).toBe('Backpack');
    });
  });

  describe('normalizeSignature', () => {
    it('should pass through raw Uint8Array', () => {
      const sig = new Uint8Array([1, 2, 3]);
      expect(normalizeSignature(sig)).toBe(sig);
    });

    it('should extract signature from { signature: Uint8Array } wrapper', () => {
      const inner = new Uint8Array([4, 5, 6]);
      const result = normalizeSignature({ signature: inner });
      expect(result).toBe(inner);
    });

    it('should throw for invalid format', () => {
      expect(() => normalizeSignature('bad' as unknown as Uint8Array)).toThrow(
        'Wallet returned invalid signature format'
      );
    });

    it('should throw for object without signature property', () => {
      expect(() => normalizeSignature({} as unknown as Uint8Array)).toThrow(
        'Wallet returned invalid signature format'
      );
    });

    it('should throw for null', () => {
      expect(() => normalizeSignature(null as unknown as Uint8Array)).toThrow(
        'Wallet returned invalid signature format'
      );
    });
  });
});
