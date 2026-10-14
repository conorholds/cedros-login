import { useCallback, useState, type ReactNode } from 'react';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { ConfirmDialog } from '../../shared/ConfirmDialog';
import { ErrorMessage } from '../../shared/ErrorMessage';
import { InviteCodeFormModal, type InviteCodeModalState } from './InviteCodeFormModal';
import { AdminActionMenu } from './AdminActionMenu';
import type { CreateInviteCodeRequest, InviteCode, UpdateInviteCodeRequest } from '../../../types';
import { useI18n } from '../../../i18n';

export interface InviteCodeManagerProps {
  codes: InviteCode[];
  isLoading: boolean;
  onCreate: (request: CreateInviteCodeRequest) => Promise<void>;
  onUpdate: (inviteCode: InviteCode, request: UpdateInviteCodeRequest) => Promise<void>;
  onDelete: (inviteCode: InviteCode) => Promise<void>;
}

export function InviteCodeManager({
  codes,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
}: InviteCodeManagerProps) {
  const t = useI18n().t;
  const [modal, setModal] = useState<InviteCodeModalState | null>(null);
  const { actionError, clearActionError, deleteCode, dialogProps } = useDeleteInviteCode(onDelete);

  return (
    <div className="cedros-invite-code-manager">
      <div className="cedros-invite-code-manager__header">
        <div>
          <h4 className="cedros-invite-code-manager__title">
            {t.admin.settings.inviteCustomCodesTitle}
          </h4>
        </div>
        {(isLoading || codes.length > 0) && (
          <button
            type="button"
            className="cedros-data-btn cedros-data-btn--primary cedros-button cedros-button-primary"
            onClick={() => setModal({ mode: 'create' })}
          >
            {t.admin.settings.inviteAddCustomCode}
          </button>
        )}
      </div>

      {actionError && <ErrorMessage error={actionError} onDismiss={clearActionError} />}

      <InviteCodeTable
        codes={codes}
        isLoading={isLoading}
        onCreate={() => setModal({ mode: 'create' })}
        onEdit={(inviteCode) => setModal({ mode: 'edit', inviteCode })}
        onDelete={deleteCode}
      />

      {modal && (
        <InviteCodeFormModal
          modal={modal}
          onClose={() => setModal(null)}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      )}
      <ConfirmDialog {...dialogProps} className="cedros-data-dialog" />
    </div>
  );
}

function useDeleteInviteCode(onDelete: (inviteCode: InviteCode) => Promise<void>) {
  const { t, message } = useI18n();
  const [actionError, setActionError] = useState<string | null>(null);
  const { confirm, dialogProps } = useConfirmDialog();
  const clearActionError = useCallback(() => setActionError(null), []);
  const deleteCode = useCallback(
    async (inviteCode: InviteCode) => {
      const confirmed = await confirm({
        title: message(t.admin.settings.inviteDeleteTitle, { code: inviteCode.code }),
        description: t.admin.settings.inviteDeleteDescription,
        confirmLabel: t.admin.settings.inviteDeleteAction,
        destructive: true,
      });
      if (!confirmed) return;

      setActionError(null);
      try {
        await onDelete(inviteCode);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : t.admin.settings.inviteDeleteFailed);
      }
    },
    [confirm, message, onDelete, t]
  );

  return { actionError, clearActionError, deleteCode, dialogProps };
}

function InviteCodeTable({
  codes,
  isLoading,
  onEdit,
  onDelete,
  onCreate,
}: {
  codes: InviteCode[];
  isLoading: boolean;
  onEdit: (inviteCode: InviteCode) => void;
  onDelete: (inviteCode: InviteCode) => void;
  onCreate: () => void;
}) {
  const t = useI18n().t;
  if (isLoading) {
    return (
      <div
        className="cedros-data-card cedros-login-admin-skeleton"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="cedros-sr-only">{t.admin.settings.inviteLoadingCustomCodes}</span>
        <span className="cedros-login-admin-skeleton__line" />
        <span className="cedros-login-admin-skeleton__line cedros-login-admin-skeleton__line--short" />
      </div>
    );
  }

  if (codes.length === 0) {
    return (
      <div className="cedros-data-table-wrap cedros-invite-code-table-wrap">
        <table className="cedros-data-table cedros-invite-code-table">
          <InviteCodeTableHead />
          <tbody>
            <tr>
              <td className="cedros-data-table__empty-cell" colSpan={8}>
                <div
                  className="cedros-data-empty-state cedros-data-empty-state--in-table cedros-invite-code-manager__empty"
                  role="status"
                >
                  <span className="cedros-data-empty-state__illustration" aria-hidden="true">
                    <TicketIcon />
                  </span>
                  <div>
                    <strong>{t.admin.settings.inviteEmptyTitle}</strong>
                    <p className="cedros-data-empty-state__copy">
                      {t.admin.settings.inviteEmptyDescription}
                    </p>
                    <button
                      type="button"
                      className="cedros-data-empty-state__action cedros-data-btn cedros-data-btn--primary"
                      onClick={onCreate}
                    >
                      {t.admin.settings.inviteAddCustomCode}
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="cedros-data-table-wrap cedros-invite-code-table-wrap">
      <table className="cedros-data-table cedros-invite-code-table">
        <InviteCodeTableHead />
        <tbody>
          {codes.map((inviteCode) => (
            <InviteCodeTableRow
              key={inviteCode.id}
              inviteCode={inviteCode}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InviteCodeTableHead() {
  const t = useI18n().t;
  return (
    <thead>
      <tr>
        <th>{t.admin.settings.inviteCodeColumn}</th>
        <th>{t.admin.settings.inviteStatusColumn}</th>
        <th>{t.admin.settings.inviteCurrentUsesColumn}</th>
        <th>{t.admin.settings.inviteMaxUsesColumn}</th>
        <th>{t.admin.settings.inviteDiscountColumn}</th>
        <th>{t.admin.settings.inviteStartsColumn}</th>
        <th>{t.admin.settings.inviteExpiresColumn}</th>
        <th className="cedros-invite-code-table__actions">
          {t.admin.settings.inviteActionsColumn}
        </th>
      </tr>
    </thead>
  );
}

function InviteCodeTableRow({
  inviteCode,
  onEdit,
  onDelete,
}: {
  inviteCode: InviteCode;
  onEdit: (inviteCode: InviteCode) => void;
  onDelete: (inviteCode: InviteCode) => void;
}) {
  const { t, dateTime, number, message } = useI18n();
  return (
    <tr className={inviteCode.active ? '' : 'is-disabled'}>
      <td>
        <code className="cedros-invite-code-table__code">{inviteCode.code}</code>
      </td>
      <td>
        <InviteCodeStatus active={inviteCode.active} />
      </td>
      <td>{number(inviteCode.usesCount)}</td>
      <td>
        {inviteCode.maxUses == null ? t.admin.settings.inviteUnlimited : number(inviteCode.maxUses)}
      </td>
      <td>
        {inviteCode.discountPercent == null
          ? t.admin.settings.inviteNoDiscount
          : inviteCode.discountPercent === 100
            ? t.admin.settings.inviteDiscountFree
            : message(t.admin.settings.inviteDiscountPercentOff, {
                percent: inviteCode.discountPercent,
              })}
        {inviteCode.discountPercent != null && (
          <small>
            {' '}
            ·{' '}
            {inviteCode.discountMonths == null
              ? t.admin.settings.inviteDiscountForever
              : message(
                  inviteCode.discountMonths === 1
                    ? t.admin.settings.inviteDiscountMonth
                    : t.admin.settings.inviteDiscountMonths,
                  {
                    months: inviteCode.discountMonths,
                  }
                )}
          </small>
        )}
      </td>
      <td>{formatDateCell(inviteCode.startsAt, t.admin.settings.inviteAnyTime, dateTime)}</td>
      <td>{formatDateCell(inviteCode.expiresAt, t.admin.settings.inviteNever, dateTime)}</td>
      <td>
        <InviteCodeRowActions inviteCode={inviteCode} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function InviteCodeStatus({ active }: { active: boolean }) {
  const t = useI18n().t;
  return (
    <span
      className={`cedros-data-pill cedros-invite-code-status ${active ? 'cedros-data-pill--success is-active' : 'is-inactive'}`}
    >
      {active ? t.admin.settings.inviteActive : t.admin.settings.inviteInactive}
    </span>
  );
}

function InviteCodeRowActions({
  inviteCode,
  onEdit,
  onDelete,
}: {
  inviteCode: InviteCode;
  onEdit: (inviteCode: InviteCode) => void;
  onDelete: (inviteCode: InviteCode) => void;
}) {
  const { t, message } = useI18n();
  const editLabel = message(t.admin.settings.inviteEditAction, { code: inviteCode.code });
  return (
    <div className="cedros-data-row-actions cedros-invite-code-table__action-row">
      <IconButton label={editLabel} onClick={() => onEdit(inviteCode)}>
        <EditIcon />
      </IconButton>
      <AdminActionMenu
        label={message(t.admin.settings.inviteRowActions, { code: inviteCode.code })}
        items={[
          {
            label: t.admin.settings.inviteDeleteAction,
            destructive: true,
            onSelect: () => onDelete(inviteCode),
          },
        ]}
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="cedros-data-row-actions__icon cedros-invite-code-icon-button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function formatDateCell(
  value: string | null | undefined,
  emptyLabel: string,
  dateTime: (value: Date | string | number) => string
): string {
  if (!value) return emptyLabel;
  return dateTime(value);
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 9a3 3 0 0 0 0 6v4h20v-4a3 3 0 0 0 0-6V5H2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}
