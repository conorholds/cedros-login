import { useRef, type RefObject } from 'react';
import { useExternalEffect } from './effects';

const dialogs: HTMLElement[] = [];
let bodyOverflow = '';

function focusable(dialog: HTMLElement): HTMLElement[] {
  return Array.from(
    dialog.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]')
  ).filter((element) => {
    if (element.tabIndex < 0 || element.matches(':disabled, input[type="hidden"]')) return false;
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (node.hidden || node.inert || style.display === 'none' || style.visibility === 'hidden')
        return false;
    }
    return true;
  });
}

/** Shared by inline dialogs in both the standalone UI and the host's React-only loader. */
export function useModalFocus(
  open: boolean,
  dialogRef: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  initialFocusRef?: RefObject<HTMLElement | null> | string
) {
  const dismissRef = useRef(onDismiss);
  useExternalEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useExternalEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previousFocus = document.activeElement;
    if (dialogs.length === 0) {
      bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    dialogs.push(dialog);
    const isTop = () => dialogs[dialogs.length - 1] === dialog;
    const focusFirst = () => (focusable(dialog)[0] ?? dialog).focus();
    const initialControl =
      typeof initialFocusRef === 'string'
        ? focusable(dialog).find((element) => element.matches(initialFocusRef))
        : initialFocusRef?.current;
    (initialControl ?? dialog).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTop() || event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        dismissRef.current();
      } else if (event.key === 'Tab') {
        const controls = focusable(dialog);
        const index = controls.indexOf(document.activeElement as HTMLElement);
        if (
          controls.length === 0 ||
          index === -1 ||
          (event.shiftKey ? index === 0 : index === controls.length - 1)
        ) {
          event.preventDefault();
          (event.shiftKey ? (controls.at(-1) ?? dialog) : (controls[0] ?? dialog)).focus();
        }
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (isTop() && event.target instanceof Node && !dialog.contains(event.target)) focusFirst();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      const wasTop = isTop();
      dialogs.splice(dialogs.indexOf(dialog), 1);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
      if (dialogs.length === 0) document.body.style.overflow = bodyOverflow;
      if (wasTop && previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, [open, dialogRef, initialFocusRef]);
}
