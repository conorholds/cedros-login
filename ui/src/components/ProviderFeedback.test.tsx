import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GoogleLoginButton } from './google/GoogleLoginButton';
import { AppleLoginButton } from './apple/AppleLoginButton';
import { LinkedAccounts } from './account/LinkedAccounts';

vi.mock('../hooks/useGoogleAuth', () => ({
  useGoogleAuth: () => ({
    isInitialized: false,
    isLoading: false,
    signIn: vi.fn(),
    error: {
      code: 'SERVER_ERROR',
      message: 'Unable to load Google sign-in. Please refresh and try again.',
    },
  }),
}));
vi.mock('../hooks/useAppleAuth', () => ({
  useAppleAuth: () => ({
    isInitialized: false,
    isLoading: false,
    signIn: vi.fn(),
    error: {
      code: 'SERVER_ERROR',
      message: 'Unable to load Apple sign-in. Please refresh and try again.',
    },
  }),
}));
vi.mock('../utils/deviceDetection', () => ({ isAppleDevice: () => false }));
vi.mock('../hooks/useCredentials', () => ({
  useCredentials: () => ({
    credentials: [],
    isLoading: false,
    error: null,
    unlinkCredential: vi.fn(),
    clearError: vi.fn(),
    fetchCredentials: vi.fn(),
  }),
}));
vi.mock('../hooks/useWebAuthn', () => ({
  useWebAuthn: () => ({
    registerPasskey: vi.fn(),
    isSupported: true,
    error: { code: 'SERVER_ERROR', message: 'Passkey operation was cancelled or timed out' },
    clearError: vi.fn(),
  }),
}));

describe('sign-in method failure feedback', () => {
  it('shows Google SDK load errors even when the button is disabled and an error callback exists', () => {
    render(<GoogleLoginButton onError={() => {}} />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load Google sign-in');
  });
  it('offers Apple sign-in on non-Apple devices and shows initialization failure', () => {
    render(<AppleLoginButton onError={() => {}} />);
    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load Apple sign-in');
  });
  it('shows passkey enrollment errors in account settings', () => {
    render(<LinkedAccounts />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Passkey operation was cancelled or timed out'
    );
  });
});
