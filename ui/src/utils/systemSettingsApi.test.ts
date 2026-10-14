import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CedrosAutosaveSaveMetadata } from '../autosave';
import { SystemSettingsApiClient } from './systemSettingsApi';

const baseUrl = 'https://auth.example.com';

describe('SystemSettingsApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts the exact Wasm admin settings response fixture', async () => {
    const fixture = JSON.parse(
      readFileSync(
        resolve(process.cwd(), '../contracts/fixtures/cedros-login-admin-settings-response.json'),
        'utf8'
      )
    ) as unknown;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(fixture))
    );

    const client = new SystemSettingsApiClient(baseUrl, 100, 0);

    await expect(client.getSettings()).resolves.toEqual(fixture);
  });

  it('normalizes the pre-grouped Wasm key/value response without crashing render', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          settings: {
            auth_email_enabled: true,
            auth_instantlink_expiry: 900,
            signup_access_code: 'do-not-expose',
            webhook_secret: 'also-do-not-expose',
          },
        })
      )
    );

    const client = new SystemSettingsApiClient(baseUrl, 100, 0);

    await expect(client.getSettings()).resolves.toEqual({
      settings: {
        legacy: [
          expect.objectContaining({
            key: 'auth_email_enabled',
            value: 'true',
            isSecret: false,
          }),
          expect.objectContaining({
            key: 'auth_instantlink_expiry',
            value: '900',
            isSecret: false,
          }),
          expect.objectContaining({
            key: 'signup_access_code',
            value: '',
            isSecret: true,
            hasValue: true,
          }),
          expect.objectContaining({
            key: 'webhook_secret',
            value: '',
            isSecret: true,
            hasValue: true,
          }),
        ],
      },
    });
  });

  it('rejects malformed grouped settings before they reach React render', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          settings: {
            auth: [{ key: 'auth_email_enabled', value: true }],
          },
        })
      )
    );

    const client = new SystemSettingsApiClient(baseUrl, 100, 0);

    await expect(client.getSettings()).rejects.toThrow();
  });

  it('uses the autosave protocol when an ETag is available', async () => {
    const fetchMock = vi.fn(async () => {
      return jsonResponse({
        updated: [
          {
            key: 'auth_email_enabled',
            value: 'false',
            description: null,
            isSecret: false,
            updatedAt: '2026-07-02T00:00:00.000Z',
            updatedBy: 'admin-1',
          },
        ],
        revision: 2,
        etag: '"cedros.system_settings:2"',
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new SystemSettingsApiClient(baseUrl, 100, 0, () => 'token');
    const result = await client.autosaveSettings(
      [{ key: 'auth_email_enabled', value: 'false' }],
      metadata({ etag: '"cedros.system_settings:1"' })
    );

    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/admin/settings/autosave`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          autosave: true,
          clientMutationId: 'mutation-1',
          editingSessionId: 'session-1',
          clientSeq: 1,
          updateMask: ['auth_email_enabled'],
          patch: [{ key: 'auth_email_enabled', value: 'false' }],
          schemaVersion: 'v1',
        }),
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
          'If-Match': '"cedros.system_settings:1"',
          'Idempotency-Key': 'idem-1',
        }),
      })
    );
    expect(result).toMatchObject({
      resourceId: 'global',
      revision: 2,
      etag: '"cedros.system_settings:2"',
      canonicalPatchOrResource: { auth_email_enabled: 'false' },
    });
  });

  it('falls back to settings PATCH when an extension runtime has no ETag', async () => {
    const fetchMock = vi.fn(async () => {
      return jsonResponse({
        updated: [
          {
            key: 'auth_email_require_verification',
            value: 'false',
            description: null,
            isSecret: false,
            updatedAt: '2026-07-02T00:00:00.000Z',
            updatedBy: null,
          },
        ],
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new SystemSettingsApiClient(baseUrl, 100, 0);
    const result = await client.autosaveSettings(
      [{ key: 'auth_email_require_verification', value: 'false' }],
      metadata()
    );

    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/admin/settings`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          settings: [{ key: 'auth_email_require_verification', value: 'false' }],
        }),
      })
    );
    expect(result).toMatchObject({
      resourceId: 'global',
      canonicalPatchOrResource: { auth_email_require_verification: 'false' },
    });
  });

  it('serializes multi-setting extension autosave into one-key host seam requests', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        settings: Array<{ key: string; value: string }>;
      };
      const [setting] = body.settings;
      return jsonResponse({
        updated: [
          {
            ...setting,
            description: null,
            isSecret: false,
            updatedAt: '2026-07-02T00:00:00.000Z',
            updatedBy: null,
          },
        ],
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new SystemSettingsApiClient(baseUrl, 100, 0);
    const result = await client.autosaveSettings(
      [
        { key: 'auth_email_enabled', value: 'false' },
        { key: 'feature_mfa', value: 'false' },
      ],
      metadata()
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${baseUrl}/admin/settings`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          settings: [{ key: 'auth_email_enabled', value: 'false' }],
        }),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${baseUrl}/admin/settings`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          settings: [{ key: 'feature_mfa', value: 'false' }],
        }),
      })
    );
    expect(result).toMatchObject({
      resourceId: 'global',
      canonicalPatchOrResource: {
        auth_email_enabled: 'false',
        feature_mfa: 'false',
      },
    });
  });

  it('stops serialized extension autosave after a one-key request fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          updated: [{ key: 'auth_email_enabled', value: 'false' }],
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'invalid_setting' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    const client = new SystemSettingsApiClient(baseUrl, 100, 0);

    await expect(
      client.autosaveSettings(
        [
          { key: 'auth_email_enabled', value: 'false' },
          { key: 'feature_mfa', value: 'false' },
          { key: 'auth_google_enabled', value: 'false' },
        ],
        metadata()
      )
    ).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function metadata(overrides: Partial<CedrosAutosaveSaveMetadata> = {}): CedrosAutosaveSaveMetadata {
  return {
    resourceType: 'cedros.system_settings',
    resourceId: 'global',
    clientMutationId: 'mutation-1',
    editingSessionId: 'session-1',
    clientSeq: 1,
    idempotencyKey: 'idem-1',
    retryCount: 0,
    signal: new AbortController().signal,
    ...overrides,
  };
}
