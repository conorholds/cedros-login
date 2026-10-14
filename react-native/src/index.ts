/**
 * @cedros/login-react-native
 *
 * React Native authentication library with email/password, Google/Apple Sign-In,
 * and Solana wallet support.
 *
 * ## Subpath imports
 *
 * The root entry exports auth components, hooks, and optional mobile wallet
 * auth helpers without requiring Node crypto or Web Crypto APIs.
 *
 * - `@cedros/login-react-native` — Auth hooks, login components, orgs, sessions
 * - `@cedros/login-react-native/register` — Cedros extension registration
 *
 * Solana mobile wallet support uses the optional `@wallet-ui/react-native-web3js`
 * peer dependency; Cedros Login does not export wallet package subpaths.
 *
 * @example
 * ```tsx
 * import { CedrosLoginProvider, LoginScreen } from '@cedros/login-react-native';
 *
 * function App() {
 *   return (
 *     <CedrosLoginProvider config={{ serverUrl: 'https://login.yourdomain.com' }}>
 *       <LoginScreen />
 *     </CedrosLoginProvider>
 *   );
 * }
 * ```
 */

// Types (admin types excluded)
export * from "./types";

// Context
export { CedrosLoginProvider, useCedrosLogin } from "./context";
export type {
  CedrosLoginProviderConfig,
  CedrosLoginProviderProps,
  CedrosLoginContextValue,
} from "./context";

// Theme context
export { CedrosThemeProvider, useCedrosTheme } from "./context";
export type {
  CedrosTheme,
  CedrosThemeOverrides,
  CedrosThemeProviderProps,
} from "./context";

// Auth hooks — imported DIRECTLY from individual files to avoid the hooks
// barrel which re-exports wallet hooks that transitively import crypto.
export { useAuth, type UseAuthReturn } from "./hooks/useAuth";
export { useEmailAuth, type UseEmailAuthReturn } from "./hooks/useEmailAuth";
export {
  useForgotPassword,
  type UseForgotPasswordReturn,
} from "./hooks/useForgotPassword";
export { useGoogleAuth, type UseGoogleAuthReturn } from "./hooks/useGoogleAuth";
export { useAppleAuth, type UseAppleAuthReturn } from "./hooks/useAppleAuth";
export type { AppleSignInPayload } from "./hooks/useAppleAuth";
export {
  useAccountDeletion,
  type UseAccountDeletionReturn,
} from "./hooks/useAccountDeletion";
export { useSolanaAuth, type UseSolanaAuthReturn } from "./hooks/useSolanaAuth";
export {
  useMobileWalletAuth,
  type UseMobileWalletAuthReturn,
  type MobileWalletCredentials,
} from "./hooks/useMobileWalletAuth";
export { useOrgs, type UseOrgsReturn } from "./hooks/useOrgs";
export {
  authUserToShopCustomerAccount,
  authUserToShopCustomerInfo,
  authUserToShopCustomerProfile,
  createLoginOwnedShopProfileUpdate,
  useCedrosShopCustomerBindings,
} from "./shopCustomerAccount";
export type {
  CedrosShopCustomerAccount,
  CedrosShopCustomerAdapter,
  CedrosShopCustomerAddress,
  CedrosShopCustomerBindings,
  CedrosShopCustomerInfo,
  CedrosShopCustomerProfile,
  CedrosShopCustomerProfileUpdate,
} from "./shopCustomerAccount";

// Components - Shared
export {
  LoadingSpinner,
  ErrorMessage,
  Button,
  Input,
} from "./components/shared";
export type {
  LoadingSpinnerProps,
  ErrorMessageProps,
  ButtonProps,
  InputProps,
} from "./components/shared";

// Components - Auth (NO crypto dependencies)
export {
  EmailLoginForm,
  EmailRegisterForm,
  PasswordInput,
  GoogleLoginButton,
  AppleLoginButton,
  SolanaLoginButton,
  ForgotPasswordForm,
} from "./components/auth";
export type {
  EmailLoginFormProps,
  EmailLoginFormStrings,
  EmailLoginFormStyleProps,
  EmailRegisterFormProps,
  EmailRegisterFormStrings,
  EmailRegisterFormStyleProps,
  PasswordInputProps,
  GoogleLoginButtonProps,
  AppleLoginButtonProps,
  SolanaLoginButtonProps,
  ForgotPasswordFormProps,
  ForgotPasswordFormStrings,
  ForgotPasswordFormStyleProps,
} from "./components/auth";
export {
  DeleteAccountSection,
  type DeleteAccountSectionProps,
} from "./components/account";

// Components - Screens
export { LoginScreen } from "./components/screens";
export type {
  LoginScreenProps,
  LoginScreenStrings,
  LoginScreenStyleProps,
} from "./components/screens";

// Components - Organization
export { OrgSelector, OrgSwitcher } from "./components/org";
export type { OrgSelectorProps, OrgSwitcherProps } from "./components/org";

// Components - Members
export { MemberList } from "./components/members";
export type { MemberListProps } from "./components/members";

// Components - Invites
export { InviteForm, InviteList } from "./components/invites";
export type { InviteFormProps, InviteListProps } from "./components/invites";

// Components - Sessions
export { SessionList } from "./components/sessions";
export type { SessionListProps } from "./components/sessions";

// Components - TOTP
export { TotpSetup, TotpVerify, OtpInput } from "./components/totp";
export type {
  TotpSetupProps,
  TotpVerifyProps,
  OtpInputProps,
} from "./components/totp";

// Utilities (NO crypto dependencies)
export {
  storage,
  getItem,
  setItem,
  removeItem,
  clearAll,
  TokenManager,
  validatePassword,
  validateEmail,
  validateSolanaPublicKey,
} from "./utils";

// Theme
export { theme, colors, spacing, typography, radii, motion } from "./theme";
export type { Theme, Colors, Spacing, Typography } from "./theme";

// Platform
export { biometrics } from "./platform";
