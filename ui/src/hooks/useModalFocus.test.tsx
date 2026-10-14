import { useRef, useState } from 'react';
import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useModalFocus } from './useModalFocus';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';

function Harness() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  useModalFocus(open, dialog, () => setOpen(false));
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <div ref={dialog} role="dialog" aria-label="Parent" tabIndex={-1}>
          <button disabled>Disabled first</button>
          <button onClick={() => setConfirm(true)}>Confirm action</button>
          <button hidden>Hidden last</button>
          <button tabIndex={-1}>Programmatic only</button>
          <ConfirmDialog
            open={confirm}
            title="Delete?"
            destructive
            onConfirm={() => setConfirm(false)}
            onCancel={() => setConfirm(false)}
          />
        </div>
      )}
    </>
  );
}

describe('shared modal focus', () => {
  it('traps initial Shift+Tab, skips disabled/hidden controls and restores focus', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Confirm action' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Confirm action' })).toHaveFocus();
    fireEvent.focusIn(trigger);
    expect(screen.getByRole('button', { name: 'Confirm action' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  it('dismisses only the top dialog and keeps scrolling locked until all close', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'auto';
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Confirm action' }));
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByRole('button', { name: 'Confirm action' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow = '';
  });
});
