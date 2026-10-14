import { http, HttpResponse } from 'msw';

import { TEST_SERVER_URL } from './mockState';

export const identityHandlers = [
  http.post(`${TEST_SERVER_URL}/account/emails`, async ({ request }) => {
    const body = (await request.json()) as { email: string };
    return HttpResponse.json({
      emails: [
        {
          id: 'pending-email-id',
          email: body.email,
          verified: false,
          primary: false,
          createdAt: '2026-03-02T00:00:00Z',
        },
      ],
    });
  }),

  // =============================================================================
  // INSTANT LINK HANDLERS
  // =============================================================================

  http.post(`${TEST_SERVER_URL}/instant-link`, () => {
    return HttpResponse.json({
      message: 'If an account exists, a sign-in link has been sent',
    });
  }),

  http.post(`${TEST_SERVER_URL}/instant-link/verify`, async ({ request }) => {
    const body = (await request.json()) as { token?: string };
    if (!body.token) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Invalid or expired link' },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        emailVerified: true,
        name: 'Test User',
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      },
      isNewUser: false,
    });
  }),

  // =============================================================================
  // WEBAUTHN (PASSKEY) HANDLERS
  // =============================================================================

  http.post(`${TEST_SERVER_URL}/webauthn/auth/options`, () => {
    return HttpResponse.json({
      challengeId: '00000000-0000-0000-0000-000000000001',
      options: {
        publicKey: {
          challenge: 'AQIDBAUGBwgJCgsMDQ4PEA',
          timeout: 60000,
          userVerification: 'preferred',
          rpId: 'localhost',
          allowCredentials: [],
        },
      },
    });
  }),

  http.post(`${TEST_SERVER_URL}/webauthn/auth/verify`, () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        emailVerified: true,
        name: 'Test User',
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      },
      isNewUser: false,
    });
  }),

  http.post(`${TEST_SERVER_URL}/webauthn/register/options`, () => {
    return HttpResponse.json({
      challengeId: '00000000-0000-0000-0000-000000000002',
      options: {
        publicKey: {
          challenge: 'AQIDBAUGBwgJCgsMDQ4PEA',
          timeout: 60000,
          rp: { name: 'Cedros Login', id: 'localhost' },
          user: {
            id: 'AQIDBAUGBwgJCgsMDQ4PEA',
            name: 'test@example.com',
            displayName: 'Test User',
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          excludeCredentials: [],
          authenticatorSelection: {
            residentKey: 'preferred',
            requireResidentKey: false,
            userVerification: 'preferred',
          },
        },
      },
    });
  }),

  http.post(`${TEST_SERVER_URL}/webauthn/register/verify`, async ({ request }) => {
    const body = (await request.json()) as { label?: string };
    return HttpResponse.json({
      success: true,
      credentialId: 'mock-credential-id',
      label: body.label,
    });
  }),

  http.post(`${TEST_SERVER_URL}/webauthn/signup/options`, () => {
    return HttpResponse.json({
      challengeId: '00000000-0000-0000-0000-000000000003',
      options: {
        publicKey: {
          challenge: 'AQIDBAUGBwgJCgsMDQ4PEA',
          timeout: 60000,
          rp: { name: 'Cedros Login', id: 'localhost' },
          user: {
            id: 'AQIDBAUGBwgJCgsMDQ4PEA',
            name: 'passkey-user',
            displayName: 'Passkey User',
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          excludeCredentials: [],
          authenticatorSelection: {
            residentKey: 'preferred',
            requireResidentKey: false,
            userVerification: 'preferred',
          },
        },
      },
    });
  }),

  http.post(`${TEST_SERVER_URL}/webauthn/signup/verify`, async ({ request }) => {
    const body = (await request.json()) as {
      challengeId: string;
      credential: unknown;
      email?: string;
      name?: string;
      label?: string;
    };
    return HttpResponse.json({
      user: {
        id: 'new-passkey-user-id',
        email: body.email ?? null,
        emailVerified: false,
        name: body.name ?? null,
        authMethods: ['webauthn'],
        createdAt: '2026-03-02T00:00:00Z',
        updatedAt: '2026-03-02T00:00:00Z',
      },
      tokens: {
        accessToken: 'mock-signup-access-token',
        refreshToken: 'mock-signup-refresh-token',
        expiresIn: 3600,
      },
      isNewUser: true,
    });
  }),

  // Discovery endpoint (returns wallet config including recovery mode)
  http.get(`${TEST_SERVER_URL}/discovery`, () => {
    return HttpResponse.json({
      wallet: {
        enabled: true,
        recoveryMode: 'share_c_only', // Options: 'share_c_only', 'full_seed', 'none'
        unlockTtlSeconds: 900,
      },
    });
  }),
];
