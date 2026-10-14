import { describe, it, expect, vi, afterEach } from 'vitest';
import { runSessionRefresh } from './sessionRefresh';

describe('refresh response boundaries', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('does not publish a response whose session was logged out during the request', async () => {
    let current = true;
    let finish!: (response: Response) => void;
    const setTokens = vi.fn();
    const onRefresh = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          })
      )
    );
    const refresh = runSessionRefresh({
      serverUrl: 'https://login.test',
      storage: 'memory',
      allowWebStorage: false,
      tokenStore: { getRefreshToken: () => 'old', setTokens },
      onRefresh,
      isCurrent: () => current,
    });
    await vi.waitFor(() => expect(finish).toBeDefined());
    current = false;
    finish(
      new Response(
        JSON.stringify({
          tokens: { accessToken: 'new', refreshToken: 'new-refresh', expiresIn: 900 },
        })
      )
    );
    await refresh;
    expect(setTokens).not.toHaveBeenCalled();
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('does not start a queued request after logout', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await runSessionRefresh({
      serverUrl: 'https://login.test',
      storage: 'memory',
      allowWebStorage: false,
      tokenStore: { getRefreshToken: () => 'old', setTokens: vi.fn() },
      isCurrent: () => false,
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
