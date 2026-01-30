/**
 * @cedros/login-react/email-only
 *
 * Minimal bundle with only email/password authentication (~15KB).
 */
export { CedrosLoginProvider } from './context/CedrosLoginProvider';
export { useCedrosLogin } from './context/useCedrosLogin';
export { EmailLoginForm } from './components/email/EmailLoginForm';
export { EmailRegisterForm } from './components/email/EmailRegisterForm';
export { PasswordInput } from './components/email/PasswordInput';
export { LoadingSpinner } from './components/shared/LoadingSpinner';
export { ErrorMessage } from './components/shared/ErrorMessage';
export { useAuth } from './hooks/useAuth';
export { useEmailAuth } from './hooks/useEmailAuth';
export type { AuthMethod, AuthUser, TokenPair, AuthError, AuthErrorCode, AuthResponse, AuthState, PasswordValidation, SessionStorage, ThemeMode, FeatureFlags, SessionConfig, AuthCallbacks, ThemeOverrides, CedrosLoginConfig, } from './types';
export { validatePassword } from './utils/validation';
