/**
 * Integration tests for React hooks against mock backend
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { CedrosLoginProvider } from '../../context/CedrosLoginProvider';
import { useEmailAuth } from '../../hooks/useEmailAuth';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { useSolanaAuth } from '../../hooks/useSolanaAuth';
import { useAuth } from '../../hooks/useAuth';
import { useWebAuthn } from '../../hooks/useWebAuthn';
import { useInstantLink } from '../../hooks/useInstantLink';
import type {
  CedrosLoginConfig,
  AuthResponse,
  LoginAttemptResponse,
  ChallengeResponse,
  WalletLinkResponse,
} from '../../types';
import type { LoginResult } from '../../hooks/useEmailAuth';
import type { ReactNode } from 'react';
import { TAKEN_WALLET_ADDRESS } from '../mocks/handlers';
import { server } from '../mocks/server';

const TEST_CONFIG: CedrosLoginConfig = {
  serverUrl: 'http://localhost:8080',
  requestTimeout: 5000,
  retryAttempts: 0,
};

function createWrapper(config: CedrosLoginConfig = TEST_CONFIG) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <CedrosLoginProvider config={config}>{children}</CedrosLoginProvider>;
  };
}

describe('useEmailAuth Integration', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const { result } = renderHook(() => useEmailAuth(), {
        wrapper: createWrapper(),
      });

      let loginResult: LoginResult | undefined;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'TestPassword1!');
      });

      expect(loginResult).toBeDefined();
      expect(loginResult!.mfaRequired).toBe(false);
      if (!loginResult!.mfaRequired && !('inviteCodeRequired' in loginResult!)) {
        const response = loginResult!.response;
        expect(response.user.email).toBe('test@example.com');
        const tokens = response.tokens;
        expect(tokens).toBeDefined();
        if (!tokens) {
          throw new Error('Missing tokens in response');
        }
        expect(tokens.accessToken).toBeDefined();
      }
      expect(result.current.error).toBeNull();
    });

    it('should set error on invalid credentials', async () => {
      const { result } = renderHook(() => useEmailAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'WrongPassword');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.code).toBe('INVALID_CREDENTIALS');
    });

    it('should validate email format before API call', async () => {
      const { result } = renderHook(() => useEmailAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.login('invalid-email', 'TestPassword1!');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should track loading state', async () => {
      const { result } = renderHook(() => useEmailAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);

      let loginPromise: Promise<unknown>;
      act(() => {
        loginPromise = result.current.login('test@example.com', 'TestPassword1!');
      });

      // Loading should be true while request is in flight
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await loginPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should clear error when clearError is called', async () => {
      const { result } = renderHook(() => useEmailAuth(), {
        wrapper: createWrapper(),
      });

      // Cause an error
      await act(async () => {
        try {
          await result.current.login('test@example.com', 'WrongPassword');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const { result } = renderHook(() => useEmailAuth(), {
        wrapper: createWrapper(),
      });

      let response: AuthResponse | undefined;
      await act(async () => {
        response = await result.current.register(
          'newuser@example.com',
          'SecurePass123!',
          'New User'
        );
      });

      expect(response).toBeDefined();
      expect(response!.user.email).toBe('newuser@example.com');
      expect(response!.isNewUser).toBe(true);
    });

    it('should validate email format before registration', async () => {
      const { result } = renderHook(() => useEmailAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.register('invalid-email', 'SecurePass123!');
        } catch {
          // Expected
        }
      });

      expect(result.current.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should not trigger client-side wallet enrollment from registration', async () => {
      const { result } = renderHook(() => useEmailAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.register('walletuser@example.com', 'SecurePass123!', 'Wallet User');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('rate limiting', () => {
    it('should expose remaining attempts', () => {
      const { result } = renderHook(() => useEmailAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.remainingAttempts).toBe(5);
    });

    it('should decrement remaining attempts on login attempt', async () => {
      const { result } = renderHook(() => useEmailAuth(), {
        wrapper: createWrapper(),
      });

      const initialAttempts = result.current.remainingAttempts;

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'WrongPassword');
        } catch {
          // Expected
        }
      });

      // Need to re-render to get updated count
      await waitFor(() => {
        expect(result.current.remainingAttempts).toBeLessThan(initialAttempts);
      });
    });
  });
});

describe('usePasswordReset Integration', () => {
  describe('forgotPassword', () => {
    it('should request password reset successfully', async () => {
      const { result } = renderHook(() => usePasswordReset(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.forgotPassword('test@example.com');
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should validate email format', async () => {
      const { result } = renderHook(() => usePasswordReset(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.forgotPassword('invalid-email');
        } catch {
          // Expected
        }
      });

      expect(result.current.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should track loading state', async () => {
      const { result } = renderHook(() => usePasswordReset(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);

      let promise: Promise<void>;
      act(() => {
        promise = result.current.forgotPassword('test@example.com');
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should reset state when reset is called', async () => {
      const { result } = renderHook(() => usePasswordReset(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.forgotPassword('test@example.com');
      });

      expect(result.current.isSuccess).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully with valid token', async () => {
      const { result } = renderHook(() => usePasswordReset(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.resetPassword('valid-token', 'NewSecurePass1!');
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should surface invalid token error', async () => {
      const { result } = renderHook(() => usePasswordReset(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.resetPassword('expired-token', 'NewSecurePass1!');
        } catch {
          // Expected
        }
      });

      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).not.toBeNull();
    });
  });
});

describe('useSolanaAuth Integration', () => {
  const validPublicKey = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

  describe('requestChallenge', () => {
    it('should request challenge successfully', async () => {
      const { result } = renderHook(() => useSolanaAuth(), {
        wrapper: createWrapper(),
      });

      let challenge: ChallengeResponse | undefined;
      await act(async () => {
        challenge = await result.current.requestChallenge(validPublicKey);
      });

      expect(challenge).toBeDefined();
      expect(challenge!.message).toContain(validPublicKey);
      expect(challenge!.nonce).toBeDefined();
    });

    it('should validate public key format', async () => {
      const { result } = renderHook(() => useSolanaAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.requestChallenge('invalid');
        } catch {
          // Expected
        }
      });

      expect(result.current.error?.code).toBe('INVALID_PUBLIC_KEY');
    });
  });

  describe('signIn', () => {
    it('should sign in with valid signature', async () => {
      const { result } = renderHook(() => useSolanaAuth(), {
        wrapper: createWrapper(),
      });

      // Get challenge first
      let challenge: ChallengeResponse | undefined;
      await act(async () => {
        challenge = await result.current.requestChallenge(validPublicKey);
      });

      // Sign in
      let response: LoginAttemptResponse | undefined;
      await act(async () => {
        response = await result.current.signIn(
          validPublicKey,
          'mock-signature',
          challenge!.message
        );
      });

      expect(response).toBeDefined();
      if (!response || 'mfaRequired' in response) {
        throw new Error('Expected Solana sign-in to complete without MFA');
      }
      expect(response.user.walletAddress).toBe(validPublicKey);
      expect(response.tokens).toBeDefined();
    });
  });

  describe('linkWallet', () => {
    /** Establish a session (provider stores tokens → getAccessToken works). */
    async function signInFirst(result: { current: ReturnType<typeof useSolanaAuth> }) {
      let challenge: ChallengeResponse | undefined;
      await act(async () => {
        challenge = await result.current.requestChallenge(validPublicKey);
      });
      await act(async () => {
        await result.current.signIn(validPublicKey, 'mock-signature', challenge!.message);
      });
    }

    it('attaches the wallet to the current account', async () => {
      const { result } = renderHook(() => useSolanaAuth(), {
        wrapper: createWrapper(),
      });
      await signInFirst(result);

      let challenge: ChallengeResponse | undefined;
      await act(async () => {
        challenge = await result.current.requestChallenge(validPublicKey);
      });

      let response: WalletLinkResponse | undefined;
      await act(async () => {
        response = await result.current.linkWallet(
          validPublicKey,
          'mock-signature',
          challenge!.message
        );
      });

      expect(response).toBeDefined();
      expect(response!.linked).toBe('solana');
      expect(response!.user.walletAddress).toBe(validPublicKey);
      expect(response!.user.authMethods).toContain('solana');
      expect(result.current.error).toBeNull();
    });

    it('surfaces WALLET_EXISTS when the wallet belongs to another account', async () => {
      const { result } = renderHook(() => useSolanaAuth(), {
        wrapper: createWrapper(),
      });
      await signInFirst(result);

      let challenge: ChallengeResponse | undefined;
      await act(async () => {
        challenge = await result.current.requestChallenge(TAKEN_WALLET_ADDRESS);
      });

      await act(async () => {
        await expect(
          result.current.linkWallet(TAKEN_WALLET_ADDRESS, 'mock-signature', challenge!.message)
        ).rejects.toMatchObject({ code: 'WALLET_EXISTS' });
      });

      expect(result.current.error?.code).toBe('WALLET_EXISTS');
    });
  });
});

describe('useWebAuthn Integration', () => {
  function installWebAuthnStubs() {
    const OriginalPkc = window.PublicKeyCredential;
    const OriginalCreds = navigator.credentials;

    // Minimal stub: we only need presence checks + create/get.
    class PublicKeyCredentialStub {}
    // @ts-expect-error - test stub
    window.PublicKeyCredential = PublicKeyCredentialStub;

    const makeCred = (kind: 'create' | 'get') => {
      const rawId = new Uint8Array([1, 2, 3]).buffer;
      const clientDataJSON = new Uint8Array([4, 5, 6]).buffer;
      if (kind === 'create') {
        const attestationObject = new Uint8Array([7, 8, 9]).buffer;
        return {
          id: 'cred-id',
          rawId,
          type: 'public-key',
          authenticatorAttachment: 'platform',
          getClientExtensionResults: () => ({}),
          response: { clientDataJSON, attestationObject },
        } as unknown as PublicKeyCredential;
      }

      const authenticatorData = new Uint8Array([10, 11, 12]).buffer;
      const signature = new Uint8Array([13, 14, 15]).buffer;
      return {
        id: 'cred-id',
        rawId,
        type: 'public-key',
        authenticatorAttachment: 'platform',
        getClientExtensionResults: () => ({}),
        response: { clientDataJSON, authenticatorData, signature },
      } as unknown as PublicKeyCredential;
    };

    // @ts-expect-error - test stub
    navigator.credentials = {
      create: async () => makeCred('create'),
      get: async () => makeCred('get'),
      // rest not needed
    };

    return () => {
      window.PublicKeyCredential = OriginalPkc;
      // @ts-expect-error - restore
      navigator.credentials = OriginalCreds;
    };
  }

  it('should authenticate with passkey and update session', async () => {
    const restore = installWebAuthnStubs();
    try {
      const { result } = renderHook(
        () => ({
          auth: useAuth(),
          webauthn: useWebAuthn(),
        }),
        { wrapper: createWrapper() }
      );

      let response: LoginAttemptResponse | undefined;
      await act(async () => {
        response = await result.current.webauthn.authenticatePasskey();
      });

      expect(response).toBeDefined();
      if (!response || 'mfaRequired' in response) {
        throw new Error('Expected passkey authentication to complete without MFA');
      }
      expect(response.user.email).toBe('test@example.com');
      expect(result.current.webauthn.error).toBeNull();

      await waitFor(() => {
        expect(result.current.auth.authState).toBe('authenticated');
      });
    } finally {
      restore();
    }
  });

  it('should register a passkey', async () => {
    const restore = installWebAuthnStubs();
    try {
      const { result } = renderHook(() => useWebAuthn(), { wrapper: createWrapper() });

      let registration: { credentialId: string; label?: string } | undefined;
      await act(async () => {
        registration = await result.current.registerPasskey({ label: 'My laptop' });
      });

      expect(registration).toEqual({ credentialId: 'mock-credential-id', label: 'My laptop' });
      expect(result.current.error).toBeNull();
    } finally {
      restore();
    }
  });

  it('should sign up with passkey and update session', async () => {
    const onLoginSuccess = vi.fn();
    let signupBody: Record<string, unknown> | undefined;
    let linkedEmail: string | undefined;
    server.use(
      http.post(`${TEST_CONFIG.serverUrl}/webauthn/signup/verify`, async ({ request }) => {
        signupBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          user: {
            id: 'new-passkey-user-id',
            email: null,
            emailVerified: false,
            name: signupBody.name ?? null,
            authMethods: ['webauthn'],
            createdAt: '2026-03-02T00:00:00Z',
            updatedAt: '2026-03-02T00:00:00Z',
          },
          tokens: {
            accessToken: 'mock-signup-access-token',
            refreshToken: 'mock-signup-refresh-token',
            expiresIn: 3600,
          },
          isNewUser: true,
        });
      }),
      http.post(`${TEST_CONFIG.serverUrl}/account/emails`, async ({ request }) => {
        const body = (await request.json()) as { email: string };
        linkedEmail = body.email;
        return HttpResponse.json({ emails: [] });
      })
    );
    const restore = installWebAuthnStubs();
    try {
      const { result } = renderHook(
        () => ({
          auth: useAuth(),
          webauthn: useWebAuthn(),
        }),
        {
          wrapper: createWrapper({
            ...TEST_CONFIG,
            callbacks: { onLoginSuccess },
          }),
        }
      );

      let response: AuthResponse | undefined;
      await act(async () => {
        response = await result.current.webauthn.signupWithPasskey({
          email: 'new@example.com',
          name: 'New User',
        });
      });

      expect(response).toBeDefined();
      expect(response!.isNewUser).toBe(true);
      expect(response!.tokens).toBeDefined();
      expect(result.current.webauthn.error).toBeNull();
      expect(signupBody).not.toHaveProperty('email');
      expect(linkedEmail).toBe('new@example.com');

      expect(onLoginSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'new-passkey-user-id' }),
        'webauthn'
      );

      await waitFor(() => {
        expect(result.current.auth.authState).toBe('authenticated');
      });
    } finally {
      restore();
    }
  });

  it('keeps a completed passkey signup when recovery-email linking fails', async () => {
    server.use(
      http.post(`${TEST_CONFIG.serverUrl}/account/emails`, () =>
        HttpResponse.json({ code: 'LINK_FAILED' }, { status: 500 })
      )
    );
    const restore = installWebAuthnStubs();
    try {
      const { result } = renderHook(
        () => ({
          auth: useAuth(),
          webauthn: useWebAuthn(),
        }),
        { wrapper: createWrapper() }
      );

      let response: AuthResponse | undefined;
      await act(async () => {
        response = await result.current.webauthn.signupWithPasskey({
          email: 'recovery@example.com',
        });
      });

      expect(response?.isNewUser).toBe(true);
      expect(result.current.webauthn.error?.message).toContain('passkey account was created');
      await waitFor(() => expect(result.current.auth.authState).toBe('authenticated'));
    } finally {
      restore();
    }
  });

  it('should set error when WebAuthn is not supported for signup', async () => {
    // Don't install stubs — WebAuthn not available
    const { result } = renderHook(() => useWebAuthn(), { wrapper: createWrapper() });

    await act(async () => {
      try {
        await result.current.signupWithPasskey();
      } catch {
        // Expected
      }
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.code).toBe('VALIDATION_ERROR');
    expect(result.current.error?.message).toContain('not supported');
  });
});

describe('useInstantLink Integration', () => {
  it('should send an instant link successfully', async () => {
    const { result } = renderHook(() => useInstantLink(), {
      wrapper: createWrapper({
        ...TEST_CONFIG,
        forms: { forgotPassword: { mode: 'instantLink' } },
      }),
    });

    await act(async () => {
      await result.current.sendInstantLink('test@example.com');
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should verify an instant link and authenticate', async () => {
    const { result } = renderHook(
      () => ({
        auth: useAuth(),
        instant: useInstantLink(),
      }),
      { wrapper: createWrapper() }
    );

    let response: AuthResponse | undefined;
    await act(async () => {
      const res = await result.current.instant.verifyInstantLink('token-from-email');
      if ('user' in res) {
        response = res;
      }
    });

    expect(response).toBeDefined();
    expect(response!.user.email).toBe('test@example.com');

    await waitFor(() => {
      expect(result.current.auth.authState).toBe('authenticated');
    });
  });
});

describe('Callbacks Integration', () => {
  it('should call onLoginSuccess callback on successful login', async () => {
    const onLoginSuccess = vi.fn();

    const config: CedrosLoginConfig = {
      ...TEST_CONFIG,
      callbacks: {
        onLoginSuccess,
      },
    };

    const { result } = renderHook(() => useEmailAuth(), {
      wrapper: createWrapper(config),
    });

    await act(async () => {
      await result.current.login('test@example.com', 'TestPassword1!');
    });

    expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' }),
      'email'
    );
  });
});

describe('Auth State Integration', () => {
  it('should update auth state after email login', async () => {
    const { result } = renderHook(
      () => ({
        auth: useAuth(),
        email: useEmailAuth(),
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.auth.authState).toBe('unauthenticated');
    });

    await act(async () => {
      await result.current.email.login('test@example.com', 'TestPassword1!');
    });

    await waitFor(() => {
      expect(result.current.auth.authState).toBe('authenticated');
      expect(result.current.auth.user?.email).toBe('test@example.com');
    });
  });
});
