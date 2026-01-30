import { AuthError, TotpStatus, TotpSetupResponse, TotpBackupCodesResponse, TotpSetupState } from '../types';
export interface UseTotpReturn {
    /** Current TOTP status for the user */
    status: TotpStatus | null;
    /** Setup state for the enrollment flow */
    setupState: TotpSetupState;
    /** Setup data (secret, QR URL, backup codes) */
    setupData: TotpSetupResponse | null;
    /** Whether a request is in progress */
    isLoading: boolean;
    /** Error from the last request */
    error: AuthError | null;
    /** Fetch current TOTP status */
    getStatus: () => Promise<TotpStatus>;
    /** Start TOTP setup (generates secret and backup codes) */
    beginSetup: () => Promise<TotpSetupResponse>;
    /** Verify code and enable TOTP */
    enableTotp: (code: string) => Promise<void>;
    /** Disable TOTP (requires password confirmation) */
    disableTotp: (password: string) => Promise<void>;
    /** Regenerate recovery codes (requires current authenticator code) */
    regenerateBackupCodes: (code: string) => Promise<TotpBackupCodesResponse>;
    /** Clear error state */
    clearError: () => void;
    /** Reset to initial state */
    reset: () => void;
}
/**
 * Hook for TOTP (Time-based One-Time Password) two-factor authentication.
 *
 * Provides methods for:
 * - Setting up TOTP with authenticator apps
 * - Enabling/disabling TOTP for the user's account
 * - Managing backup codes
 *
 * @example
 * ```tsx
 * function TotpSettings() {
 *   const { status, beginSetup, enableTotp, setupData } = useTotp();
 *
 *   if (status?.enabled) {
 *     return <p>2FA is enabled</p>;
 *   }
 *
 *   const handleSetup = async () => {
 *     const data = await beginSetup();
 *     // Show QR code from data.otpauthUri
 *   };
 * }
 * ```
 */
export declare function useTotp(): UseTotpReturn;
