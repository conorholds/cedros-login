import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../../types';
import { clearSharedReads } from '../../utils/requestCache';
import { AvatarUploader } from './AvatarUploader';

const refreshUserMock = vi.hoisted(() => vi.fn());
const getAccessTokenMock = vi.hoisted(() => vi.fn(() => 'access-token'));
const authState = vi.hoisted(() => ({ user: null as AuthUser | null }));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: authState.user, refreshUser: refreshUserMock }),
}));

vi.mock('../../context/useCedrosLogin', () => ({
  useCedrosLogin: () => ({
    config: { serverUrl: 'https://example.test/auth', requestTimeout: 1_000, retryAttempts: 0 },
    _internal: { getAccessToken: getAccessTokenMock },
  }),
}));

describe('AvatarUploader', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    clearSharedReads();
    refreshUserMock.mockReset();
    authState.user = {
      id: 'user-1',
      email: 'user@example.test',
      name: 'Example User',
      picture: 'https://cdn.example.test/old.png',
      authMethods: ['email'],
      emailVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
  });

  it('preserves the rendered picture while the Core-backed avatar refreshes', async () => {
    authState.user!.avatarContentType = 'image/png';
    let resolveFetch!: (response: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          })
      )
    );

    render(<AvatarUploader />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn.example.test/old.png');
    await act(async () => {
      resolveFetch(
        new Response('{"contentType":"image/png","content":"bmV3"}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );
    });
    await waitFor(() =>
      expect(screen.getByRole('img')).toHaveAttribute('src', 'data:image/png;base64,bmV3')
    );
  });

  it('sends source images larger than 1 MiB for backend processing', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { contentType: string; content: string };
      expect(body.contentType).toBe('image/png');
      expect(body.content.length).toBeGreaterThan(1024 * 1024);
      return new Response('{"contentType":"image/webp","content":"cHJvY2Vzc2Vk"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(<AvatarUploader />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([new Uint8Array(1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src', 'data:image/webp;base64,cHJvY2Vzc2Vk');
      expect(refreshUserMock).toHaveBeenCalledTimes(1);
    });
  });
});
