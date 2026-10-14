import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import type { SolanaLoginButtonProps } from './SolanaLoginButton';

const LazySolanaLoginButtonImpl = lazy(async () => {
  const module = await import('./SolanaLoginButton');
  return { default: module.SolanaLoginButton };
});

export type { SolanaLoginButtonProps } from './SolanaLoginButton';

export function SolanaLoginButton(props: SolanaLoginButtonProps) {
  return (
    <Suspense fallback={<DeferredSolanaButton {...props} />}>
      <LazySolanaLoginButtonImpl {...props} />
    </Suspense>
  );
}

function DeferredSolanaButton({
  className = '',
  variant = 'default',
  size = 'md',
}: Pick<SolanaLoginButtonProps, 'className' | 'variant' | 'size' | 'disabled'>) {
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
    <button
      type="button"
      className={`cedros-button ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled
      aria-label="Continue with Solana"
    >
      <LoadingSpinner size="sm" />
      <span>Continue with Solana</span>
    </button>
  );
}
