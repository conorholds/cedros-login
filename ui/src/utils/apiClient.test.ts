import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { ApiClient, handleApiError } from './apiClient';
import { clearSharedReads } from './requestCache';

describe('ApiClient retry policy', () => {
  const baseUrl = 'http://example.test';

  beforeEach(() => {
    clearSharedReads();
  });

  afterEach(() => {
    document.cookie = 'XSRF-TOKEN=; Max-Age=0';
    vi.unstubAllGlobals();
  });

  it('does not retry non-idempotent POST requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('fetch failed')))
    );
    const client = new ApiClient({ baseUrl, retryAttempts: 2, timeoutMs: 10 });
    await expect(client.post('/test', { data: 'value' })).rejects.toBeInstanceOf(Error);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('retries idempotent GET requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('fetch failed')))
    );
    const client = new ApiClient({ baseUrl, retryAttempts: 2, timeoutMs: 10 });
    await expect(client.get('/test')).rejects.toBeInstanceOf(Error);

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('retries idempotent GET requests on 5xx responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response('{"message":"error"}', {
            status: 500,
            headers: { 'content-type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response('{"message":"error"}', {
            status: 502,
            headers: { 'content-type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response('{"ok":true}', {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
    );

    const client = new ApiClient({ baseUrl, retryAttempts: 2, timeoutMs: 10 });
    const response = await client.get<{ ok: boolean }>('/test');

    expect(response.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('preserves JSON error bodies on non-retried 5xx responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response('{"error":"db_error"}', {
          status: 502,
          headers: { 'content-type': 'application/json' },
        });
      })
    );

    const client = new ApiClient({ baseUrl, retryAttempts: 2, timeoutMs: 10 });
    await expect(client.post('/solana', {})).rejects.toMatchObject({
      isApiError: true,
      status: 502,
      data: { error: 'db_error' },
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('S-10: does not retry DELETE requests on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('fetch failed')))
    );
    const client = new ApiClient({ baseUrl, retryAttempts: 2, timeoutMs: 10 });
    await expect(client.delete('/test')).rejects.toBeInstanceOf(Error);

    // DELETE should NOT be retried (only 1 attempt)
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('preserves CSRF tokens containing equals signs', async () => {
    // UI-CSRF: Token must be at least 32 chars to pass validation
    const csrfToken = 'test_csrf_token_abcd0123456789==';
    document.cookie = `XSRF-TOKEN=${csrfToken}`;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options?: RequestInit) => {
        const headers = (options?.headers || {}) as Record<string, string>;
        expect(headers['X-CSRF-Token']).toBe(csrfToken);
        return new Response('{"ok":true}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      })
    );

    const client = new ApiClient({ baseUrl, retryAttempts: 0, timeoutMs: 10 });
    await client.get('/health');
  });

  it('adds Authorization header when access token is available', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options?: RequestInit) => {
        const headers = (options?.headers || {}) as Record<string, string>;
        expect(headers.Authorization).toBe('Bearer test-token');
        return new Response('{"ok":true}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      })
    );

    const client = new ApiClient({
      baseUrl,
      retryAttempts: 0,
      timeoutMs: 10,
      getAccessToken: () => 'test-token',
    });
    await client.get('/health');
  });

  it('omits Content-Type header on GET requests without body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options?: RequestInit) => {
        const headers = (options?.headers || {}) as Record<string, string>;
        expect(headers['Content-Type']).toBeUndefined();
        return new Response('{"ok":true}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      })
    );

    const client = new ApiClient({ baseUrl, retryAttempts: 0, timeoutMs: 10 });
    await client.get('/health');
  });

  it('handles empty JSON responses (204) without throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(null, {
          status: 204,
          headers: { 'content-type': 'application/json' },
        });
      })
    );

    const client = new ApiClient({ baseUrl, retryAttempts: 0, timeoutMs: 10 });
    const response = await client.get('/health');

    expect(response).toEqual({});
  });

  it('serializes falsy JSON bodies', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options?: RequestInit) => {
        expect(options?.body).toBe('false');
        return new Response('{"ok":true}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      })
    );

    const client = new ApiClient({ baseUrl, retryAttempts: 0, timeoutMs: 10 });
    await client.post('/test', false);
  });

  it('coalesces simultaneous identity-scoped GET requests across clients', async () => {
    let resolveResponse!: (response: Response) => void;
    const response = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(() => response)
    );
    const config = {
      baseUrl,
      retryAttempts: 0,
      timeoutMs: 1_000,
      getAccessToken: () => 'identity-a',
    };

    const first = new ApiClient(config).get<{ value: number }>('/shared');
    const second = new ApiClient(config).get<{ value: number }>('/shared');
    resolveResponse(
      new Response('{"value":1}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    await expect(Promise.all([first, second])).resolves.toEqual([{ value: 1 }, { value: 1 }]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('never shares cached reads between access-token identities', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response('{"identity":"a"}', {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response('{"identity":"b"}', {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
    );
    const first = new ApiClient({ baseUrl, getAccessToken: () => 'identity-a' });
    const second = new ApiClient({ baseUrl, getAccessToken: () => 'identity-b' });

    await expect(first.get('/me', { cacheTtlMs: 5_000 })).resolves.toEqual({ identity: 'a' });
    await expect(second.get('/me', { cacheTtlMs: 5_000 })).resolves.toEqual({ identity: 'b' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('invalidates reusable reads only after a successful mutation', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response('{"value":1}', {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response('{"updated":true}', {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
        .mockResolvedValueOnce(
          new Response('{"value":2}', {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
    );
    const client = new ApiClient({ baseUrl, retryAttempts: 0 });

    await client.get('/resource', { cacheTtlMs: 5_000 });
    await client.get('/resource', { cacheTtlMs: 5_000 });
    expect(fetch).toHaveBeenCalledTimes(1);
    await client.patch('/resource', { value: 2 });
    await expect(client.get('/resource', { cacheTtlMs: 5_000 })).resolves.toEqual({ value: 2 });
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});

describe('handleApiError', () => {
  it('maps server errors to SERVER_ERROR', () => {
    const err = new Error('Server error: 500');
    const result = handleApiError(err, 'Request failed');

    expect(result.code).toBe('SERVER_ERROR');
    expect(result.message).toBe('Request failed');
  });

  it('maps invalid JSON responses to SERVER_ERROR', () => {
    const err = new Error('Invalid JSON response: Unexpected end of JSON input');
    const result = handleApiError(err, 'Request failed');

    expect(result.code).toBe('SERVER_ERROR');
    expect(result.message).toBe('Request failed');
  });

  it('maps AbortError to timeout message', () => {
    const err = new Error('Request aborted');
    err.name = 'AbortError';
    const result = handleApiError(err, 'Request failed');

    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).toBe('The request timed out. Check your connection and try again.');
  });

  it('maps DOM AbortError before its numeric code can mimic an AuthError', () => {
    const result = handleApiError(new DOMException('Aborted', 'AbortError'), 'Request failed');

    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).toBe('The request timed out. Check your connection and try again.');
  });

  it('maps Wasm error fields to auth error codes', () => {
    const result = handleApiError(
      {
        isApiError: true,
        status: 400,
        data: { error: 'challenge_expired' },
      },
      'Request failed'
    );

    expect(result.code).toBe('CHALLENGE_EXPIRED');
    expect(result.message).toBe('This verification has expired. Please try again.');
  });

  it('maps signup limit responses to a registration-specific message', () => {
    const result = handleApiError(
      {
        isApiError: true,
        status: 429,
        data: {
          error: 'signup_limit_reached',
          details: { resetsAt: '2026-10-01T00:00:00Z' },
        },
      },
      'Request failed'
    );

    expect(result.code).toBe('SIGNUP_LIMIT_REACHED');
    expect(result.message).toBe(
      'Registration is temporarily closed. Please try again next period.'
    );
    expect(result.details).toEqual({ resetsAt: '2026-10-01T00:00:00Z' });
  });

  it('uses a clear setup-required message', () => {
    const result = handleApiError(
      {
        isApiError: true,
        status: 503,
        data: { error: 'setup_required' },
      },
      'Request failed'
    );

    expect(result.code).toBe('SETUP_REQUIRED');
    expect(result.message).toBe(
      'Cedros Login setup is incomplete. Finish setup in site settings, then try again.'
    );
  });

  it('uses Wasm validation details as the message when no message is provided', () => {
    const result = handleApiError(
      {
        isApiError: true,
        status: 422,
        data: {
          error: 'validation_failed',
          details: [
            'Password must be at least 10 characters',
            'Password must contain at least one special character',
          ],
        },
      },
      'Request failed'
    );

    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.message).toBe(
      'Password must be at least 10 characters. Password must contain at least one special character'
    );
  });
});

describe('ApiClient full-response deadlines', () => {
  afterEach(() => {
    clearSharedReads();
    vi.unstubAllGlobals();
  });

  it.each([
    [200, 'application/json'],
    [500, 'application/json'],
    [502, 'text/html'],
  ])(
    'times out a stalled %s %s body and releases every shared waiter',
    async (status, contentType) => {
      const fetchMock = vi.fn(
        async () =>
          new Response(
            new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode('{'));
              },
            }),
            {
              status,
              headers: { 'content-type': contentType },
            }
          )
      );
      vi.stubGlobal('fetch', fetchMock);
      const client = new ApiClient({ baseUrl: 'http://example.test', timeoutMs: 20 });
      const results = await Promise.allSettled([client.get('/stall'), client.get('/stall')]);
      for (const result of results) {
        expect(result.status).toBe('rejected');
        if (result.status === 'rejected')
          expect(result.reason).toMatchObject({ name: 'AbortError' });
      }
      expect(fetchMock).toHaveBeenCalledTimes(1);
      fetchMock.mockImplementation(
        async () => new Response('{}', { headers: { 'content-type': 'application/json' } })
      );
      await expect(client.get('/stall')).resolves.toEqual({});
      expect(fetchMock).toHaveBeenCalledTimes(2);
    }
  );
});
