import { useExternalEffect } from '../../hooks/effects';
import { memo, useRef } from 'react';
import type { DisplayError } from '../../types';

export interface ErrorMessageProps {
  error: DisplayError;
  className?: string;
  onDismiss?: () => void;
  /** If true, focus the error message when it appears (for accessibility) */
  autoFocus?: boolean;
}

/**
 * Error message display component with accessibility support.
 * Announces errors to screen readers and optionally focuses the message.
 * Wrapped with React.memo to prevent unnecessary re-renders.
 */
export const ErrorMessage = memo(function ErrorMessage({
  error,
  className = '',
  onDismiss,
  autoFocus = false,
}: ErrorMessageProps) {
  const errorRef = useRef<HTMLDivElement>(null);

  // Focus the error message when it appears (for accessibility)
  useExternalEffect(() => {
    if (error && autoFocus && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error, autoFocus]);

  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;

  return (
    <div
      ref={errorRef}
      className={`cedros-error ${className}`}
      role="alert"
      aria-live="assertive"
      tabIndex={autoFocus ? -1 : undefined}
    >
      <svg
        className="cedros-error-icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.75" fill="currentColor" />
      </svg>
      <span className="cedros-error-message">{message}</span>
      {onDismiss && (
        <button
          type="button"
          className="cedros-error-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
});
