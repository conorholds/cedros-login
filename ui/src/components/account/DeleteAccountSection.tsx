import { useCallback, useState } from 'react';
import { useAccountDeletion } from '../../hooks/useAccountDeletion';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { ErrorMessage } from '../shared/ErrorMessage';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const DELETE_CONFIRM_TEXT = 'DELETE';

export interface DeleteAccountSectionProps {
  onDeleted?: () => void;
  className?: string;
}

export function DeleteAccountSection({ onDeleted, className = '' }: DeleteAccountSectionProps) {
  const { deleteAccount, isLoading, error, clearError } = useAccountDeletion();
  const { confirm, dialogProps } = useConfirmDialog();
  const [confirmText, setConfirmText] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Delete your account?',
      description:
        'This permanently deletes your account and signs you out everywhere. It can’t be undone.',
      confirmLabel: 'Delete account',
      destructive: true,
    });
    if (!confirmed) return;

    setSuccessMessage(null);
    await deleteAccount(confirmText);
    setSuccessMessage('Your account has been deleted.');
    onDeleted?.();
  }, [confirm, confirmText, deleteAccount, onDeleted]);

  return (
    <section className={`cedros-account-delete ${className}`.trim()}>
      <header className="cedros-account-delete-header">
        <h3 className="cedros-account-delete-title">Delete account</h3>
        <p className="cedros-account-delete-description">
          Permanently delete your account and all of your sign-in methods. You will be signed out
          everywhere.
        </p>
      </header>

      <div className="cedros-account-delete-note">
        <strong>This can’t be undone.</strong> If you own an organization, transfer ownership before
        deleting your account. Some records may be kept where the law requires it.
      </div>

      {error && <ErrorMessage error={error} onDismiss={clearError} />}
      {successMessage && <div className="cedros-account-delete-success">{successMessage}</div>}

      <div className="cedros-field">
        <label className="cedros-field__label" htmlFor="cedros-delete-account-confirm">
          Type <code>{DELETE_CONFIRM_TEXT}</code> to confirm
        </label>
        <input
          id="cedros-delete-account-confirm"
          className="cedros-input"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder={DELETE_CONFIRM_TEXT}
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="cedros-account-delete-actions">
        <button
          type="button"
          className="cedros-button cedros-button-danger cedros-button-md"
          onClick={() => {
            void handleDelete();
          }}
          disabled={isLoading || confirmText.trim() !== DELETE_CONFIRM_TEXT}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Deleting account…</span>
            </>
          ) : (
            'Delete account'
          )}
        </button>
      </div>

      <ConfirmDialog {...dialogProps} />
    </section>
  );
}
