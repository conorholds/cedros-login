/**
 * @cedros/login-react-native
 *
 * React Native authentication library with email/password, Google/Apple Sign-In,
 * and Solana wallet support.
 *
 * ## Subpath imports
 *
 * The root entry exports only auth-safe components and hooks that do NOT
 * depend on Node crypto or Web Crypto APIs.
 *
 * - `@cedros/login-react-native` — Auth hooks, login components, orgs, sessions, deposits
 * - `@cedros/login-react-native/wallet` — Wallet hooks + components (requires crypto backend)
 * - `@cedros/login-react-native/crypto` — Shamir, AES-GCM, Argon2, BIP-39 (requires crypto backend)
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

// Types (admin types excluded)
export * from "./types";

// Context
export { CedrosLoginProvider, useCedrosLogin } from "./context";
export type {
  CedrosLoginProviderConfig,
  CedrosLoginProviderProps,
  CedrosLoginContextValue,
} from "./context";

// Auth hooks (NO crypto dependencies)
export {
  useAuth,
  useEmailAuth,
  useGoogleAuth,
  useAppleAuth,
  useSolanaAuth,
  useMobileWalletAuth,
  useOrgs,
  useDeposit,
  useCredits,
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

// Components - TOTP
export { TotpSetup, TotpVerify, OtpInput } from "./components/totp";
export type {
  TotpSetupProps,
  TotpVerifyProps,
  OtpInputProps,
} from "./components/totp";

// Components - Deposit (NO crypto dependencies)
export {
  DepositForm,
  CreditBalance,
  CreditHistory,
  DepositFlow,
  FeeConfigDisplay,
  TokenSelector,
  TieredAmountSlider,
  History,
  DepositExplainerStep,
  DepositReceiveStep,
  WaitingStep,
  SuccessStep,
  ErrorStep,
  SUPPORTED_TOKENS,
  SOL_TOKEN,
  getTierForAmount,
} from "./components/deposit";
export type {
  DepositFormProps,
  CreditBalanceProps,
  CreditHistoryProps,
  DepositFlowProps,
  DepositFlowResult,
  DepositFlowStep,
  CurrencyMode,
  DepositMethod,
  ExplainerConfig,
  FeeConfigDisplayProps,
  TokenSelectorProps,
  TieredAmountSliderProps,
  HistoryProps,
  HistoryCategory,
  DepositExplainerStepProps,
  DepositReceiveStepProps,
  WaitingStepProps,
  SuccessStepProps,
  ErrorStepProps,
  Token,
} from "./components/deposit";

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
export { theme, colors, spacing, typography } from "./theme";
export type { Theme, Colors, Spacing, Typography } from "./theme";

// Platform
export { biometrics } from "./platform";
