import { useCallback, useId, useRef, useState, type FormEvent, type RefObject } from 'react';
import { useModalFocus } from '../../../hooks/useModalFocus';
import { ErrorMessage } from '../../shared/ErrorMessage';
import {
  buildCreateInviteCodeRequest,
  buildUpdateInviteCodeRequest,
  formatDiscountPercent,
  formatMaxUses,
  toDateTimeInput,
} from './inviteCodeFormUtils';
import type { CreateInviteCodeRequest, InviteCode, UpdateInviteCodeRequest } from '../../../types';
import { useI18n } from '../../../i18n';

export type InviteCodeModalState = { mode: 'create' } | { mode: 'edit'; inviteCode: InviteCode };

interface InviteCodeFormModalProps {
  modal: InviteCodeModalState;
  onClose: () => void;
  onCreate: (request: CreateInviteCodeRequest) => Promise<void>;
  onUpdate: (inviteCode: InviteCode, request: UpdateInviteCodeRequest) => Promise<void>;
}

export function InviteCodeFormModal({
  modal,
  onClose,
  onCreate,
  onUpdate,
}: InviteCodeFormModalProps) {
  const fieldId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const form = useInviteCodeForm({ modal, onClose, onCreate, onUpdate });

  useModalFocus(
    true,
    dialogRef,
    () => {
      if (!form.isSaving) onClose();
    },
    'input, select, textarea'
  );

  return <InviteCodeDialog fieldId={fieldId} form={form} onClose={onClose} dialogRef={dialogRef} />;
}

function useInviteCodeForm({ modal, onClose, onCreate, onUpdate }: InviteCodeFormModalProps) {
  const t = useI18n().t;
  const isEditing = modal.mode === 'edit';
  const inviteCode = isEditing ? modal.inviteCode : null;
  const [code, setCode] = useState(inviteCode?.code ?? '');
  const [maxUses, setMaxUses] = useState(formatMaxUses(inviteCode?.maxUses));
  const [startsAt, setStartsAt] = useState(toDateTimeInput(inviteCode?.startsAt));
  const [expiresAt, setExpiresAt] = useState(toDateTimeInput(inviteCode?.expiresAt));
  const [active, setActive] = useState(inviteCode?.active ?? true);
  const [discountPercent, setDiscountPercent] = useState(
    formatDiscountPercent(inviteCode?.discountPercent)
  );
  const [discountMonths, setDiscountMonths] = useState(formatMaxUses(inviteCode?.discountMonths));
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);
      setIsSaving(true);
      try {
        if (inviteCode) {
          await onUpdate(
            inviteCode,
            buildUpdateInviteCodeRequest(
              inviteCode,
              code,
              maxUses,
              startsAt,
              expiresAt,
              active,
              discountPercent,
              discountMonths
            )
          );
        } else {
          await onCreate(
            buildCreateInviteCodeRequest(
              code,
              maxUses,
              startsAt,
              expiresAt,
              discountPercent,
              discountMonths
            )
          );
        }
        onClose();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : t.admin.settings.inviteSaveFailed);
      } finally {
        setIsSaving(false);
      }
    },
    [
      active,
      code,
      discountPercent,
      discountMonths,
      expiresAt,
      inviteCode,
      maxUses,
      onClose,
      onCreate,
      onUpdate,
      startsAt,
      t,
    ]
  );

  return {
    active,
    code,
    discountPercent,
    discountMonths,
    setDiscountMonths,
    expiresAt,
    formError,
    isEditing,
    isSaving,
    maxUses,
    setActive,
    setCode,
    setDiscountPercent,
    setExpiresAt,
    setFormError,
    setMaxUses,
    setStartsAt,
    startsAt,
    submit,
  };
}

function InviteCodeDialog({
  fieldId,
  form,
  onClose,
  dialogRef,
}: {
  fieldId: string;
  form: ReturnType<typeof useInviteCodeForm>;
  onClose: () => void;
  dialogRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="cedros-data-dialog__overlay cedros-modal-backdrop" role="presentation">
      <div
        ref={dialogRef}
        className="cedros-data-dialog cedros-modal cedros-invite-code-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldId}-title`}
        aria-describedby={`${fieldId}-description`}
        tabIndex={-1}
      >
        <InviteCodeDialogHeader
          titleId={`${fieldId}-title`}
          descriptionId={`${fieldId}-description`}
          isEditing={form.isEditing}
          isSaving={form.isSaving}
          onClose={onClose}
        />
        <InviteCodeDialogForm fieldId={fieldId} form={form} onClose={onClose} />
      </div>
    </div>
  );
}

function InviteCodeDialogHeader({
  titleId,
  descriptionId,
  isEditing,
  isSaving,
  onClose,
}: {
  titleId: string;
  descriptionId: string;
  isEditing: boolean;
  isSaving: boolean;
  onClose: () => void;
}) {
  const t = useI18n().t;
  return (
    <div className="cedros-data-dialog__heading cedros-modal-header">
      <h2 id={titleId} className="cedros-data-dialog__title cedros-modal-title">
        {isEditing ? t.admin.settings.inviteEditTitle : t.admin.settings.inviteCreateTitle}
      </h2>
      <p id={descriptionId} className="cedros-data-dialog__description">
        {t.admin.settings.inviteDialogDescription}
      </p>
      <button
        type="button"
        className="cedros-data-dialog__close cedros-data-btn cedros-data-btn--ghost cedros-modal-close"
        aria-label={t.auth.close}
        title={t.auth.close}
        disabled={isSaving}
        onClick={onClose}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function InviteCodeDialogForm({
  fieldId,
  form,
  onClose,
}: {
  fieldId: string;
  form: ReturnType<typeof useInviteCodeForm>;
  onClose: () => void;
}) {
  return (
    <form
      className="cedros-data-dialog__body cedros-modal-content cedros-form-section"
      noValidate
      onSubmit={form.submit}
    >
      {form.formError && (
        <ErrorMessage error={form.formError} onDismiss={() => form.setFormError(null)} />
      )}
      <InviteCodeFormFields
        fieldId={fieldId}
        isEditing={form.isEditing}
        code={form.code}
        maxUses={form.maxUses}
        startsAt={form.startsAt}
        expiresAt={form.expiresAt}
        active={form.active}
        discountMonths={form.discountMonths}
        onDiscountMonthsChange={form.setDiscountMonths}
        discountPercent={form.discountPercent}
        onCodeChange={form.setCode}
        onMaxUsesChange={form.setMaxUses}
        onStartsAtChange={form.setStartsAt}
        onExpiresAtChange={form.setExpiresAt}
        onActiveChange={form.setActive}
        onDiscountPercentChange={form.setDiscountPercent}
      />
      <InviteCodeModalActions
        isEditing={form.isEditing}
        isSaving={form.isSaving}
        onCancel={onClose}
      />
    </form>
  );
}

interface InviteCodeFormFieldsProps {
  fieldId: string;
  isEditing: boolean;
  code: string;
  maxUses: string;
  startsAt: string;
  expiresAt: string;
  active: boolean;
  discountPercent: string;
  discountMonths: string;
  onDiscountMonthsChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onMaxUsesChange: (value: string) => void;
  onStartsAtChange: (value: string) => void;
  onExpiresAtChange: (value: string) => void;
  onActiveChange: (value: boolean) => void;
  onDiscountPercentChange: (value: string) => void;
}

function InviteCodeFormFields({
  fieldId,
  isEditing,
  code,
  maxUses,
  startsAt,
  expiresAt,
  active,
  discountPercent,
  discountMonths,
  onDiscountMonthsChange,
  onCodeChange,
  onMaxUsesChange,
  onStartsAtChange,
  onExpiresAtChange,
  onActiveChange,
  onDiscountPercentChange,
}: InviteCodeFormFieldsProps) {
  const t = useI18n().t;
  return (
    <>
      <TextField
        id={`${fieldId}-code`}
        label={
          isEditing ? t.admin.settings.inviteCodeLabel : t.admin.settings.inviteCustomCodeLabel
        }
        value={code}
        onChange={onCodeChange}
        placeholder={isEditing ? 'WELCOME' : t.admin.settings.inviteGeneratePlaceholder}
      />
      <TextField
        id={`${fieldId}-max-uses`}
        label={t.admin.settings.inviteMaxUsesLabel}
        type="number"
        min="1"
        value={maxUses}
        onChange={onMaxUsesChange}
        placeholder={t.admin.settings.inviteUnlimited}
      />
      <InviteCodeDateFields
        fieldId={fieldId}
        startsAt={startsAt}
        expiresAt={expiresAt}
        onStartsAtChange={onStartsAtChange}
        onExpiresAtChange={onExpiresAtChange}
      />
      <TextField
        id={`${fieldId}-discount-percent`}
        label={t.admin.settings.inviteDiscountLabel}
        type="number"
        min="1"
        max="100"
        value={discountPercent}
        onChange={onDiscountPercentChange}
        placeholder={t.admin.settings.inviteDiscountPlaceholder}
        help={t.admin.settings.inviteDiscountHelp}
      />
      {discountPercent.trim() && (
        <TextField
          id={`${fieldId}-discount-months`}
          label={t.admin.settings.inviteDiscountMonthsLabel}
          type="number"
          min="1"
          value={discountMonths}
          onChange={onDiscountMonthsChange}
          placeholder={t.admin.settings.inviteDiscountForever}
          help={t.admin.settings.inviteDiscountMonthsHelp}
        />
      )}
      <ActiveField isEditing={isEditing} active={active} onActiveChange={onActiveChange} />
    </>
  );
}

function InviteCodeDateFields({
  fieldId,
  startsAt,
  expiresAt,
  onStartsAtChange,
  onExpiresAtChange,
}: {
  fieldId: string;
  startsAt: string;
  expiresAt: string;
  onStartsAtChange: (value: string) => void;
  onExpiresAtChange: (value: string) => void;
}) {
  const t = useI18n().t;
  return (
    <>
      <TextField
        id={`${fieldId}-starts-at`}
        label={t.admin.settings.inviteStartsAtLabel}
        type="datetime-local"
        value={startsAt}
        onChange={onStartsAtChange}
      />
      <TextField
        id={`${fieldId}-expires-at`}
        label={t.admin.settings.inviteExpiresAtLabel}
        type="datetime-local"
        value={expiresAt}
        onChange={onExpiresAtChange}
      />
    </>
  );
}

function ActiveField({
  isEditing,
  active,
  onActiveChange,
}: {
  isEditing: boolean;
  active: boolean;
  onActiveChange: (value: boolean) => void;
}) {
  const t = useI18n().t;
  if (!isEditing) return null;

  return (
    <label className="cedros-data-checkbox-row cedros-checkbox-row">
      <input
        type="checkbox"
        checked={active}
        onChange={(event) => onActiveChange(event.target.checked)}
      />
      <span>{t.admin.settings.inviteActiveLabel}</span>
    </label>
  );
}

function InviteCodeModalActions({
  isEditing,
  isSaving,
  onCancel,
}: {
  isEditing: boolean;
  isSaving: boolean;
  onCancel: () => void;
}) {
  const t = useI18n().t;
  return (
    <div className="cedros-data-actions cedros-invite-code-modal__actions">
      <button
        type="button"
        className="cedros-data-btn cedros-data-btn--secondary cedros-button cedros-button-outline"
        disabled={isSaving}
        onClick={onCancel}
      >
        {t.common.cancel}
      </button>
      <button
        type="submit"
        className="cedros-data-btn cedros-data-btn--primary cedros-button cedros-button-primary"
        disabled={isSaving}
      >
        {isSaving
          ? t.admin.settings.saving
          : isEditing
            ? t.admin.settings.inviteSaveAction
            : t.admin.settings.inviteCreateAction}
      </button>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  min,
  max,
  help,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  help?: string;
}) {
  return (
    <div className="cedros-data-field cedros-form-group">
      <label className="cedros-data-label cedros-form-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        max={max}
        className="cedros-data-input cedros-form-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-describedby={help ? `${id}-help` : undefined}
      />
      {help && (
        <p id={`${id}-help`} className="cedros-form-hint">
          {help}
        </p>
      )}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
