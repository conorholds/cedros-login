/**
 * Passkey prompt component for WebAuthn interactions
 *
 * Provides visual feedback during WebAuthn ceremonies:
 * - Registration of new passkeys
 * - Authentication with existing passkeys
 * - PRF extension operations
 */

import { useCallback } from 'react';
import { PasskeyProviderIcon } from '../shared/providerIcons';

export interface PasskeyPromptProps {
  /** Type of WebAuthn operation */
  mode: 'register' | 'authenticate';
  /** Whether the operation is in progress */
  isLoading?: boolean;
  /** Error message if operation failed */
  error?: string;
  /** Callback to trigger the operation */
  onPrompt?: () => void;
  /** Callback to retry after error */
  onRetry?: () => void;
  /** Callback to cancel the operation */
  onCancel?: () => void;
  /** Optional custom title */
  title?: string;
  /** Optional custom description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * WebAuthn passkey interaction prompt
 *
 * Displays appropriate UI and messaging for passkey operations.
 */
export function PasskeyPrompt({
  mode,
  isLoading = false,
  error,
  onPrompt,
  onRetry,
  onCancel,
  title,
  description,
  className = '',
}: PasskeyPromptProps) {
  const handlePrompt = useCallback(() => {
    if (!isLoading) {
      onPrompt?.();
    }
  }, [isLoading, onPrompt]);

  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  const defaultTitle = mode === 'register' ? 'Set Up Passkey' : 'Verify with Passkey';

  const defaultDescription =
    mode === 'register'
      ? 'Create a passkey to securely encrypt your wallet on this device. You will use your fingerprint, face, or device PIN.'
      : 'Use your passkey to unlock your wallet. You will be prompted for biometric verification.';

  return (
    <div className={`cedros-passkey-prompt ${className}`}>
      <div className="cedros-passkey-icon">
        {isLoading ? <LoadingSpinner /> : error ? <ErrorIcon /> : <PasskeyProviderIcon />}
      </div>

      <h3 className="cedros-passkey-title">{title ?? defaultTitle}</h3>

      <p className="cedros-passkey-description">{description ?? defaultDescription}</p>

      {error && (
        <div className="cedros-passkey-error" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="cedros-passkey-actions">
        {error ? (
          <>
            {onRetry && (
              <button
                type="button"
                className="cedros-button cedros-button-primary"
                onClick={handleRetry}
              >
                Try Again
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                className="cedros-button cedros-button-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              className="cedros-button cedros-button-primary"
              onClick={handlePrompt}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="cedros-button-spinner" aria-hidden="true" />
                  Waiting for passkey...
                </>
              ) : mode === 'register' ? (
                'Create Passkey'
              ) : (
                'Use Passkey'
              )}
            </button>
            {onCancel && !isLoading && (
              <button
                type="button"
                className="cedros-button cedros-button-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </>
        )}
      </div>

      {isLoading && (
        <p className="cedros-passkey-hint">
          Follow the prompts on your device to {mode === 'register' ? 'create' : 'verify'} your
          passkey.
        </p>
      )}
    </div>
  );
}

/** Loading spinner icon */
function LoadingSpinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="cedros-spinner">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Error icon */
function ErrorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}
