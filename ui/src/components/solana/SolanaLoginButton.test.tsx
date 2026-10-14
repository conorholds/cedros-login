import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SolanaLoginButton } from './SolanaLoginButton';

type WalletContext = NonNullable<React.ComponentProps<typeof SolanaLoginButton>['walletContext']>;

const solanaAuthMocks = vi.hoisted(() => ({
  requestChallenge: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock('../../utils/walletDetection', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils/walletDetection')>()),
  isAndroidChrome: () => false,
}));

vi.mock('../../utils/mobileWalletAdapter', () => ({
  registerMobileWallet: vi.fn(),
}));

vi.mock('../../hooks/useSolanaAuth', () => ({
  useSolanaAuth: () => ({
    requestChallenge: solanaAuthMocks.requestChallenge,
    signIn: solanaAuthMocks.signIn,
    isLoading: false,
  }),
}));

vi.mock('@solana/wallet-adapter-react', () => ({
  WalletProvider: ({ children }: { children: React.ReactNode }) => children,
  useWallet: () => ({
    wallets: [],
    wallet: null,
    publicKey: null,
    connected: false,
    connecting: false,
    connect: vi.fn(),
    select: vi.fn(),
    signMessage: null,
  }),
}));

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  WalletModalProvider: ({ children }: { children: React.ReactNode }) => children,
  useWalletModal: () => ({ visible: false, setVisible: vi.fn() }),
}));

const installedWallet = {
  adapter: {
    name: 'Phantom',
    icon: 'data:image/svg+xml,<svg/>',
    readyState: 'Installed',
  },
};

const publicKey = { toBase58: () => '11111111111111111111111111111111' };

function makeWalletContext(overrides: Partial<WalletContext> = {}): WalletContext {
  return {
    publicKey: null,
    signMessage: null,
    connected: false,
    connecting: false,
    connect: vi.fn().mockResolvedValue(undefined),
    wallet: null,
    wallets: [installedWallet],
    select: vi.fn(),
    ...overrides,
  };
}

describe('SolanaLoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as Record<string, unknown>).phantom;
    solanaAuthMocks.requestChallenge.mockResolvedValue({ message: 'Sign this message' });
    solanaAuthMocks.signIn.mockResolvedValue({});
  });

  it('uses an injected browser wallet when wallet-adapter has no installed wallets', async () => {
    const connect = vi.fn().mockResolvedValue({ publicKey });
    const signMessage = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
    (window as unknown as Record<string, unknown>).phantom = {
      solana: { connect, signMessage },
    };

    const onSuccess = vi.fn();
    render(<SolanaLoginButton onSuccess={onSuccess} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Continue with Solana' }));

    await waitFor(() => expect(solanaAuthMocks.signIn).toHaveBeenCalled());
    expect(connect).toHaveBeenCalledTimes(1);
    expect(solanaAuthMocks.requestChallenge).toHaveBeenCalledWith(publicKey.toBase58());
    expect(signMessage).toHaveBeenCalledWith(new TextEncoder().encode('Sign this message'));
    expect(solanaAuthMocks.signIn).toHaveBeenCalledWith(
      publicKey.toBase58(),
      'AQID',
      'Sign this message',
      undefined
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('surfaces object auth failures as readable errors', async () => {
    const connect = vi.fn().mockResolvedValue({ publicKey });
    const signMessage = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
    solanaAuthMocks.signIn.mockRejectedValue({
      code: 'SERVER_ERROR',
      message: 'Unable to sign in with your wallet. Please try again.',
    });
    (window as unknown as Record<string, unknown>).phantom = {
      solana: { connect, signMessage },
    };

    const onError = vi.fn();
    render(<SolanaLoginButton onError={onError} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Continue with Solana' }));

    await waitFor(() => expect(onError).toHaveBeenCalled());
    const error = onError.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Unable to sign in with your wallet. Please try again.');
  });

  it('connects a selected wallet once the adapter exposes it', async () => {
    const connect = vi.fn().mockResolvedValue(undefined);
    const select = vi.fn();
    const initialContext = makeWalletContext({ connect, select });

    const { rerender } = render(<SolanaLoginButton walletContext={initialContext} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue with Solana' })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Solana' }));

    expect(select).toHaveBeenCalledWith('Phantom');
    expect(connect).not.toHaveBeenCalled();

    rerender(
      <SolanaLoginButton
        walletContext={makeWalletContext({
          connect,
          select,
          wallet: { adapter: { name: 'Phantom' } },
        })}
      />
    );

    await waitFor(() => {
      expect(connect).toHaveBeenCalledTimes(1);
    });
  });
});
