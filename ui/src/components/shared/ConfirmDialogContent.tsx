import type { ReactNode, RefObject } from 'react';

interface ConfirmDialogContentProps {
  cancelLabel: string;
  cancelRef: RefObject<HTMLButtonElement | null>;
  closeLabel: string;
  confirmLabel: string;
  confirmRef: RefObject<HTMLButtonElement | null>;
  description?: ReactNode;
  descriptionId: string;
  destructive: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  titleId: string;
  usesAdminContract: boolean;
}

interface ConfirmDialogFrameProps extends Omit<ConfirmDialogContentProps, 'usesAdminContract'> {
  className: string;
  dialogRef: RefObject<HTMLDivElement | null>;
}

export function ConfirmDialogFrame({
  cancelLabel,
  cancelRef,
  className,
  closeLabel,
  confirmLabel,
  confirmRef,
  description,
  descriptionId,
  destructive,
  dialogRef,
  onCancel,
  onConfirm,
  title,
  titleId,
}: ConfirmDialogFrameProps) {
  const usesAdminContract = className.split(/\s+/).includes('cedros-data-dialog');
  return (
    <div
      className={`${usesAdminContract ? 'cedros-data-dialog__overlay ' : ''}cedros-modal-backdrop`}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className={`cedros-confirm-dialog ${className}`.trim()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <ConfirmDialogContent
          cancelLabel={cancelLabel}
          cancelRef={cancelRef}
          closeLabel={closeLabel}
          confirmLabel={confirmLabel}
          confirmRef={confirmRef}
          description={description}
          descriptionId={descriptionId}
          destructive={destructive}
          onCancel={onCancel}
          onConfirm={onConfirm}
          title={title}
          titleId={titleId}
          usesAdminContract={usesAdminContract}
        />
      </div>
    </div>
  );
}

function ConfirmDialogContent(props: ConfirmDialogContentProps) {
  if (!props.usesAdminContract) {
    return (
      <>
        <h2 id={props.titleId} className="cedros-confirm-dialog__title">
          {props.title}
        </h2>
        {props.description && (
          <p id={props.descriptionId} className="cedros-confirm-dialog__description">
            {props.description}
          </p>
        )}
        <DialogActions {...props} />
      </>
    );
  }

  return (
    <>
      <div className="cedros-data-dialog__heading">
        <button
          type="button"
          className="cedros-data-dialog__close cedros-data-btn cedros-data-btn--ghost cedros-data-btn--sm"
          aria-label={props.closeLabel}
          title={props.closeLabel}
          onClick={props.onCancel}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <h2 id={props.titleId} className="cedros-data-dialog__title cedros-confirm-dialog__title">
          {props.title}
        </h2>
        {props.description && (
          <p
            id={props.descriptionId}
            className="cedros-data-dialog__description cedros-confirm-dialog__description"
          >
            {props.description}
          </p>
        )}
      </div>
      <div className="cedros-data-dialog__body">
        <DialogActions {...props} />
      </div>
    </>
  );
}

function DialogActions({
  cancelLabel,
  cancelRef,
  confirmLabel,
  confirmRef,
  destructive,
  onCancel,
  onConfirm,
  usesAdminContract,
}: ConfirmDialogContentProps) {
  const hostClasses = usesAdminContract ? 'cedros-data-actions ' : '';
  const cancelHostClasses = usesAdminContract ? 'cedros-data-btn cedros-data-btn--secondary ' : '';
  const confirmHostClasses = usesAdminContract
    ? `cedros-data-btn ${destructive ? 'cedros-data-btn--danger' : 'cedros-data-btn--primary'} `
    : '';

  return (
    <div className={`${hostClasses}cedros-confirm-dialog__actions`}>
      <button
        ref={cancelRef}
        type="button"
        className={`${cancelHostClasses}cedros-button cedros-button-outline cedros-button-md`}
        onClick={onCancel}
      >
        {cancelLabel}
      </button>
      <button
        ref={confirmRef}
        type="button"
        className={`${confirmHostClasses}cedros-button cedros-button-md ${destructive ? 'cedros-button-danger' : 'cedros-button-primary'}`}
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
