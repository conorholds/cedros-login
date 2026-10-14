import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InviteForm } from './InviteForm';

describe('InviteForm', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('clears success timer on unmount', async () => {
    vi.useFakeTimers();
    const onSubmit = vi.fn(async () => undefined);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(<InviteForm onSubmit={onSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /send invite/i }));
    });
    unmount();

    vi.runAllTimers();

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('rejects invalid email formats', async () => {
    const onSubmit = vi.fn(async () => undefined);

    render(<InviteForm onSubmit={onSubmit} />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'a@b.c' },
      });
      fireEvent.click(screen.getByRole('button', { name: /send invite/i }));
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
  });
});
