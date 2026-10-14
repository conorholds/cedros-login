import { SolanaLoginButton } from './solana/LazySolanaLoginButton';
import { LoginFormBase, type LoginFormProps } from './LoginFormBase';
import { detectSolanaWallets } from '../utils/walletDetection';

export type { LoginFormProps } from './LoginFormBase';

/**
 * Combined login form with all enabled auth methods.
 */
export function LoginForm(props: LoginFormProps) {
  return (
    <LoginFormBase
      {...props}
      getHasWallets={detectSolanaWallets}
      renderSolanaButton={(solanaProps) => <SolanaLoginButton {...solanaProps} />}
    />
  );
}
