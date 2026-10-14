import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { CedrosLoginProvider } from '../context/CedrosLoginProvider';
import { useAuth } from './useAuth';
import { useEmailAuth } from './useEmailAuth';
import { server } from '../test/mocks/server';
import type { AuthResponse, AuthUser, CedrosLoginConfig } from '../types';

const TEST_SERVER_URL = 'http://localhost:8080';
const TEST_CONFIG: CedrosLoginConfig = {
  serverUrl: TEST_SERVER_URL,
  requestTimeout: 5000,
  retryAttempts: 0,
};

const pendingUser: AuthUser = {
  id: 'pending-user-id',
  email: 'pending@example.com',
  name: 'Pending User',
  authMethods: ['email'],
  emailVerified: true,
  createdAt: '2026-06-16T00:00:00.000Z',
  updatedAt: '2026-06-16T00:00:00.000Z',
};

const activeResponse: AuthResponse = {
  user: pendingUser,
  tokens: {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
  },
  isNewUser: true,
  method: 'email',
};

function createWrapper(config: CedrosLoginConfig = TEST_CONFIG) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <CedrosLoginProvider config={config}>{children}</CedrosLoginProvider>;
  };
}

function useInviteCodeAuth() {
  return {
    email: useEmailAuth(),
    auth: useAuth(),
  };
}

describe('useEmailAuth invite codes', () => {
  it('does not authenticate a registration that still requires email verification', async () => {
    server.use(
      http.post(`${TEST_SERVER_URL}/register`, () =>
        HttpResponse.json(
          {
            user: { ...pendingUser, emailVerified: false },
            isNewUser: true,
            emailQueued: true,
            method: 'email',
          },
          { status: 201 }
        )
      )
    );

    const { result } = renderHook(() => useInviteCodeAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.email.register('pending@example.com', 'SecurePass123!', 'Pending User');
    });

    expect(result.current.auth.isAuthenticated).toBe(false);
  });

  it('does not authenticate a registration that requires an invite code', async () => {
    server.use(
      http.post(`${TEST_SERVER_URL}/register`, () =>
        HttpResponse.json(
          {
            user: pendingUser,
            isNewUser: true,
            inviteCodeRequired: true,
            pendingInviteToken: 'pending-token',
            inviteGateHandoffStatus: 'accepted',
            method: 'email',
          },
          { status: 201 }
        )
      )
    );

    const { result } = renderHook(() => useInviteCodeAuth(), { wrapper: createWrapper() });

    let response: AuthResponse | undefined;
    await act(async () => {
      response = await result.current.email.register(
        'pending@example.com',
        'SecurePass123!',
        'Pending User'
      );
    });

    expect(response?.inviteCodeRequired).toBe(true);
    expect(response?.pendingInviteToken).toBe('pending-token');
    expect(response?.inviteGateHandoffStatus).toBe('accepted');
    expect(result.current.auth.isAuthenticated).toBe(false);
  });

  it('maps a missing host acceptance to truthful fallback state on pending login', async () => {
    server.use(
      http.post(`${TEST_SERVER_URL}/login`, () =>
        HttpResponse.json({
          user: pendingUser,
          isNewUser: false,
          inviteCodeRequired: true,
          pendingInviteToken: 'fresh-token',
          inviteGateHandoffStatus: 'unavailable',
          method: 'email',
        })
      )
    );
    const { result } = renderHook(() => useInviteCodeAuth(), { wrapper: createWrapper() });

    await act(async () => {
      const response = await result.current.email.login('pending@example.com', 'SecurePass123!');
      expect(response).toMatchObject({
        inviteCodeRequired: true,
        waitlistEnrollmentAccepted: false,
      });
    });
  });

  it('authenticates after redeeming a pending invite code', async () => {
    server.use(
      http.post(`${TEST_SERVER_URL}/register`, () =>
        HttpResponse.json(
          {
            user: pendingUser,
            isNewUser: true,
            inviteCodeRequired: true,
            pendingInviteToken: 'pending-token',
            method: 'email',
          },
          { status: 201 }
        )
      ),
      http.post(`${TEST_SERVER_URL}/invite-codes/redeem`, async ({ request }) => {
        const body = (await request.json()) as { pendingInviteToken: string; code: string };
        expect(body).toEqual({ pendingInviteToken: 'pending-token', code: 'WELCOME' });
        return HttpResponse.json(activeResponse);
      })
    );

    const { result } = renderHook(() => useInviteCodeAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.email.register('pending@example.com', 'SecurePass123!', 'Pending User');
    });

    let response: AuthResponse | undefined;
    await act(async () => {
      response = await result.current.email.redeemInviteCode('pending-token', 'WELCOME');
    });

    expect(response?.tokens?.accessToken).toBe('access-token');
    expect(result.current.auth.isAuthenticated).toBe(true);
    expect(result.current.auth.user?.email).toBe('pending@example.com');
  });

  it('does not authenticate after invite redemption while email remains unverified', async () => {
    server.use(
      http.post(`${TEST_SERVER_URL}/invite-codes/redeem`, () =>
        HttpResponse.json({
          user: { ...pendingUser, emailVerified: false },
          isNewUser: true,
          method: 'email',
        })
      )
    );

    const { result } = renderHook(() => useInviteCodeAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.email.redeemInviteCode('pending-token', 'WELCOME');
    });

    expect(result.current.auth.isAuthenticated).toBe(false);
  });

  it('defers authentication until completeInviteRedemption when requested', async () => {
    server.use(
      http.post(`${TEST_SERVER_URL}/invite-codes/redeem`, () =>
        HttpResponse.json({
          ...activeResponse,
          inviteDiscount: { percentOff: 50, code: 'GOLD50' },
        })
      )
    );

    const { result } = renderHook(() => useInviteCodeAuth(), { wrapper: createWrapper() });

    let response: AuthResponse | undefined;
    await act(async () => {
      response = await result.current.email.redeemInviteCode('pending-token', 'GOLD50', {
        deferLoginSuccess: true,
      });
    });

    expect(response?.inviteDiscount).toEqual({ percentOff: 50, code: 'GOLD50' });
    expect(result.current.auth.isAuthenticated).toBe(false);

    act(() => {
      result.current.email.completeInviteRedemption(response as AuthResponse);
    });

    expect(result.current.auth.isAuthenticated).toBe(true);
  });
});
