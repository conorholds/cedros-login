/**
 * Component tests for LoginForm
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { LoginForm } from './LoginForm';
import { CedrosLoginProvider } from '../context/CedrosLoginProvider';
import type { CedrosLoginConfig } from '../types';
import { detectSolanaWallets } from '../utils/walletDetection';
import { server } from '../test/mocks/server';

vi.mock('../utils/walletDetection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/walletDetection')>();
  return {
    ...actual,
    detectSolanaWallets: vi.fn(() => true),
  };
});

// Mock wallet adapter so SolanaLoginButton renders without real browser wallets
vi.mock('@solana/wallet-adapter-react', () => ({
  WalletProvider: ({ children }: { children: React.ReactNode }) => children,
  useWallet: () => ({
    wallets: [
      {
        adapter: { name: 'Phantom', icon: 'data:image/svg+xml,<svg/>', readyState: 'Installed' },
        readyState: 'Installed',
      },
    ],
    wallet: null,
    publicKey: null,
    connected: false,
    connecting: false,
    connect: vi.fn(),
    select: vi.fn(),
    disconnect: vi.fn(),
    disconnecting: false,
    autoConnect: false,
    sendTransaction: vi.fn(),
    signMessage: undefined,
    signTransaction: undefined,
    signAllTransactions: undefined,
    signIn: undefined,
  }),
}));

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  WalletModalProvider: ({ children }: { children: React.ReactNode }) => children,
  useWalletModal: () => ({ visible: false, setVisible: vi.fn() }),
}));

const TEST_CONFIG: CedrosLoginConfig = {
  serverUrl: 'http://localhost:8080',
  requestTimeout: 5000,
  retryAttempts: 0,
};

function renderWithProvider(props: React.ComponentProps<typeof LoginForm> = {}) {
  return render(
    <CedrosLoginProvider config={TEST_CONFIG}>
      <LoginForm {...props} />
    </CedrosLoginProvider>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.use(
      http.get('http://localhost:8080/user', () => new HttpResponse(null, { status: 401 }))
    );
  });

  it('re-checks wallet detection after window load', async () => {
    const detectMock = vi.mocked(detectSolanaWallets);
    // Initially no wallets detected (LoginForm controls visibility)
    detectMock.mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValue(true);

    renderWithProvider();

    expect(screen.queryByText('Continue with Solana')).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('load'));
    });

    expect(detectMock.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(await screen.findByText('Continue with Solana')).toBeInTheDocument();
  });

  it('shows Google when server feature discovery returns a client ID', async () => {
    vi.mocked(detectSolanaWallets).mockReturnValue(false);
    server.use(
      http.get('http://localhost:8080/features', () =>
        HttpResponse.json({
          email: true,
          google: true,
          apple: false,
          solana: false,
          webauthn: false,
          instantLink: false,
          googleClientId: 'server-google.apps.googleusercontent.com',
        })
      )
    );

    renderWithProvider();

    expect(await screen.findByText('Continue with Google')).toBeInTheDocument();
  });

  it('renders the passkey button when server social order uses the passkey alias', async () => {
    vi.mocked(detectSolanaWallets).mockReturnValue(false);
    server.use(
      http.get('http://localhost:8080/features', () =>
        HttpResponse.json({
          email: true,
          google: false,
          apple: false,
          solana: false,
          webauthn: true,
          instantLink: false,
          socialButtonOrder: ['passkey'],
        })
      )
    );

    renderWithProvider();

    expect(await screen.findByText('Continue with passkey')).toBeInTheDocument();
    expect(screen.getByText('Or continue with')).toBeInTheDocument();
  });

  it('shows a useful resting state when the site has no usable sign-in method', async () => {
    vi.mocked(detectSolanaWallets).mockReturnValue(false);
    server.use(
      http.get('http://localhost:8080/features', () =>
        HttpResponse.json({
          email: false,
          google: false,
          apple: false,
          solana: false,
          webauthn: false,
          instantLink: false,
        })
      )
    );

    renderWithProvider();

    expect(await screen.findByRole('heading', { name: 'Sign-in is not available' })).toBeVisible();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('asks for a signup access code only after the user chooses to create an account', async () => {
    const user = userEvent.setup();
    vi.mocked(detectSolanaWallets).mockReturnValue(false);
    server.use(
      http.get('http://localhost:8080/features', () =>
        HttpResponse.json({
          email: true,
          google: false,
          apple: false,
          solana: false,
          webauthn: false,
          instantLink: false,
          signupAccessCodeRequired: true,
        })
      )
    );

    renderWithProvider();

    expect(await screen.findByRole('tab', { name: 'Sign in' })).toBeVisible();
    expect(screen.queryByLabelText('Access Code')).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Sign up' }));
    expect(await screen.findByLabelText('Access Code')).toBeVisible();
  });

  it('shows opt-in signup availability only on the registration tab', async () => {
    const user = userEvent.setup();
    vi.mocked(detectSolanaWallets).mockReturnValue(false);
    server.use(
      http.get('http://localhost:8080/features', () =>
        HttpResponse.json({
          email: true,
          google: false,
          apple: false,
          solana: false,
          webauthn: false,
          instantLink: false,
          signupAvailability: {
            remaining: 12,
            limit: 100,
            period: 'monthly',
            resetsAt: '2099-10-01T00:00:00Z',
          },
        })
      )
    );

    renderWithProvider();

    const signupTab = await screen.findByRole('tab', { name: 'Sign up' });
    expect(screen.queryByTestId('signup-availability')).not.toBeInTheDocument();
    await user.click(signupTab);
    expect(screen.getByTestId('signup-availability')).toHaveTextContent(
      '12 of 100 signup spots available this month.'
    );
    await user.click(screen.getByRole('tab', { name: 'Sign in' }));
    expect(screen.queryByTestId('signup-availability')).not.toBeInTheDocument();
  });

  it('renders a localized reset time when the signup period is full', async () => {
    const user = userEvent.setup();
    vi.mocked(detectSolanaWallets).mockReturnValue(false);
    server.use(
      http.get('http://localhost:8080/features', () =>
        HttpResponse.json({
          email: true,
          google: false,
          apple: false,
          solana: false,
          webauthn: false,
          instantLink: false,
          signupAccessCodeRequired: true,
          signupAvailability: {
            remaining: 0,
            limit: 100,
            period: 'monthly',
            resetsAt: '2099-10-01T00:00:00Z',
          },
        })
      )
    );

    renderWithProvider({ defaultTab: 'register' });

    const notice = await screen.findByTestId('signup-availability');
    expect(notice).toHaveAttribute('data-full', 'true');
    expect(notice).toHaveTextContent('Registration is currently full. New spots open');
    expect(notice).not.toHaveTextContent('Availability is confirmed');
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Access Code')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create account' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeVisible());
    expect(screen.queryByTestId('signup-availability')).not.toBeInTheDocument();
  });

  it('hides signup availability after account creation and restores it on a fresh signup', async () => {
    const user = userEvent.setup();
    vi.mocked(detectSolanaWallets).mockReturnValue(false);
    server.use(
      http.post('http://localhost:8080/register', () =>
        HttpResponse.json({
          user: { id: 'new-user', email: 'new@example.com', emailVerified: false },
          inviteCodeRequired: true,
          pendingInviteToken: 'pending-token',
          isNewUser: true,
          method: 'email',
        })
      ),
      http.post('http://localhost:8080/invite-codes/redeem', () =>
        HttpResponse.json({
          user: { id: 'new-user', email: 'new@example.com', emailVerified: false },
          emailQueued: true,
          isNewUser: true,
          method: 'email',
        })
      )
    );
    const availability = {
      remaining: 1,
      limit: 1,
      period: 'daily' as const,
      resetsAt: '2099-10-01T00:00:00Z',
    };
    const config: CedrosLoginConfig = {
      ...TEST_CONFIG,
      features: { email: true, google: false, apple: false, solana: false, webauthn: false },
      signupAvailability: availability,
    };
    const view = render(
      <CedrosLoginProvider config={config}>
        <LoginForm defaultTab="register" />
      </CedrosLoginProvider>
    );

    expect(await screen.findByTestId('signup-availability')).toHaveTextContent('1 of 1');
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'ValidPassphrase1!');
    await user.type(screen.getByLabelText('Confirm Password'), 'ValidPassphrase1!');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Invite code required')).toBeInTheDocument();
    expect(screen.queryByTestId('signup-availability')).not.toBeInTheDocument();

    view.rerender(
      <CedrosLoginProvider
        config={{
          ...config,
          signupAvailability: { ...availability, remaining: 0 },
        }}
      >
        <LoginForm defaultTab="register" />
      </CedrosLoginProvider>
    );
    expect(screen.queryByTestId('signup-availability')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Invite code'), 'WELCOME');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('You’re in!')).toBeInTheDocument();
    expect(screen.queryByTestId('signup-availability')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Check your email')).toBeInTheDocument();
    expect(screen.queryByTestId('signup-availability')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to login' }));
    await user.click(screen.getByRole('tab', { name: 'Sign up' }));
    expect(screen.getByTestId('signup-availability')).toHaveAttribute('data-full', 'true');
  });

  it('shows the restored signed-in session instead of login methods', async () => {
    vi.mocked(detectSolanaWallets).mockReturnValue(false);
    server.use(
      http.get('http://localhost:8080/user', () =>
        HttpResponse.json({
          user: {
            id: 'user-1',
            email: 'owner@example.com',
            name: 'Site Owner',
            authMethods: ['email'],
            emailVerified: true,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        })
      )
    );

    renderWithProvider();

    expect(await screen.findByText("You're signed in")).toBeInTheDocument();
    expect(screen.getByText('Continue as', { exact: false })).toHaveTextContent(
      'Continue as owner@example.com'
    );
    expect(screen.getByRole('link', { name: 'Manage account' })).toHaveAttribute(
      'href',
      '/profile'
    );
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
    expect(screen.queryByText('Continue with passkey')).not.toBeInTheDocument();
  });
});
