import { TotpSetup } from '../totp/TotpSetup';

export interface MfaSetupPromptProps {
  /** Called after TOTP enrollment succeeds */
  onComplete: () => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * Post-login prompt for admin-enforced MFA setup.
 *
 * Shown when the server returns `postLogin.action === 'setup_mfa'`,
 * indicating the admin requires two-factor authentication and the user
 * has not yet enrolled. This prompt is **not skippable** — the user
 * must complete TOTP setup to proceed.
 *
 * Only applies to users with password credentials. OAuth, passkey,
 * and wallet users are not prompted (their providers handle strong auth).
 */
export function MfaSetupPrompt({ onComplete, className }: MfaSetupPromptProps) {
  return (
    <div className={`cedros-mfa-setup-prompt ${className ?? ''}`}>
      <div className="cedros-mfa-setup-prompt__header">
        <h2 className="cedros-mfa-setup-prompt__title">Two-factor authentication required</h2>
        <p className="cedros-mfa-setup-prompt__description">
          Your administrator requires you to set up two-factor authentication before continuing.
          This adds an extra layer of security to your account.
        </p>
      </div>

      <div className="cedros-mfa-setup-prompt__body">
        <TotpSetup onSuccess={onComplete} />
      </div>
    </div>
  );
}
