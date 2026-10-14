import { useState } from 'react';
import { useAppleAuth } from '../../hooks/useAppleAuth';
import { ErrorMessage } from '../shared/ErrorMessage';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { AppleProviderIcon } from '../shared/providerIcons';
import { isAppleDevice } from '../../utils/deviceDetection';
import { toError } from '../../utils/toError';
import { useTranslations } from '../../i18n';
import type { AuthResponse, MfaRequiredResponse } from '../../types';

export interface AppleLoginButtonProps {
  onSuccess?: (response?: AuthResponse) => void | Promise<void>;
  onMfaRequired?: (response: MfaRequiredResponse) => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /**
   * Hide the button on non-Apple devices (macOS, iOS, iPadOS).
   * When true, button only renders on Apple devices.
   * When false (default), button renders on every device.
   * @default false
   */
  hideOnNonApple?: boolean;
  /** Access code forwarded to the server when this flow creates a new account. */
  accessCode?: string;
}

/**
 * Apple Sign In button
 *
 * Requires `appleClientId` to be configured in CedrosLoginProvider.
 *
 * @example
 * ```tsx
 * <AppleLoginButton
 *   onSuccess={() => console.log('Logged in!')}
 *   onError={(err) => console.error(err)}
 * />
 * ```
 */
export function AppleLoginButton({
  onSuccess,
  onMfaRequired,
  onError,
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  hideOnNonApple = false,
  accessCode,
}: AppleLoginButtonProps) {
  const t = useTranslations();
  const { signIn, isLoading, isInitialized, error } = useAppleAuth();

  // Detect Apple device on initial render (lazy initializer avoids re-detection)
  const [isApple] = useState(() => isAppleDevice());

  // Hide button on non-Apple devices if hideOnNonApple is true
  if (hideOnNonApple && !isApple) {
    return null;
  }

  const handleClick = async () => {
    try {
      const response = await signIn(accessCode);
      if ('mfaRequired' in response) onMfaRequired?.(response);
      else await onSuccess?.(response);
    } catch (err) {
      onError?.(toError(err, 'Unable to sign in with Apple. Please try again.'));
    }
  };

  const sizeClasses = {
    sm: 'cedros-button-sm',
    md: 'cedros-button-md',
    lg: 'cedros-button-lg',
  };

  const variantClasses = {
    default: 'cedros-button-social',
    outline: 'cedros-button-social-outline',
  };

  return (
    <>
      <button
        type="button"
        className={`cedros-button ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        onClick={handleClick}
        disabled={disabled || !isInitialized || isLoading}
        aria-busy={isLoading}
        aria-label={t.buttons.continueWithApple}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <AppleProviderIcon className="cedros-button-icon" />
        )}
        <span>{t.buttons.continueWithApple}</span>
      </button>
      {error && (!isInitialized || !onError) && <ErrorMessage error={error} />}
    </>
  );
}
