import { useCallback, useMemo, useRef, useState } from 'react';
import { useExternalEffect } from './effects';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { useDeviceAccountLink } from '../context/DeviceAccountLinkContext';
import { ApiClient, handleApiError } from '../utils/apiClient';
import { AccountEmailApiClient } from '../utils/accountEmailApi';
import type { AuthError, AuthResponse, LoginAttemptResponse } from '../types';
import {
  credentialToServerJson,
  parseCreationOptionsFromServer,
  parseRequestOptionsFromServer,
  type ServerCreationOptions,
  type ServerRequestOptions,
} from '../utils/webauthnJson';
import { mapWebAuthnDomError } from '../utils/webauthnErrors';

type WebAuthnCreationOptionsResponse = {
  challengeId: string;
  options: ServerCreationOptions;
};
type WebAuthnRequestOptionsResponse = {
  challengeId: string;
  options: ServerRequestOptions;
};

export interface UseWebAuthnReturn {
  isSupported: boolean;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;

  /**
   * Sign in with an existing passkey. Cancellation never creates an account.
   * @param accessCode Retained for compatibility; use signupWithPasskey for explicit registration.
   */
  continueWithPasskey: (accessCode?: string) => Promise<LoginAttemptResponse>;
  /** Start a server-managed WebAuthn authentication ceremony (login). */
  authenticatePasskey: (params?: { email?: string }) => Promise<LoginAttemptResponse>;
  /** Register a new passkey for the currently authenticated user. */
  registerPasskey: (params?: {
    label?: string;
  }) => Promise<{ credentialId: string; label?: string }>;
  /** Create a new account using a passkey (unauthenticated signup). */
  signupWithPasskey: (params?: {
    email?: string;
    name?: string;
    label?: string;
    /** Optional signup access code forwarded to the server. */
    accessCode?: string;
  }) => Promise<AuthResponse>;
}

function isWebAuthnAvailable(): boolean {
  if (typeof window !== 'undefined') {
    const hostname = window.location?.hostname;
    const isLocalhost =
      hostname === 'localhost' || hostname === '127.0.0.1' || hostname?.endsWith('.localhost');
    const isSecure = window.isSecureContext === true;
    if (!isSecure && !isLocalhost) {
      return false;
    }
  }
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.credentials !== 'undefined'
  );
}

export function useWebAuthn(): UseWebAuthnReturn {
  const { config, _internal } = useCedrosLogin();
  const deviceAccountLink = useDeviceAccountLink();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
        // Needed for authenticated registration endpoints when cookie auth is disabled
        getAccessToken: _internal?.getAccessToken,
      }),
    [_internal?.getAccessToken, config.serverUrl, config.requestTimeout, config.retryAttempts]
  );

  const accountEmailClient = useMemo(
    () =>
      new AccountEmailApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [_internal?.getAccessToken, config.serverUrl, config.requestTimeout, config.retryAttempts]
  );

  const ceremony = useRef<AbortController | null>(null);
  useExternalEffect(() => () => ceremony.current?.abort(), []);
  const beginCeremony = useCallback(() => {
    ceremony.current?.abort();
    ceremony.current = new AbortController();
    return ceremony.current.signal;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const isSupported = isWebAuthnAvailable();

  const authenticatePasskey = useCallback(
    async (params?: { email?: string }): Promise<LoginAttemptResponse> => {
      if (!isSupported) {
        const err: AuthError = {
          code: 'VALIDATION_ERROR',
          message: 'Passkeys are not supported in this browser',
        };
        setError(err);
        throw err;
      }

      const signal = beginCeremony();
      setIsLoading(true);
      setError(null);

      try {
        const optionsResponse = await apiClient.post<WebAuthnRequestOptionsResponse>(
          '/webauthn/auth/options',
          { email: params?.email }
        );

        signal.throwIfAborted();
        const publicKey = parseRequestOptionsFromServer(optionsResponse.options);

        const assertion = (await navigator.credentials.get({
          publicKey,
          signal,
        })) as PublicKeyCredential | null;

        signal.throwIfAborted();
        if (!assertion) {
          throw new Error('Passkey authentication returned no credential');
        }

        const data = await apiClient.post<LoginAttemptResponse>('/webauthn/auth/verify', {
          challengeId: optionsResponse.challengeId,
          credential: credentialToServerJson(assertion),
        });

        signal.throwIfAborted();
        if (!('mfaRequired' in data)) {
          config.callbacks?.onLoginSuccess?.(data.user, 'webauthn');
          _internal?.handleLoginSuccess(data.user, data.tokens);
        }

        return data;
      } catch (err) {
        const apiData =
          typeof err === 'object' && err !== null && 'isApiError' in err
            ? (err as { data?: { code?: string; error?: string } }).data
            : undefined;
        if (apiData?.code === 'INVALID_CREDENTIALS' || apiData?.error === 'invalid_credentials') {
          const authError: AuthError = {
            code: 'INVALID_CREDENTIALS',
            message: 'This passkey is not recognized. Try another passkey or sign in another way.',
          };
          setError(authError);
          throw authError;
        }
        const domMapped = mapWebAuthnDomError(err);
        const authError =
          domMapped ?? handleApiError(err, 'Unable to sign in with passkey. Please try again.');
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, config.callbacks, _internal, isSupported, beginCeremony]
  );

  const registerPasskey = useCallback(
    async (params?: { label?: string }): Promise<{ credentialId: string; label?: string }> => {
      if (!isSupported) {
        const err: AuthError = {
          code: 'VALIDATION_ERROR',
          message: 'Passkeys are not supported in this browser',
        };
        setError(err);
        throw err;
      }

      const signal = beginCeremony();
      setIsLoading(true);
      setError(null);

      try {
        const optionsResponse = await apiClient.post<WebAuthnCreationOptionsResponse>(
          '/webauthn/register/options',
          {}
        );

        signal.throwIfAborted();
        const publicKey = parseCreationOptionsFromServer(optionsResponse.options);

        const created = (await navigator.credentials.create({
          publicKey,
          signal,
        })) as PublicKeyCredential | null;

        signal.throwIfAborted();
        if (!created) {
          throw new Error('Passkey registration returned no credential');
        }

        const result = await apiClient.post<{
          success: boolean;
          credentialId: string;
          label?: string;
        }>('/webauthn/register/verify', {
          challengeId: optionsResponse.challengeId,
          credential: credentialToServerJson(created),
          label: params?.label,
        });

        signal.throwIfAborted();
        if (!result.success) {
          throw new Error('Passkey registration failed');
        }

        return { credentialId: result.credentialId, label: result.label };
      } catch (err) {
        const domMapped = mapWebAuthnDomError(err);
        const authError =
          domMapped ?? handleApiError(err, 'Unable to register passkey. Please try again.');
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, isSupported, beginCeremony]
  );

  const signupWithPasskey = useCallback(
    async (params?: {
      email?: string;
      name?: string;
      label?: string;
      accessCode?: string;
    }): Promise<AuthResponse> => {
      if (!isSupported) {
        const err: AuthError = {
          code: 'VALIDATION_ERROR',
          message: 'Passkeys are not supported in this browser',
        };
        setError(err);
        throw err;
      }

      const signal = beginCeremony();
      setIsLoading(true);
      setError(null);

      try {
        if (params?.email) {
          const deviceDecision = await deviceAccountLink.requestDeviceAccountLink({
            identifier: params.email,
            method: 'webauthn',
            linkExisting: async (_hint, signedInResponse) => {
              await registerPasskey({ label: params.label });
              await accountEmailClient.addEmail(params.email!);
              return signedInResponse;
            },
          });
          if (deviceDecision.action === 'linked') {
            if (deviceDecision.response) return deviceDecision.response;
            throw {
              code: 'UNKNOWN_ERROR',
              message: 'Account linked. Please refresh your session.',
            } satisfies AuthError;
          }
        }

        const optionsResponse = await apiClient.post<WebAuthnCreationOptionsResponse>(
          '/webauthn/signup/options',
          {}
        );

        signal.throwIfAborted();
        const publicKey = parseCreationOptionsFromServer(optionsResponse.options);

        const created = (await navigator.credentials.create({
          publicKey,
          signal,
        })) as PublicKeyCredential | null;

        signal.throwIfAborted();
        if (!created) {
          throw new Error('Passkey signup returned no credential');
        }

        const data = await apiClient.post<AuthResponse>('/webauthn/signup/verify', {
          challengeId: optionsResponse.challengeId,
          credential: credentialToServerJson(created),
          name: params?.name,
          label: params?.label,
          referral: _internal?.getReferralCode?.() ?? undefined,
          accessCode: params?.accessCode || undefined,
        });

        signal.throwIfAborted();
        config.callbacks?.onLoginSuccess?.(data.user, 'webauthn');
        _internal?.handleLoginSuccess(data.user, data.tokens);
        if (params?.email) {
          try {
            await accountEmailClient.addEmail(params.email);
          } catch {
            setError({
              code: 'SERVER_ERROR',
              message:
                'Your passkey account was created, but the recovery email could not be linked. Add it from account settings.',
            });
          }
        }

        return data;
      } catch (err) {
        const domMapped = mapWebAuthnDomError(err);
        const authError =
          domMapped ?? handleApiError(err, 'Unable to sign up with passkey. Please try again.');
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [
      accountEmailClient,
      beginCeremony,
      apiClient,
      config.callbacks,
      deviceAccountLink,
      _internal,
      isSupported,
      registerPasskey,
    ]
  );

  const continueWithPasskey = useCallback(() => authenticatePasskey(), [authenticatePasskey]);

  return {
    isSupported,
    isLoading,
    error,
    clearError,
    continueWithPasskey,
    authenticatePasskey,
    registerPasskey,
    signupWithPasskey,
  };
}
