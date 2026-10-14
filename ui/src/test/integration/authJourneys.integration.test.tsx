import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { CedrosLoginProvider } from '../../context/CedrosLoginProvider';
import { NonWalletLoginForm } from '../../components/NonWalletLoginForm';
import { ResetPasswordForm } from '../../components/email/ResetPasswordForm';
import { PasswordInput } from '../../components/email/PasswordInput';
import type { ReactNode } from 'react';

function Provider({ children }: { children: ReactNode }) {
  return (
    <CedrosLoginProvider
      config={{
        serverUrl: 'http://localhost:8080',
        retryAttempts: 0,
        features: {
          email: true,
          google: false,
          apple: false,
          webauthn: false,
          solana: false,
          instantLink: false,
        },
      }}
    >
      {children}
    </CedrosLoginProvider>
  );
}

describe('authentication and recovery journeys', () => {
  it('keeps labels and keyboard tab navigation inside the selected embedded form', async () => {
    const user = userEvent.setup();
    render(
      <Provider>
        <section aria-label="First">
          <NonWalletLoginForm />
        </section>
        <section aria-label="Second">
          <NonWalletLoginForm />
        </section>
      </Provider>
    );
    const second = within(screen.getByRole('region', { name: 'Second' }));
    const first = within(screen.getByRole('region', { name: 'First' }));
    await user.click(await second.findByRole('tab', { name: 'Sign in' }));
    await user.keyboard('{ArrowRight}');
    expect(second.getByRole('tab', { name: 'Sign up' })).toHaveFocus();
    expect(first.getByRole('tab', { name: 'Sign in' })).toHaveAttribute('aria-selected', 'true');
    const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(first.getByLabelText('Email')).toHaveAttribute('autocomplete', 'username');
  });

  it('supports a supplied password field ID without losing labels or error descriptions', () => {
    render(
      <>
        <p id="hint">Use your account password</p>
        <PasswordInput id="host-password" aria-describedby="hint" error="Incorrect password" />
      </>
    );
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('id', 'host-password');
    expect(input).toHaveAccessibleDescription('Use your account password Incorrect password');
  });

  it('recovers from an expired reset link by requesting a new one', async () => {
    const user = userEvent.setup();
    render(
      <Provider>
        <ResetPasswordForm token="expired-token" />
      </Provider>
    );
    await user.type(screen.getByLabelText('New password'), 'ReplacementPassword1!');
    await user.type(screen.getByLabelText('Confirm Password'), 'ReplacementPassword1!');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));
    await user.click(await screen.findByRole('button', { name: 'Request a new reset link' }));
    await user.type(screen.getByLabelText('Email address'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByText('Check your email')).toBeInTheDocument();
  });

  it('accepts an autofilled MFA code, exposes rejection, and allows recovery-code login', async () => {
    const user = userEvent.setup();
    const success = vi.fn();
    let submittedCode = '';
    server.use(
      http.post('http://localhost:8080/login', () =>
        HttpResponse.json({ mfaRequired: true, mfaToken: 'fixture-mfa', email: 'test@example.com' })
      ),
      http.post('http://localhost:8080/login/mfa', async ({ request }) => {
        const body = (await request.json()) as { code: string };
        submittedCode = body.code;
        if (body.code === '123456')
          return HttpResponse.json(
            { code: 'INVALID_TOTP_CODE', message: 'Incorrect verification code' },
            { status: 401 }
          );
        return HttpResponse.json({
          user: { id: 'test-user', email: 'test@example.com' },
          tokens: {
            accessToken: 'fixture-access',
            refreshToken: 'fixture-refresh',
            expiresIn: 3600,
          },
        });
      })
    );
    render(
      <Provider>
        <NonWalletLoginForm onSuccess={success} />
      </Provider>
    );
    await user.type(await screen.findByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'TestPassword1!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    const digit = await screen.findByRole('textbox', { name: 'Digit 1' });
    fireEvent.change(digit, { target: { value: '123456' } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect verification code');
    await user.click(screen.getByRole('button', { name: 'Use a recovery code' }));
    await user.type(screen.getByLabelText('Recovery code'), ' ABCD-EFGH-IJKL-MNOP ');
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    expect(submittedCode).toBe('ABCD-EFGH-IJKL-MNOP');
    expect(success).toHaveBeenCalledOnce();
  });
});
