/**
 * useConfirmDialog — ergonomic, promise-based confirmation prompts.
 *
 * Returns an `await`-able `confirm()` plus the props for a single
 * {@link ConfirmDialog} instance the caller renders. No context/provider is
 * required, so it is safe inside standalone, externally-consumed components.
 *
 *   const { confirm, dialogProps } = useConfirmDialog();
 *   const handleDelete = async () => {
 *     if (!(await confirm({ title: 'Delete?', destructive: true }))) return;
 *     await doDelete();
 *   };
 *   return (<>{/* ... *\/}<ConfirmDialog {...dialogProps} /></>);
 */

import { useCallback, useRef, useState } from 'react';
import { useExternalEffect } from './effects';
import type { ConfirmDialogProps } from '../components/shared/ConfirmDialog';

export type ConfirmOptions = Pick<
  ConfirmDialogProps,
  'title' | 'description' | 'confirmLabel' | 'cancelLabel' | 'destructive'
>;

export interface UseConfirmDialogResult {
  /** Open the dialog; resolves true on confirm, false on cancel/dismiss. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Spread onto a single rendered <ConfirmDialog />. */
  dialogProps: ConfirmDialogProps;
}

const EMPTY_OPTIONS: ConfirmOptions = { title: '' };

export function useConfirmDialog(): UseConfirmDialogResult {
  const [state, setState] = useState<{ open: boolean; options: ConfirmOptions }>({
    open: false,
    options: EMPTY_OPTIONS,
  });
  // Resolver lives in a ref so StrictMode's double-invoked state updater can
  // never resolve the same promise twice.
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  useExternalEffect(
    () => () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
    },
    []
  );

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current?.(false); // resolve any superseded prompt as cancelled
        resolverRef.current = resolve;
        setState({ open: true, options });
      }),
    []
  );

  const settle = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState((prev) => ({ open: false, options: prev.options }));
  }, []);

  const dialogProps: ConfirmDialogProps = {
    open: state.open,
    title: state.options.title,
    description: state.options.description,
    confirmLabel: state.options.confirmLabel,
    cancelLabel: state.options.cancelLabel,
    destructive: state.options.destructive,
    onConfirm: useCallback(() => settle(true), [settle]),
    onCancel: useCallback(() => settle(false), [settle]),
  };

  return { confirm, dialogProps };
}
