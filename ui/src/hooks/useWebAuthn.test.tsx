import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const postMock = vi.hoisted(() => vi.fn());

vi.mock('../context/useCedrosLogin', () => ({
  useCedrosLogin: () => ({
    config: { serverUrl: 'http://localhost:3000' },
    _internal: { handleLoginSuccess: vi.fn(), getReferralCode: () => undefined },
  }),
}));

vi.mock('../utils/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/apiClient')>();
  return {
    ...actual,
    ApiClient: vi.fn().mockImplementation(function ApiClientMock() {
      return { post: postMock };
    }),
  };
});

vi.mock('../utils/webauthnJson', () => ({
  parseCreationOptionsFromServer: (options: unknown) => options,
  parseRequestOptionsFromServer: (options: unknown) => options,
  credentialToServerJson: () => ({ id: 'cred-1', response: {} }),
}));

import { useWebAuthn } from './useWebAuthn';

const credentialsGet = vi.fn();

beforeEach(() => {
  vi.stubGlobal('PublicKeyCredential', class {});
  Object.defineProperty(navigator, 'credentials', {
    value: { get: credentialsGet, create: vi.fn() },
    configurable: true,
  });
  // Returning-user hint selects the auth-first (discoverable login) flow.
  localStorage.setItem('cedros-passkey-registered', '1');
  postMock.mockReset();
  credentialsGet.mockReset();
  postMock.mockImplementation(async (path: string) => {
    if (path === '/webauthn/auth/options') {
      return { challengeId: 'ch-1', options: { publicKey: { challenge: 'c' } } };
    }
    throw new Error(`unexpected post: ${path}`);
  });
  credentialsGet.mockResolvedValue({ id: 'cred-1', response: {} });
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

function rejectVerifyWith(data: Record<string, unknown>) {
  postMock.mockImplementation(async (path: string) => {
    if (path === '/webauthn/auth/options') {
      return { challengeId: 'ch-1', options: { publicKey: { challenge: 'c' } } };
    }
    if (path === '/webauthn/auth/verify') {
      throw { isApiError: true, status: 401, data, retryable: false };
    }
    throw new Error(`unexpected post: ${path}`);
  });
}

describe('useWebAuthn orphan passkey detection', () => {
  it('maps the wasm server body ({ error: "invalid_credentials" }) to the orphan message', async () => {
    rejectVerifyWith({ error: 'invalid_credentials' });
    const { result } = renderHook(() => useWebAuthn());

    await act(async () => {
      await expect(result.current.continueWithPasskey()).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: expect.stringContaining('not recognized'),
      });
    });
  });

  it('maps the native server body ({ code: "INVALID_CREDENTIALS" }) to the orphan message', async () => {
    rejectVerifyWith({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    const { result } = renderHook(() => useWebAuthn());

    await act(async () => {
      await expect(result.current.continueWithPasskey()).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: expect.stringContaining('not recognized'),
      });
    });
  });

  it('leaves non-credential verify failures on the generic error path', async () => {
    rejectVerifyWith({ error: 'challenge_expired' });
    const { result } = renderHook(() => useWebAuthn());

    await act(async () => {
      await expect(result.current.continueWithPasskey()).rejects.toMatchObject({
        code: 'CHALLENGE_EXPIRED',
      });
    });
  });
});

describe('explicit passkey intent', () => {
  it.each(['NotAllowedError', 'InvalidStateError'])(
    'never creates an account after %s',
    async (name) => {
      credentialsGet.mockRejectedValue(new DOMException('Dismissed', name));
      const { result } = renderHook(() => useWebAuthn());
      await act(async () => {
        await expect(result.current.continueWithPasskey()).rejects.toHaveProperty('message');
      });
      expect(navigator.credentials.create).not.toHaveBeenCalled();
      expect(postMock).toHaveBeenCalledTimes(1);
    }
  );

  it('signs in on a new browser without a local registration hint', async () => {
    localStorage.clear();
    const response = { user: { id: 'user' }, tokens: { accessToken: 'fixture' } };
    postMock.mockImplementation(async (path: string) =>
      path.endsWith('/options') ? { challengeId: 'challenge', options: {} } : response
    );
    const { result } = renderHook(() => useWebAuthn());
    await act(async () => {
      expect(await result.current.continueWithPasskey()).toEqual(response);
    });
    expect(credentialsGet).toHaveBeenCalledOnce();
    expect(navigator.credentials.create).not.toHaveBeenCalled();
  });

  it('aborts a pending prompt on unmount and ignores a late credential', async () => {
    let resolveCredential!: (value: object) => void;
    credentialsGet.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCredential = resolve;
        })
    );
    const { result, unmount } = renderHook(() => useWebAuthn());
    let operation!: Promise<unknown>;
    await act(async () => {
      operation = result.current.continueWithPasskey().catch((error) => error);
    });
    const signal = credentialsGet.mock.calls[0][0].signal as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
    resolveCredential({ id: 'late' });
    await operation;
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  it('does not open authentication when explicit registration is cancelled', async () => {
    postMock.mockResolvedValue({ challengeId: 'signup', options: {} });
    vi.mocked(navigator.credentials.create).mockRejectedValue(
      new DOMException('Dismissed', 'NotAllowedError')
    );
    const { result } = renderHook(() => useWebAuthn());
    await act(async () => {
      await expect(result.current.signupWithPasskey()).rejects.toHaveProperty('message');
    });
    expect(credentialsGet).not.toHaveBeenCalled();
    expect(postMock).toHaveBeenCalledExactlyOnceWith('/webauthn/signup/options', {});
  });
});
