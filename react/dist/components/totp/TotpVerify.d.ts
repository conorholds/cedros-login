/**
 * TOTP Verification component for login flow
 *
 * Displayed when a user with 2FA enabled needs to
 * enter their verification code to complete login.
 */
export interface TotpVerifyProps {
    /** Temporary token from password authentication */
    mfaToken: string;
    /** Email address (for display) */
    email?: string;
    /** Called when verification succeeds */
    onSuccess?: () => void;
    /** Called when user wants to go back */
    onBack?: () => void;
    /** Additional CSS class */
    className?: string;
}
/**
 * Two-factor authentication verification for login.
 *
 * Accepts 6-digit codes from authenticator apps
 * or recovery codes for account recovery.
 */
export declare function TotpVerify({ mfaToken, email, onSuccess, onBack, className, }: TotpVerifyProps): import("react/jsx-runtime").JSX.Element;
