/**
 * Mobile Wallet Adapter (MWA) registration for web.
 *
 * On Android Chrome, MWA lets users authenticate with their installed Solana
 * wallet app (e.g., Phantom, Solflare) via Android Intents — no browser
 * extension needed.
 *
 * Once registered, MWA appears as a wallet option in the wallet adapter's
 * wallet list (alongside browser extension wallets). Users see it as
 * "Use Installed Wallet" in the wallet selector.
 *
 * Requires the optional peer dependency: @solana-mobile/wallet-standard-mobile
 *
 * @see https://docs.solanamobile.com/get-started/web/installation
 */

export interface MobileWalletConfig {
  /** App name shown in the wallet's authorization dialog */
  name?: string;
  /** App URI for identity verification */
  uri?: string;
  /** App icon path/URL shown in the wallet dialog */
  icon?: string;
  /** Solana cluster(s) to support. Default: ['solana:mainnet'] */
  chains?: string[];
}

type MobileWalletModule = typeof import('@solana-mobile/wallet-standard-mobile');

const mobileWalletModuleSpecifier = '@solana-mobile/wallet-standard-mobile';

/**
 * Register Mobile Wallet Adapter as a wallet-standard wallet.
 *
 * Call this once at your application root (before rendering). After registration,
 * MWA automatically appears as "Use Installed Wallet" for users browsing on
 * Android Chrome with a Solana wallet app installed.
 *
 * Must be called in a non-SSR context (browser only). For Next.js, call in a
 * Client Component with `'use client'`.
 *
 * @example
 * ```tsx
 * import { registerMobileWallet, CedrosLoginProvider } from '@cedros/login-react';
 *
 * // Register before provider mounts
 * registerMobileWallet({ name: 'My App', uri: 'https://myapp.com' });
 *
 * function App() {
 *   return (
 *     <CedrosLoginProvider config={{ serverUrl: '...' }}>
 *       <LoginForm />
 *     </CedrosLoginProvider>
 *   );
 * }
 * ```
 *
 * @returns Promise resolving to true if registration succeeded, false otherwise
 */
export async function registerMobileWallet(config?: MobileWalletConfig): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Dynamic import() — works in browser ESM (unlike require() which only
    // works in CJS/Node). The package is externalized in Vite library mode,
    // so the consumer must have it installed for this to resolve.
    const mwa = (await import(
      /* @vite-ignore */ mobileWalletModuleSpecifier
    )) as MobileWalletModule;

    const chains = config?.chains ?? ['solana:mainnet'];

    mwa.registerMwa({
      appIdentity: {
        name: config?.name,
        uri: config?.uri,
        icon: config?.icon,
      },
      chains: chains as [`${string}:${string}`, ...`${string}:${string}`[]],
      authorizationCache: mwa.createDefaultAuthorizationCache(),
      chainSelector: mwa.createDefaultChainSelector(),
      onWalletNotFound: mwa.createDefaultWalletNotFoundHandler(),
    });
    return true;
  } catch {
    // @solana-mobile/wallet-standard-mobile not installed or import failed
    return false;
  }
}
