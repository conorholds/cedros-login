import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { CedrosLoginProvider } from '../context/CedrosLoginProvider';
import { server } from '../test/mocks/server';
import type { AuthError, CedrosLoginConfig } from '../types';
import { useTotp } from './useTotp';

const TEST_SERVER_URL = 'http://localhost:8080';
const TEST_CONFIG: CedrosLoginConfig = {
  serverUrl: TEST_SERVER_URL,
  requestTimeout: 5000,
  retryAttempts: 0,
};

function wrapper({ children }: { children: ReactNode }) {
  return <CedrosLoginProvider config={TEST_CONFIG}>{children}</CedrosLoginProvider>;
}

describe('useTotp', () => {
  it('posts a recovery-code disable payload through the API client', async () => {
    const requests: unknown[] = [];
    server.use(
      http.post(`${TEST_SERVER_URL}/mfa/disable`, async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({ message: 'MFA disabled successfully' });
      })
    );
    const { result } = renderHook(() => useTotp(), { wrapper });

    await act(async () => {
      await result.current.disableTotp({ recoveryCode: 'ABCD-1234' });
    });

    expect(requests).toEqual([{ recoveryCode: 'ABCD-1234' }]);
    await waitFor(() => {
      expect(result.current.status).toEqual({ enabled: false, recoveryCodesRemaining: 0 });
    });
  });

  it('rejects empty disable confirmations before making an API request', async () => {
    const requests: unknown[] = [];
    server.use(
      http.post(`${TEST_SERVER_URL}/mfa/disable`, async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({ message: 'MFA disabled successfully' });
      })
    );
    const { result } = renderHook(() => useTotp(), { wrapper });
    let thrown: AuthError | undefined;

    await act(async () => {
      try {
        await result.current.disableTotp({ code: ' ' });
      } catch (error) {
        thrown = error as AuthError;
      }
    });

    expect(thrown).toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(requests).toHaveLength(0);
  });

  it('keeps password-backed code-only disable requests failing closed in MSW', async () => {
    const loginResponse = await fetch(`${TEST_SERVER_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword1!',
      }),
    });

    expect(loginResponse.ok).toBe(true);

    const loginPayload = (await loginResponse.json()) as {
      tokens: { accessToken: string };
    };

    const disableResponse = await fetch(`${TEST_SERVER_URL}/mfa/disable`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loginPayload.tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: '123456' }),
    });

    expect(disableResponse.status).toBe(400);
    await expect(disableResponse.json()).resolves.toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Password required for password-backed accounts',
    });
  });
});
