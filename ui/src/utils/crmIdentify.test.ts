import { describe, it, expect, vi } from 'vitest';
import { notifyCrmIdentifyLogin } from './crmIdentify';
import type { AuthUser, CrmIdentifyConfig } from '../types';

type FetchMock = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const user: AuthUser = {
  id: 'user-1',
  email: 'user@example.com',
  authMethods: ['email'],
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function silentLogger() {
  return { debug: vi.fn(), warn: vi.fn() };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('notifyCrmIdentifyLogin', () => {
  it('sends bearer + org header + credentials and returns identified outcome', async () => {
    const config: CrmIdentifyConfig = { enabled: true, orgId: 'org-uuid' };
    const fetchImpl = vi.fn<FetchMock>(async () =>
      jsonResponse(200, { identified: true, profileId: 'profile-1', linkedAnalyticsVisitor: true })
    );

    const outcome = await notifyCrmIdentifyLogin({
      config,
      user,
      accessToken: 'token-abc',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger: silentLogger(),
    });

    expect(outcome).toEqual({
      kind: 'identified',
      response: { identified: true, profileId: 'profile-1', linkedAnalyticsVisitor: true },
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchImpl.mock.calls[0];
    expect(endpoint).toBe('/site/crm/identify-login');
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-abc');
    expect(headers['x-cedros-org-id']).toBe('org-uuid');
    expect(headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(init?.body as string) as { eventId: string };
    expect(body.eventId).toMatch(/^login:user-1:\d+$/);
  });

  it('returns visitor-not-linked when cedros_vid cookie was missing', async () => {
    const config: CrmIdentifyConfig = { enabled: true, orgId: 'org-uuid' };
    const fetchImpl = vi.fn(async () =>
      jsonResponse(200, { identified: true, profileId: 'profile-1', linkedAnalyticsVisitor: false })
    );

    const outcome = await notifyCrmIdentifyLogin({
      config,
      user,
      accessToken: 'token-abc',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger: silentLogger(),
    });

    expect(outcome.kind).toBe('visitor-not-linked');
  });

  it('returns precondition-failed on HTTP 428 without throwing', async () => {
    const config: CrmIdentifyConfig = { enabled: true, orgId: 'org-uuid' };
    const fetchImpl = vi.fn(async () => new Response(null, { status: 428 }));
    const logger = silentLogger();

    const outcome = await notifyCrmIdentifyLogin({
      config,
      user,
      accessToken: 'token-abc',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger,
    });

    expect(outcome).toEqual({ kind: 'precondition-failed' });
    expect(logger.debug).toHaveBeenCalled();
  });

  it('returns failed (not thrown) on network error', async () => {
    const config: CrmIdentifyConfig = { enabled: true, orgId: 'org-uuid' };
    const fetchImpl = vi.fn(async () => {
      throw new Error('network down');
    });

    const outcome = await notifyCrmIdentifyLogin({
      config,
      user,
      accessToken: 'token-abc',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger: silentLogger(),
    });

    expect(outcome.kind).toBe('failed');
  });

  it('skips when disabled / missing orgId / missing token', async () => {
    const fetchImpl = vi.fn();
    const baseArgs = {
      user,
      accessToken: 'token-abc',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger: silentLogger(),
    };

    expect(
      (await notifyCrmIdentifyLogin({ ...baseArgs, config: { enabled: false, orgId: 'o' } })).kind
    ).toBe('skipped');
    expect((await notifyCrmIdentifyLogin({ ...baseArgs, config: { enabled: true } })).kind).toBe(
      'skipped'
    );
    expect(
      (
        await notifyCrmIdentifyLogin({
          ...baseArgs,
          accessToken: '',
          config: { enabled: true, orgId: 'o' },
        })
      ).kind
    ).toBe('skipped');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('honors getEventId override and custom endpoint', async () => {
    const fetchImpl = vi.fn<FetchMock>(async () =>
      jsonResponse(200, { identified: true, profileId: 'p', linkedAnalyticsVisitor: true })
    );

    await notifyCrmIdentifyLogin({
      config: {
        enabled: true,
        orgId: 'org-uuid',
        endpoint: '/proxy/crm/identify',
        getEventId: (u) => `custom:${u.id}`,
      },
      user,
      accessToken: 'tok',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger: silentLogger(),
    });

    const [endpoint, init] = fetchImpl.mock.calls[0];
    expect(endpoint).toBe('/proxy/crm/identify');
    expect(JSON.parse(init?.body as string)).toEqual({ eventId: 'custom:user-1' });
  });

  it('skips when endpoint resolves to a different origin', async () => {
    const fetchImpl = vi.fn();
    const logger = silentLogger();

    const outcome = await notifyCrmIdentifyLogin({
      config: {
        enabled: true,
        orgId: 'org-uuid',
        endpoint: 'https://attacker.example/collect',
      },
      user,
      accessToken: 'tok',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger,
    });

    expect(outcome).toEqual({ kind: 'skipped', reason: 'cross-origin-endpoint' });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });
});
