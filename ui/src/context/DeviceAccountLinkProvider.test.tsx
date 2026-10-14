import { act, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { CedrosLoginProvider } from './CedrosLoginProvider';
import { useAuth } from '../hooks/useAuth';
import { useEmailAuth } from '../hooks/useEmailAuth';
import type { AuthUser, CedrosLoginConfig } from '../types';
import { DEVICE_ACCOUNT_HINT_KEY, recordDeviceAccountHint } from '../utils/deviceAccountHint';
import { server } from '../test/mocks/server';

const TEST_CONFIG: CedrosLoginConfig = {
  serverUrl: 'http://localhost:8080',
  requestTimeout: 5000,
  retryAttempts: 0,
};

const hintedUser: AuthUser = {
  id: 'user-existing',
  email: 'test@example.com',
  authMethods: ['email'],
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function wrapper({ children }: { children: ReactNode }) {
  return <CedrosLoginProvider config={TEST_CONFIG}>{children}</CedrosLoginProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('DeviceAccountLinkProvider', () => {
  it('writes the last-account hint on login and leaves it through logout', async () => {
    const { result } = renderHook(
      () => ({
        auth: useAuth(),
        email: useEmailAuth(),
      }),
      { wrapper }
    );

    await act(async () => {
      await result.current.email.login('test@example.com', 'TestPassword1!');
    });

    await waitFor(() => {
      expect(localStorage.getItem(DEVICE_ACCOUNT_HINT_KEY)).toBeTruthy();
    });
    const hintBeforeLogout = localStorage.getItem(DEVICE_ACCOUNT_HINT_KEY);
    expect(hintBeforeLogout).not.toContain('test@example.com');

    await act(async () => {
      await result.current.auth.logout();
    });

    expect(localStorage.getItem(DEVICE_ACCOUNT_HINT_KEY)).toBe(hintBeforeLogout);
  });

  it('links a mismatched email signup to the existing account without registering a new user', async () => {
    const user = userEvent.setup();
    await recordDeviceAccountHint(hintedUser, 'email');

    let registerCalls = 0;
    let addedEmail: string | undefined;

    server.use(
      http.post('http://localhost:8080/register', () => {
        registerCalls += 1;
        return HttpResponse.json({ code: 'SHOULD_NOT_REGISTER' }, { status: 500 });
      }),
      http.get('http://localhost:8080/credentials', () =>
        HttpResponse.json({
          credentials: [
            {
              id: 'cred-password',
              credentialType: 'password',
              label: 'Password',
              isPrimary: true,
              createdAt: new Date().toISOString(),
            },
          ],
        })
      ),
      http.post('http://localhost:8080/account/emails', async ({ request }) => {
        const body = (await request.json()) as { email?: string };
        addedEmail = body.email;
        return HttpResponse.json({
          emails: [{ id: 'email-2', email: body.email, verified: false, primary: false }],
        });
      })
    );

    const { result } = renderHook(() => useEmailAuth(), { wrapper });

    let registerPromise: Promise<unknown>;
    act(() => {
      registerPromise = result.current.register(
        'new-device@example.com',
        'NewPassword1!',
        'New Device'
      );
    });

    expect(await screen.findByText('Account found on this device')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Link to my existing account' }));
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'TestPassword1!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await act(async () => {
      await registerPromise!;
    });

    expect(registerCalls).toBe(0);
    expect(addedEmail).toBe('new-device@example.com');
  });
});
