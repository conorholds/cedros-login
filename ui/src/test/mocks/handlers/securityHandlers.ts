import { http, HttpResponse } from 'msw';

import type { AuthMethod } from '../../../types';
import {
  isPasswordBackedSession,
  mockTokens,
  mockUser,
  sessions,
  setSession,
  TAKEN_WALLET_ADDRESS,
  TEST_SERVER_URL,
} from './mockState';

export const securityHandlers = [
  // Solana challenge
  http.post(`${TEST_SERVER_URL}/solana/challenge`, async ({ request }) => {
    const body = (await request.json()) as { publicKey: string };

    if (body.publicKey.length < 43 || body.publicKey.length > 44) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Invalid public key format' },
        { status: 400 }
      );
    }

    const nonce = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    const timestamp = new Date().toISOString();
    const message = `Sign this message to authenticate with cedros-login.\n\nPublic Key: ${body.publicKey}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    return HttpResponse.json({
      message,
      nonce,
      expiresAt: new Date(Date.now() + 300000).toISOString(),
    });
  }),

  // Solana auth
  http.post(`${TEST_SERVER_URL}/solana`, async ({ request }) => {
    const body = (await request.json()) as {
      publicKey: string;
      signature: string;
      message: string;
    };

    if (!body.signature || !body.message) {
      return HttpResponse.json(
        { code: 'INVALID_SIGNATURE', message: 'Invalid signature' },
        { status: 401 }
      );
    }

    const solanaUser = {
      id: crypto.randomUUID(),
      email: null,
      name: null,
      emailVerified: false,
      walletAddress: body.publicKey,
      authMethods: ['solana'] as AuthMethod[],
    };

    setSession(mockTokens, solanaUser);

    return HttpResponse.json({
      user: solanaUser,
      tokens: mockTokens,
      isNewUser: true,
    });
  }),

  // Solana wallet link (attach wallet to the authenticated account)
  http.post(`${TEST_SERVER_URL}/solana/link`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !sessions.has(token)) {
      return HttpResponse.json(
        { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      publicKey: string;
      signature: string;
      message: string;
    };

    if (!body.signature || !body.message) {
      return HttpResponse.json(
        { code: 'INVALID_SIGNATURE', message: 'Invalid signature' },
        { status: 401 }
      );
    }
    if (body.publicKey === TAKEN_WALLET_ADDRESS) {
      return HttpResponse.json(
        { code: 'WALLET_EXISTS', message: 'Wallet already exists' },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      linked: 'solana',
      user: {
        ...mockUser,
        walletAddress: body.publicKey,
        authMethods: [...mockUser.authMethods, 'solana'],
      },
    });
  }),

  // MFA Setup - returns secret and otpauth URI
  // Note: In production this requires auth, but tests allow unauthenticated setup.
  http.post(`${TEST_SERVER_URL}/mfa/setup`, () => {
    // Generate mock TOTP secret (base32 encoded)
    const secret = 'JBSWY3DPEHPK3PXP';
    const issuer = 'CedrosLogin';
    const account = 'test@example.com';
    const otpauthUri = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

    // Generate mock recovery codes (server uses 16 chars)
    const recoveryCodes = [
      'A1B2C3D4E5F6G7H8',
      'I9J0K1L2M3N4O5P6',
      'Q7R8S9T0U1V2W3X4',
      'Y5Z6A7B8C9D0E1F2',
      'G3H4I5J6K7L8M9N0',
      'O1P2Q3R4S5T6U7V8',
      'W9X0Y1Z2A3B4C5D6',
      'E7F8G9H0I1J2K3L4',
      'M5N6O7P8Q9R0S1T2',
      'U3V4W5X6Y7Z8A9B0',
    ];

    return HttpResponse.json({
      secret,
      otpauthUri,
      recoveryCodes,
    });
  }),

  // MFA Enable - verify code and enable 2FA
  // Note: In production this requires auth, but tests allow unauthenticated setup.
  http.post(`${TEST_SERVER_URL}/mfa/enable`, async ({ request }) => {
    const body = (await request.json()) as { code: string };

    // Accept any 6-digit code for testing
    if (!/^\d{6}$/.test(body.code)) {
      return HttpResponse.json(
        { code: 'INVALID_TOTP_CODE', message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    return HttpResponse.json({ message: 'MFA enabled successfully' });
  }),

  // Complete MFA login
  http.post(`${TEST_SERVER_URL}/login/mfa`, async ({ request }) => {
    const body = (await request.json()) as { mfaToken: string; code: string };

    if (!body.mfaToken) {
      return HttpResponse.json(
        { code: 'INVALID_TOKEN', message: 'Invalid MFA token' },
        { status: 400 }
      );
    }

    const isRecoveryCode =
      /^[A-Z0-9]{16}$/i.test(body.code) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/i.test(body.code);
    const isValidCode = /^\d{6}$/.test(body.code) || isRecoveryCode;
    if (!isValidCode) {
      return HttpResponse.json(
        { code: 'INVALID_TOTP_CODE', message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    setSession(mockTokens, mockUser);

    return HttpResponse.json({
      user: mockUser,
      tokens: mockTokens,
      isNewUser: false,
    });
  }),

  // MFA Status - check if 2FA is enabled
  http.get(`${TEST_SERVER_URL}/mfa/status`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    const session = token ? sessions.get(token) : undefined;

    if (!session) {
      return HttpResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      enabled: false,
      recoveryCodesRemaining: 0,
    });
  }),

  // MFA Disable
  http.post(`${TEST_SERVER_URL}/mfa/disable`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const session = token ? sessions.get(token) : undefined;

    if (!session) {
      return HttpResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      password?: string;
      code?: string;
      recoveryCode?: string;
    };

    const hasPassword = Boolean(body.password?.trim());
    const hasCode = Boolean(body.code?.trim());
    const hasRecoveryCode = Boolean(body.recoveryCode?.trim());

    if (!hasPassword && !hasCode && !hasRecoveryCode) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Confirmation required' },
        { status: 400 }
      );
    }

    const isPasswordBacked = isPasswordBackedSession(session);
    if (isPasswordBacked && !hasPassword) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Password required for password-backed accounts',
        },
        { status: 400 }
      );
    }

    if (!isPasswordBacked && !hasCode && !hasRecoveryCode) {
      return HttpResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Authenticator or recovery code required for passwordless accounts',
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({ message: 'MFA disabled successfully' });
  }),

  // MFA recovery code regeneration
  http.post(`${TEST_SERVER_URL}/mfa/recovery-codes/regenerate`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !sessions.has(token)) {
      return HttpResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { code: string };
    if (!/^\d{6}$/.test(body.code)) {
      return HttpResponse.json(
        { code: 'INVALID_TOTP_CODE', message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      recoveryCodes: ['A1B2C3D4E5F6G7H8', 'I9J0K1L2M3N4O5P6'],
    });
  }),
];
