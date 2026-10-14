import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserProfileSettings } from './UserProfileSettings';

const refreshUserMock = vi.hoisted(() => vi.fn());
const clearErrorMock = vi.hoisted(() => vi.fn());
const getAccessTokenMock = vi.hoisted(() => vi.fn(() => 'access-token'));
const testConfig = vi.hoisted(() => ({
  serverUrl: 'http://localhost:3000/auth',
  requestTimeout: 25,
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    },
    refreshUser: refreshUserMock,
  }),
}));

vi.mock('../../hooks/useProfile', () => ({
  useProfile: () => ({
    isLoading: false,
    error: null,
    changePassword: vi.fn(),
    clearError: clearErrorMock,
  }),
}));

vi.mock('../../context/useCedrosLogin', () => ({
  useCedrosLogin: () => ({
    config: testConfig,
    _internal: {
      getAccessToken: getAccessTokenMock,
    },
  }),
}));

function getAvatarInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Avatar file input not found');
  }
  return input;
}

describe('UserProfileSettings avatar upload', () => {
  beforeEach(() => {
    refreshUserMock.mockReset();
    clearErrorMock.mockReset();
    testConfig.serverUrl = 'http://localhost:3000/auth';
    testConfig.requestTimeout = 25;
    document.cookie = 'XSRF-TOKEN=csrf_token_for_avatar_upload_1234567890';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('uploads the selected avatar through the Wasm JSON contract and refreshes the user', async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options?: RequestInit) => {
        expect(_url).toBe('http://localhost:3000/auth/me/avatar');
        expect(options?.method).toBe('POST');
        expect((options?.headers as Record<string, string>).Authorization).toBe(
          'Bearer access-token'
        );
        expect((options?.headers as Record<string, string>)['X-CSRF-Token']).toBe(
          'csrf_token_for_avatar_upload_1234567890'
        );
        expect(options?.credentials).toBe('include');
        expect(options?.headers).toMatchObject({ 'Content-Type': 'application/json' });
        expect(JSON.parse(String(options?.body))).toEqual({
          contentType: 'image/png',
          content: 'YXZhdGFy',
        });
        signal = options?.signal ?? undefined;
        return new Response('{"contentType":"image/png","content":"YXZhdGFy"}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      })
    );

    const { container } = render(<UserProfileSettings />);
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });

    fireEvent.change(getAvatarInput(container), { target: { files: [file] } });

    await waitFor(() => expect(refreshUserMock).toHaveBeenCalledTimes(1));
    expect(signal).toBeInstanceOf(AbortSignal);
  });

  it('shows a timeout error when the avatar request is aborted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      })
    );

    const { container } = render(<UserProfileSettings />);
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });

    fireEvent.change(getAvatarInput(container), { target: { files: [file] } });

    expect(
      await screen.findByText('Upload timed out. Check your connection and try again.')
    ).toBeInTheDocument();
    expect(refreshUserMock).not.toHaveBeenCalled();
  });
});
