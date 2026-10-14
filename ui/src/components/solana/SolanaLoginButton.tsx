import { useExternalEffect } from '../../hooks/effects';
import { useState, useCallback, useRef, type ComponentType, type ReactNode } from 'react';
import { useSolanaAuth, type UseSolanaAuthReturn } from '../../hooks/useSolanaAuth';
import { useDeviceAccountLink } from '../../context/DeviceAccountLinkContext';
import {
  getBrowserWallets,
  normalizeSignature,
  type BrowserWallet,
} from '../../utils/browserWalletAdapter';
import { registerMobileWallet } from '../../utils/mobileWalletAdapter';
import { isAndroidChrome } from '../../utils/walletDetection';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { SolanaIcon } from './SolanaIcon';
import { toError } from '../../utils/toError';
import { useTranslations } from '../../i18n';
import type { AuthResponse, LoginAttemptResponse, MfaRequiredResponse } from '../../types';

interface WalletLike {
  adapter: {
    name: string;
    icon: string;
    readyState: string;
  };
}

interface WalletAdapterState {
  publicKey: { toBase58: () => string } | null;
  signMessage: ((message: Uint8Array) => Promise<Uint8Array | { signature: Uint8Array }>) | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  wallet: { adapter: { name: string } } | null;
  wallets: WalletLike[];
  select: (walletName: string | null) => void;
}

interface WalletProviderProps {
  children?: ReactNode;
  wallets: [];
  localStorageKey: string;
}

interface WalletModalProviderProps {
  children?: ReactNode;
}

interface WalletAdapterRuntime {
  WalletProvider: ComponentType<WalletProviderProps>;
  WalletModalProvider: ComponentType<WalletModalProviderProps>;
  useWallet: () => WalletAdapterState;
  useWalletModal: () => { visible: boolean; setVisible: (visible: boolean) => void };
}

// Auto-register Mobile Wallet Adapter on Android Chrome only.
if (isAndroidChrome()) {
  void registerMobileWallet();
}

async function loadWalletAdapterRuntime(): Promise<WalletAdapterRuntime> {
  const reactSpecifier = '@solana/wallet-adapter-react';
  const modalSpecifier = '@solana/wallet-adapter-react-ui';
  const reactModule = await import(/* @vite-ignore */ reactSpecifier);
  const modalModule = await import(/* @vite-ignore */ modalSpecifier);

  return {
    WalletProvider: reactModule.WalletProvider,
    WalletModalProvider: modalModule.WalletModalProvider,
    useWallet: reactModule.useWallet,
    useWalletModal: modalModule.useWalletModal,
  };
}

export interface SolanaLoginButtonProps {
  onSuccess?: (response?: AuthResponse) => void | Promise<void>;
  onMfaRequired?: (response: MfaRequiredResponse) => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  hideIfNoWallet?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  accessCode?: string;
  walletContext?: Omit<WalletAdapterState, 'select'> & {
    select: (walletName: string) => void;
  };
}

const EMPTY_ADAPTERS: [] = [];
const WALLET_ERROR_FALLBACK = 'Unable to sign in with your wallet. Please try again.';

export function SolanaLoginButton(props: SolanaLoginButtonProps) {
  const [browserWallets, setBrowserWallets] = useState<BrowserWallet[]>(() => getBrowserWallets());
  const [runtime, setRuntime] = useState<WalletAdapterRuntime | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const shouldUseBrowserWallet = !props.walletContext && browserWallets.length > 0;

  useExternalEffect(() => {
    if (props.walletContext) return;

    const updateBrowserWallets = () => setBrowserWallets(getBrowserWallets());
    updateBrowserWallets();
    window.addEventListener('load', updateBrowserWallets);
    window.addEventListener('focus', updateBrowserWallets);

    return () => {
      window.removeEventListener('load', updateBrowserWallets);
      window.removeEventListener('focus', updateBrowserWallets);
    };
  }, [props.walletContext]);

  useExternalEffect(() => {
    if (shouldUseBrowserWallet) return;

    let cancelled = false;

    loadWalletAdapterRuntime()
      .then((loadedRuntime) => {
        if (!cancelled) {
          setRuntime(loadedRuntime);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shouldUseBrowserWallet]);

  if (shouldUseBrowserWallet) {
    return <BrowserSolanaLoginButton {...props} wallets={browserWallets} />;
  }

  if (!runtime) {
    if (loadFailed && props.hideIfNoWallet !== false) {
      return null;
    }

    return <DeferredSolanaButton {...props} isLoading={!loadFailed} />;
  }

  const { WalletProvider, WalletModalProvider } = runtime;

  if (props.walletContext) {
    return (
      <WalletModalProvider>
        <SolanaLoginInner runtime={runtime} {...props} />
      </WalletModalProvider>
    );
  }

  return (
    <WalletProvider wallets={EMPTY_ADAPTERS} localStorageKey="cedros-walletName">
      <WalletModalProvider>
        <SolanaLoginInner runtime={runtime} {...props} />
      </WalletModalProvider>
    </WalletProvider>
  );
}

function BrowserSolanaLoginButton({
  wallets,
  onSuccess,
  onMfaRequired,
  onError,
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  hideIfNoWallet = true,
  onLoadingChange,
  accessCode,
}: SolanaLoginButtonProps & { wallets: BrowserWallet[] }) {
  const t = useTranslations();
  const { requestChallenge, signIn, linkWallet, isLoading: isAuthLoading } = useSolanaAuth();
  const deviceAccountLink = useDeviceAccountLink();
  const [isConnecting, setIsConnecting] = useState(false);
  const selectedWallet = wallets[0] ?? null;
  const isLoading = isAuthLoading || isConnecting;

  useExternalEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const handleClick = async () => {
    if (disabled || isLoading || !selectedWallet) return;

    setIsConnecting(true);
    try {
      const response = await signInWithBrowserWallet(
        selectedWallet,
        { requestChallenge, signIn, linkWallet },
        deviceAccountLink,
        accessCode
      );
      if (response && 'mfaRequired' in response) onMfaRequired?.(response);
      else await onSuccess?.(response);
    } catch (err) {
      onError?.(toError(err, WALLET_ERROR_FALLBACK));
    } finally {
      setIsConnecting(false);
    }
  };

  if (!selectedWallet && hideIfNoWallet) return null;

  return (
    <SolanaButtonView
      className={className}
      variant={variant}
      size={size}
      disabled={disabled || isLoading || !selectedWallet}
      isLoading={isLoading}
      label={t.buttons.continueWithSolana}
      onClick={handleClick}
    />
  );
}

async function signInWithBrowserWallet(
  wallet: BrowserWallet,
  auth: Pick<UseSolanaAuthReturn, 'requestChallenge' | 'signIn' | 'linkWallet'>,
  deviceAccountLink: ReturnType<typeof useDeviceAccountLink>,
  accessCode?: string
): Promise<LoginAttemptResponse | undefined> {
  const { provider } = wallet;
  const connection = await provider.connect();
  const publicKey = connection?.publicKey ?? provider.publicKey;
  if (!publicKey) throw new Error('Wallet did not return a public key');

  const pubKeyString = publicKey.toBase58();
  const deviceDecision = await deviceAccountLink.requestDeviceAccountLink({
    identifier: pubKeyString,
    method: 'solana',
    linkExisting: async (_hint, signedInResponse) => {
      const challenge = await auth.requestChallenge(pubKeyString);
      const signatureBytes = normalizeSignature(
        await provider.signMessage(new TextEncoder().encode(challenge.message))
      );
      await auth.linkWallet(pubKeyString, encodeSignature(signatureBytes), challenge.message);
      return signedInResponse;
    },
  });
  if (deviceDecision.action === 'linked') return deviceDecision.response;

  const challenge = await auth.requestChallenge(pubKeyString);
  const messageBytes = new TextEncoder().encode(challenge.message);
  const signatureBytes = normalizeSignature(await provider.signMessage(messageBytes));
  const signature = encodeSignature(signatureBytes);

  return auth.signIn(pubKeyString, signature, challenge.message, accessCode);
}

function SolanaLoginInner({
  runtime,
  onSuccess,
  onMfaRequired,
  onError,
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  hideIfNoWallet = true,
  onLoadingChange,
  walletContext,
  accessCode,
}: SolanaLoginButtonProps & { runtime: WalletAdapterRuntime }) {
  const t = useTranslations();
  const { requestChallenge, signIn, linkWallet, isLoading: isAuthLoading } = useSolanaAuth();
  const deviceAccountLink = useDeviceAccountLink();
  const adapterWallet = runtime.useWallet();
  const { visible: modalVisible, setVisible: setModalVisible } = runtime.useWalletModal();
  const [pendingLogin, setPendingLogin] = useState(false);
  const isProcessingRef = useRef(false);
  const modalWasOpen = useRef(false);
  const connectWhenWalletReadyRef = useRef(false);
  const signRejectedRef = useRef(false);

  const connected = walletContext?.connected ?? adapterWallet.connected;
  const connecting = walletContext?.connecting ?? adapterWallet.connecting;
  const publicKey = walletContext?.publicKey ?? adapterWallet.publicKey;
  const signMessage = walletContext?.signMessage ?? adapterWallet.signMessage;
  const wallet = walletContext?.wallet ?? adapterWallet.wallet;
  const wallets = walletContext?.wallets ?? adapterWallet.wallets;
  const select = walletContext
    ? walletContext.select
    : (name: string) => adapterWallet.select(name as never);
  const connect = walletContext?.connect ?? adapterWallet.connect;

  const installedWallets = wallets.filter(
    (w) => w.adapter.readyState === 'Installed' || w.adapter.readyState === 'Loadable'
  );

  const executeSignIn = useCallback(async () => {
    if (isProcessingRef.current) return;
    if (!publicKey || !signMessage) {
      onError?.(new Error('Wallet not ready'));
      return;
    }

    isProcessingRef.current = true;
    try {
      const pubKeyString = publicKey.toBase58();
      const deviceDecision = await deviceAccountLink.requestDeviceAccountLink({
        identifier: pubKeyString,
        method: 'solana',
        linkExisting: async (_hint, signedInResponse) => {
          const challenge = await requestChallenge(pubKeyString);
          const messageBytes = new TextEncoder().encode(challenge.message);
          const signatureBytes = normalizeSignature(await signMessage(messageBytes));
          await linkWallet(pubKeyString, encodeSignature(signatureBytes), challenge.message);
          return signedInResponse;
        },
      });
      if (deviceDecision.action === 'linked') {
        signRejectedRef.current = false;
        await onSuccess?.(deviceDecision.response);
        return;
      }

      const challenge = await requestChallenge(pubKeyString);
      const messageBytes = new TextEncoder().encode(challenge.message);
      const signatureBytes = normalizeSignature(await signMessage(messageBytes));
      const signature = encodeSignature(signatureBytes);

      const response = await signIn(pubKeyString, signature, challenge.message, accessCode);
      signRejectedRef.current = false;
      if ('mfaRequired' in response) onMfaRequired?.(response);
      else await onSuccess?.(response);
    } catch (err) {
      const error = toError(err, WALLET_ERROR_FALLBACK);
      signRejectedRef.current = true;
      onError?.(error);
    } finally {
      isProcessingRef.current = false;
      setPendingLogin(false);
    }
  }, [
    publicKey,
    signMessage,
    requestChallenge,
    signIn,
    linkWallet,
    deviceAccountLink,
    onSuccess,
    onMfaRequired,
    onError,
    accessCode,
  ]);

  const connectSelectedWallet = useCallback(() => {
    connectWhenWalletReadyRef.current = false;
    connect().catch((err: unknown) => {
      onError?.(toError(err, WALLET_ERROR_FALLBACK));
      setPendingLogin(false);
    });
  }, [connect, onError]);

  useExternalEffect(() => {
    if (connectWhenWalletReadyRef.current && wallet && !connected && !connecting) {
      connectSelectedWallet();
    }
  }, [wallet, connected, connecting, connectSelectedWallet]);

  useExternalEffect(() => {
    if (pendingLogin && connected && publicKey && signMessage && !isProcessingRef.current) {
      executeSignIn().catch(() => {
        /* Errors already surfaced via onError */
      });
    }
  }, [pendingLogin, connected, publicKey, signMessage, executeSignIn]);

  useExternalEffect(() => {
    if (modalVisible) {
      modalWasOpen.current = true;
    } else if (modalWasOpen.current) {
      modalWasOpen.current = false;
      if (pendingLogin && !connected && wallet && !connecting) {
        connectSelectedWallet();
      } else if (pendingLogin && !connected) {
        connectWhenWalletReadyRef.current = false;
        setPendingLogin(false);
      }
    }
  }, [modalVisible, pendingLogin, connected, wallet, connecting, connectSelectedWallet]);

  const handleClick = async () => {
    if (disabled || isAuthLoading || connecting) return;

    if (connected && publicKey && signMessage && !signRejectedRef.current) {
      setPendingLogin(true);
      await executeSignIn();
    } else if (installedWallets.length === 1 && !wallet) {
      select(installedWallets[0].adapter.name);
      setPendingLogin(true);
      connectWhenWalletReadyRef.current = true;
    } else {
      signRejectedRef.current = false;
      if (wallet) {
        adapterWallet.select(null as never);
      }
      connectWhenWalletReadyRef.current = false;
      setModalVisible(true);
      setPendingLogin(true);
    }
  };

  const isLoading = isAuthLoading || connecting || (pendingLogin && !connected);

  useExternalEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  if (hideIfNoWallet && installedWallets.length === 0) {
    return null;
  }

  return (
    <SolanaButtonView
      className={className}
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      isLoading={isLoading}
      label={t.buttons.continueWithSolana}
      onClick={handleClick}
    />
  );
}

function DeferredSolanaButton({
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  isLoading = true,
}: Pick<SolanaLoginButtonProps, 'className' | 'variant' | 'size' | 'disabled'> & {
  isLoading?: boolean;
}) {
  const t = useTranslations();
  return (
    <SolanaButtonView
      className={className}
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      isLoading={isLoading}
      label={t.buttons.continueWithSolana}
    />
  );
}

function SolanaButtonView({
  className,
  variant,
  size,
  disabled,
  isLoading,
  label,
  onClick,
}: {
  className: string;
  variant: NonNullable<SolanaLoginButtonProps['variant']>;
  size: NonNullable<SolanaLoginButtonProps['size']>;
  disabled: boolean;
  isLoading: boolean;
  label: string;
  onClick?: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      className={`cedros-button ${variantClass(variant)} ${sizeClass(size)} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : <SolanaIcon />}
      <span>{label}</span>
    </button>
  );
}

function encodeSignature(signatureBytes: Uint8Array): string {
  if (signatureBytes.length === 0) throw new Error('Wallet returned invalid signature');

  try {
    return btoa(String.fromCharCode(...signatureBytes));
  } catch {
    throw new Error('Failed to encode signature');
  }
}

function sizeClass(size: NonNullable<SolanaLoginButtonProps['size']>): string {
  return {
    sm: 'cedros-button-sm',
    md: 'cedros-button-md',
    lg: 'cedros-button-lg',
  }[size];
}

function variantClass(variant: NonNullable<SolanaLoginButtonProps['variant']>): string {
  return {
    default: 'cedros-button-social',
    outline: 'cedros-button-social-outline',
  }[variant];
}
