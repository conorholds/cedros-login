/**
 * Component tests for EmailLoginForm
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { EmailLoginForm } from './EmailLoginForm';
import { CedrosLoginProvider } from '../../context/CedrosLoginProvider';
import { server } from '../../test/mocks/server';
import type { CedrosLoginConfig } from '../../types';

const TEST_CONFIG: CedrosLoginConfig = {
  serverUrl: 'http://localhost:8080',
  requestTimeout: 5000,
  retryAttempts: 0,
  features: {},
};

function renderWithProvider(
  props: React.ComponentProps<typeof EmailLoginForm> = {},
  config: CedrosLoginConfig = TEST_CONFIG
) {
  return render(
    <CedrosLoginProvider config={config}>
      <EmailLoginForm {...props} />
    </CedrosLoginProvider>
  );
}

function holdLoginRequest() {
  let releaseRequest!: () => void;
  const pendingRequest = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });

  server.use(
    http.post(`${TEST_CONFIG.serverUrl}/login`, async () => {
      await pendingRequest;
      return HttpResponse.json(
        { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        { status: 401 }
      );
    })
  );

  return releaseRequest;
}

describe('EmailLoginForm', () => {
  describe('rendering', () => {
    it('should render email input', () => {
      renderWithProvider();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should render password input', () => {
      renderWithProvider();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should render sign in button', () => {
      renderWithProvider();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('should render with correct placeholders', () => {
      renderWithProvider();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      renderWithProvider({ className: 'custom-form-class' });
      const form = document.querySelector('.cedros-form');
      expect(form).toHaveClass('custom-form-class');
    });
  });

  describe('sign up link', () => {
    it('should not render sign up link by default', () => {
      renderWithProvider();
      expect(screen.queryByText(/Don't have an account/)).not.toBeInTheDocument();
    });

    it('should render sign up link when onSwitchToRegister is provided', () => {
      const onSwitchToRegister = vi.fn();
      renderWithProvider({ onSwitchToRegister });
      expect(screen.getByText(/Don't have an account/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
    });

    it('should call onSwitchToRegister when sign up link is clicked', async () => {
      const user = userEvent.setup();
      const onSwitchToRegister = vi.fn();
      renderWithProvider({ onSwitchToRegister });

      await user.click(screen.getByRole('button', { name: 'Sign up' }));

      expect(onSwitchToRegister).toHaveBeenCalledTimes(1);
    });
  });

  describe('form validation', () => {
    it('should have required attribute on email input', () => {
      renderWithProvider();
      expect(screen.getByLabelText('Email')).toBeRequired();
    });

    it('should have required attribute on password input', () => {
      renderWithProvider();
      expect(screen.getByLabelText('Password')).toBeRequired();
    });

    it('should disable submit button when email is empty', () => {
      renderWithProvider();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
    });

    it('should disable submit button when password is empty', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');

      expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
    });

    it('should enable submit button when both fields are filled', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');

      expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    });
  });

  describe('form submission', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      const releaseRequest = holdLoginRequest();
      renderWithProvider();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'TestPassword1!');

      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });

      releaseRequest();
      await waitFor(() => expect(submitButton).toHaveAttribute('aria-busy', 'false'));
    });

    it('should call onSuccess when login succeeds', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      renderWithProvider({ onSuccess });

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'TestPassword1!');

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            isNewUser: false,
            user: expect.objectContaining({ email: 'test@example.com' }),
          })
        );
      });
    });

    it('should disable inputs during loading', async () => {
      const user = userEvent.setup();
      const releaseRequest = holdLoginRequest();
      renderWithProvider();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'TestPassword1!');

      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeDisabled();
        expect(screen.getByLabelText('Password')).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });

      releaseRequest();
      await waitFor(() => expect(screen.getByLabelText('Email')).toBeEnabled());
    });
  });

  describe('error handling', () => {
    it('turns an unverified login into a recoverable resend flow', async () => {
      const user = userEvent.setup();
      const resend = vi.fn();
      server.use(
        http.post(`${TEST_CONFIG.serverUrl}/login`, () =>
          HttpResponse.json({ code: 'email_not_verified' }, { status: 403 })
        ),
        http.post(`${TEST_CONFIG.serverUrl}/send-verification`, async ({ request }) => {
          resend(await request.json());
          return HttpResponse.json({ message: 'ok' });
        })
      );
      renderWithProvider();

      await user.type(screen.getByLabelText('Email'), 'pending@example.com');
      await user.type(screen.getByLabelText('Password'), 'TestPassword1!');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
      expect(
        screen.getByText(/open it to verify your account and continue automatically/i)
      ).toBeInTheDocument();
      const resendButton = screen.getByRole('button', { name: 'Resend verification email' });
      await user.click(resendButton);

      await waitFor(() => expect(resend).toHaveBeenCalledWith({ email: 'pending@example.com' }));
      await waitFor(() => expect(resendButton).toBeEnabled());
      expect(screen.getByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show error message on invalid credentials', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'WrongPassword');

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        // Error message should appear
        const errorElement = document.querySelector('.cedros-error');
        expect(errorElement).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const loginRequest = vi.fn();
      server.use(
        http.post(`${TEST_CONFIG.serverUrl}/login`, () => {
          loginRequest();
          return HttpResponse.json({}, { status: 500 });
        })
      );
      renderWithProvider({ onSuccess });

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'invalid-email');
      await user.type(screen.getByLabelText('Password'), 'TestPassword1!');

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      expect(emailInput).toBeInvalid();
      expect(loginRequest).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper autocomplete attributes', () => {
      renderWithProvider();
      expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'username');
      expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
    });

    it('should have aria-required on required fields', () => {
      renderWithProvider();
      expect(screen.getByLabelText('Email')).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-busy on submit button', () => {
      renderWithProvider();
      const submitButton = screen.getByRole('button', { name: 'Sign in' });
      // Initially aria-busy should be false
      expect(submitButton).toHaveAttribute('aria-busy', 'false');
    });
  });

  describe('input interactions', () => {
    it('should update email field on input', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password field on input', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'mypassword');

      expect(passwordInput).toHaveValue('mypassword');
    });

    it('should clear inputs after successful submission', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      renderWithProvider({ onSuccess });

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'TestPassword1!');

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
      expect(screen.getByLabelText('Email')).toHaveValue('');
      expect(screen.getByLabelText('Password')).toHaveValue('');
    });
  });
});
