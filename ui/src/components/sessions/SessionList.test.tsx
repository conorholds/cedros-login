import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import type { Session } from '../../types';
import { SessionList } from './SessionList';

const sessions: Session[] = [
  {
    id: 'session-1',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    isCurrent: true,
  },
  {
    id: 'session-2',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    isCurrent: false,
  },
];

describe('SessionList', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('confirms via dialog and unmounts cleanly after success', async () => {
    vi.useFakeTimers();
    const onRevokeAll = vi.fn(async () => undefined);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(<SessionList sessions={sessions} onRevokeAll={onRevokeAll} />);

    // Clicking the action opens the confirmation dialog (no native confirm).
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign out of all other sessions/i }));
    });

    const dialog = screen.getByRole('alertdialog');
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: /^sign out$/i }));
    });

    expect(onRevokeAll).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('All other sessions have been revoked.');
    expect(screen.getByRole('status')).toHaveFocus();

    unmount();
    vi.runAllTimers();

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('does not revoke when the dialog is cancelled', async () => {
    const onRevokeAll = vi.fn(async () => undefined);

    render(<SessionList sessions={sessions} onRevokeAll={onRevokeAll} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign out of all other sessions/i }));
    });

    const dialog = screen.getByRole('alertdialog');
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: /cancel/i }));
    });

    expect(onRevokeAll).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});

describe('session display and revoke failures', () => {
  it('keeps the current session visible first and lets users expand distinct sign-ins', () => {
    const repeatedSessions = Array.from({ length: 6 }, (_, index) => ({
      ...sessions[1],
      id: `other-${index}`,
      userAgent: 'Mozilla/5.0 (Macintosh) Chrome/130.0',
      ipAddress: '192.0.2.1',
    }));
    const input = [...repeatedSessions, sessions[0]];
    render(<SessionList sessions={input} onRevokeAll={vi.fn()} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Current session');
    expect(input[0].id).toBe('other-0');
    const expand = screen.getByRole('button', { name: 'Show all 7 sessions' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(expand).toHaveAttribute('aria-controls', screen.getByRole('list').id);
    fireEvent.click(expand);
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    expect(screen.getAllByText('Chrome on macOS')).toHaveLength(6);
    expect(expand).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Show fewer sessions' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('has no sign-out or expand action when only the current session exists', () => {
    render(<SessionList sessions={[sessions[0]]} onRevokeAll={vi.fn()} />);
    expect(screen.getByText('Current session')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not invent a current session when none is returned', () => {
    render(<SessionList sessions={[sessions[1]]} onRevokeAll={vi.fn()} />);
    expect(screen.queryByText('Current session')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out of all other sessions/i })).toBeEnabled();
  });

  it.each([
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1', 'Safari on iOS'],
    ['Mozilla/5.0 (Linux; Android 15) Chrome/130.0', 'Chrome on Android'],
  ])('identifies mobile sessions for %s', (userAgent, label) => {
    render(<SessionList sessions={[{ ...sessions[0], userAgent }]} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('shows a failed sign-out and allows retry without claiming success', async () => {
    const onRevokeAll = vi.fn().mockRejectedValueOnce(new Error('Network failure'));
    const { rerender } = render(<SessionList sessions={sessions} onRevokeAll={onRevokeAll} />);
    fireEvent.click(screen.getByRole('button', { name: /sign out of all other sessions/i }));
    await act(async () => {
      fireEvent.click(
        within(screen.getByRole('alertdialog')).getByRole('button', { name: /^sign out$/i })
      );
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Could not sign out');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /sign out of all other sessions/i })).toBeEnabled();

    rerender(
      <SessionList sessions={sessions} error="Server unavailable" onRevokeAll={onRevokeAll} />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Server unavailable');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('disables sign-out while refreshing sessions or revoking them', async () => {
    let finishRevoke: () => void = () => {};
    const onRevokeAll = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishRevoke = resolve;
        })
    );
    const { rerender } = render(
      <SessionList sessions={sessions} isLoading onRevokeAll={onRevokeAll} />
    );
    expect(screen.getByRole('button', { name: /sign out of all other sessions/i })).toBeDisabled();
    rerender(<SessionList sessions={sessions} onRevokeAll={onRevokeAll} />);
    fireEvent.click(screen.getByRole('button', { name: /sign out of all other sessions/i }));
    await act(async () => {
      fireEvent.click(
        within(screen.getByRole('alertdialog')).getByRole('button', { name: /^sign out$/i })
      );
    });
    expect(screen.getByRole('button', { name: /Signing out…/ })).toBeDisabled();
    await act(async () => {
      finishRevoke();
    });
    expect(onRevokeAll).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('All other sessions have been revoked.');
  });
});

describe('session refresh and dialog lifecycle', () => {
  it('offers retry after initial load failure and refresh for an empty list', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <SessionList sessions={[]} error="Server unavailable" onRefresh={onRefresh} />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Server unavailable');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Refresh sessions' }));
    });
    expect(onRefresh).toHaveBeenCalledTimes(1);
    rerender(<SessionList sessions={[]} onRefresh={onRefresh} />);
    expect(screen.getByText('No active sessions found.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh sessions' })).toBeEnabled();
  });

  it('reports a rejected refresh callback', async () => {
    render(
      <SessionList
        sessions={sessions}
        onRefresh={vi.fn().mockRejectedValue(new Error('offline'))}
      />
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Refresh sessions' }));
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Could not refresh sessions');
  });

  it('does not sign out when the component unmounts during confirmation', async () => {
    const onRevokeAll = vi.fn();
    const { unmount } = render(<SessionList sessions={sessions} onRevokeAll={onRevokeAll} />);
    fireEvent.click(screen.getByRole('button', { name: /sign out of all other sessions/i }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await act(async () => unmount());
    expect(onRevokeAll).not.toHaveBeenCalled();
  });

  it('does not announce success or create timers after unmounting a pending sign-out', async () => {
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const { unmount } = render(<SessionList sessions={sessions} onRevokeAll={() => pending} />);
    fireEvent.click(screen.getByRole('button', { name: /sign out of all other sessions/i }));
    await act(async () => {
      fireEvent.click(
        within(screen.getByRole('alertdialog')).getByRole('button', { name: /^sign out$/i })
      );
    });
    unmount();
    const timer = vi.spyOn(window, 'setTimeout');
    await act(async () => finish());
    expect(timer).not.toHaveBeenCalled();
    timer.mockRestore();
  });

  it.each([
    ['Mozilla/5.0 (iPhone) CriOS/130.0 Mobile Safari/604.1', 'Chrome on iOS'],
    ['Mozilla/5.0 (iPhone) FxiOS/130.0 Mobile Safari/604.1', 'Firefox on iOS'],
    ['Mozilla/5.0 (Android) Chrome/130.0 EdgA/130.0', 'Edge on Android'],
    ['Mozilla/5.0 (Macintosh) Chrome/130.0 OPR/110.0', 'Opera on macOS'],
  ])('recognizes %s', (userAgent, label) => {
    render(<SessionList sessions={[{ ...sessions[0], userAgent }]} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

it('keeps a pending confirmation cancellable if a refresh empties the list', async () => {
  const onRevokeAll = vi.fn();
  const { rerender } = render(<SessionList sessions={sessions} onRevokeAll={onRevokeAll} />);
  fireEvent.click(screen.getByRole('button', { name: /sign out of all other sessions/i }));
  rerender(<SessionList sessions={[]} onRevokeAll={onRevokeAll} />);
  expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  });
  expect(onRevokeAll).not.toHaveBeenCalled();
});
