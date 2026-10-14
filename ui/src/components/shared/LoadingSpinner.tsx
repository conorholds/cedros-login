import { memo, type CSSProperties } from 'react';
import { useTranslations } from '../../i18n';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: CSSProperties;
  /** Custom label for screen readers (default: "Loading") */
  label?: string;
  /** If true, announce the loading state to screen readers */
  announce?: boolean;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48, // H-04: Added for WalletUnlock component
};

/**
 * Accessible loading spinner component.
 * Announces loading state to screen readers when announce prop is true.
 * Wrapped with React.memo to prevent unnecessary re-renders.
 */
export const LoadingSpinner = memo(function LoadingSpinner({
  size = 'md',
  className = '',
  style,
  label,
  announce = false,
}: LoadingSpinnerProps) {
  const t = useTranslations();
  const dimension = sizeMap[size];
  const accessibleLabel = label ?? t.common.loading;

  const spinner = (
    <svg
      className={`cedros-spinner ${className}`}
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      aria-label={accessibleLabel}
      role="status"
      aria-hidden={announce ? 'true' : undefined}
    >
      <circle
        className="cedros-spinner-track"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <circle
        className="cedros-spinner-head"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        transform="rotate(-90 12 12)"
      />
    </svg>
  );

  // Wrap in aria-live region if announce is true
  if (announce) {
    return (
      <span aria-live="polite" aria-busy="true">
        {spinner}
        <span className="cedros-sr-only">{accessibleLabel}</span>
      </span>
    );
  }

  return spinner;
});
