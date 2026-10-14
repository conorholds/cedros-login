/**
 * ConfirmDialog — accessible confirmation dialog (Shadcn AlertDialog style).
 *
 * Replaces native `window.confirm()` for destructive/irreversible actions with a
 * styled, themeable, accessible dialog: `role="alertdialog"`, `aria-modal`,
 * labelled + described by its title/body, focus trap, Escape and backdrop click
 * both cancel, and focus restoration on close. For destructive actions the
 * Cancel button receives initial focus so Enter never triggers the dangerous
 * path by accident.
 *
 * Must stay free of `react-dom` imports: this component ships in the extension
 * web/admin runtime, and the cedros-data archive loader resolves only the
 * host-shimmed React modules (`react`, `react/jsx-runtime`).
 *
 * Pair with {@link useConfirmDialog} for an ergonomic `await confirm(...)` API:
 *   const { confirm, dialogProps } = useConfirmDialog();
 *   // ...
 *   if (await confirm({ title, description, destructive: true })) doIt();
 *   // ...render once:
 *   <ConfirmDialog {...dialogProps} />
 */

import { useId, useRef, type ReactNode } from 'react';
import { useModalFocus } from '../../hooks/useModalFocus';
import { useTranslations } from '../../i18n';
import { ConfirmDialogFrame } from './ConfirmDialogContent';

export interface ConfirmDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Short, imperative heading (e.g. "Delete account"). */
  title: string;
  /** Body copy explaining the consequence. */
  description?: ReactNode;
  /** Confirm button label. Defaults to the localized "Confirm". */
  confirmLabel?: string;
  /** Cancel button label. Defaults to the localized "Cancel". */
  cancelLabel?: string;
  /** Style the confirm action as destructive and focus Cancel initially. */
  destructive?: boolean;
  /** Called when the user confirms. */
  onConfirm: () => void;
  /** Called on cancel, Escape, or backdrop click. */
  onCancel: () => void;
  className?: string;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
  className = '',
}: ConfirmDialogProps) {
  const t = useTranslations();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;
  useModalFocus(open, dialogRef, onCancel, destructive ? cancelRef : confirmRef);

  // Rendered inline (no react-dom createPortal): the cedros-data extension
  // runtime loader only shims `react`/`react/jsx-runtime`, so a bare
  // `react-dom` import makes the whole chunk graph fail to load in the host.
  // The fixed-position backdrop overlays the viewport from anywhere, matching
  // LoginModal/OrgSwitcher. Closed + SSR render null.
  if (!open || typeof document === 'undefined') return null;

  return (
    <ConfirmDialogFrame
      cancelLabel={cancelLabel ?? t.common.cancel}
      cancelRef={cancelRef}
      className={className}
      closeLabel={t.auth.close}
      confirmLabel={confirmLabel ?? t.common.confirm}
      confirmRef={confirmRef}
      description={description}
      descriptionId={descId}
      destructive={destructive}
      dialogRef={dialogRef}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={title}
      titleId={titleId}
    />
  );
}
