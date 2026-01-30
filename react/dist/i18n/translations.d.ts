export interface Translations {
    auth: {
        email: string;
        password: string;
        confirmPassword: string;
        name: string;
        optional: string;
        createPassword: string;
        confirmYourPassword: string;
        emailPlaceholder: string;
        namePlaceholder: string;
    };
    buttons: {
        signIn: string;
        signUp: string;
        signOut: string;
        createAccount: string;
        continueWithGoogle: string;
        continueWithSolana: string;
        forgotPassword: string;
        resetPassword: string;
        sendVerification: string;
    };
    messages: {
        signingIn: string;
        signingUp: string;
        creatingAccount: string;
        connectingWallet: string;
        verifyingSignature: string;
        passwordsDoNotMatch: string;
        alreadyHaveAccount: string;
        dontHaveAccount: string;
        orContinueWith: string;
    };
    errors: {
        invalidCredentials: string;
        emailExists: string;
        invalidEmail: string;
        weakPassword: string;
        networkError: string;
        unknownError: string;
        walletNotFound: string;
        signatureRejected: string;
        challengeExpired: string;
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
    };
}
export declare const defaultTranslations: Translations;
/**
 * Deep merge translations, allowing partial overrides
 */
export declare function mergeTranslations(base: Translations, overrides: DeepPartial<Translations>): Translations;
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export {};
