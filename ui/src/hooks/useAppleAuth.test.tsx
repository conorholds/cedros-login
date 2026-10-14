import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppleAuth } from './useAppleAuth';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  success: vi.fn(),
  deviceLink: vi.fn(),
  config: { serverUrl: 'https://login.example', appleClientId: 'apple-client' },
}));
vi.mock('../context/useCedrosLogin', () => ({
  useCedrosLogin: () => ({
    config: mocks.config,
    _internal: { handleLoginSuccess: mocks.success },
  }),
}));
vi.mock('../context/DeviceAccountLinkContext', () => ({
  useDeviceAccountLink: () => ({ requestDeviceAccountLink: mocks.deviceLink }),
}));
vi.mock('../utils/apiClient', () => ({
  ApiClient: vi.fn().mockImplementation(function () {
    return { post: mocks.post };
  }),
  handleApiError: (error: unknown) => error,
}));

describe('Apple transaction binding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (!document.getElementById('apple-signin-script')) {
      const script = document.createElement('script');
      script.id = 'apple-signin-script';
      document.head.appendChild(script);
    }
    mocks.post.mockImplementation(async (path: string) =>
      path === '/apple/nonce'
        ? { nonce: 'server-generated-single-use-nonce' }
        : { user: { id: 'user' }, tokens: {} }
    );
  });

  it.each(['matching', 'missing', 'wrong'])('handles %s callback state', async (kind) => {
    let state: string | undefined;
    window.AppleID = {
      auth: {
        init: vi.fn((config) => {
          state = config.state;
        }),
        signIn: vi.fn(async () => ({
          authorization: {
            id_token: 'signed-provider-token',
            state: kind === 'matching' ? state : kind === 'wrong' ? 'attacker-state' : undefined,
          },
        })),
      },
    };
    const { result } = renderHook(() => useAppleAuth());
    await waitFor(() => expect(result.current.isInitialized).toBe(true));
    let failure: unknown;
    await act(async () => {
      try {
        await result.current.signIn();
      } catch (error) {
        failure = error;
      }
    });
    if (kind === 'matching') {
      expect(failure).toBeUndefined();
      expect(mocks.post).toHaveBeenCalledWith(
        '/apple',
        expect.objectContaining({
          nonce: 'server-generated-single-use-nonce',
          idToken: 'signed-provider-token',
        })
      );
      expect(mocks.success).toHaveBeenCalledOnce();
    } else {
      expect(failure).toBeInstanceOf(Error);
      expect(mocks.post).toHaveBeenCalledTimes(1);
      expect(mocks.success).not.toHaveBeenCalled();
    }
  });
});
