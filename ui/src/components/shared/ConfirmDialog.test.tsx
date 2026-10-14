import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, within, cleanup } from '@testing-library/react';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { ConfirmDialog } from './ConfirmDialog';

function Harness({ onResult }: { onResult: (value: boolean) => void }) {
  const { confirm, dialogProps } = useConfirmDialog();
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          onResult(
            await confirm({
              title: 'Delete this thing?',
              description: 'This cannot be undone.',
              confirmLabel: 'Delete',
              destructive: true,
            })
          );
        }}
      >
        open
      </button>
      <ConfirmDialog {...dialogProps} />
    </>
  );
}

describe('ConfirmDialog + useConfirmDialog', () => {
  afterEach(() => cleanup());

  it('renders nothing until confirm() is called', () => {
    render(<Harness onResult={() => {}} />);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('exposes an accessible alertdialog and resolves true on confirm', async () => {
    const onResult = vi.fn();
    render(<Harness onResult={onResult} />);

    await act(async () => {
      fireEvent.click(screen.getByText('open'));
    });

    const dialog = screen.getByRole('alertdialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();

    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }));
    });

    expect(onResult).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('resolves false on cancel', async () => {
    const onResult = vi.fn();
    render(<Harness onResult={onResult} />);

    await act(async () => {
      fireEvent.click(screen.getByText('open'));
    });
    await act(async () => {
      fireEvent.click(
        within(screen.getByRole('alertdialog')).getByRole('button', { name: /cancel/i })
      );
    });

    expect(onResult).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('resolves false on Escape', async () => {
    const onResult = vi.fn();
    render(<Harness onResult={onResult} />);

    await act(async () => {
      fireEvent.click(screen.getByText('open'));
    });
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(onResult).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});

it('cancels an outstanding confirmation when its owner unmounts', async () => {
  const onResult = vi.fn();
  const { unmount } = render(<Harness onResult={onResult} />);
  fireEvent.click(screen.getByRole('button', { name: 'open' }));
  await act(async () => unmount());
  expect(onResult).toHaveBeenCalledExactlyOnceWith(false);
});
