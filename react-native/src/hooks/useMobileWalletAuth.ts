/**
 * Internal hook for Solana Mobile Wallet Adapter (MWA) authentication.
 *
 * Encapsulates the full challenge-sign flow:
 * 1. Open MWA session via transact()
 * 2. Authorize with the wallet to get the public key
 * 3. Fetch a challenge nonce from the server
 * 4. Sign the challenge message with the wallet
 * 5. Return { walletAddress, signature, nonce } for useSolanaAuth.signIn()
 *
 * Requires one of these optional peer deps to be installed:
 * - @wallet-ui/react-native-web3js (recommended)
 * - @solana-mobile/mobile-wallet-adapter-protocol-web3js (legacy)
 *
 * MWA is Android-only. On iOS, isAvailable is always false.
 */

import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useCedrosLogin } from '../context/CedrosLoginProvider';
import { getAuthApi } from '../services/api';
import { base58Encode } from '../crypto/solanaKeypair';
import type { AuthError } from '../types';

/** Credentials returned by the MWA sign-in flow */
export interface MobileWalletCredentials {
  walletAddress: string;
  signature: string;
  nonce: string;
}

export interface UseMobileWalletAuthReturn {
  /** Execute the full MWA challenge-sign flow */
  connect: () => Promise<MobileWalletCredentials>;
  /** Whether MWA is available (Android + package installed) */
  isAvailable: boolean;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

// --- Minimal MWA type definitions (avoids requiring the package for type checks) ---

interface MwaAuthorizationResult {
  accounts: Array<{ address: string }>;
  auth_token: string;
}

interface MwaWallet {
  authorize(params: {
    cluster: string;
    identity: { name?: string; uri?: string; icon?: string };
  }): Promise<MwaAuthorizationResult>;
  signMessages(params: {
    addresses: string[];
    payloads: Uint8Array[];
  }): Promise<Uint8Array[]>;
}

type TransactFn = <T>(
  callback: (wallet: MwaWallet) => Promise<T>,
) => Promise<T>;

// --- Cached MWA module resolution ---

let cachedTransact: TransactFn | null = null;
let resolutionAttempted = false;

/**
 * Attempt to load the MWA transact function from installed packages.
 * Tries @wallet-ui/react-native-web3js first, falls back to the legacy package.
 * Returns null if neither is installed.
 */
function resolveTransact(): TransactFn | null {
  if (cachedTransact) return cachedTransact;
  if (resolutionAttempted) return null;
  resolutionAttempted = true;

  // Dynamic require — works in React Native (Metro bundler).
  // In test environments, mock the module with vi.mock().
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@wallet-ui/react-native-web3js');
    cachedTransact = mod.transact as TransactFn;
    return cachedTransact;
  } catch {
    // Not installed, try fallback
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
    cachedTransact = mod.transact as TransactFn;
    return cachedTransact;
  } catch {
    // Not installed
  }

  return null;
}

/** Reset cached state (for testing) */
export function _resetMwaCache(): void {
  cachedTransact = null;
  resolutionAttempted = false;
}

/** Inject a transact function (for testing) */
export function _setTransact(fn: TransactFn | null): void {
  cachedTransact = fn;
  resolutionAttempted = true;
}

export function useMobileWalletAuth(): UseMobileWalletAuthReturn {
  const { config } = useCedrosLogin();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const isAndroid = Platform.OS === 'android';
  const transact = isAndroid ? resolveTransact() : null;
  const isAvailable = transact !== null;

  const connect = useCallback(async (): Promise<MobileWalletCredentials> => {
    if (!transact) {
      const msg =
        Platform.OS !== 'android'
          ? 'Solana Mobile Wallet Adapter is only available on Android'
          : 'Install @wallet-ui/react-native-web3js to use MWA';
      throw new Error(msg);
    }

    setIsLoading(true);
    setError(null);

    try {
      const cluster =
        config.solana?.network === 'devnet'
          ? 'solana:devnet'
          : 'solana:mainnet';

      const identity = {
        name: config.appName ?? 'Cedros',
        uri: config.solana?.appUri ?? config.serverUrl,
        icon: config.solana?.appIcon,
      };

      const credentials = await transact(async (wallet) => {
        // 1. Authorize — wallet shows approval UI with app identity
        const authResult = await wallet.authorize({ cluster, identity });
        const walletAddress = authResult.accounts[0].address;

        // 2. Fetch challenge from our server
        const { nonce, message } = await getAuthApi().getSolanaChallenge(
          walletAddress,
        );

        // 3. Sign the challenge message
        const messageBytes = new TextEncoder().encode(message);
        const signedMessages = await wallet.signMessages({
          addresses: [walletAddress],
          payloads: [messageBytes],
        });

        return {
          walletAddress,
          signature: base58Encode(signedMessages[0]),
          nonce,
        };
      });

      return credentials;
    } catch (err) {
      const authError: AuthError =
        err instanceof Error
          ? { code: 'WALLET_ERROR', message: err.message }
          : { code: 'WALLET_ERROR', message: 'Wallet connection failed' };
      setError(authError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [config, transact]);

  const clearError = useCallback(() => setError(null), []);

  return { connect, isAvailable, isLoading, error, clearError };
}
