/**
 * TOTP Settings component for managing two-factor authentication
 *
 * Allows users to:
 * - View current 2FA status
 * - Enable 2FA (via TotpSetup wizard)
 * - Disable 2FA (requires verification)
 * - Regenerate backup codes
 */
export interface TotpSettingsProps {
    /** Called when 2FA status changes */
    onStatusChange?: (enabled: boolean) => void;
    /** Additional CSS class */
    className?: string;
}
/**
 * Two-factor authentication settings panel.
 *
 * Shows current 2FA status and provides controls for
 * enabling, disabling, and managing backup codes.
 *
 * @example
 * ```tsx
 * function SecuritySettings() {
 *   return (
 *     <div>
 *       <h2>Security</h2>
 *       <TotpSettings
 *         onStatusChange={(enabled) => {
 *           console.log('2FA is now', enabled ? 'enabled' : 'disabled');
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export declare function TotpSettings({ onStatusChange, className }: TotpSettingsProps): import("react/jsx-runtime").JSX.Element;
