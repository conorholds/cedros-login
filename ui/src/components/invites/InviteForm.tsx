import { useExternalEffect } from '../../hooks/effects';
import { useState, useCallback, useRef } from 'react';
import type { OrgRole, DisplayError } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { validateEmail } from '../../utils/validation';

type InviteRole = Exclude<OrgRole, 'owner'>;

export interface InviteFormProps {
  /** Callback when invite is submitted */
  onSubmit: (email: string, role: InviteRole) => Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: DisplayError;
  /** Available roles for invite (default: admin, member) */
  availableRoles?: InviteRole[];
  /** Default role for new invites */
  defaultRole?: InviteRole;
  /** Additional CSS class */
  className?: string;
}

const DEFAULT_ROLES: InviteRole[] = ['admin', 'member'];

/**
 * Form for inviting new members to an organization.
 *
 * @example
 * ```tsx
 * function InviteManager() {
 *   const { activeOrg } = useOrgs();
 *   const { createInvite, isLoading, error } = useInvites(activeOrg?.id);
 *
 *   return (
 *     <InviteForm
 *       onSubmit={createInvite}
 *       isLoading={isLoading}
 *       error={error?.message}
 *       defaultRole="member"
 *     />
 *   );
 * }
 * ```
 */
export function InviteForm({
  onSubmit,
  isLoading = false,
  error,
  availableRoles = DEFAULT_ROLES,
  defaultRole = 'member',
  className = '',
}: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>(defaultRole);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const successTimerRef = useRef<number | null>(null);
  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useExternalEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setSuccess(false);

      const trimmedEmail = email.trim();

      if (!trimmedEmail) {
        setFormError('Email is required');
        return;
      }

      if (!validateEmail(trimmedEmail)) {
        setFormError('Please enter a valid email address');
        return;
      }

      try {
        await onSubmit(trimmedEmail, role);
        setEmail('');
        setRole(defaultRole);
        setSuccess(true);
        // Clear success message after 3 seconds
        if (successTimerRef.current !== null) {
          window.clearTimeout(successTimerRef.current);
        }
        successTimerRef.current = window.setTimeout(() => {
          // Check mounted before state update to prevent memory leak warnings
          if (isMountedRef.current) {
            setSuccess(false);
          }
          successTimerRef.current = null;
        }, 3000);
      } catch {
        // Error handling is delegated to parent component.
        // Parent's onSubmit throws -> parent catches -> sets error prop -> ErrorMessage displays it.
        // This pattern allows the parent to control error display and retry logic.
      }
    },
    [email, role, defaultRole, onSubmit]
  );

  return (
    <form className={`cedros-invite-form ${className}`} onSubmit={handleSubmit}>
      {(error || formError) && <ErrorMessage error={formError ?? error ?? null} />}

      {success && (
        <div className="cedros-invite-success" role="status">
          <CheckIcon />
          <span>Invitation sent successfully!</span>
        </div>
      )}

      <div className="cedros-invite-form-row">
        <div className="cedros-form-group cedros-invite-email-group">
          <label htmlFor="invite-email" className="cedros-form-label">
            Email Address
          </label>
          <input
            id="invite-email"
            type="email"
            className="cedros-form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div className="cedros-form-group cedros-invite-role-group">
          <label htmlFor="invite-role" className="cedros-form-label">
            Role
          </label>
          <select
            id="invite-role"
            className="cedros-form-select"
            value={role}
            onChange={(e) => setRole(e.target.value as InviteRole)}
            disabled={isLoading}
          >
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="cedros-button cedros-button-primary cedros-invite-submit"
          disabled={isLoading || !email.trim()}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Send Invite'}
        </button>
      </div>

      <p className="cedros-form-hint">
        The invited user will receive an email with a link to join your organization.
      </p>
    </form>
  );
}

function CheckIcon() {
  return (
    <svg
      className="cedros-invite-check"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8L6 11L13 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
