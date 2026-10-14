import { useCallback, useState, type FormEvent } from 'react';
import type { AccountEmail } from '../../types';
import { useAccountEmails } from '../../hooks/useAccountEmails';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { ErrorMessage } from '../shared/ErrorMessage';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export interface EmailManagementProps {
  /**
   * Render the built-in "Email addresses" heading. Pass false when the host
   * surface already titles this panel (e.g. the account settings page).
   */
  showHeader?: boolean;
  /** Called after the account's email addresses change (added or new primary) */
  onEmailChange?: () => void;
  className?: string;
}

export function EmailManagement({
  showHeader = true,
  onEmailChange,
  className = '',
}: EmailManagementProps) {
  const {
    emails,
    isLoading,
    error,
    addEmail,
    resendEmail,
    removeEmail,
    setPrimaryEmail,
    clearError,
  } = useAccountEmails();
  const { confirm, dialogProps } = useConfirmDialog();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const submitEmail = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = email.trim();
      if (!trimmed) return;
      setSuccess(null);
      setActiveAction('add');
      try {
        await addEmail(trimmed);
        setEmail('');
        setSuccess(`Verification sent to ${trimmed}.`);
        onEmailChange?.();
      } catch {
        // Hook state surfaces the normalized API error.
      } finally {
        setActiveAction(null);
      }
    },
    [addEmail, email, onEmailChange]
  );

  const resend = useCallback(
    async (row: AccountEmail) => {
      setSuccess(null);
      setActiveAction(`resend:${row.id}`);
      try {
        await resendEmail(row.id);
        setSuccess(`Verification resent to ${row.email}.`);
      } catch {
        // Hook state surfaces the normalized API error.
      } finally {
        setActiveAction(null);
      }
    },
    [resendEmail]
  );

  const makePrimary = useCallback(
    async (row: AccountEmail) => {
      setSuccess(null);
      setActiveAction(`primary:${row.id}`);
      try {
        await setPrimaryEmail(row.id);
        setSuccess(`${row.email} is now your primary email.`);
        onEmailChange?.();
      } catch {
        // Hook state surfaces the normalized API error.
      } finally {
        setActiveAction(null);
      }
    },
    [setPrimaryEmail, onEmailChange]
  );

  const remove = useCallback(
    async (row: AccountEmail) => {
      const confirmed = await confirm({
        title: `Remove ${row.email}?`,
        description: 'This email will no longer sign in to your account.',
        confirmLabel: 'Remove',
        destructive: true,
      });
      if (!confirmed) return;
      setSuccess(null);
      setActiveAction(`remove:${row.id}`);
      try {
        await removeEmail(row.id);
        setSuccess(`${row.email} was removed.`);
      } catch {
        // Hook state surfaces the normalized API error.
      } finally {
        setActiveAction(null);
      }
    },
    [confirm, removeEmail]
  );

  if (isLoading && emails.length === 0) {
    return (
      <div className={`cedros-email-management cedros-email-management-loading ${className}`}>
        <LoadingSpinner size="sm" />
        <span>Loading email addresses...</span>
      </div>
    );
  }

  return (
    <section className={`cedros-email-management ${className}`.trim()}>
      {showHeader && (
        <header className="cedros-email-management__header">
          <h3 className="cedros-email-management__title">Email addresses</h3>
          <p className="cedros-email-management__description">
            Add and verify the email addresses you can use to sign in.
          </p>
        </header>
      )}

      {error && <ErrorMessage error={error} onDismiss={clearError} />}
      {success && <p className="cedros-email-management__success">{success}</p>}

      <form className="cedros-email-management__form" onSubmit={submitEmail}>
        <div className="cedros-email-management__field">
          <input
            className="cedros-input cedros-email-management__input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            aria-label="Email address"
            disabled={activeAction === 'add'}
            required
          />
        </div>
        <button
          type="submit"
          className="cedros-button cedros-button-primary cedros-button-sm"
          disabled={activeAction === 'add' || email.trim().length === 0}
        >
          {activeAction === 'add' ? <LoadingSpinner size="sm" /> : 'Add email'}
        </button>
      </form>

      {emails.length === 0 ? (
        <p className="cedros-email-management__empty">No email addresses added yet.</p>
      ) : (
        <ul className="cedros-email-management__list">
          {emails.map((row) => (
            <EmailRow
              key={row.id}
              email={row}
              activeAction={activeAction}
              onResend={resend}
              onMakePrimary={makePrimary}
              onRemove={remove}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog {...dialogProps} />
    </section>
  );
}

interface EmailRowProps {
  email: AccountEmail;
  activeAction: string | null;
  onResend: (email: AccountEmail) => void;
  onMakePrimary: (email: AccountEmail) => void;
  onRemove: (email: AccountEmail) => void;
}

function EmailRow({ email, activeAction, onResend, onMakePrimary, onRemove }: EmailRowProps) {
  const resendBusy = activeAction === `resend:${email.id}`;
  const primaryBusy = activeAction === `primary:${email.id}`;
  const removeBusy = activeAction === `remove:${email.id}`;
  const disabled = activeAction !== null;

  return (
    <li className="cedros-email-row">
      <div className="cedros-email-row__main">
        <span className="cedros-email-row__address">{email.email}</span>
        <span className="cedros-email-row__badges">
          {email.primary && <span className="cedros-badge cedros-badge--ok">Primary</span>}
          <span
            className={`cedros-badge ${email.verified ? 'cedros-badge--ok' : 'cedros-badge--muted'}`}
          >
            {email.verified ? 'Verified' : 'Pending'}
          </span>
        </span>
        <span className="cedros-email-row__meta">Added {formatDate(email.createdAt)}</span>
      </div>
      <div className="cedros-email-row__actions">
        {!email.verified && (
          <button
            type="button"
            className="cedros-button cedros-button-outline cedros-button-sm"
            onClick={() => onResend(email)}
            disabled={disabled}
          >
            {resendBusy ? <LoadingSpinner size="sm" /> : 'Resend'}
          </button>
        )}
        {email.verified && !email.primary && (
          <button
            type="button"
            className="cedros-button cedros-button-outline cedros-button-sm"
            onClick={() => onMakePrimary(email)}
            disabled={disabled}
          >
            {primaryBusy ? <LoadingSpinner size="sm" /> : 'Make primary'}
          </button>
        )}
        {!email.primary && (
          <button
            type="button"
            className="cedros-button cedros-button-outline cedros-button-sm cedros-button-danger-outline"
            onClick={() => onRemove(email)}
            disabled={disabled}
          >
            {removeBusy ? <LoadingSpinner size="sm" /> : 'Remove'}
          </button>
        )}
      </div>
    </li>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
