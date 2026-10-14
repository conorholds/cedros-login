/**
 * @cedros/login-react/non-wallet
 *
 * Admin-safe / non-wallet entrypoint for consumers that need login UI without
 * bundling Solana wallet adapter dependencies.
 */

export { CedrosLoginProvider } from './context/CedrosLoginProvider';
export type {
  CedrosLoginProviderProps,
  CedrosLoginProviderConfig,
} from './context/CedrosLoginProvider';
export { useCedrosLogin, useAuthState, useAuthUI } from './context/useCedrosLogin';
export type { AuthStateContextValue, AuthUIContextValue } from './context/CedrosLoginContext';
export { useOrgs } from './hooks/useOrgs';
export type { UseOrgsReturn } from './hooks/useOrgs';
export { useSetup } from './hooks/useSetup';
export type { UseSetupReturn } from './types';

export {
  FEATURE_FLAG_ENV_PREFIX,
  FEATURE_FLAG_REGISTRY,
  getAutoDiscoverableFeatureDefaults,
  getAutoDiscoverableFeatureFlagNames,
  getDefaultFeatureFlags,
  getFeatureFlagDefinition,
  getFeatureFlagDefinitions,
  getFeatureFlagEnvVar,
  isFeatureEnabled,
  parseFeatureFlagBoolean,
  readFeatureFlagEnv,
  resolveFeatureFlags,
} from './featureFlags';

export { NonWalletLoginForm as LoginForm } from './components/NonWalletLoginForm';
export type { LoginFormProps } from './components/NonWalletLoginForm';
export { SetupWizard } from './components/admin/SetupWizard';
export type { SetupWizardProps } from './components/admin/SetupWizard';

export { EmailLoginForm } from './components/email/EmailLoginForm';
export type { EmailLoginFormProps } from './components/email/EmailLoginForm';
export { EmailRegisterForm } from './components/email/EmailRegisterForm';
export type { EmailRegisterFormProps } from './components/email/EmailRegisterForm';
export { PasswordInput } from './components/email/PasswordInput';
export type { PasswordInputProps } from './components/email/PasswordInput';
export { ForgotPasswordForm } from './components/email/ForgotPasswordForm';
export type { ForgotPasswordFormProps } from './components/email/ForgotPasswordForm';
export { ResetPasswordForm } from './components/email/ResetPasswordForm';
export type { ResetPasswordFormProps } from './components/email/ResetPasswordForm';

export { GoogleLoginButton } from './components/google/GoogleLoginButton';
export type { GoogleLoginButtonProps } from './components/google/GoogleLoginButton';
export { AppleLoginButton } from './components/apple/AppleLoginButton';
export type { AppleLoginButtonProps } from './components/apple/AppleLoginButton';
export { PasskeyLoginButton } from './components/webauthn/PasskeyLoginButton';
export type { PasskeyLoginButtonProps } from './components/webauthn/PasskeyLoginButton';

export type {
  AuthMethod,
  AuthUser,
  TokenPair,
  AuthError,
  AuthErrorCode,
  AuthResponse,
  AuthState,
  PasswordValidation,
  FeatureFlagDefinition,
  FeatureFlagName,
  FeatureFlagStatus,
  SessionStorage,
  ThemeMode,
  FeatureFlags,
  ResolvedFeatureFlags,
  SessionConfig,
  AuthCallbacks,
  ThemeOverrides,
  CedrosLoginConfig,
} from './types';

export { validatePassword } from './utils/validation';
