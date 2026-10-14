/**
 * @cedros/login-react/solana-only
 *
 * Bundle with only Solana wallet authentication (~120KB due to wallet-adapter).
 */

export { CedrosLoginProvider } from './context/CedrosLoginProvider';
export { useCedrosLogin } from './context/useCedrosLogin';

export {
  FEATURE_FLAG_ENV_PREFIX,
  FEATURE_FLAG_REGISTRY,
  getFeatureFlagDefinition,
  getFeatureFlagDefinitions,
  getFeatureFlagEnvVar,
  isFeatureEnabled,
  parseFeatureFlagBoolean,
  readFeatureFlagEnv,
  resolveFeatureFlags,
} from './featureFlags';

export { SolanaLoginButton } from './components/solana/SolanaLoginButton';

export { LoadingSpinner } from './components/shared/LoadingSpinner';
export { ErrorMessage } from './components/shared/ErrorMessage';

export { useAuth } from './hooks/useAuth';
export { useSolanaAuth } from './hooks/useSolanaAuth';

// MWA registration for Android Chrome
export { registerMobileWallet } from './utils/mobileWalletAdapter';
export type { MobileWalletConfig } from './utils/mobileWalletAdapter';

export type {
  AuthMethod,
  AuthUser,
  TokenPair,
  AuthError,
  AuthErrorCode,
  AuthResponse,
  ChallengeResponse,
  AuthState,
  SolanaNetwork,
  SolanaConfig,
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
