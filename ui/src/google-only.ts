/**
 * @cedros/login-react/google-only
 *
 * Bundle with only Google OAuth authentication (~25KB).
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

export { GoogleLoginButton } from './components/google/GoogleLoginButton';

export { LoadingSpinner } from './components/shared/LoadingSpinner';
export { ErrorMessage } from './components/shared/ErrorMessage';

export { useAuth } from './hooks/useAuth';
export { useGoogleAuth } from './hooks/useGoogleAuth';

export type {
  AuthMethod,
  AuthUser,
  TokenPair,
  AuthError,
  AuthErrorCode,
  AuthResponse,
  AuthState,
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
