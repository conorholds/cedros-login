/**
 * Unit tests for wallet detection utilities
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { detectSolanaWallets } from './walletDetection';

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

// Helper to safely get window as record
function getWindow(): Record<string, unknown> {
  return window as unknown as Record<string, unknown>;
}

// Create a valid mock wallet with expected methods
const mockValidWallet = {
  connect: () => Promise.resolve(),
  isConnected: false,
};

// Create a spoofed wallet that lacks proper methods
const mockSpoofedWallet = {};

describe('walletDetection', () => {
  beforeEach(() => {
    // Clean up wallet-related properties before each test
    const win = getWindow();
    for (const prop of WALLET_PROPS) {
      delete win[prop];
    }
  });

  describe('detectSolanaWallets', () => {
    it('should return false when no wallets are installed', () => {
      expect(detectSolanaWallets()).toBe(false);
    });

    it('should detect Phantom wallet', () => {
      getWindow().phantom = { solana: mockValidWallet };
      expect(detectSolanaWallets()).toBe(true);
    });

    it('should detect Solflare wallet', () => {
      getWindow().solflare = { solana: mockValidWallet };
      expect(detectSolanaWallets()).toBe(true);
    });

    it('should detect Backpack wallet', () => {
      getWindow().backpack = { solana: mockValidWallet };
      expect(detectSolanaWallets()).toBe(true);
    });

    it('should detect Glow wallet', () => {
      getWindow().glow = { solana: mockValidWallet };
      expect(detectSolanaWallets()).toBe(true);
    });

    it('should detect generic Solana provider', () => {
      getWindow().solana = mockValidWallet;
      expect(detectSolanaWallets()).toBe(true);
    });

    it('should detect multiple wallets', () => {
      getWindow().phantom = { solana: mockValidWallet };
      getWindow().solflare = { solana: mockValidWallet };
      expect(detectSolanaWallets()).toBe(true);
    });

    it('should return false for wallet without solana property', () => {
      getWindow().phantom = { ethereum: mockValidWallet };
      expect(detectSolanaWallets()).toBe(false);
    });

    it('should return false for null wallet object', () => {
      getWindow().phantom = null;
      expect(detectSolanaWallets()).toBe(false);
    });

    it('should return false for non-object wallet', () => {
      getWindow().phantom = 'string';
      expect(detectSolanaWallets()).toBe(false);
    });

    // New test for spoofed wallets
    it('should return false for spoofed wallet without methods', () => {
      getWindow().phantom = { solana: mockSpoofedWallet };
      expect(detectSolanaWallets()).toBe(false);
    });

    it('should return false for wallet with null solana property', () => {
      getWindow().phantom = { solana: null };
      expect(detectSolanaWallets()).toBe(false);
    });

    it('should return false for wallet with undefined solana property', () => {
      getWindow().phantom = { solana: undefined };
      expect(detectSolanaWallets()).toBe(false);
    });
  });

  describe('SSR safety', () => {
    it('detectSolanaWallets should handle browser environment', () => {
      // We can't truly test SSR in jsdom, but we verify the function exists
      expect(typeof detectSolanaWallets).toBe('function');
      expect(detectSolanaWallets()).toBe(false);
    });
  });

  describe('all supported wallets', () => {
    const walletProviders = [
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
    ];

    walletProviders.forEach((provider) => {
      it(`should detect ${provider} wallet`, () => {
        getWindow()[provider] = { solana: mockValidWallet };
        expect(detectSolanaWallets()).toBe(true);
      });
    });
  });
});
