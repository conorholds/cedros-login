/**
 * TOTP (Time-based One-Time Password) types for two-factor authentication
 */
/**
 * User's TOTP status
 */
export interface TotpStatus {
    /** Whether TOTP is enabled for this user */
    enabled: boolean;
    /** Number of unused recovery codes remaining */
    recoveryCodesRemaining: number;
}
/**
 * Response from TOTP setup initiation
 */
export interface TotpSetupResponse {
    /** Base32-encoded secret for manual entry */
    secret: string;
    /** otpauth:// URI for QR code generation */
    otpauthUri: string;
    /** One-time recovery codes (shown only once) */
    recoveryCodes: string[];
}
/**
 * Request to verify and enable TOTP
 */
export interface TotpEnableRequest {
    /** 6-digit code from authenticator app */
    code: string;
}
/**
 * Request to verify TOTP during login
 */
export interface TotpVerifyRequest {
    /** 6-digit code from authenticator app or recovery code */
    code: string;
}
/**
 * Response with new backup codes
 */
export interface TotpBackupCodesResponse {
    /** New one-time recovery codes */
    recoveryCodes: string[];
}
/**
 * TOTP setup state for the enrollment flow
 */
export type TotpSetupState = 'idle' | 'loading' | 'setup' | 'verifying' | 'success' | 'error';
/**
 * TOTP verification state for the login flow
 */
export type TotpVerifyState = 'idle' | 'verifying' | 'success' | 'error';
