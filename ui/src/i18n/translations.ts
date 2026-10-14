//! Translation types and merge helpers for Cedros Login.

import type { AdminTranslations } from './adminTranslations';

export interface Translations {
  common: {
    loading: string;
    saving: string;
    saved: string;
    error: string;
    retry: string;
    cancel: string;
    continue: string;
    enabled: string;
    disabled: string;
    refresh: string;
    required: string;
    optional: string;
    edit: string;
    delete: string;
    copy: string;
    show: string;
    hide: string;
    done: string;
    confirm: string;
    previous: string;
    next: string;
  };
  signupPlans: {
    loading: string;
    unavailable: string;
    chooseTitle: string;
    chooseBody: string;
    accountBody: string;
    changePlan: string;
    billingPeriod: string;
    annual: string;
    monthly: string;
    annualPrice: string;
    monthlyPrice: string;
    choosePlan: string;
    emptyPeriod: string;
    existingAccount: string;
  };
  organizations: {
    switchTitle: string;
    createTitle: string;
    select: string;
    empty: string;
    noMemberships: string;
    loading: string;
    personal: string;
    createNew: string;
    switchFailed: string;
    createFailed: string;
    name: string;
    slug: string;
    namePlaceholder: string;
    slugPlaceholder: string;
    slugHint: string;
    nameRequired: string;
    slugRequired: string;
  };
  auth: {
    email: string;
    emailAddress: string;
    password: string;
    confirmPassword: string;
    newPassword: string;
    name: string;
    accessCode: string;
    verificationCode: string;
    recoveryCode: string;
    signInCode: string;
    inviteCode: string;
    inviteCodeRequiredTitle: string;
    inviteCodeRequiredBody: string;
    inviteUnlockTitle: string;
    inviteUnlockBody: string;
    inviteUnlockRewardPercent: string;
    inviteUnlockRewardFree: string;
    inviteUnlockRewardNote: string;
    inviteUnlockRewardMonth: string;
    inviteUnlockRewardMonths: string;
    inviteUnlockContinue: string;
    createPassword: string;
    confirmYourPassword: string;
    enterPassword: string;
    enterAccessCode: string;
    enterInviteCode: string;
    enterCode: string;
    emailPlaceholder: string;
    namePlaceholder: string;
    authMethodAriaLabel: string;
    authOptionsAriaLabel: string;
    showPassword: string;
    hidePassword: string;
    forgotYourPassword: string;
    forgotPasswordTitle: string;
    forgotPasswordResetSubtitle: string;
    instantLinkSubtitle: string;
    checkYourEmail: string;
    verificationRequiredBody: string;
    verificationResent: string;
    passwordResetSent: string;
    instantLinkSent: string;
    backToLogin: string;
    resetYourPassword: string;
    requestNewResetLink: string;
    resetPasswordSubtitle: string;
    passwordResetSuccessful: string;
    passwordResetSuccessfulBody: string;
    goToLogin: string;
    sending: string;
    resetting: string;
    twoFactorTitle: string;
    recoveryCodeDescription: string;
    authenticatorCodeDescription: string;
    enterRecoveryCode: string;
    verify: string;
    verifying: string;
    useAuthenticatorApp: string;
    useRecoveryCode: string;
    oneTimePassword: string;
    otpDigit: string;
    signInToAccount: string;
    passkeysUnavailable: string;
    signedIn: string;
    continueAs: string;
    close: string;
    userMenuFor: string;
    defaultBrandName: string;
    defaultTagline: string;
    defaultSubtitle: string;
    welcomeBack: string;
    socialLoginSubtitle: string;
    invalidTotpCode: string;
    enterSixDigitCode: string;
    incorrectVerificationCode: string;
    loadTotpStatusFailed: string;
    startTotpSetupFailed: string;
    disableTotpFailed: string;
    regenerateCodesFailed: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    termsAgreementPrefix: string;
    termsOfService: string;
    termsAgreementFallback: string;
    termsRequiredError: string;
    emailOptInDefault: string;
    signInUnavailableTitle: string;
    signInUnavailableBody: string;
    signupAvailabilityRemaining: string;
    signupAvailabilityFull: string;
    signupAvailabilityDisclaimer: string;
    signupAvailabilityPeriods: {
      daily: string;
      weekly: string;
      monthly: string;
    };
    tabs: {
      signIn: string;
      signUp: string;
    };
    providers: {
      email: string;
      google: string;
      apple: string;
      solana: string;
      passkey: string;
      instantLink: string;
    };
  };
  buttons: {
    signIn: string;
    signUp: string;
    signOut: string;
    createAccount: string;
    continueWithGoogle: string;
    continueWithApple: string;
    continueWithSolana: string;
    continueWithPasskey: string;
    createPasskeyAccount: string;
    forgotPassword: string;
    resetPassword: string;
    sendVerification: string;
    sendRecoveryEmail: string;
    sendResetLink: string;
    sendSignInLink: string;
    updatePassword: string;
    acceptInvite: string;
    manageAccount: string;
    useAnotherAccount: string;
  };
  messages: {
    signingIn: string;
    signingUp: string;
    creatingAccount: string;
    connectingWallet: string;
    verifyingSignature: string;
    passwordsDoNotMatch: string;
    orContinueWith: string;
    recoveryInstructionsSent: string;
    verificationEmailSent: string;
    passwordUpdated: string;
    emailVerified: string;
    instantLinkConfirmed: string;
    teamAccessReady: string;
    continueAfterSignIn: string;
    checkEmailForNextStep: string;
    inviteWrongAccount: string;
    inviteAcceptFailed: string;
  };
  errors: {
    invalidCredentials: string;
    emailExists: string;
    emailNotVerified: string;
    invalidEmail: string;
    weakPassword: string;
    networkError: string;
    unknownError: string;
    walletNotFound: string;
    signatureRejected: string;
    challengeExpired: string;
    sessionExpired: string;
    linkExpired: string;
    tooManyRequests: string;
    signupLimitReached: string;
    stepUpRequired: string;
    setupRequired: string;
    disposableEmailBlocked: string;
    signInFallback: string;
    registerFallback: string;
    serverError: string;
    unableToReachServer: string;
    rateLimitedWithSeconds: string;
  };
  passwordValidation: {
    minLength: string;
    uppercase: string;
    lowercase: string;
    number: string;
    special: string;
    weak: string;
    fair: string;
    good: string;
    strong: string;
    /** Heading above the requirements checklist. */
    requirementsTitle: string;
    /** Screen-reader suffix for a satisfied requirement. */
    met: string;
    /** Screen-reader suffix for an unsatisfied requirement. */
    notMet: string;
    /** Announced once every requirement is satisfied. */
    allRequirementsMet: string;
    /** Progress announcement; supports {met} and {total} placeholders. */
    requirementsProgress: string;
  };
  admin: AdminTranslations;
  extension: {
    defaultLocale: string;
    pageSeedDescription: string;
    nativeFallback: string;
    ownerCanEditCopy: string;
    noPrivateCodes: string;
    serverBoundRecovery: string;
    authForm: {
      authOptionsAriaLabel: string;
      editBeforePublishing: string;
      logInToManageAccount: string;
      accountWorkspaceBody: string;
    };
    accountSections: {
      profileTitle: string;
      profileBody: string;
      securityTitle: string;
      securityBody: string;
      linkedAccountsTitle: string;
      linkedAccountsBody: string;
      sessionsTitle: string;
      sessionsBody: string;
    };
  };
}

/**
 * Deep merge translations, allowing partial overrides.
 */
export function mergeTranslations(
  base: Translations,
  overrides: DeepPartial<Translations>
): Translations {
  return deepMerge(base, overrides) as Translations;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function deepMerge<T extends object>(base: T, overrides: DeepPartial<T>): T {
  const result = { ...base };

  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      const baseValue = base[key as keyof T];
      const overrideValue = overrides[key as keyof typeof overrides];

      if (
        typeof baseValue === 'object' &&
        baseValue !== null &&
        typeof overrideValue === 'object' &&
        overrideValue !== null
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          baseValue as object,
          overrideValue as DeepPartial<object>
        );
      } else if (overrideValue !== undefined) {
        (result as Record<string, unknown>)[key] = overrideValue;
      }
    }
  }

  return result;
}
