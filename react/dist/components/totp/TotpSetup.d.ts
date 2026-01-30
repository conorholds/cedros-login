/**
 * TOTP Setup component for enabling two-factor authentication
 *
 * Guides users through:
 * 1. Scanning QR code with authenticator app
 * 2. Saving backup codes
 * 3. Verifying setup with a code
 */
export interface TotpSetupProps {
    /** Called when setup is completed successfully */
    onSuccess?: () => void;
    /** Called when user cancels setup */
    onCancel?: () => void;
    /** Additional CSS class */
    className?: string;
}
/**
 * Two-factor authentication setup wizard.
 *
 * Displays QR code for authenticator app scanning,
 * recovery codes for account recovery, and verification step.
 */
export declare function TotpSetup({ onSuccess, onCancel, className }: TotpSetupProps): import("react/jsx-runtime").JSX.Element | null;
