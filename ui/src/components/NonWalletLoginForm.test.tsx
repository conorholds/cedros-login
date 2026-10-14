import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NonWalletLoginForm } from './NonWalletLoginForm';
import { CedrosLoginProvider } from '../context/CedrosLoginProvider';
import type { CedrosLoginConfig } from '../types';
import { detectSolanaWallets } from '../utils/walletDetection';

vi.mock('../utils/walletDetection', () => ({
  detectSolanaWallets: vi.fn(() => true),
}));

const TEST_CONFIG: CedrosLoginConfig = {
  serverUrl: 'http://localhost:8080',
  requestTimeout: 5000,
  retryAttempts: 0,
  googleClientId: 'test-google-client',
  features: {
    email: true,
    google: true,
    solana: true,
    webauthn: false,
  },
};

function renderWithProvider(config: CedrosLoginConfig = TEST_CONFIG) {
  return render(
    <CedrosLoginProvider config={config}>
      <NonWalletLoginForm />
    </CedrosLoginProvider>
  );
}

describe('NonWalletLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('omits the Solana button even when the feature flag is enabled', async () => {
    renderWithProvider();

    expect(await screen.findByRole('tab', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('Continue with Solana')).not.toBeInTheDocument();
    expect(vi.mocked(detectSolanaWallets)).not.toHaveBeenCalled();
  });

  it('does not show the social divider when solana is the only social method enabled', async () => {
    renderWithProvider({
      ...TEST_CONFIG,
      googleClientId: undefined,
      appleClientId: undefined,
      features: {
        email: true,
        solana: true,
        webauthn: false,
      },
    });

    expect(await screen.findByRole('tab', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
  });
});
