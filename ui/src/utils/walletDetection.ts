/**
 * Wallet detection utilities for Solana browser wallets
 */

/**
 * Type for window with potential Solana wallet extensions
 */
export interface WindowWithWallets extends Window {
  phantom?: { solana?: unknown };
  solflare?: { solana?: unknown };
  backpack?: { solana?: unknown };
  glow?: { solana?: unknown };
  slope?: { solana?: unknown };
  sollet?: { solana?: unknown };
  coin98?: { solana?: unknown };
  clover?: { solana?: unknown };
  mathWallet?: { solana?: unknown };
  ledger?: { solana?: unknown };
  torus?: { solana?: unknown };
  walletconnect?: { solana?: unknown };
  solana?: unknown;
}

/**
 * Known Solana wallet provider names to check for on the window object
 */
type WalletProviderName = Exclude<keyof WindowWithWallets, keyof Window>;

export const WALLET_PROVIDERS: WalletProviderName[] = [
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

/**
 * Validates that a wallet provider object has expected Solana wallet methods.
 * Prevents spoofed wallet objects from being accepted.
 */
export function isValidSolanaProvider(provider: unknown): boolean {
  if (!provider || typeof provider !== 'object') return false;
  const wallet = provider as Record<string, unknown>;
  // Check for at least one expected wallet method/property
  // Real wallets have connect, signMessage, signTransaction, etc.
  return (
    typeof wallet.connect === 'function' ||
    typeof wallet.signMessage === 'function' ||
    typeof wallet.signTransaction === 'function' ||
    'isConnected' in wallet
  );
}

/**
 * Detect Android Chrome specifically (MWA only works on Chrome, not Brave/Firefox/Opera).
 * Brave's UA includes "Chrome" but exposes `navigator.brave` which Chrome does not.
 * @see https://docs.solanamobile.com/get-started/web/apps
 */
export function isAndroidChrome(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isBrave = 'brave' in navigator;
  return /Android/i.test(ua) && /Chrome\/\d+/.test(ua) && !isBrave;
}

/**
 * Detects if any Solana wallet extensions are installed in the browser.
 * Checks for common wallet adapters like Phantom, Solflare, Backpack, etc.
 *
 * @returns true if at least one Solana wallet is detected
 *
 * @example
 * ```tsx
 * if (detectSolanaWallets()) {
 *   // Show Solana login button
 * }
 * ```
 */
export function detectSolanaWallets(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const win = window as WindowWithWallets;

  // Check window object for wallet injections
  // Validate wallet has expected methods to reject spoofed providers
  for (const provider of WALLET_PROVIDERS) {
    const walletObj = win[provider];
    if (
      walletObj &&
      typeof walletObj === 'object' &&
      'solana' in walletObj &&
      isValidSolanaProvider(walletObj.solana)
    ) {
      return true;
    }
  }

  // Check for generic Solana provider (e.g., from some mobile wallet browsers)
  // Also validate generic provider
  if (isValidSolanaProvider(win.solana)) {
    return true;
  }

  // On Android Chrome, MWA connects to native wallet apps (e.g., Phantom, Solflare)
  // via Android intents — no browser extension needed. MWA only works on Chrome,
  // not Brave/Firefox/Opera (per Solana Mobile docs).
  if (isAndroidChrome()) {
    return true;
  }

  return false;
}
