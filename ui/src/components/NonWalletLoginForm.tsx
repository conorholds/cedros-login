import { LoginFormBase, type LoginFormProps } from './LoginFormBase';

export type { LoginFormProps } from './LoginFormBase';

/**
 * Login form variant that omits all Solana wallet detection and bundle edges.
 */
export function NonWalletLoginForm(props: LoginFormProps) {
  return <LoginFormBase {...props} />;
}
