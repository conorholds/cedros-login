import { useCallback, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { GoogleLoginButton } from '../components/google/GoogleLoginButton';
import { AppleLoginButton } from '../components/apple/AppleLoginButton';
import { SolanaLoginButton } from '../components/solana/LazySolanaLoginButton';
import { PasskeyLoginButton } from '../components/webauthn/PasskeyLoginButton';
import { PasswordInput } from '../components/email/PasswordInput';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { TotpVerify } from '../components/totp/TotpVerify';
import { useEmailAuth } from '../hooks/useEmailAuth';
import { toError } from '../utils/toError';
import {
  clearDeviceAccountHint,
  detectDeviceAccountPrompt,
  dismissDeviceAccountPair,
  type DeviceAccountHint,
  type DeviceAccountHintMethod,
} from '../utils/deviceAccountHint';
import {
  DeviceAccountLinkContext,
  type DeviceAccountLinkRequest,
  type DeviceAccountLinkResult,
  type DeviceSignupMethod,
} from './DeviceAccountLinkContext';
import type { AuthError, AuthResponse } from '../types';

interface DeviceAccountLinkProviderProps {
  children: ReactNode;
}

interface PendingPrompt {
  request: DeviceAccountLinkRequest;
  hint: DeviceAccountHint;
  idHash: string;
  newLabel: string;
  resolve: (result: DeviceAccountLinkResult) => void;
}

type PromptPhase = 'choice' | 'signin';

export function DeviceAccountLinkProvider({ children }: DeviceAccountLinkProviderProps) {
  const [pending, setPending] = useState<PendingPrompt | null>(null);
  const [phase, setPhase] = useState<PromptPhase>('choice');
  const [error, setError] = useState<AuthError | string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const resolverRef = useRef<((result: DeviceAccountLinkResult) => void) | null>(null);

  const requestDeviceAccountLink = useCallback(
    async (request: DeviceAccountLinkRequest): Promise<DeviceAccountLinkResult> => {
      const detectionMethod = toDetectionMethod(request.method);
      const detection = await detectDeviceAccountPrompt(request.identifier, detectionMethod);
      if (!detection) return { action: 'create' };

      resolverRef.current?.({ action: 'create' });
      return new Promise<DeviceAccountLinkResult>((resolve) => {
        resolverRef.current = resolve;
        setError(null);
        setPhase('choice');
        setPending({
          request,
          hint: detection.hint,
          idHash: detection.idHash,
          newLabel: detection.label,
          resolve,
        });
      });
    },
    []
  );

  const settle = useCallback((result: DeviceAccountLinkResult) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setPending(null);
    setPhase('choice');
    setError(null);
    setIsLinking(false);
  }, []);

  const createSeparate = useCallback(() => {
    if (!pending) return;
    dismissDeviceAccountPair(pending.idHash);
    settle({ action: 'create' });
  }, [pending, settle]);

  const notMe = useCallback(() => {
    clearDeviceAccountHint();
    settle({ action: 'create' });
  }, [settle]);

  const completeLink = useCallback(
    async (response?: AuthResponse) => {
      if (!pending) return;
      setIsLinking(true);
      setError(null);
      try {
        const linkedResponse = await pending.request.linkExisting(pending.hint, response);
        settle({ action: 'linked', response: linkedResponse ?? response });
      } catch (err) {
        setError(toError(err, 'Unable to link this sign-in method. Please try again.').message);
        setIsLinking(false);
      }
    },
    [pending, settle]
  );

  return (
    <DeviceAccountLinkContext.Provider value={{ requestDeviceAccountLink }}>
      {children}
      {pending && (
        <DeviceAccountLinkDialog
          pending={pending}
          phase={phase}
          error={error}
          isLinking={isLinking}
          onChooseLink={() => setPhase('signin')}
          onCreateSeparate={createSeparate}
          onNotMe={notMe}
          onCancel={() => settle({ action: 'create' })}
          onSignedIn={completeLink}
        />
      )}
    </DeviceAccountLinkContext.Provider>
  );
}

function DeviceAccountLinkDialog({
  pending,
  phase,
  error,
  isLinking,
  onChooseLink,
  onCreateSeparate,
  onNotMe,
  onCancel,
  onSignedIn,
}: {
  pending: PendingPrompt;
  phase: PromptPhase;
  error: AuthError | string | null;
  isLinking: boolean;
  onChooseLink: () => void;
  onCreateSeparate: () => void;
  onNotMe: () => void;
  onCancel: () => void;
  onSignedIn: (response?: AuthResponse) => Promise<void>;
}) {
  const description = `You've signed in here before as ${pending.hint.label} (with ${methodLabel(
    pending.hint.method
  )}). Link this new sign-in method to that account, or create a separate one?`;

  return (
    <div className="cedros-modal-backdrop" role="presentation">
      <div
        className="cedros-device-link-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cedros-device-link-title"
        aria-describedby="cedros-device-link-description"
      >
        <h2 id="cedros-device-link-title" className="cedros-device-link-dialog__title">
          {phase === 'choice' ? 'Account found on this device' : 'Sign in to link'}
        </h2>
        <p id="cedros-device-link-description" className="cedros-device-link-dialog__description">
          {phase === 'choice'
            ? description
            : `Use ${methodLabel(pending.hint.method)} to continue as ${pending.hint.label}.`}
        </p>
        {phase === 'choice' ? (
          <div className="cedros-device-link-dialog__actions">
            <button
              type="button"
              className="cedros-button cedros-button-primary cedros-button-md"
              onClick={onChooseLink}
            >
              Link to my existing account
            </button>
            <button
              type="button"
              className="cedros-button cedros-button-outline cedros-button-md"
              onClick={onCreateSeparate}
            >
              Create a separate account
            </button>
            <button
              type="button"
              className="cedros-button cedros-button-ghost cedros-button-md"
              onClick={onNotMe}
            >
              That's not me
            </button>
          </div>
        ) : (
          <div className="cedros-device-link-dialog__signin">
            <ScopedSignIn
              method={pending.hint.method}
              disabled={isLinking}
              onSignedIn={onSignedIn}
            />
            {isLinking && (
              <div className="cedros-device-link-dialog__status" role="status">
                <LoadingSpinner size="sm" />
                <span>Linking {methodLabel(pending.request.method)}...</span>
              </div>
            )}
            <ErrorMessage error={error} />
            <div className="cedros-device-link-dialog__secondary-actions">
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-sm"
                onClick={onCancel}
                disabled={isLinking}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScopedSignIn({
  method,
  disabled,
  onSignedIn,
}: {
  method: DeviceAccountHintMethod;
  disabled: boolean;
  onSignedIn: (response?: AuthResponse) => Promise<void>;
}) {
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  if (mfaToken) {
    return (
      <TotpVerify mfaToken={mfaToken} onSuccess={onSignedIn} onBack={() => setMfaToken(null)} />
    );
  }
  const mfaProps = {
    onMfaRequired: (response: { mfaToken: string }) => setMfaToken(response.mfaToken),
  };
  if (method === 'google') {
    return <GoogleLoginButton disabled={disabled} onSuccess={onSignedIn} {...mfaProps} />;
  }
  if (method === 'apple') {
    return (
      <AppleLoginButton
        disabled={disabled}
        hideOnNonApple={false}
        onSuccess={onSignedIn}
        {...mfaProps}
      />
    );
  }
  if (method === 'solana') {
    return (
      <SolanaLoginButton
        disabled={disabled}
        hideIfNoWallet={false}
        onSuccess={onSignedIn}
        {...mfaProps}
      />
    );
  }
  if (method === 'webauthn') {
    return <PasskeyLoginButton disabled={disabled} onSuccess={onSignedIn} {...mfaProps} />;
  }
  return (
    <EmailLinkSignIn disabled={disabled} onSignedIn={onSignedIn} onMfaRequired={setMfaToken} />
  );
}

function EmailLinkSignIn({
  disabled,
  onSignedIn,
  onMfaRequired,
}: {
  disabled: boolean;
  onSignedIn: (response?: AuthResponse) => Promise<void>;
  onMfaRequired: (token: string) => void;
}) {
  const { login, isLoading, error, clearError } = useEmailAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    try {
      const result = await login(email, password);
      if (result.mfaRequired) {
        onMfaRequired(result.mfaToken);
        return;
      }
      if ('inviteCodeRequired' in result) {
        setLocalError('Enter your invite code to finish signing in before linking this method.');
        return;
      }
      await onSignedIn(result.response);
    } catch (err) {
      setLocalError(toError(err, 'Unable to sign in. Please try again.').message);
    }
  };

  return (
    <form className="cedros-device-link-dialog__email-form" onSubmit={(e) => void submit(e)}>
      <div className="cedros-form-field">
        <label htmlFor="device-link-email" className="cedros-label">
          Email
        </label>
        <input
          id="device-link-email"
          type="email"
          className="cedros-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={disabled || isLoading}
          required
        />
      </div>
      <div className="cedros-form-field">
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={disabled || isLoading}
          autoComplete="current-password"
          required
        />
      </div>
      <ErrorMessage
        error={localError || error}
        onDismiss={() => {
          setLocalError(null);
          clearError();
        }}
      />
      <button
        type="submit"
        className="cedros-button cedros-button-primary cedros-button-md"
        disabled={disabled || isLoading || !email || !password}
      >
        {isLoading ? <LoadingSpinner size="sm" /> : 'Sign in'}
      </button>
    </form>
  );
}

function toDetectionMethod(method: DeviceSignupMethod): DeviceAccountHintMethod {
  return method === 'instantLink' ? 'email' : method;
}

function methodLabel(method: DeviceSignupMethod): string {
  switch (method) {
    case 'google':
      return 'Google';
    case 'apple':
      return 'Apple';
    case 'solana':
      return 'Solana';
    case 'webauthn':
      return 'passkey';
    case 'instantLink':
      return 'instant link';
    default:
      return 'email';
  }
}
