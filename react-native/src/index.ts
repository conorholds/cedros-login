/**
 * @cedros/login-react-native
 *
 * React Native authentication library with email/password, Google/Apple Sign-In,
 * Solana wallet support, and embedded SSS wallets.
 *
 * @example
 * ```tsx
 * import { CedrosLoginProvider, LoginScreen } from '@cedros/login-react-native';
 *
 * function App() {
 *   return (
 *     <CedrosLoginProvider config={{ serverUrl: 'https://api.example.com' }}>
 *       <LoginScreen />
 *     </CedrosLoginProvider>
 *   );
 * }
 * ```
 */

// Crypto utilities (100% reusable)
export * from "./crypto";

// Types (admin types excluded)
export * from "./types";

// Context
export { CedrosLoginProvider, useCedrosLogin } from "./context";
export type {
  CedrosLoginProviderProps,
  CedrosLoginContextValue,
} from "./context";

// Hooks
export {
  useAuth,
  useEmailAuth,
  useGoogleAuth,
  useAppleAuth,
  useSolanaAuth,
  useMobileWalletAuth,
  useOrgs,
  useWallet,
} from "./hooks";
export type {
  UseAuthReturn,
  UseEmailAuthReturn,
  UseGoogleAuthReturn,
  UseAppleAuthReturn,
  UseSolanaAuthReturn,
  UseMobileWalletAuthReturn,
  MobileWalletCredentials,
  UseOrgsReturn,
  UseWalletReturn,
} from "./hooks";

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

// Components - Auth
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
  EmailRegisterFormProps,
  PasswordInputProps,
  GoogleLoginButtonProps,
  AppleLoginButtonProps,
  SolanaLoginButtonProps,
  ForgotPasswordFormProps,
} from "./components/auth";

// Components - Screens
export { LoginScreen } from "./components/screens";
export type { LoginScreenProps } from "./components/screens";

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

// Components - Wallet
export {
  WalletStatus,
  WalletUnlock,
  RecoveryPhraseDisplay,
} from "./components/wallet";
export type {
  WalletStatusProps,
  WalletUnlockProps,
  RecoveryPhraseDisplayProps,
} from "./components/wallet";

// Components - TOTP
export { TotpSetup, TotpVerify, OtpInput } from "./components/totp";
export type {
  TotpSetupProps,
  TotpVerifyProps,
  OtpInputProps,
} from "./components/totp";

// Components - Deposit
export {
  DepositForm,
  CreditBalance,
  CreditHistory,
} from "./components/deposit";
export type {
  DepositFormProps,
  CreditBalanceProps,
  CreditHistoryProps,
} from "./components/deposit";

// Utilities
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
export { theme, colors, spacing, typography } from "./theme";
export type { Theme, Colors, Spacing, Typography } from "./theme";

// Platform
export { biometrics } from "./platform";
