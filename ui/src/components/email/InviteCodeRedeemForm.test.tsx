import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CedrosLoginProvider } from '../../context/CedrosLoginProvider';
import { server } from '../../test/mocks/server';
import type { AuthResponse, CedrosLoginConfig } from '../../types';
import { InviteCodeRedeemForm } from './InviteCodeRedeemForm';

const TEST_SERVER_URL = 'http://localhost:8080';
const config: CedrosLoginConfig = {
  serverUrl: TEST_SERVER_URL,
  requestTimeout: 5000,
  retryAttempts: 0,
  features: {},
};

const redeemedResponse: AuthResponse = {
  user: {
    id: 'user-id',
    email: 'invited@example.com',
    authMethods: ['email'],
    emailVerified: true,
    createdAt: '2026-06-16T00:00:00.000Z',
    updatedAt: '2026-06-16T00:00:00.000Z',
  },
  tokens: { accessToken: 'access-token', refreshToken: 'refresh-token', expiresIn: 3600 },
  isNewUser: true,
  method: 'email',
};

function renderForm(onSuccess?: (response: AuthResponse) => void, onBackToLogin?: () => void) {
  return render(
    <CedrosLoginProvider config={config}>
      <InviteCodeRedeemForm
        pendingInviteToken="pending-token"
        onSuccess={onSuccess}
        onBackToLogin={onBackToLogin}
      />
    </CedrosLoginProvider>
  );
}

async function submitCode(code: string) {
  fireEvent.change(screen.getByLabelText('Invite code'), { target: { value: code } });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  await screen.findByText('You’re in!');
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('InviteCodeRedeemForm unlock celebration', () => {
  it('reveals the discount and waits for Continue before completing login', async () => {
    server.use(
      http.post(`${TEST_SERVER_URL}/invite-codes/redeem`, () =>
        HttpResponse.json({
          ...redeemedResponse,
          inviteDiscount: { percentOff: 50, code: 'GOLD50' },
        })
      )
    );
    const onSuccess = vi.fn();
    renderForm(onSuccess);

    await submitCode('GOLD50');

    expect(screen.getByText('50% off your subscription')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();

    vi.useFakeTimers();
    act(() => vi.advanceTimersByTime(5000));
    vi.useRealTimers();
    expect(screen.getByText('You’re in!')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onSuccess.mock.calls[0][0].inviteDiscount).toEqual({
      percentOff: 50,
      code: 'GOLD50',
    });
  });

  it('celebrates without a reward badge when the code carries no discount', async () => {
    server.use(
      http.post(`${TEST_SERVER_URL}/invite-codes/redeem`, () => HttpResponse.json(redeemedResponse))
    );
    renderForm();

    await submitCode('WELCOME');

    expect(screen.queryByText(/off your subscription/)).not.toBeInTheDocument();
    expect(screen.queryByText('Your subscription is free')).not.toBeInTheDocument();
  });

  it('waits for Continue before showing email verification and centers Back to login', async () => {
    server.use(
      http.post(`${TEST_SERVER_URL}/invite-codes/redeem`, () =>
        HttpResponse.json({
          ...redeemedResponse,
          user: { ...redeemedResponse.user, emailVerified: false },
          tokens: undefined,
          emailQueued: true,
        })
      )
    );
    const onSuccess = vi.fn();
    const onBackToLogin = vi.fn();
    renderForm(onSuccess, onBackToLogin);

    await submitCode('WELCOME');
    expect(screen.queryByText('Check your email')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Check your email')).toBeInTheDocument();
    const back = screen.getByRole('button', { name: 'Back to login' });
    expect(back.closest('.cedros-form-footer')).toBeInTheDocument();
    fireEvent.click(back);
    expect(onBackToLogin).toHaveBeenCalledOnce();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('stays on invite entry when redemption fails', async () => {
    server.use(
      http.post(`${TEST_SERVER_URL}/invite-codes/redeem`, () =>
        HttpResponse.json(
          { code: 'INVALID_INVITE_CODE', message: 'Invalid invite code' },
          { status: 403 }
        )
      )
    );
    renderForm();

    fireEvent.change(screen.getByLabelText('Invite code'), { target: { value: 'BADCODE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByLabelText('Invite code')).toHaveValue('BADCODE');
    expect(screen.queryByText('You’re in!')).not.toBeInTheDocument();
  });
});
