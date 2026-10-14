import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { ErrorMessage } from '../shared/ErrorMessage';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { GoogleProviderIcon } from '../shared/providerIcons';
import { toError } from '../../utils/toError';
import { useTranslations } from '../../i18n';
import type { AuthResponse, MfaRequiredResponse } from '../../types';

export interface GoogleLoginButtonProps {
  onSuccess?: (response?: AuthResponse) => void | Promise<void>;
  onMfaRequired?: (response: MfaRequiredResponse) => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Access code forwarded to the server when this flow creates a new account. */
  accessCode?: string;
}

/**
 * Google OAuth login button
 */
export function GoogleLoginButton({
  onSuccess,
  onMfaRequired,
  onError,
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  accessCode,
}: GoogleLoginButtonProps) {
  const t = useTranslations();
  const { signIn, isLoading, isInitialized, error } = useGoogleAuth();

  const handleClick = async () => {
    try {
      const response = await signIn(accessCode);
      if ('mfaRequired' in response) onMfaRequired?.(response);
      else await onSuccess?.(response);
    } catch (err) {
      onError?.(toError(err, 'Unable to sign in with Google. Please try again.'));
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
        aria-label={t.buttons.continueWithGoogle}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <GoogleProviderIcon className="cedros-button-icon" />
        )}
        <span>{t.buttons.continueWithGoogle}</span>
      </button>
      {error && (!isInitialized || !onError) && <ErrorMessage error={error} />}
    </>
  );
}
