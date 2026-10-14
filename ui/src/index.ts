/**
 * @cedros/login-react
 *
 * Full authentication component library with email/password, Google OAuth, and Solana wallet sign-in.
 * For consumers that must avoid Solana bundle edges entirely, use
 * `@cedros/login-react/non-wallet`.
 */

// Context
export { CedrosLoginProvider } from './context/CedrosLoginProvider';
export type {
  CedrosLoginProviderProps,
  CedrosLoginProviderConfig,
} from './context/CedrosLoginProvider';
export { useCedrosLogin, useAuthState, useAuthUI } from './context/useCedrosLogin';
export { useCedrosLoginOptional } from './context/useCedrosLogin';
export type { AuthStateContextValue, AuthUIContextValue } from './context/CedrosLoginContext';

// Feature flags
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

// Components
export { LoginButton } from './components/LoginButton';
export type { LoginButtonProps, MenuItemConfig } from './components/LoginButton';
export { LoginModal } from './components/LoginModal';
export type { LoginModalProps } from './components/LoginModal';
export { LoginForm } from './components/LoginForm';
export type { LoginFormProps } from './components/LoginForm';

// Email components
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

// Google components
export { GoogleLoginButton } from './components/google/GoogleLoginButton';
export type { GoogleLoginButtonProps } from './components/google/GoogleLoginButton';

// Apple components
export { AppleLoginButton } from './components/apple/AppleLoginButton';
export type { AppleLoginButtonProps } from './components/apple/AppleLoginButton';

// Solana components
export { SolanaLoginButton } from './components/solana/LazySolanaLoginButton';
export type { SolanaLoginButtonProps } from './components/solana/LazySolanaLoginButton';

// Passkey (WebAuthn) components
export { PasskeyLoginButton } from './components/webauthn/PasskeyLoginButton';
export type { PasskeyLoginButtonProps } from './components/webauthn/PasskeyLoginButton';

// Organization components
export { OrgSelector } from './components/org/OrgSelector';
export type { OrgSelectorProps } from './components/org/OrgSelector';
export { OrgSwitcher } from './components/org/OrgSwitcher';
export type { OrgSwitcherProps } from './components/org/OrgSwitcher';

// Member components
export { MemberList } from './components/members/MemberList';
export type { MemberListProps } from './components/members/MemberList';

// Invite components
export { InviteForm } from './components/invites/InviteForm';
export type { InviteFormProps } from './components/invites/InviteForm';
export { InviteList } from './components/invites/InviteList';
export type { InviteListProps } from './components/invites/InviteList';

// Session components
export { SessionList } from './components/sessions/SessionList';
export type { SessionListProps } from './components/sessions/SessionList';

// Wallet components
export { PasskeyPrompt } from './components/wallet';
export type { PasskeyPromptProps } from './components/wallet';

// Admin components
export { SystemSettings } from './components/admin/SystemSettings';
export type { SystemSettingsProps } from './components/admin/SystemSettings';
export { AdminUserList } from './components/admin/AdminUserList';
export type { AdminUserListProps } from './components/admin/AdminUserList';
export { ProfileDropdown } from './components/admin/ProfileDropdown';
export type { ProfileDropdownProps } from './components/admin/ProfileDropdown';
export { SetupWizard } from './components/admin/SetupWizard';
export type { SetupWizardProps } from './components/admin/SetupWizard';

// Settings page components
export {
  AuthenticationSettings,
  SecuritySettings,
  EmailSettings,
  WebhookSettings,
  ServerSettings,
  SettingsPageLayout,
} from './components/admin/settings';
export type {
  AuthenticationSettingsProps,
  SecuritySettingsProps,
  EmailSettingsProps,
  WebhookSettingsProps,
  ServerSettingsProps,
  SettingsPageLayoutProps,
} from './components/admin/settings';

// TOTP (Two-Factor Authentication) components
export { OtpInput, TotpSetup, TotpVerify, TotpSettings } from './components/totp';
export type {
  OtpInputProps,
  TotpSetupProps,
  TotpVerifyProps,
  TotpSettingsProps,
} from './components/totp';

// Profile components
export { UserProfileSettings } from './components/profile';
export type { UserProfileSettingsProps } from './components/profile';

// Account settings components
export {
  AccountSettings,
  ProfileTab,
  EmailManagement,
  LinkedAccounts,
  MfaSetupPrompt,
} from './components/account';
export type {
  AccountSettingsProps,
  DeleteAccountSectionProps,
  EmailManagementProps,
  ProfileTabProps,
  LinkedAccountsProps,
  MfaSetupPromptProps,
} from './components/account';
export { DeleteAccountSection } from './components/account';

// Post-login components
export { CompleteAccountPrompt } from './components/CompleteAccountPrompt';
export type { CompleteAccountPromptProps } from './components/CompleteAccountPrompt';
export { ChooseUsernamePrompt } from './components/ChooseUsernamePrompt';
export type { ChooseUsernamePromptProps } from './components/ChooseUsernamePrompt';

// Template layouts
export { FullPageLayout, SplitPageLayout } from './components/templates';
export type { FullPageLayoutProps, SplitPageLayoutProps } from './components/templates';

// Shared components
export { LoadingSpinner } from './components/shared/LoadingSpinner';
export type { LoadingSpinnerProps } from './components/shared/LoadingSpinner';
export { ErrorMessage } from './components/shared/ErrorMessage';
export type { ErrorMessageProps } from './components/shared/ErrorMessage';
// Export ErrorBoundary for wrapping feature components
export { ErrorBoundary } from './components/shared/ErrorBoundary';
export type { ErrorBoundaryProps } from './components/shared/ErrorBoundary';
export { ConfirmDialog } from './components/shared/ConfirmDialog';
export type { ConfirmDialogProps } from './components/shared/ConfirmDialog';

// Hooks
export { useAuth } from './hooks/useAuth';
export type { UseAuthReturn } from './hooks/useAuth';
export { useConfirmDialog } from './hooks/useConfirmDialog';
export type { ConfirmOptions, UseConfirmDialogResult } from './hooks/useConfirmDialog';
export { useEmailAuth } from './hooks/useEmailAuth';
export type { UseEmailAuthReturn } from './hooks/useEmailAuth';
export { useGoogleAuth } from './hooks/useGoogleAuth';
export type { UseGoogleAuthReturn } from './hooks/useGoogleAuth';
export { useAppleAuth } from './hooks/useAppleAuth';
export type { UseAppleAuthReturn } from './hooks/useAppleAuth';
export { useSolanaAuth } from './hooks/useSolanaAuth';
export type { UseSolanaAuthReturn } from './hooks/useSolanaAuth';
export { useWebAuthn } from './hooks/useWebAuthn';
export type { UseWebAuthnReturn } from './hooks/useWebAuthn';
export { usePasswordReset } from './hooks/usePasswordReset';
export type { UsePasswordResetReturn } from './hooks/usePasswordReset';
export { useInstantLink } from './hooks/useInstantLink';
export type { UseInstantLinkReturn } from './hooks/useInstantLink';
export { useOrgs } from './hooks/useOrgs';
export type { UseOrgsReturn } from './hooks/useOrgs';
export { useMembers } from './hooks/useMembers';
export type { UseMembersReturn } from './hooks/useMembers';
export { useInvites } from './hooks/useInvites';
export type { UseInvitesReturn } from './hooks/useInvites';
export { useSessions } from './hooks/useSessions';
export type { UseSessionsReturn } from './hooks/useSessions';
export { useAccountEmails } from './hooks/useAccountEmails';
export type { UseAccountEmailsReturn } from './types';
export { useCredentials } from './hooks/useCredentials';
export type { UseCredentialsReturn } from './types';
export { useAuthorize } from './hooks/useAuthorize';
export type { UseAuthorizeReturn, AuthorizationCheck } from './hooks/useAuthorize';
export { useSetPassword } from './hooks/useSetPassword';
export type { UseSetPasswordReturn } from './hooks/useSetPassword';
export { useTotp } from './hooks/useTotp';
export type { UseTotpReturn } from './hooks/useTotp';
export { useTotpVerify } from './hooks/useTotpVerify';
export type { UseTotpVerifyReturn } from './hooks/useTotpVerify';
export { useAdminUsers } from './hooks/useAdminUsers';
export type { UseAdminUsersReturn } from './types';
export { useSystemSettings } from './hooks/useSystemSettings';
export type { UseSystemSettingsReturn } from './types';
export { useSetup } from './hooks/useSetup';
export type { UseSetupReturn } from './types';
export { useServerFeatures } from './hooks/useServerFeatures';
export type { UseServerFeaturesReturn, ServerFeatures } from './hooks/useServerFeatures';
export { useProfile } from './hooks/useProfile';
export type { UseProfileReturn } from './types';
export { useAccountDeletion } from './hooks/useAccountDeletion';
export type { UseAccountDeletionReturn } from './hooks/useAccountDeletion';
export { usePostLogin } from './hooks/usePostLogin';
export type { UsePostLoginReturn } from './hooks/usePostLogin';
export { useUsername } from './hooks/useUsername';
export type { UseUsernameReturn } from './hooks/useUsername';
export { useCedrosTheme } from './hooks/useCedrosTheme';
export type { UseCedrosThemeReturn } from './hooks/useCedrosTheme';
export {
  authUserToShopCustomerAccount,
  authUserToShopCustomerInfo,
  authUserToShopCustomerProfile,
  createLoginOwnedShopProfileUpdate,
  useCedrosShopCustomerBindings,
} from './shopCustomerAccount';
export type {
  CedrosShopCustomerAccount,
  CedrosShopCustomerAdapter,
  CedrosShopCustomerAddress,
  CedrosShopCustomerBindings,
  CedrosShopCustomerInfo,
  CedrosShopCustomerProfile,
  CedrosShopCustomerProfileUpdate,
} from './shopCustomerAccount';

// Types
export type {
  // Auth types
  AuthUserEmail,
  AuthMethod,
  AuthUser,
  TokenPair,
  AuthError,
  AuthErrorCode,
  AuthResponse,
  PostLoginAction,
  ChallengeResponse,
  AuthState,
  PasswordValidation,
  // Config types
  SolanaNetwork,
  SessionStorage,
  ThemeMode,
  SolanaConfig,
  FeatureFlagDefinition,
  FeatureFlagName,
  FeatureFlagStatus,
  FeatureFlags,
  ResolvedFeatureFlags,
  SessionConfig,
  AuthCallbacks,
  ThemeOverrides,
  ForgotPasswordConfig,
  TermsOfServiceConfig,
  EmailOptInConfig,
  FormConfig,
  TotpConfig,
  WalletConfig,
  CedrosLoginConfig,
  // TOTP types
  TotpStatus,
  TotpSetupResponse,
  TotpEnableRequest,
  TotpVerifyRequest,
  TotpBackupCodesResponse,
  TotpSetupState,
  TotpVerifyState,
  // Organization types
  OrgRole,
  Organization,
  Membership,
  OrgWithMembership,
  Permission,
  CreateOrgRequest,
  UpdateOrgRequest,
  OrgState,
  AuthorizeRequest,
  AuthorizeResponse,
  // Member types
  Member,
  MemberUser,
  UpdateMemberRoleRequest,
  // Invite types
  Invite,
  CreateInviteRequest,
  AcceptInviteRequest,
  AcceptInviteResponse,
  // Session types
  Session,
  ListSessionsResponse,
  RevokeAllSessionsResponse,
  // Credential types
  CredentialType,
  Credential,
  ListCredentialsResponse,
  // Account email types
  AccountEmail,
  ListAccountEmailsResponse,
  // System settings types
  SystemSetting,
  ListSystemSettingsResponse,
  UpdateSettingRequest,
  UpdateSystemSettingsRequest,
  UpdateSystemSettingsResponse,
  SettingCategoryMeta,
  SettingMeta,
  // Admin user types
  AdminUser,
  ListAdminUsersResponse,
  ListUsersParams,
  // Setup types
  SetupStatusResponse,
  CreateFirstAdminRequest,
  CreateFirstAdminResponse,
  // Profile types
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateProfileResponse,
  ChangePasswordResponse,
} from './types';

// Utils
export { validatePassword } from './utils/validation';

// Autosave standard
export {
  AutosaveConflictDialog,
  AutosaveRetryBanner,
  AutosaveStatusIndicator,
  CEDROS_AUTOSAVE_DEBOUNCE_PROFILES,
  CedrosAutosaveProvider,
  createCedrosAutosavePersistence,
  createIndexedDbAutosavePersistence,
  createMemoryAutosavePersistence,
  useCedrosAutosave,
  useCedrosAutosaveTelemetry,
} from './autosave';
export type {
  AutosaveResourceDefinition,
  CedrosAutosaveConflict,
  CedrosAutosaveConflictStrategy,
  CedrosAutosaveController,
  CedrosAutosaveDebounceProfile,
  CedrosAutosaveDebounceProfileName,
  CedrosAutosaveFailure,
  CedrosAutosaveMetadata,
  CedrosAutosaveOptions,
  CedrosAutosavePersistence,
  CedrosAutosavePersistenceSnapshot,
  CedrosAutosavePersistenceStorage,
  CedrosAutosaveProviderProps,
  CedrosAutosaveProviderValue,
  CedrosAutosaveResult,
  CedrosAutosaveSaveMetadata,
  CedrosAutosaveSaveResult,
  CedrosAutosaveState,
  CedrosAutosaveStatus,
  CedrosAutosaveTelemetryEvent,
  CedrosAutosaveValidationResult,
  UseCedrosAutosaveOptions,
  UseCedrosAutosaveReturn,
} from './autosave';

// Solana Mobile Wallet Adapter (MWA) registration for Android Chrome
export { registerMobileWallet } from './utils/mobileWalletAdapter';
export type { MobileWalletConfig } from './utils/mobileWalletAdapter';

// i18n
export {
  I18nProvider,
  useTranslations,
  useLocale,
  defaultTranslations,
  mergeTranslations,
} from './i18n';
export type { I18nProviderProps, Translations } from './i18n';
