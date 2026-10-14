import { useState, useCallback, useMemo } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { ApiClient, handleApiError } from '../utils/apiClient';
import { validateSolanaPublicKey } from '../utils/validation';
import type {
  AuthError,
  ChallengeResponse,
  LoginAttemptResponse,
  WalletLinkResponse,
} from '../types';

export interface UseSolanaAuthReturn {
  requestChallenge: (publicKey: string) => Promise<ChallengeResponse>;
  /** @param accessCode Optional signup access code, forwarded to the server on new registrations. */
  signIn: (
    publicKey: string,
    signature: string,
    message: string,
    accessCode?: string
  ) => Promise<LoginAttemptResponse>;
  /**
   * Attach the wallet to the CURRENT signed-in account instead of signing in
   * (POST /solana/link). Same challenge/signature proof as `signIn`; the
   * server rejects wallets already linked to another account (409).
   */
  linkWallet: (
    publicKey: string,
    signature: string,
    message: string
  ) => Promise<WalletLinkResponse>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

/**
 * Hook for Solana wallet authentication.
 *
 * @example
 * ```tsx
 * function SolanaLogin() {
 *   const { requestChallenge, signIn, isLoading } = useSolanaAuth();
 *   const { publicKey, signMessage } = useWallet();
 *
 *   const handleLogin = async () => {
 *     const challenge = await requestChallenge(publicKey.toBase58());
 *     const signature = await signMessage(new TextEncoder().encode(challenge.message));
 *     const result = await signIn(
 *       publicKey.toBase58(),
 *       Buffer.from(signature).toString('base64'),
 *       challenge.message
 *     );
 *   };
 * }
 * ```
 */
export function useSolanaAuth(): UseSolanaAuthReturn {
  const { config, _internal } = useCedrosLogin();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
        // linkWallet is an authenticated route; sign-in routes ignore the header.
        getAccessToken: _internal?.getAccessToken,
      }),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal?.getAccessToken]
  );

  const requestChallenge = useCallback(
    async (publicKey: string): Promise<ChallengeResponse> => {
      // Validate public key format before making API call
      if (!validateSolanaPublicKey(publicKey)) {
        const authError: AuthError = {
          code: 'INVALID_PUBLIC_KEY',
          message: 'Invalid Solana public key format',
        };
        setError(authError);
        throw authError;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await apiClient.post<ChallengeResponse>(
          '/solana/challenge',
          { publicKey },
          { credentials: 'omit' }
        );
        return data;
      } catch (err) {
        const authError = handleApiError(
          err,
          'Unable to start wallet verification. Please try again.'
        );
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const signIn = useCallback(
    async (
      publicKey: string,
      signature: string,
      message: string,
      accessCode?: string
    ): Promise<LoginAttemptResponse> => {
      // Validate public key format before making API call
      if (!validateSolanaPublicKey(publicKey)) {
        const authError: AuthError = {
          code: 'INVALID_PUBLIC_KEY',
          message: 'Invalid Solana public key format',
        };
        setError(authError);
        throw authError;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await apiClient.post<LoginAttemptResponse>('/solana', {
          publicKey,
          signature,
          message,
          referral: _internal?.getReferralCode?.() ?? undefined,
          accessCode: accessCode || undefined,
        });
        if (!('mfaRequired' in data)) {
          config.callbacks?.onLoginSuccess?.(data.user, 'solana');
          _internal?.handleLoginSuccess(data.user, data.tokens);
        }
        return data;
      } catch (err) {
        const authError = handleApiError(
          err,
          'Unable to sign in with your wallet. Please try again.'
        );
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, config.callbacks, _internal]
  );

  const linkWallet = useCallback(
    async (publicKey: string, signature: string, message: string): Promise<WalletLinkResponse> => {
      if (!validateSolanaPublicKey(publicKey)) {
        const authError: AuthError = {
          code: 'INVALID_PUBLIC_KEY',
          message: 'Invalid Solana public key format',
        };
        setError(authError);
        throw authError;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Authenticated route: cookies/bearer ride along via ApiClient defaults.
        return await apiClient.post<WalletLinkResponse>('/solana/link', {
          publicKey,
          signature,
          message,
        });
      } catch (err) {
        const authError = handleApiError(
          err,
          'Unable to link this wallet to your account. Please try again.'
        );
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    requestChallenge,
    signIn,
    linkWallet,
    isLoading,
    error,
    clearError,
  };
}
