/**
 * Direct browser wallet adapter for Solana wallets.
 *
 * Enumerates detected browser wallet extensions and provides a normalized
 * interface for connect + sign, bypassing the need for @solana/wallet-adapter-react.
 */
import { isValidSolanaProvider, WALLET_PROVIDERS, type WindowWithWallets } from './walletDetection';

/** Raw Solana wallet provider interface (e.g. window.phantom.solana) */
export interface SolanaProvider {
  connect: () => Promise<{ publicKey: { toBase58: () => string } }>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array | { signature: Uint8Array }>;
  disconnect?: () => Promise<void>;
  isConnected?: boolean;
  publicKey?: { toBase58: () => string } | null;
}

/** A detected browser wallet ready for interaction */
export interface BrowserWallet {
  /** Internal key matching WALLET_PROVIDERS or 'solana' for generic */
  key: string;
  /** Human-readable display name */
  name: string;
  /** Data URI icon for rendering */
  icon: string;
  /** The raw provider object */
  provider: SolanaProvider;
}

const WALLET_DISPLAY_NAMES: Record<string, string> = {
  phantom: 'Phantom',
  solflare: 'Solflare',
  backpack: 'Backpack',
  glow: 'Glow',
  slope: 'Slope',
  sollet: 'Sollet',
  coin98: 'Coin98',
  clover: 'Clover',
  mathWallet: 'MathWallet',
  ledger: 'Ledger',
  torus: 'Torus',
  walletconnect: 'WalletConnect',
  solana: 'Solana Wallet',
};

// Generic wallet SVG icon (simple wallet outline) as data URI
const GENERIC_WALLET_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12V7H5a2 2 0 0 1 0-4h14v4'/%3E%3Cpath d='M3 5v14a2 2 0 0 0 2 2h16v-5'/%3E%3Cpath d='M18 12a2 2 0 0 0 0 4h4v-4Z'/%3E%3C/svg%3E";

// Well-known wallet icons (brand-colored SVGs)
const WALLET_ICONS: Record<string, string> = {
  phantom:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' rx='26' fill='%23AB9FF2'/%3E%3Cpath d='M110.5 64.2c-.3-3-3-5.2-6-4.8-13.6 1.6-25 7.1-33.5 15.9-5.3 5.4-9 11.7-11.3 18.5-1.1 3.3.7 6.9 4.1 7.9 3.3 1.1 6.9-.7 7.9-4.1 1.7-5.1 4.5-9.7 8.3-13.6 6.4-6.6 15-10.7 25.5-12 3-.3 5.2-3 4.8-6l.2-1.8zM110.2 43.8c-.3-3-3-5.2-6-4.8-25.2 3-44.1 18-53.5 39.2-1.3 2.9.1 6.3 3.1 7.6s6.3-.1 7.6-3.1c7.9-17.9 23.8-30.5 45.8-33.1 3-.3 5.2-3 4.8-6l-1.8-1.8zM44.8 44.5c2.9-1.5 4.1-5.1 2.5-8-1.5-2.9-5.1-4.1-8-2.5C24.4 42.1 16 57.9 16 75.8c0 3.3 2.7 6 6 6s6-2.7 6-6c0-14 6.5-26.3 16.8-31.3z' fill='%23FFFDF8'/%3E%3C/svg%3E",
  solflare:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' rx='26' fill='%23FC7227'/%3E%3Cpath d='M64 28l28 36-28 36-28-36z' fill='%23fff'/%3E%3C/svg%3E",
  backpack:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' rx='26' fill='%23E33E3F'/%3E%3Cpath d='M48 42h32v8H48zM40 54h48v36H40z' fill='%23fff'/%3E%3C/svg%3E",
};

/**
 * Enumerate detected browser wallets with display info and provider references.
 *
 * @returns Array of BrowserWallet objects for each detected, valid wallet
 */
export function getBrowserWallets(): BrowserWallet[] {
  if (typeof window === 'undefined') return [];

  const win = window as WindowWithWallets;
  const wallets: BrowserWallet[] = [];

  for (const key of WALLET_PROVIDERS) {
    const walletObj = win[key];
    if (
      walletObj &&
      typeof walletObj === 'object' &&
      'solana' in walletObj &&
      isValidSolanaProvider(walletObj.solana)
    ) {
      wallets.push({
        key,
        name: WALLET_DISPLAY_NAMES[key] ?? key,
        icon: WALLET_ICONS[key] ?? GENERIC_WALLET_ICON,
        provider: walletObj.solana as SolanaProvider,
      });
    }
  }

  // Check for generic Solana provider when no named wallets found
  if (wallets.length === 0 && isValidSolanaProvider(win.solana)) {
    wallets.push({
      key: 'solana',
      name: WALLET_DISPLAY_NAMES.solana ?? 'Solana Wallet',
      icon: GENERIC_WALLET_ICON,
      provider: win.solana as SolanaProvider,
    });
  }

  return wallets;
}

/**
 * Normalize wallet signMessage return value.
 *
 * Phantom returns `{ signature: Uint8Array }`, while Solflare/Backpack
 * return raw `Uint8Array`. This handles both formats.
 *
 * @throws Error if result is neither format
 */
export function normalizeSignature(result: Uint8Array | { signature: Uint8Array }): Uint8Array {
  if (result instanceof Uint8Array) return result;

  if (
    result &&
    typeof result === 'object' &&
    'signature' in result &&
    result.signature instanceof Uint8Array
  ) {
    return result.signature;
  }

  throw new Error('Wallet returned invalid signature format');
}
