import type { ReactNode } from 'react';
import { useWebAuthn } from '../../hooks/useWebAuthn';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { PasskeyProviderIcon } from '../shared/providerIcons';
import { toError } from '../../utils/toError';
import { useTranslations } from '../../i18n';
import type { AuthResponse, MfaRequiredResponse } from '../../types';

export interface PasskeyLoginButtonProps {
  onSuccess?: (response?: AuthResponse) => void | Promise<void>;
  onMfaRequired?: (response: MfaRequiredResponse) => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  /** Access code forwarded to the server when this flow creates a new account. */
  accessCode?: string;
  /** Explicit intent; sign-in never falls back to account creation. */
  mode?: 'login' | 'register';
}

export function PasskeyLoginButton({
  onSuccess,
  onMfaRequired,
  onError,
  className = '',
  children,
  disabled,
  accessCode,
  mode = 'login',
}: PasskeyLoginButtonProps) {
  const t = useTranslations();
  const { continueWithPasskey, signupWithPasskey, isLoading, isSupported } = useWebAuthn();

  const isDisabled = disabled || !isSupported || isLoading;
  const defaultLabel =
    mode === 'register' ? t.buttons.createPasskeyAccount : t.buttons.continueWithPasskey;

  return (
    <button
      type="button"
      className={`cedros-button cedros-button-social ${className}`}
      onClick={async () => {
        try {
          const response =
            mode === 'register'
              ? await signupWithPasskey({ accessCode })
              : await continueWithPasskey();
          if ('mfaRequired' in response) onMfaRequired?.(response);
          else await onSuccess?.(response);
        } catch (err) {
          onError?.(toError(err, 'Unable to sign in with passkey. Please try again.'));
        }
      }}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      title={!isSupported ? t.auth.passkeysUnavailable : undefined}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <span className="cedros-social-icon" aria-hidden="true">
          <PasskeyProviderIcon />
        </span>
      )}
      <span>{children ?? defaultLabel}</span>
    </button>
  );
}
