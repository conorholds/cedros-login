import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionApiClient } from './sessionApi';
import { clearSharedReads } from './requestCache';

const session = {
  id: 'one',
  isCurrent: true,
  ipAddress: null,
  userAgent: null,
  createdAt: '2026-09-09T00:00:00Z',
  expiresAt: '2026-09-16T00:00:00Z',
};
const other = { ...session, id: 'two', isCurrent: false };
const client = () => new SessionApiClient('http://sessions.test', 1000, 0, () => 'access');
const response = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => clearSharedReads());
afterEach(() => vi.unstubAllGlobals());

describe('SessionApiClient', () => {
  it('loads every standalone page, including a current session beyond page one', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({ sessions: [other], total: 2, limit: 1, offset: 0 }))
      .mockResolvedValueOnce(response({ sessions: [session], total: 2, limit: 1, offset: 1 }));
    vi.stubGlobal('fetch', fetch);
    const result = await client().listSessions();
    expect(result.map((s) => s.id)).toEqual(['two', 'one']);
    expect(result[1].isCurrent).toBe(true);
    expect(fetch.mock.calls[1][0]).toBe('http://sessions.test/sessions?offset=1');
  });

  it('supports complete extension responses and the older current field', async () => {
    const { isCurrent, ...legacy } = session;
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(response({ sessions: [{ ...legacy, current: isCurrent }], total: 1 }))
    );
    await expect(client().listSessions()).resolves.toEqual([
      { id: 'one', isCurrent: true, createdAt: session.createdAt, expiresAt: session.expiresAt },
    ]);
  });

  it.each([
    { sessions: [{ ...session, isCurrent: undefined }], total: 1 },
    { sessions: [{ ...session, createdAt: 'invalid' }], total: 1 },
    { sessions: [session], total: -1 },
    { sessions: [session, { ...session, id: 'another-current' }], total: 2 },
    { sessions: [], total: 3 },
    { sessions: [session], total: 1, offset: 9, limit: 1 },
  ])('rejects unverifiable data without claiming the list is complete', async (data) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(data)));
    await expect(client().listSessions()).rejects.toMatchObject({ code: 'SERVER_ERROR' });
  });

  it('does not return a partial list when a later page fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(response({ sessions: [other], total: 2, limit: 1, offset: 0 }))
        .mockResolvedValueOnce(response({ code: 'SERVER_ERROR' }, 503))
    );
    await expect(client().listSessions()).rejects.toMatchObject({ code: 'SERVER_ERROR' });
  });

  it('rejects a server that ignores pagination instead of looping', async () => {
    const fetch = vi
      .fn()
      .mockImplementation(async () =>
        response({ sessions: [other], total: 2, limit: 1, offset: 0 })
      );
    vi.stubGlobal('fetch', fetch);
    await expect(client().listSessions()).rejects.toMatchObject({ code: 'SERVER_ERROR' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('refresh bypasses a cached response', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({ sessions: [session, other], total: 2 }))
      .mockResolvedValueOnce(response({ sessions: [session], total: 1 }));
    vi.stubGlobal('fetch', fetch);
    const api = client();
    expect(await api.listSessions()).toHaveLength(2);
    expect(await api.listSessions(true)).toHaveLength(1);
  });

  it('validates sign-out success and never retries a failed mutation', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({ revokedCount: 1, message: 'Other sessions revoked' }))
      .mockRejectedValueOnce(new Error('Network failure'));
    vi.stubGlobal('fetch', fetch);
    const api = new SessionApiClient('http://sessions.test', 1000, 2, () => 'access');
    await expect(api.revokeAllSessions()).resolves.toMatchObject({ revokedCount: 1 });
    await expect(api.revokeAllSessions()).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('does not accept a malformed sign-out success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ success: true })));
    await expect(client().revokeAllSessions()).rejects.toMatchObject({ code: 'SERVER_ERROR' });
  });
});

it('rejects overlapping pages rather than presenting an incomplete list as complete', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(response({ sessions: [other], total: 2, limit: 1, offset: 0 }))
      .mockResolvedValueOnce(response({ sessions: [other], total: 2, limit: 1, offset: 1 }))
  );
  await expect(client().listSessions()).rejects.toMatchObject({ code: 'SERVER_ERROR' });
});
