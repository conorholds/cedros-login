import { describe, it, expect, vi, afterEach } from 'vitest';
import { CredentialApiClient } from './credentialApi';

describe('CredentialApiClient', () => {
  const baseUrl = 'http://example.test';

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('listCredentials', () => {
    it('returns credentials array from GET /credentials', async () => {
      const mockCredentials = [
        {
          id: 'cred-1',
          credentialType: 'password',
          label: null,
          createdAt: '2024-01-01T00:00:00Z',
          lastUsedAt: '2024-06-01T00:00:00Z',
          isPrimary: true,
        },
        {
          id: 'cred-2',
          credentialType: 'oauth_google',
          label: 'Work Google',
          createdAt: '2024-02-01T00:00:00Z',
          lastUsedAt: null,
          isPrimary: false,
        },
      ];

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ credentials: mockCredentials }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
      );

      const client = new CredentialApiClient(baseUrl);
      const result = await client.listCredentials();

      expect(result).toEqual(mockCredentials);
      expect(fetch).toHaveBeenCalledTimes(1);
      const call = vi.mocked(fetch).mock.calls[0];
      expect(call[0]).toBe(`${baseUrl}/credentials`);
      expect((call[1] as RequestInit).method).toBe('GET');
    });

    it('throws AuthError on server error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ code: 'UNAUTHORIZED', message: 'Not logged in' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
          })
        )
      );

      const client = new CredentialApiClient(baseUrl);
      await expect(client.listCredentials()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Not logged in',
      });
    });
  });

  describe('unlinkCredential', () => {
    it('sends DELETE to /credentials/:id', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

      const client = new CredentialApiClient(baseUrl);
      await client.unlinkCredential('cred-123');

      expect(fetch).toHaveBeenCalledTimes(1);
      const call = vi.mocked(fetch).mock.calls[0];
      expect(call[0]).toBe(`${baseUrl}/credentials/cred-123`);
      expect((call[1] as RequestInit).method).toBe('DELETE');
    });

    it('throws on validation error (last primary method)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              code: 'VALIDATION_ERROR',
              message: 'Cannot remove last primary authentication method.',
            }),
            { status: 400, headers: { 'content-type': 'application/json' } }
          )
        )
      );

      const client = new CredentialApiClient(baseUrl);
      await expect(client.unlinkCredential('cred-1')).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        message: 'Cannot remove last primary authentication method.',
      });
    });
  });
});
