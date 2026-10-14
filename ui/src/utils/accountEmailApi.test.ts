import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccountEmailApiClient } from './accountEmailApi';

describe('AccountEmailApiClient', () => {
  const baseUrl = 'http://example.test';
  const mockEmails = [
    {
      id: 'email-1',
      email: 'primary@example.com',
      verified: true,
      primary: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'email-2',
      email: 'pending@example.com',
      verified: false,
      primary: false,
      createdAt: '2026-01-02T00:00:00Z',
    },
  ];

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns emails from GET /account/emails', async () => {
    stubJson({ emails: mockEmails });

    const client = new AccountEmailApiClient(baseUrl);
    const result = await client.listEmails();

    expect(result).toEqual(mockEmails);
    expect(fetch).toHaveBeenCalledTimes(1);
    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe(`${baseUrl}/account/emails`);
    expect((call[1] as RequestInit).method).toBe('GET');
  });

  it('adds an email with POST /account/emails', async () => {
    stubJson({ emails: mockEmails });

    const client = new AccountEmailApiClient(baseUrl);
    const result = await client.addEmail('new@example.com');

    expect(result).toEqual(mockEmails);
    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe(`${baseUrl}/account/emails`);
    expect((call[1] as RequestInit).method).toBe('POST');
    expect((call[1] as RequestInit).body).toBe(JSON.stringify({ email: 'new@example.com' }));
  });

  it('encodes identifiers for remove and primary routes', async () => {
    stubJson({ emails: mockEmails });

    const client = new AccountEmailApiClient(baseUrl);
    await client.removeEmail('email/2');
    await client.setPrimaryEmail('email/2');

    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(`${baseUrl}/account/emails/email%2F2`);
    expect(vi.mocked(fetch).mock.calls[1][0]).toBe(`${baseUrl}/account/emails/email%2F2/primary`);
  });

  it('throws AuthError on duplicate email', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: 'EMAIL_EXISTS', message: 'Email already exists' }), {
          status: 409,
          headers: { 'content-type': 'application/json' },
        })
      )
    );

    const client = new AccountEmailApiClient(baseUrl);
    await expect(client.addEmail('used@example.com')).rejects.toMatchObject({
      code: 'EMAIL_EXISTS',
      message: 'An account with this email already exists. Try signing in instead.',
    });
  });
});

function stubJson(body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    )
  );
}
