import type { ReactNode } from 'react';

export interface AutosaveRetryBannerProps {
  message?: string | null;
  disabled?: boolean;
  onRetry: () => void | Promise<void>;
  children?: ReactNode;
}

export function AutosaveRetryBanner({
  message,
  disabled = false,
  onRetry,
  children,
}: AutosaveRetryBannerProps) {
  return (
    <div className="cedros-settings-warning-banner" role="alert">
      <span>{children ?? message ?? 'Save failed - retry'}</span>
      <button
        type="button"
        className="cedros-button cedros-button-secondary"
        disabled={disabled}
        onClick={() => void onRetry()}
      >
        Retry
      </button>
    </div>
  );
}
