import { afterEach, describe, expect, it, vi } from 'vitest';

import { RelyingPartyApiClient } from './relyingPartyApi';

describe('RelyingPartyApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts redacted readiness summaries for Portal and Pay', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        response({
          ready: false,
          relyingParties: [status('cedros-portal', true), status('cedros-pay', false)],
        })
      )
    );
    const client = new RelyingPartyApiClient('https://admin.test', () => 'admin-token');

    const readiness = await client.getReadiness();

    expect(readiness.ready).toBe(false);
    expect(readiness.relyingParties.map((entry) => entry.relyingPartyId)).toEqual([
      'cedros-portal',
      'cedros-pay',
    ]);
  });

  it('rejects any response that includes a raw token field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        response({
          ready: false,
          relyingParties: [{ ...status('cedros-portal', false), token: 'must-not-leak' }],
        })
      )
    );
    const client = new RelyingPartyApiClient('https://admin.test', () => 'admin-token');

    await expect(client.getReadiness()).rejects.toThrow();
  });

  it('sends secrets only in the configure write body', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => response(status('cedros-portal', true)));
    vi.stubGlobal('fetch', fetchMock);
    const client = new RelyingPartyApiClient('https://admin.test', () => 'admin-token');

    const configured = await client.configure('cedros-portal', {
      token: 'portal-service-token-at-least-32-bytes',
      allowedScopes: ['session:introspect'],
      allowedSessionAudiences: ['cedros-customer'],
      allowedOrganizationIds: ['org-1'],
    });

    expect(configured.tokenConfigured).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe('PUT');
    expect(JSON.parse(String(init?.body))).toEqual({
      token: 'portal-service-token-at-least-32-bytes',
      allowedScopes: ['session:introspect'],
      allowedSessionAudiences: ['cedros-customer'],
      allowedOrganizationIds: ['org-1'],
    });
  });

  it.each([404, 200])('validates Data membership probe status %s', async (statusCode) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        response({
          relyingPartyId: 'cedros-data',
          diagnostic: 'ready',
          ready: true,
          membership: { status: statusCode, error: 'not_found' },
        })
      )
    );
    const client = new RelyingPartyApiClient('https://admin.test', () => 'admin-token');
    const result = client.verify('cedros-data', {
      token: 'data-service-token-at-least-32-bytes',
      requiredScope: 'memberships:read',
      sessionAudience: 'cedros',
      organizationId: 'new-org',
    });
    if (statusCode === 404) {
      expect((await result).membership).toEqual({ status: 404, error: 'not_found' });
    } else {
      // ApiClient deliberately redacts validation failures to a safe public error.
      await expect(result).rejects.toThrow('Unable to reach the server');
    }
  });

  it('accepts the tenant-safe Casino identity profile verification probe', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      response({
        relyingPartyId: 'cedros-casino',
        diagnostic: 'ready',
        ready: true,
        identityProfile: { status: 404, error: 'not_found' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = new RelyingPartyApiClient('https://admin.test', () => 'admin-token');

    const verified = await client.verify('cedros-casino', {
      token: 'casino-service-token-at-least-32-bytes',
      requiredScope: 'identity-profile:read',
      sessionAudience: 'cedros-customer',
      organizationId: 'org-casino',
    });

    expect(verified.identityProfile).toEqual({ status: 404, error: 'not_found' });
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body)).requiredScope).toBe('identity-profile:read');
  });
});

function status(relyingPartyId: string, ready: boolean) {
  return {
    relyingPartyId,
    displayName: relyingPartyId === 'cedros-portal' ? 'Cedros Portal' : 'Cedros Pay',
    tokenConfigured: ready,
    policyConfigured: ready,
    ready,
    ...(ready
      ? {
          policySummary: {
            allowedScopes: ['session:introspect'],
            allowedSessionAudiences: ['cedros-customer'],
            allowedOrganizationIds: ['org-1'],
          },
        }
      : {}),
    validationErrors: ready ? [] : ['token_absent', 'policy_absent'],
  };
}

function response(body: unknown, statusCode = 200): Response {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { 'content-type': 'application/json' },
  });
}
